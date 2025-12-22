import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Journal from "../Journal";
import { ThemeProvider } from "../../theme";

test("saves text entry and shows it after server response", async () => {
  const createdEntry = {
    id: "1",
    text: "hello world",
    createdAt: new Date().toISOString(),
  };

  // stateful fetch mock: first GET -> [], POST -> createdEntry, subsequent GET -> [createdEntry]
  let callCount = 0;
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation((input, init) => {
      callCount++;
      // GET request (no method or method is GET)
      if (!init?.method || (init as RequestInit).method === "GET") {
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [],
          } as unknown as Response);
        }
        // Subsequent GET calls return the created entry
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [createdEntry],
        } as unknown as Response);
      }
      // POST request
      if ((init as RequestInit).method === "POST") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => createdEntry,
        } as unknown as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);
    });

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

  await waitFor(() => expect(callCount).toBeGreaterThanOrEqual(1));

  const textarea = screen.getByRole("textbox");
  const user = userEvent.setup();
  await act(async () => {
    await user.type(textarea as HTMLTextAreaElement, "hello world");
    const saveButton = screen.getByRole("button", { name: /Save text entry/i });
    await user.click(saveButton);
  });

  // Optimistic UI should display immediately
  expect(await screen.findByText(/hello world/i)).toBeInTheDocument();

  await waitFor(() => expect(callCount).toBeGreaterThanOrEqual(3));

  fetchMock.mockRestore();
});

test("can start and stop recording and the saved entry appears", async () => {
  const createdEntry = {
    id: "2",
    text: "recorded entry",
    createdAt: new Date().toISOString(),
  };

  // stateful fetch mock: first GET -> [], POST -> createdEntry, subsequent GET -> [createdEntry]
  let callCount = 0;
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation((input, init) => {
      callCount++;
      // GET request (no method or method is GET)
      if (!init?.method || (init as RequestInit).method === "GET") {
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [],
          } as Response);
        }
        // Subsequent GET calls return the created entry
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [createdEntry],
        } as Response);
      }
      // POST request
      if ((init as RequestInit).method === "POST") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => createdEntry,
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);
    });

  // Mock getUserMedia and MediaRecorder
  (globalThis.navigator as unknown as { mediaDevices?: unknown }).mediaDevices =
    {
      getUserMedia: vi.fn(async () => ({} as MediaStream)),
    } as unknown;

  class FakeMediaRecorder {
    ondataavailable: ((e: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;
    constructor() {}
    start() {
      // Immediately fire a dataavailable event
      this.ondataavailable &&
        this.ondataavailable({
          data: new Blob(["audio data"], { type: "audio/webm" }),
        });
    }
    stop() {
      this.onstop && this.onstop();
    }
  }

  Object.defineProperty(globalThis, "MediaRecorder", {
    value: FakeMediaRecorder,
    writable: true,
  });

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

  await waitFor(() => expect(callCount).toBeGreaterThanOrEqual(1));

  // Click Start Voice
  const startBtn = await screen.findByRole("button", {
    name: /Start recording/i,
  });
  const user2 = userEvent.setup();
  await act(async () => {
    await user2.click(startBtn);
  });

  // After starting, the Stop button should be present
  const stopBtn = await screen.findByRole("button", {
    name: /Stop recording/i,
  });
  await act(async () => {
    await user2.click(stopBtn);
  });

  // After stop, we expect the created entry to appear
  expect(await screen.findByText(/recorded entry/i)).toBeInTheDocument();

  await waitFor(() => expect(callCount).toBeGreaterThanOrEqual(3));

  fetchMock.mockRestore();
});
