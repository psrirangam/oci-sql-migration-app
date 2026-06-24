export interface AssessmentAnswers {
  customerName: string;
  customerEmail: string;
  sourcePlatform: "on-premises" | "azure" | "aws" | "other";
  workloadType: "windows-sql" | "sql-only" | "windows-only";
  numInstances: string;
  totalVcpu?: string;
  totalStorageTb?: string;
  currentlyRunning: "yes" | "no";
  currentVersion?: string;
  currentEdition?: string;
  currentDeploymentType?: "physical" | "virtualized" | "iaas" | "paas";
  licensePurchaseDate?: "before-oct-2019" | "after-oct-2019" | "unknown";
  currentLicensingModel?: "per-core" | "server-cal" | "license-included" | "unknown";
  softwareAssurance?: "yes" | "no" | "unknown";
  windowsLicensing?: "oci-included" | "byol" | "unknown";
  targetVersion?: string;
  targetEdition?: string;
  hadrRequirements?: "none" | "high-availability" | "disaster-recovery";
  migrationApproach?: "lift-shift" | "replatform" | "modernize";
}

export interface Recommendation {
  deploymentModel: string;
  licensingOption: string;
  licensingDetails: string;
  architecture: string;
  costConsiderations: string;
  complianceNotes: string;
  keyBenefits: string[];
  nextSteps: string[];
  recommendedInstances?: string[];
  marketplaceLinks?: string[];
}

export interface Question {
  id: keyof AssessmentAnswers;
  category: string;
  question: string;
  helper?: string;
  type: "radio" | "text" | "email" | "number";
  options?: Array<{ value: string; label: string }>;
  getOptions?: (answers: Partial<AssessmentAnswers>) => Array<{ value: string; label: string }>;
  conditional?: (answers: Partial<AssessmentAnswers>) => boolean;
}

const marketplaceBaseUrl = "https://cloudmarketplace.oracle.com/marketplace/en_US/homePage.jspx?tag=SQL+Server";

const labels: Record<string, string> = {
  "on-premises": "On-premises data center",
  azure: "Microsoft Azure",
  aws: "Amazon Web Services",
  other: "Other environment",
  "windows-sql": "Windows Server and SQL Server",
  "sql-only": "SQL Server only",
  "windows-only": "Windows Server only",
  physical: "Physical servers",
  virtualized: "VMware, Hyper-V, or other virtualization",
  iaas: "Cloud IaaS virtual machines",
  paas: "Managed database/PaaS",
  "before-oct-2019": "Before October 1, 2019",
  "after-oct-2019": "On or after October 1, 2019",
  unknown: "Unknown",
  "per-core": "SQL Server Per Core",
  "server-cal": "SQL Server Server + CAL",
  "license-included": "Cloud provider license included",
  yes: "Yes",
  no: "No",
  "oci-included": "Use OCI Windows Server license included",
  byol: "Bring Windows Server licenses",
  enterprise: "Enterprise Edition",
  standard: "Standard Edition",
  developer: "Developer Edition",
  "sql-2022": "SQL Server 2022",
  "sql-2019": "SQL Server 2019",
  "sql-2016-or-older": "SQL Server 2016 or older",
  none: "Single instance / backup and restore",
  "high-availability": "High availability within an OCI region",
  "disaster-recovery": "Cross-region disaster recovery",
  "lift-shift": "Lift and shift",
  replatform: "Re-platform on OCI Compute",
  modernize: "Modernize to Oracle Database, PostgreSQL, or MySQL HeatWave",
};

function label(value?: string): string {
  if (!value) return "Not provided";
  return labels[value] ?? value;
}

function needsSql(answers: AssessmentAnswers): boolean {
  return answers.workloadType !== "windows-only";
}

function needsWindows(answers: AssessmentAnswers): boolean {
  return answers.workloadType !== "sql-only";
}

