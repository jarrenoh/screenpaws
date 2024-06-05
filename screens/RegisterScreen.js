import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/core';
import pawLogo from '../assets/69-698991_footprints-clipart-cougar-transparent-background-dog-paw-clipart.png';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        navigation.replace('Home');
        console.log('Logged in:', user.email);
      }
    });
    return unsubscribe;
  }, []);

  const handleSignUp = () => {
    firestore
      .collection('users')
      .where('username', '==', username)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          alert('Username already exists. Please choose a different username.');
        } else {
          auth
            .createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
              const user = userCredential.user;
              user.updateProfile({
                displayName: username
              }).then(() => {
                console.log('Username updated successfully');
                firestore
                  .collection('users')
                  .doc(user.uid)
                  .set({
                    username: username,
                    email: email
                  })
                  .then(() => {
                    console.log('User added to Firestore');
                  })
                  .catch(error => {
                    console.error('Error adding user to Firestore: ', error);
                  });
              }).catch(error => {
                console.log('Error occurred while updating username', error);
              });
              console.log('Registered with:', user.email);
            })
            .catch(error => alert(error.message));
        }
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      behavior='padding'
      style={styles.container}
    >
      <Image source={pawLogo} style={styles.image} />
      <Text style={styles.title}>ScreenPaws</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder='Username'
          value={username}
          onChangeText={text => setUsername(text)}
          style={styles.input}
        />
        <TextInput
          placeholder='Email'
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder='Password'
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogin}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSignUp}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '80%'
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutline: {
    marginTop: 5,
    backgroundColor: 'white',
    borderColor: 'blue',
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  }
});