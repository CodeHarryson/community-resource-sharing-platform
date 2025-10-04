import React from 'react';
import API from '../api';
import { Card, CardContent, Typography, Button, CardActions } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function ItemCard({ resource }) {
    const { user } = useAuth();

    const handleRequest = async () => {
        if (!user) {
            alert('You must be logged in to request an item.');
            return;
        }
        try {
            await API.post('/requests', { resource_id: resource.id });
            alert('Request sent successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send request.');
        }
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div">{resource.title}</Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Category: {resource.category}
                </Typography>
                <Typography variant="body2">{resource.description}</Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                 <Typography variant="caption">Owner: {resource.owner_name}</Typography>
                <Button size="small" variant="outlined" onClick={handleRequest}>Request Item</Button>
            </CardActions>
        </Card>
    );
}