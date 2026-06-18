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
│   │   ├── documents/[id]/     # PATCH, DELETE /api/documents/:id
│   │   ├── documents/          # GET, POST /api/documents
│   │   ├── share/              # POST /api/share
│   │   ├── upload/             # POST /api/upload
│   │   └── users/              # GET /api/users
│   ├── dashboard/page.tsx      # Server Component — fetches docs, renders DocumentWorkspace
│   ├── documents/[id]/page.tsx # Server Component — resolves permission, renders DocumentEditor
│   └── login/page.tsx          # Server Component — renders LoginCard
│
├── modules/                    # Pure server-side business logic (no React)
│   ├── document/               # model · repository · service · controller · routes · validation · types
│   ├── share/                  # service · controller · routes · validation
│   ├── upload/                 # service · controller · routes · validation
│   ├── user/                   # model · repository · service · controller · routes · validation
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
│   │   ├── components/         # DocumentWorkspace, DocumentEditor, EditorToolbar, EditorHeader, DocumentCard, …
│   │   ├── hooks/use-autosave  # 3-second interval, saves only on change
│   │   └── services/           # DocumentClientService — fetch wrappers for API routes
│   ├── sharing/
│   │   ├── components/         # ShareModal — searchable user dropdown
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
    └── login-card.test.tsx
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

> **Note:** Password authentication (`bcryptjs`) was added on top of the original spec's email-only flow. The Quick Login buttons remain for demo convenience.

---

## Data Model

```
User          { _id, email, passwordHash?, createdAt, updatedAt }
Document      { _id, title, content (Tiptap JSON), ownerId → User, sharedWith → User[], createdAt, updatedAt }
```

### Permission Model

| Action | Owner | Shared User |
|---|:---:|:---:|
| View | ✅ | ✅ |
| Edit content | ✅ | ✅ |
| Rename | ✅ | ❌ |
| Delete | ✅ | ❌ |
| Share | ✅ | ❌ |

---

## API Surface

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/documents` | Required | List owned + shared documents |
| `POST` | `/api/documents` | Required | Create new document |
| `PATCH` | `/api/documents/:id` | Required | Update title and/or content |
| `DELETE` | `/api/documents/:id` | Required | Delete (owner only) |
| `POST` | `/api/share` | Required | Share document with a user by email |
| `POST` | `/api/upload` | Required | Upload `.txt`/`.md` → create document |
| `GET` | `/api/users` | None | List all users (for share modal dropdown) |

---

## Key Design Decisions

1. **Server Components for data fetching** — Dashboard and DocumentPage fetch directly in async Server Components, no client-side loading states needed.
2. **Server Actions for mutations** — Login, signup, logout use Next.js Server Actions (`"use server"`), avoiding API round-trips for auth.
3. **Global Mongoose singleton** — `db.ts` caches the Mongoose connection on `globalThis` to survive Next.js hot reloads.
4. **Tiptap JSON as content format** — Content is stored as Tiptap's portable JSON (not HTML), ensuring format fidelity across sessions.
5. **Autosave only on change** — `use-autosave` fires every 3 seconds but the save only executes if content or title actually changed (`lastSavedRef` comparison), preventing unnecessary DB writes.
6. **Zod at every boundary** — All API inputs and Server Action inputs pass through Zod schemas before reaching business logic.

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
| `document-create.test.ts` | In-memory MongoDB (`mongodb-memory-server`) | Create doc, default title |
| `document-share.test.ts` | In-memory MongoDB | Share, duplicate share, self-share rejection |
| `upload-validation.test.ts` | In-memory MongoDB + route handler | .md/.txt accepted, .pdf rejected, >5MB rejected |
| `login-card.test.tsx` | jsdom + React Testing Library | Renders tabs and seeded user buttons |

All tests pass: **9/9** ✅
