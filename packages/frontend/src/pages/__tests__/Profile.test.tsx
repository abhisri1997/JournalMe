import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../../theme";
import Profile from "../Profile";
import * as api from "../../services/api";

// Mock the API services
vi.mock("../../services/api");

describe("Profile page", () => {
  beforeEach(() => {
    // Setup user in localStorage
    localStorage.setItem(
      "jm_user",
      JSON.stringify({
        id: "test-user-id",
        email: "test@example.com",
        displayName: "Test User",
      })
    );

    // Mock API responses
    vi.mocked(api.JournalService.fetchEntries).mockResolvedValue([
      {
        id: "1",
        text: "Test post",
        createdAt: new Date().toISOString(),
        imagePath: null,
        videoPath: null,
        audioPath: null,
        user: {
          id: "user-1",
          email: "test@example.com",
          displayName: "Test User",
        },
        isPublic: true,
      },
    ]);

    vi.mocked(api.FollowService.listConnections).mockResolvedValue({
      followers: [
        {
          id: "follower-1",
          user: {
            id: "follower-id",
            email: "follower@example.com",
            displayName: "Follower",
          },
          since: new Date().toISOString(),
        },
      ],
      following: [
        {
          id: "following-1",
          user: {
            id: "following-id",
            email: "following@example.com",
            displayName: "Following",
          },
          since: new Date().toISOString(),
        },
      ],
    });
  });

  it("renders profile header with user info", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Profile />
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("displays post count in stats", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Profile />
        </MemoryRouter>
      </ThemeProvider>
    );

    // Wait for the component to load
    await screen.findByText("Posts");

    // Check that the stats are rendered
    const statsTexts = screen.getAllByText("1");
    expect(statsTexts.length).toBeGreaterThan(0);
  });

  it("renders tabs for posts, followers, and following", () => {
    render(
      <ThemeProvider>
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Profile />
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getByText("posts")).toBeInTheDocument();
    expect(screen.getByText("followers")).toBeInTheDocument();
    expect(screen.getByText("following")).toBeInTheDocument();
  });
});
