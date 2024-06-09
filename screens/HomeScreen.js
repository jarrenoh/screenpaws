import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, TextInput, AppState } from 'react-native';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/core';
import pawLogo from '../assets/69-698991_footprints-clipart-cougar-transparent-background-dog-paw-clipart.png';
import CustomNavbar from '../components/CustomNavbar';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [timeInput, setTimeInput] = useState('');
  const [countdownTime, setCountdownTime] = useState(0);
  const [initialCountdownTime, setInitialCountdownTime] = useState(0); // New state to track the initial countdown time
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchElapsedTime = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setElapsedTime(userData.elapsedTime || 0);
        }
      }
    };

    fetchElapsedTime();
  }, []);

  useEffect(() => {
    if (timerActive && countdownTime > 0) {
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        setStartTime(currentTime); // Reset the start time for the next interval
        setCountdownTime(prevTime => prevTime - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [timerActive, countdownTime]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (timerActive) {
          setTimerActive(false);
          clearInterval(intervalRef.current);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [timerActive]);

  const updateElapsedTimeInFirestore = async (newElapsedTime) => {
    const user = auth.currentUser;
    if (user) {
      const newXp = Math.floor(newElapsedTime / 60); // 1 XP per minute
      const newLevel = Math.floor(newXp / 10) + 1; // 10 XP per level
      try {
        await firestore.collection('users').doc(user.uid).set(
          { elapsedTime: newElapsedTime, xp: newXp, level: newLevel },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
    }
  };

  const handleLogout = async () => {
    await updateElapsedTimeInFirestore(elapsedTime); // Save elapsed time before logout
    auth.signOut()
      .then(() => {
        console.log('Logged out');
        navigation.replace('Login');
      })
      .catch(error => alert(error.message));
  };

  const handleToggleTimer = () => {
    if (!timerActive && countdownTime <= 0) {
      alert('Please set a valid countdown time');
      return;
    }
    if (!timerActive) {
      setStartTime(Date.now());
    }
    setTimerActive(prevState => !prevState);
  };

  const handleResetTimer = () => {
    setCountdownTime(0);
    setTimerActive(false);
  };

  const handleSetTime = () => {
    const timeInSeconds = parseInt(timeInput) * 60;
    if (isNaN(timeInSeconds) || timeInSeconds <= 0 || timeInSeconds > 7200) {
      alert('Please enter a valid time in minutes (1-120)');
      return;
    }
    setCountdownTime(timeInSeconds);
    setInitialCountdownTime(timeInSeconds); // Set the initial countdown time
    setTimeInput('');
  };

  useEffect(() => {
    if (countdownTime === 0 && timerActive) {
      // Only update elapsed time if the timer was active and reached zero
      const newElapsedTime = elapsedTime + initialCountdownTime;
      updateElapsedTimeInFirestore(newElapsedTime);
      setElapsedTime(newElapsedTime);
      setTimerActive(false);
    }
  }, [countdownTime, timerActive]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getNameFromEmail = (email) => {
    return email ? email.split('@')[0] : '';
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Image source={pawLogo} style={[styles.image, styles.imageMargin]} />
        <Text>Welcome {auth.currentUser?.displayName}!</Text>
        <Text style={styles.timer}>Focused Time: {formatTime(elapsedTime)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter time in minutes"
          keyboardType="numeric"
          value={timeInput}
          onChangeText={setTimeInput}
        />
        <TouchableOpacity onPress={handleSetTime} style={[styles.button, styles.setButton]}>
          <Text style={styles.buttonText}>Set Time</Text>
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(countdownTime)}</Text>
        <TouchableOpacity
          onPress={handleToggleTimer}
          style={[styles.button, timerActive ? styles.stopButton : styles.startButton]}
        >
          <Text style={styles.buttonText}>{timerActive ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleResetTimer}
          style={[styles.button, styles.resetButton]}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <CustomNavbar />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    width: '60%',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  startButton: {
    backgroundColor: 'green',
  },
  stopButton: {
    backgroundColor: 'red',
  },
  resetButton: {
    backgroundColor: 'gray',
  },
  setButton: {
    backgroundColor: 'orange',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 32,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  imageMargin: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 20,
    width: '60%',
    borderRadius: 10,
    textAlign: 'center',
  },
});
