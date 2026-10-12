import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        setupFiles: ["./tests/setup.js"],
        env: {
            NODE_ENV: "test",
            JWT_ACCESS_SECRET: "test-access-secret",
            JWT_REFRESH_SECRET: "test-refresh-secret",
            RESEND_API_KEY: "re_test_key",
            MAIL_FROM: "test@example.com",
            FRONTEND_URL: "http://localhost:5173"
        }
    }
});
