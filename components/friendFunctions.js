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

export const acceptFriendRequest = async (currentUserId, fromUserId) => {
  try {
    const currentUserRef = firestore.collection('users').doc(currentUserId);
    const fromUserRef = firestore.collection('users').doc(fromUserId);

    await firestore.runTransaction(async (transaction) => {
      const currentUserDoc = await transaction.get(currentUserRef);
      const fromUserDoc = await transaction.get(fromUserRef);

      if (!currentUserDoc.exists || !fromUserDoc.exists) {
        throw new Error('User does not exist');
      }

      transaction.update(currentUserRef, {
        friends: firebase.firestore.FieldValue.arrayUnion(fromUserId),
        friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUserId),
      });

      transaction.update(fromUserRef, {
        friends: firebase.firestore.FieldValue.arrayUnion(currentUserId),
        sentRequests: firebase.firestore.FieldValue.arrayRemove(currentUserId),
      });
    });

    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return false;
  }
};

// Add similar function for rejecting a friend request if necessary
export const rejectFriendRequest = async (currentUserId, fromUserId) => {
  try {
    const currentUserRef = firestore.collection('users').doc(currentUserId);

    await currentUserRef.update({
      friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUserId),
    });

    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return false;
  }
};