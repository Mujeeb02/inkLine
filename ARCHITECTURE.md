# Architecture Note — Inkline Document Collaboration Platform

> **Stack**: Next.js 15 · React 19 · TypeScript · Tailwind CSS · Tiptap · MongoDB (Mongoose) · Zod · Vitest

---

## Overview

Inkline is a full-stack document collaboration platform built as a Next.js 15 App Router application. It follows a **feature-based modular architecture** that cleanly separates concerns across four layers: routing, business logic, data access, and UI.

---

## Folder Structure

```
src/
├── app/                        # Next.js App Router pages + API route handlers (thin delegates)
│   ├── api/
│   │   ├── comments/[id]/      # PATCH (resolve), DELETE comment
│   │   ├── documents/[id]/     # PATCH, DELETE /api/documents/:id
│   │   │   ├── comments/       # GET (list), POST (add) document comments
│   │   │   ├── presence/       # GET (active users), POST (heartbeat) presence
│   │   │   └── versions/       # GET (list versions), POST (restore version)
│   │   ├── documents/          # GET, POST /api/documents
│   │   ├── share/              # POST, PATCH, DELETE share management
│   │   ├── upload/             # POST /api/upload
│   │   └── users/              # GET /api/users
│   ├── dashboard/page.tsx      # Server Component — fetches docs, renders DocumentWorkspace
│   ├── documents/[id]/page.tsx # Server Component — resolves permission, renders DocumentEditor
│   └── login/page.tsx          # Server Component — renders LoginCard
│
├── modules/                    # Pure server-side business logic (no React)
│   ├── comment/                # model · service · controller · routes · validation
│   ├── document/               # model · repository · service · controller · routes · validation · types
│   │   └── migration/          # migrate-shared-with.ts
│   ├── presence/               # model · service · routes
│   ├── share/                  # service · controller · routes · validation
│   ├── upload/                 # service · controller · routes · validation
│   ├── user/                   # model · repository · service · controller · routes · validation
│   ├── version/                # model · service · controller · routes
│   └── shared/
│       ├── constants/          # SESSION_COOKIE_NAME, SEEDED_USERS, EMPTY_DOCUMENT_CONTENT
│       ├── database/db.ts      # Mongoose singleton connection with global cache
│       ├── errors/             # AppError class (status + message)
│       ├── middleware/auth.ts  # getCurrentUser, requireUser — reads session cookie → DB
│       └── utils/              # Tiptap extensions, content normalization, markdown converter
│
├── features/                   # Client-side feature components
│   ├── auth/components/        # LoginCard — tabs, password fields, quick login buttons
│   ├── documents/
│   │   ├── components/         # DocumentWorkspace, DocumentEditor, EditorToolbar, EditorHeader, PresenceAvatars, CommentPanel, VersionHistoryPanel, …
│   │   ├── hooks/              # use-autosave, use-presence, use-comments, use-versions
│   │   ├── services/           # DocumentClientService — fetch wrappers for API routes
│   │   └── utils/              # export.ts (Markdown/PDF parsing)
│   ├── sharing/
│   │   ├── components/         # ShareModal — searchable user dropdown, role selectors, share list
│   │   └── services/           # SharingClientService
│   └── uploads/
│       ├── components/         # UploadModal — drag/drop, file picker
│       └── services/           # UploadClientService
│
├── shared/                     # Design system (reusable across features)
│   ├── components/
│   │   ├── layout/             # WorkspaceLayout, Sidebar (with logout, Cmd+K)
│   │   ├── modals/             # CommandSearch (Ctrl+K document search)
│   │   ├── providers/          # ToastProvider (success/error toasts)
│   │   └── ui/                 # Button, Input, Dialog, Label (Shadcn-style primitives)
│   └── utils/                  # formatDate
│
└── tests/                      # Vitest + React Testing Library
    ├── document-create.test.ts
    ├── document-share.test.ts
    ├── upload-validation.test.ts
    ├── login-card.test.tsx
    ├── presence.test.ts
    ├── comments.test.ts
    ├── versions.test.ts
    ├── roles.test.ts
    └── export.test.ts
```

---

## Layer Responsibilities

| Layer | Location | Role |
|---|---|---|
| **Route Handler** | `src/app/api/*/route.ts` | 1-liner delegates — call `Module.Routes.*()`, return response |
| **Routes** | `src/modules/*/routes.ts` | Auth guard + request parsing + calls Controller |
| **Controller** | `src/modules/*/controller.ts` | Orchestrates Service calls, maps results |
| **Service** | `src/modules/*/service.ts` | Business rules, validation, cross-domain logic |
| **Repository** | `src/modules/*/repository.ts` | Mongoose queries only — no business logic |
| **Model** | `src/modules/*/model.ts` | Mongoose Schema + TypeScript type |
| **Validation** | `src/modules/*/validation.ts` | Zod schemas |

---

## Authentication

Session-based (no JWT, no OAuth):

1. User selects identity from **Quick Login** buttons (Alice / Bob / Charlie — seeded users) **OR** signs up / signs in with email + bcrypt password.
2. Server Action sets an `HttpOnly` cookie (`inkline-user = email`).
3. Every protected page / API route calls `getCurrentUser()` → reads cookie → looks up user in MongoDB.
4. Seeded users are upserted on every auth operation (`ensureSeedUsers`), so the DB is always populated.

---

## Data Model

