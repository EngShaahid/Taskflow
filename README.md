# TaskFlow

A full-stack MERN task management app with JWT authentication, a REST API (Express + MongoDB/Mongoose), a React + Vite frontend, and a Google Gemini-powered AI chat assistant.

## Features

- User registration and login with JWT authentication
- Create, view, update and delete tasks
- Task statistics endpoint
- AI chatbot assistant (Google Gemini)
- Protected routes on both the API and the frontend

## Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | React 19, React Router 7, Axios, Vite        |
| Backend  | Node.js, Express 5, Mongoose, JWT, bcryptjs  |
| Database | MongoDB                                      |
| AI       | Google Gemini (`@google/genai`)              |

## Project Structure

```
taskflow/
├── backend/
│   ├── config/        # MongoDB connection
│   ├── controllers/   # auth, task, AI controllers
│   ├── middleware/    # JWT auth middleware
│   ├── models/        # User, Task schemas
│   ├── routes/        # auth, task, AI routes
│   ├── services/      # Gemini service
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Navbar, TaskCard, TaskForm, ChatBot, ProtectedRoute
        ├── context/     # AuthContext
        ├── pages/       # Login, Register, Dashboard
        └── services/    # Axios API client
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (local or MongoDB Atlas)
- A Google Gemini API key

### 1. Clone

```bash
git clone https://github.com/EngShaahid/Taskflow.git
cd Taskflow
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Start the server:

```bash
npm run dev    # with nodemon
# or
npm start
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The app runs at http://localhost:5173. `CLIENT_URL` in the backend must match the frontend's URL, or CORS will block requests.

## API Endpoints

| Method | Endpoint             | Auth | Description              |
| ------ | -------------------- | ---- | ------------------------ |
| GET    | `/api/health`        | No   | Health check             |
| POST   | `/api/auth/register` | No   | Register a new user      |
| POST   | `/api/auth/login`    | No   | Log in and receive a JWT |
| GET    | `/api/auth/me`       | Yes  | Get the current user     |
| POST   | `/api/tasks`         | Yes  | Create a task            |
| GET    | `/api/tasks`         | Yes  | List tasks               |
| GET    | `/api/tasks/stats`   | Yes  | Task statistics          |
| GET    | `/api/tasks/:id`     | Yes  | Get a task               |
| PUT    | `/api/tasks/:id`     | Yes  | Update a task            |
| DELETE | `/api/tasks/:id`     | Yes  | Delete a task            |
| POST   | `/api/ai/chat`       | Yes  | Chat with the AI         |

Postman collections are included in `backend/` for testing.

## Scripts

**Backend:** `npm start`, `npm run dev`
**Frontend:** `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`

## License

ISC
