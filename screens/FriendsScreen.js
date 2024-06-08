import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { firebase, firestore, auth } from '../firebase';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '../components/friendFunctions';
import CustomNavbar from '../components/CustomNavbar';

const FriendsScreen = () => {
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
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

        // Fetch friends
        const friendsData = userData.friends || [];
        const friendPromises = friendsData.map(async (userId) => {
          const userSnapshot = await firestore.collection('users').doc(userId).get();
          return { userId, username: userSnapshot.data().username };
        });
        const resolvedFriends = await Promise.all(friendPromises);
        setFriends(resolvedFriends);

        // Fetch received friend requests
        const receivedRequestsData = userData.friendRequests || [];
        const receivedRequestsPromises = receivedRequestsData.map(async (userId) => {
          const userSnapshot = await firestore.collection('users').doc(userId).get();
          return { userId, username: userSnapshot.data().username };
        });
        const resolvedReceivedRequests = await Promise.all(receivedRequestsPromises);
        setReceivedRequests(resolvedReceivedRequests);

        // Fetch sent friend requests
        const sentRequestsData = userData.sentRequests || [];
        const sentRequestsPromises = sentRequestsData.map(async (userId) => {
          const userSnapshot = await firestore.collection('users').doc(userId).get();
          return { userId, username: userSnapshot.data().username };
        });
        const resolvedSentRequests = await Promise.all(sentRequestsPromises);
        setSentRequests(resolvedSentRequests);
      }

      setLoadingFriends(false);
      setLoadingRequests(false);
    };

    fetchFriendsAndRequests();
  }, [currentUserId]);

  const handleAcceptRequest = async (fromUserId) => {
    if (!fromUserId) {
      console.error('Error accepting friend request: fromUserId is undefined');
      return;
    }

    try {
      await acceptFriendRequest(currentUserId, fromUserId);

      // Refresh the lists after accepting a request
      const userRef = firestore.collection('users').doc(currentUserId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        const friendsData = userData.friends || [];
        const friendPromises = friendsData.map(async (userId) => {
          const userSnapshot = await firestore.collection('users').doc(userId).get();
          return { userId, username: userSnapshot.data().username };
        });
        const resolvedFriends = await Promise.all(friendPromises);
        setFriends(resolvedFriends);

        const receivedRequestsData = userData.friendRequests || [];
        const receivedRequestsPromises = receivedRequestsData.map(async (userId) => {
          const userSnapshot = await firestore.collection('users').doc(userId).get();
          return { userId, username: userSnapshot.data().username };
        });
        const resolvedReceivedRequests = await Promise.all(receivedRequestsPromises);
        setReceivedRequests(resolvedReceivedRequests);

        const sentRequestsData = userData.sentRequests || [];
        const sentRequestsPromises = sentRequestsData.map(async (userId) => {
          const userSnapshot = await firestore.collection('users').doc(userId).get();
          return { userId, username: userSnapshot.data().username };
        });
        const resolvedSentRequests = await Promise.all(sentRequestsPromises);
        setSentRequests(resolvedSentRequests);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error.message);
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
        setSentRequests(prevRequests => [...prevRequests, { userId: targetUserId, username: '' }]); // Update with actual username if available
        alert('Friend request sent successfully!');
      } else {
        alert('Failed to send friend request. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error.message);
      alert('Failed to send friend request. Please try again later.');
    }
  };

  const renderReceivedRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text>{item.username}</Text>
      <Button
        title="Accept"
        onPress={() => handleAcceptRequest(item.userId)}
      />
    </View>
  );

  const renderSentRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text>{item.username} (Request Sent)</Text>
    </View>
  );

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Text>{item.username}</Text>
    </View>
  );

  const renderSearchResultItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text>{item.username}</Text>
      <Button
        title="Send Request"
        onPress={() => handleSendRequest(item.id)}
      />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.text}>Received Friend Requests</Text>
        {loadingRequests ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={receivedRequests}
            keyExtractor={(item) => item.userId}
            renderItem={renderReceivedRequestItem}
            ListEmptyComponent={<Text>No received friend requests</Text>}
          />
        )}

        <Text style={styles.text}>Sent Friend Requests</Text>
        {loadingRequests ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={sentRequests}
            keyExtractor={(item) => item.userId}
            renderItem={renderSentRequestItem}
            ListEmptyComponent={<Text>No sent friend requests</Text>}
          />
        )}

        <Text style={styles.text}>Friends</Text>
        {loadingFriends ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.userId}
            renderItem={renderFriendItem}
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
            renderItem={renderSearchResultItem}
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
