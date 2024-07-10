import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, Dimensions, Image } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';
import { addAchievement, addUserAchievement } from '../components/achFunctions';

import images from '../components/images';

const AchievementScreen = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);

  useEffect(() => {
    const fetchAchievements = async () => {
      const achievementsSnapshot = await firestore.collection('achievements').get();
      const allAchievements = achievementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAchievements(allAchievements);
    };

    const fetchUserAchievements = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserAchievements(userData.achievements || []);
        }
      }
    };

    const fetchData = async () => {
      await fetchAchievements();
      await fetchUserAchievements();
      setIsFetching(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkAndAddAchievement = async () => {
      if (hasCheckedAchievements) return;

      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await firestore.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      const userLevel = userData.level || 1;

      const addAchievementIfNotExist = async (achievementName, achievementDescription, thresholdLevel, icon) => {
        const achievementsSnapshot = await firestore.collection('achievements')
          .where('name', '==', achievementName)
          .get();

        if (achievementsSnapshot.empty) {
          const newAchievementId = await addAchievement(achievementName, achievementDescription, thresholdLevel);
          if (newAchievementId) {
            await addUserAchievement(newAchievementId);
            setUserAchievements(prev => [...prev, newAchievementId]); // Update state directly to reflect change
          }
        } else {
          const achievementId = achievementsSnapshot.docs[0].id;
          if (achievementId && !userAchievements.includes(achievementId)) {
            await addUserAchievement(achievementId);
            setUserAchievements(prev => [...prev, achievementId]); // Update state directly to reflect change
          }
        }
      };

      if (userLevel >= 1) {
        await addAchievementIfNotExist('First Login', 'Awarded for logging in for the first time', 1, WelcomeIcon);
      }
      if (userLevel >= 5) {
        await addAchievementIfNotExist('Level 5 Achiever', 'Awarded for reaching level 5', 5, NumberFiveIcon);
      }
      if (userLevel >= 10) {
        await addAchievementIfNotExist('Level 10 Achiever', 'Awarded for reaching level 10', 10, Level10Icon);
      }
      if (userLevel >= 15) {
        await addAchievementIfNotExist('Level 15 Achiever', 'Awarded for reaching level 15', 15, Level15Icon);
      }
      if (userLevel >= 20) {
        await addAchievementIfNotExist('Level 20 Achiever', 'Awarded for reaching level 20', 20, Level20Icon);
      }
      if (userLevel >= 30) {
        await addAchievementIfNotExist('Level 30 Achiever', 'Awarded for reaching level 30', 30, Level30Icon);
      }
      if (userLevel >= 40) {
        await addAchievementIfNotExist('Level 40 Achiever', 'Awarded for reaching level 40', 40, Level40Icon);
      }
      if (userLevel >= 50) {
        await addAchievementIfNotExist('Level 50 Achiever', 'Awarded for reaching level 50', 50, Level50Icon);
      }
      if (userLevel >= 75) {
        await addAchievementIfNotExist('Level 75 Achiever', 'Awarded for reaching level 75', 75, Level75Icon);
      }
      if (userLevel >= 100) {
        await addAchievementIfNotExist('Level 100 Achiever', 'Awarded for reaching level 100', 100, Level100Icon);
      }
      if (userLevel >= 150) {
        await addAchievementIfNotExist('Level 150 Achiever', 'Awarded for reaching level 150', 150, Level150Icon);
      }
      if (userLevel >= 200) {
        await addAchievementIfNotExist('Level 200 Achiever', 'Awarded for reaching level 200', 200, Level200Icon);
      }

      setHasCheckedAchievements(true);
    };

    if (!isFetching) {
      checkAndAddAchievement();
    }
  }, [isFetching, userAchievements, hasCheckedAchievements]);

  const getAchievementIcon = (name) => {
    switch (name) {
      case 'First Login':
        return images.WelcomeIcon;
      case 'Level 5 Achiever':
        return images.NumberFiveIcon;
      case 'Level 10 Achiever':
        return images.Level10Icon;
      case 'Level 15 Achiever':
        return images.Level15Icon;
      case 'Level 20 Achiever':
        return images.Level20Icon;
      case 'Level 30 Achiever':
        return images.Level30Icon;
      case 'Level 40 Achiever':
        return images.Level40Icon;
      case 'Level 50 Achiever':
        return images.Level50Icon;
      case 'Level 75 Achiever':
        return images.Level75Icon;
      case 'Level 100 Achiever':
        return images.Level100Icon;
      case 'Level 150 Achiever':
        return images.Level150Icon;
      case 'Level 200 Achiever':
        return images.Level200Icon;
      default:
        return null; // Or some default icon
    }
  };

  const sortAchievements = (a, b) => {
    const order = [
      'First Login',
      'Level 5 Achiever',
      'Level 10 Achiever',
      'Level 15 Achiever',
      'Level 20 Achiever',
      'Level 30 Achiever',
      'Level 40 Achiever',
      'Level 50 Achiever',
      'Level 75 Achiever',
      'Level 100 Achiever',
      'Level 150 Achiever',
      'Level 200 Achiever',
    ];
    const indexA = order.indexOf(a.name);
    const indexB = order.indexOf(b.name);
    return indexA - indexB;
  };

  const combinedAchievements = achievements
    .map(achievement => ({
      ...achievement,
      icon: getAchievementIcon(achievement.name), // Assign the appropriate icon
      status: userAchievements.includes(achievement.id) ? 'Unlocked' : 'Locked'
    }))
    .sort(sortAchievements); // Sort achievements here

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Achievements</Text>
      <FlatList
        data={combinedAchievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.achievementContainer}>
            {item.icon && <Image source={item.icon} style={styles.achievementIcon} />}
            <Text style={styles.achievementText}>{item.name}</Text>
            <Text style={styles.achievementText}>{item.status}</Text>
          </View>
        )}
      />
      <View style={styles.navbarContainer}>
        <CustomNavbar />
      </View>
    </SafeAreaView>
  );
};

export default AchievementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  achievementText: {
    fontSize: 18,
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width,
  },
});
