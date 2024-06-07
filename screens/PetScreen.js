import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';
import dog from '../assets/dog.png';
import placeholderImage from '../assets/dog.jpeg';
import swoledoge from '../assets/swole.webp';

const PetScreen = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const userElapsedTime = userData.elapsedTime || 0;
          setElapsedTime(userElapsedTime);
          const userXp = userData.xp || Math.floor(userElapsedTime / 60); // 1 XP per minute
          setXp(userXp);
          const userLevel = userData.level || Math.floor(userXp / 10) + 1; // 10 XP per level
          setLevel(userLevel);
        }
      }
    };

    fetchUserData();
  }, []);

  const calculateXpPercentage = () => {
    const currentLevelXp = (level - 1) * 10;
    const nextLevelXp = level * 10;
    const levelXpRange = nextLevelXp - currentLevelXp;
    const xpIntoLevel = xp - currentLevelXp;
    const xpPercentage = (xpIntoLevel / levelXpRange) * 100;
    return isNaN(xpPercentage) ? 0 : xpPercentage;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
      <Image source={level === 1 ? dog : level >= 5 ? swoledoge : placeholderImage} style={styles.image} />
        <Text style={styles.text}>
          {level === 1 ? 'Hungry Dog' : level >= 2 && level <= 5 ? 'Weak Doge' : 'Swole Doge'}
        </Text>
        <Text style={styles.text}>XP: {xp}</Text>
        <Text style={styles.text}>Level: {level}</Text>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { width: `${calculateXpPercentage()}%` }]} />
        </View>
      </View>
      <View style={styles.navbarContainer}>
        <CustomNavbar />
      </View>
    </View>
  );
};

export default PetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain'
  },
  text: {
    fontSize: 24,
    marginTop: 10,
    fontWeight: 'bold'
  },
  xpBarContainer: {
    width: '80%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden'
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#76c7c0'
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
});

