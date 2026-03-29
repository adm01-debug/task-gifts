import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LGPDConsentBanner } from "@/components/LGPDConsentBanner";

describe("LGPDConsentBanner", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("shows banner when consent not given", () => {
    render(<LGPDConsentBanner />);
    expect(screen.getByText(/Lei Geral de Proteção de Dados/)).toBeDefined();
  });

  it("hides banner after accepting", () => {
    render(<LGPDConsentBanner />);
    const button = screen.getByText("Aceitar e continuar");
    fireEvent.click(button);
    expect(screen.queryByText(/Lei Geral de Proteção de Dados/)).toBeNull();
  });

  it("stores consent in sessionStorage", () => {
    render(<LGPDConsentBanner />);
    fireEvent.click(screen.getByText("Aceitar e continuar"));
    expect(sessionStorage.getItem("lgpd_consent_accepted")).toBeTruthy();
  });

  it("does not show banner if already accepted", () => {
    sessionStorage.setItem("lgpd_consent_accepted", new Date().toISOString());
    render(<LGPDConsentBanner />);
    expect(screen.queryByText(/Lei Geral de Proteção de Dados/)).toBeNull();
  });

  it("shows DPO email", () => {
    render(<LGPDConsentBanner />);
    expect(screen.getByText("dpo@gamificarh.com.br")).toBeDefined();
  });
});
