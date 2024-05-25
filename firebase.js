// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGewnLwsVdGbuASZ8ZicLRiOsJMxbhfw0",
  authDomain: "screenpaws.firebaseapp.com",
  projectId: "screenpaws",
  storageBucket: "screenpaws.appspot.com",
  messagingSenderId: "557098095848",
  appId: "1:557098095848:web:a1b82d51e130ae2105a55d"
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app();
}

const auth = firebase.auth();

export { auth };