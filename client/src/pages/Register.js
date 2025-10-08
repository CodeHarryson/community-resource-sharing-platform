import React, { useState } from 'react';
// Corrected line: Import Link as RouterLink
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, TextField, Button, Typography, Box, Alert, Grid, Link } from '@mui/material';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">Sign Up</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    <TextField
                        margin="normal" required fullWidth id="name" label="Full Name"
                        name="name" autoComplete="name" autoFocus
                        value={name} onChange={e => setName(e.target.value)}
                    />
                    <TextField
                        margin="normal" required fullWidth id="email" label="Email Address"
                        name="email" autoComplete="email"
                        value={email} onChange={e => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal" required fullWidth name="password" label="Password"
                        type="password" id="password"
                        value={password} onChange={e => setPassword(e.target.value)}
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        Sign Up
                    </Button>
                     <Grid container justifyContent="flex-end">
                        <Grid item>
                            {/* Corrected usage: Use component={RouterLink} */}
                            <Link component={RouterLink} to="/login" variant="body2">
                                {"Already have an account? Sign In"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}