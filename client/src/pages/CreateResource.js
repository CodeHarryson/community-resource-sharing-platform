import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';

export default function CreateResource() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await API.post('/resources', { title, description, category });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create item.');
        }
    };

    return (
        <Container component='main' maxWidth='sm'>
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Typography component='h1' variant='h5'>List a new Item</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                    {error && <Alert severity='error' sx={{ width: '100%', mb: 2}}>{error}</Alert>}
                    <TextField
                        margin='normal' required fullWidth id='title' label='Item Title'
                        name='title' autoFocus
                        value={title} onChange={e => setTitle(e.target.value)}
                    />
                    <TextField
                    margin="normal" required fullWidth name="description" label="Description"
                    id="description" multiline rows={4}
                    value={description} onChange={e => setDescription(e.target.value)}
                    />
                    <TextField
                    margin="normal" required fullWidth name="category" label="Category (ex. Textbook, Furniture, Games)"
                    id="category" multiline rows={4}
                    value={category} onChange={e => setCategory(e.target.value)}
                    />
                    <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2}}>
                        Create Item
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
