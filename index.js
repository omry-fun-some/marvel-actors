import express from 'express';
import config from './config/config.js';
import marvelRoutes from './routes/marvelRoutes.js';
import { initialize } from './controllers/marvelController.js';

const app = express();

app.use(express.json());

app.use('/', marvelRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
    try {
        await initialize();

        app.listen(config.server.port, () => {
            console.log(`Server is running on port ${config.server.port}`);
            console.log('Available endpoints:');
            console.log('  GET /moviesPerActor');
            console.log('  GET /actorsWithMultipleCharacters');
            console.log('  GET /charactersWithMultipleActors');
            console.log('  GET /health');
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
