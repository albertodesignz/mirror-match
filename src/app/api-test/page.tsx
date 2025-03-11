"use client"

import React, { useState } from 'react';

export default function ApiTest() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const testApi = async () => {
    if (!imageData) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing API with image...');
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      setResult(data);
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">API Test Page</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Test Emotion Analysis API</h5>
          
          <div className="mb-3">
            <label htmlFor="imageUpload" className="form-label">Select an image with a face</label>
            <input 
              type="file" 
              className="form-control" 
              id="imageUpload" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
          
          {imageData && (
            <div className="mb-3">
              <p>Image preview:</p>
              <img 
                src={imageData} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '300px' }} 
                className="rounded border"
              />
            </div>
          )}
          
          <button 
            className="btn btn-primary"
            onClick={testApi}
            disabled={!imageData || loading}
          >
            {loading ? 'Testing...' : 'Test API'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <h5>Error:</h5>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">API Response</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <strong>Detected Emotion:</strong> <span className="text-capitalize">{result.emotion}</span>
            </div>
            <div className="mb-3">
              <strong>Confidence:</strong> {Math.round(result.confidence * 100)}%
            </div>
            <div className="mb-3">
              <strong>Feedback:</strong> {result.feedback}
            </div>
            <div className="mb-3">
              <strong>Raw Response:</strong>
              <pre className="bg-light p-3 rounded mt-2" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 