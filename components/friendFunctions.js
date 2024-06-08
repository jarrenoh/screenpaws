import { firebase, firestore } from '../firebase'; // Adjust the path as needed

// Send Friend Request
export const sendFriendRequest = async (currentUserId, targetUserId) => {
  try {
    const targetUserRef = firestore.collection('users').doc(targetUserId);
    const currentUserRef = firestore.collection('users').doc(currentUserId);
    const batch = firestore.batch();

    batch.update(targetUserRef, {
      friendRequests: firebase.firestore.FieldValue.arrayUnion(currentUserId),
    });

    batch.update(currentUserRef, {
      sentRequests: firebase.firestore.FieldValue.arrayUnion(targetUserId),
    });

    await batch.commit();
    return true; // Indicate success
  } catch (error) {
    console.error('Error sending friend request:', error.message);
    return false; // Indicate failure
  }
};


// Accept Friend Request
export const acceptFriendRequest = async (currentUserId, fromUserId) => {
  if (!currentUserId || !fromUserId) {
    throw new Error('User IDs must be provided');
  }

  const userRef = firestore.collection('users').doc(currentUserId);
  const fromUserRef = firestore.collection('users').doc(fromUserId);

  const batch = firestore.batch();

  batch.update(userRef, {
    friends: firebase.firestore.FieldValue.arrayUnion(fromUserId),
    friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUserId),
  });

  batch.update(fromUserRef, {
    friends: firebase.firestore.FieldValue.arrayUnion(currentUserId),
  });

  await batch.commit();
};

// Reject Friend Request
export const rejectFriendRequest = async (currentUserId, targetUserId) => {
  const currentUserRef = firestore().collection('users').doc(currentUserId);

  await currentUserRef.update({
    friendRequests: firebase.firestore.FieldValue.arrayRemove(targetUserId),
  });
};
