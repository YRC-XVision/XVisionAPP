import useStart
import { Audio } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system'; // To read the file as base64
import { AudioRecorder, AudioUtils } from 'react-native-audio-toolkit'; // Import the audio toolkit

const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [sound, setSound] = useState();
  const [transcribedText, setTranscribedText] = useState('');

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
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
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

      // Compress the audio after recording
    //   compressAudio(uri);  
    sendAudioToSTT(uri)

      console.log('Recording stopped and stored at', uri);
      setRecording(undefined);
    }
  }

  // Send audio to Google Speech-to-Text API
  async function sendAudioToSTT(uri) {
    try {
      const apiKey = 'CjahHE39GJTqtmHlxXSPHLYFt7zJihnL'; // Replace with your API Key
      const url = 'https://api.aiforthai.in.th/partii-webapi';
  
      // Create a FormData instance
      const formData = new FormData();
      
      // Append the file content to FormData as a file
      formData.append('wavfile', {
        uri: uri,
        name: 'audio.m4a', // Provide a file name with the appropriate extension
      });
  
      // Make the POST request with FormData
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set Content-Type as multipart/form-data
          'Apikey': apiKey, // API key in header
        },
      });
  
      // Get the response from the API
      const result = response.data;
      console.log('Transcription response:', result);
      
      // Assuming the API returns a transcribed text field
      if (result && result.transcription) {
        setTranscribedText(result.transcription);
      } else {
        console.error('Transcription not available');
      }

    } catch (error) {
      console.error('Error during speech-to-text API call:', error);
    }
  }

export { startRecording, stopRecording, sendAudioToSTT }