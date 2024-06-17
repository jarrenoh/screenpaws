import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, AppState } from 'react-native';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/core';

import CustomNavbar from '../components/CustomNavbar';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Slider from '@react-native-community/slider';

const HomeScreen = () => {
  const navigation = useNavigation();
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
      const newCoins = Math.floor(newElapsedTime / 120); // 1 coin per 2 minutes

      try {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        const currentCoins = userData.coins || 0;

        await firestore.collection('users').doc(user.uid).set(
          { elapsedTime: newElapsedTime, xp: newXp, level: newLevel, coins: currentCoins + newCoins },
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

  const handleSetTime = (value) => {
    const timeInSeconds = value * 60;
    setCountdownTime(timeInSeconds);
    setInitialCountdownTime(timeInSeconds); // Set the initial countdown time
  };

  useEffect(() => {
    if (countdownTime === 0 && timerActive) {
      // Only update elapsed time if the timer was active and reached zero
      const newElapsedTime = elapsedTime + initialCountdownTime;
      updateElapsedTimeInFirestore(newElapsedTime);
      setElapsedTime(newElapsedTime);
      setTimerActive(false);

      Alert.alert(
        "Timer Finished",
        "Your countdown timer has reached zero!",
        [
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
      );
    }
  }, [countdownTime, timerActive]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome {auth.currentUser?.displayName}!</Text>
        <Text style={styles.timer}>Focused Time: {formatTime(elapsedTime)}</Text>

        <AnimatedCircularProgress
          size={200}
          width={10}
          fill={(countdownTime / initialCountdownTime) * 100}
          tintColor="#00e0ff"
          backgroundColor="#3d5875"
        >
          {
            () => (
              <Text style={styles.timer}>{formatTime(countdownTime)}</Text>
            )
          }
        </AnimatedCircularProgress>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={120}
          step={5}
          value={countdownTime / 60}
          onValueChange={handleSetTime}
          minimumTrackTintColor="#1fb28a"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#b9e4c9"
        />
        <TouchableOpacity
          onPress={handleToggleTimer}
          style={[styles.button, timerActive ? styles.stopButton : styles.startButton]}
        >
          <Text style={styles.buttonText}>{timerActive ? 'Stop' : 'Start'}</Text>
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
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
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
  slider: {
    width: '80%',
    height: 40,
  },
});
