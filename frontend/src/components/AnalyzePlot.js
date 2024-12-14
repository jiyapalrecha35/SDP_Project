import React, { useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress } from '@mui/material';

const AnalyzePlot = ({ plotSummary }) => {
    const [wordFrequencyImg, setWordFrequencyImg] = useState('');
    const [bigramImg, setBigramImg] = useState('');
    const [trigramImg, setTrigramImg] = useState('');
    const [emotionImg, setEmotionImg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyzePlot = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/analyze_plot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plot_summary: plotSummary }),
            });

            const result = await response.json();

            if (result.error) {
                console.error(result.error);
                // alert('Error analyzing plot!');
                return;
            }

            setWordFrequencyImg(`data:image/png;base64,${result.word_frequency_image}`);
            setBigramImg(`data:image/png;base64,${result.bigram_image}`);
            setTrigramImg(`data:image/png;base64,${result.trigram_image}`);
            setEmotionImg(`data:image/png;base64,${result.emotion_image}`);
        } catch (error) {
            console.error('Error fetching analyze plot:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (plotSummary) {
            handleAnalyzePlot();
        }
    }, [plotSummary]);

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
                Plot Analysis
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={4} justifyContent="center">
                    {/* Word Frequency Image */}
                    {wordFrequencyImg && (
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Word Frequency
                                    </Typography>
                                    <img src={wordFrequencyImg} alt="Word Frequency" style={{ width: '100%', borderRadius: '8px' }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Bigram Image */}
                    {bigramImg && (
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Bigrams
                                    </Typography>
                                    <img src={bigramImg} alt="Bigram Chart" style={{ width: '100%', borderRadius: '8px' }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Trigram Image */}
                    {trigramImg && (
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Trigrams
                                    </Typography>
                                    <img src={trigramImg} alt="Trigram Chart" style={{ width: '100%', borderRadius: '8px' }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Emotion Image */}
                    {emotionImg && (
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Emotion Analysis
                                    </Typography>
                                    <img src={emotionImg} alt="Emotion Chart" style={{ width: '100%', borderRadius: '8px' }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            )}
        </Box>
    );
};

export default AnalyzePlot;
