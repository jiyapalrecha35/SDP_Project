import React, { useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress } from '@mui/material';

const AnalyzeSentiment = ({ plotSummary }) => {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!plotSummary) return;

    setLoading(true);
    setError('');
    setSentiment(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/analyze_sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plot_summary: plotSummary }),
      });

      if (response.ok) {
        const data = await response.json();
        setSentiment(data);  // Store sentiment scores and images in state
      } else {
        const data = await response.json();
        setError(data.error || 'Error analyzing sentiment');
      }
    } catch (err) {
      setError('Error analyzing sentiment');
    } finally {
      setLoading(false);
    }
  };

  // Initially trigger the sentiment analysis when the component mounts
  React.useEffect(() => {
    if (plotSummary) {
      handleAnalyze();
    }
  }, [plotSummary]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Sentiment Analysis
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* {error && <Typography sx={{ color: 'red' }}>{error}</Typography>} */}

          {sentiment && (
            <Grid container spacing={4} justifyContent="center">
              {/* Sentiment Scores */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Sentiment Scores
                    </Typography>
                    <ul>
                      <li>Positive: {sentiment.sentiment_scores.reduce((acc, score) => acc + score.pos, 0)}</li>
                      <li>Neutral: {sentiment.sentiment_scores.reduce((acc, score) => acc + score.neu, 0)}</li>
                      <li>Negative: {sentiment.sentiment_scores.reduce((acc, score) => acc + score.neg, 0)}</li>
                      <li>Compound: {sentiment.sentiment_scores.reduce((acc, score) => acc + score.compound, 0)}</li>
                    </ul>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sentiment Trend Image */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Sentiment Trend Across Plot
                    </Typography>
                    <img
                      src={`data:image/png;base64,${sentiment.sentiment_trend_img}`}
                      alt="Sentiment Trend"
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Overall Sentiment Image */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Overall Sentiment Distribution
                    </Typography>
                    <img
                      src={`data:image/png;base64,${sentiment.overall_sentiment_img}`}
                      alt="Overall Sentiment"
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AnalyzeSentiment;
