# MTG Loldle

MTG Loldle is a web-based game inspired by the popular guessing game format, where players guess Magic: The Gathering cards based on various clues and hints. This project consists of a backend built with TypeScript and Express, and a frontend built with React.

## Project Structure

The project is organized into two main directories: `backend` and `frontend`.

### Backend

- **src/app.ts**: Entry point of the backend application. Initializes the Express app, sets up middleware, and imports routes.
- **src/controllers/mtgController.ts**: Contains the `MtgController` class with methods to handle requests related to Magic: The Gathering cards.
- **src/routes/mtgRoutes.ts**: Defines the routes for the backend application using the `MtgController`.
- **src/services/mtgService.ts**: Contains the `MtgService` class with methods to fetch card data and validate user guesses.
- **src/types/index.ts**: Exports interfaces that define the structure of card data and guess results.
- **package.json**: Configuration file for npm, listing dependencies and scripts.
- **tsconfig.json**: TypeScript configuration file specifying compiler options.

### Frontend

- **src/App.tsx**: Main component of the frontend application, setting up routing and rendering the main layout.
- **src/components/CardGuess.tsx**: Functional component that allows users to input their guesses for the Magic: The Gathering cards.
- **src/pages/Home.tsx**: Landing page component displaying game instructions and the `CardGuess` component.
- **src/types/index.ts**: Exports interfaces defining properties for the `CardGuess` component.
- **package.json**: Configuration file for npm, listing dependencies and scripts.
- **tsconfig.json**: TypeScript configuration file specifying compiler options.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory and install dependencies:
   ```
   cd backend
   npm install
   ```

3. Navigate to the frontend directory and install dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Start the backend server:
   ```
   cd ../backend
   npm start
   ```

5. Start the frontend application:
   ```
   cd ../frontend
   npm start
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.