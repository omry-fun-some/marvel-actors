import { jest } from '@jest/globals';

const mockAxios = {
    get: jest.fn()
};

jest.unstable_mockModule('axios', () => ({
    default: mockAxios
}));

const { getMovieCredits, clearCache } = await import('../services/tmdbService.js');

describe('TmdbService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearCache();
    });

    describe('getMovieCredits', () => {
        it('should fetch and return movie credits', async () => {
            mockAxios.get.mockResolvedValue({
                data: {
                    cast: [
                        { name: 'Robert Downey Jr.', character: 'Tony Stark' },
                        { name: 'Gwyneth Paltrow', character: 'Pepper Potts' }
                    ]
                }
            });

            const credits = await getMovieCredits(1726);

            expect(credits).toHaveLength(2);
            expect(credits[0]).toEqual({
                actorName: 'Robert Downey Jr.',
                characterName: 'Tony Stark'
            });
            expect(mockAxios.get).toHaveBeenCalledTimes(1);
        });

        it('should cache results and avoid duplicate API calls', async () => {
            mockAxios.get.mockResolvedValue({
                data: {
                    cast: [
                        { name: 'Robert Downey Jr.', character: 'Tony Stark' }
                    ]
                }
            });

            await getMovieCredits(1726);
            await getMovieCredits(1726);

            expect(mockAxios.get).toHaveBeenCalledTimes(1);
        });

        it('should handle missing character names', async () => {
            mockAxios.get.mockResolvedValue({
                data: {
                    cast: [
                        { name: 'Some Actor', character: null }
                    ]
                }
            });

            const credits = await getMovieCredits(9999);

            expect(credits[0].characterName).toBe('Unknown');
        });

        it('should trim whitespace from character names', async () => {
            mockAxios.get.mockResolvedValue({
                data: {
                    cast: [
                        { name: 'Actor', character: '  Tony Stark  ' }
                    ]
                }
            });

            const credits = await getMovieCredits(1111);

            expect(credits[0].characterName).toBe('Tony Stark');
        });
    });
});
