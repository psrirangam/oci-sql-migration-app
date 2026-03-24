import { describe, expect, it } from "vitest";

/**
 * Test to verify API Gateway environment variables are properly configured
 * This ensures the app can connect to the OCI API Gateway
 */
describe("API Gateway Configuration", () => {
  it("should have VITE_API_HOST configured", () => {
    const apiHost = process.env.VITE_API_HOST;
    expect(apiHost).toBeDefined();
    expect(apiHost).toContain("apigateway");
    expect(apiHost).toContain("ozmis5wf2qkcpdc3sadsajokey");
  });

  it("should have VITE_API_URL configured", () => {
    const apiUrl = process.env.VITE_API_URL;
    expect(apiUrl).toBeDefined();
    expect(apiUrl).toContain("apigateway");
  });

  it("should have VITE_BASE_URL configured", () => {
    const baseUrl = process.env.VITE_BASE_URL;
    expect(baseUrl).toBeDefined();
    expect(baseUrl).toContain("apigateway");
  });

  it("should have VITE_OAUTH_PORTAL_URL configured for OAuth", () => {
    const oauthUrl = process.env.VITE_OAUTH_PORTAL_URL;
    expect(oauthUrl).toBeDefined();
    expect(oauthUrl).toContain("manus.im");
  });

  it("all API URLs should be HTTPS", () => {
    const apiHost = process.env.VITE_API_HOST;
    const apiUrl = process.env.VITE_API_URL;
    const baseUrl = process.env.VITE_BASE_URL;

    expect(apiHost).toMatch(/^https:\/\//);
    expect(apiUrl).toMatch(/^https:\/\//);
    expect(baseUrl).toMatch(/^https:\/\//);
  });
});
