# Inkline Docs — Collaborative Document Platform

Inkline Docs is a collaborative rich text editor platform designed for team productivity. It enables users to create documents, format content, collaborate with other team members in real-time, comment inline on selected text, browse version history rollbacks, and import/export documents.

### 🌐 Live Deployment
**Deployed URL**: [https://ink-line-three.vercel.app/](https://ink-line-three.vercel.app/)

---

## ✨ Features

*   **Secure Session Authentication**: Password-based login and signup flow along with quick-login buttons for seeded user testing.
*   **Rich Text Editor**: Fully-featured rich text editing experience (headings, lists, underline, bold, italic) with 3-second autosave capabilities.
*   **Real-Time Collaboration Presence**: Visual presence indicators in the document header listing active collaborators currently editing or viewing.
*   **Granular Access Roles**: Share documents with specific roles (`Viewer`, `Commenter`, `Editor`) with an autocomplete search for team members.
*   **Contextual Comments & Suggestions**: Drop comments matching specific highlighted text selections in the editor, with resolving and deleting controls.
*   **Version History Snapshots**: Automatic 5-minute throttled snapshots. Users can view past versions via a client-side formatted layout preview and restore them instantly.
*   **Document Import**: Create new documents instantly by importing `.txt` or `.md` files up to 5 MB.
*   **Document Export**: Export documents to standard Markdown files or print to PDF using custom clean printer styling sheets.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
*   **Editor Component**: Tiptap
*   **Database & ORM**: MongoDB, Mongoose
*   **Validation**: Zod
*   **Testing Library**: Vitest, React Testing Library

---

## 🚀 Getting Started

Follow these steps to run the application locally:

### 1. Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 2. Installation
Install the project dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root of the project:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Running the Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

The platform features an integration and unit test suite verifying user permissions, comment creation/deletion logic, presence heartbeats, version rollbacks, and formatting.

Run the tests using:
```bash
npm run test
```

---

## ☁️ Deployment Instructions

### Setting Up Environment Variables (Vercel)
If you deploy this application on Vercel or any server hosting provider, ensure the following environment variables are set in the dashboard:
*   `MONGODB_URI`: The MongoDB Atlas connection string. *(Make sure MongoDB Atlas Network Access is set to allow connections from all IP addresses `0.0.0.0/0` so Vercel serverless functions can connect).*
*   `NEXT_PUBLIC_APP_URL`: The production URL of the app (e.g., `https://ink-line-three.vercel.app`).
