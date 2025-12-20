# Contributing to JournalMe

Thank you for your interest in contributing to JournalMe! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and courteous in all interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node.js version)

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

- A clear description of the feature
- The problem it solves or value it adds
- Any proposed implementation details
- Examples of similar features in other apps (if applicable)

### Pull Requests

1. **Fork the repository** and create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:

   - Write clear, concise commit messages
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:

   ```bash
   npm test                                    # Run all tests
   npm run lint                                # Check code style
   npm run type-check                          # Check TypeScript types
   ```

4. **Push to your fork** and create a pull request:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Fill out the PR template** with:
   - Description of changes
   - Related issue number (if applicable)
   - Testing performed
   - Screenshots (if UI changes)

## Development Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/JournalMe.git
   cd JournalMe
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start PostgreSQL**:

   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run migrations**:

   ```bash
   npx prisma migrate dev
   ```

6. **Start development servers**:

   ```bash
   # Terminal 1: Backend
   npm --workspace @journalme/backend run dev

   # Terminal 2: Frontend
   npm --workspace @journalme/frontend run dev
   ```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over type aliases for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful prop names

### Formatting

- Run `npm run lint` to check code style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multiline objects/arrays

### Git Commits

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(journal): add audio playback controls
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
```

## Testing

### Unit Tests

- Write tests for all new functionality
- Aim for high test coverage
- Use descriptive test names
- Mock external dependencies

### E2E Tests

- Add E2E tests for critical user flows
- Use Playwright for browser testing
- Test across different viewports

### Running Tests

```bash
# Frontend tests
npm --workspace @journalme/frontend test

# Backend tests
npm --workspace @journalme/backend test

# E2E tests
npm --workspace @journalme/frontend run test:e2e

# Coverage report
npm run test:coverage
```

## Project Structure

```
JournalMe/
├── packages/
│   ├── backend/              # Express API
│   │   ├── src/
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── middleware/   # Express middleware
│   │   │   └── __tests__/    # Backend tests
│   └── frontend/             # React app
│       ├── src/
│       │   ├── components/   # Reusable components
│       │   ├── pages/        # Page components
│       │   └── __tests__/    # Frontend tests
├── prisma/                   # Database schema
└── docker-compose.yml        # PostgreSQL setup
```

## Database Changes

When modifying the database schema:

1. Update `prisma/schema.prisma`
2. Create a migration:
   ```bash
   npx prisma migrate dev --name description_of_change
   ```
3. Update related TypeScript types
4. Add migration to your PR

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update API documentation for endpoint changes
- Include code examples where helpful

## Questions?

Feel free to:

- Open a discussion on GitHub
- Ask questions in pull request comments
- Reach out to maintainers

Thank you for contributing to JournalMe! 🎉
