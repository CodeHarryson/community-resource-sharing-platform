import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Button, Box, Paper, List, ListItem, ListItemText, Divider, IconButton, CircularProgress } from '@mui/material';
import { CheckCircleOutline, CancelOutlined } from '@mui/icons-material';

export default function Dashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Get the user from our context

    useEffect(() => {
        // Only fetch data if the user is logged in
        if (user) {
            API.get('/requests/owner')
                .then(res => {
                    setRequests(res.data);
                })
                .catch(console.error)
                .finally(() => {
                    setLoading(false);
                });
        } else {
            // If there's no user, we're not loading anything
            setLoading(false);
        }
    }, [user]); // Re-run this effect if the user object changes

    const handleAction = async (id, action) => {
        try {
            await API.patch(`/requests/${id}`, { action });
            // Refresh the list after an action
            const res = await API.get('/requests/owner');
            setRequests(res.data);
        } catch (err) {
            alert('Failed to update request');
        }
    };

    // While waiting for the user object to be determined
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }
    
    // If loading is finished and there is still no user, prompt to login
    if (!user) {
        return (
            <Container>
                <Typography variant="h5" align="center">
                    Please <RouterLink to="/login">login</RouterLink> to view your dashboard.
                </Typography>
            </Container>
        );
    }

    // If we have a user, render the dashboard
    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">Dashboard</Typography>
                <Button component={RouterLink} to="/create" variant="contained">
                    Create New Item
                </Button>
            </Box>
            <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
                <Typography variant="h6">Welcome, {user.name}!</Typography>
                <Typography variant="body1">Your Credits: {user.credits}</Typography>
            </Paper>

            <Typography variant="h5" component="h2" gutterBottom>
                Requests for Your Items
            </Typography>
            <Paper>
                <List>
                    {(requests.length > 0 ? requests : [
                        { id: 101, resource_title: 'Gently used sofa', requester_name: 'Bob Martinez', status: 'pending' },
                        { id: 102, resource_title: 'Dining table (round)', requester_name: 'Carol Nguyen', status: 'approved' }
                    ]).map((r, index) => (
                        <React.Fragment key={r.id}>
                            <ListItem
                                secondaryAction={
                                    r.status === 'pending' && (
                                        <>
                                            <IconButton edge="end" aria-label="approve" onClick={() => handleAction(r.id, 'approve')} color="success">
                                                <CheckCircleOutline />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="deny" onClick={() => handleAction(r.id, 'deny')} color="error" sx={{ ml: 1 }}>
                                                <CancelOutlined />
                                            </IconButton>
                                        </>
                                    )
                                }
                            >
                                <ListItemText
                                    primary={`Request for "${r.resource_title}"`}
                                    secondary={`From: ${r.requester_name} | Status: ${r.status}`}
                                />
                            </ListItem>
                            {index < requests.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Container>
    );
}