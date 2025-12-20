import "@testing-library/jest-dom";
// Prevent network calls during tests by stubbing global fetch
// Returns an empty list by default (no entries)
globalThis.fetch = async () =>
  ({
    ok: true,
    status: 200,
    json: async () => [],
  } as Response);
