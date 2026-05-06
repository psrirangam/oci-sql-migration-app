import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Assessment records table for storing customer SQL Server migration assessments
export const assessmentRecords = mysqlTable("assessment_records", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  numInstances: int("num_instances"),
  currentlyRunning: varchar("currently_running", { length: 50 }),
  currentVersion: varchar("current_version", { length: 50 }),
  currentEdition: varchar("current_edition", { length: 50 }),
  currentDeployment: varchar("current_deployment", { length: 100 }),
  currentDeploymentType: varchar("current_deployment_type", { length: 50 }),
  licensingModel: varchar("licensing_model", { length: 100 }),
  softwareAssurance: varchar("software_assurance", { length: 50 }),
  purchaseDate: varchar("purchase_date", { length: 50 }),
  targetVersion: varchar("target_version", { length: 50 }),
  targetEdition: varchar("target_edition", { length: 50 }),
  hadrRequirements: varchar("hadr_requirements", { length: 100 }),
  migrationApproach: varchar("migration_approach", { length: 100 }),
  recommendationSummary: text("recommendation_summary"),
  deploymentModel: varchar("deployment_model", { length: 100 }),
  licensingOption: varchar("licensing_option", { length: 100 }),
  recommendedInstances: text("recommended_instances"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AssessmentRecord = typeof assessmentRecords.$inferSelect;
export type InsertAssessmentRecord = typeof assessmentRecords.$inferInsert;