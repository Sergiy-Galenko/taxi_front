import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { UserProvider, useUser } from '../hooks/UserContext';

// Auth Screens
import Login from '../screens/auth/Login';
import PassengerRegistration from '../screens/auth/PassengerRegistration';

// Main Screens
import Home from '../screens/Home';
import SettingsScreen from '../screens/Settings';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import PreorderScreen from '../screens/PreorderScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { user } = useUser();

  return (
    <LinearGradient
      colors={['#141414', '#1a1a1a', '#000']}
      style={styles.drawerContainer}
    >
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        <View style={styles.userBlock}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-circle" size={60} color="#E50914" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || '...'}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>{user?.rating ?? '—'}</Text>
              <Text style={styles.roleBadge}>Пасажир</Text>
            </View>
          </View>
        </View>
        
        <DrawerItemList 
          {...props} 
          activeTintColor="#E50914"
          inactiveTintColor="#BBB"
          labelStyle={styles.drawerLabel}
          itemStyle={styles.drawerItem}
        />
        
        <DrawerItem
          label="Налаштування"
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate('Settings')}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          label="Історія поїздок"
          icon={({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate('TripHistory')}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          label="Передзамовлення"
          icon={({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate('Preorder')}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
        />
      </DrawerContentScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.versionText}>Версія додатку 1.2.0</Text>
        <Text style={styles.copyright}>© 2023 NETFLIXTAXI</Text>
      </View>
    </LinearGradient>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#E50914',
        drawerInactiveTintColor: '#BBB',
        drawerStyle: { width: 280 },
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.7)',
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Головна',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Налаштування',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen name="TripHistory" component={TripHistoryScreen} options={{ title: 'Історія поїздок' }} />
      <Drawer.Screen name="Preorder" component={PreorderScreen} options={{ title: 'Передзамовлення' }} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <>
      {/* Статусбар білий для годинника та батареї */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={Platform.OS === 'android' ? '#141414' : undefined}
        translucent={false}
      />
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#141414' },
            }}
          >
            {/* Auth Stack */}
            <Stack.Screen 
              name="Login" 
              component={Login} 
              options={{ 
                headerShown: false,
                cardStyle: { backgroundColor: '#000' } 
              }} 
            />
            
            <Stack.Screen 
              name="PassengerRegistration" 
              component={PassengerRegistration} 
            />

            {/* Main Drawer as Main App */}
            <Stack.Screen 
              name="Main" 
              component={MainDrawer} 
              options={{ 
                headerShown: false 
              }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerScroll: {
    flexGrow: 1,
  },
  userBlock: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 6,
    marginRight: 15,
  },
  roleBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    color: '#E50914',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  drawerItem: {
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(30,30,30,0.7)',
  },
  logoutLabel: {
    color: '#E50914',
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  versionText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
  copyright: {
    color: '#444',
    fontSize: 12,
  },
});