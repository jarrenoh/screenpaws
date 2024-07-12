import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, TextInput, Modal } from 'react-native';
import { auth, firestore } from '../firebase'; // Adjust imports as per your setup
import { useNavigation } from '@react-navigation/core';
import CustomNavbar from '../components/CustomNavbar';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState(''); // State to hold current username
  const [newUsername, setNewUsername] = useState(''); // State to hold new username for editing
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  // Fetch current username on component mount or auth change
  useEffect(() => {
    const fetchUsername = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          setUsername(userDoc.data().username);
        }
      }
    };

    fetchUsername();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('Logged out');
      navigation.replace('Login');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveUsername = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await firestore.collection('users').doc(currentUser.uid).update({
          username: newUsername,
        });
        setUsername(newUsername); // Update local state with new username
        setModalVisible(false); // Close the modal after update
        console.log('Username updated successfully');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {/* Display current username */}
        <Text style={styles.currentUsername}>Current Username: {username}</Text>

        {/* Button to open modal for editing */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Edit Username</Text>
        </TouchableOpacity>

        {/* Button to logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for editing username */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new username"
              value={newUsername}
              onChangeText={(text) => setNewUsername(text)}
            />
            <TouchableOpacity
              onPress={handleSaveUsername}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.button, { backgroundColor: '#ccc' }]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  currentUsername: {
    fontSize: 18,
    marginBottom: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 10,
  },
});
