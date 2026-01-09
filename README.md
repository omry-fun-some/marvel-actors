# Marvel Movies Actor Analysis API

A REST API service that analyzes Marvel movie casting data using The Movie Database (TMDB) API. It identifies actors who have played multiple roles across Marvel movies and characters who have been portrayed by multiple actors.

## Features

- Fetch and cache movie credits from TMDB API
- Track actors across 27 Marvel movies
- Identify actors playing multiple characters
- Identify characters played by multiple actors

## Prerequisites

- Node.js (v18 or higher)
- npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend_assignment_skeleton
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

Start the server:
```bash
npm start
```

The server will start on port 3000. On startup, it fetches credits for all Marvel movies from TMDB and builds lookup maps. This may take a few seconds.

## API Endpoints

### GET /moviesPerActor

Returns all Marvel movies each tracked actor has appeared in.

**Response:**
```json
{
  "Robert Downey Jr.": ["Iron Man", "Iron Man 2", "The Avengers", ...],
  "Chris Evans": ["Fantastic Four (2005)", "Captain America: The First Avenger", ...]
}
```

### GET /actorsWithMultipleCharacters

Returns actors who have played more than one character across Marvel movies.

**Response:**
```json
{
  "Chris Evans": [
    {"movieName": "Fantastic Four (2005)", "characterName": "Johnny Storm"},
    {"movieName": "Captain America: The First Avenger", "characterName": "Steve Rogers"}
  ]
}
```

### GET /charactersWithMultipleActors

Returns characters that have been played by more than one actor.

**Response:**
```json
{
  "War Machine": [
    {"movieName": "Iron Man", "actorName": "Terrence Howard"},
    {"movieName": "Iron Man 2", "actorName": "Don Cheadle"}
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Example Curl Commands

Query all endpoints with these curl commands:

```bash
# Health check
curl http://localhost:3000/health

# Get all movies per actor
curl http://localhost:3000/moviesPerActor

# Get actors who played multiple characters
curl http://localhost:3000/actorsWithMultipleCharacters

# Get characters played by multiple actors
curl http://localhost:3000/charactersWithMultipleActors

# Pretty print JSON output (requires jq)
curl -s http://localhost:3000/moviesPerActor | jq .
curl -s http://localhost:3000/actorsWithMultipleCharacters | jq .
curl -s http://localhost:3000/charactersWithMultipleActors | jq .

# Save response to file
curl -o movies.json http://localhost:3000/moviesPerActor

# With verbose output
curl -v http://localhost:3000/health
```

## Running Tests

Run the test suite:
```bash
npm test
```

## Project Structure

```
backend_assignment_skeleton/
├── index.js                 # Application entry point
├── package.json             # Project dependencies
├── dataForQuestions.js      # Marvel movies and actors data
├── config/
│   └── config.js            # TMDB API configuration
├── services/
│   └── tmdbService.js       # TMDB API integration with caching
├── controllers/
│   └── marvelController.js  # Data aggregation logic
├── routes/
│   └── marvelRoutes.js      # Route definitions
└── tests/
    ├── tmdbService.test.js  # Service unit tests
    └── marvelController.test.js  # Controller unit tests
```

## Technical Details

- **Framework**: Express.js
- **HTTP Client**: Axios
- **Testing**: Jest
- **Module System**: ES Modules

### Caching Strategy

The service uses in-memory caching to avoid redundant TMDB API calls:
- Movie credits are cached by movie ID
- Cache persists for the lifetime of the server
- Parallel fetching with controlled concurrency (5 requests at a time)

### Data Aggregation

On startup, the service:
1. Fetches credits for all 27 Marvel movies
2. Filters cast to only include the 24 tracked actors
3. Builds three lookup maps for fast endpoint responses

## License

ISC
