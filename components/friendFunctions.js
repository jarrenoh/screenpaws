import { firebase, firestore } from '../firebase'; // Adjust the path as needed

// Send Friend Request
export const sendFriendRequest = async (currentUserId, targetUserId) => {
  try {
    const targetUserRef = firestore.collection('users').doc(targetUserId);
    await targetUserRef.update({
      friendRequests: firebase.firestore.FieldValue.arrayUnion(currentUserId),
    });
    return true; // Indicate success
  } catch (error) {
    console.error('Error sending friend request:', error.message);
    return false; // Indicate failure
  }
};

// Accept Friend Request
export const acceptFriendRequest = async (currentUserId, targetUserId) => {
  try {
    const currentUserRef = firestore.collection('users').doc(currentUserId);
    const targetUserRef = firestore.collection('users').doc(targetUserId);

    await currentUserRef.update({
      friends: firebase.firestore.FieldValue.arrayUnion(targetUserId),
      friendRequests: firebase.firestore.FieldValue.arrayRemove(targetUserId),
    });

    await targetUserRef.update({
      friends: firebase.firestore.FieldValue.arrayUnion(currentUserId),
    });

    return true; // Indicate success
  } catch (error) {
    console.error('Error accepting friend request:', error.message);
    return false; // Indicate failure
  }
};

// Reject Friend Request
export const rejectFriendRequest = async (currentUserId, targetUserId) => {
  const currentUserRef = firestore().collection('users').doc(currentUserId);

  await currentUserRef.update({
    friendRequests: firebase.firestore.FieldValue.arrayRemove(targetUserId),
  });
};