import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';

const ListenScreen = () => {
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
  const [gameTimer, setGameTimer] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const sentences = [
    "ฉันหิวข้าว",
    "ฉันชอบไปเที่ยว",
    "ปวดหลัง"
  ];

  // Initialize game and handle random word
  useEffect(() => {
    handleRandomWord();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // Game timer management
  useEffect(() => {
    let intervalId;
    
    if (isGameStarted && !isGameOver) {
      intervalId = setInterval(() => {
        setGameTimer(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGameStarted, isGameOver]);

  const listen = async (text) => {
    try {
      const url = 'https://api-voice.botnoi.ai/openapi/v1/generate_audio';
      const apiKey = 'M0ZJT1lRQWphRU1QeVpFN1Q0VnZJT05lMUxpMTU2MTg5NA==';
      
      const data = {
        "text": text,
        "speaker": "1",
        "volume": 3,
        "speed": 1,
        "type_media": "mp3",
        "save_file": "true",
      };
  
      const options = {
        method: 'POST',
        url: url,
        headers: {
          'Botnoi-Token': apiKey,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(data),
      };
  
      const response = await axios(options);
  
      if (response.data && response.data.audio_url) {
        try {
          const url = response.data.audio_url;
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
          const { sound: playbackObject } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: true }
          );
  
          // Ensure playbackObject is set correctly
          if (playbackObject) {
            playbackObject.setOnPlaybackStatusUpdate((status) => {
              if (status.didJustFinish) {
                console.log('Playback finished');
              }
            });
          }
  
          // Handle stopping the playback if needed
          return playbackObject;
  
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      }
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  // Save game history to AsyncStorage
  const saveHistory = async (history) => {
    try {
      const existingHistory = await AsyncStorage.getItem('gameHistory');
      let historyArray = existingHistory ? JSON.parse(existingHistory) : [];
      historyArray.push(history);
      await AsyncStorage.setItem('gameHistory', JSON.stringify(historyArray));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const handleGameOver = async () => {
    setIsGameOver(true);
    setIsGameStarted(false);
    setIsRecording(false);
    
    if (recording) {
      await stopRecording();
    }

    const accuracy = calculateAccuracy();
    const gameHistory = {
      score: correctWord,
      incorrect: incorrectWord,
      accuracy: accuracy,
    };

    await saveHistory(gameHistory);
    
    Alert.alert(
      "หมดเวลา!",
      `ผลคะแนนของคุณ:\n\nคำถูก: ${correctWord} คำ\nคำผิด: ${incorrectWord} คำ\nความแม่นยำ: ${calculateAccuracy()}%`,
      [
        { 
          text: "เล่นใหม่", 
          onPress: () => {
            startNewGame();
          }
        }
      ]
    );
  };

  const calculateAccuracy = () => {
    const totalAttempts = correctWord + incorrectWord;
    if (totalAttempts === 0) return 0;
    return ((correctWord / totalAttempts) * 100).toFixed(1);
  };

  const startNewGame = () => {
    setIsGameOver(false);
    setIsGameStarted(true);
    setGameTimer(60);
    setCorrectWord(0);
    setInCorrectWord(0);
    setAnswer('');
    handleRandomWord();
  };

  const handleRandomWord = () => {
    const word = getRandomWord(sentences);
    if (word) {
      setMessage(word);
      createQuest(word);
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

    if (correctCount > 0) {
      Alert.alert(
        "ดีมาก!",
        `คุณพูดถูก ${correctCount} คำ`,
        [{ text: "ต่อไป", style: "default" }],
        { cancelable: true }
      );
    }

    return {
      correctCount,
      totalWords,
      accuracy: ((correctCount / totalWords) * 100).toFixed(2)
    };
  };

  const startRecording = async () => {
    try {
      if (!isGameStarted) {
        startNewGame();
      }

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
      if (!recording) return;  // Ensure recording exists before stopping
  
      if (timer) {
        clearInterval(timer);  // Clear the timer
        setTimer(null);         // Reset the timer state
      }
  
      setIsRecording(false);
  
      // Check if the recording has already been unloaded
      if (recording._isRecording) {
        await recording.stopAndUnloadAsync();  // Stop and unload the recording
      }
      
      

      const uri = recording.getURI();  // Get the URI of the recorded audio
      console.log("uri: " + uri);
      await sendAudioToSTT(uri);  // Send the audio to the speech-to-text API
  
      setRecording(undefined);  // Reset the recording state
      setRecordingTime(0);      // Reset the recording time
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const sendAudioToSTT = async (uri) => {
    try {
      const apiKey = 'CjahHE39GJTqtmHlxXSPHLYFt7zJihnL';
      const url = 'https://api.aiforthai.in.th/partii-webapi';

      // const formData = new FormData();
      // formData.append('wavfile', {
      //   uri: uri,
      // });

      const response = await axios.post(url, {
        wavfile: uri,
      }, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Apikey': apiKey
        }
      }
    )

    console.log(response.data)

      if (response.data && response.data.message) {
        const results = response.data.message.map(item => item.result);
        const resultText = results.join('').replace(/\s+/g, '');
        setAnswer(resultText);

        const answerWords = await cutAnswer(resultText);
        if (answerWords.length) {
          const result = await checkAnswer(answerWords);
          handleRandomWord();
        }
      }

    } catch (error) {
      console.error('Error in speech-to-text:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          <Text style={styles.scoreText}>
            คะแนน: <Text style={{color: '#D26741', fontFamily: "KanitMedium"}}>{correctWord}</Text>
            {' '}เวลา: <Text style={{color: '#D26741', fontFamily: "KanitMedium"}}>{gameTimer}</Text>
          </Text>

          <View style={styles.speechContainer}>
            <Image source={require('../assets/character/man/man4.png')} style={styles.characterImage} />
            <TouchableOpacity onPress={() => listen(message)}>
              <View style={styles.textBox}>
                <Icon name="play" size={40} style={styles.iconcog} color="#000" />
                <Text style={styles.textBoxText}>กดเพื่อฟัง</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={recording ? stopRecording : startRecording}
            >
              <Text style={styles.recordButtonText}>
                {recording ? 'หยุดพูด' : 'เริ่มพูด'}
              </Text>
            </TouchableOpacity>
            <Image source={require('../assets/character/man/man2.png')} style={styles.characterImage} />
          </View>

          <View style={styles.outputContainer}>
            <Text style={styles.timeText}>ระยะเวลา: {recordingTime} วินาที</Text>
            <Text style={styles.outputText}>{answer}</Text>
          </View>

          <View style={styles.checkContainer}>
            <View style={styles.correctButton}>
              <Text style={styles.checkText}>พูดถูก {correctWord} (คำ)</Text>
            </View>
            <View style={styles.incorrectButton}>
              <Text style={styles.checkText2}>พูดผิด {incorrectWord} (คำ)</Text>
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