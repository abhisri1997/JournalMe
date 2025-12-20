import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "./App";
import { ThemeProvider } from "./theme";

test("renders navigation links", async () => {
  await act(async () => {
    render(
      <ThemeProvider>
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <App />
        </MemoryRouter>
      </ThemeProvider>
    );
  });
  expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Journal/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Login/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
});

import Journal from "./pages/Journal";

test("theme toggle exists on journal page", async () => {
  await act(async () => {
    render(
      <ThemeProvider>
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Journal />
        </MemoryRouter>
      </ThemeProvider>
    );
  });
  // Theme toggle shows 'Light' or 'Dark' text
  expect(await screen.findByText(/Light|Dark/i)).toBeInTheDocument();
});

test("theme toggle persists selection to localStorage", async () => {
  // Clear storage
  localStorage.removeItem("jm_theme");
  await act(async () => {
    render(
      <ThemeProvider>
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <App />
        </MemoryRouter>
      </ThemeProvider>
    );
  });
  const toggle = screen.getByLabelText(/Toggle dark mode/i) as HTMLInputElement;
  expect(toggle).toBeInTheDocument();
  // toggle should flip
  const user = userEvent.setup();
  await act(async () => {
    await user.click(toggle);
  });
  await waitFor(() => expect(localStorage.getItem("jm_theme")).toBe("dark"));
});

import Register from "./pages/Register";

test("register page submits and stores token", async () => {
  // Mock register API
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async () => {
      return {
        ok: true,
        status: 201,
        json: async () => ({
          token: "test-token",
          user: { id: "u1", email: "user@example.com" },
        }),
      } as Response;
    });

  await act(async () => {
    render(
      <ThemeProvider>
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Register />
        </MemoryRouter>
      </ThemeProvider>
    );
  });
  expect(
    await screen.findByRole("heading", { name: /Register/i })
  ).toBeInTheDocument();

  const emailInput = screen.getByPlaceholderText(/Email/i);
  const passInput = screen.getByPlaceholderText(/Password/i);
  // Fill out form
  const user = userEvent.setup();
  await act(async () => {
    await user.type(emailInput as HTMLInputElement, "user@example.com");
    await user.type(passInput as HTMLInputElement, "password123");

    const registerBtn = screen.getByRole("button", { name: /Register/i });
    await user.click(registerBtn);
  });

  // Token should be stored
  await waitFor(() =>
    expect(localStorage.getItem("jm_token")).toBe("test-token")
  );
  fetchMock.mockRestore();
});
