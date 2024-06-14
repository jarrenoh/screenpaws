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

      const achievementsSnapshot = await firestore.collection('achievements')
        .where('name', '==', 'First Login')
        .get();

      if (achievementsSnapshot.empty) {
        const newAchievementId = await addAchievement('First Login', 'Awarded for logging in for the first time', 10);
        if (newAchievementId) {
          await addUserAchievement(newAchievementId);
          setUserAchievements(prev => [...prev, newAchievementId]); // Update state directly to reflect change
        }
      } else {
        const firstLoginAchievementId = achievementsSnapshot.docs[0].id;
        if (firstLoginAchievementId && !userAchievements.includes(firstLoginAchievementId)) {
          await addUserAchievement(firstLoginAchievementId);
          setUserAchievements(prev => [...prev, firstLoginAchievementId]); // Update state directly to reflect change
        }
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
