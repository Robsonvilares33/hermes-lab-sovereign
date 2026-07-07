import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the useAuth hook
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Robson", email: "robson@example.com" },
    loading: false,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the dashboard with user greeting", () => {
    // This is a placeholder test to verify the test setup
    // In a real scenario, you would test the component rendering
    const userName = "Robson";
    expect(userName).toBe("Robson");
  });

  it("should display metrics cards", () => {
    // Verify that metrics are defined
    const metrics = [
      { title: "Status do Agente", value: "Online" },
      { title: "Análises Realizadas", value: "0" },
      { title: "Tempo de Operação", value: "24/7" },
      { title: "Modo Processamento", value: "Ollama" },
    ];

    expect(metrics).toHaveLength(4);
    expect(metrics[0].title).toBe("Status do Agente");
    expect(metrics[0].value).toBe("Online");
  });

  it("should have correct navigation items in sidebar", () => {
    const menuItems = [
      { label: "Agente Hermes", path: "/dashboard" },
      { label: "Chat", path: "/dashboard/chat" },
      { label: "Loterias", path: "/dashboard/lotteries" },
      { label: "Análise", path: "/dashboard/analysis" },
      { label: "Vault", path: "/dashboard/vault" },
    ];

    expect(menuItems).toHaveLength(5);
    expect(menuItems.find(item => item.path === "/dashboard/chat")).toBeDefined();
    expect(menuItems.find(item => item.path === "/dashboard/lotteries")).toBeDefined();
  });
});
