import React, { useState, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { sendPrompt, getNext } from '../helpers/apiUtils';
import { textToSpeech } from '../helpers/textToSpeech';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Snackbar, 
  IconButton,
  InputAdornment
} from '@mui/material';
import '../App.css';
import gifImage from '../assets/teddy.png'; // Import your video

import SideWindow from './SideWindow';


function RecipeForm() {
    
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    
    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    const [res, setRes] = useState("");
    const [list, setList] = useState([]);

    const [img, setImg] = useState("");

    useEffect(() => {
        if(transcript.toLowerCase().includes('next')) {
            console.log(transcript);
            resetTranscript();
            getNext().then(response => {
                console.log('Response from backend:', response);
                textToSpeech(response.response);
                setRes(response.response);
                setList([...list, response.response]);
            }).catch(error => {
                console.error('Error getting next:', error);
            });
        }
        if(transcript.toLowerCase().includes('stop')) {
            console.log(transcript);
            SpeechRecognition.stopListening();
            resetTranscript();
        }

        if (transcript.toLowerCase().includes('send')) {
            console.log(transcript); // Logic for sending to backend.
            let copy = transcript;
            resetTranscript();
            sendPrompt(copy).then(response => {
                console.log('Response from backend:', response);
                textToSpeech(response.response);
                setRes(response.response);
                if (response.flag === "alternate"){
                    let tempList = [...list];
                    tempList.pop();
                    setList([...tempList, response.response]);
                    setImg("");
                }
                else if(response.flag === "image"){
                    setList([response.response]); // buggy line
                    setImg(response["image_url"]);
                }
                else{
                    setList([response.response]);
                    setImg("");
                }
            }).catch(error => {
                console.error('Error sending prompt:', error);
            });
        }
    }, [transcript]);


  const [recipe, setRecipe] = useState({
    name: '',
    prepTime: '',
    servings: '',
    ingredients: '',
    instructions: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false); // State to control vibration class

  const [isListening, setIsListening] = useState(false);
  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
    textToSpeech("Microphone is on");
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    textToSpeech("Microphone is off");
  };

  // Sync the local state with the SpeechRecognition listening state
  useEffect(() => {
    setIsListening(listening); // Update the vibration state based on `listening`
  }, [listening]);

return (
    // <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#ffffff' }}>
    //   {/* Content Area */}
    //   <Box sx={{ flex: 1, p: 4 }}>
    //     <Paper elevation={3} sx={{ maxWidth: 800, width: '100%', mx: 'auto', p: 4, borderRadius: 4 }}>
    //       {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}> */}
    //       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 4 }}>
    //         {/* <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
    //           Your Personalized Recipe
    //         </Typography> */}
    //         <img
    //     src={gifImage} // Path to your GIF
    //     alt="Descriptive Text"
    //     style={{ width: '50%' }} // Optional styling
    //     className={isListening ? 'vibrate' : ''} // Add 'vibrate' class if listening
    //     onClick={() => {
    //       if (listening) {
    //         stopListening(); // Stop listening and stop vibration
    //       } else {
    //         startListening(); // Start listening and start vibration
    //       }
    //     }}
    //   />
    //         {/* <RestaurantMenuIcon sx={{ fontSize: 60, color: '#4caf50' }} /> */}
    //     <TextField
    //       fullWidth
    //       placeholder="What can I help you cook?"
    //       variant="outlined"
    //       value={transcript}
    //       sx={{ backgroundColor: '#ffffff', borderRadius: 10 }}
    //     />
    //     <Button variant="contained" color="success" fullWidth sx={{ mb: 1 }}>
    //       Need ideas for meals?
    //     </Button>
    //       </Box>
    //       <Snackbar
    //         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    //         open={snackbarOpen}
    //         autoHideDuration={6000}
    //         onClose={() => setSnackbarOpen(false)}
    //         message="Recipe submitted successfully!"
    //       />
    //     </Paper>
    //   </Box>
    //   {res.length > 0 && <SideWindow props={res} setRes={setRes} />}
    // </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
    <Paper elevation={3} sx={{ maxWidth: 800, width: '100%', mx: 'auto', p: 4, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 4 }}>
            <img
                src={gifImage}
                alt="Descriptive Text"
                style={{ width: '50%' }}
                className={isListening ? 'vibrate' : ''}
                onClick={() => {
                    if (listening) {
                        stopListening();
                    } else {
                        startListening();
                    }
                }}
            />
            <TextField
                fullWidth
                placeholder="What can I help you cook?"
                variant="outlined"
                value={transcript}
                sx={{ backgroundColor: '#ffffff', borderRadius: 10 }}
            />
            <Button variant="contained" color="success" fullWidth sx={{ mb: 1 }}>
                Need ideas for meals?
            </Button>
        </Box>
        {/* <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={res.length > 0}
            autoHideDuration={6000}
            onClose={() => setRes('')}
            message="Recipe submitted successfully!"
        /> */}
    </Paper>
    {list.length > 0 && <SideWindow list={list} setRes={setRes} img = {img} />}
</Box>
);
}

export default RecipeForm;