import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { auth } from '../firebase'
import { useNavigation } from '@react-navigation/core'

const HomeScreen = () => {

  const navigation = useNavigation()

  const handleLogout = () => {
    auth.signOut()
    .then(() => {
      console.log('Logged out')
      navigation.replace('Login')
    })
    .catch(error => alert(error.message))
  }  

  return (
    <View style-={styles.container}>
      <Text>Email: {auth.currentUser?.email}</Text>
      <TouchableOpacity
        onPress={handleLogout}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        backgroundColor: 'blue',
        padding: 15,
        width: '60%',
        borderRadius: 10,
        alignItems : 'center',
        marginTop: 40,
    },
    
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    }
})