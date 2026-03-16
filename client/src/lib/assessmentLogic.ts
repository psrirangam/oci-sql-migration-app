// Assessment Logic and Recommendation Engine for OCI SQL Server Migration
// Based on SQL Server 2022 Licensing Guide

export interface AssessmentAnswers {
  edition: string;
  licensingModel: string;
  virtualization: string;
  virtualCoresPerVM?: number;
  vmsPerHost?: number;
  softwareAssurance: string;
  licenseMobility?: string;
  haDrBenefit?: string;
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
    keyBenefits: [],
    nextSteps: [],
  };

  // Determine deployment model based on edition and HA/DR requirements
  if (answers.edition === "enterprise") {
    if (answers.hadrRequirements === "disaster-recovery") {
      recommendation.deploymentModel = "Bare Metal or VM.Optimized3.Flex (for maximum performance)";
      recommendation.keyBenefits.push("Maximum performance for mission-critical workloads");
      recommendation.keyBenefits.push("Support for AlwaysOn Availability Groups across regions");
      recommendation.keyBenefits.push("Unlimited VMs with SA on licensed physical cores");
    } else if (answers.hadrRequirements === "advanced-ha") {
      recommendation.deploymentModel = "VM.Standard.E4.Flex or VM.Optimized3.Flex";
      recommendation.keyBenefits.push("Balanced performance and cost for advanced HA");
      recommendation.keyBenefits.push("Support for AlwaysOn Availability Groups within availability domain");
      recommendation.keyBenefits.push("Unlimited VMs with SA on licensed physical cores");
    } else {
      recommendation.deploymentModel = "VM.Standard.E4.Flex";
      recommendation.keyBenefits.push("Cost-effective for non-HA deployments");
      recommendation.keyBenefits.push("Unlimited VMs with SA on licensed physical cores");
    }
  } else if (answers.edition === "standard") {
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
      recommendation.keyBenefits.push("Maximum 24 cores per server limit");
    }
  } else {
    recommendation.deploymentModel = "VM.Standard.E4.Flex";
    recommendation.keyBenefits.push("Suitable for Web, Developer, or Express editions");
  }

  // Determine licensing option and details
  if (answers.softwareAssurance === "yes" && answers.licenseMobility === "yes") {
    recommendation.licensingOption = "BYOL (Bring Your Own License) with License Mobility";
    recommendation.licensingDetails = "Use existing SQL Server licenses on OCI with Flexible Virtualization Benefit. License Mobility allows reassignment within server farm more than once every 90 days.";
    recommendation.keyBenefits.push("Leverage existing SQL Server licenses on OCI");
    recommendation.keyBenefits.push("Flexible Virtualization Benefit for shared OCI infrastructure");
    recommendation.keyBenefits.push("Pay only for OCI infrastructure costs");
    recommendation.costConsiderations = "Lowest cost option if you have existing licenses with active SA. Only pay for OCI compute and storage.";
  } else if (answers.softwareAssurance === "yes") {
    recommendation.licensingOption = "BYOL with Software Assurance benefits";
    recommendation.licensingDetails = "Utilize passive failover rights for HA/DR scenarios at no additional licensing cost. Passive replicas do not require separate SQL Server licenses.";
    recommendation.keyBenefits.push("Passive failover rights for HA/DR scenarios");
    recommendation.keyBenefits.push("No additional licensing for passive replicas");
    recommendation.keyBenefits.push("Unlimited virtualization for Enterprise Edition");
    recommendation.costConsiderations = "Evaluate cost of maintaining SA vs. License Included option. With SA, you get significant HA/DR benefits at no additional licensing cost.";
  } else {
    recommendation.licensingOption = "License Included (OCI Marketplace)";
    recommendation.licensingDetails = "SQL Server licenses are included with OCI compute instance. Simplifies licensing and compliance management.";
    recommendation.keyBenefits.push("Simplified licensing and compliance");
    recommendation.keyBenefits.push("Included support from Oracle and Microsoft");
    recommendation.keyBenefits.push("No need to manage license mobility or SA");
    recommendation.costConsiderations = "Higher per-hour cost includes licensing and support. Recommended if you don't have existing licenses or SA coverage.";
  }

  // Determine architecture based on HA/DR requirements
  if (answers.hadrRequirements === "disaster-recovery") {
    recommendation.architecture = "Multi-region AlwaysOn Availability Groups with OCI FastConnect or VPN for replication";
    recommendation.keyBenefits.push("Geographic redundancy for business continuity");
    recommendation.keyBenefits.push("Automated failover capabilities");
    recommendation.keyBenefits.push("If using SA: Passive DR replica requires no additional SQL Server licenses");
    recommendation.nextSteps.push("Plan multi-region deployment topology");
    recommendation.nextSteps.push("Configure OCI FastConnect or VPN for inter-region connectivity");
    recommendation.nextSteps.push("Set up monitoring and automated failover policies");
    if (answers.softwareAssurance === "yes") {
      recommendation.nextSteps.push("Configure passive DR replica to utilize SA passive failover rights");
    }
  } else if (answers.hadrRequirements === "advanced-ha") {
    recommendation.architecture = "AlwaysOn Availability Groups within single availability domain using OCI Block Volumes";
    recommendation.keyBenefits.push("High availability within a single region");
    recommendation.keyBenefits.push("Automatic failover with minimal data loss");
    if (answers.softwareAssurance === "yes") {
      recommendation.keyBenefits.push("Passive HA replica requires no additional SQL Server licenses");
    }
    recommendation.nextSteps.push("Configure AlwaysOn Availability Groups");
    recommendation.nextSteps.push("Set up OCI Block Volumes for shared storage");
    recommendation.nextSteps.push("Implement monitoring and alerting");
    if (answers.softwareAssurance === "yes") {
      recommendation.nextSteps.push("Configure passive replica to utilize SA passive failover rights (no additional licensing)");
    }
  } else if (answers.hadrRequirements === "basic-ha") {
    recommendation.architecture = "Failover Cluster Instance within single availability domain";
    recommendation.keyBenefits.push("Basic high availability with failover capabilities");
    recommendation.keyBenefits.push("Suitable for Standard Edition HA");
    recommendation.nextSteps.push("Configure Windows Server Failover Clustering");
    recommendation.nextSteps.push("Set up shared storage using OCI Block Volumes");
  } else {
    recommendation.architecture = "Single SQL Server instance on OCI VM";
    recommendation.keyBenefits.push("Simple, straightforward deployment");
    recommendation.nextSteps.push("Plan backup and recovery strategy");
    recommendation.nextSteps.push("Configure automated backups to OCI Object Storage");
  }

  // Determine complexity
  let complexity: "Low" | "Medium" | "High" = "Low";
  if (answers.hadrRequirements === "disaster-recovery") {
    complexity = "High";
  } else if (answers.hadrRequirements === "advanced-ha" || answers.virtualization === "yes") {
    complexity = "Medium";
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

  const summary = generateSummary(answers, recommendation);

  return {
    recommendation,
    summary,
    estimatedComplexity: complexity,
  };
}

