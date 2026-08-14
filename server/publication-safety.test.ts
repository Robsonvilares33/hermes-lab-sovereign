import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("política de publicação open source", () => {
  it("aprova o repositório atual sem arquivos proibidos ou padrões de segredo", () => {
    expect(() =>
      execFileSync("bash", ["scripts/check-publication-safety.sh"], {
        cwd: process.cwd(),
        stdio: "pipe",
      })
    ).not.toThrow();
  });
});