function estimateComplexity(answers: AssessmentAnswers): "Low" | "Medium" | "High" {
  const instanceCount = Number.parseInt(answers.numInstances, 10) || 0;
  if (answers.hadrRequirements === "disaster-recovery" || instanceCount > 25 || answers.migrationApproach === "modernize") {
    return "High";
  }
  if (answers.hadrRequirements === "high-availability" || instanceCount > 5 || answers.sourcePlatform !== "on-premises") {
    return "Medium";
  }
  return "Low";
}

function getDeploymentModel(answers: AssessmentAnswers): string {
  if (answers.hadrRequirements === "disaster-recovery") {
    return "OCI Compute across two OCI regions";
  }
  if (answers.hadrRequirements === "high-availability") {
    return "OCI Compute across multiple availability domains or fault domains";
  }
  if (answers.currentDeploymentType === "physical" || answers.totalVcpu && Number.parseInt(answers.totalVcpu, 10) > 64) {
    return "OCI Compute, with Bare Metal evaluation for large or consolidated hosts";
  }
  return "OCI Compute VM.Standard flexible shapes, with VM.Optimized3.Flex evaluation for latency-sensitive workloads";
}

function getArchitecture(answers: AssessmentAnswers): string {
  if (!needsSql(answers)) {
    return "Migrate Windows Server workloads to OCI Compute with OCI Block Volumes, image-based migration where suitable, and native OCI backup policies.";
  }
  if (answers.hadrRequirements === "disaster-recovery") {
    return "Use SQL Server on OCI Compute with Always On Availability Groups or failover clustering for local HA, plus cross-region replication and a documented DR runbook.";
  }
  if (answers.hadrRequirements === "high-availability") {
    return answers.targetEdition === "standard"
      ? "Use SQL Server failover clustering for instance-level HA, or Basic Availability Groups only when the workload fits Standard Edition limits."
      : "Use SQL Server Always On Availability Groups or failover clustering across OCI fault domains or availability domains.";
  }
  return "Use a right-sized Windows Server VM on OCI Compute with SQL Server installed from a marketplace image or customer image, backed by OCI Block Volumes and scheduled backups.";
}

function getLicensing(answers: AssessmentAnswers): { option: string; details: string } {
  if (!needsSql(answers)) {
    return {
      option: answers.windowsLicensing === "byol" ? "Windows Server BYOL validation required" : "OCI Windows Server license included",
      details:
        "For Windows-only workloads, keep the first deployment path simple: use OCI Windows Server license-included images unless the customer has validated BYOL rights under current Microsoft Product Terms and Flexible Virtualization Benefit rules.",
    };
  }

  const hasSA = answers.softwareAssurance === "yes";
  const grandfathered = answers.licensePurchaseDate === "before-oct-2019";
  const sourceLicenseIncluded = answers.currentLicensingModel === "license-included";

  if (sourceLicenseIncluded) {
    return {
      option: "OCI SQL Server license included",
      details:
        "The current cloud deployment appears to use license-included SQL Server. Recommend OCI Marketplace SQL Server license-included images unless the account team validates separate SQL Server entitlements. Confirm marketplace image billing terms, including the SQL Server minimum billing period.",
    };
  }

  if (grandfathered || hasSA) {
    return {
      option: "BYOL candidate, validate license mobility and Software Assurance",
      details:
        "Existing SQL Server licenses may be usable on OCI only after validating Microsoft Product Terms, Software Assurance or subscription status, License Mobility or Flexible Virtualization Benefit eligibility, edition, core counts, and passive failover rights before final sizing.",
    };
  }

  return {
    option: "OCI SQL Server license included or new SQL Server licensing",
    details:
      "No clear BYOL entitlement was provided. Use OCI Marketplace SQL Server license-included images for the simplest path, or engage licensing support before recommending a new BYOL purchase.",
  };
}