function generateSummary(answers: AssessmentAnswers, recommendation: Recommendation): string {
  const edition = answers.edition.charAt(0).toUpperCase() + answers.edition.slice(1);
  const licensing = answers.licensingModel === "per-core" ? "Per-Core" : "Server + CAL";
  const saStatus = answers.softwareAssurance === "yes" ? "active Software Assurance" : "current licensing";

  return `Based on your assessment, we recommend deploying SQL Server 2022 ${edition} Edition using a ${licensing} licensing model on ${recommendation.deploymentModel}. With your ${saStatus}, the ${recommendation.licensingOption} option provides the best balance of cost and flexibility. Your ${answers.hadrRequirements === "no-hadr" ? "single-instance" : answers.hadrRequirements.replace(/-/g, " ")} architecture will be supported by ${recommendation.architecture.split(" ").slice(0, 4).join(" ")}...`;
}

export const QUESTIONS = [
  {
    id: "edition",
    category: "SQL Server Configuration",
    question: "Which edition of SQL Server 2022 are you currently using or planning to use?",
    type: "radio",
    options: [
      { value: "enterprise", label: "Enterprise Edition (Unlimited virtualization with SA)" },
      { value: "standard", label: "Standard Edition (Max 24 cores, limited virtualization)" },
      { value: "web", label: "Web Edition (Limited features, cloud-only)" },
      { value: "developer", label: "Developer Edition (Non-production use only)" },
      { value: "express", label: "Express Edition (Max 4 cores, 10 GB database)" },
    ],
  },
  {
    id: "licensingModel",
    category: "Licensing Model",
    question: "How is your SQL Server currently licensed or how do you plan to license it?",
    type: "radio",
    options: [
      { value: "per-core", label: "Per Core (2-core packs, minimum 4 cores per VM)" },
      { value: "server-cal", label: "Server + Client Access Licenses (CALs)" },
    ],
  },
  {
    id: "virtualization",
    category: "Deployment",
    question: "Are you planning to deploy SQL Server in a virtualized environment on OCI?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes, virtualized VMs" },
      { value: "no", label: "No, bare metal preferred" },
    ],
  },
  {
    id: "virtualCoresPerVM",
    category: "Deployment",
    question: "How many virtual cores (vCPUs) are allocated to each SQL Server VM?",
    type: "number",
    conditional: { field: "virtualization", value: "yes" },
    placeholder: "e.g., 8, 16, 32",
  },
  {
    id: "vmsPerHost",
    category: "Deployment",
    question: "How many SQL Server VMs are planned per physical host?",
    type: "number",
    conditional: { field: "virtualization", value: "yes" },
    placeholder: "e.g., 1, 2, 4",
  },
  {
    id: "softwareAssurance",
    category: "Licensing Benefits",
    question: "Do you have active Software Assurance (SA) for your SQL Server licenses?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes, we have active SA (Includes passive failover rights and License Mobility)" },
      { value: "no", label: "No, we do not have SA" },
    ],
  },
  {
    id: "licenseMobility",
    category: "Licensing Benefits",
    question: "Are you interested in utilizing License Mobility through Software Assurance for cloud deployments?",
    type: "radio",
    conditional: { field: "softwareAssurance", value: "yes" },
    options: [
      { value: "yes", label: "Yes, use License Mobility (BYOL with Flexible Virtualization Benefit)" },
      { value: "no", label: "No, prefer License Included option" },
    ],
  },
  {
    id: "haDrBenefit",
    category: "Licensing Benefits",
    question: "Are you interested in the HA/DR benefits provided by SA (e.g., passive failover rights)?",
    type: "radio",
    conditional: { field: "softwareAssurance", value: "yes" },
    options: [
      { value: "yes", label: "Yes, utilize HA/DR passive failover rights (no additional licensing for passive replicas)" },
      { value: "no", label: "No, not applicable to our scenario" },
    ],
  },
  {
    id: "hadrRequirements",
    category: "High Availability & Disaster Recovery",
    question: "What are your High Availability (HA) and Disaster Recovery (DR) requirements for SQL Server?",
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
