import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loginWithEmailAndPassword } from '../services/authService';
import { signOut } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Import the initialized auth instance

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Use the initialized `auth` instance from your firebaseConfig
      console.log("User signed out successfully");
      Alert.alert("Logged Out", "You have been signed out.");
      navigation.navigate("LoginScreen"); // Optionally navigate to the login screen or any screen you want
    } catch (error) {
      console.error("Sign-out error:", error);
      Alert.alert("Error", "Unable to sign out. Please try again.");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("เกิดข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      const status = await loginWithEmailAndPassword({email:email, password:password});
      if (status === 'successful') {
        Alert.alert("สำเร็จ", "เข้าสู่ระบบสำเร็จ");
        navigation.navigate('AuthCheck');
      } else {
        Alert.alert("เกิดข้อผิดพลาด", status);
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/background.png')} style={styles.backgroundImage} />
      <View style={styles.overlay}>
        <Text style={styles.title}>เข้าสู่ระบบ</Text>

        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="อีเมล"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="รหัสผ่าน"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Text>{showPassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
            <Text style={styles.registerText}>สมัครสมาชิก?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
            <Text style={styles.registerText}>Debuging1?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ReadScreen")}>
            <Text style={styles.registerText}>Read?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ListenScreen")}>
            <Text style={styles.registerText}>Listen</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignOut}>
  <Text style={styles.registerText}>Logout</Text>
</TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: "KanitMedium",
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 50,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 10,
    elevation: 4,
  },
  input: {
    fontSize: 16,
    color: '#000',
    fontFamily: "KanitMedium",
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  loginButton: {
    borderRadius: 8,
    paddingHorizontal: 50,
    paddingVertical: 10,
    marginVertical: 20,
    backgroundColor: '#D26741'
  },
  loginButtonText: {

    fontFamily: "KanitMedium",
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFFFF', // Text color for the button
    
  },
  registerText: {
    fontFamily: "KanitMedium",
    fontSize: 16,
    color: '#fff',
  },
});

export default LoginScreen;
