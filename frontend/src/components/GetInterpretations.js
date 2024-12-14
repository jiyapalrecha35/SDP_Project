import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';

const GetInterpretations = ({ movieTitle }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plotSummary, setPlotSummary] = useState(''); // Single state for the plot summary
  const [youtubeLinks, setYoutubeLinks] = useState([]); // State for YouTube links

  // Fetch plot summary and YouTube links when movieTitle changes
  useEffect(() => {
    if (!movieTitle) return;

    const fetchMovieDetails = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch plot summary from backend
        const plotResponse = await fetch('http://127.0.0.1:5000/generate_interpretation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movie_title: movieTitle }),
        });

        if (!plotResponse.ok) throw new Error('Error fetching plot summary');
        const plotData = await plotResponse.json();

        // Set the entire plot summary in the state variable
        setPlotSummary(plotData.plot_summary || 'No plot summary available.');

        // Fetch YouTube links from backend
        const youtubeResponse = await fetch('http://127.0.0.1:5000/get_youtube_links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic: movieTitle }),
        });

        if (!youtubeResponse.ok) throw new Error('Error fetching YouTube links');
        const youtubeData = await youtubeResponse.json();

        setYoutubeLinks(youtubeData.youtube_links || []); // Set the YouTube links to state

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieTitle]);

  // Function to extract video ID from YouTube link
  const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
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
        Movie Interpretations
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography sx={{ color: 'red', marginTop: '10px' }}>
          {error}
        </Typography>
      )}

      {/* Display YouTube Videos First */}
      {youtubeLinks.length > 0 && !loading && (
        <Box sx={{ textAlign: 'left', marginTop: '20px' }}>
          {/* <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '10px' }}>
            YouTube Video:
          </Typography> */}
          <Grid container spacing={2} justifyContent="flex-start">
            {youtubeLinks.map((link, index) => {
              const videoId = extractVideoId(link);
              if (!videoId) return null;

              return (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <iframe
                    width="750"
                    height="350"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`YouTube video ${index + 1}`}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Display the Plot Summary */}
      {plotSummary && !loading && (
        <Box sx={{ textAlign: 'left', marginTop: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '10px' }}>
            Plot Interpretation:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '16px', color: '#333' }}>
            {plotSummary}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GetInterpretations;
