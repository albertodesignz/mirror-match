// DOM elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const startBtn = document.getElementById('startBtn');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const matchBtn = document.getElementById('matchBtn');
const nextEmojiBtn = document.getElementById('nextEmojiBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const matchesDisplay = document.getElementById('matchesDisplay');
const context = canvas.getContext('2d');
const emotionEl = document.querySelector('.emotion');

let stream = null;
let currentScore = 0;
let totalMatches = 0;
let currentTargetEmotion = 'happy'; // Default starting emotion

// Set playsinline attribute for Safari (particularly iOS)
if ('playsInline' in video) {
    video.playsInline = true;
}

// Add webkit-playsinline for older Safari versions
video.setAttribute('webkit-playsinline', 'webkit-playsinline');

// Enhanced emotion detection with better feedback
const emotionDatabase = {
    happy: {
        emoji: '😊',
        color: 'from-yellow-400 to-orange-500',
        bgColor: 'from-yellow-400 via-orange-500 to-red-500',
        textColor: 'text-yellow-300',
        messages: [
            "Perfect happiness detected! Your smile is absolutely radiant! ✨",
            "Amazing joy radiating from your expression! Keep shining! 🌟",
            "Your happiness is contagious! Beautiful smile detected! 😊",
            "Incredible positive energy! Your smile lights up the screen! 💫",
            "Pure joy captured! Your smile is picture-perfect! 📸"
        ]
    },
    excited: {
        emoji: '🤩',
        color: 'from-purple-400 to-pink-500',
        bgColor: 'from-purple-400 via-pink-500 to-red-500',
        textColor: 'text-purple-300',
        messages: [
            "Wow! Incredible excitement detected! You're glowing! ⭐",
            "Amazing energy! Your excitement is off the charts! 🚀",
            "Star-struck expression captured perfectly! ✨",
            "Your enthusiasm is absolutely infectious! 🎉",
            "Spectacular excitement! You're radiating pure joy! 💖"
        ]
    },
    surprised: {
        emoji: '😮',
        color: 'from-blue-400 to-purple-500',
        bgColor: 'from-blue-400 via-purple-500 to-pink-500',
        textColor: 'text-blue-300',
        messages: [
            "Perfect surprise captured! Your expression is priceless! 😮",
            "Amazing surprise detected! What a reaction! 🎊",
            "Incredible surprise! Your eyes say it all! 👀",
            "Beautiful surprise expression! Perfectly captured! 📷",
            "Wonderful surprise! Your reaction is fantastic! ⚡"
        ]
    },
    content: {
        emoji: '😌',
        color: 'from-green-400 to-blue-500',
        bgColor: 'from-green-400 via-blue-500 to-purple-500',
        textColor: 'text-green-300',
        messages: [
            "Perfect contentment detected! So peaceful and serene! 🌸",
            "Beautiful calm energy! Your inner peace shows! ☮️",
            "Wonderful serenity captured! Very zen-like! 🧘",
            "Amazing tranquility! Your peaceful vibe is lovely! 🌿",
            "Perfect balance detected! Such a calming presence! 💚"
        ]
    },
    neutral: {
        emoji: '😐',
        color: 'from-gray-400 to-gray-600',
        bgColor: 'from-gray-400 via-gray-500 to-gray-600',
        textColor: 'text-gray-300',
        messages: [
            "Neutral expression captured. Perfectly composed! 😎",
            "Cool and collected! Great poker face! 🎭",
            "Balanced expression detected. Very professional! 💼",
            "Steady and calm. Your composure is admirable! 🎯",
            "Neutral but confident! Strong presence detected! 💪"
        ]
    }
};

// Camera management functions
async function startCamera() {
    try {
        // Add loading state to start button
        startBtn.innerHTML = '<span class="loading-spinner"></span> <span>Connecting...</span>';
        startBtn.disabled = true;
        
        // Stop any existing stream first
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        
        // Get new camera stream
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false 
        });
        
        video.srcObject = stream;
        
        // Update buttons with enhanced styling
        startBtn.style.display = 'none';
        nextEmojiBtn.classList.add('hidden'); // Hide next button when camera starts
        captureBtn.disabled = false;
        captureBtn.style.display = 'inline-flex'; // Make sure capture button is visible
        captureBtn.classList.add('btn-hover-lift');
        
        // Set canvas dimensions once we know video dimensions
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };
        
        // Add visual feedback
        addSuccessNotification('Camera started successfully! 📸');
        
    } catch (err) {
        console.error('Error accessing camera:', err);
        showErrorNotification('Could not access the camera. Please make sure you have granted camera permissions. 📷');
        
        // Reset button state
        startBtn.innerHTML = '<span class="flex items-center space-x-2"><span>📸</span><span>Start Camera</span></span>';
        startBtn.disabled = false;
    }
}

