import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';

const InventoryScreen = () => {
  const [userItems, setUserItems] = useState([]);
  const [equippedItem, setEquippedItem] = useState(null);

  useEffect(() => {
    const fetchUserItems = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserItems(userData.items || []);
          setEquippedItem(userData.equippedItem || null);
        }
      }
    };

    fetchUserItems();
  }, []);

  const handleEquipItem = async (item) => {
    const newEquippedItem = equippedItem && equippedItem.id === item.id ? null : item;
    setEquippedItem(newEquippedItem);
    const user = auth.currentUser;
    if (user) {
      await firestore.collection('users').doc(user.uid).update({
        equippedItem: newEquippedItem
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Your Inventory</Text>
    <FlatList
        data={userItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <View style={styles.itemContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <TouchableOpacity style={styles.equipButton} onPress={() => handleEquipItem(item)}>
                    <Text style={styles.equipButtonText}>
                        {equippedItem && equippedItem.id === item.id ? 'Un-equip' : 'Equip'}
                    </Text>
                </TouchableOpacity>
            </View>
        )}
    />
      <View style={styles.navbarContainer}>
        <CustomNavbar />
      </View>
    </SafeAreaView>
  );
};

export default InventoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  equipButton: {
    marginLeft: 'auto',
    padding: 8,
    backgroundColor: '#76c7c0',
    borderRadius: 4,
  },
  equipButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width,
  },
});
