# Mirror Match - Emotion Detection App

## Project Overview
Mirror Match is an interactive emotion detection web application that uses camera input to capture user photos and provides AI-powered emotion analysis with engaging visual feedback.

## Architecture & Tech Stack

### Frontend Framework
- **Tailwind CSS 3.4.16** - Modern utility-first CSS framework for responsive design
- **Vanilla JavaScript** - No additional frameworks, focused on performance and compatibility
- **Google Fonts** - Inter and Poppins font families for modern typography

### Core Components
- **Camera Interface** - WebRTC camera access with video capture
- **Emotion Analysis Engine** - Simulated AI emotion detection with confidence scoring
- **Visual Feedback System** - Dynamic animations and progressive enhancement
- **Notification System** - Real-time user feedback with toast notifications

## Key Design Patterns

### Modern Glass Morphism UI
The application uses advanced glassmorphism effects with:
- Backdrop blur filters for depth
- Semi-transparent backgrounds with gradient borders
- Layered visual hierarchy with floating elements

### Progressive Enhancement
- Graceful degradation for older browsers
- Reduced motion support for accessibility
- High contrast mode compatibility

### Animation System
- **Floating Background Elements** - Multiple animated shapes with staggered timing
- **Emotion Transitions** - Smooth scaling and emoji changes during analysis
- **Progress Animations** - Dynamic progress bars with shimmer effects
- **Button States** - Hover, active, and loading state animations

## File Structure & Responsibilities

### `index.html`
- Modern semantic HTML structure
- Tailwind CSS utility classes for responsive design
- Accessibility features (focus states, screen reader support)
- Mobile-first responsive grid layout

### `styles.css`
- Custom animations and keyframes
- Enhanced glassmorphism effects
- Emotion-specific color schemes
- Accessibility improvements (reduced motion, high contrast)
- Mobile optimizations

### `script.js`
- Camera access and video capture functionality
- Enhanced emotion detection simulation
- Dynamic UI state management
- Real-time feedback and notification system
- Progressive enhancement for user experience

## Emotion Detection System

### Emotion Categories
- **Happy** - Yellow/orange gradients, high confidence scoring
- **Excited** - Purple/pink gradients, star-struck emoji
- **Surprised** - Blue/purple gradients, shock expressions
- **Content** - Green/blue gradients, peaceful vibes
- **Neutral** - Gray gradients, composed expressions

### Confidence Scoring
- Realistic confidence ranges per emotion type
- Visual progress bars with gradient fills
- Color-coded accuracy levels (Excellent, Good, Fair, Low)

## Development Guidelines

### Tailwind CSS Usage
- Utility-first approach with semantic class combinations
- Custom CSS only for complex animations and effects
- Responsive design with mobile-first methodology

### JavaScript Architecture
- Modular functions with single responsibilities
- Event-driven programming with enhanced feedback
- Error handling with user-friendly notifications
- Performance optimization for camera operations

### Animation Performance
- CSS transforms for better performance
- Reduced motion preferences respected
- Staggered animations to prevent overwhelming users

## Browser Compatibility
- Modern browsers with WebRTC support
- iOS Safari optimizations (playsinline attributes)
- Fallbacks for browsers without backdrop-filter support

## Accessibility Features
- Screen reader compatible structure
- Keyboard navigation support
- High contrast mode adaptations
- Reduced motion preferences
- Focus indicators on interactive elements

## Future Enhancement Opportunities
- Real AI emotion detection API integration
- User photo history and emotion tracking
- Social sharing capabilities
- Multiple emotion detection (compound emotions)
- Voice feedback options
- Custom emotion training modes