import React, { useState } from 'react';
import { Camera } from 'lucide-react';

const MirrorMatchDemo = () => {
  // Sample emotions from the app
  const emotions = [
    { name: 'happy', emoji: '😊', description: 'Show your biggest smile!' },
    { name: 'sad', emoji: '😢', description: 'Turn your smile upside down' },
    { name: 'mad', emoji: '😠', description: 'Make an angry face' },
    { name: 'scared', emoji: '😨', description: 'Show me your scared face' }
  ];
  
  const [currentEmotion, setCurrentEmotion] = useState(emotions[0]);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);
  
  const startCamera = () => {
    setCameraActive(true);
  };
  
  const captureImage = () => {
    setAnalyzing(true);
    setFeedback('Analyzing your expression...');
    
    // Simulate analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
      // For the demo, let's assume success
      setFeedback("Wonderful smile! Your happiness is contagious! 🌟");
      setStreak(prev => prev + 1);
    }, 1500);
  };
  
  const handleNextEmotion = () => {
    const nextIndex = (emotions.findIndex(e => e.name === currentEmotion.name) + 1) % emotions.length;
    setCurrentEmotion(emotions[nextIndex]);
    setFeedback('');
    setAnalyzed(false);
  };
  
  return (
    <div className="flex flex-col p-4 gap-4 max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-4 text-center">
        <h1 className="text-2xl font-bold">
          Mirror Match
          <span className="ml-2" role="img" aria-label="mirror">🪞</span>
        </h1>
        <p className="text-gray-600">Interactive facial emotion recognition game</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - Emotion to mimic */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b p-2 text-center bg-gray-50">
            <h5 className="font-medium">Target Emotion</h5>
          </div>
          <div className="p-6 flex flex-col justify-center items-center text-center">
            <div 
              style={{ 
                fontSize: '8rem', 
                lineHeight: 1.2, 
                marginBottom: '1rem',
                animation: 'pulse 2s infinite',
              }} 
              role="img" 
              aria-label={`Target emotion: ${currentEmotion.name}`}
            >
              {currentEmotion.emoji}
            </div>
            <p className="text-xl font-bold">{currentEmotion.description}</p>
            <p className="text-lg capitalize mt-3">{currentEmotion.name}</p>
          </div>
        </div>

        {/* Right side - Camera */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b p-2 text-center bg-gray-50">
            <h5 className="font-medium">Your Expression</h5>
          </div>
          <div className="p-4">
            <div className="relative bg-black rounded-lg" style={{ minHeight: "300px" }}>
              {cameraActive ? (
                <>
                  <div className="w-full h-full min-h-[300px] rounded-lg bg-gray-800 flex items-center justify-center">
                    <img 
                      src="/api/placeholder/400/320"
                      alt="Camera preview" 
                      className="object-cover h-full w-full rounded-lg opacity-80"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between">
                    <button 
                      onClick={() => setCameraActive(false)}
                      className="bg-transparent text-white border border-white rounded px-3 py-1"
                    >
                      Stop Camera
                    </button>
                    <button 
                      onClick={captureImage}
                      disabled={analyzing}
                      className={`bg-blue-500 text-white rounded px-3 py-1 flex items-center ${analyzing ? 'opacity-50' : ''}`}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {analyzing ? 'Processing...' : 'Capture'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-center h-full min-h-[300px]">
                  <button 
                    onClick={startCamera}
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Start Camera
                  </button>
                </div>
              )}
            </div>
            
            {analyzed && (
              <div className="mt-3 text-sm bg-gray-100 p-3 rounded">
                <div className="font-bold">AI Analysis:</div>
                <div>
                  Detected: <span className="font-bold capitalize">{currentEmotion.name}</span> 
                  (85% confidence)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="bg-white shadow rounded-lg p-4">
        {feedback && (
          <div className={`p-3 rounded mb-3 ${analyzed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {feedback}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div 
            className="text-lg"
            role="status" 
            aria-label={`Current streak: ${streak}`}
          >
            Streak: <span className="font-bold">{streak}</span> {streak > 0 && '🔥'}
          </div>
          <button
            onClick={handleNextEmotion}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#8a2be2' }}
            aria-label="Try next emotion"
          >
            Next Emotion
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-4 text-sm text-gray-600">
        <p className="mb-2"><strong>How it works:</strong></p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Select an emotion to mimic from the prompts</li>
          <li>Start your webcam and make the expression</li>
          <li>Capture your facial expression with the camera button</li>
          <li>The image is sent to Claude Vision AI for analysis</li>
          <li>Receive feedback on how well you matched the emotion</li>
          <li>Build a streak by successfully matching emotions</li>
        </ol>
      </div>
    </div>
  );
};

export default MirrorMatchDemo;
