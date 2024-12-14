import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import  {useNavigate } from 'react-router-dom';

const NeumorphicCard = ({ children, height = 'auto' }) => (
  <Box
    sx={{
      borderRadius: '24px',
      background: 'linear-gradient(to top left, #EAD8B1, #6A9AB0, #3A6D8C)',
      boxShadow: `
        8px 8px 16px rgba(58, 109, 140, 0.5),
        -8px -8px 16px rgba(234, 216, 177, 0.5)
      `,
      p: 3,
      height,
    }}
  >
    {children}
  </Box>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('info');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setToastMessage('Please enter a movie name');
      setToastSeverity('warning');
      setOpenToast(true);
      return;
    }

    try {
      setToastMessage('Searching for plot...');
      setToastSeverity('info');
      setOpenToast(true);

      const response = await fetch(
        `http://127.0.0.1:5000/api/movie-plot?movie_title=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data.plot) {
        navigate(`/movie/${encodeURIComponent(searchQuery)}`);
      } else {
        setToastMessage(data.error || 'Plot not found');
        setToastSeverity('error');
        setOpenToast(true);
      }
    } catch (error) {
      setToastMessage('Error fetching movie plot');
      setToastSeverity('error');
      setOpenToast(true);
    }
  };

  const handleCloseToast = () => {
    setOpenToast(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #E5E1DA, #B3C8CF, #89A8B2)',
        p: 4,
        mt:10
      }}
    >
      <Container maxWidth="md">
        <NeumorphicCard height="auto">
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              textAlign: 'center',
              mb: 4,
              color: '#2c3e50',
            }}
          >
            Movie Info Finder
          </Typography>

          {/* New Image and Description Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 4 },
            mb: 4,
            alignItems: { xs: 'center', md: 'flex-start' }
          }}>
            <Box
              component="img"
              src="/movie.jpeg"
              alt="Movie Analysis"
              sx={{
                width: { xs: '150px', sm: '180px', md: '200px' },
                height: { xs: '150px', sm: '180px', md: '200px' },
                objectFit: 'cover',
                borderRadius: '16px',
                boxShadow: '4px 4px 8px #c8ccd1, -4px -4px 8px #ffffff',
              }}
            />
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  color: '#2c3e50',
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                }}
              >
                Why Movie Analysis Matters
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#2c3e50',
                  lineHeight: 1.6,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Movie analysis helps us understand the deeper meanings, cultural impacts, and artistic elements of films. It enhances our viewing experience by revealing storytelling techniques, character development, and thematic elements that might otherwise go unnoticed.
              </Typography>
            </Box>
          </Box>

          {/* Existing Subtitle */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize:'30px',
              fontWeight:'800',
              textAlign: 'center',
              mb: 4,
              color: '#2c3e50',
            }}
          >
            Fetch Movie Plot
          </Typography>

          {/* Search Section */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a movie name"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px',
                  backgroundColor: '#e8ecf1',
                  boxShadow: 'inset 4px 4px 8px #c8ccd1, inset -4px -4px 8px #ffffff',
                  '& fieldset': { border: 'none' },
                },
                '& .MuiOutlinedInput-input': {
                  pl: 3,
                },
              }}
            />
            <Button
              onClick={handleSearch}
              sx={{
                minWidth: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#3498db',
                color: 'white',
                boxShadow: '4px 4px 8px #c8ccd1, -4px -4px 8px #ffffff',
                '&:hover': {
                  backgroundColor: '#2980b9',
                },
              }}
            >
              <SearchIcon />
            </Button>
          </Box>
        </NeumorphicCard>

      </Container>
      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toastSeverity}
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage; 