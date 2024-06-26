import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity, FlatList, SafeAreaView, Dimensions } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';
import zenbg from '../assets/zenbg.webp';
import yellowaura from '../assets/yellowaura.png';
import blueaura from '../assets/blueaura.png';

const images = {
    zenbg: zenbg,
    yellowaura: yellowaura,
    blueaura: blueaura,
    // add more images here and import accordingly
  };

const ShopScreen = () => {
  const [coins, setCoins] = useState(0);
  const [items, setItems] = useState([]);
  const [userItems, setUserItems] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setCoins(userData.coins || 0);
          setUserItems(userData.items || []);
        }
      }
    };

    const fetchShopItems = async () => {
      const itemsSnapshot = await firestore.collection('shopItems').get();
      const shopItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(shopItems);
    };

    fetchUserData();
    fetchShopItems();
  }, []);

  const handleBuyItem = async (item) => {
    // Check if the item is already purchased
    if (userItems.some(userItem => userItem.id === item.id)) {
      alert('You have already purchased this item.');
      return;
    }

    if (coins >= item.price) {
      const newCoins = coins - item.price;
      const updatedUserItems = [...userItems, item];

      setCoins(newCoins);
      setUserItems(updatedUserItems);

      const user = auth.currentUser;
      if (user) {
        await firestore.collection('users').doc(user.uid).update({
          coins: newCoins,
          items: updatedUserItems
        });
      }
    } else {
      alert('Not enough coins');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.coinsText}>Coins: {coins}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Image 
              source={images[item.imageName]} 
              style={styles.itemImage} 
              onError={(error) => console.log('Error loading image', error)}
              />
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemText}>Price: {item.price} coins</Text>
            <TouchableOpacity
              style={[
                styles.buyButton,
                userItems.some(userItem => userItem.id === item.id) && styles.disabledButton
              ]}
              onPress={() => handleBuyItem(item)}
              disabled={userItems.some(userItem => userItem.id === item.id)}
            >
              <Text style={styles.buyButtonText}>
                {userItems.some(userItem => userItem.id === item.id) ? 'Bought' : 'Buy'}
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

export default ShopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  coinsText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
  },
  buyButton: {
    padding: 8,
    backgroundColor: '#76c7c0',
    borderRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width,
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
});
