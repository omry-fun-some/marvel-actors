import { fetchAllMovieCredits } from '../services/tmdbService.js';
import { movies, actors } from '../dataForQuestions.js';

const actorSet = new Set(actors);

let moviesPerActor = {};
let actorCharacterMap = {};
let characterActorMap = {};
let isInitialized = false;

function normalizeCharacterName(name) {
    return name.trim();
}

function extractCanonicalCharacterName(name) {
    let cleaned = name
        .replace(/\(uncredited\)/gi, '')
        .replace(/\(voice\)/gi, '')
        .trim();

    const parts = cleaned.split('/').map(p => p.trim()).filter(p => p.length > 0);

    const nameParts = new Set();
    for (const part of parts) {
        const normalized = part.toLowerCase().trim();
        if (normalized.length > 0) {
            nameParts.add(normalized);
        }
    }

    return {
        original: name.trim(),
        parts: Array.from(nameParts),
        primary: parts[0]?.toLowerCase().trim() || name.toLowerCase().trim()
    };
}

function findMatchingCharacterKey(characterInfo, existingKeys) {
    for (const existingKey of existingKeys) {
        const existingParts = existingKey.parts;
        for (const part of characterInfo.parts) {
            if (existingParts.includes(part)) {
                return existingKey;
            }
        }
    }
    return null;
}

function buildLookupMaps(allCredits) {
    const tempMoviesPerActor = {};
    const tempActorCharacterMap = {};
    const fuzzyCharacterGroups = [];

    for (const [movieName, credits] of Object.entries(allCredits)) {
        for (const { actorName, characterName } of credits) {
            if (!actorSet.has(actorName)) continue;

            const normalizedCharacter = normalizeCharacterName(characterName);
            const characterInfo = extractCanonicalCharacterName(characterName);

            if (!tempMoviesPerActor[actorName]) {
                tempMoviesPerActor[actorName] = new Set();
            }
            tempMoviesPerActor[actorName].add(movieName);

            if (!tempActorCharacterMap[actorName]) {
                tempActorCharacterMap[actorName] = [];
            }
            tempActorCharacterMap[actorName].push({
                movieName,
                characterName: normalizedCharacter
            });

            const matchingGroup = findMatchingCharacterKey(characterInfo, fuzzyCharacterGroups);
            if (matchingGroup) {
                for (const part of characterInfo.parts) {
                    if (!matchingGroup.parts.includes(part)) {
                        matchingGroup.parts.push(part);
                    }
                }
                matchingGroup.appearances.push({
                    movieName,
                    actorName,
                    originalCharacterName: normalizedCharacter
                });
            } else {
                fuzzyCharacterGroups.push({
                    parts: [...characterInfo.parts],
                    primary: characterInfo.primary,
                    appearances: [{
                        movieName,
                        actorName,
                        originalCharacterName: normalizedCharacter
                    }]
                });
            }
        }
    }

    moviesPerActor = {};
    for (const [actor, movieSet] of Object.entries(tempMoviesPerActor)) {
        moviesPerActor[actor] = Array.from(movieSet);
    }

    actorCharacterMap = tempActorCharacterMap;

    characterActorMap = {};
    for (const group of fuzzyCharacterGroups) {
        const displayName = group.primary
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        characterActorMap[displayName] = group.appearances.map(a => ({
            movieName: a.movieName,
            actorName: a.actorName
        }));
    }
}

export async function initialize() {
    if (isInitialized) return;

    console.log('Fetching movie credits from TMDB...');
    const allCredits = await fetchAllMovieCredits(movies);
    console.log(`Fetched credits for ${Object.keys(allCredits).length} movies`);

    buildLookupMaps(allCredits);
    isInitialized = true;
    console.log('Data initialization complete');
}

export function getMoviesPerActor() {
    return moviesPerActor;
}

export function getActorsWithMultipleCharacters() {
    const result = {};

    for (const [actorName, appearances] of Object.entries(actorCharacterMap)) {
        const uniqueCharacters = new Set(appearances.map(a => a.characterName));
        if (uniqueCharacters.size > 1) {
            result[actorName] = appearances;
        }
    }

    return result;
}

export function getCharactersWithMultipleActors() {
    const result = {};

    for (const [characterName, appearances] of Object.entries(characterActorMap)) {
        const uniqueActors = new Set(appearances.map(a => a.actorName));
        if (uniqueActors.size > 1) {
            result[characterName] = appearances;
        }
    }

    return result;
}

export function isReady() {
    return isInitialized;
}

export function reset() {
    moviesPerActor = {};
    actorCharacterMap = {};
    characterActorMap = {};
    isInitialized = false;
}
