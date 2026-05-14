# InterviewAI — AI-Powered Mock Interview Platform

A full-stack mock interview platform for fresher software developers. Conduct realistic verbal interviews powered by Groq LLaMA-3.3-70B with complete conversation history stored in MySQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS 3, Clerk Auth |
| Backend | Spring Boot 3.2, Java 17 |
| Database | MySQL 8 |
| AI | Groq API (LLaMA-3.3-70B) |
| Speech | Browser SpeechRecognition API |

---

## Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.8+
- MySQL 8+
- Groq API key (free at https://console.groq.com)
- Clerk account (free at https://clerk.com)

---

## Setup

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
groq.api.key=YOUR_GROQ_API_KEY
clerk.jwks.url=https://YOUR_CLERK_INSTANCE.clerk.accounts.dev/.well-known/jwks.json
```

**Find your Clerk JWKS URL:**
1. Go to https://dashboard.clerk.com
2. Select your app → API Keys
3. Copy the "Publishable key" (starts with `pk_`)
4. Your JWKS URL is: `https://<your-clerk-frontend-api>/.well-known/jwks.json`
   (shown on the same page as "Frontend API URL")

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
REACT_APP_API_URL=http://localhost:8080/api
```

```bash
npm install
npm start
```

Frontend runs on `http://localhost:3000`

---

## Interview Tracks

| Track | Topics Covered |
|-------|---------------|
| Java Developer | OOP, Collections, Multithreading, Spring Boot |
| Frontend Developer | HTML/CSS, JavaScript, React, Browser APIs |
| Full Stack | Frontend + Backend + Databases + APIs |
| DSA Interview | Arrays, Trees, DP, Graphs, Complexity |
| HR Round | Behavioural, motivation, communication |
| CS Fundamentals | OS, DBMS, Networks, OOP Concepts |

---

## API Endpoints

### Users
- `POST /api/users/sync` — Create or update user from Clerk
- `GET /api/users/{clerkId}` — Get user by Clerk ID

### Interviews
- `POST /api/interviews/start` — Start a new interview session
- `PUT /api/interviews/{id}/end` — End an interview
- `GET /api/interviews/user/{clerkId}` — Get all interviews for a user
- `GET /api/interviews/{id}` — Get a single interview

### Messages
- `POST /api/messages/send` — Send user answer, get AI response
- `GET /api/messages/{interviewId}` — Get all messages for an interview

---

## Database Schema

```
users          → id, clerk_id, email, name, profile_image_url, created_at
interviews     → id, user_id, role, start_time, end_time, status
messages       → id, interview_id, sender (AI|USER), content, timestamp
```

---

## Project Structure

```
Verbal Interview/
├── frontend/                  # React app
│   ├── src/
│   │   ├── pages/             # Home, Dashboard, InterviewPage, HistoryPage
│   │   ├── components/
│   │   │   ├── interview/     # InterviewRoom, ChatPanel, MicButton, Timer
│   │   │   └── dashboard/     # CategoryCard
│   │   ├── hooks/             # useSpeechRecognition
│   │   ├── context/           # InterviewContext
│   │   └── services/          # api.js (Axios client)
│   └── package.json
│
├── backend/                   # Spring Boot app
│   └── src/main/java/com/interview/
│       ├── model/             # User, Interview, Message entities
│       ├── repository/        # JPA repositories
│       ├── service/           # UserService, InterviewService, MessageService, GroqService
│       ├── controller/        # REST controllers
│       ├── dto/               # Request/response DTOs
│       ├── security/          # ClerkJwtFilter
│       └── config/            # SecurityConfig, WebClientConfig, GlobalExceptionHandler
│
└── database/
    └── schema.sql             # MySQL schema
```

---

## How It Works

1. User signs in via Clerk → user synced to MySQL
2. User picks an interview track on the Dashboard
3. Backend creates an interview session, calls Groq for the opening question
4. User speaks → Browser SpeechRecognition converts voice to text
5. Text sent to backend → saved to `messages` → Groq called with full history
6. AI response returned → saved to `messages` → displayed in chat
7. User ends interview → status set to COMPLETED
8. Full transcript visible in History page

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle microphone on/off |

---

## Future Enhancements (Scalability Ready)

- [ ] AI evaluation report after interview ends
- [ ] Analytics dashboard (question-by-question scoring)
- [ ] Resume-based personalized interviews
- [ ] Text-to-speech for AI questions
- [ ] Coding assessment integration
- [ ] Admin panel for question management