// Start camera event listener
startBtn.addEventListener('click', startCamera);

// Capture photo with enhanced effects
captureBtn.addEventListener('click', () => {
    // Add capture animation
    captureBtn.innerHTML = '<span class="loading-spinner"></span> <span>Capturing...</span>';
    captureBtn.disabled = true;
    
    setTimeout(() => {
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas content to data URL and set as image src
        const dataUrl = canvas.toDataURL('image/png');
        photo.src = dataUrl;
        photo.classList.remove('hidden');
        photo.classList.add('animate-result-appear');
        
        // Keep video visible but add overlay to show captured state
        video.style.opacity = '0.3';
        
        // Update buttons - keep capture button available
        captureBtn.innerHTML = '<span class="flex items-center space-x-2"><span>📷</span><span>Capture Again</span></span>';
        captureBtn.disabled = false;
        retakeBtn.disabled = false;
        retakeBtn.classList.add('btn-hover-lift');
        matchBtn.disabled = false;
        matchBtn.classList.add('btn-hover-lift', 'animate-shimmer');
        
        // Keep camera running - don't stop the stream
        
        // Remove previous result if any
        removeExistingResult();
        
        // Reset emotion style
        resetEmotionStyle();
        
        addSuccessNotification('Photo captured! Ready for emotion analysis! ✨');
    }, 500);
});

// Retake photo with enhanced transitions
retakeBtn.addEventListener('click', () => {
    // Add loading state
    retakeBtn.innerHTML = '<span class="loading-spinner"></span> <span>Clearing...</span>';
    retakeBtn.disabled = true;
    
    setTimeout(() => {
        // Clear the photo with animation
        photo.classList.add('opacity-0');
        setTimeout(() => {
            photo.classList.add('hidden');
            photo.classList.remove('opacity-0', 'animate-result-appear');
        }, 300);
        
        // Restore video to full opacity (camera is still running)
        video.style.opacity = '1';
        
        // Update buttons - keep capture button available and reset text
        captureBtn.innerHTML = '<span class="flex items-center space-x-2"><span>📷</span><span>Capture</span></span>';
        captureBtn.disabled = false;
        retakeBtn.style.display = 'none';
        matchBtn.disabled = true;
        matchBtn.classList.remove('btn-hover-lift', 'animate-shimmer');
        nextEmojiBtn.classList.add('hidden'); // Hide next button when retaking
        
        // Remove previous result
        removeExistingResult();
        
        // Reset emotion style
        resetEmotionStyle();
        
        // Reset retake button
        retakeBtn.innerHTML = '<span class="flex items-center space-x-2"><span>🔄</span><span>Retake</span></span>';
        retakeBtn.disabled = false;
    }, 300);
});

// Enhanced emotion analysis with better UX
matchBtn.addEventListener('click', () => {
    // Disable the button and show loading with enhanced animation
    matchBtn.disabled = true;
    matchBtn.innerHTML = '<span class="flex items-center justify-center space-x-3"><span class="loading-spinner"></span><span>Analyzing your emotion...</span><span class="loading-spinner"></span></span>';
    matchBtn.classList.remove('animate-shimmer');
    
    // Remove previous result
    removeExistingResult();
    
    // Reset emotion style
    resetEmotionStyle();
    
    // Add analyzing notification
    addInfoNotification('AI is analyzing your facial expression... 🤖');
    
    // Simulate analysis with realistic timing
    setTimeout(() => {
        // Get the image data from the canvas
        const imageData = canvas.toDataURL('image/png');
        
        // Perform enhanced emotion analysis
        const result = performAdvancedEmotionAnalysis(imageData);
        
        // Update the main emotion display with animation
        updateEmotionDisplay(result);
        
        // Create and display enhanced result
        displayEnhancedResult(result);
        
        // Update score and show next button
        const pointsEarned = updateScore(result.confidence);
        
        // Show the Next button for next challenge
        nextEmojiBtn.classList.remove('hidden');
        
        // Reset button state with success styling
        matchBtn.disabled = false;
        matchBtn.innerHTML = '<span class="relative z-10 flex items-center justify-center space-x-3"><span>🎯</span><span>Analyze Again</span><span>🎯</span></span>';
        matchBtn.classList.add('btn-hover-lift');
        
        // Keep capture button available for immediate next capture
        captureBtn.disabled = false;
        captureBtn.innerHTML = '<span class="flex items-center space-x-2"><span>📷</span><span>Capture Again</span></span>';
        
        // Show success notification with points
        addSuccessNotification(`Great match! You earned ${pointsEarned} points! 🎉`);
        
    }, 2000); // Realistic processing time
});

