# Gemini Code Understanding

This document provides a comprehensive overview of the **JournalMe** project, a full-stack journaling application. It is intended to be used as a quick reference for developers and as a context file for the Gemini CLI.

## Project Overview

JournalMe is a modern, full-stack journaling application built with a monorepo architecture. It features a React-based frontend and a Node.js (Express) backend, both written in TypeScript. The application allows users to create journal entries with text, audio, images, and videos. It also includes user authentication, social features like following other users, and a responsive, mobile-first design.

### Key Technologies

-   **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router, Vitest, Playwright
-   **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, bcrypt, Multer
-   **Database:** PostgreSQL
-   **DevOps:** Docker Compose, npm Workspaces

### Architecture

The project is structured as a monorepo with two main packages:

-   `packages/frontend`: The React-based client application.
-   `packages/backend`: The Node.js Express server that provides the API and handles business logic.

The `prisma` directory contains the database schema and migration files. The `certs` directory is used for storing HTTPS certificates for local development.

## Building and Running

### Prerequisites

-   Node.js 22+
-   npm
-   Docker and Docker Compose
-   Git

### Development

To run the application in development mode, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Database:**
    ```bash
    docker-compose up -d
    ```

3.  **Run Database Migrations:**
    ```bash
    npx prisma migrate dev
    ```

4.  **Start Development Servers:**
    Open two terminals and run the following commands:

    ```bash
    # Terminal 1: Start the backend server
    npm --workspace @journalme/backend run dev

    # Terminal 2: Start the frontend development server
    npm --workspace @journalme/frontend run dev
    ```

The frontend will be available at `https://localhost:5174` (with HTTPS if certificates are set up) or `http://localhost:5174`. The backend API will be available at `http://localhost:4000`.

### Building for Production

To build the application for production, run the following command:

```bash
npm run build
```

This will build both the frontend and backend packages and place the output in their respective `dist` directories.

### Testing

The project uses Vitest for unit and integration testing and Playwright for end-to-end testing.

-   **Run all tests:**
    ```bash
    npm test
    ```
-   **Run backend tests:**
    ```bash
    npm --workspace @journalme/backend test
    ```
-   **Run frontend tests:**
    ```bash
    npm --workspace @journalme/frontend test
    ```
-   **Run end-to-end tests:**
    ```bash
    npm --workspace @journalme/frontend run test:e2e
    ```

## Development Conventions

-   **Monorepo:** The project uses npm workspaces to manage the `frontend` and `backend` packages.
-   **TypeScript:** All code in both the frontend and backend is written in TypeScript.
-   **Database:** Prisma is used as the ORM to interact with the PostgreSQL database. The database schema is defined in `prisma/schema.prisma`.
-   **API:** The backend provides a RESTful API for the frontend. The API routes are defined in `packages/backend/src/routes`.
-   **Authentication:** Authentication is handled using JSON Web Tokens (JWT).
-   **Styling:** The frontend uses Tailwind CSS for styling.
-   **Testing:** The project has a comprehensive test suite, including unit, integration, and end-to-end tests.
-   **HTTPS:** The development server for the frontend can be run with HTTPS for testing on mobile devices. To enable this, generate a self-signed certificate and key file and place them in the `certs` directory.

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes
```
