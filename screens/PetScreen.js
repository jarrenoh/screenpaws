import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { auth, firestore } from '../firebase'; // Import Firebase configuration
import CustomNavbar from '../components/CustomNavbar';
import placeholderImage from '../assets/dog.png'; // Make sure to replace this with the path to your image

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
          const userXp = Math.floor(userElapsedTime / 60); // 1 XP per minute
          setXp(userXp);
          setLevel(Math.floor(userXp / 10) + 1); // 10 XP per level
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={placeholderImage}
          style={styles.image}
        />
        <Text style={styles.text}>XP: {xp}</Text>
        <Text style={styles.text}>Level: {level}</Text>
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
    width: 200, // Adjust the width as needed
    height: 200, // Adjust the height as needed
    resizeMode: 'contain', // Adjust the resize mode as needed
  },
  text: {
    fontSize: 24,
    marginTop: 10,
    fontWeight: 'bold'
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
});
