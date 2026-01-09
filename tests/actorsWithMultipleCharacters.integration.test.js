import { actors } from '../dataForQuestions.js';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('actorsWithMultipleCharacters Integration Tests', () => {
    let moviesPerActorData;
    let actorsWithMultipleCharactersData;

    beforeAll(async () => {
        const moviesPerActorResponse = await fetch(`${BASE_URL}/moviesPerActor`);
        if (!moviesPerActorResponse.ok) {
            throw new Error(`Failed to fetch moviesPerActor: ${moviesPerActorResponse.status}`);
        }
        moviesPerActorData = await moviesPerActorResponse.json();

        const actorsResponse = await fetch(`${BASE_URL}/actorsWithMultipleCharacters`);
        if (!actorsResponse.ok) {
            throw new Error(`Failed to fetch actorsWithMultipleCharacters: ${actorsResponse.status}`);
        }
        actorsWithMultipleCharactersData = await actorsResponse.json();
    });

    it('should return all actors that are also present in moviesPerActor (completeness test)', () => {
        const actorsWithMultiple = Object.keys(actorsWithMultipleCharactersData);
        const actorsInMoviesPerActor = Object.keys(moviesPerActorData);

        for (const actor of actorsWithMultiple) {
            expect(actorsInMoviesPerActor).toContain(actor);
        }
    });

    it('should only return actors from the initial actors list', () => {
        const returnedActors = Object.keys(actorsWithMultipleCharactersData);

        for (const actor of returnedActors) {
            expect(actors).toContain(actor);
        }
    });
});
