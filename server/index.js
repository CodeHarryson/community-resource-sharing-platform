import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import resourcesRoutes from './routes/resources.js';
import requestsRoutes from './routes/requests.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/requests', requestsRoutes);

app.get('/', (req, res) => res.send({ok: true}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));