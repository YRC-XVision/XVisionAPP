// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'; // You don't need to call getAuth() here, it's imported from config
import { auth } from '../firebaseConfig'; // Import auth from the firebaseConfig
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';


import getUserData from '../services/getData';
import { ScrollView } from 'react-native-gesture-handler';


const HomeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

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
      
      <Image source={require('../assets/background.png')} style={styles.backgroundImage} />
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
      <Text style={{fontWeight: 'bold',fontFamily: "KanitMedium", }}>XVision</Text>  
        </View>
        <Icon name="cog" size={40} style={styles.iconcog} color="#000" />
      </View>

      <View style={styles.floaticon}>
        <View style={styles.floaticon2} >
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Icon name="basket" size={40} style={styles.iconcog} color="#FFF" />
        </TouchableOpacity>
        </View>

        <View style={styles.floaticon3} >
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Icon name="time-outline" size={40} style={styles.iconcog} color="#FFF" />
        </TouchableOpacity>
        </View>
        {/* <Text>asdasdw</Text> */}
      </View>

      <View>
        <Text style={{textAlign: 'center', fontSize: 25, margin: 20, fontWeight : 'bold', color:'#D26741',fontFamily: "KanitMedium", }}>Nice2250</Text>
        <Image source={require('../assets/character/man/man3.png')} style={styles.charactoer} />
        <Text style={{textAlign: 'center', fontSize: 18, margin: 5, fontWeight : 'bold', color:'#D26741',
    fontFamily: "KanitMedium",}}>ทำการบำบัดแล้ว x ครั้ง</Text>

        <View style={{paddingVertical: 25}}>
          <TouchableOpacity onPress={() => navigation.navigate("ListenScreen")} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>ฝึกพูด</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ReadScreen")} style={styles.loginButton}>
            <Text style={styles.loginButtonText2}>ฝึกอ่าน</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#FFFFFFFF'
  },
  loginButtonText: {
    fontFamily: "KanitMedium",
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#EF9474', // Text color for the button
    
  },loginButtonText2: {
    fontFamily: "KanitMedium",
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#D26741', // Text color for the button
    
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

export default HomeScreen;
