import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { firestore, auth } from '../firebase'; // Assuming you're using firestore directly for fetching data
import CustomNavbar from '../components/CustomNavbar';

const LeaderboardScreen = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid; // Replace this with the actual current user ID

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const snapshot = await firestore.collection('users').orderBy('xp', 'desc').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
        if (a.xp === b.xp) {
          return a.username.localeCompare(b.username);
        }
        return 0;
      });
      setLeaderboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error.message);
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.item, item.id === currentUserId && styles.highlightedItem]}>
      <View style={styles.userInfo}>
        <Text style={styles.rank}>{index + 1}</Text>
        <View style={styles.usernameContainer}>
          <Text style={styles.username}>{item.username}</Text>
          {index === 0 && <Text style={styles.specialText}>10k Aura</Text>}
          {index === 1 && <Text style={styles.specialText}>Locked In</Text>}
          {index === 2 && <Text style={styles.specialText}>Almost There</Text>}
        </View>
      </View>
      <View style={styles.userStats}>
        <Text style={styles.level}>Level {item.level}</Text>
        <Text style={styles.xp}>{item.xp} XP</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={leaderboardData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
      <CustomNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Light background color for better contrast
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  highlightedItem: {
    backgroundColor: '#7DF9FF', // Highlight color for current user
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameContainer: {
    marginLeft: 10,
  },
  rank: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  username: {
    fontSize: 18,
  },
  specialText: {
    fontSize: 14,
    color: '#888',
  },
  userStats: {
    alignItems: 'flex-end',
  },
  level: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  xp: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default LeaderboardScreen;
