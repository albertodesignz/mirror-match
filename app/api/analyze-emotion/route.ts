import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client with proper error handling
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
let anthropic: Anthropic | null = null;

try {
  if (!anthropicApiKey) {
    console.error('ANTHROPIC_API_KEY is not defined in environment variables');
  } else {
    anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });
  }
} catch (error) {
  console.error('Error initializing Anthropic client:', error);
}

export async function POST(request: Request) {
  console.log('Received request to analyze emotion');
  
  try {
    // Check if Anthropic client is initialized
    if (!anthropic) {
      console.error('Anthropic client is not initialized');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json().catch(error => {
      console.error('Error parsing request JSON:', error);
      return null;
    });
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { image } = body;
    
    if (!image) {
      console.error('Image data is missing from request');
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    console.log('Processing image data...');
    
    // Validate image data format - very basic check
    if (!image.startsWith('data:')) {
      console.error('Invalid image format, expected data URL');
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Remove the data URL prefix to get just the base64 data
    const parts = image.split(',');
    if (parts.length !== 2) {
      console.error('Invalid image data URL format');
      return NextResponse.json(
        { error: 'Invalid image data format' },
        { status: 400 }
      );
    }
    
    const base64Image = parts[1];
    console.log('Image data extracted, data length:', base64Image.length);
    
    // Validate base64 data is not empty
    if (!base64Image || base64Image.length < 100) {
      console.error('Image data is too small or empty');
      return NextResponse.json(
        { error: 'Image data is too small or empty' },
        { status: 400 }
      );
    }
    
    console.log('Calling Anthropic API...');

    // Call Anthropic API with Claude Vision capability
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze the facial expression in this image. The person is trying to express one of these emotions: happy, sad, mad, or scared. Which one matches best? Respond with ONLY a JSON object with these properties: 'emotion' (string - one of the four emotions), 'confidence' (number between 0 and 1), and 'feedback' (brief text explaining why)."
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ]
      });

      console.log('Received response from Anthropic API');
      
      // Extract the response text
      if (!response.content || response.content.length === 0) {
        console.error('Empty response from Anthropic API');
        return NextResponse.json({
          emotion: 'unknown',
          confidence: 0.5,
          feedback: 'Received empty response from AI service.'
        });
      }
      
      const responseText = response.content[0].text;
      console.log('Response text:', responseText);
      
      // Try to parse the JSON response
      try {
        // Extract JSON from the response (sometimes Claude wraps it in markdown code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('Could not extract JSON from response');
          return NextResponse.json({
            emotion: 'unknown',
            confidence: 0.5,
            feedback: 'Could not extract structured data from AI response.'
          });
        }
        
        const jsonString = jsonMatch[0];
        console.log('Extracted JSON:', jsonString);
        
        const result = JSON.parse(jsonString);
        
        // Validate result structure
        if (!result.emotion || !result.confidence || !result.feedback) {
          console.error('Invalid result structure:', result);
          return NextResponse.json({
            emotion: result.emotion || 'unknown',
            confidence: result.confidence || 0.5,
            feedback: result.feedback || 'Received incomplete analysis from AI.'
          });
        }
        
        console.log('Successfully parsed result:', result);
        return NextResponse.json(result);
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        
        // Fallback: Return a structured response with the raw text
        return NextResponse.json({
          emotion: 'unknown',
          confidence: 0.5,
          feedback: 'Could not analyze the expression accurately. AI response could not be parsed.'
        });
      }
    } catch (anthropicError: unknown) {
      console.error('Error calling Anthropic API:', anthropicError);
      const errorMessage = anthropicError instanceof Error 
        ? anthropicError.message 
        : 'Unknown error with AI service';
      
      return NextResponse.json(
        { 
          error: 'Error communicating with AI service',
          details: errorMessage
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Unhandled API error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown server error';
      
    return NextResponse.json(
      { 
        error: 'Failed to analyze emotion',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 