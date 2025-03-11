# Mirror Match

Mirror Match is an interactive facial emotion recognition game built with Next.js. The app challenges users to mimic different emotions and uses Claude Vision AI to analyze and score their facial expressions.

## Features

- Real-time camera integration
- AI-powered emotion recognition using Anthropic's Claude API
- Four different emotions to practice: happy, sad, mad, and scared
- Feedback on your expression accuracy
- Streaks to track your progress

## Getting Started

First, set up your environment:

1. Create a `.env.local` file in the root of your project with your Anthropic API key:
```
ANTHROPIC_API_KEY=your_anthropic_api_key
```

2. Install the dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

1. The app displays an emotion for you to mimic (happy, sad, mad, or scared)
2. You click the camera button to start your webcam
3. When ready, click the capture button to take a snapshot
4. The image is sent to Claude AI for analysis through a secure API route
5. Claude analyzes your expression and determines which emotion you're showing
6. You get feedback on how well your expression matched the target emotion
7. Try to build up a streak by correctly matching emotions!

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **AI**: Anthropic Claude API for computer vision and facial analysis
- **Camera**: Browser MediaDevices API

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Tailwind CSS](https://tailwindcss.com/docs)
