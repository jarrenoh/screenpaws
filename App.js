import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PetScreen from './screens/PetScreen';
import RegisterScreen from './screens/RegisterScreen';
import FriendsScreen from './screens/FriendsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ShopScreen from './screens/ShopScreen';
import AchievementScreen from './screens/AchievementScreen';
import InventoryScreen from './screens/InventoryScreen';
import FriendPetScreen from './screens/FriendPetScreen';

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options= {{headerShown: false}} name="Login" component={LoginScreen} />
        <Stack.Screen options= {{headerShown: false}} name="Home" component={HomeScreen} />
        <Stack.Screen options= {{headerShown: false}} name="Pet" component={PetScreen} />
        <Stack.Screen options= {{headerShown: true}} name="Register" component={RegisterScreen} />
        <Stack.Screen options= {{headerShown: false}} name="Friends" component={FriendsScreen} />
        <Stack.Screen options= {{headerShown: false}} name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen options= {{headerShown: false}} name="Shop" component={ShopScreen} />
        <Stack.Screen options= {{headerShown: false}} name="Achievements" component={AchievementScreen} />
        <Stack.Screen options= {{headerShown: false}} name="FriendPetScreen" component={FriendPetScreen} />
        <Stack.Screen options= {{headerShown: false}} name="Inventory" component={InventoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const Stack = createNativeStackNavigator();
