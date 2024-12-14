import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const GenerateThemes = ({ movieTitle }) => {
  const [themes, setThemes] = useState([]); // Initializing themes as an array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch themes when movieTitle changes
  useEffect(() => {
    const fetchThemes = async () => {
      if (!movieTitle) return;

      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://127.0.0.1:5000/generate_themes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movie_title: movieTitle }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch themes');
        }

        const data = await response.json();

        if (Array.isArray(data.themes)) {
          setThemes(data.themes || []); 
        } else {
          setError('Invalid response format');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [movieTitle]);

  const removeDashes = (text) => {
    return text.replace(/^-+|-+$/g, '').replace(/-+/g, ' '); // Remove leading/trailing dashes and replace other dashes with spaces
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(to top left, #EAD8B1, #6A9AB0, #3A6D8C)',
        borderRadius: '15px',
        boxShadow: '8px 8px 15px rgba(0, 0, 0, 0.1), -8px -8px 15px rgba(255, 255, 255, 0.1)',
        padding: '20px',
        maxWidth: '800px',
        margin: '20px auto',
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '15px' }}>
        Themes
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: '15px', color: '#333' }}>
        Movie Title: {movieTitle}
      </Typography>

      <Box sx={{ textAlign: 'left', display: 'inline-block', width: '100%' }}>
        {loading ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading themes...
          </Typography>
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : (
          <Box sx={{ padding: '10px', borderRadius: '8px' }}>
            {themes.length > 0 ? (
              themes.map((lesson, index) => {
                const [boldPart, ...rest] = removeDashes(lesson).split(':'); // Split the string by ':'
                return (
                  <Typography
                    key={index}
                    variant="body1"
                    sx={{ fontSize: '16px', color: '#333', m: 2 }}
                  >
                    <strong>{boldPart.trim()}</strong>{rest.length > 0 ? `: ${rest.join(':').trim()}` : ''}
                  </Typography>
                );
              })
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                No themes available.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GenerateThemes;
