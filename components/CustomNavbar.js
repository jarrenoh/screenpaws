import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import home from '../assets/home.png';
import pawLogo from '../assets/69-698991_footprints-clipart-cougar-transparent-background-dog-paw-clipart.png';
import friends from '../assets/friends.png';
import leaderboard from '../assets/leaderboard.png';

const CustomNavbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.navItem}>
        <Image source={home} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Pet')} style={styles.navItem}>
        <Image source={pawLogo} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Friends')} style={styles.navItem}>
        <Image source={friends} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={styles.navItem}>
        <Image source={leaderboard} style={styles.navIcon} />
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
  navIcon: {
    width: 24,
    height: 24,
  },
});

export default CustomNavbar;