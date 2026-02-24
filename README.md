🚀 Trello Clone (React + Firebase)

A high-performance, real-time Trello clone built with React, Tailwind CSS, and Firebase. This application supports real-time synchronization, Google Authentication, and persistent drag-and-drop task management.
✨ Key Features

    Google Authentication: Secure login using Google accounts to manage personal boards.

    Real-time Synchronization: Instant updates across all devices using Firestore onSnapshot listeners.

    Persistent Drag & Drop: Reorder cards within lists or move them across lists; positions are saved via numerical indexing to prevent flickering.

    Multi-Tagging System: Add multiple color-coded tags to cards to categorize tasks.

    Full CRUD Operations: Create, edit, and delete boards, lists, and individual cards without page refreshes.

📂 Project Structure
Plaintext

trello-clone/
├── src/
│ ├── components/
│ │ ├── Login.jsx # Google Login entry page
│ │ ├── Home.jsx # Board dashboard & creation
│ │ └── BoardView.jsx # Kanban board & DnD logic
│ ├── context/
│ │ └── AuthContext.jsx # Google Auth provider
│ ├── firebase.js # Firebase SDK initialization
│ ├── App.jsx # Routes & Context wrapper
│ └── main.jsx # Entry point
├── tailwind.config.js # Styling configuration
└── .env # Environment variables (Local only)

🛠️ Getting Started

1. Prerequisites

   Node.js (v18+)

   npm or yarn

2. Installation
   Bash

# Clone the repository

git clone https://github.com/YOUR_USERNAME/trello-clone.git

# Navigate to project

cd trello-clone

# Install dependencies

npm install

3. Firebase Configuration

   Go to the Firebase Console.

   Create a project and add a Web App.

   Enable Google Auth in the Authentication tab.

   Create a Firestore Database and set rules to allow authenticated access.

   Copy your Firebase config and paste it into src/firebase.js.

4. Run Development
   Bash

npm run dev

Open http://localhost:5173 in your browser.
🌐 Deployment (GitHub + Vercel)

Vercel provides the fastest way to deploy your React app with automatic CI/CD.

    Push to GitHub:
    Bash

    git add .
    git commit -m "Ready for deploy"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/trello-clone.git
    git push -u origin main

    Connect to Vercel:

        Go to Vercel.com and log in with your GitHub account.

        Click "Add New" > "Project".

        Import your trello-clone repository.

    Environment Variables:

        If you stored your Firebase API keys in a .env file, ensure you copy those key-value pairs into the Environment Variables section in the Vercel dashboard during the import process.

    Deploy:

        Click Deploy. Vercel will build your project and provide a live URL. Any future pushes to the main branch will trigger an automatic redeploy.