function getInstances(answers: AssessmentAnswers): string[] {
  const totalVcpu = Number.parseInt(answers.totalVcpu || "0", 10);
  const storageTb = Number.parseFloat(answers.totalStorageTb || "0");
  const instances = [];

  if (answers.targetEdition === "enterprise" || totalVcpu > 48) {
    instances.push("VM.Optimized3.Flex for latency-sensitive SQL Server workloads");
    instances.push("BM.Standard.E5 or BM.Standard.E6 for large consolidated hosts, license isolation, or very high throughput");
  } else {
    instances.push("VM.Standard.E5.Flex or VM.Standard.E6.Flex for general Windows and SQL Server workloads");
    instances.push("VM.Optimized3.Flex for latency-sensitive SQL Server databases");
  }

  if (storageTb >= 5) {
    instances.push("OCI Block Volume with performance-based VPUs; evaluate striped volumes for high IOPS databases");
  } else {
    instances.push("OCI Block Volume with scheduled backups and performance tuned after workload profiling");
  }

  return instances;
}

export function generateRecommendation(
  answers: AssessmentAnswers
): { recommendation: Recommendation; summary: string; estimatedComplexity: "Low" | "Medium" | "High" } {
  const licensing = getLicensing(answers);
  const recommendation: Recommendation = {
    deploymentModel: getDeploymentModel(answers),
    licensingOption: licensing.option,
    licensingDetails: licensing.details,
    architecture: getArchitecture(answers),
    costConsiderations:
      "Primary cost drivers are Windows and SQL Server licensing model, OCI OCPU sizing, HA/DR topology, block volume performance tier, backup retention, and data transfer during migration. For x86 compute, one OCI OCPU maps to two hardware execution threads, so validate source vCPU-to-OCPU sizing before estimating license and compute cost. SQL Server license-included marketplace images can also carry minimum billing terms.",
    complianceNotes:
      "This tool is for Oracle internal migration planning. Validate Microsoft licensing, Software Assurance, License Mobility, and passive failover terms with the appropriate licensing specialist before giving final commercial guidance.",
    keyBenefits: [],
    nextSteps: [],
    recommendedInstances: getInstances(answers),
    marketplaceLinks: needsSql(answers) ? [`OCI Marketplace SQL Server Images: ${marketplaceBaseUrl}`] : [],
  };

  if (answers.sourcePlatform === "on-premises") {
    recommendation.keyBenefits.push("Moves Windows and SQL Server estate from data center capacity planning to OCI flexible compute and storage");
  } else {
    recommendation.keyBenefits.push(`Creates a clear migration path from ${label(answers.sourcePlatform)} to OCI with licensing review up front`);
  }

  if (answers.migrationApproach === "lift-shift") {
    recommendation.keyBenefits.push("Fastest path with minimal application change");
  } else if (answers.migrationApproach === "replatform") {
    recommendation.keyBenefits.push("Opportunity to rebuild on current Windows and SQL Server versions while preserving application behavior");
  } else {
    recommendation.keyBenefits.push("Creates a modernization path where SQL Server dependency reduction is part of the business case");
  }

  if (needsWindows(answers)) {
    recommendation.keyBenefits.push("Windows Server deployment can use standard OCI images and operational patterns");
  }
  if (needsSql(answers)) {
    recommendation.keyBenefits.push("SQL Server sizing, HA, and licensing choices are captured before architecture design");
  }

  recommendation.nextSteps = [
    "Export this assessment and attach it to the opportunity or migration planning record",
    "Collect source utilization: vCPU, memory, storage, IOPS, SQL edition, and HA topology",
    "Validate SQL Server and Windows Server licensing posture with Oracle/Microsoft licensing support",
    "Map source network, identity, backup, and monitoring dependencies before migration wave planning",
    "Create a target OCI landing zone design with subnet, security list/NSG, backup, and DR decisions",
  ];

  const summary = `Assessment Summary

Customer: ${answers.customerName}
Oracle contact: ${answers.customerEmail}
Source: ${label(answers.sourcePlatform)}
Workload: ${label(answers.workloadType)}
Instances: ${answers.numInstances}
Estimated vCPU: ${answers.totalVcpu || "Not provided"}
Estimated storage: ${answers.totalStorageTb ? `${answers.totalStorageTb} TB` : "Not provided"}

Current State:
- Running today: ${label(answers.currentlyRunning)}
- Deployment type: ${label(answers.currentDeploymentType)}
- SQL version: ${label(answers.currentVersion)}
- SQL edition: ${label(answers.currentEdition)}
- SQL licensing model: ${label(answers.currentLicensingModel)}
- Software Assurance: ${label(answers.softwareAssurance)}

Target:
- SQL target version: ${label(answers.targetVersion)}
- SQL target edition: ${label(answers.targetEdition)}
- HA/DR requirement: ${label(answers.hadrRequirements)}
- Migration approach: ${label(answers.migrationApproach)}

Recommendation:
- Deployment model: ${recommendation.deploymentModel}
- Architecture: ${recommendation.architecture}
- Licensing option: ${recommendation.licensingOption}`;

  return {
    recommendation,
    summary,
    estimatedComplexity: estimateComplexity(answers),
  };
}

