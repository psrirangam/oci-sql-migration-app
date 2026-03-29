import { AssessmentAnswers } from './assessmentLogic';

export interface AssessmentRecord {
  id: string;
  timestamp: number;
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
  recommendedCostConsiderations: string;
  estimatedComplexity: string;
  summary: string;
}

export function convertAssessmentToRecord(
  answers: AssessmentAnswers,
  recommendation: any
): AssessmentRecord {
  return {
    id: `assessment-${Date.now()}`,
    timestamp: Date.now(),
    customerName: answers.customerName,
    customerEmail: answers.customerEmail,
    numInstances: parseInt(answers.numInstances) || 0,
    currentVersion: answers.currentVersion || '',
    currentEdition: answers.currentEdition || '',
    currentDeployment: answers.currentDeployment || '',
    deploymentType: answers.currentDeploymentType || '',
    licensePurchaseDate: answers.licensePurchaseDate || '',
    currentLicensingModel: answers.currentLicensingModel || '',
    softwareAssurance: answers.softwareAssurance || '',
    targetVersion: answers.targetVersion || '',
    targetEdition: answers.targetEdition || '',
    hadrRequirements: answers.hadrRequirements || '',
    migrationApproach: answers.migrationApproach || '',
    recommendedDeploymentModel: recommendation.deploymentModel || '',
    recommendedLicensingOption: recommendation.licensingOption || '',
    recommendedArchitecture: recommendation.architecture || '',
    recommendedCostConsiderations: recommendation.costConsiderations || '',
    estimatedComplexity: 'Medium',
    summary: '',
  };
}

export function saveRecordToLocalStorage(record: AssessmentRecord): void {
  try {
    const records = getRecordsFromLocalStorage();
    records.push(record);
    localStorage.setItem('assessmentRecords', JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save assessment record:', error);
  }
}

export function getRecordsFromLocalStorage(): AssessmentRecord[] {
  try {
    const data = localStorage.getItem('assessmentRecords');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get assessment records:', error);
    return [];
  }
}

export function deleteRecordFromLocalStorage(id: string): void {
  try {
    const records = getRecordsFromLocalStorage();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem('assessmentRecords', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete assessment record:', error);
  }
}

export function clearAllRecords(): void {
  try {
    localStorage.removeItem('assessmentRecords');
  } catch (error) {
    console.error('Failed to clear assessment records:', error);
  }
}

export function isValidOracleEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@oracle.com');
}
