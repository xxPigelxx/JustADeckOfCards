import { defineConfig } from "vitest/config";

// Tests for the plain TypeScript parts (game rules, later the server)
export default defineConfig({
  test: {
    include: ["shared/**/*.test.ts", "server/**/*.test.ts"],
  },
});