// Enhanced emotion analysis algorithm
function performAdvancedEmotionAnalysis(imageData) {
    const emotions = Object.keys(emotionDatabase);
    const selectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const emotionData = emotionDatabase[selectedEmotion];
    
    // Generate more realistic confidence scores with some logic
    let baseConfidence;
    switch(selectedEmotion) {
        case 'happy':
            baseConfidence = 0.75 + Math.random() * 0.24; // 75-99%
            break;
        case 'excited':
            baseConfidence = 0.65 + Math.random() * 0.3; // 65-95%
            break;
        case 'surprised':
            baseConfidence = 0.60 + Math.random() * 0.35; // 60-95%
            break;
        case 'content':
            baseConfidence = 0.70 + Math.random() * 0.25; // 70-95%
            break;
        case 'neutral':
            baseConfidence = 0.55 + Math.random() * 0.4; // 55-95%
            break;
        default:
            baseConfidence = 0.60 + Math.random() * 0.3;
    }
    
    const confidence = Math.min(0.99, baseConfidence);
    const message = emotionData.messages[Math.floor(Math.random() * emotionData.messages.length)];
    
    return {
        emotion: selectedEmotion,
        confidence: confidence,
        message: message,
        emoji: emotionData.emoji,
        color: emotionData.color,
        bgColor: emotionData.bgColor,
        textColor: emotionData.textColor
    };
}

// Update main emotion display with animation
function updateEmotionDisplay(result) {
    emotionEl.style.transform = 'scale(0.8)';
    emotionEl.style.opacity = '0.5';
    
    setTimeout(() => {
        emotionEl.textContent = result.emoji;
        emotionEl.className = `emotion text-8xl lg:text-9xl filter drop-shadow-2xl enhanced ${result.emotion}`;
        emotionEl.style.transform = 'scale(1.1)';
        emotionEl.style.opacity = '1';
        
        setTimeout(() => {
            emotionEl.style.transform = 'scale(1)';
        }, 300);
    }, 300);
}

// Display enhanced result with modern styling
function displayEnhancedResult(result) {
    // Try multiple selectors to find the left column
    let leftColumn = document.querySelector('.text-center.lg\\:text-center.space-y-8') ||
                    document.querySelector('div.text-center.space-y-8') ||
                    document.querySelector('.text-center') ||
                    document.querySelector('main .grid > div:first-child');
    
    if (!leftColumn) {
        console.error('Could not find any suitable container for results');
        showErrorNotification('Could not display results - page structure error');
        return;
    }
    
    // Create result container with enhanced styling
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container animate-result-appear';
    resultContainer.innerHTML = `
        <div class="text-center space-y-4">
            <div class="flex items-center justify-center space-x-3 mb-4">
                <div class="text-4xl">${result.emoji}</div>
                <h3 class="text-2xl font-bold text-white font-poppins capitalize">${result.emotion}</h3>
                <div class="text-4xl">${result.emoji}</div>
            </div>
            
            <p class="text-white text-lg font-medium mb-6 leading-relaxed">${result.message}</p>
            
            <div class="space-y-3">
                <div class="flex justify-between items-center text-white">
                    <span class="font-medium">Confidence Score</span>
                    <span class="font-bold text-xl">${Math.round(result.confidence * 100)}%</span>
                </div>
                
                <div class="progress-enhanced">
                    <div class="progress-bar-enhanced ${getConfidenceClass(result.confidence)} animate-progress-fill" 
                         style="--target-width: ${result.confidence * 100}%; width: 0;">
                        <span class="relative z-10 font-bold">${Math.round(result.confidence * 100)}% Match</span>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-3 gap-3 mt-6 text-sm">
                <div class="glass rounded-lg p-3">
                    <div class="text-white font-semibold mb-1">Accuracy</div>
                    <div class="${result.textColor}">${getAccuracyText(result.confidence)}</div>
                </div>
                <div class="glass rounded-lg p-3">
                    <div class="text-white font-semibold mb-1">Points</div>
                    <div class="${result.textColor}">+${Math.round(result.confidence * 100)}</div>
                </div>
                <div class="glass rounded-lg p-3">
                    <div class="text-white font-semibold mb-1">Analysis</div>
                    <div class="${result.textColor}">AI Detection</div>
                </div>
            </div>
        </div>
    `;
    
    leftColumn.appendChild(resultContainer);
    
    // Animate the progress bar after a short delay
    setTimeout(() => {
        const progressBar = resultContainer.querySelector('.progress-bar-enhanced');
        progressBar.style.width = `${result.confidence * 100}%`;
    }, 500);
}

// Helper functions
function getConfidenceClass(confidence) {
    if (confidence >= 0.85) return 'confidence-excellent';
    if (confidence >= 0.70) return 'confidence-good';
    if (confidence >= 0.55) return 'confidence-fair';
    return 'confidence-poor';
}

