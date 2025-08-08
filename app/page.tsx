"use client"

import React, { useState } from 'react';
import { Camera } from 'lucide-react';

// Emotions data
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

// Type definitions
interface CameraComponentProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
}

interface AnalysisResult {
  emotion: string;
  confidence: number;
  feedback: string;
}

// Separate Camera component to isolate camera functionality
const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, isProcessing }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    setError('');
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Request camera access
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      setStream(newStream);
      setCameraActive(true);
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions and try again.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !cameraActive) return;
    
    try {
      // Create canvas and draw video frame
      const canvas = document.createElement('canvas');
      
      // Get video dimensions
      const videoWidth = videoRef.current.videoWidth || 640;
      const videoHeight = videoRef.current.videoHeight || 480;
      
      // Set canvas size to match video
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Draw the video frame to the canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Try different image formats if needed
      let imageData;
      try {
        // First try JPEG with lower quality to ensure compatibility
        imageData = canvas.toDataURL('image/jpeg', 0.8);
      } catch (e) {
        console.warn('JPEG capture failed, trying PNG:', e);
        // Fallback to PNG if JPEG fails
        try {
          imageData = canvas.toDataURL('image/png');
        } catch (e2) {
          console.warn('PNG capture failed, trying without format specification:', e2);
          // Last resort - try without format specification
          imageData = canvas.toDataURL();
        }
      }
      
      console.log('Image captured successfully, size:', Math.round(imageData.length / 1024), 'KB');
      console.log('Image format prefix:', imageData.substring(0, 30));
      
      // Very basic validation - just check if it's a data URL
      if (!imageData.startsWith('data:')) {
        throw new Error('Invalid image format generated');
      }
      
      onCapture(imageData);
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image. Please try a different browser or device.');
    }
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="camera-container">
      {error && (
        <div className="alert alert-danger mb-3">
          {error}
        </div>
      )}
      
      <div className="position-relative" style={{ minHeight: "300px", backgroundColor: "#000", borderRadius: "0.375rem" }}>
        {cameraActive ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-100 h-100 rounded"
              style={{ minHeight: "300px", objectFit: "cover" }}
            />
            <div className="position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-between">
              <button 
                onClick={stopCamera}
                className="btn btn-outline-light"
              >
                Stop Camera
              </button>
              <button 
                onClick={captureImage}
                disabled={isProcessing}
                className={`btn btn-primary ${isProcessing ? 'opacity-50' : ''}`}
              >
                <Camera className="me-2" />
                {isProcessing ? 'Processing...' : 'Capture'}
              </button>
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <button 
              onClick={startCamera}
              className="btn btn-primary btn-lg"
            >
              <Camera className="me-2" />
              Start Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component
const MirrorMatch = () => {
  const [currentEmotion, setCurrentEmotion] = useState(emotions[0]);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true);
    setFeedback('Analyzing your expression...');
    
    try {
      console.log('Sending image for analysis...');
      
      // Send image to API for analysis
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('API error response:', responseData);
        throw new Error(responseData.error || 'Failed to analyze emotion');
      }
      
      console.log('Analysis result:', responseData);
      
      // Process results
      setAiAnalysis(responseData);
      provideFeedback(responseData);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setFeedback('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const provideFeedback = (result: AnalysisResult) => {
    // If AI analysis provided helpful feedback, use it
    if (result.feedback) {
      setFeedback(result.feedback);
    }
    
    // Check if detected emotion matches target emotion
    if (result.emotion === currentEmotion.name) {
      if (result.confidence > 0.7) {
        setFeedback(currentEmotion.feedback.success);
        setStreak(prev => prev + 1);
      } else if (result.confidence > 0.4) {
        setFeedback(currentEmotion.feedback.partial);
      } else {
        setFeedback(currentEmotion.feedback.hint);
      }
    } else {
      // If detected emotion doesn't match target
      setFeedback(`I see you're showing "${result.emotion}" - try to show "${currentEmotion.name}" instead! ${currentEmotion.feedback.hint}`);
    }
  };

  const handleNewEmotion = () => {
    const nextEmotion = emotions[(emotions.findIndex(e => e.name === currentEmotion.name) + 1) % emotions.length];
    setCurrentEmotion(nextEmotion);
    setFeedback('');
    setAiAnalysis(null);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="card mb-4">
        <div className="card-body text-center">
          <h1 className="display-5 fw-bold">
            Mirror Match
            <span className="ms-2" role="img" aria-label="mirror">🪞</span>
          </h1>
        </div>
      </div>

      <div className="row g-4">
        {/* Left side - Emotion to mimic */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header text-center">
              <h5 className="card-title mb-0">Target Emotion</h5>
            </div>
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
              <div 
                style={{ fontSize: '8rem', lineHeight: 1.2, marginBottom: '1rem' }} 
                className="emoji-target"
                role="img" 
                aria-label={`Target emotion: ${currentEmotion.name}`}
              >
                {currentEmotion.emoji}
              </div>
              <p className="fs-4 fw-bold">{currentEmotion.description}</p>
              <p className="fs-5 text-capitalize mt-3">{currentEmotion.name}</p>
            </div>
          </div>
        </div>

        {/* Right side - Camera */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header text-center">
              <h5 className="card-title mb-0">Your Expression</h5>
            </div>
            <div className="card-body">
              <CameraComponent 
                onCapture={handleCapture} 
                isProcessing={isProcessing} 
              />
              
              {aiAnalysis && (
                <div className="mt-3 small bg-light p-3 rounded">
                  <div className="fw-bold">AI Analysis:</div>
                  <div>
                    Detected: <span className="fw-bold text-capitalize">{aiAnalysis.emotion}</span> 
                    ({Math.round(aiAnalysis.confidence * 100)}% confidence)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="card mt-4">
        <div className="card-body">
          {feedback && (
            <div className={`alert ${aiAnalysis?.emotion === currentEmotion.name && aiAnalysis.confidence > 0.7 ? 'alert-success' : 'alert-info'} mb-3`}>
              {feedback}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center">
            <div 
              className="fs-5"
              role="status" 
              aria-label={`Current streak: ${streak}`}
            >
              Streak: <span className="fw-bold">{streak}</span> {streak > 0 && '🔥'}
            </div>
            <button
              onClick={handleNewEmotion}
              className="btn btn-lg px-4"
              style={{ backgroundColor: '#8a2be2', color: 'white' }}
              aria-label="Try next emotion"
            >
              Next Emotion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MirrorMatch;
