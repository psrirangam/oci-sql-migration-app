import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import oracledb from "oracledb";
import { ENV } from "./_core/env";

export type AssessmentInput = {
  customerName: string;
  customerEmail: string;
  sourcePlatform?: string;
  workloadType?: string;
  numInstances?: number;
  totalVcpu?: string;
  totalStorageTb?: string;
  currentlyRunning?: string;
  currentVersion?: string;
  currentEdition?: string;
  currentDeploymentType?: string;
  licensePurchaseDate?: string;
  currentLicensingModel?: string;
  softwareAssurance?: string;
  windowsLicensing?: string;
  targetVersion?: string;
  targetEdition?: string;
  hadrRequirements?: string;
  migrationApproach?: string;
  recommendationSummary?: string;
  deploymentModel?: string;
  licensingOption?: string;
  recommendedInstances?: string;
  answersJson?: unknown;
  recommendationJson?: unknown;
};

export type AssessmentHistoryRecord = AssessmentInput & {
  id: string;
  timestamp: string;
  objectStorageKey?: string;
};

export type AssessmentPersistenceStatus = {
  historyStore: "ATP" | "Local file";
  objectStorageArchive: "Configured" | "Not configured";
  bucket?: string;
  region?: string;
};

let pool: any = null;
let tableReady = false;
let s3Client: S3Client | null = null;

function useOciPersistence(): boolean {
  return ENV.persistenceMode === "oci";
}

function hasObjectStorageConfig(): boolean {
  return Boolean(ENV.ociObjectStorageNamespace && ENV.ociS3AccessKeyId && ENV.ociS3SecretAccessKey);
}

function localStorePath(): string {
  return path.resolve(process.cwd(), ENV.dataDir, "assessments.json");
}

async function getPool(): Promise<any> {
  if (!ENV.atpPassword) {
    throw new Error("ATP_PASSWORD is required when PERSISTENCE_MODE=oci");
  }

  if (!pool) {
    pool = await oracledb.createPool({
      user: ENV.atpUser,
      password: ENV.atpPassword,
      connectString: ENV.atpConnectionString,
      poolMin: 0,
      poolMax: 4,
      poolIncrement: 1,
    });
  }

  if (!tableReady) {
    await ensureAssessmentTable();
    tableReady = true;
  }

  return pool;
}

async function ensureAssessmentTable() {
  const connection = await pool!.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE SQLAPP_ASSESSMENTS (
        id VARCHAR2(64) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
        customer_name VARCHAR2(255),
        customer_email VARCHAR2(320),
        source_platform VARCHAR2(80),
        workload_type VARCHAR2(80),
        num_instances NUMBER,
        total_vcpu VARCHAR2(32),
        total_storage_tb VARCHAR2(32),
        currently_running VARCHAR2(32),
        current_version VARCHAR2(80),
        current_edition VARCHAR2(80),
        deployment_type VARCHAR2(80),
        license_purchase_date VARCHAR2(80),
        licensing_model VARCHAR2(80),
        software_assurance VARCHAR2(80),
        windows_licensing VARCHAR2(80),
        target_version VARCHAR2(80),
        target_edition VARCHAR2(80),
        hadr_requirements VARCHAR2(80),
        migration_approach VARCHAR2(80),
        deployment_model VARCHAR2(500),
        licensing_option VARCHAR2(500),
        recommended_instances CLOB,
        recommendation_summary CLOB,
        answers_json CLOB,
        recommendation_json CLOB,
        object_storage_key VARCHAR2(1000)
      )
    `);
  } catch (error) {
    const dbError = error as { errorNum?: number };
    if (dbError.errorNum !== 955) {
      throw error;
    }
  } finally {
    await connection.close();
  }
}

function getObjectStorageClient(): S3Client | null {
  if (!hasObjectStorageConfig()) {
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: ENV.ociRegion,
      endpoint: `https://${ENV.ociObjectStorageNamespace}.compat.objectstorage.${ENV.ociRegion}.oraclecloud.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: ENV.ociS3AccessKeyId,
        secretAccessKey: ENV.ociS3SecretAccessKey,
      },
    });
  }

  return s3Client;
}

async function archiveToObjectStorage(record: AssessmentHistoryRecord): Promise<string | undefined> {
  const client = getObjectStorageClient();
  if (!client) return undefined;

  const month = new Date(record.timestamp).toISOString().slice(0, 7);
  const key = `assessments/${month}/${record.id}.json`;

  await client.send(
    new PutObjectCommand({
      Bucket: ENV.ociObjectStorageBucket,
      Key: key,
      Body: JSON.stringify(record, null, 2),
      ContentType: "application/json",
      Metadata: {
        source: "oci-sql-migration-app",
        bucketOcid: ENV.ociObjectStorageBucketOcid,
      },
    })
  );

  return key;
}

