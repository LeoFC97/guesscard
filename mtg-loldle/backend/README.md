# MTG Loldle Backend

## Overview
MTG Loldle is a web-based game inspired by the popular guessing game format, utilizing Magic: The Gathering cards. Players will guess the names of cards based on various hints and clues provided by the application.

## Technologies Used
- TypeScript
- Express.js
- Node.js

## Project Structure
The backend of the application is structured as follows:

```
backend
├── src
│   ├── app.ts                # Entry point of the application
│   ├── controllers           # Contains controllers for handling requests
│   │   └── mtgController.ts  # Controller for Magic: The Gathering card operations
│   ├── routes                # Defines the API routes
│   │   └── mtgRoutes.ts      # Routes for card-related operations
│   ├── services              # Contains business logic
│   │   └── mtgService.ts     # Service for fetching card data and validating guesses
│   └── types                 # Type definitions
│       └── index.ts          # TypeScript interfaces for the application
├── package.json              # NPM package configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Documentation for the backend
```

## Installation
To set up the backend, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd mtg-loldle/backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Running the Application
To start the backend server, use the following command:
```
npm start
```

The server will run on `http://localhost:3000` by default.

## API Endpoints
The backend exposes several API endpoints for interacting with Magic: The Gathering cards. Refer to the `mtgRoutes.ts` file for detailed route definitions.

## Contribution
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.