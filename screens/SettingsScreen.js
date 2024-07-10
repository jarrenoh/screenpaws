import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView} from 'react-native';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/core';
import CustomNavbar from '../components/CustomNavbar';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('Logged out');
      navigation.replace('Login');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={{flex : 1}} >
     
        <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity
            onPress={handleLogout}
            style={styles.button}
        >
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        
        </View>
        <CustomNavbar />
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