```
User          { _id, email, passwordHash?, createdAt, updatedAt }
Document      { _id, title, content (Tiptap JSON), ownerId → User, sharedWith: [{ userId → User, role: "viewer"|"commenter"|"editor" }], createdAt, updatedAt }
Presence      { _id, documentId → Document, userId → User, email, lastSeen: Date } (TTL: 30s on lastSeen)
Comment       { _id, documentId → Document, authorId → User, authorEmail, body, resolved: Boolean, selection: { from, to, text }, createdAt, updatedAt }
Version       { _id, documentId → Document, savedBy → User, savedByEmail, title, content (Tiptap JSON), version: Number, createdAt }
```

### Permission Model (Access Control Matrix)

| Action | Owner | Editor | Commenter | Viewer |
|---|:---:|:---:|:---:|:---:|
| **View content** | ✅ | ✅ | ✅ | ✅ |
| **View history** | ✅ | ✅ | ✅ | ✅ |
| **Export MD/PDF**| ✅ | ✅ | ✅ | ✅ |
| **Add comments** | ✅ | ✅ | ✅ | ❌ |
| **Resolve comments**| ✅ | ✅ | ✅ | ❌ |
| **Delete comments**| ✅ | ✅ (Author only) | ✅ (Author only) | ❌ |
| **Edit content** | ✅ | ✅ | ❌ | ❌ |
| **Restore version**| ✅ | ✅ | ❌ | ❌ |
| **Rename document**| ✅ | ❌ | ❌ | ❌ |
| **Share document** | ✅ | ❌ | ❌ | ❌ |
| **Delete document**| ✅ | ❌ | ❌ | ❌ |

---

## API Surface

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/documents` | Required | List owned + shared documents |
| `POST` | `/api/documents` | Required | Create new document |
| `PATCH` | `/api/documents/:id` | Required | Update title (owner only) and/or content (owner/editor) |
| `DELETE` | `/api/documents/:id` | Required | Delete (owner only) |
| `POST` | `/api/share` | Required | Share document with a user (owner only) |
| `PATCH` | `/api/share` | Required | Update share role (owner only) |
| `DELETE` | `/api/share` | Required | Remove share access (owner only) |
| `POST` | `/api/upload` | Required | Upload `.txt`/`.md` → create document |
| `GET` | `/api/users` | None | List all users (for share modal dropdown) |
| `GET` | `/api/documents/:id/presence` | Required | Get active viewers (excluding self) |
| `POST` | `/api/documents/:id/presence` | Required | Record client presence heartbeat |
| `GET` | `/api/documents/:id/comments` | Required | List all comments |
| `POST` | `/api/documents/:id/comments` | Required | Add a new comment (with optional text selection) |
| `PATCH` | `/api/comments/:id` | Required | Mark comment as resolved |
| `DELETE` | `/api/comments/:id` | Required | Delete comment (author or document owner) |
| `GET` | `/api/documents/:id/versions` | Required | List version snapshots |
| `POST` | `/api/documents/:id/versions/:versionId` | Required | Restore document to version snapshot |

---

## Key Design Decisions

1. **Staggered Polling for Presence** — Since Next.js on Vercel is serverless, persistent WebSockets are omitted. Heartbeats are sent every 12 seconds, and active user list queries poll every 12 seconds, staggered by 6 seconds. Expired viewers are cleaned up via Mongoose TTL indexes.
2. **Throttled Version Snapshots** — Autosaves occur on edits, but snapshots are throttled to at most once per 5 minutes per user per document. This preserves granular history while preventing MongoDB storage bloat.
3. **Client-Side Preview Renderer** — Version history displays inside a sidebar list. Clicking "Preview" compiles the version's TipTap JSON nodes to simple, styled JSX elements in real-time, completely client-side without external dependencies.
4. **CSS Print Rules for PDF Export** — PDF generation leverages standard browser `window.print()` functionality, paired with comprehensive `@media print` rules in `globals.css` that strip workspace sidebars, edit toolbar buttons, comments list, and outlines, generating clean paginated documents.
5. **Raw MongoDB Migration Query** — Document sharing data model upgrades are managed by a migration script executing raw MongoDB update operators to bypass Mongoose Schema casting exceptions on legacy documents.

---

## Database Connection

```
MongoDB Atlas (prod) / MongoDB local (dev)
└── Connection: MONGODB_URI env var
└── Cache: globalThis.mongooseConnection (survives HMR)
└── All service methods call dbConnect() before querying
```

---

## Testing Strategy

| Test File | Approach | Coverage |
|---|---|---|
| `document-create.test.ts` | In-memory MongoDB | Create doc, default title |
| `document-share.test.ts` | In-memory MongoDB | Share, duplicate share, self-share rejection |
| `upload-validation.test.ts` | In-memory MongoDB | .md/.txt accepted, .pdf/oversized rejected |
| `login-card.test.tsx` | jsdom + React Testing Library | Renders tabs and seeded user buttons |
| `presence.test.ts` | In-memory MongoDB | heartbeat, active user list, 30s timeout expiry |
| `comments.test.ts` | In-memory MongoDB | add comment, selection capture, resolve, delete permissions |
| `versions.test.ts` | In-memory MongoDB | snapshot throttling, history list, version restoration |
| `roles.test.ts` | In-memory MongoDB | enforces viewer/commenter/editor restrictions, role updates |
| `export.test.ts` | unit tests | TipTap JSON structure parsing to Markdown strings |

All tests pass: **15/15** ✅
