import { COOKIE_NAME } from "@shared/const";
import { clearAdminSessionCookie, setAdminSessionCookie, validateAdminCredentials } from "./_core/adminAuth";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getAssessmentHistory, getAssessmentPersistenceStatus, saveAssessmentHistory } from "./assessmentPersistence";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      clearAdminSessionCookie(ctx.req, ctx.res);
      return {
        success: true,
      } as const;
    }),
  }),

  admin: router({
    me: publicProcedure.query(({ ctx }) => ({
      isAdmin: ctx.isAdmin || ctx.user?.role === "admin",
    })),
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(({ ctx, input }) => {
        if (!validateAdminCredentials(input.username, input.password)) {
          return { success: false, error: "Invalid username or password" } as const;
        }

        setAdminSessionCookie(ctx.req, ctx.res);
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSessionCookie(ctx.req, ctx.res);
      return { success: true } as const;
    }),
  }),

  assessment: router({
    save: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerEmail: z.string().email(),
        sourcePlatform: z.string().optional(),
        workloadType: z.string().optional(),
        numInstances: z.number().optional(),
        totalVcpu: z.string().optional(),
        totalStorageTb: z.string().optional(),
        currentlyRunning: z.string().optional(),
        currentVersion: z.string().optional(),
        currentEdition: z.string().optional(),
        currentDeploymentType: z.string().optional(),
        currentLicensingModel: z.string().optional(),
        softwareAssurance: z.string().optional(),
        windowsLicensing: z.string().optional(),
        licensePurchaseDate: z.string().optional(),
        targetVersion: z.string().optional(),
        targetEdition: z.string().optional(),
        hadrRequirements: z.string().optional(),
        migrationApproach: z.string().optional(),
        recommendationSummary: z.string().optional(),
        deploymentModel: z.string().optional(),
        licensingOption: z.string().optional(),
        recommendedInstances: z.string().optional(),
        answersJson: z.unknown().optional(),
        recommendationJson: z.unknown().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const record = await saveAssessmentHistory(input);
          return { success: true, record };
        } catch (error) {
          console.error("Failed to save assessment:", error);
          return { success: false, error: "Failed to save assessment" };
        }
      }),
    
    getAll: adminProcedure.query(async () => getAssessmentHistory()),
    status: adminProcedure.query(() => getAssessmentPersistenceStatus()),
  }),
});

export type AppRouter = typeof appRouter;
