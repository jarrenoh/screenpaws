import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import CustomNavbar from '../components/CustomNavbar';

const PetScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Placeholder for now"
        />
      </View>
      <View style={styles.navbarContainer}>
        <CustomNavbar />
      </View>
    </View>
  );
};

export default PetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    width: '80%',
    borderRadius: 10,
    textAlign: 'center'
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
});