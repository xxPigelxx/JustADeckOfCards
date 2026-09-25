import { describe, expect, it } from "vitest";
import { cleanPlayerName, MAX_NAME_LENGTH, playerLabel } from "./protocol";

describe("cleanPlayerName", () => {
  it("trims, collapses whitespace and limits the length", () => {
    expect(cleanPlayerName("  Anna   Lena ")).toBe("Anna Lena");
    expect(cleanPlayerName("x".repeat(40))).toHaveLength(MAX_NAME_LENGTH);
  });

  it("removes invisible and control characters", () => {
    expect(cleanPlayerName("Ma\u200bx\n")).toBe("Max");
    expect(cleanPlayerName("\u202eevil")).toBe("evil");
  });

  it("returns null for empty or non-text names", () => {
    expect(cleanPlayerName("   ")).toBeNull();
    expect(cleanPlayerName(42)).toBeNull();
    expect(cleanPlayerName(undefined)).toBeNull();
  });
});

describe("playerLabel", () => {
  it("falls back to the seat number without a name", () => {
    const player = { id: "p2", seat: 2, connected: true };
    expect(playerLabel({ ...player, name: null })).toBe("Spieler 2");
    expect(playerLabel({ ...player, name: "Max" })).toBe("Max");
  });
});
