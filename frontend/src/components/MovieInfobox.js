import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const MovieInfoBox = ({ movieTitle }) => {
  const [infobox, setInfobox] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!movieTitle) return; 

    const fetchInfoBox = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/infobox?movie_title=${movieTitle}`);
        const data = await response.json();
        if (data.infobox) {
          setInfobox(data.infobox);
          setError('');
        } else {
          setError(data.error);
          setInfobox([]);
        }
      } catch (err) {
        setError('Error fetching movie infobox.');
        setInfobox([]);
      }
    };

    fetchInfoBox(); 
  }, [movieTitle]); 

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
        Movie Info
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: '15px', color: '#333' }}>
        Movie Title: {movieTitle}
      </Typography>

      <Box sx={{ textAlign: 'left', display: 'inline-block', width: '100%' }}>
        {infobox.length > 0 ? (
          <Box sx={{ padding: '10px', borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>MetaData:</Typography>
          <ul>
            {infobox.map((item, index) => {
              const [key, value] = item.split(':'); // Split the key and value
              return (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <Typography variant="body1" sx={{ fontSize: '16px', color: '#333' }}>
                    <strong>{key}:</strong> {value}
                  </Typography>
                </li>
              );
            })}
          </ul>
        </Box>
        
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : (
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            Fetching meta data...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MovieInfoBox;
