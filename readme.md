# Full Stack Application

A modern full-stack application with a Node.js backend and a Vue.js frontend.

## Project Structure

```
├── backend/           # Node.js server application
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Express middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── server.js     # Main server file
│
└── project/          # Vue.js frontend application
    ├── src/          # Source code
    └── public/       # Static assets
```

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn
- MongoDB (if using MongoDB as database)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```sh
cd backend
```

2. Install dependencies:
```sh
npm install
```

3. Create a `.env` file in the backend directory with necessary environment variables:
```sh
PORT=3000
DATABASE_URL=your_database_url
```

4. Start the server:
```sh
npm start
```

The API server will be running on `http://localhost:3000`

### Frontend Setup

1. Navigate to the project directory:
```sh
cd project
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

The frontend application will be running on `http://localhost:5173`

## Features

- Modern full-stack architecture
- RESTful API
- Database integration
- Authentication system
- File upload capability
- Traffic management
- Logging system

## Documentation

- API documentation can be found in [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- Setup instructions in [SETUP_AND_RUN.md](backend/SETUP_AND_RUN.md)
- Traffic management details in [TRAFFIC_MANAGEMENT.md](backend/TRAFFIC_MANAGEMENT.md)

## Development

- Built with TypeScript for type safety
- Uses ESLint for code linting
- Configured with Tailwind CSS for styling
- Vite as the build tool

## Scripts

Backend:
```sh
npm start          # Start the server
npm run dev        # Start with nodemon for development
```

Frontend:
```sh
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details