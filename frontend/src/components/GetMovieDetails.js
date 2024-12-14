import React, { useState } from 'react';

const MovieDetails = ({movieTitle}) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchMovieDetails = async () => {
    if (!movieTitle) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/get_movie_details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_title: movieTitle }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMovieDetails(data);
      } else {
        const data = await response.json();
        setError(data.error || 'Error fetching movie details');
      }
    } catch (err) {
      setError('Error fetching movie details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Get Movie Details</h2>
    
      <button onClick={handleFetchMovieDetails} disabled={loading || !movieTitle}>
        {loading ? 'Loading...' : 'Get Movie Details'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {movieDetails && (
        <div>
          <h3>Movie Details:</h3>
          <pre>{JSON.stringify(movieDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
