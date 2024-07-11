import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { firebase, firestore, auth } from '../firebase';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '../components/friendFunctions';
import CustomNavbar from '../components/CustomNavbar';
import { useNavigation } from '@react-navigation/native';

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

  const navigation = useNavigation(); // Add this line to use navigation

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

  const handleRejectRequest = async (fromUserId) => {
    if (!fromUserId) {
      console.error('Error rejecting friend request: fromUserId is undefined');
      return;
    }
  
    try {
      const success = await rejectFriendRequest(currentUserId, fromUserId);
      if (success) {
        // Remove the rejected request from the local state
        setReceivedRequests(prevRequests => prevRequests.filter(request => request.userId !== fromUserId));
        
        // Fetch the updated list of received requests
        const updatedUserDoc = await firestore.collection('users').doc(currentUserId).get();
        const updatedReceivedRequests = updatedUserDoc.data().friendRequests || [];
        
        // Map the received requests to include usernames
        const updatedReceivedRequestsData = await Promise.all(updatedReceivedRequests.map(async (userId) => {
          const userSnapshot = await firestore.collection('users').doc(userId).get();
          return { userId, username: userSnapshot.data().username };
        }));
        
        // Update the state with the updated received requests list
        setReceivedRequests(updatedReceivedRequestsData);
  
        Alert.alert('Success', 'Friend request rejected!');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error.message);
      Alert.alert('Error', 'Failed to reject friend request. Please try again later.');
    }
  };
  

  const handleAcceptRequest = async (fromUserId) => {
    if (!fromUserId) {
      console.error('Error accepting friend request: fromUserId is undefined');
      return;
    }

    try {
      const success = await acceptFriendRequest(currentUserId, fromUserId);
      if (success) {
        // Find the username of the accepted friend request
        const acceptedRequest = receivedRequests.find(user => user.userId === fromUserId);

        // Update friends and received requests state
        setFriends(prevFriends => [
          ...prevFriends, 
          { userId: fromUserId, username: acceptedRequest ? acceptedRequest.username : 'Unknown' }
        ]);
        setReceivedRequests(prevRequests => prevRequests.filter(request => request.userId !== fromUserId));

        Alert.alert('Success', 'Friend request accepted!');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error.message);
      Alert.alert('Error', 'Failed to accept friend request. Please try again later.');
    }
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
      const batch = firestore.batch();
      const currentUserRef = firestore.collection('users').doc(currentUserId);
      const friendUserRef = firestore.collection('users').doc(friendId);

      batch.update(currentUserRef, {
        friends: firebase.firestore.FieldValue.arrayRemove(friendId),
      });

      batch.update(friendUserRef, {
        friends: firebase.firestore.FieldValue.arrayRemove(currentUserId),
      });

      await batch.commit();

      // Update local state
      setFriends(prevFriends => prevFriends.filter(friend => friend.userId !== friendId));
      Alert.alert('Success', 'Friend removed successfully!');
    } catch (error) {
      console.error('Error removing friend:', error.message);
      Alert.alert('Error', 'Failed to remove friend. Please try again later.');
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

  const deleteFriendRequest = async (currentUserId, targetUserId) => {
    try {
      const batch = firestore.batch();
      const currentUserRef = firestore.collection('users').doc(currentUserId);
      const targetUserRef = firestore.collection('users').doc(targetUserId);
  
      // Remove the sent request from current user's sentRequests
      batch.update(currentUserRef, {
        sentRequests: firebase.firestore.FieldValue.arrayRemove(targetUserId),
      });
  
      // Remove the received request from target user's friendRequests
      batch.update(targetUserRef, {
        friendRequests: firebase.firestore.FieldValue.arrayRemove(currentUserId),
      });
  
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting friend request:', error.message);
      return false;
    }
  };
  
  const handleDeleteRequest = async (targetUserId) => {
    try {
      const success = await deleteFriendRequest(currentUserId, targetUserId);
      if (success) {
        // Update the local state to remove the deleted request
        setSentRequests(prevRequests => prevRequests.filter(request => request.userId !== targetUserId));
        Alert.alert('Success', 'Friend request deleted successfully!');
      } else {
        Alert.alert('Error', 'Failed to delete friend request. Please try again later.');
      }
    } catch (error) {
      console.error('Error deleting friend request:', error.message);
      Alert.alert('Error', 'Failed to delete friend request. Please try again later.');
    }
  };
  

  const renderReceivedRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text>{item.username}</Text>
      <TouchableOpacity 
        style={styles.roundedButton1} 
        onPress={() => handleAcceptRequest(item.userId)}
      >
        <Text style={styles.buttonText}>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.roundedButton2} 
        onPress={() => handleRejectRequest(item.userId)}
      >
        <Text style={styles.buttonText}>Reject</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSentRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text>{item.username} (Pending)</Text>
      <TouchableOpacity 
        style={styles.roundedButton2} 
        onPress={() => handleDeleteRequest(item.userId)}
      >
        <Text style={styles.buttonText}>Delete Request</Text>
      </TouchableOpacity>
    </View>
  );
  

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Text>{item.username}</Text>
      <TouchableOpacity
        style={styles.roundedButton1}
        onPress={() => navigation.navigate('FriendPetScreen', { friendId: item.userId })}
      >
        <Text style={styles.buttonText}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.roundedButton2} 
        onPress={() => handleRemoveFriend(item.userId)}
      >
        <Text style={styles.buttonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResultItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text>{item.username}</Text>
      <TouchableOpacity
        style={styles.roundedButton4}
        onPress={() => navigation.navigate('FriendPetScreen', { friendId: item.id })}
      >
        <Text style={styles.buttonText}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.roundedButton3} 
        onPress={() => handleSendRequest(item.id)}
      >
        <Text style={styles.buttonText}>Send Request</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <TouchableOpacity 
        style={styles.roundedButton3} 
        onPress={handleSearch}
        >
        <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
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
    </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  roundedButton1: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20, // This makes the button rounded
    backgroundColor: 'green', // Change this to your desired button color
    marginRight: -150, // Adjust this value as needed
  },
  roundedButton2: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20, // This makes the button rounded
    backgroundColor: 'red', // Change this to your desired button color
    marginRight: 5, // Adjust this value as needed
  },
  roundedButton3: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20, // This makes the button rounded
    backgroundColor: '#007BFF', // Change this to your desired button color
    marginRight: 5, // Adjust this value as needed
  },
  roundedButton4: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20, // This makes the button rounded
    backgroundColor: '#007BFF', // Change this to your desired button color
    marginRight: -100, // Adjust this value as needed
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
