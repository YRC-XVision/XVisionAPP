import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const ReadScreen = () => {
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [message, setMessage] = useState('ฉันหิวข้าว');
  const [answer, setAnswer] = useState('');
  const [messageArray, setMessageArray] = useState([]);
  const [answerArray, setAnswerArray] = useState([]);
  const [correctWord, setCorrectWord] = useState(0);
  const [incorrectWord, setInCorrectWord] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState(null);

  const sentences = [
    "ฉันหิวข้าว",
    "ฉันชอบไปเที่ยว",
    "ปวดหลัง"
  ];

  useEffect(() => {
    // Initialize first question
    handleRandomWord();
    
    // Cleanup timer on unmount
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const handleRandomWord = () => {
    const word = getRandomWord(sentences);
    if (word) {
      setMessage(word);
      createQuest(word);
      // Reset states for new word
      setAnswer('');
      setAnswerArray([]);
    }
  };

  const getRandomWord = (array) => {
    return array.length > 0 ? array[Math.floor(Math.random() * array.length)] : null;
  };

  const createQuest = async (text) => {
    try {
      const apiKey = 'CjahHE39GJTqtmHlxXSPHLYFt7zJihnL';
      const url = `https://api.aiforthai.in.th/tlexplus?text=${encodeURIComponent(text)}`;
      
      const response = await axios.get(url, {
        headers: {
          'Apikey': apiKey,
        },
      });

      if (response.data && response.data.tokens) {
        setMessageArray(response.data.tokens);
        console.log('Quest words:', response.data.tokens);
      }
    } catch (error) {
      console.error('Error creating quest:', error);
    }
  };

  const cutAnswer = async (text) => {
    try {
      const apiKey = 'CjahHE39GJTqtmHlxXSPHLYFt7zJihnL';
      const url = `https://api.aiforthai.in.th/tlexplus?text=${encodeURIComponent(text)}`;
      
      const response = await axios.get(url, {
        headers: {
          'Apikey': apiKey,
        },
      });

      if (response.data && response.data.tokens) {
        setAnswerArray(response.data.tokens);
        return response.data.tokens;
      }
    } catch (error) {
      console.error('Error cutting answer:', error);
      return [];
    }
  };

  const checkAnswer = async (answerWords) => {
    if (!messageArray.length || !answerWords.length) {
      console.log('No data to check');
      return null;
    }

    let correctCount = 0;
    answerWords.forEach(word => {
      if (messageArray.includes(word)) {
        correctCount++;
      }
    });

    const totalWords = messageArray.length;
    const newIncorrectWords = totalWords - correctCount;

    setCorrectWord(prev => prev + correctCount);
    setInCorrectWord(prev => prev + newIncorrectWords);

    return {
      correctCount,
      totalWords,
      accuracy: ((correctCount / totalWords) * 100).toFixed(2)
    };
  };

  const startRecording = async () => {
    try {
      if (permissionResponse.status !== 'granted') {
        const permission = await requestPermission();
        if (permission.status !== 'granted') return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      
      // Start timer
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimer(intervalId);

    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Stop timer
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      await sendAudioToSTT(uri);
      
      setRecording(undefined);
      setRecordingTime(0);

    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const sendAudioToSTT = async (uri) => {
    try {
      const apiKey = 'CjahHE39GJTqtmHlxXSPHLYFt7zJihnL';
      const url = 'https://api.aiforthai.in.th/partii-webapi';

      const formData = new FormData();
      formData.append('wavfile', {
        uri: uri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      });

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Apikey': apiKey,
        },
      });

      if (response.data && response.data.message) {
        const results = response.data.message.map(item => item.result);
        const resultText = results.join('').replace(/\s+/g, '');
        setAnswer(resultText);

        const answerWords = await cutAnswer(resultText);
        if (answerWords.length) {
          const result = await checkAnswer(answerWords);
          console.log('Check result:', result);

          // random
          handleRandomWord();
        }
      }

    } catch (error) {
      console.error('Error in speech-to-text:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/background.png')} style={styles.backgroundImage} />
      <View style={styles.overlay}>
        <View style={styles.appbar}>
          <View style={styles.flexing}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <Text style={styles.logoText}>XVision</Text>
          </View>
          <Icon name="cog" size={40} color="#000" />
        </View>

        <View style={styles.content}>
          <Text style={styles.scoreText}>
            คะแนน : <Text style={styles.scoreValue}>{correctWord}</Text>
          </Text>

          <View style={styles.speechContainer}>
            <Image source={require('../assets/character/man/man4.png')} style={styles.characterImage} />
            <View style={styles.textBox}>
              <Text style={styles.textBoxText}>{message}</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? 'หยุดพูด' : 'เริ่มพูด'}
              </Text>
            </TouchableOpacity>

            <Image source={require('../assets/character/man/man2.png')} style={styles.characterImage} />
          </View>

          <View style={styles.outputContainer}>
            <Text style={styles.timeText}>ระยะเวลา : {recordingTime} วินาที</Text>
            <Text style={styles.outputText}>{answer}</Text>
          </View>

          <View style={styles.checkContainer}>
            <TouchableOpacity style={styles.correctButton} onPress={handleRandomWord}>
              <Text style={styles.checkText}>พูดถูก {correctWord} (คำ)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.incorrectButton}>
              <Text style={styles.checkText}>พูดผิด {incorrectWord} (คำ)</Text>
            </TouchableOpacity>
          </View>
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
  },
  appbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  flexing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  scoreText: {
    fontSize: 24,
    fontFamily: 'KanitMedium',
    textAlign: 'center',
  },
  scoreValue: {
    color: '#D26741',
    fontFamily: 'KanitMedium',
  },
  speechContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  characterImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  textBox: {
    backgroundColor: 'rgba(250, 250, 250, 0.7)',
    padding: 15,
    borderRadius: 10,
    marginLeft: 20,
    minWidth: 200,
  },
  textBoxText: {
    fontFamily: 'KanitMedium',
    fontSize: 18,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
  },
  recordButton: {
    backgroundColor: '#D26741',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  recordButtonText: {
    color: '#fff',
    fontFamily: 'KanitMedium',
    fontSize: 18,
  },
  outputContainer: {
    marginVertical: 20,
  },
  timeText: {
    fontFamily: 'KanitMedium',
    fontSize: 18,
    marginBottom: 10,
  },
  outputText: {
    fontFamily: 'KanitMedium',
    fontSize: 18,
  },
  checkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  correctButton: {
    backgroundColor: '#46B800',
    padding: 15,
    borderRadius: 10,
    flex: 0.45,
  },
  incorrectButton: {
    backgroundColor: '#D53939',
    padding: 15,
    borderRadius: 10,
    flex: 0.45,
  },
  checkText: {
    color: '#fff',
    fontFamily: 'KanitMedium',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ReadScreen;