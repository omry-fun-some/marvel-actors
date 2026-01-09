import dotenv from 'dotenv';

dotenv.config();

const config = {
    tmdb: {
        apiKey: 'ac505a02032a33d65dd28b41f72182e1',
        baseUrl: 'https://api.themoviedb.org/3'
    },
    server: {
        port: 3000
    },
    fetch: {
        concurrency: 5,
        retryAttempts: 3,
        retryDelay: 1000
    },
    auth: {
        token: process.env.AUTH_TOKEN
    }
};

export default config;
