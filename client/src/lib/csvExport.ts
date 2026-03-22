import { AssessmentAnswers, Recommendation } from "./assessmentLogic";

export interface AssessmentRecord {
  timestamp: string;
  customerName: string;
  customerEmail: string;
  numInstances: number;
  currentVersion: string;
  currentEdition: string;
  currentDeployment: string;
  deploymentType: string;
  licensePurchaseDate: string;
  currentLicensingModel: string;
  softwareAssurance: string;
  targetVersion: string;
  targetEdition: string;
  hadrRequirements: string;
  migrationApproach: string;
  recommendedDeploymentModel: string;
  recommendedLicensingOption: string;
  recommendedArchitecture: string;
}

export function convertAssessmentToRecord(
  answers: AssessmentAnswers,
  recommendation: Recommendation
): AssessmentRecord {
  return {
    timestamp: new Date().toISOString(),
    customerName: answers.customerName || "Not provided",
    customerEmail: answers.customerEmail || "Not provided",
    numInstances: answers.numInstances || 0,
    currentVersion: answers.currentVersion || "Unknown",
    currentEdition: answers.currentEdition || "Unknown",
    currentDeployment: answers.currentDeployment || "Unknown",
    deploymentType: answers.currentDeploymentType || "Unknown",
    licensePurchaseDate: answers.licensePurchaseDate || "Unknown",
    currentLicensingModel: answers.currentLicensingModel || "Unknown",
    softwareAssurance: answers.softwareAssurance || "Unknown",
    targetVersion: answers.targetVersion || "Unknown",
    targetEdition: answers.targetEdition || "Unknown",
    hadrRequirements: answers.hadrRequirements || "Unknown",
    migrationApproach: answers.migrationApproach || "Unknown",
    recommendedDeploymentModel: recommendation.deploymentModel,
    recommendedLicensingOption: recommendation.licensingOption,
    recommendedArchitecture: recommendation.architecture,
  };
}

export function recordToCSVRow(record: AssessmentRecord): string {
  const values = [
    escapeCSVValue(record.timestamp),
    escapeCSVValue(record.customerName),
    escapeCSVValue(record.customerEmail),
    record.numInstances.toString(),
    escapeCSVValue(record.currentVersion),
    escapeCSVValue(record.currentEdition),
    escapeCSVValue(record.currentDeployment),
    escapeCSVValue(record.deploymentType),
    escapeCSVValue(record.licensePurchaseDate),
    escapeCSVValue(record.currentLicensingModel),
    escapeCSVValue(record.softwareAssurance),
    escapeCSVValue(record.targetVersion),
    escapeCSVValue(record.targetEdition),
    escapeCSVValue(record.hadrRequirements),
    escapeCSVValue(record.migrationApproach),
    escapeCSVValue(record.recommendedDeploymentModel),
    escapeCSVValue(record.recommendedLicensingOption),
    escapeCSVValue(record.recommendedArchitecture),
  ];
  return values.join(",");
}

export function getCSVHeaders(): string {
  const headers = [
    "Timestamp",
    "Customer Name",
    "Customer Email",
    "Number of Instances",
    "Current Version",
    "Current Edition",
    "Current Deployment",
    "Deployment Type (PaaS/IaaS)",
    "License Purchase Date",
    "Current Licensing Model",
    "Software Assurance",
    "Target Version",
    "Target Edition",
    "HA/DR Requirements",
    "Migration Approach",
    "Recommended Deployment Model",
    "Recommended Licensing Option",
    "Recommended Architecture",
  ];
  return headers.map(escapeCSVValue).join(",");
}

function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(records: AssessmentRecord[]): void {
  const headers = getCSVHeaders();
  const rows = records.map(recordToCSVRow);
  const csvContent = [headers, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `oci-sql-assessments-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function saveRecordToLocalStorage(record: AssessmentRecord): void {
  const records = getRecordsFromLocalStorage();
  records.push(record);
  localStorage.setItem("oci-sql-assessments", JSON.stringify(records));
}

export function getRecordsFromLocalStorage(): AssessmentRecord[] {
  const stored = localStorage.getItem("oci-sql-assessments");
  return stored ? JSON.parse(stored) : [];
}

export function downloadAllRecords(): void {
  const records = getRecordsFromLocalStorage();
  if (records.length === 0) {
    alert("No assessment records found. Complete some assessments first.");
    return;
  }
  downloadCSV(records);
}

export function isValidOracleEmail(email: string): boolean {
  const oracleEmailRegex = /^[^@]+@oracle\.com$/i;
  return oracleEmailRegex.test(email.trim());
}
