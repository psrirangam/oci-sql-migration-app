export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  persistenceMode: process.env.PERSISTENCE_MODE ?? "",
  atpUser: process.env.ATP_USER ?? "SQLAPP",
  atpPassword: process.env.ATP_PASSWORD ?? "",
  atpConnectionString:
    process.env.ATP_CONNECTION_STRING ??
    "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=gd3e6af0af13349_sqlassessment_tp.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))",
  dataDir: process.env.DATA_DIR ?? "data",
  ociRegion: process.env.OCI_REGION ?? "us-ashburn-1",
  ociObjectStorageNamespace: process.env.OCI_OBJECT_STORAGE_NAMESPACE ?? "",
  ociObjectStorageBucket: process.env.OCI_OBJECT_STORAGE_BUCKET ?? "sqlappbucket",
  ociObjectStorageBucketOcid:
    process.env.OCI_OBJECT_STORAGE_BUCKET_OCID ??
    "ocid1.bucket.oc1.iad.aaaaaaaaw6pkn3oasyos63zyeaguwwspvltqr3tnsiaydqrvzn6cttsecnva",
  ociS3AccessKeyId: process.env.OCI_S3_ACCESS_KEY_ID ?? "",
  ociS3SecretAccessKey: process.env.OCI_S3_SECRET_ACCESS_KEY ?? "",
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "msadmin"),
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "dev-admin-session-secret"),
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
