import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av'
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


const ReadScreen = () => {
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [messageArray, setMessageArray] = useState([]);
  const [answerArray, setAnswerArray] = useState([]);
  const [correctWord, setCorrectWord] = useState(0);
  const [incorrectWord, setInCorrectWord] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState(null);
  const [gameTimer, setGameTimer] = useState(60); // Changed to 60 seconds
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [score, setScore] = useState(0)

  const navigation = useNavigation();

  const sentences = [
    "ฉันหิวข้าว",
    "ฉันชอบไปเที่ยว",
    "ปวดหลัง",
    "ฉันกินข้าวแล้ว",
    "ฉันไปเที่ยวมา",
    "ฉันหิวน้ำ",
    "ข้าวมื้อนี้อร่อย",
    "ฉันตื่นเช้า",
    "ฉันตื่นสาย",
    "วันนี้อากาศดี",
    "บ้านหลังนี้เย็น",
    "ฉันจะเดินไปบ้าน",
    "ฉันเหนื่อย",
    "ฉันจะนอน",
    "ฉันกำลังกินข้าว",
    "ฉันปวดหัว",
    "ของชิ้นนี้ราคาเท่าไหร่",
    "เธอชื่ออะไร",
    "วันนี้กินอะไรดี",
    "เธอชอบกินอะไร",
    "วันนี้วันอะไร",
    "ห้องน้ำอยู่ทางไหน",
    "วันนี้วันที่เท่าไหร่",
    "เธอมีร่มไหม",
    "ฝนตกไหม",
    "พรุ่งนี้วันอะไร",
    "คืนนี้เธอนอนกี่โมง",
    "เธออยู่ไหน",
    "เสื้อของใคร",
    "เธอเรียนที่ไหน"
  ];

  useEffect(() => {
    handleRandomWord();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

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

  const handleGameOver = async () => {
    console.log("Final score before game over: " + correctWord);
    
    // Show game over notification with more detailed stats
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
  
    setIsGameOver(true);
    setIsGameStarted(false);
    setIsRecording(false);
    if (recording) {
      await stopRecording();
    }
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

    // Show quick feedback notification
    if (correctCount > 0) {
      Alert.alert(
        "ดีมาก!",
        `คุณพูดถูก ${correctCount} คำ`,
        [{ text: "ต่อไป", style: "default" }],
        { cancelable: true }
      );
    }

    setScore(correctCount);

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
      if (!recording) return;

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

  return (
    <View style={styles.container}>
      <Image source={require('../assets/background.png')} style={styles.backgroundImage} />
      <View style={styles.overlay}>
        <View style={styles.appbar}>
          <View style={styles.flexing}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <Text style={styles.logoText}>XVision</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")} style={styles.loginButton2}>
            <Icon name="chevron-back" size={40} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.timerContainer}>
            <Text style={[
              styles.timerText,
              gameTimer <= 10 && styles.timerWarning
            ]}>
              เวลา: {formatTime(gameTimer)}
            </Text>
          </View>

          <Text style={styles.scoreText}>
            คะแนน: <Text style={styles.scoreValue}>{correctWord}</Text>
          </Text>

          <View style={styles.speechContainer}>
            <Image source={require('../assets/character/man/man4.png')} style={styles.characterImage} />
            <TouchableOpacity onPress={() => {
              listen(message)
            }}>
            <View style={styles.textBox}>
              <Text style={styles.textBoxText}>{message}</Text>
            </View>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.recordButton, 
                isRecording && styles.recordingButton,
                isGameOver && styles.disabledButton
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isGameOver}
            >
              <Text style={styles.recordButtonText}>
                {!isGameStarted ? 'เริ่มเกม' : isRecording ? 'หยุดพูด' : 'เริ่มพูด'}
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
        </ScrollView>
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
    paddingTop:5,
  },
  appbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40
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
  timerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 24,
    fontFamily: 'KanitMedium',
    color: '#000',
  },
  timerWarning: {
    color: '#D53939',
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
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  textBox: {
    backgroundColor: 'rgba(250, 250, 250, 0.7)',
    padding: 15,
    borderRadius: 10,
    marginRight: 20,
    minWidth: 150,
  },
  textBoxText: {
    fontFamily: 'KanitMedium',
    fontSize: 18,
    textAlign: 'center',
    flexWrap: 'wrap',
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
    margin:'auto',
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
    // height: '100%',
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginVertical: 15,
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
    backgroundColor: '#D26741',
    padding: 15,
    borderRadius: 10,
    flex: 0.45,
  },
  incorrectButton: {
    backgroundColor: '#fff',
    borderColor: '#D26741',
    borderWidth:3,
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
  checkText2: {
    color: '#D26741',
    fontFamily: 'KanitMedium',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ReadScreen;