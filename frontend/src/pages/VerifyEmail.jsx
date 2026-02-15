import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        const verifyEmail = async () => {
            try {
                await authAPI.verifyEmail(token);
                setStatus('success');
                setMessage('Email verified successfully! You can now login.');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.detail || 'Verification failed');
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                {status === 'loading' && (
                    <>
                        <CircularProgress size={60} />
                        <Typography variant="h6" sx={{ mt: 3 }}>
                            Verifying your email...
                        </Typography>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle color="success" sx={{ fontSize: 80 }} />
                        <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                            Email Verified!
                        </Typography>
                        <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                            {message}
                        </Alert>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{ mt: 3 }}
                        >
                            Go to Login
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <Error color="error" sx={{ fontSize: 80 }} />
                        <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                            Verification Failed
                        </Typography>
                        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                            {message}
                        </Alert>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/login')}
                            sx={{ mt: 3 }}
                        >
                            Go to Login
                        </Button>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default VerifyEmail;
