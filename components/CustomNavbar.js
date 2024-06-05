// CustomNavbar.js

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CustomNavbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.navItem}>
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Pet')} style={styles.navItem}>
        <Text style={styles.navText}>Pet</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Friends')} style={styles.navItem}>
        <Text style={styles.navText}>Friends</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    navbar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#404040',
      paddingVertical: 10,
      width: '100%'
    },
    navItem: {
      paddingHorizontal: 20,
    },
    navText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
  

export default CustomNavbar;
