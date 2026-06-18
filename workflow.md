# Document Collaboration Platform

## Detailed Engineering Workflow (MongoDB + Next.js 15)

---

# 1. Project Overview

## Objective

Build a lightweight document collaboration platform similar to a simplified Google Docs.

The application must allow users to:

* Create documents
* Rename documents
* Edit document content
* Persist content
* Import content from files
* Share documents with other users
* Access shared documents
* Maintain formatting across sessions

The application should demonstrate:

* Full-stack engineering
* Clean architecture
* Database design
* Validation
* Testing
* Deployment readiness

---

# 2. Success Criteria

The reviewer should be able to:

1. Login as User A
2. Create a document
3. Edit document content
4. Apply rich text formatting
5. Save document
6. Upload a text file
7. Create document from uploaded file
8. Share document with User B
9. Login as User B
10. See shared document
11. Open and edit shared document
12. Refresh page
13. Verify data persists
14. Run automated tests

---

# 3. Explicit Non Goals

DO NOT IMPLEMENT:

* Real-time collaboration
* WebSockets
* CRDTs
* Operational transforms
* Presence indicators
* Comments
* Version history
* Activity logs
* Notifications
* Teams
* Organizations
* Roles beyond Owner/Shared User

---

# 4. Technology Stack

## Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* Shadcn UI

## Rich Text Editor

* Tiptap

Required Extensions:

* StarterKit
* Underline
* Heading
* BulletList
* OrderedList

## Backend

* Next.js Route Handlers
* Server Actions

## Database

* MongoDB Atlas

## ORM

* Mongoose

## Validation

* Zod

## Testing

* Vitest
* React Testing Library

## Deployment

* Vercel

---

# 5. Architecture Principles

1. Simplicity over complexity
2. Production-quality code
3. Feature completeness over feature quantity
4. Reusable components
5. Strong typing
6. Server-side data fetching where practical
7. Validation on both client and server

---

# 6. Folder Structure

src

app/
components/
lib/
models/
actions/
hooks/
types/
tests/

---

# 7. Authentication Strategy

Authentication is intentionally lightweight.

No OAuth.

No passwords.

No JWT.

No NextAuth.

---

## Seeded Users

[alice@test.com](mailto:alice@test.com)

[bob@test.com](mailto:bob@test.com)

[charlie@test.com](mailto:charlie@test.com)

---

## Login Flow

User visits:

/login

Selects:

Alice
Bob
Charlie

Selection stored in cookie.

---

## Current User Helper

Create:

lib/auth.ts

Functions:

getCurrentUser()

getCurrentUserId()

requireUser()

---

# 8. Database Design

## User Collection

Fields

_id
email

Indexes

email unique

---

## User Schema

```ts
{
 email: {
   type: String,
   unique: true,
   required: true
 }
}
```

---

## Document Collection

Fields

_id
title
content
ownerId
sharedWith
createdAt
updatedAt

---

## Document Schema

```ts
{
 title: {
   type: String,
   required: true,
   trim: true
 },

 content: {
   type: Schema.Types.Mixed,
   default: {}
 },

 ownerId: {
   type: ObjectId,
   ref: "User",
   required: true
 },

 sharedWith: [
   {
      type: ObjectId,
      ref: "User"
   }
 ]
}
```

---

# 9. Permissions Model

## Owner

Can:

* View
* Edit
* Rename
* Delete
* Share

---

## Shared User

Can:

* View
* Edit

Cannot:

* Delete
* Share
* Change owner

---

# 10. Dashboard Requirements

Route:

/dashboard

---

Sections:

## Owned Documents

Display:

Title

Updated Date

Open Button

Rename Button

Delete Button

---

## Shared With Me

Display:

Title

Owner Email

Updated Date

Open Button

---

## Global Actions

Create Document

Upload File

---

# 11. Document Creation

When clicking:

Create Document

Create:

Untitled Document

Navigate:

/documents/:id

---

# 12. Editor Requirements

Route:

/documents/[id]

---

Layout

Header

Document Title

Save Status

Share Button

Editor Toolbar

Editor Content

---

Toolbar Actions

Bold

Italic

Underline

H1

H2

Bullet List

Ordered List

Undo

Redo

---

Autosave

Every 3 seconds

Save only if content changed

Show:

Saving...

Saved

Error Saving

---

# 13. File Upload

Supported Types

.txt

.md

Maximum Size

5 MB

---

Workflow

Upload File

Read Content

Convert Content

Create Document

Open Editor

---

Rejected Types

.pdf

.docx

xlsx

png

jpg

zip

---

# 14. Sharing Workflow

Owner opens document

Clicks Share

Modal opens

Input:

email

Example:

[bob@test.com](mailto:bob@test.com)

---

Validation

User exists

Not owner

Not already shared

---

Success

Document appears in:

Shared With Me

for recipient

---

# 15. API Contracts

POST /api/documents

Creates document

Request:

{
title
}

Response:

{
success:true,
document
}

---

GET /api/documents

Returns

ownedDocuments

sharedDocuments

---

PATCH /api/documents/:id

Update

title

content

---

DELETE /api/documents/:id

Delete document

Owner only

---

POST /api/share

Request

{
documentId,
email
}

---

POST /api/upload

multipart/form-data

file

---

# 16. Validation Rules

Title

Minimum 1 character

Maximum 100 characters

---

Email

Valid email

Must exist

---

File

txt or md only

Maximum 5 MB

---

Document Content

Must be valid JSON

---

# 17. Error Handling

Show user-friendly messages

Examples:

Document not found

Access denied

Invalid file

User not found

Already shared

Upload failed

---

# 18. Testing Requirements

Required Tests

document-create.test.ts

document-share.test.ts

upload-validation.test.ts

---

Scenarios

Create document

Share document

Prevent duplicate share

Reject invalid upload

---

# 19. Deployment Requirements

Environment Variables

MONGODB_URI

NEXT_PUBLIC_APP_URL

---

Deployment Targets

Frontend

Vercel

Database

MongoDB Atlas

---

# 20. Definition Of Done

Authentication

[ ] Login works

Documents

[ ] Create
[ ] Rename
[ ] Delete
[ ] Open

Editor

[ ] Rich Text
[ ] Autosave

Uploads

[ ] txt
[ ] md

Sharing

[ ] Share
[ ] View shared docs

Persistence

[ ] Data survives refresh

Testing

[ ] Tests pass

Deployment

[ ] Live URL available

README

[ ] Setup instructions
[ ] Architecture notes
[ ] Deployment guide
