// achFunctions.js contains functions to add achievements to the database and to add achievements to the user
import { firebase, firestore, auth } from '../firebase';

// Function to add an achievement
export const addAchievement = async (name, description, points) => {
  try {
    const achievementRef = await firestore.collection('achievements').add({
      name,
      description,
      points,
    });
    console.log('Achievement added!', achievementRef.id);
    return achievementRef.id; // Returning the ID of the newly created achievement
  } catch (error) {
    console.error('Error adding achievement: ', error);
  }
};

// Function to add an achievement to the user
export const addUserAchievement = async (achievementId) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const userRef = firestore.collection('users').doc(user.uid);
      await userRef.update({
        achievements: firebase.firestore.FieldValue.arrayUnion(achievementId),
      });
      console.log('Achievement added to user!');
    } catch (error) {
      console.error('Error adding achievement to user: ', error);
    }
  } else {
    console.log('No user is currently logged in.');
  }
};