export const QUESTIONS: Question[] = [
  {
    id: "customerName",
    category: "Opportunity",
    question: "Customer or project name",
    helper: "Use the customer name, internal project name, or migration wave label.",
    type: "text",
  },
  {
    id: "customerEmail",
    category: "Opportunity",
    question: "Oracle owner email",
    helper: "Use your Oracle email so the exported report has a clear internal owner.",
    type: "email",
  },
  {
    id: "sourcePlatform",
    category: "Source Environment",
    question: "Where is the workload running today?",
    type: "radio",
    options: [
      { value: "on-premises", label: "On-premises data center" },
      { value: "azure", label: "Microsoft Azure" },
      { value: "aws", label: "Amazon Web Services" },
      { value: "other", label: "Other hosting provider" },
    ],
  },
  {
    id: "workloadType",
    category: "Source Environment",
    question: "What workload are you assessing?",
    type: "radio",
    options: [
      { value: "windows-sql", label: "Windows Server with SQL Server" },
      { value: "sql-only", label: "SQL Server migration only" },
      { value: "windows-only", label: "Windows Server migration only" },
    ],
  },
  {
    id: "numInstances",
    category: "Estate Size",
    question: "How many servers or SQL Server instances are in scope?",
    type: "number",
    helper: "Use the initial migration wave count if the total estate is not known.",
  },
  {
    id: "totalVcpu",
    category: "Estate Size",
    question: "Estimated total vCPU in scope",
    type: "number",
    helper: "This can be an estimate. It helps identify when Bare Metal should be evaluated.",
  },
  {
    id: "totalStorageTb",
    category: "Estate Size",
    question: "Estimated database or server storage in TB",
    type: "number",
    helper: "Use usable storage, not raw SAN capacity.",
  },
  {
    id: "currentlyRunning",
    category: "Current State",
    question: "Is this workload already running in production?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes, production or active non-production workload" },
      { value: "no", label: "No, this is a new OCI deployment" },
    ],
  },
  {
    id: "currentDeploymentType",
    category: "Current State",
    question: "Which source deployment model best matches the workload?",
    type: "radio",
    conditional: (answers) => answers.currentlyRunning === "yes",
    getOptions: (answers) => {
      if (answers.sourcePlatform === "on-premises") {
        return [
          { value: "physical", label: "Physical servers" },
          { value: "virtualized", label: "VMware, Hyper-V, or another virtualization platform" },
        ];
      }
      return [
        { value: "iaas", label: "IaaS virtual machines" },
        { value: "paas", label: "Managed database/PaaS service" },
      ];
    },
  },
  {
    id: "currentVersion",
    category: "SQL Server",
    question: "What SQL Server version is running today?",
    type: "radio",
    conditional: (answers) => answers.currentlyRunning === "yes" && answers.workloadType !== "windows-only",
    options: [
      { value: "sql-2022", label: "SQL Server 2022" },
      { value: "sql-2019", label: "SQL Server 2019" },
      { value: "sql-2016-or-older", label: "SQL Server 2016 or older" },
      { value: "unknown", label: "Unknown or mixed versions" },
    ],
  },
  {
    id: "currentEdition",
    category: "SQL Server",
    question: "What SQL Server edition is in scope?",
    type: "radio",
    conditional: (answers) => answers.workloadType !== "windows-only",
    options: [
      { value: "enterprise", label: "Enterprise Edition" },
      { value: "standard", label: "Standard Edition" },
      { value: "developer", label: "Developer Edition or non-production only" },
      { value: "unknown", label: "Unknown or mixed editions" },
    ],
  },
  {
    id: "currentLicensingModel",
    category: "Licensing",
    question: "What SQL Server licensing model is used today?",
    type: "radio",
    conditional: (answers) => answers.workloadType !== "windows-only",
    options: [
      { value: "per-core", label: "Per Core licenses" },
      { value: "server-cal", label: "Server + CAL licenses" },
      { value: "license-included", label: "License included by Azure, AWS, or another provider" },
      { value: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "licensePurchaseDate",
    category: "Licensing",
    question: "When were the SQL Server licenses purchased?",
    type: "radio",
    conditional: (answers) => answers.workloadType !== "windows-only" && answers.currentLicensingModel !== "license-included",
    options: [
      { value: "before-oct-2019", label: "Before October 1, 2019" },
      { value: "after-oct-2019", label: "On or after October 1, 2019" },
      { value: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "softwareAssurance",
    category: "Licensing",
    question: "Do the SQL Server licenses have active Software Assurance?",
    type: "radio",
    conditional: (answers) => answers.workloadType !== "windows-only" && answers.currentLicensingModel !== "license-included",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "windowsLicensing",
    category: "Licensing",
    question: "How should Windows Server licensing be handled on OCI?",
    type: "radio",
    conditional: (answers) => answers.workloadType !== "sql-only",
    options: [
      { value: "oci-included", label: "Use OCI Windows Server license-included images" },
      { value: "byol", label: "Customer wants to bring Windows Server licenses" },
      { value: "unknown", label: "Unknown, validate during planning" },
    ],
  },
  {
    id: "targetVersion",
    category: "OCI Target",
    question: "What SQL Server target version should OCI use?",
    type: "radio",
    conditional: (answers) => answers.workloadType !== "windows-only",
    options: [
      { value: "sql-2022", label: "SQL Server 2022" },
      { value: "sql-2019", label: "SQL Server 2019" },
      { value: "unknown", label: "Decide after compatibility review" },
    ],
  },
  {
    id: "targetEdition",
    category: "OCI Target",
    question: "What SQL Server target edition is expected on OCI?",
    type: "radio",
    conditional: (answers) => answers.workloadType !== "windows-only",
    options: [
      { value: "enterprise", label: "Enterprise Edition" },
      { value: "standard", label: "Standard Edition" },
      { value: "developer", label: "Developer Edition or non-production only" },
      { value: "unknown", label: "Decide after sizing/licensing review" },
    ],
  },
  {
    id: "hadrRequirements",
    category: "OCI Target",
    question: "What availability target does the customer need?",
    type: "radio",
    options: [
      { value: "none", label: "Single instance with backup and restore" },
      { value: "high-availability", label: "High availability within one OCI region" },
      { value: "disaster-recovery", label: "Cross-region disaster recovery" },
    ],
  },
  {
    id: "migrationApproach",
    category: "Migration Path",
    question: "Which migration motion best fits this opportunity?",
    type: "radio",
    getOptions: (answers) => {
      const options = [
        { value: "lift-shift", label: "Lift and shift existing Windows or SQL Server workloads" },
        { value: "replatform", label: "Re-platform onto new OCI Windows and SQL Server builds" },
      ];
      if (answers.workloadType !== "windows-only") {
        options.push({ value: "modernize", label: "Modernize database tier to Oracle Database, PostgreSQL, or MySQL HeatWave" });
      }
      return options;
    },
  },
];
