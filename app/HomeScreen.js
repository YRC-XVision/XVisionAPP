// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'; // You don't need to call getAuth() here, it's imported from config
import { auth } from '../firebaseConfig'; // Import auth from the firebaseConfig
import Icon from 'react-native-vector-icons/Ionicons';


import getUserData from '../services/getData';
import { ScrollView } from 'react-native-gesture-handler';

const HomeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data
    const fetchData = async () => {
      try {
        const data = await getUserData();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData();
      }
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth); // Sign out using the initialized auth object
  };

  // if (loading) {
  //   return (
  //     <View style={styles.center}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //     </View>
  //   );
  // }

  return (
    <View style={styles.center}>
      {userData && (
        <>
          <Text>Hello {userData.information.username}</Text>
          <Text>You are logged in</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      )}
      <View style={styles.appbar}>
        <View style={styles.flexing}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />  
          <Text style={{fontWeight: 'bold'}}>XVision</Text>  
        </View>
        <Icon name="cog" size={40} style={styles.iconcog} color="#000" />
      </View>
      <View>
        <Image source={require('../assets/character/man/man1.png')} style={styles.logo} />
        <Text>Home Screen</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  appbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 10,
    // backgroundColor: '#f00',
    paddingRight: 10,
    paddingVertical: 5,
  },
  flexing:{    
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 40,
    height: 40,
    margin: 5,
    elevation: 4,
  }, 
  iconcog:{
    margin: 5,
    elevation: 4,
  },
  homescreen: {
    // flex: 1,
    backgroundColor: '#f00',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  }

});

export default HomeScreen;
