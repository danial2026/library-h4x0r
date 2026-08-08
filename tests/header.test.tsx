import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

describe("Header", () => {
  it("renders the library title", () => {
    render(<Header />);
    expect(screen.getByText("Library")).toBeDefined();
  });

  it("renders the edition text", () => {
    render(<Header />);
    expect(screen.getByText(/Edition/)).toBeDefined();
  });

  it("renders the description", () => {
    render(<Header />);
    expect(screen.getByText(/curated collection/)).toBeDefined();
  });
});
