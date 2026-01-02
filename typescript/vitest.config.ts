import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        testTimeout: 30000, // 30s for integration tests with server startup
        hookTimeout: 30000,
    },
});
