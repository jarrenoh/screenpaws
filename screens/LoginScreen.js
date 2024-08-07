import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/core';
import images from '../components/images';

const LoginScreen = () => {
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
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('Logged in with:', user.email);
      })
      .catch(error => alert(error.message));
  };

  return (
    <KeyboardAvoidingView
      behavior='padding'
      style={styles.container}
    >
      <Image source={images.pawLogo} style={styles.image} />
      <Text style={styles.title}>ScreenPaws</Text>
      <View style={styles.inputContainer}>
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
        <Text style={styles.registerText}>
          New to ScreenPaws?{" "}
          <Text 
            onPress={handleSignUp}
            style={styles.registerLink}
          >
             Sign Up
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
  },
  registerText: {
    marginTop: 15,
    color: 'black',
    fontSize: 16,
  },
  registerLink: {
    fontWeight: 'bold',
  },
});