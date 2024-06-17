import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';
import dog from '../assets/dog.png';
import placeholderImage from '../assets/dog.jpeg';
import swoledoge from '../assets/swole.webp';
import achievement from '../assets/achievement.png';
import bag from '../assets/bag.png';
import { useNavigation } from '@react-navigation/native';


const PetScreen = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [coins, setCoins] = useState(0);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = firestore.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const userElapsedTime = userData.elapsedTime || 0;
          setElapsedTime(userElapsedTime);
          const userXp = userData.xp || Math.floor(userElapsedTime / 60); // 1 XP per minute
          setXp(userXp);
          const userLevel = userData.level || Math.floor(userXp / 10) + 1; // 10 XP per level
          setLevel(userLevel);

          const userCoins = userData.coins || Math.floor(userElapsedTime / 120); // 1 coin per 2 minutes
          setCoins(userCoins);

          await userDocRef.update({
            coins: userCoins,
          });
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
      <TouchableOpacity onPress={() => navigation.navigate('Achievements')} style={styles.achievementButton}>
        <Image source={achievement} style={styles.achievementIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Inventory')} style={styles.inventoryButton}>
        <Image source={bag} style={styles.inventoryIcon} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Image source={level === 1 ? dog : level >= 5 ? swoledoge : placeholderImage} style={styles.image} />
        <Text style={styles.text}>
          {level === 1 ? 'Hungry Dog' : level >= 2 && level <= 5 ? 'Weak Doge' : 'Swole Doge'}
        </Text>
        <Text style={styles.text}>XP: {xp}</Text>
        <Text style={styles.text}>Level: {level}</Text>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { flex: calculateXpPercentage() / 100 }]} />
          <View style={{ flex: 1 - calculateXpPercentage() / 100 }} />
          <Text style={styles.xpText}>Progress: {calculateXpPercentage().toFixed(0)}%</Text>
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
    justifyContent: 'center',
    paddingTop: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 24,
    marginTop: 10,
    fontWeight: 'bold',
  },
  xpBarContainer: {
    flexDirection: 'row',
    width: '80%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#76c7c0',
  },
  xpText: {
    position: 'absolute',
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  achievementButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 40,
    height: 50,
  },
  achievementIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  inventoryButton: {
    position: 'absolute',
    top: 60,
    left: 30,
    width: 40,
    height: 50,
  },
  inventoryIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
