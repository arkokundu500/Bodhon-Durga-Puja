// @vitest-environment jsdom

import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StarterAudio } from "./StarterAudio";

describe("StarterAudio Component", () => {
  let playMock: ReturnType<typeof vi.fn>;
  let pauseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    playMock = vi.fn().mockImplementation(() => Promise.resolve());
    pauseMock = vi.fn();

    // Mock HTMLMediaElement prototype
    window.HTMLMediaElement.prototype.play = playMock;
    window.HTMLMediaElement.prototype.pause = pauseMock;
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("plays 20s starter song when home page loads or reloads", async () => {
    await act(async () => {
      render(<StarterAudio />);
      vi.advanceTimersByTime(200);
    });

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/পুজোর বাদ্য/i)).toBeInTheDocument();
    expect(screen.getByText(/20s/i)).toBeInTheDocument();

    // Fast-forward 20 seconds
    act(() => {
      vi.advanceTimersByTime(20000);
    });

    // Should stop playing and dismiss badge
    expect(pauseMock).toHaveBeenCalled();
  });

  it("allows user to mute and dismiss starter audio manually", async () => {
    await act(async () => {
      render(<StarterAudio />);
      vi.advanceTimersByTime(200);
    });

    const muteBtn = screen.getByRole("button", { name: /mute starter music/i });
    expect(muteBtn).toBeInTheDocument();
    fireEvent.click(muteBtn);

    const dismissBtn = screen.getByRole("button", { name: /dismiss starter music/i });
    expect(dismissBtn).toBeInTheDocument();
    fireEvent.click(dismissBtn);

    expect(pauseMock).toHaveBeenCalled();
    expect(screen.queryByText(/পুজোর বাদ্য/i)).not.toBeInTheDocument();
  });
});
