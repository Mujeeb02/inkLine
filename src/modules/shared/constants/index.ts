export const SESSION_COOKIE_NAME = "inkline-user";

export type SeededUser = {
  label: string;
  email: string;
};

export const SEEDED_USERS: SeededUser[] = [
  { label: "Alice", email: "alice@test.com" },
  { label: "Bob", email: "bob@test.com" },
  { label: "Charlie", email: "charlie@test.com" },
];

export const EMPTY_DOCUMENT_CONTENT = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};
