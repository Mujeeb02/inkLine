// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/modules/user/user.routes", () => ({
  loginAction: vi.fn(),
  signUpAction: vi.fn(),
  quickLoginAction: vi.fn(),
}));

import { LoginCard } from "@/features/auth/components/LoginCard";
import { SEEDED_USERS } from "@/modules/shared/constants";

describe("login card", () => {
  it("renders the seeded login choices", () => {
    render(<LoginCard users={SEEDED_USERS} />);

    expect(screen.getByText("Welcome to Inkline")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });
});
