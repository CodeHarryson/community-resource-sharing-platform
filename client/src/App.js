import React from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateResource from './pages/CreateResource';
import { useAuth } from './context/AuthContext';
import NotificationBell from './components/NotificationBell';

export default function App() {
    const { user, logout } = useAuth();
    
    return (
        <BrowserRouter>
            <AppBar position="static" color="primary" elevation={2}>
                <Toolbar sx={{ gap: 2 }}>
                    <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                        <Box component="img" src="/uh-logo.png" alt="UH logo" sx={{ height: 36, mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Coogs R Us</Typography>
                    </Box>
                    <Button color="inherit" component={RouterLink} to="/">Home</Button>
                    <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>
                    {user ? (
                        <>
                            <NotificationBell />
                            <Button color="inherit" onClick={logout}>Logout</Button>
                        </>
                    ) : (
                        <>
                            <NotificationBell />
                            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            <Container component="main" sx={{ mt: 4, mb: 4, borderRadius: 2 }}>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path='/create' element={<CreateResource />} />
                </Routes>
            </Container>
        </BrowserRouter>
    );
}