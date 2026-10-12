import { vi } from "vitest";

// Safety net: no test may ever reach a real database.
// Tests mock the repositories/services they need; any accidental query fails loudly.
vi.mock("../src/db/database.js", () => {
    const fail = () =>
        Promise.reject(
            new Error("Unexpected database call in tests: mock the repository or service instead")
        );

    return {
        default: {
            query: vi.fn(fail),
            connect: vi.fn(fail),
            end: vi.fn()
        }
    };
});
