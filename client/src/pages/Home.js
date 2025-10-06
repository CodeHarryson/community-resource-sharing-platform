import React, { useEffect, useState } from 'react';
import API from '../api';
import ItemCard from '../components/ItemCard';
import { Container, Typography, Grid } from '@mui/material';

export default function Home() {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        API.get('/resources')
            .then(res => setResources(res.data))
            .catch(console.error);
    }, []);

    // Local fallback sample items so the UI can be previewed without the API
    useEffect(() => {
        if (!resources.length) {
            setResources([
                { id: 1, title: 'Gently used sofa', description: 'Comfortable 3-seater sofa in good condition.', category: 'Furniture', owner_name: 'Alice Johnson' },
                { id: 2, title: 'Calculus textbook - Stewart', description: 'Stewart Calculus 8th edition, like new.', category: 'Textbook', owner_name: 'Bob Martinez' },
                { id: 3, title: 'Board games bundle', description: 'Catan, Ticket to Ride, Carcassonne.', category: 'Games', owner_name: 'Carol Nguyen' }
            ]);
        }
    }, []);

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Available Items
            </Typography>
            <Grid container spacing={3}>
                {resources.map(r => (
                    <Grid item key={r.id} xs={12} sm={6} md={4}>
                        <ItemCard resource={r} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}