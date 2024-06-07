import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { firestore, auth } from '../firebase';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '../components/friendFunctions';
import CustomNavbar from '../components/CustomNavbar';

const FriendsScreen = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    const fetchFriendsAndRequests = async () => {
      setLoadingFriends(true);
      setLoadingRequests(true);
      const userRef = firestore.collection('users').doc(currentUserId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setFriends(userData.friends || []);
        setFriendRequests(userData.friendRequests || []);
      }
      setLoadingFriends(false);
      setLoadingRequests(false);
    };

    fetchFriendsAndRequests();
  }, [currentUserId]);

  const handleAcceptRequest = async (requestId, fromUserId) => {
    await acceptFriendRequest(currentUserId, fromUserId);
    // Refresh the lists after accepting a request
    const userRef = firestore.collection('users').doc(currentUserId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      setFriends(userData.friends || []);
      setFriendRequests(userData.friendRequests || []);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoadingSearch(true);
    const usersRef = firestore.collection('users');
    const querySnapshot = await usersRef
      .where('username', '>=', searchQuery)
      .where('username', '<=', searchQuery + '\uf8ff')
      .get();

    const results = [];
    querySnapshot.forEach(doc => {
      if (doc.id !== currentUserId) {
        results.push({ id: doc.id, ...doc.data() });
      }
    });

    setSearchResults(results);
    setLoadingSearch(false);
  };

  const handleSendRequest = async (targetUserId) => {
    try {
      const success = await sendFriendRequest(currentUserId, targetUserId);
      if (success) {
        // Add the newly sent request to the local state
        setFriendRequests(prevRequests => [...prevRequests, targetUserId]);
        alert('Friend request sent successfully!');
      } else {
        alert('Failed to send friend request. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error.message);
      alert('Failed to send friend request. Please try again later.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.text}>Friend Requests</Text>
        {loadingRequests ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={friendRequests}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
              <View style={styles.requestItem}>
                <Text>{item}</Text>
                <Button
                  title="Accept"
                  onPress={() => handleAcceptRequest(item, item)}
                />
              </View>
            )}
            ListEmptyComponent={<Text>No friend requests</Text>}
          />
        )}

        <Text style={styles.text}>Friends</Text>
        {loadingFriends ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
              <View style={styles.friendItem}>
                <Text>{item}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>No friends</Text>}
          />
        )}

        <Text style={styles.text}>Add Friends</Text>
        <TextInput
          style={styles.input}
          placeholder="Search for users"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button title="Search" onPress={handleSearch} />
        {loadingSearch ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.requestItem}>
                <Text>{item.username}</Text>
                <Button
                  title="Send Request"
                  onPress={() => handleSendRequest(item.id)}
                />
              </View>
            )}
            ListEmptyComponent={<Text>No users found</Text>}
          />
        )}
      </View>
      <CustomNavbar />
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  requestItem: {
    padding: 10,
    margin: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  friendItem: {
    padding: 10,
    margin: 5,
    backgroundColor: '#d1d1d1',
    borderRadius: 5,
    width: '90%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '90%',
    paddingHorizontal: 10,
  },
});
