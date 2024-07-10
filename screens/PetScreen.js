import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';
import { useNavigation } from '@react-navigation/native';
import images from '../components/images';

const PetScreen = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [equippedItem, setEquippedItem] = useState(null);
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
          const userEquippedItem = userData.equippedItem || null;
          setEquippedItem(userEquippedItem);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const newXp = Math.floor(elapsedTime / 60); // 1 XP per minute
    setXp(newXp);
    const newLevel = Math.floor(newXp / 10) + 1; // 10 XP per level
    setLevel(newLevel);
  }, [elapsedTime]);

  useEffect(() => {
    const updateUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = firestore.collection('users').doc(user.uid);
        await userDocRef.update({
          xp: xp,
          level: level
        });
      }
    };

    updateUserData();
  }, [xp, level]);

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
        {equippedItem && <Image source={images[equippedItem.imageName]} style={styles.backgroundImage} />}
        <Image source={level === 1 ? images.hungrydog : level >= 5 ? images.swoledoge : images.shiba} style={styles.image} />
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
      <View style={styles.headerButtons}>
        <TouchableOpacity onPress={() => navigation.navigate('Achievements')} style={styles.achievementButton}>
          <Image source={images.achievement} style={styles.achievementIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Inventory')} style={styles.inventoryButton}>
          <Image source={images.inventory} style={styles.inventoryIcon} />
        </TouchableOpacity>
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
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    padding: 16,
    position: 'absolute',
    top: 60,
    right: 0,
    zIndex: 1,
  },
  achievementButton: {
    marginRight: 16,
    zIndex: 1,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    zIndex: 1,
  },
  inventoryButton: {
    marginRight: 16,
    zIndex: 1,
  },
  inventoryIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    zIndex: 0,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    zIndex: 1,
  },
  text: {
    fontSize: 24,
    marginTop: 10,
    fontWeight: 'bold'
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
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
