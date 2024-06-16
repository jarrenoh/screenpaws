import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';
import { addAchievement, addUserAchievement } from '../components/achFunctions';

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

      const addAchievementIfNotExist = async (achievementName, achievementDescription, thresholdLevel) => {
        const achievementsSnapshot = await firestore.collection('achievements')
          .where('name', '==', achievementName)
          .get();

        if (achievementsSnapshot.empty) {
          const newAchievementId = await addAchievement(achievementName, achievementDescription, 10);
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
        await addAchievementIfNotExist('First Login', 'Awarded for logging in for the first time', 1);
      }
      if (userLevel >= 5) {
        await addAchievementIfNotExist('Level 5 Achiever', 'Awarded for reaching level 5', 5);
      }
      if (userLevel >= 15) {
        await addAchievementIfNotExist('Level 15 Achiever', 'Awarded for reaching level 15', 15);
      }

      setHasCheckedAchievements(true);
    };

    if (!isFetching) {
      checkAndAddAchievement();
    }
  }, [isFetching, userAchievements, hasCheckedAchievements]);

  const combinedAchievements = achievements
    .map(achievement => ({
      ...achievement,
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
  achievementText: {
    fontSize: 18,
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