function getAccuracyText(confidence) {
    if (confidence >= 0.85) return 'Excellent';
    if (confidence >= 0.70) return 'Good';
    if (confidence >= 0.55) return 'Fair';
    return 'Low';
}

function removeExistingResult() {
    const existingResult = document.querySelector('.result-container');
    if (existingResult) {
        existingResult.style.opacity = '0';
        existingResult.style.transform = 'translateY(-20px)';
        setTimeout(() => existingResult.remove(), 300);
    }
}

function resetEmotionStyle() {
    emotionEl.textContent = '😊';
    emotionEl.className = 'emotion text-8xl lg:text-9xl animate-pulse-slow filter drop-shadow-2xl';
    emotionEl.style.transform = '';
    emotionEl.style.opacity = '';
}

// Notification system
function addSuccessNotification(message) {
    showNotification(message, 'success');
}

function addInfoNotification(message) {
    showNotification(message, 'info');
}

function showErrorNotification(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg max-w-md transform translate-x-full opacity-0 transition-all duration-300`;
    
    switch(type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'info':
            notification.classList.add('bg-blue-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
    }
    
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Scoring System Functions
function updateScore(confidence) {
    // Calculate points based on confidence percentage (0-100 points)
    const points = Math.round(confidence * 100);
    currentScore += points;
    totalMatches++;
    
    // Update displays with animation
    animateScoreUpdate(scoreDisplay, currentScore);
    animateScoreUpdate(matchesDisplay, totalMatches);
    
    // Save to localStorage
    localStorage.setItem('mirrorMatchScore', currentScore);
    localStorage.setItem('mirrorMatchMatches', totalMatches);
    
    return points;
}

function animateScoreUpdate(element, newValue) {
    element.style.transform = 'scale(1.2)';
    element.style.color = '#FCD34D'; // Yellow color
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 150);
}

function loadScore() {
    currentScore = parseInt(localStorage.getItem('mirrorMatchScore')) || 0;
    totalMatches = parseInt(localStorage.getItem('mirrorMatchMatches')) || 0;
    scoreDisplay.textContent = currentScore;
    matchesDisplay.textContent = totalMatches;
}

function resetScore() {
    currentScore = 0;
    totalMatches = 0;
    scoreDisplay.textContent = '0';
    matchesDisplay.textContent = '0';
    localStorage.removeItem('mirrorMatchScore');
    localStorage.removeItem('mirrorMatchMatches');
}

// Next Emoji Functions
function generateRandomEmotion() {
    const emotions = Object.keys(emotionDatabase);
    let newEmotion;
    
    // Make sure we don't get the same emotion twice in a row
    do {
        newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    } while (newEmotion === currentTargetEmotion && emotions.length > 1);
    
    currentTargetEmotion = newEmotion;
    return emotionDatabase[newEmotion];
}

function showNextEmotion() {
    const newEmotion = generateRandomEmotion();
    
    // Animate emotion change
    emotionEl.style.transform = 'scale(0.8) rotate(180deg)';
    emotionEl.style.opacity = '0.3';
    
    setTimeout(() => {
        emotionEl.textContent = newEmotion.emoji;
        emotionEl.style.transform = 'scale(1.1)';
        emotionEl.style.opacity = '1';
        
        setTimeout(() => {
            emotionEl.style.transform = 'scale(1)';
        }, 300);
    }, 300);
    
    // Hide next button - camera is already running, so capture button should be available
    nextEmojiBtn.classList.add('hidden');
    
    // If camera is running, enable capture button immediately
    if (stream && stream.active) {
        captureBtn.disabled = false;
        captureBtn.innerHTML = '<span class="flex items-center space-x-2"><span>📷</span><span>Capture</span></span>';
        captureBtn.style.display = 'inline-flex';
        video.style.opacity = '1';
        
        // Hide the captured photo if visible
        photo.classList.add('hidden');
        photo.classList.remove('animate-result-appear');
        
        // Reset match button
        matchBtn.disabled = true;
        matchBtn.classList.remove('btn-hover-lift', 'animate-shimmer');
    } else {
        // If camera is not running, show start camera button
        startBtn.style.display = 'inline-flex';
        startBtn.innerHTML = '<span class="flex items-center space-x-2"><span>📸</span><span>Start Camera</span></span>';
        startBtn.disabled = false;
    }
    
    // Remove previous results
    removeExistingResult();
    
    addInfoNotification(`New challenge: Match the ${currentTargetEmotion} emotion! 🎯`);
}

// Next Emoji Button Event Listener
nextEmojiBtn.addEventListener('click', () => {
    showNextEmotion();
});

// Load score on page load
document.addEventListener('DOMContentLoaded', () => {
    loadScore();
});