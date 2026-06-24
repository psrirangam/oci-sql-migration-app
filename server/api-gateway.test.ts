import { describe, expect, it } from "vitest";

function expectOptionalHttpsUrl(value: string | undefined) {
  if (!value) return;
  expect(value).toMatch(/^https:\/\//);
}

describe("Runtime configuration", () => {
  it("supports standalone deployment without external API gateway or OAuth", () => {
    expect(process.env.VITE_API_HOST).toBeUndefined();
    expect(process.env.VITE_API_URL).toBeUndefined();
    expect(process.env.VITE_BASE_URL).toBeUndefined();
    expect(process.env.VITE_OAUTH_PORTAL_URL).toBeUndefined();
  });

  it("requires configured integration URLs to use HTTPS when provided", () => {
    expectOptionalHttpsUrl(process.env.VITE_API_HOST);
    expectOptionalHttpsUrl(process.env.VITE_API_URL);
    expectOptionalHttpsUrl(process.env.VITE_BASE_URL);
    expectOptionalHttpsUrl(process.env.VITE_OAUTH_PORTAL_URL);
  });
});
