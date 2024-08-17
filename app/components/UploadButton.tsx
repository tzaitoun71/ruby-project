'use client'

import React, { useState } from 'react';

const UploadButton = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/upload-json-to-pinecone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: 'Upload JSON data to Pinecone',
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.response || 'Success');
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred');
    }

    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload JSON to Pinecone'}
      </button>
      {response && <div>{response}</div>}
    </div>
  );
};

export default UploadButton;
