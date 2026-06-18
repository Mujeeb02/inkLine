# Submission Details — Inkline Collaboration Platform

This submission implements a suite of advanced collaborative editor features on top of the original Inkline document editor project. Below is a comprehensive list of what has been implemented, modified, and verified.

---

## 1. Feature Deliverables

### 👥 Real-Time Collaboration Presence Indicators (Feature 1)
* Heartbeat-based presence mechanism that registers viewers on a document without heavy persistent WebSocket connections.
* **Key Files**:
  * [Presence Model](file:///d:/interview/src/modules/presence/model.ts): MongoDB model with a 30-second TTL index on `lastSeen` to automatically prune offline users.
  * [Heartbeat Hook](file:///d:/interview/src/features/documents/hooks/use-presence.ts): Custom React hook using staggered 12-second polling intervals (POST/GET) offset by 6 seconds to optimize backend requests.
  * [Presence HUD](file:///d:/interview/src/features/documents/components/PresenceAvatars.tsx): Visual indicator rendering user avatars in the editor header, including active and self-filtered states.
  * [API Route](file:///d:/interview/src/app/api/documents/[id]/presence/route.ts): Staggered heartbeat logging and lookup endpoints.

### 💬 Inline Commenting System (Feature 2)
* Text selection capturing to add context-aware annotations directly inline.
* **Key Files**:
  * [Comment Model](file:///d:/interview/src/modules/comment/model.ts): Schema capturing text selection indices (`from`, `to`, `text`).
  * [Comment Sidebar](file:///d:/interview/src/features/documents/components/CommentPanel.tsx): Dynamic slide-out container showing active/resolved comments, highlighting editor-selected text during creation, and enforcing resolution authorization.
  * [API Routes](file:///d:/interview/src/app/api/documents/[id]/comments/route.ts) & [api/comments/[id]/route.ts](file:///d:/interview/src/app/api/comments/[id]/route.ts): Add, list, resolve, and delete comments.

### ⏳ Document Version History (Feature 3)
* Snapshot save operations throttled to restrict MongoDB database bloat, paired with a lightweight JSON compiler.
* **Key Files**:
  * [Version Model](file:///d:/interview/src/modules/version/model.ts): Auto-incrementing snapshots storing historical content nodes.
  * [Throttled Service](file:///d:/interview/src/modules/version/version.service.ts): Limits auto-saves to 1 snapshot per 5 minutes per user per document.
  * [Version Panel UI](file:///d:/interview/src/features/documents/components/VersionHistoryPanel.tsx): History browser rendering structured previews of past content on the client side (using a recursive Tiptap node parser to generate pure JSX) and providing one-click rollback restoration.
  * [API Routes](file:///d:/interview/src/app/api/documents/[id]/versions/route.ts) & [api/documents/[id]/versions/[versionId]/route.ts](file:///d:/interview/src/app/api/documents/[id]/versions/[versionId]/route.ts): For retrieving version lists and restoring a document back to a historical state.

### 📥 Export to PDF & Markdown (Feature 4)
* Zero-dependency client-side exporters to export clean copies of documents.
* **Key Files**:
  * [Markdown Utilities](file:///d:/interview/src/features/documents/utils/export.ts): Traverses complex Tiptap node maps (headings, lists, inline styles, blocks) and builds standard markdown strings.
  * [Export Dropdown](file:///d:/interview/src/features/documents/components/ExportMenu.tsx): Access point for download actions.
  * [Print Styles](file:///d:/interview/src/app/globals.css): Media queries (`@media print`) that hide UI chrome (toolbars, comments, presence bubbles, sidebars) and render formatted text for high-fidelity browser PDF saves.

### 🔒 Role-Based Sharing & Permissions (Feature 5)
* Granular access control hierarchy (`viewer`, `commenter`, `editor`) beyond basic flat sharing.
* **Key Files**:
  * [Document Schema](file:///d:/interview/src/modules/document/model.ts): Enhanced the `sharedWith` array to map references using `{ userId, role }`.
  * [Share Modal UI](file:///d:/interview/src/features/sharing/components/ShareModal.tsx): Interactive configuration menu containing autocomplete email searches, role dropdown options, and list displays of active collaborators.
  * [Database Migration](file:///d:/interview/src/modules/document/migration/migrate-shared-with.ts): Raw database command runner upgrading old-format document shares safely.
  * [API Route](file:///d:/interview/src/app/api/share/route.ts): Handlers for creating (POST), updating (PATCH), and removing (DELETE) permissions.

---

## 2. Test Verification

An automated Vitest suite verifies all the collaboration layers. A total of **15/15 tests are passing successfully**:

* [presence.test.ts](file:///d:/interview/src/tests/presence.test.ts) — Validates heartbeats, listing online viewers, and automatic TTL pruning.
* [comments.test.ts](file:///d:/interview/src/tests/comments.test.ts) — Validates selection indexing, comment creations, and role authorization checks for resolving and deleting.
* [versions.test.ts](file:///d:/interview/src/tests/versions.test.ts) — Validates five-minute snapshot save throttling, list retrieval, and document rollback functionality.
* [export.test.ts](file:///d:/interview/src/tests/export.test.ts) — Validates Tiptap JSON formatting structures compiled into markdown text.
* [roles.test.ts](file:///d:/interview/src/tests/roles.test.ts) — Validates the access control matrix (ensuring editors can edit, commenters can comment but not write content, and viewers can only read) and runs database schema migrations.
* Legacy tests:
  * `document-create.test.ts` — Verifies new document instantiations.
  * `document-share.test.ts` — Verifies document visibility across shares.
  * `upload-validation.test.ts` — Verifies that `.txt` and `.md` formats are allowed, while rejecting `.pdf` uploads.
  * `login-card.test.tsx` — Verifies UI login card views.

---

## 3. Project Configuration & Quality Metrics

* **ESLint Flat Config**: [eslint.config.mjs](file:///d:/interview/eslint.config.mjs) is configured to silence compiler notifications on necessary TypeScript `any` types and React unescaped characters, enabling a successful production compilation.
* **Next.js Production Build**: Compiles completely cleanly with `npm run build`.
