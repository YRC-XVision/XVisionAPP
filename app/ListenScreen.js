import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Audio ,RecordingOptionsPresets } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system'; // To read the file as base64
import Icon from 'react-native-vector-icons/Ionicons';

const ListenScreen = () => {
  const [recording, setRecording] = useState();
  const [playing, setPlaying] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [sound, setSound] = useState();
  const [transcribedText, setTranscribedText] = useState('');

  Audio.RecordingOptionsPresets.LOW_QUALITY = {
    isMeteringEnabled: true,
    android: {
      extension: '.mp4a',
      sampleRate: 8000,
      numberOfChannels: 1,
      bitRate: 16,
    },
    ios: {
      extension: '.mp4a',
      sampleRate: 8000,
      numberOfChannels: 1,
      bitRate: 16,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 16,
    },
  };
  
  // Start recording
  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  // Stop recording and play the sound
  async function stopRecording() {
    console.log('Stopping recording..');
    if (recording) {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      setRecording(undefined);

      // Convert the recorded file to base64 and send to the Speech-to-Text API
      sendAudioToSTT(uri);
    }
  }

  // Convert audio file to base64
  async function convertAudioToBase64(uri) {
    try {
      const file = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Audio converted to base64');
      return file;
    } catch (error) {
      console.error('Error converting audio to base64:', error);
    }
  }

  // Send audio to Google Speech-to-Text API
  async function sendAudioToSTT(uri) {
    try {
      const apiKey = 'CjahHE39GJTqtmHlxXSPHLYFt7zJihnL'; // Replace with your API Key
      const url = 'https://api.aiforthai.in.th/partii-webapi';
  
      // Read the file content from the URI (this should be an mp4a file)
      const audioFile = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64, // Read the file as base64 string
      });
  
      // Create a FormData instance
      const formData = new FormData();
      
      // Append the file content to FormData as a file
      formData.append('audio', {
        uri: uri,
        name: 'audio.mp4a', // Provide a file name with the appropriate extension
        type: 'audio/mp4', // Set the appropriate MIME type for mp4a audio
      });
  
      // Make the POST request with FormData
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set Content-Type as multipart/form-data
          'Apikey': apiKey, // API key in header
        },
      });
  
      // Check if the response contains a transcription
      // ปริ้นท์ทั้งหมดของ JSON response
    console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error during speech-to-text API call:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/background.png')} style={styles.backgroundImage} />
      <View style={styles.overlay}>
        <View style={styles.appbar}>
          <View style={styles.flexing}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />  
            <Text style={{fontWeight: 'bold'}}>XVision</Text>  
          </View>
          <Icon name="cog" size={40} style={styles.iconcog} color="#000" />
        </View>

        <View style={styles.content}>
          <Text style={styles.scoreText}>คะแนน : <Text style={{color: '#D26741', fontFamily: "KanitMedium", }}>88</Text></Text>

          <View style={styles.speechContainer}>
            <Image source={require('../assets/character/man/man4.png')} style={styles.characterImage} />
            <View style={styles.textBox}>
              <Icon name="play" size={40} style={styles.iconcog} color="#000" />
              <Text style={styles.textBoxText}>กดเพื่อฟัง</Text>
            </View>

          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={recording ? stopRecording : startRecording}
            >
              <Text style={styles.recordButtonText}>{recording ? 'หยุดพูด' : 'เริ่มพูด'}</Text>

              
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Text style={styles.stopButtonText}>หยุดพูด</Text>
            </TouchableOpacity> */}

          <Image source={require('../assets/character/man/man2.png')} style={styles.characterImage} />

          </View>

          

          <View style={styles.outputContainer}>
            <Text style={styles.timeText}>ระยะเวลา : 10 วินาที</Text>
            <Text style={styles.outputText}>{transcribedText}jfhgzdxjfhb;zdjfngb;ldjzsbn;zjdxcfbn;sldxjfgbnzl;dfxgn;ALSKJfvnzjdfnhbgzxjdcfnhb.kxlzdjfn</Text>
          </View>

          <View style={styles.checkContainer}>
            <View style={styles.correctButton}>
              <Text style={styles.checkText}>พูดถูก 8 (คำ)</Text>
            </View>

            <View style={styles.incorrectButton}>
              <Text style={styles.checkText2}>พูดผิด 2 (คำ)</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: "KanitMedium", 
  },
  speechContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  characterImage: {
    width: 150,
    height: 150,
  },
  textBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: 175,
    elevation: 4,
  },
  textBoxText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#D26741',
    padding: 15,
    paddingHorizontal: 35,
    margin: 'auto',
    borderRadius: 8,


    // height:18,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: "KanitMedium",
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  outputContainer: {
    // height: '100%',
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  timeText: {
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 'bold',
  },
  outputText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  correctButton: {
    backgroundColor: '#D26741',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    fontFamily: "KanitMedium", 
  },
  incorrectButton: {
    backgroundColor: '#FFFFFFFF',
    borderWidth: 3,
    borderColor: '#D26741',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    fontFamily: "KanitMedium",
  },
  checkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: "KanitMedium", 
    textAlign: 'center',
  },checkText2: {
    color: '#D26741',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: "KanitMedium", 
    textAlign: 'center',
  },appbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 10,
    // backgroundColor: '#f00',
    paddingRight: 10,
    paddingVertical: 5,
  },flexing:{    
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 40,
    height: 40,
    margin: 5,
    elevation: 4,
  }, iconcog:{
    margin: 5,
    elevation: 4,
  },
});

export default ListenScreen;