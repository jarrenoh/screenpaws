import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { firestore, auth } from '../firebase'; // Importing firestore and auth from your firebase setup
import CustomNavbar from '../components/CustomNavbar'; // Importing your custom navbar component

const LeaderboardScreen = ({ route }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    // Fetch leaderboard data based on the route parameter (global or friends)
    if (route.params && route.params.type === 'global') {
      fetchGlobalLeaderboard();
    } else if (route.params && route.params.type === 'friends') {
      fetchFriendsLeaderboard();
    }
  }, [route]);

  const fetchGlobalLeaderboard = async () => {
    try {
      const snapshot = await firestore.collection('users').orderBy('xp', 'desc').limit(10).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboardData(data);
      console.log('Global leaderboard data:', data);
    } catch (error) {
      console.error('Error fetching global leaderboard:', error.message);
    }
  };

  const fetchFriendsLeaderboard = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // Retrieve the user's friend list from Firestore
      const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
      const userData = userDoc.data();
      const friendUserIds = userData.friends || []; // Assuming friends are stored as user IDs

      // Fetch the user data for each friend
      const friendPromises = friendUserIds.map(async (friendUserId) => {
        const friendUserDoc = await firestore.collection('users').doc(friendUserId).get();
        return friendUserDoc.data();
      });

      // Wait for all friend data to be fetched
      const friendData = await Promise.all(friendPromises);

      // Sort the friend data by XP or level to create the leaderboard
      const sortedFriendData = friendData.sort((a, b) => b.xp - a.xp); // Sort by XP (change to level if needed)

      // Now you have the friends' leaderboard data in sortedFriendData
      setLeaderboardData(sortedFriendData);
    } catch (error) {
      console.error('Error fetching friends leaderboard:', error.message);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.level}>Level {item.level}</Text>
      <Text style={styles.xp}>{item.xp} XP</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <CustomNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rank: {
    fontWeight: 'bold',
  },
  username: {
    flex: 1,
    marginLeft: 10,
  },
  level: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
  xp: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default LeaderboardScreen;
