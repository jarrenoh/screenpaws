import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions, TouchableOpacity } from 'react-native';
import { firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';
import { useNavigation, useRoute } from '@react-navigation/native';
import images from '../components/images';

const FriendPetScreen = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [equippedItem, setEquippedItem] = useState(null);
  const [username, setUsername] = useState('');

  const navigation = useNavigation();
  const route = useRoute();
  const { friendId } = route.params;

  useEffect(() => {
    const fetchFriendData = async () => {
      if (friendId) {
        const friendDocRef = firestore.collection('users').doc(friendId);
        const friendDoc = await friendDocRef.get();
        if (friendDoc.exists) {
          const friendData = friendDoc.data();
          const friendElapsedTime = friendData.elapsedTime || 0;
          setElapsedTime(friendElapsedTime);
          const friendXp = friendData.xp || Math.floor(friendElapsedTime / 60); // 1 XP per minute
          setXp(friendXp);
          const friendLevel = friendData.level || Math.floor(friendXp / 10) + 1; // 10 XP per level
          setLevel(friendLevel);
          const friendEquippedItem = friendData.equippedItem || null;
          setEquippedItem(friendEquippedItem);
          const friendUsername = friendData.username || 'Unknown User';
          setUsername(friendUsername);
        }
      }
    };

    fetchFriendData();
  }, [friendId]);

  const calculateXpPercentage = () => {
    const currentLevelXp = (level - 1) * 10;
    const nextLevelXp = level * 10;
    const levelXpRange = nextLevelXp - currentLevelXp;
    const xpIntoLevel = xp - currentLevelXp;
    const xpPercentage = (xpIntoLevel / levelXpRange) * 100;
    return isNaN(xpPercentage) ? 0 : xpPercentage;
  };

  const xpBarContainerWidth = Dimensions.get('window').width * 0.8; // 80% of window width
  const xpBarWidth = xpBarContainerWidth * (calculateXpPercentage() / 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{username}'s Pet</Text>
      </View>
      <View style={styles.content}>
        {equippedItem && <Image source={images[equippedItem.imageName]} style={styles.backgroundImage} />}
        <Image source={level === 1 ? images.dog : level >= 5 ? images.swoledoge : images.placeholderImage} style={styles.image} />
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

export default FriendPetScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    header: {
      width: '100%',
      padding: 16,
      position: 'absolute',
      top: Dimensions.get('window').height * 0.1,
      alignItems: 'center',
      zIndex: 1,
    },
    headerText: {
      fontSize: 45,
      fontWeight: 'bold',
    },
    headerButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      width: '100%',
      padding: 16,
      position: 'absolute',
      top: Dimensions.get('window').height * 0.25, 
      right: 0,
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
  
