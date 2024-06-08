import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
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
    if (sentRequests.some(request => request.userId === targetUserId)) {
      alert('Friend request already sent to this user.');
      return;
    }

    if (friends.some(friend => friend.userId === targetUserId)) {
      alert('This user is already your friend.');
      return;
    }

    try {
      const success = await sendFriendRequest(currentUserId, targetUserId);
      if (success) {
        // Add the newly sent request to the local state
        const userSnapshot = await firestore.collection('users').doc(targetUserId).get();
        setSentRequests(prevRequests => [...prevRequests, { userId: targetUserId, username: userSnapshot.data().username }]);
        alert('Friend request sent successfully!');
      } else {
        alert('Failed to send friend request. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error.message);
      alert('Failed to send friend request. Please try again later.');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      // Remove friend from Firestore
      const userRef = firestore.collection('users').doc(currentUserId);
      await userRef.update({
        friends: firebase.firestore.FieldValue.arrayRemove(friendId)
      });

      // Update local state
      setFriends(prevFriends => prevFriends.filter(friend => friend.userId !== friendId));
      Alert.alert('Success', 'Friend removed successfully!');
    } catch (error) {
      console.error('Error removing friend:', error.message);
      Alert.alert('Error', 'Failed to remove friend. Please try again later.');
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
      <Text>{item.username} (Pending) </Text>
    </View>
  );

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Text>{item.username}</Text>
      <Button
        title="Remove"
        onPress={() => handleRemoveFriend(item.userId)}
      />
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
        <Text style={styles.sectionTitle}>Received Friend Requests</Text>
        {loadingRequests ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={receivedRequests}
            keyExtractor={(item) => item.userId}
            renderItem={renderReceivedRequestItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No received friend requests</Text>}
          />
        )}

        <Text style={styles.sectionTitle}>Sent Friend Requests</Text>
        {loadingRequests ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={sentRequests}
            keyExtractor={(item) => item.userId}
            renderItem={renderSentRequestItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No sent friend requests</Text>}
          />
        )}

        <Text style={styles.sectionTitle}>Friends</Text>
        {loadingFriends ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.userId}
            renderItem={renderFriendItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No friends</Text>}
          />
        )}

        <Text style={styles.sectionTitle}>Add Friends</Text>
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
            ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
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
    padding: 16,
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  requestItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#e8eaf6',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    width: '100%',
  },
  friendItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#c5cae9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: '#b0bec5',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
  },
  section: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3949ab',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#3949ab',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});