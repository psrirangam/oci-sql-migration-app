// Assessment Logic and Recommendation Engine for OCI SQL Server Migration
// Based on SQL Server 2022 Licensing Guide and October 1, 2019 Licensing Changes

export interface AssessmentAnswers {
  // Current State
  currentlyRunning: string;
  currentVersion?: string;
  currentEdition?: string;
  currentDeployment?: string;
  licensePurchaseDate?: string;
  currentLicensingModel?: string;
  softwareAssurance?: string;
  
  // Target State
  targetVersion: string;
  targetEdition?: string;
  targetCloud: string;
  
  // HA/DR and Migration
  hadrRequirements: string;
  migrationApproach: string;
}

export interface Recommendation {
  deploymentModel: string;
  licensingOption: string;
  architecture: string;
  costConsiderations: string;
  keyBenefits: string[];
  nextSteps: string[];
  licensingDetails: string;
  complianceNotes: string;
}

export interface AssessmentResult {
  recommendation: Recommendation;
  summary: string;
  estimatedComplexity: "Low" | "Medium" | "High";
}

export function generateRecommendation(answers: AssessmentAnswers): AssessmentResult {
  const recommendation: Recommendation = {
    deploymentModel: "",
    licensingOption: "",
    architecture: "",
    costConsiderations: "",
    licensingDetails: "",
    complianceNotes: "",
    keyBenefits: [],
    nextSteps: [],
  };

  // Determine if customer is upgrading or staying on same version
  const isUpgrading = answers.currentVersion !== answers.targetVersion;
  const isNewVersion = answers.targetVersion === "2022" || answers.targetVersion === "2019-new";
  
  // Determine if target is a Listed Provider (Azure, AWS, GCP, Alibaba)
  const isListedProvider = ["azure", "aws", "gcp", "alibaba"].includes(answers.targetCloud);
  const isOCI = answers.targetCloud === "oci";
  
  // Check if license was purchased before October 1, 2019 (grandfathered)
  const isGrandfathered = answers.licensePurchaseDate === "before-oct-2019";
  const hasSA = answers.softwareAssurance === "yes";

  // Determine deployment model based on edition and HA/DR requirements
  if (answers.targetEdition === "enterprise") {
    if (answers.hadrRequirements === "disaster-recovery") {
      recommendation.deploymentModel = "Bare Metal or VM.Optimized3.Flex (for maximum performance)";
      recommendation.keyBenefits.push("Maximum performance for mission-critical workloads");
      recommendation.keyBenefits.push("Support for AlwaysOn Availability Groups across regions");
    } else if (answers.hadrRequirements === "advanced-ha") {
      recommendation.deploymentModel = "VM.Standard.E4.Flex or VM.Optimized3.Flex";
      recommendation.keyBenefits.push("Balanced performance and cost for advanced HA");
      recommendation.keyBenefits.push("Support for AlwaysOn Availability Groups within availability domain");
    } else {
      recommendation.deploymentModel = "VM.Standard.E4.Flex";
      recommendation.keyBenefits.push("Cost-effective for non-HA deployments");
    }
  } else if (answers.targetEdition === "standard") {
    if (answers.hadrRequirements === "disaster-recovery") {
      recommendation.deploymentModel = "VM.Standard.E4.Flex or VM.Optimized3.Flex";
      recommendation.keyBenefits.push("Suitable for Standard Edition HA/DR scenarios");
      recommendation.keyBenefits.push("Maximum 24 cores per server limit");
    } else if (answers.hadrRequirements === "advanced-ha") {
      recommendation.deploymentModel = "VM.Standard.E4.Flex";
      recommendation.keyBenefits.push("Supports Failover Cluster Instances");
      recommendation.keyBenefits.push("Maximum 24 cores per server limit");
    } else {
      recommendation.deploymentModel = "VM.Standard.E4.Flex";
      recommendation.keyBenefits.push("Cost-effective for Standard Edition deployments");
    }
  } else {
    recommendation.deploymentModel = "VM.Standard.E4.Flex";
    recommendation.keyBenefits.push("Suitable for Web, Developer, or Express editions");
  }

  // Determine licensing option based on October 1, 2019 rules
  if (isOCI) {
    // OCI is NOT a Listed Provider - can use BYOL without SA
    if (isUpgrading && isNewVersion) {
      // Upgrading to new version requires SA or other option
      if (hasSA) {
        recommendation.licensingOption = "BYOL with License Mobility (Software Assurance)";
        recommendation.licensingDetails = "Use License Mobility to deploy SQL Server 2022 on OCI. With SA, you can reassign licenses within server farm more than once every 90 days.";
        recommendation.keyBenefits.push("Leverage existing SQL Server licenses on OCI");
        recommendation.keyBenefits.push("License Mobility enables flexible deployment");
        recommendation.costConsiderations = "Cost includes SA maintenance + OCI infrastructure. Most cost-effective if you have active SA.";
      } else {
        recommendation.licensingOption = "License Included (OCI Marketplace) or Purchase SA";
        recommendation.licensingDetails = "For SQL Server 2022, you have two options: (1) Purchase License Included from OCI Marketplace (includes licensing and support), or (2) Purchase Software Assurance to enable BYOL with License Mobility.";
        recommendation.keyBenefits.push("Simplified licensing and compliance");
        recommendation.keyBenefits.push("Included support from Oracle and Microsoft");
        recommendation.costConsiderations = "License Included option has higher per-hour cost but simplifies management. Alternatively, purchase SA to enable BYOL.";
        recommendation.complianceNotes = "";
      }
    } else {
      // Staying on same version or older version
      if (isGrandfathered && !isNewVersion) {
        recommendation.licensingOption = "BYOL (Grandfathered - No SA Required)";
        recommendation.licensingDetails = "Your SQL Server license was purchased before October 1, 2019 and is grandfathered. You can deploy on OCI without Software Assurance.";
        recommendation.keyBenefits.push("No SA required - significant cost savings");
        recommendation.keyBenefits.push("Pay only for OCI infrastructure");
        recommendation.keyBenefits.push("OCI is not a Listed Provider - full flexibility");
        recommendation.costConsiderations = "Lowest cost option. Only pay for OCI compute and storage. No SA renewal required.";
      } else if (hasSA) {
        recommendation.licensingOption = "BYOL with License Mobility (Software Assurance)";
        recommendation.licensingDetails = "Use License Mobility to deploy on OCI. With SA, you can reassign licenses within server farm more than once every 90 days.";
        recommendation.keyBenefits.push("Leverage existing SQL Server licenses on OCI");
        recommendation.keyBenefits.push("License Mobility enables flexible deployment");
        recommendation.costConsiderations = "Cost includes SA maintenance + OCI infrastructure.";
      } else {
        recommendation.licensingOption = "License Included (OCI Marketplace)";
        recommendation.licensingDetails = "SQL Server licenses are included with OCI compute instance. Simplifies licensing and compliance management.";
        recommendation.keyBenefits.push("Simplified licensing and compliance");
        recommendation.keyBenefits.push("Included support from Oracle and Microsoft");
        recommendation.costConsiderations = "Higher per-hour cost includes licensing and support.";
      }
    }
  } else if (isListedProvider) {
    // Azure, AWS, GCP, Alibaba - subject to October 1, 2019 rules
    if (isGrandfathered && !isNewVersion && !isUpgrading) {
      recommendation.licensingOption = "BYOL (Grandfathered - Existing License)";
      recommendation.licensingDetails = "Your SQL Server license was purchased before October 1, 2019 and is grandfathered for use on Listed Providers. However, you cannot add new workloads with licenses acquired after October 1, 2019.";
      recommendation.keyBenefits.push("Can continue using existing licenses");
      recommendation.keyBenefits.push("No SA required for existing workloads");
      recommendation.complianceNotes = "Cannot add new workloads. When upgrading to new versions, must follow new licensing rules.";
      recommendation.costConsiderations = "Lowest cost for existing workloads, but limited flexibility for expansion.";
    } else if (hasSA) {
      if (answers.targetCloud === "azure") {
        recommendation.licensingOption = "Azure Hybrid Benefit (AHB) with Software Assurance";
        recommendation.licensingDetails = "Use Azure Hybrid Benefit to get reduced pricing on Azure Dedicated Host. With SA, Enterprise Edition gets unlimited virtualization.";
        recommendation.keyBenefits.push("40-55% discount on Azure infrastructure");
        recommendation.keyBenefits.push("Unlimited virtualization for Enterprise Edition");
        recommendation.keyBenefits.push("Extended Security Updates included");
        recommendation.costConsiderations = "Significantly reduced Azure costs with AHB. Includes SA benefits.";
        recommendation.complianceNotes = "";
      } else {
        const cloudName = answers.targetCloud ? answers.targetCloud.toUpperCase() : "cloud provider";
        recommendation.licensingOption = "License Mobility through Software Assurance";
        recommendation.licensingDetails = "Use License Mobility to deploy on " + cloudName + " dedicated hosts. With SA, you can reassign licenses within server farm.";
        recommendation.keyBenefits.push("Deploy on " + cloudName + " with existing licenses");
        recommendation.keyBenefits.push("License Mobility enables flexible deployment");
        recommendation.costConsiderations = "Cost includes SA maintenance + cloud infrastructure.";
        recommendation.complianceNotes = "";
      }
      } else {
        const cloudName = answers.targetCloud ? answers.targetCloud.toUpperCase() : "cloud provider";
        recommendation.licensingOption = "SPLA or License Included from Cloud Provider";
        recommendation.licensingDetails = "Without Software Assurance, you must use either: (1) Services Provider License Agreement (SPLA) with a licensed provider, or (2) License-Included offerings from " + cloudName;
        recommendation.keyBenefits.push("Simplified licensing compliance");
        recommendation.keyBenefits.push("Pay-as-you-go model");
        recommendation.costConsiderations = "Higher per-hour cost includes licensing. Consider purchasing SA if planning long-term deployment.";
        recommendation.complianceNotes = "Cannot use BYOL without SA on Listed Providers for licenses purchased after October 1, 2019.";
      }
  }

  // Determine architecture based on HA/DR requirements
  if (answers.hadrRequirements === "disaster-recovery") {
    recommendation.architecture = "Multi-region AlwaysOn Availability Groups with OCI FastConnect or VPN for replication";
    recommendation.keyBenefits.push("Geographic redundancy for business continuity");
    recommendation.keyBenefits.push("Automated failover capabilities");
    recommendation.nextSteps.push("Plan multi-region deployment topology");
    recommendation.nextSteps.push("Configure OCI FastConnect or VPN for inter-region connectivity");
    recommendation.nextSteps.push("Set up monitoring and automated failover policies");
  } else if (answers.hadrRequirements === "advanced-ha") {
    recommendation.architecture = "AlwaysOn Availability Groups within single availability domain using OCI Block Volumes";
    recommendation.keyBenefits.push("High availability within a single region");
    recommendation.keyBenefits.push("Automatic failover with minimal data loss");
    recommendation.nextSteps.push("Configure AlwaysOn Availability Groups");
    recommendation.nextSteps.push("Set up OCI Block Volumes for shared storage");
    recommendation.nextSteps.push("Implement monitoring and alerting");
  } else if (answers.hadrRequirements === "basic-ha") {
    recommendation.architecture = "Failover Cluster Instance within single availability domain";
    recommendation.keyBenefits.push("Basic high availability with failover capabilities");
    recommendation.nextSteps.push("Configure Windows Server Failover Clustering");
    recommendation.nextSteps.push("Set up shared storage using OCI Block Volumes");
  } else {
    recommendation.architecture = "Single SQL Server instance on OCI VM";
    recommendation.keyBenefits.push("Simple, straightforward deployment");
    recommendation.nextSteps.push("Plan backup and recovery strategy");
    recommendation.nextSteps.push("Configure automated backups to OCI Object Storage");
  }

  // Add migration-specific next steps
  if (answers.migrationApproach === "lift-shift") {
    recommendation.nextSteps.push("Plan database migration using native SQL Server backup/restore or third-party tools");
    recommendation.nextSteps.push("Validate application compatibility on OCI");
  } else if (answers.migrationApproach === "replatform") {
    recommendation.nextSteps.push("Evaluate OCI Database Service or optimized VM configurations");
    recommendation.nextSteps.push("Plan data migration and application re-configuration");
  } else if (answers.migrationApproach === "refactor") {
    recommendation.nextSteps.push("Assess cloud-native database options (e.g., OCI Autonomous Database)");
    recommendation.nextSteps.push("Plan application re-architecture and data migration strategy");
  }

  // Determine complexity
  let complexity: "Low" | "Medium" | "High" = "Low";
  if (answers.hadrRequirements === "disaster-recovery") {
    complexity = "High";
  } else if (answers.hadrRequirements === "advanced-ha") {
    complexity = "Medium";
  }

  const summary = generateSummary(answers, recommendation);

  return {
    recommendation,
    summary,
    estimatedComplexity: complexity,
  };
}

