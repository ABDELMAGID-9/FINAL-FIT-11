# 🏋‍♂ FIT11 – Full-Stack Fitness & AI Training Platform

This is a complete full-stack application built for fitness tracking, nutrition logging, community engagement, and AI-powered training.

## 👥 Team Members

* Musab Barnawi: fullstack Developer 
* Omar Alharbi: Frontend Developer
* Abdelmagid Osman: fullstack Developer
## 🎯 Application Summary

The FIT11 platform integrates:
* *User Authentication* and Profile management.
* *Workout Tracking* and management.
* *Nutritional Log* management.
* A *Points and Level System* for motivation.
* *Community Hub* for social engagement (posts, comments, likes).
* *AI Features* for generating custom workouts and analyzing nutrition.
* *Admin Control Panel* for user and content moderation.

***

## ⚙ Technologies Used

| Layer | Technology Stack | Notes |
| :--- | :--- | :--- |
| *Backend API* | Node.js, *Express.js*, MongoDB (Mongoose) | Provides secure RESTful APIs. |
| *Database* | MongoDB + Mongoose | Handles flexible data storage. |
| *Frontend UI* | React, *Vite*, TypeScript | Modern, performant user interface. |
| *AI Engine* | *OpenAI GPT-5-Nano* | Powers workout generation and nutrition analysis. |
| *Hosting (Backend)* | Render | Live Backend API deployment. |
| *Hosting (Frontend)* | Vercel | Live Frontend deployment. |

***
## 🚀 Features

1. 🏋️‍♂️ AI Workout Builder
* Generates personalized 8-week training programs.
* Customizable based on goals (Hypertrophy, Strength, Fat Loss), experience level, and available equipment.
* Smart progression logic and deload weeks included.

2. 🎯 No-Rep Counter (Computer Vision)
* Uses the device camera to analyze exercise form in real-time.
* Provides instant feedback on rep quality (Perfect, Good, Poor).
* Auto-counts completed reps.

3. 🏆 Leaderboard & Gamification
* Global Leaderboard:** Compete with other users based on lifetime points.
* Challenges:** Join distance, streak, or volume challenges to earn points.
* Rewards Store:** Redeem points for exclusive merchandise (Water bottles, Towels, Apparel).
* Rank Protection:** Redeeming prizes deducts your *spendable balance* but maintains your *Lifetime Rank*.

4. 🎧 Audio & Video Library
* Curated fitness podcasts and educational videos.
* Integrated video player for training tips and motivation.

5. 👥 Community Hub
* Social feed to share progress and achievements.
* Like and comment on other users' posts.
* Top Contributors tracking.

6. 📊 Dashboard
* Centralized view of streaks, total points, and active plans.
* Quick access to daily tasks.

## 🌐 Deployment Details

| Layer | URL |
| :--- | :--- |
| *Frontend (Vercel)* | 🔗 https://final-fit-11-nhpn.vercel.app/ |
| *Backend API (Render)* | 

⚠ The frontend communicates with the backend through Render



## 📂 Project Structure
final-version/
│
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js
│   │   ├── models/User.js
│   │   ├── models/Workout.js
│   │   ├── models/NutritionLog.js
│   │   ├── routes/auth.js
│   │   ├── routes/workouts.js
│   │   ├── routes/ai.js
│   │   ├── routes/nutrition.js
│   │   └── server.js
│   ├── utils/aiProvider.js
│   └── package.json
│
├── FIT11/ (Frontend)
│   ├── src/components/…
│   ├── src/hooks/useAuth.tsx
│   ├── src/lib/api.ts
│   ├── src/App.tsx
│   ├── vite.config.ts
│   └── package.json
│
└── README.md

***

## 🔐 Authentication & Security

* *Mechanism:* JWT-based authentication.
* *Protected Routes:* Enforced using auth.js middleware.
* *Admin Access:* Secured via adminAuth middleware and isAdmin: true flag in the database.
* *Ban System:* Uses banCheck middleware to restrict banned users from community features.

## 📘 Key API Endpoints

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| *Registration* | POST | /api/auth/register | Creates a new user account. |
| *Login* | POST | /api/auth/login | Authenticates user. |
| *AI Workout* | POST | /api/ai/workout | Generates a custom workout plan. |
| *AI Nutrition* | POST | /api/ai/nutrition | Analyzes diet or generates meal plans. |
| *Posts* | GET/POST | /api/posts | Fetch or create community posts. |
| *Admin Controls* | PUT/DELETE | /api/admin/user/:id | Handles user banning and deletion. |

***

## 🚀 Local Setup Instructions

### Backend Setup

```bash
# 1.Navigate to backend directory
cd backend

# 2.Install dependencies
npm install

# 3.Create .env file with required environment variables
PORT=3000
MONGO_URI=mongodb+srv://MJ:123456Jj@cluster0.dgfggq3.mongodb.net/?appName=Cluster0
JWT_SECRET=change_me_to_a_long_random_string
CORS_ORIGIN=http://localhost:5173

AI_PROVIDER=openai
OPENAI_API_KEY=sk-****************************
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_MODEL=gpt-5-nano

# 4.Start the Server
npm start

### Frontend Setup

# 1. Navigate to frontend directory
cd FIT11

# 2.Install dependencies
npm install

# 3.Start development server
npm run dev
📖 Usage Examples

* Creating a Workout:** Navigate to the "AI Workout Builder" from the sidebar, select your goal (e.g., Hypertrophy), input your available equipment, and generate a plan.
* Traxck micros and macros with a Nutrition tracker:** Go to the "AI Nutrition Tracker", enter your dietary preferences and goals, and the AI will generate a customized macro & micros breakdown for you.
* Exploring the Audio Library:** Navigate to the "Audio Library" to listen to fitness podcasts or watch instructional videos directly within the app.