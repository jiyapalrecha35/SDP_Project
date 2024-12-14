import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Tabs, Tab, AppBar, CircularProgress } from '@mui/material';
import MoviePlot from './MoviePlot';
import MovieInfoBox from './MovieInfobox';
import GenerateSentiments from './GenerateSentiments';
import GenerateMovieLessons from './GenerateMovieLessons';
import AnalyzePlot from './AnalyzePlot';
import { useParams } from 'react-router-dom';
import AnalyzeSentiment from './AnalyzeSentiments';
import AnalyzeTopics from './AnalyzeTopic';
import GenerateThemes from './GenerateThemes';
import SuggestMovies from './SuggestMovies';
import GetInterpretations from './GetInterpretations';

const MovieDataAnalysis = () => {
  const { movieTitle } = useParams();
  const [plotSummary, setPlotSummary] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [movieDetails, setMovieDetails] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
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
          setPosterUrl(data.Poster || ''); // Assuming data.Poster contains the poster URL
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

    fetchMovieDetails();
  }, [movieTitle]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Movie/Series Analysis System
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Analyze and explore detailed insights about the movie "{movieTitle}".
        </Typography>
      </Box>

      {/* Navbar-like Tabs for navigation */}
      <AppBar position="static" sx={{ background: 'linear-gradient(to top left, #EAD8B1, #6A9AB0, #3A6D8C)' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            centered
            indicatorColor="secondary"
            scrollButtons="auto" // Allow scroll when tabs overflow
            variant="scrollable" // Enable scrollable tabs
          >
            <Tab label="Plot" />
            <Tab label="InfoBox" />
            <Tab label="Life Lessons" />
            <Tab label="Sentiment Words" />
            <Tab label="Analyze Plot" />
            <Tab label="Sentiment Analysis" />
            <Tab label="Topic Analysis" />
            <Tab label="Theme Generation" />
            <Tab label="Movie Interpretation" />
            <Tab label="Movie Suggestions" />
          </Tabs>
        </Box>
      </AppBar>

      {/* Conditional Rendering of Sections based on Selected Tab */}
      {selectedTab === 0 && (
        <Box sx={{ mt: 4 }}>
          {/* Display movie poster and plot */}
          {loading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={`${movieTitle} Poster`}
                  style={{ width: '100%', maxWidth: '200px', borderRadius: '15px' }}
                />
              ) : (
                <Typography variant="body2" sx={{ color: 'gray' }}>
                  Poster not available
                </Typography>
              )}
             
              <MoviePlot movieTitle={movieTitle} setPlotSummary={setPlotSummary} />
              
              {/* {error && (
                <Typography variant="body1" sx={{ color: 'red', mt: 2 }}>
                  Poster not available
                </Typography>
              )} */}
            </Box>
          )}
        </Box>

      )}
      {selectedTab === 1 && (
        <Box sx={{ mt: 4 }}>
          <MovieInfoBox movieTitle={movieTitle} />
        </Box>
      )}

      {selectedTab === 2 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          {/* <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
      Life Lessons
    </Typography> */}

          {/* Directly use the GenerateMovieLessons component */}
          <GenerateMovieLessons movieTitle={movieTitle} />
        </Box>
      )}

      {selectedTab === 3 && (
        <Box sx={{ mt: 4 }}>
          <GenerateSentiments movieTitle={movieTitle} />
        </Box>
      )}

      {selectedTab === 4 && (
        <Box sx={{ mt: 4 }}>
          <AnalyzePlot plotSummary={plotSummary} />
        </Box>
      )}
      {selectedTab === 5 && (
        <Box sx={{ mt: 4 }}>
          <AnalyzeSentiment plotSummary={plotSummary} />
        </Box>
      )}
      {selectedTab === 6 && (
        <Box sx={{ mt: 4 }}>
          <AnalyzeTopics plotSummary={plotSummary} />
        </Box>
      )}
      {selectedTab === 7 && (
        <Box sx={{ mt: 4 }}>
          <GenerateThemes movieTitle={movieTitle} />
        </Box>
      )}
      {selectedTab === 8 && (
        <Box sx={{ mt: 4 }}>
          <GetInterpretations movieTitle={movieTitle} />
        </Box>
      )}
      {selectedTab === 9 && (
        <Box sx={{ mt: 4 }}>
          <SuggestMovies movieTitle={movieTitle} />
        </Box>
      )}
    </Container>
  );
};

export default MovieDataAnalysis;
