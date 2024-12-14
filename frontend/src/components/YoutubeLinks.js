import React, { useState } from 'react';

const GetYouTubeLinks = ({ movieTitle }) => {
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!movieTitle) return;

    setLoading(true);
    setError('');
    try {
      // Send a POST request to the backend
      const response = await fetch('http://127.0.0.1:5000/get_youtube_links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: movieTitle }), // Send the movie title as a JSON object
      });
      
      // Check if the response is OK
      if (response.ok) {
        const data = await response.json();
        setYoutubeLinks(data.youtube_links || []); // Set the YouTube links to state
      } else {
        const data = await response.json();
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Error fetching YouTube links');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>YouTube Links</h2>
      <p>Movie Title: {movieTitle}</p>
      <button onClick={handleFetch} disabled={loading || !movieTitle}>
        {loading ? 'Loading...' : 'Get YouTube Links'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {youtubeLinks.length > 0 && (
        <div>
          <h3>YouTube Links:</h3>
          <ul>
            {youtubeLinks.map((link, index) => (
              <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GetYouTubeLinks;
