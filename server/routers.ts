import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { saveAssessmentRecord, getAllAssessmentRecords } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  assessment: router({
    save: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerEmail: z.string().email(),
        numInstances: z.number().optional(),
        currentlyRunning: z.string().optional(),
        currentVersion: z.string().optional(),
        currentEdition: z.string().optional(),
        currentDeployment: z.string().optional(),
        currentDeploymentType: z.string().optional(),
        licensingModel: z.string().optional(),
        softwareAssurance: z.string().optional(),
        purchaseDate: z.string().optional(),
        targetVersion: z.string().optional(),
        targetEdition: z.string().optional(),
        hadrRequirements: z.string().optional(),
        migrationApproach: z.string().optional(),
        recommendationSummary: z.string().optional(),
        deploymentModel: z.string().optional(),
        licensingOption: z.string().optional(),
        recommendedInstances: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await saveAssessmentRecord(input);
          return { success: true };
        } catch (error) {
          console.error("Failed to save assessment:", error);
          return { success: false, error: "Failed to save assessment" };
        }
      }),
    
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        // Only admins can view all assessments
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }
        return await getAllAssessmentRecords();
      }),
  }),
});

export type AppRouter = typeof appRouter;
