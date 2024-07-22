import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, Dimensions, Image } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';
import { addAchievement, addUserAchievement } from '../components/achFunctions';

import images from '../components/images'; // Assuming all icons are exported from this file

const AchievementScreen = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [coins, setCoins] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const achievementsSnapshot = await firestore.collection('achievements').get();
        const allAchievements = achievementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAchievements(allAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };

    const fetchUserAchievements = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await firestore.collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setUserAchievements(userData.achievements || []);
            setCoins(userData.coins || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching user achievements:', error);
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

      try {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        const userLevel = userData.level || 1;

        const addAchievementIfNotExist = async (achievementName, achievementDescription, thresholdLevel, icon) => {
          try {
            const achievementsSnapshot = await firestore.collection('achievements')
              .where('name', '==', achievementName)
              .get();

            if (achievementsSnapshot.empty) {
              const newAchievementId = await addAchievement(achievementName, achievementDescription, thresholdLevel);
              if (newAchievementId) {
                await addUserAchievement(newAchievementId);
                setUserAchievements(prev => [...prev, newAchievementId]);

                // Add 100 coins for unlocking an achievement
                const newCoins = coins + 100;
                setCoins(newCoins);
                await firestore.collection('users').doc(user.uid).update({ coins: newCoins });
              }
            } else {
              const achievementId = achievementsSnapshot.docs[0].id;
              if (achievementId && !userAchievements.includes(achievementId)) {
                await addUserAchievement(achievementId);
                setUserAchievements(prev => [...prev, achievementId]);

                // Add 100 coins for unlocking an achievement
                const newCoins = coins + 100;
                setCoins(newCoins);
                await firestore.collection('users').doc(user.uid).update({ coins: newCoins });
              }
            }
          } catch (error) {
            console.error(`Error adding achievement "${achievementName}":`, error);
          }
        };

        if (userLevel >= 1) {
          await addAchievementIfNotExist('First Login', 'Awarded for logging in for the first time', 1, images.achievement);
        }
        if (userLevel >= 5) {
          await addAchievementIfNotExist('Level 5 Achiever', 'Awarded for reaching level 5', 5, images.achievement);
        }
        if (userLevel >= 10) {
          await addAchievementIfNotExist('Level 10 Achiever', 'Awarded for reaching level 10', 10, images.achievement);
        }
        if (userLevel >= 15) {
          await addAchievementIfNotExist('Level 15 Achiever', 'Awarded for reaching level 15', 15, images.achievement);
        }
        if (userLevel >= 20) {
          await addAchievementIfNotExist('Level 20 Achiever', 'Awarded for reaching level 20', 20, images.achievement);
        }
        if (userLevel >= 30) {
          await addAchievementIfNotExist('Level 30 Achiever', 'Awarded for reaching level 30', 30, images.achievement);
        }
        if (userLevel >= 40) {
          await addAchievementIfNotExist('Level 40 Achiever', 'Awarded for reaching level 40', 40, images.achievement);
        }
        if (userLevel >= 50) {
          await addAchievementIfNotExist('Level 50 Achiever', 'Awarded for reaching level 50', 50, images.achievement);
        }
        if (userLevel >= 75) {
          await addAchievementIfNotExist('Level 75 Achiever', 'Awarded for reaching level 75', 75, images.achievement);
        }
        if (userLevel >= 100) {
          await addAchievementIfNotExist('Level 100 Achiever', 'Awarded for reaching level 100', 100, images.achievement);
        }
        if (userLevel >= 150) {
          await addAchievementIfNotExist('Level 150 Achiever', 'Awarded for reaching level 150', 150, images.achievement);
        }
        if (userLevel >= 200) {
          await addAchievementIfNotExist('Level 200 Achiever', 'Awarded for reaching level 200', 200, images.achievement);
        }

        setHasCheckedAchievements(true);
      } catch (error) {
        console.error('Error checking and adding achievements:', error);
      }
    };

    if (!isFetching) {
      checkAndAddAchievement();
    }
  }, [isFetching, userAchievements, hasCheckedAchievements, coins]);

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
      icon: images.achievement,
      status: userAchievements.includes(achievement.id) ? 'Unlocked' : 'Locked'
    }))
    .sort(sortAchievements);

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
            <Image source={item.status === 'Unlocked' ? images.unlock : images.lock} style={styles.statusIcon} />
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
    width: 30,
    height: 30,
    marginRight: 16,
    resizeMode: 'contain',
  },
  achievementText: {
    fontSize: 18,
  },
  statusIcon: {
    width: 20,
    height: 20,
    marginLeft: 16,
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width,
  },
});
