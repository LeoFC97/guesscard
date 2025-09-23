# MTG Loldle Frontend

Welcome to the MTG Loldle project! This is a web-based game inspired by the popular guessing game format, where players guess Magic: The Gathering cards based on hints and feedback.

## Project Structure

The frontend of the MTG Loldle project is structured as follows:

```
frontend/
├── src/
│   ├── App.tsx               # Main application component that sets up routing
│   ├── components/
│   │   └── CardGuess.tsx     # Component for guessing Magic: The Gathering cards
│   ├── pages/
│   │   └── Home.tsx          # Landing page displaying game instructions
│   └── types/
│       └── index.ts          # Type definitions for the application
├── package.json               # NPM configuration file for frontend dependencies
├── tsconfig.json             # TypeScript configuration file for the frontend
└── README.md                  # Documentation for the frontend project
```

## Getting Started

To get started with the MTG Loldle frontend, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd mtg-loldle/frontend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Features

- **Card Guessing**: Players can guess Magic: The Gathering cards based on hints provided after each guess.
- **User-Friendly Interface**: The frontend is designed to be intuitive and easy to navigate.
- **Responsive Design**: The application is responsive and works well on various devices.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

Enjoy playing MTG Loldle!