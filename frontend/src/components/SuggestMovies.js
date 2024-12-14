import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Grid } from '@mui/material';

const SuggestMovies = ({ movieTitle }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!movieTitle) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      setError('');
      setSuggestions([]);

      try {
        const response = await fetch('http://127.0.0.1:5000/suggest_movies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movie_title: movieTitle }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggested_movies || []);
        } else {
          const data = await response.json();
          setError(data.error || 'Error suggesting movies');
        }
      } catch (err) {
        setError('Error suggesting movies');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [movieTitle]);

  return (
    <Box
      sx={{
        background: 'linear-gradient(to top left, #EAD8B1, #6A9AB0, #3A6D8C)',
        borderRadius: '15px',
        boxShadow: '8px 8px 15px rgba(0, 0, 0, 0.1), -8px -8px 15px rgba(255, 255, 255, 0.1)',
        padding: '20px',
        maxWidth: '600px',
        margin: '20px auto',
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '15px' }}>
        Movie Suggestions
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: '15px', color: '#333' }}>
        Movie Title: {movieTitle}
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography sx={{ color: 'red' }}>{error}</Typography>}

      {suggestions.length > 0 && (
        <Grid container spacing={4} justifyContent="center">
          {suggestions.map((title, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2,background: 'linear-gradient(to top left, #EAD8B1, #6A9AB0, #3A6D8C)'}}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SuggestMovies;
