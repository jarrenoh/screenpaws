import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { firestore } from '../firebase'; // Assuming you're using firestore directly for fetching data
import CustomNavbar from '../components/CustomNavbar';

const LeaderboardScreen = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const snapshot = await firestore.collection('users').orderBy('xp', 'desc').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error.message);
      setLoading(false);
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
