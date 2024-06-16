import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, SafeAreaView, Dimensions } from 'react-native';
import { auth, firestore } from '../firebase';
import CustomNavbar from '../components/CustomNavbar';

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
    if (coins >= item.price) {
      const newCoins = coins - item.price;
      setCoins(newCoins);
      setUserItems([...userItems, item]);

      const user = auth.currentUser;
      if (user) {
        await firestore.collection('users').doc(user.uid).update({
          coins: newCoins,
          items: [...userItems, item]
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
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemText}>Price: {item.price} coins</Text>
            <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyItem(item)}>
              <Text style={styles.buyButtonText}>Buy</Text>
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
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width,
  },
});
