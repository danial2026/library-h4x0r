import { describe, it, expect } from "vitest";
import { cn, slugify, truncate, formatCategory } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters falsy values", () => {
    expect(cn("foo", null, undefined, false, "bar")).toBe("foo bar");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("slugify", () => {
  it("converts text to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Foo & Bar!")).toBe("foo-bar");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("truncate", () => {
  it("does not truncate short text", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long text", () => {
    expect(truncate("hello world this is long", 10)).toBe("hello worl...");
  });
});

describe("formatCategory", () => {
  it("spaces camelCase", () => {
    expect(formatCategory("DevOps")).toBe("DEV OPS");
  });

  it("handles single word", () => {
    expect(formatCategory("Security")).toBe("SECURITY");
  });
});
