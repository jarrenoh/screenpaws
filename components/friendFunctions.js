// friendFunctions.js
import { auth, firestore } from '../firebase'; // Adjust the import as needed

export const sendFriendRequest = async (toUserId) => {
  const user = auth.currentUser;
  if (user) {
    const fromUserId = user.uid;
    const requestRef = firestore.collection('users').doc(toUserId).collection('friendRequests').doc();
    
    await requestRef.set({
      fromUserId: fromUserId,
      status: 'pending'
    });

    console.log('Friend request sent!');
  } else {
    console.error('User is not authenticated');
  }
};

export const acceptFriendRequest = async (requestId, fromUserId) => {
  const user = auth.currentUser;
  if (user) {
    const toUserId = user.uid;

    // Update the friend request status
    const requestRef = firestore.collection('users').doc(toUserId).collection('friendRequests').doc(requestId);
    await requestRef.update({
      status: 'accepted'
    });

    // Add each user to the other's friends list
    const userFriendsRef = firestore.collection('users').doc(toUserId).collection('friends').doc(fromUserId);
    const friendFriendsRef = firestore.collection('users').doc(fromUserId).collection('friends').doc(toUserId);

    await userFriendsRef.set({
      status: 'accepted'
    });

    await friendFriendsRef.set({
      status: 'accepted'
    });

    console.log('Friend request accepted!');
  } else {
    console.error('User is not authenticated');
  }
};
