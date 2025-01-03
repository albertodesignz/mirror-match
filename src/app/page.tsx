"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const emotions = [
  {
    name: 'happy', 
    emoji: '😊', 
    description: 'Show your biggest smile!',
    feedback: {
      success: "Wonderful smile! Your happiness is contagious! 🌟",
      partial: "Almost there! Try making your smile bigger 😊",
      hint: "Think of something that makes you really happy!"
    }
  },
  { 
    name: 'sad', 
    emoji: '😢', 
    description: 'Turn your smile upside down',
    feedback: {
      success: "Great expression! You showed feeling sad very well 💙",
      partial: "Getting closer! Try turning down the corners of your mouth more 😢",
      hint: "Think about a rainy day when you couldn't play outside"
    }
  },
  { 
    name: 'mad', 
    emoji: '😠', 
    description: 'Make an angry face',
    feedback: {
      success: "Wow! That's a powerful angry face! 💪",
      partial: "Almost there! Try furrowing your eyebrows more 😠",
      hint: "Think about something that really bothers you!"
    }
  },
  { 
    name: 'scared', 
    emoji: '😨', 
    description: 'Show me your scared face',
    feedback: {
      success: "Perfect scared face! You're getting so good at this! 🌟",
      partial: "Close! Try opening your eyes wider to show surprise 😨",
      hint: "Imagine seeing a friendly ghost that startled you!"
    }
  }
];

const MirrorMatch = () => {
  const [currentEmotion, setCurrentEmotion] = useState(emotions[0]);
  const [showCamera, setShowCamera] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [imageCapture, setImageCapture] = useState<ImageCapture | undefined>(undefined);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        setImageCapture(new ImageCapture(track));
        setShowCamera(true);
        setPermissionDenied(false);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setPermissionDenied(true);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = async () => {
    if (!imageCapture || isProcessing) return;
    setIsProcessing(true);
    try {
      await imageCapture.grabFrame();
      await new Promise(resolve => setTimeout(resolve, 1000));
      const matchScore = Math.random();
      provideFeedback(matchScore);
    } catch (error) {
      console.error('Error capturing frame:', error);
      setFeedback('Oops! Something went wrong. Let\'s try again!');
    }
    setIsProcessing(false);
  };

  const provideFeedback = (matchScore: number) => {
    if (matchScore > 0.8) {
      setFeedback(currentEmotion.feedback.success);
      setStreak(prev => prev + 1);
    } else if (matchScore > 0.5) {
      setFeedback(currentEmotion.feedback.partial);
    } else {
      setFeedback(currentEmotion.feedback.hint);
    }
  };

  const handleNewEmotion = () => {
    const nextEmotion = emotions[(emotions.findIndex(e => e.name === currentEmotion.name) + 1) % emotions.length];
    setCurrentEmotion(nextEmotion);
    setFeedback('');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4" role="main" aria-label="Mirror Match emotion learning game">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            <div className="transition-transform duration-500 hover:scale-105">
              Mirror Match
              <span className="ml-2" role="img" aria-label="mirror">🪞</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2 transition-all duration-300">
            <div 
              className="text-6xl" 
              role="img" 
              aria-label={`Target emotion: ${currentEmotion.name}`}
            >
              {currentEmotion.emoji}
            </div>
            <p className="text-xl font-medium">{currentEmotion.description}</p>
          </div>

          <div className="space-y-4">
            {permissionDenied && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription>
                  Camera access is needed to play. Please enable camera permissions and refresh the page.
                </AlertDescription>
              </Alert>
            )}

            {showCamera ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 rounded-lg object-cover"
                  aria-label="Camera preview"
                />
                <button
                  onClick={captureFrame}
                  disabled={isProcessing}
                  className={`absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors ${isProcessing ? 'opacity-50' : ''}`}
                  aria-label="Capture expression"
                >
                  <Camera className={`w-6 h-6 ${isProcessing ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            ) : (
              <button
                onClick={setupCamera}
                className="w-full bg-blue-500 text-white p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors"
                aria-label="Start camera"
              >
                <Camera className="w-6 h-6" />
                <span>Start Camera</span>
              </button>
            )}

            {feedback && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription>{feedback}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between items-center">
              <div 
                className="text-sm text-gray-600"
                role="status" 
                aria-label={`Current streak: ${streak}`}
              >
                Streak: {streak} {streak > 0 && '🔥'}
              </div>
              <button
                onClick={handleNewEmotion}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                aria-label="Try next emotion"
              >
                Next Emotion
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MirrorMatch;
