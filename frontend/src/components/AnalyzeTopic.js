import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress } from '@mui/material';

const AnalyzeTopics = ({ plotSummary }) => {
  const [topicDistributionImg, setTopicDistributionImg] = useState('');
  const [wordCloudImages, setWordCloudImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyzeTopics = async () => {
    if (!plotSummary) return;

    setLoading(true);
    setError('');  // Clear previous errors
    setTopicDistributionImg('');  // Clear previous images
    setWordCloudImages([]);  // Clear previous word clouds

    try {
      const response = await fetch('http://127.0.0.1:5000/analyze_topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plot_summary: plotSummary }),
      });

      const result = await response.json();

      if (result.error) {
        console.error(result.error);
        setError('Error analyzing topics!');
        return;
      }

      setTopicDistributionImg(`data:image/png;base64,${result.topic_distribution_img}`);
      setWordCloudImages(result.wordcloud_images.map(image => `data:image/png;base64,${image}`));
    } catch (error) {
      console.error('Error fetching analyze topics:', error);
      setError('Error analyzing topics!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plotSummary) {
      handleAnalyzeTopics();
    }
  }, [plotSummary]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Topic Analysis
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* {error && <Typography sx={{ color: 'red' }}>{error}</Typography>} */}

          {/* Topic Distribution Image */}
          {topicDistributionImg && (
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Topic Distribution
                    </Typography>
                    <img
                      src={topicDistributionImg}
                      alt="Topic Distribution"
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          <br />

          {/* Word Clouds */}
          {wordCloudImages.length > 0 && (
            <Grid container spacing={4} justifyContent="center">
              {wordCloudImages.map((img, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Word Cloud {index + 1}
                      </Typography>
                      <img
                        src={img}
                        alt={`Word Cloud ${index + 1}`}
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AnalyzeTopics;
