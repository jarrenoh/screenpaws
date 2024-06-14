import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { firestore, auth } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';

const LeaderboardScreen = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [friendsLeaderboardData, setFriendsLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGlobal, setIsGlobal] = useState(true);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (currentUserId) {
      fetchLeaderboardData();
    } else {
      console.error('No current user ID');
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      const unsubscribe = firestore.collection('users').doc(currentUserId).onSnapshot((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          if (userData?.friends) {
            fetchFriendsLeaderboardData(leaderboardData, userData.friends);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [leaderboardData, currentUserId]);

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
      if (currentUserId) {
        const userDoc = await firestore.collection('users').doc(currentUserId).get();
        const userData = userDoc.data();
        if (userData?.friends) {
          fetchFriendsLeaderboardData(data, userData.friends);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error.message);
      setLoading(false);
    }
  };

  const fetchFriendsLeaderboardData = async (globalData, friendsList) => {
    try {
      if (!currentUserId) {
        console.error('No current user ID');
        return;
      }
      friendsList = [...friendsList, currentUserId]; // Add current user to the friends list
      console.log('Friends List:', friendsList); // Debug log to check friends list

      if (friendsList.length > 0) {
        const filteredData = globalData.filter(user => friendsList.includes(user.id));
        filteredData.sort((a, b) => {
          if (a.xp === b.xp) {
            return a.username.localeCompare(b.username);
          }
          return 0;
        });
        console.log('Filtered Data:', filteredData); // Debug log to check filtered data
        setFriendsLeaderboardData(filteredData);
      } else {
        setFriendsLeaderboardData([]);
        console.log('Friends list is empty or not available.');
      }
    } catch (error) {
      console.error('Error fetching friends leaderboard data:', error.message);
    }
  };

  const toggleLeaderboard = () => {
    setIsGlobal(!isGlobal);
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{isGlobal ? 'Global Leaderboard' : 'Friends Leaderboard'}</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity onPress={toggleLeaderboard} style={[styles.toggleButton, isGlobal && styles.activeToggleButton]}>
          <Text style={styles.toggleButtonText}>Global</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLeaderboard} style={[styles.toggleButton, !isGlobal && styles.activeToggleButton]}>
          <Text style={styles.toggleButtonText}>Friends</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={isGlobal ? leaderboardData : friendsLeaderboardData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
      <CustomNavbar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  activeToggleButton: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    color: '#000',
    fontWeight: 'bold',
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
    backgroundColor: '#7DF9FF',
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
