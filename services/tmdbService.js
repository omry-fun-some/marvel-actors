import axios from 'axios';
import config from '../config/config.js';

const cache = new Map();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempt = 1) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        if (error.response?.status === 429 && attempt < config.fetch.retryAttempts) {
            const retryAfter = error.response.headers['retry-after'] || config.fetch.retryDelay / 1000;
            await sleep(retryAfter * 1000);
            return fetchWithRetry(url, attempt + 1);
        }
        throw error;
    }
}

export async function getMovieCredits(movieId) {
    if (cache.has(movieId)) {
        return cache.get(movieId);
    }

    const url = `${config.tmdb.baseUrl}/movie/${movieId}/credits?api_key=${config.tmdb.apiKey}`;
    const data = await fetchWithRetry(url);

    const credits = data.cast.map(member => ({
        actorName: member.name,
        characterName: member.character?.trim() || 'Unknown'
    }));

    cache.set(movieId, credits);
    return credits;
}

export async function fetchAllMovieCredits(movies) {
    const entries = Object.entries(movies);
    const results = {};

    for (let i = 0; i < entries.length; i += config.fetch.concurrency) {
        const batch = entries.slice(i, i + config.fetch.concurrency);
        const batchResults = await Promise.all(
            batch.map(async ([movieName, movieId]) => {
                try {
                    const credits = await getMovieCredits(movieId);
                    return { movieName, credits };
                } catch (error) {
                    console.error(`Failed to fetch credits for ${movieName}:`, error.message);
                    return { movieName, credits: [] };
                }
            })
        );

        for (const { movieName, credits } of batchResults) {
            results[movieName] = credits;
        }
    }

    return results;
}

export function clearCache() {
    cache.clear();
}
