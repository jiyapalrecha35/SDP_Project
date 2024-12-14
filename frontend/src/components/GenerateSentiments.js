import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const GenerateSentiments = ({ movieTitle }) => {
  const [sentimentWords, setSentimentWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!movieTitle) return;

    const fetchSentiments = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://127.0.0.1:5000/generate_sentiments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movie_title: movieTitle }),
        });

        if (response.ok) {
          const data = await response.json();
          setSentimentWords(data.sentiment_words || []);
        } else {
          const data = await response.json();
          setError(data.error || 'Error generating sentiment words');
        }
      } catch (err) {
        setError('Error generating sentiment words');
      } finally {
        setLoading(false);
      }
    };

    fetchSentiments();
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
        Sentiment Words
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: '15px', color: '#333' }}>
        Movie Title: {movieTitle}
      </Typography>

      <Box sx={{ textAlign: 'left', display: 'inline-block', width: '100%' }}>
        {loading ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : sentimentWords.length > 0 ? (
          <Box sx={{ padding: '10px',borderRadius: '8px'}}>
            {/* <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Sentiment Words:
            </Typography> */}
              {sentimentWords.map((word, index) => (
                <>
                  <Typography variant="body1" sx={{ fontSize: '16px', color: '#333', fontWeight: 'bold', marginBottom: '10px',padding:'10px',margin:'10px' }}>
                    {word}
                  </Typography>
                  <br />
                  </>
              ))}
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            No sentiment words available.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default GenerateSentiments;
