import { Router } from 'express';
import {
    getMoviesPerActor,
    getActorsWithMultipleCharacters,
    getCharactersWithMultipleActors,
    isReady
} from '../controllers/marvelController.js';

const router = Router();

function checkReady(req, res, next) {
    if (!isReady()) {
        return res.status(503).json({ error: 'Service is initializing. Please try again shortly.' });
    }
    next();
}

router.use(checkReady);

router.get('/moviesPerActor', (req, res) => {
    res.json(getMoviesPerActor());
});

router.get('/actorsWithMultipleCharacters', (req, res) => {
    res.json(getActorsWithMultipleCharacters());
});

router.get('/charactersWithMultipleActors', (req, res) => {
    res.json(getCharactersWithMultipleActors());
});

export default router;
