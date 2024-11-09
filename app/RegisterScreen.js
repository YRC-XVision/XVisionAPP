import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { registerWithEmailAndPassword } from '../services/authService';
// import { Picker } from '@react-native-picker/picker';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);

  const handleSignUp = async () => {
    // Check if fields are empty
    if (!email || !username || !gender || !age || !password || !confirmPassword) {
      Alert.alert("Error", "กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert("Error", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    // Check password length
    if (password.length < 6) {
      Alert.alert("Error", "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    try {

      console.log(email);
      console.log(password)

      // Attempt registration
      const status = await registerWithEmailAndPassword({
        email:email,
        username:username,
        gender:gender,
        age:age,
        password:password

      }
      );
      if (status === 'successful') {
        Alert.alert("สำเร็จ", "สมัครสมาชิกสำเร็จ");
        navigation.navigate('AuthCheck'); // Redirect to AuthCheck screen after registration
      } else {
        Alert.alert("เกิดข้อผิดพลาด1", status);
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด2", error.message);
    }
  };


  return (
    <KeyboardAvoidingView contentContainerStyle={styles.container} style={styles.container}>
      <Image source={require('../assets/background.png')} style={styles.backgroundImage} />
      <View style={styles.formContainer}>
        <Text style={styles.title}>สมัครสมาชิก</Text>

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
            placeholder="ชื่อผู้ใช้"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.row}>
          {/* <Picker
            selectedValue={gender}
            style={styles.picker}
            onValueChange={(itemValue) => setGender(itemValue)}
          >
            <Picker.Item label="ชาย" value="ชาย" />
            <Picker.Item label="หญิง" value="หญิง" />
            <Picker.Item label="อื่นๆ" value="อื่นๆ" />
          </Picker> */}
          <RNPickerSelect
            placeholder={{ label: 'เลือกเพศ', value: null }}
            onValueChange={(value) => setGender(value)}
            value={gender}
            items={[
              { label: 'ชาย', value: 'ชาย' },
              { label: 'หญิง', value: 'หญิง' },
              { label: 'อื่นๆ', value: 'อื่นๆ' },
            ]}
            style={{
              inputIOS: {
                width: 140,
                backgroundColor: '#fff',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginVertical: 10,
                elevation: 4,
                fontSize: 16,
                color: '#000',
              },
              inputAndroid: {
                width: 140,
                backgroundColor: '#fff',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginVertical: 10,
                elevation: 4,
                fontSize: 16,
                color: '#000',
              },
              placeholder: {
                color: '#999',
              },
            }}
            useNativeAndroidPickerStyle={false} // This will disable the default Android picker style
          />


          <View style={{

            width: 140,
            color: '#000',
            backgroundColor: '#fff',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 8,
            marginVertical: 10,
            elevation: 4,
          }}>
            <TextInput
              style={styles.inputSmall}
              placeholder="อายุ"
              placeholderTextColor="#999"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="ยืนยันรหัสผ่าน"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Text>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>สมัครสมาชิก</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.loginText}>เข้าสู่ระบบ?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
  inputSmall: {
    fontSize: 16,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 300,
  },
  picker: {
    width: 140,
    height: 50,
  },
  togglePassword: {
    color: '#007bff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#d26741',
    borderRadius: 8,
    paddingHorizontal: 50,
    paddingVertical: 10,
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  loginText: {
    fontSize: 16,
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  socialLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
  },
});

export default RegisterScreen;