import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import CustomNavbar from '../components/CustomNavbar';
import placeholderImage from '../assets/dog.png'; // Make sure to replace this with the path to your image

const PetScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={placeholderImage}
          style={styles.image}
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
  image: {
    width: 200, // Adjust the width as needed
    height: 200, // Adjust the height as needed
    resizeMode: 'contain', // Adjust the resize mode as needed
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
});
