import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CustomNavbar from '../components/CustomNavbar';

const FriendsScreen = () => {
    return (
        <View style = {{flex: 10}}>
            <View style={styles.container}>
                <Text style={styles.text}>Friends Screen</Text>
            </View>
            <CustomNavbar />
        </View>
    );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
