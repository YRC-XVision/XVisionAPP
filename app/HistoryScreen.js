// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Image, TouchableOpacity,TouchableWithoutFeedback, Animated } from 'react-native';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'; // You don't need to call getAuth() here, it's imported from config
import { auth } from '../firebaseConfig'; // Import auth from the firebaseConfig
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';



import getUserData from '../services/getData';
import { ScrollView } from 'react-native-gesture-handler';




const HistoryScreen = () => {
    

const navigation = useNavigation();

  return (
    <View style={styles.center}>
      
      <Image source={require('../assets/background.png')} style={styles.backgroundImage} />
      {/* {userData && (
        <>
          <Text>Hello {userData.information.username}</Text>
          <Text>You are logged in</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      )} */}
      <View style={styles.appbar}>
        <View style={styles.flexing}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />  
      <Text style={{fontWeight: 'bold',fontFamily: "KanitMedium",fontSize: 18,}}>XVision</Text>  
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
            <Icon name="chevron-back" size={40} color="#000" />
          </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
    width: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  charactoer:{
    width: 250,
    height: 250,
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
  ,loginButton: {
    borderRadius: 100,
    paddingHorizontal: 50,
    paddingVertical: 17,
    marginVertical: 10,
    backgroundColor: '#D26741'
  },loginButton2: {
    borderRadius: 100,
    paddingHorizontal: 50,
    paddingVertical: 17,
    marginVertical: 10,
    backgroundColor: '#F17F55FF'
  },
  loginButtonText2: {
    fontFamily: "KanitMedium",
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFFFF', // Text color for the button
    
  },
  floaticon: {
    position: 'absolute',
    left: -35,
    top: '15%',
    gap: 12,
  },
  floaticon2: {
    backgroundColor: '#EF9474',
    borderRadius: 12,
    // padding: 1,
    paddingLeft: 55,
    paddingRight: 10,
    elevation: 4
  },
  floaticon3: {
    backgroundColor: '#D26741',
    borderRadius: 12,
    // padding: 1,
    paddingLeft: 55,
    paddingRight: 10,
    elevation: 4
  }

});

export default HistoryScreen;
