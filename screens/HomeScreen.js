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
  const [initialCountdownTime, setInitialCountdownTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
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
      const lastElapsedTime = elapsedTime;
      const elapsedTimeDiff = newElapsedTime - lastElapsedTime;
      const gainedCoins = Math.floor(elapsedTimeDiff / 120);

      console.log("Gained Coins:", gainedCoins);

      try {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        const currentCoins = userData.coins || 0;

        await firestore.collection('users').doc(user.uid).set(
          { elapsedTime: newElapsedTime, coins: currentCoins + gainedCoins },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
    }
  };

  const handleLogout = async () => {
    await updateElapsedTimeInFirestore(elapsedTime);
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
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  };

  const handleSetTime = (value) => {
    const timeInSeconds = value * 60;
    setCountdownTime(timeInSeconds);
    setInitialCountdownTime(timeInSeconds);
  };

  useEffect(() => {
    if (countdownTime === 0 && timerActive) {
      const newElapsedTime = elapsedTime + initialCountdownTime;
      updateElapsedTimeInFirestore(newElapsedTime);
      setElapsedTime(newElapsedTime);
      setTimerActive(false);

      Alert.alert(
        "Timer Finished",
        "Your countdown timer has reached zero!",
        [
          { text: "OK" }
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
  slider: {
    width: '80%',
    height: 40,
  },
});
