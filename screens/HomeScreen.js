import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/core';
import pawLogo from '../assets/69-698991_footprints-clipart-cougar-transparent-background-dog-paw-clipart.png';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [timeInput, setTimeInput] = useState('');
  const [countdownTime, setCountdownTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

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
    let interval;
    if (timerActive && countdownTime > 0) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const newElapsedTime = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(newElapsedTime);
        setCountdownTime(prevTime => prevTime - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerActive, countdownTime]);

  const updateElapsedTimeInFirestore = async (newElapsedTime) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await firestore.collection('users').doc(user.uid).set(
          { elapsedTime: newElapsedTime },
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
      setStartTime(Date.now() - elapsedTime * 1000);
    }
    setTimerActive(prevState => !prevState);
  };

  const handleResetTimer = () => {
    setCountdownTime(0);
    setTimerActive(false);
    updateElapsedTimeInFirestore(elapsedTime); // Save elapsed time when resetting
  };

  const handleSetTime = () => {
    const timeInSeconds = parseInt(timeInput) * 60;
    if (isNaN(timeInSeconds) || timeInSeconds <= 0 || timeInSeconds > 7200) {
      alert('Please enter a valid time in minutes (1-120)');
      return;
    }
    setCountdownTime(timeInSeconds);
    setTimeInput('');
  };

  useEffect(() => {
    if (!timerActive) {
      updateElapsedTimeInFirestore(elapsedTime);
    }
  }, [timerActive, elapsedTime]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Image source={pawLogo} style={styles.image} />
      <Text>Email: {auth.currentUser?.email}</Text>
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
      <Text style={styles.timer}>Elapsed Time: {formatTime(elapsedTime)}</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
    fontWeight: 'bold'
  },
  timer: {
    fontSize: 32,
    marginTop: 20,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
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
  }
});
