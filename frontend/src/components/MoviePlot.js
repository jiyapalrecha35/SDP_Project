import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const MoviePlot = ({ movieTitle, setPlotSummary }) => {
    const [plot, setPlot] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlot = async () => {
            if (!movieTitle) return; 

            try {
                const response = await fetch(`http://127.0.0.1:5000/api/movie-plot?movie_title=${movieTitle}`);
                const data = await response.json();
                if (data.plot) {
                    setPlot(data.plot);
                    setPlotSummary(data.plot); 
                    setError('');
                } else {
                    setError(data.error || 'Plot not found.');
                    setPlot('');
                }
            } catch (err) {
                setError('Error fetching movie plot.');
                setPlot('');
            }
        };

        fetchPlot();
    }, [movieTitle, setPlotSummary]); 

    return (
        <Box
            sx={{
                background: 'linear-gradient(to top left, #EAD8B1, #6A9AB0, #3A6D8C)',
                borderRadius: '15px',
                boxShadow: '8px 8px 15px rgba(0, 0, 0, 0.1), -8px -8px 15px rgba(255, 255, 255, 0.1)',
                padding: '20px',
                maxWidth: '1200px',
                margin: '20px auto',
                textAlign: 'center',
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '15px' }}>
                Movie Plot
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: '15px', color: '#333' }}>
                <strong>Movie Title:</strong> {movieTitle || 'No title provided'}
            </Typography>
            {plot ? (
                <Typography variant="body1" sx={{ textAlign: 'left', color: '#333' }}>
                    <strong>Plot:</strong> {plot}
                </Typography>
            ) : error ? (
                <Typography variant="body1" sx={{ color: 'red' }}>
                    <strong>Error:</strong> {error}
                </Typography>
            ) : (
                <CircularProgress />
            )}
        </Box>
    );
};

export default MoviePlot;
