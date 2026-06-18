# Inkline Docs

Inkline Docs is a lightweight document collaboration platform built with Next.js 15, TypeScript, MongoDB Atlas, Mongoose, Tailwind CSS, Shadcn UI patterns, Tiptap, Zod, and Vitest.

## Features

- Cookie-based login with seeded users: `alice@test.com`, `bob@test.com`, `charlie@test.com`
- Dashboard for owned documents and documents shared with the current user
- Rich text editing with autosave every 3 seconds when content changes
- File import for `.txt` and `.md` files up to 5 MB
- Sharing by seeded user email with owner-only controls
- Route handlers for document CRUD, upload, and sharing

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment values from `.env.example` into `.env.local`.

3. Provide a MongoDB Atlas connection string in `MONGODB_URI`.

4. Run the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Scripts

- `npm run dev` starts the local Next.js server
- `npm run build` verifies the production build
- `npm run lint` runs ESLint
- `npm test` runs the Vitest suite

## Architecture Notes

- `src/app` contains the App Router pages and route handlers.
- `src/lib/services/documents.ts` centralizes document permissions and persistence logic.
- `src/lib/auth.ts` resolves the cookie-backed current user.
- `src/models` defines the Mongoose schemas for `User` and `Document`.
- `src/components` contains the dashboard, login, editor, and UI primitives.
- Tiptap content is stored as JSON in MongoDB to preserve formatting across refreshes.

## Testing

The test suite uses `mongodb-memory-server` so document and sharing tests run against a real ephemeral MongoDB instance without touching Atlas.

Required tests are included:

- `src/tests/document-create.test.ts`
- `src/tests/document-share.test.ts`
- `src/tests/upload-validation.test.ts`

There is also a small React Testing Library smoke test for the login picker UI.

## Deployment

### Vercel

1. Push the project to a Git provider.
2. Import the repository into Vercel.
3. Set `MONGODB_URI` and `NEXT_PUBLIC_APP_URL` in the Vercel project environment settings.
4. Deploy with the default Next.js build command: `npm run build`.

### MongoDB Atlas

1. Create an Atlas cluster.
2. Add a database user with read/write access.
3. Add your Vercel outbound IP rules if your cluster uses an IP allowlist.
4. Paste the connection string into `MONGODB_URI`.

## Non-goals

This implementation intentionally does not include real-time collaboration, WebSockets, CRDTs, comments, version history, or activity logs.
