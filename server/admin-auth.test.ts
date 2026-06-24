import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { ADMIN_COOKIE_NAME } from "./_core/adminAuth";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
  value?: string;
};

function createContext(isAdmin = false): { ctx: TrpcContext; cookies: CookieCall[] } {
  const cookies: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    isAdmin,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        cookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, cookies };
}

describe("admin authentication", () => {
  it("sets an HttpOnly admin session cookie for valid credentials", async () => {
    const { ctx, cookies } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.login({
      username: "admin",
      password: "msadmin",
    });

    expect(result).toEqual({ success: true });
    expect(cookies).toHaveLength(1);
    expect(cookies[0]?.name).toBe(ADMIN_COOKIE_NAME);
    expect(cookies[0]?.value).toBeTruthy();
    expect(cookies[0]?.options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  });

  it("rejects invalid credentials without setting a cookie", async () => {
    const { ctx, cookies } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.login({
      username: "admin",
      password: "wrong-password",
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid username or password",
    });
    expect(cookies).toHaveLength(0);
  });

  it("blocks assessment history when the caller is not an admin", async () => {
    const { ctx } = createContext(false);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.assessment.getAll()).rejects.toBeInstanceOf(TRPCError);
  });

  it("allows admin callers to read non-secret persistence status", async () => {
    const { ctx } = createContext(true);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.assessment.status()).resolves.toMatchObject({
      historyStore: expect.any(String),
      objectStorageArchive: expect.any(String),
    });
  });
});