function generateSummary(answers: AssessmentAnswers, recommendation: Recommendation): string {
  const targetEdition = answers.targetEdition ? answers.targetEdition.charAt(0).toUpperCase() + answers.targetEdition.slice(1) : "Standard";
  const targetVersion = answers.targetVersion === "2022" ? "SQL Server 2022" : "SQL Server 2019";
  
  return `Based on your assessment, we recommend deploying ${targetVersion} ${targetEdition} Edition on ${recommendation.deploymentModel}. The ${recommendation.licensingOption} option provides the best balance of cost and flexibility for your scenario. Your ${answers.hadrRequirements === "no-hadr" ? "single-instance" : (answers.hadrRequirements || "standard").replace(/-/g, " ")} architecture will be supported by ${recommendation.architecture.split(" ").slice(0, 4).join(" ")}...`;
}

export const QUESTIONS = [
  // Current State Section
  {
    id: "currentlyRunning",
    category: "Current State",
    question: "Are you currently running SQL Server?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes, we have SQL Server running" },
      { value: "no", label: "No, this is a new deployment" },
    ],
  },
  {
    id: "currentVersion",
    category: "Current State",
    question: "What version of SQL Server are you currently running?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "2008", label: "SQL Server 2008 or 2008 R2" },
      { value: "2012", label: "SQL Server 2012" },
      { value: "2014", label: "SQL Server 2014" },
      { value: "2016", label: "SQL Server 2016" },
      { value: "2017", label: "SQL Server 2017" },
      { value: "2019", label: "SQL Server 2019" },
      { value: "2022", label: "SQL Server 2022" },
    ],
  },
  {
    id: "currentEdition",
    category: "Current State",
    question: "What edition of SQL Server are you currently running?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "enterprise", label: "Enterprise Edition" },
      { value: "standard", label: "Standard Edition" },
      { value: "web", label: "Web Edition" },
      { value: "express", label: "Express Edition" },
      { value: "developer", label: "Developer Edition" },
    ],
  },
  {
    id: "currentDeployment",
    category: "Current State",
    question: "Where is your SQL Server currently deployed?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "on-premises", label: "On-premises (physical or virtualized)" },
      { value: "azure", label: "Microsoft Azure" },
      { value: "aws", label: "Amazon Web Services (AWS)" },
      { value: "gcp", label: "Google Cloud Platform (GCP)" },
      { value: "oci", label: "Oracle Cloud Infrastructure (OCI)" },
      { value: "other", label: "Other cloud provider" },
    ],
  },
  {
    id: "licensePurchaseDate",
    category: "Current State",
    question: "When was your SQL Server license originally purchased?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "before-oct-2019", label: "Before October 1, 2019 (Grandfathered for cloud deployment)" },
      { value: "after-oct-2019", label: "On or after October 1, 2019" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    id: "currentLicensingModel",
    category: "Current State",
    question: "How is your current SQL Server licensed?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "per-core", label: "Per Core (2-core packs)" },
      { value: "server-cal", label: "Server + Client Access Licenses (CALs)" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    id: "softwareAssurance",
    category: "Current State",
    question: "Do you have active Software Assurance (SA) on your SQL Server licenses?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "yes", label: "Yes, we have active Software Assurance" },
      { value: "no", label: "No, we do not have Software Assurance" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },

  // Target State Section
  {
    id: "targetVersion",
    category: "Target State",
    question: "What SQL Server version do you want to deploy on OCI?",
    type: "radio",
    options: [
      { value: "2019", label: "SQL Server 2019 (Stay on current version)" },
      { value: "2022", label: "SQL Server 2022 (Upgrade to latest)" },
    ],
  },
  {
    id: "targetEdition",
    category: "Target State",
    question: "What edition of SQL Server do you want on OCI?",
    type: "radio",
    options: [
      { value: "enterprise", label: "Enterprise Edition (Unlimited virtualization with SA)" },
      { value: "standard", label: "Standard Edition (Max 24 cores, limited virtualization)" },
      { value: "web", label: "Web Edition (Limited features, cloud-only)" },
      { value: "express", label: "Express Edition (Max 4 cores, 10 GB database)" },
    ],
  },
  {
    id: "targetCloud",
    category: "Target State",
    question: "You're deploying on OCI - are you aware of the licensing advantages?",
    type: "radio",
    options: [
      { value: "oci", label: "Yes, OCI (Oracle Cloud Infrastructure) - not a Listed Provider" },
      { value: "azure", label: "Actually, I need to deploy on Azure instead" },
      { value: "aws", label: "Actually, I need to deploy on AWS instead" },
      { value: "gcp", label: "Actually, I need to deploy on Google Cloud instead" },
    ],
  },

  // HA/DR and Migration
  {
    id: "hadrRequirements",
    category: "High Availability & Disaster Recovery",
    question: "What are your High Availability (HA) and Disaster Recovery (DR) requirements?",
    type: "radio",
    options: [
      { value: "no-hadr", label: "No HA/DR required (Single instance)" },
      { value: "basic-ha", label: "Basic HA (Failover Cluster Instance within single Availability Domain)" },
      { value: "advanced-ha", label: "Advanced HA (AlwaysOn Availability Groups within single Availability Domain)" },
      { value: "disaster-recovery", label: "Disaster Recovery (AlwaysOn Availability Groups across Regions/Availability Domains)" },
    ],
  },
  {
    id: "migrationApproach",
    category: "Migration Strategy",
    question: "What is your preferred migration approach to OCI?",
    type: "radio",
    options: [
      { value: "lift-shift", label: "Lift and Shift (re-host existing instances)" },
      { value: "replatform", label: "Re-platform (optimize for OCI VMs or Database Service)" },
      { value: "refactor", label: "Re-factor (re-architect for cloud-native)" },
    ],
  },
];
