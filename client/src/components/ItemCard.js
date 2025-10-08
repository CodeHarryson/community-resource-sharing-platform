import React from 'react';
import API from '../api';
import { Card, CardContent, Typography, Button, CardActions, Box, Avatar, Stack } from '@mui/material';
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
            {/* image area */}
            <Box sx={{ height: 140, backgroundColor: 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                    component="img"
                    src={resource.image_url || `/images/${(resource.category || 'default').toLowerCase()}.svg`}
                    alt={resource.title}
                    sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                />
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{resource.owner_name ? resource.owner_name.charAt(0) : 'U'}</Avatar>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{resource.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{resource.owner_name} • 2 days ago • Nearby</Typography>
                    </Box>
                </Stack>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">{resource.category}</Typography>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>{resource.description}</Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                 <Typography variant="caption">Owner: {resource.owner_name}</Typography>
                <Button size="small" variant="contained" color="secondary" onClick={handleRequest}>Request</Button>
            </CardActions>
        </Card>
    );
}