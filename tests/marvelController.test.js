import { jest } from '@jest/globals';

const mockFetchAllMovieCredits = jest.fn();

jest.unstable_mockModule('../services/tmdbService.js', () => ({
    fetchAllMovieCredits: mockFetchAllMovieCredits
}));

jest.unstable_mockModule('../dataForQuestions.js', () => ({
    movies: {
        'Iron Man': 1726,
        'Captain America: The First Avenger': 1771,
        'Fantastic Four (2005)': 9738
    },
    actors: ['Robert Downey Jr.', 'Chris Evans', 'Scarlett Johansson']
}));

const {
    initialize,
    getMoviesPerActor,
    getActorsWithMultipleCharacters,
    getCharactersWithMultipleActors,
    isReady,
    reset
} = await import('../controllers/marvelController.js');

describe('MarvelController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        reset();
    });

    describe('getMoviesPerActor', () => {
        it('should return movies grouped by actor', async () => {
            mockFetchAllMovieCredits.mockResolvedValue({
                'Iron Man': [
                    { actorName: 'Robert Downey Jr.', characterName: 'Tony Stark' },
                    { actorName: 'Scarlett Johansson', characterName: 'Black Widow' }
                ],
                'Captain America: The First Avenger': [
                    { actorName: 'Chris Evans', characterName: 'Steve Rogers' }
                ]
            });

            await initialize();

            const result = getMoviesPerActor();

            expect(result['Robert Downey Jr.']).toContain('Iron Man');
            expect(result['Chris Evans']).toContain('Captain America: The First Avenger');
            expect(result['Scarlett Johansson']).toContain('Iron Man');
        });
    });

    describe('getActorsWithMultipleCharacters', () => {
        it('should return actors who played multiple characters', async () => {
            mockFetchAllMovieCredits.mockResolvedValue({
                'Fantastic Four (2005)': [
                    { actorName: 'Chris Evans', characterName: 'Johnny Storm' }
                ],
                'Captain America: The First Avenger': [
                    { actorName: 'Chris Evans', characterName: 'Steve Rogers' }
                ]
            });

            await initialize();

            const result = getActorsWithMultipleCharacters();

            expect(result['Chris Evans']).toBeDefined();
            expect(result['Chris Evans'].length).toBe(2);
            expect(result['Chris Evans']).toContainEqual({
                movieName: 'Fantastic Four (2005)',
                characterName: 'Johnny Storm'
            });
            expect(result['Chris Evans']).toContainEqual({
                movieName: 'Captain America: The First Avenger',
                characterName: 'Steve Rogers'
            });
        });

        it('should not include actors who played only one character', async () => {
            mockFetchAllMovieCredits.mockResolvedValue({
                'Iron Man': [
                    { actorName: 'Robert Downey Jr.', characterName: 'Tony Stark' }
                ]
            });

            await initialize();

            const result = getActorsWithMultipleCharacters();

            expect(result['Robert Downey Jr.']).toBeUndefined();
        });
    });

    describe('getCharactersWithMultipleActors', () => {
        it('should return characters played by multiple actors', async () => {
            mockFetchAllMovieCredits.mockResolvedValue({
                'Iron Man': [
                    { actorName: 'Robert Downey Jr.', characterName: 'War Machine' }
                ],
                'Captain America: The First Avenger': [
                    { actorName: 'Chris Evans', characterName: 'War Machine' }
                ]
            });

            await initialize();

            const result = getCharactersWithMultipleActors();

            expect(result['War Machine']).toBeDefined();
            expect(result['War Machine'].length).toBe(2);
        });
    });

    describe('isReady', () => {
        it('should return true after initialization', async () => {
            mockFetchAllMovieCredits.mockResolvedValue({});

            await initialize();

            expect(isReady()).toBe(true);
        });
    });
});
