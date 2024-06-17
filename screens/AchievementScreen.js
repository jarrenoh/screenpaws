import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, Dimensions, Image } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';
import { addAchievement, addUserAchievement } from '../components/achFunctions';

// Importing the icons
import WelcomeIcon from '../assets/welcome.png';
import NumberFiveIcon from '../assets/number-five-icon.png';
import Level15Icon from '../assets/15.png';

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
      if (userLevel >= 15) {
        await addAchievementIfNotExist('Level 15 Achiever', 'Awarded for reaching level 15', 15, Level15Icon);
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
        return WelcomeIcon;
      case 'Level 5 Achiever':
        return NumberFiveIcon;
      case 'Level 15 Achiever':
        return Level15Icon;
      default:
        return null; // Or some default icon
    }
  };

  const combinedAchievements = achievements
    .map(achievement => ({
      ...achievement,
      icon: getAchievementIcon(achievement.name), // Assign the appropriate icon
      status: userAchievements.includes(achievement.id) ? 'Unlocked' : 'Locked'
    }))
    .filter((achievement, index, self) =>
      index === self.findIndex((a) => a.name === achievement.name)
    );

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
