import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const GenerateMovieLessons = ({ movieTitle }) => {
  const [lifeLessons, setLifeLessons] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieTitle) return; 

    const fetchLifeLessons = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:5000/generate_movie_lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movie_title: movieTitle }),
        });

        if (response.ok) {
          const data = await response.json();
          setLifeLessons(data.life_lessons.split('\n\n'));
          setError('');
        } else {
          const data = await response.json();
          setError(data.error || 'Something went wrong');
          setLifeLessons([]);
        }
      } catch (err) {
        setError('Error fetching life lessons');
        setLifeLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLifeLessons();
  }, [movieTitle]);

  const formatLesson = (lesson) => {
    const formattedLesson = lesson.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Replace **text** with <strong>text</strong>
    return { __html: formattedLesson };
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
        Life Lessons
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: '15px', color: '#333' }}>
        Movie Title: {movieTitle}
      </Typography>

      <Box sx={{ textAlign: 'left', display: 'inline-block', width: '100%' }}>
        {loading ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading life lessons...
          </Typography>
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : (
          <Box sx={{ padding: '10px', borderRadius: '8px' }}>
            
            {lifeLessons.map((lesson, index) => (
              <Typography
                key={index}
                variant="body1"
                sx={{ fontSize: '16px', color: '#333', m: 2 }}
                dangerouslySetInnerHTML={formatLesson(lesson)} // Render the formatted HTML
              ></Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GenerateMovieLessons;
