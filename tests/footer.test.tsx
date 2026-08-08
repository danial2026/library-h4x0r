import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders the footer text", () => {
    render(<Footer />);
    expect(screen.getByText(/original reference materials/)).toBeDefined();
  });

  it("renders the browse hint", () => {
    render(<Footer />);
    expect(screen.getByText(/Wheel/)).toBeDefined();
  });
});
