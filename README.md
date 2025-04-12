# Let's Go Lean - Weight Management App

A React Native app for weight management and fitness tracking, built with Expo and Supabase.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd lets-go-lean
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations:
```bash
# Navigate to the db-setup directory
cd db-setup

# Run the migrations in sequence
psql -U your_username -d your_database -f 01-types.sql
psql -U your_username -d your_database -f 02-tables.sql
psql -U your_username -d your_database -f 03-rls.sql
psql -U your_username -d your_database -f 04-functions.sql
psql -U your_username -d your_database -f 05-indexes.sql

# Or run all migrations at once
psql -U your_username -d your_database -f 00-run-all.sql
```

5. Start the development server:
```bash
npm start
# or
yarn start
```

## Database Structure

The database is organized into several key tables:

1. `users`: Stores user profiles and preferences
2. `logs`: Parent table for all logging activities
3. `food_log_details`: Detailed food logging information
4. `activity_log_details`: Activity tracking data
5. `body_composition_log_details`: Body measurements and composition
6. `goals`: User goals and targets
7. `goal_progress`: Progress tracking against goals

## Key Features

- User authentication and profile management
- Food logging with detailed nutrition tracking
- Activity tracking with various metrics
- Body composition tracking
- Goal setting and progress monitoring
- Social features for community support

## Development

- The app uses Expo Router for navigation
- TypeScript for type safety
- Supabase for backend services
- React Native Paper for UI components

## Testing

Run tests with:
```bash
npm test
# or
yarn test
```

## Deployment

1. Build the app:
```bash
expo build:android
# or
expo build:ios
```

2. Deploy to the respective app stores following Expo's deployment guide.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