function buildRecord(input: AssessmentInput): AssessmentHistoryRecord {
  return {
    ...input,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

function toJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

async function saveToAtp(record: AssessmentHistoryRecord) {
  const dbPool = await getPool();
  const connection = await dbPool.getConnection();
  try {
    await connection.execute(
      `
        INSERT INTO SQLAPP_ASSESSMENTS (
          id, created_at, customer_name, customer_email, source_platform, workload_type,
          num_instances, total_vcpu, total_storage_tb, currently_running,
          current_version, current_edition, deployment_type, license_purchase_date,
          licensing_model, software_assurance, windows_licensing, target_version,
          target_edition, hadr_requirements, migration_approach, deployment_model,
          licensing_option, recommended_instances, recommendation_summary,
          answers_json, recommendation_json, object_storage_key
        ) VALUES (
          :id, TO_TIMESTAMP_TZ(:timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'),
          :customerName, :customerEmail, :sourcePlatform, :workloadType,
          :numInstances, :totalVcpu, :totalStorageTb, :currentlyRunning,
          :currentVersion, :currentEdition, :currentDeploymentType, :licensePurchaseDate,
          :currentLicensingModel, :softwareAssurance, :windowsLicensing, :targetVersion,
          :targetEdition, :hadrRequirements, :migrationApproach, :deploymentModel,
          :licensingOption, :recommendedInstances, :recommendationSummary,
          :answersJson, :recommendationJson, :objectStorageKey
        )
      `,
      {
        id: record.id,
        timestamp: record.timestamp,
        customerName: record.customerName,
        customerEmail: record.customerEmail,
        sourcePlatform: record.sourcePlatform ?? null,
        workloadType: record.workloadType ?? null,
        numInstances: record.numInstances ?? null,
        totalVcpu: record.totalVcpu ?? null,
        totalStorageTb: record.totalStorageTb ?? null,
        currentlyRunning: record.currentlyRunning ?? null,
        currentVersion: record.currentVersion ?? null,
        currentEdition: record.currentEdition ?? null,
        currentDeploymentType: record.currentDeploymentType ?? null,
        licensePurchaseDate: record.licensePurchaseDate ?? null,
        currentLicensingModel: record.currentLicensingModel ?? null,
        softwareAssurance: record.softwareAssurance ?? null,
        windowsLicensing: record.windowsLicensing ?? null,
        targetVersion: record.targetVersion ?? null,
        targetEdition: record.targetEdition ?? null,
        hadrRequirements: record.hadrRequirements ?? null,
        migrationApproach: record.migrationApproach ?? null,
        deploymentModel: record.deploymentModel ?? null,
        licensingOption: record.licensingOption ?? null,
        recommendedInstances: record.recommendedInstances ?? null,
        recommendationSummary: record.recommendationSummary ?? null,
        answersJson: toJson(record.answersJson),
        recommendationJson: toJson(record.recommendationJson),
        objectStorageKey: record.objectStorageKey ?? null,
      },
      { autoCommit: true }
    );
  } finally {
    await connection.close();
  }
}

async function readFromAtp(): Promise<AssessmentHistoryRecord[]> {
  const dbPool = await getPool();
  const connection = await dbPool.getConnection();
  try {
    const result = await connection.execute(
      `
        SELECT
          id,
          TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS timestamp,
          customer_name AS customerName,
          customer_email AS customerEmail,
          source_platform AS sourcePlatform,
          workload_type AS workloadType,
          num_instances AS numInstances,
          total_vcpu AS totalVcpu,
          total_storage_tb AS totalStorageTb,
          currently_running AS currentlyRunning,
          current_version AS currentVersion,
          current_edition AS currentEdition,
          deployment_type AS currentDeploymentType,
          license_purchase_date AS licensePurchaseDate,
          licensing_model AS currentLicensingModel,
          software_assurance AS softwareAssurance,
          windows_licensing AS windowsLicensing,
          target_version AS targetVersion,
          target_edition AS targetEdition,
          hadr_requirements AS hadrRequirements,
          migration_approach AS migrationApproach,
          deployment_model AS deploymentModel,
          licensing_option AS licensingOption,
          recommended_instances AS recommendedInstances,
          recommendation_summary AS recommendationSummary,
          object_storage_key AS objectStorageKey
        FROM SQLAPP_ASSESSMENTS
        ORDER BY created_at DESC
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return (result.rows ?? []) as AssessmentHistoryRecord[];
  } finally {
    await connection.close();
  }
}

async function readLocal(): Promise<AssessmentHistoryRecord[]> {
  try {
    const raw = await fs.readFile(localStorePath(), "utf-8");
    return JSON.parse(raw) as AssessmentHistoryRecord[];
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") return [];
    throw error;
  }
}

async function saveLocal(record: AssessmentHistoryRecord) {
  const filePath = localStorePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const records = await readLocal();
  records.unshift(record);
  await fs.writeFile(filePath, JSON.stringify(records, null, 2));
}

export async function saveAssessmentHistory(input: AssessmentInput): Promise<AssessmentHistoryRecord> {
  const record = buildRecord(input);
  record.objectStorageKey = await archiveToObjectStorage(record);

  if (useOciPersistence()) {
    await saveToAtp(record);
  } else {
    await saveLocal(record);
  }

  return record;
}

export async function getAssessmentHistory(): Promise<AssessmentHistoryRecord[]> {
  if (useOciPersistence()) {
    return readFromAtp();
  }

  return readLocal();
}

export function getAssessmentPersistenceStatus(): AssessmentPersistenceStatus {
  const objectStorageConfigured = hasObjectStorageConfig();

  return {
    historyStore: useOciPersistence() ? "ATP" : "Local file",
    objectStorageArchive: objectStorageConfigured ? "Configured" : "Not configured",
    bucket: objectStorageConfigured ? ENV.ociObjectStorageBucket : undefined,
    region: objectStorageConfigured ? ENV.ociRegion : undefined,
  };
}
