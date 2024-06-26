import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGewnLwsVdGbuASZ8ZicLRiOsJMxbhfw0",
  authDomain: "screenpaws.firebaseapp.com",
  projectId: "screenpaws",
  storageBucket: "screenpaws.appspot.com",
  messagingSenderId: "557098095848",
  appId: "1:557098095848:web:a1b82d51e130ae2105a55d"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const auth = firebase.auth();
const firestore = firebase.firestore();

export { auth, firestore, firebase };
