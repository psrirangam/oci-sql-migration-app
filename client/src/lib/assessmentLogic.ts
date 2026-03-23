export interface AssessmentAnswers {
  customerName: string;
  customerEmail: string;
  numInstances: string;
  currentlyRunning: "yes" | "no";
  currentVersion?: string;
  currentEdition?: string;
  currentDeployment?: string;
  currentDeploymentType?: "paas" | "iaas";
  licensePurchaseDate?: "before-oct-2019" | "after-oct-2019";
  currentLicensingModel?: "per-core" | "server-cal";
  softwareAssurance?: "yes" | "no";
  targetVersion?: string;
  targetEdition?: string;
  hadrRequirements?: string;
  migrationApproach?: string;
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

const marketplaceBaseUrl = "https://marketplace.oracle.com/listings?query=SQL+server";

export function generateRecommendation(answers: AssessmentAnswers): { recommendation: Recommendation; summary: string; estimatedComplexity: string } {
  const recommendation: Recommendation = {
    deploymentModel: "OCI Compute (IaaS)",
    licensingOption: "",
    licensingDetails: "",
    architecture: "",
    costConsiderations: "",
    complianceNotes: "",
    keyBenefits: [],
    nextSteps: [],
  };

  // Determine if licenses are grandfathered (purchased before Oct 1, 2019)
  const isGrandfathered = answers.licensePurchaseDate === "before-oct-2019";
  const hasSA = answers.softwareAssurance === "yes";

  // Set deployment model and architecture
  if (answers.hadrRequirements === "disaster-recovery") {
    recommendation.deploymentModel = "OCI Compute with Multi-Region Deployment";
    recommendation.architecture = "Active-Passive with cross-region failover using Always On Availability Groups";
  } else if (answers.hadrRequirements === "high-availability") {
    recommendation.deploymentModel = "OCI Compute with Multi-AD Deployment";
    recommendation.architecture = "Active-Active with Always On Availability Groups across availability domains";
  } else {
    recommendation.deploymentModel = "OCI Compute (Single or Multi-AD)";
    recommendation.architecture = "Standard deployment with optional backup/recovery";
  }

  // Recommended instance types based on edition
  const recommendedInstances: string[] = [];
  if (answers.targetEdition === "enterprise") {
    recommendedInstances.push("VM.Optimized.E5.Flex (2-4 GB memory per vCPU) - For critical workloads");
    recommendedInstances.push("BM.Standard.E5 or BM.Standard.E6 (Bare Metal) - For maximum performance");
  } else if (answers.targetEdition === "standard") {
    recommendedInstances.push("VM.Standard.E5.Flex (1 GB memory per vCPU) - For general-purpose workloads");
    recommendedInstances.push("VM.Optimized.E5.Flex (2 GB memory per vCPU) - For memory-intensive workloads");
  } else {
    recommendedInstances.push("VM.Standard.E5.Flex (1 GB memory per vCPU) - For development/testing");
  }
  recommendation.recommendedInstances = recommendedInstances;

  // Licensing logic based on current state
  if (answers.currentlyRunning === "no") {
    // New deployment - no existing licenses
    recommendation.licensingOption = "License Included (OCI Marketplace) or BYOL with New Licenses";
    recommendation.licensingDetails = `For new workloads without existing SQL Server licenses, you have two main options:

**Option 1: License Included (Recommended for Simplicity)**
- Use pre-built SQL Server images from OCI Marketplace
- SQL Server licensing included in hourly rate
- Includes Microsoft support and updates
- Fastest deployment path
- Simplified compliance
- No license procurement needed
- Best for: Quick deployment, standard configurations

**Option 2: BYOL with New Licenses (If Purchasing New Licenses)**
If you're purchasing new SQL Server licenses:

**Path 1: BYOL + Windows Server (Manual SQL Installation)**
- Deploy base Windows Server VM (BYOL)
- Manually install SQL Server with your new licenses
- Full control over configuration
- Requires more setup time
- Best for: Custom configurations with specific requirements

**Path 2: BYOL + Custom Image (Cognosys)**
- Use Cognosys pre-built SQL Server images with your BYOL licenses
- Faster than manual installation
- Pre-configured and tested
- Best for: Faster deployment with BYOL

**Next Steps:** Contact Microsoft Accelerator @ OCI (Pavan.srirangam@oracle.com) for new license pricing and licensing optimization.`;
  } else if (answers.currentlyRunning === "yes") {
    // Existing deployment
    if (isGrandfathered && hasSA) {
      recommendation.licensingOption = "BYOL with Existing Licenses (Grandfathered)";
      recommendation.licensingDetails = `Your SQL Server licenses purchased before October 1, 2019 are grandfathered and can be used on OCI.

**Recommended Path: BYOL + Bring Existing Licenses**
- Leverage your current SQL Server licenses on OCI
- Bring your existing SQL Server images or build new ones
- Full license mobility rights
- No additional licensing costs
- Compliance with Microsoft licensing terms

**Deployment Options:**

**Option 1: Bring Existing SQL Server Images**
- Migrate your current SQL Server instances to OCI VMs
- Minimal reconfiguration needed
- Fastest migration path
- Maintains current configuration

**Option 2: Build New SQL Server on OCI VMs**
- Deploy Windows Server (BYOL) on OCI
- Install SQL Server with your existing licenses
- Opportunity to optimize for cloud
- Better performance potential

**Next Steps:** Contact Microsoft Accelerator @ OCI (Pavan.srirangam@oracle.com) to validate your license grandfathering status and optimize your migration approach.`;
    } else if (isGrandfathered && !hasSA) {
      recommendation.licensingOption = "BYOL with Existing Licenses (Limited Mobility)";
      recommendation.licensingDetails = `Your SQL Server licenses are grandfathered but without Software Assurance, mobility rights are limited.

**Recommended Path: BYOL with Existing Licenses**
- Use your current SQL Server licenses on OCI
- Requires validation of license mobility eligibility
- Bring existing SQL Server images or build new ones

**Deployment Options:**

**Option 1: Bring Existing SQL Server Images**
- Migrate current instances to OCI VMs
- Minimal reconfiguration
- Fastest deployment

**Option 2: Build New SQL Server on OCI VMs**
- Deploy Windows Server (BYOL) on OCI
- Install SQL Server with your licenses
- Optimize for cloud deployment

**Important:** Without Software Assurance, license mobility may be restricted. Verify your specific licensing terms.

**Next Steps:** Contact Microsoft Accelerator @ OCI (Pavan.srirangam@oracle.com) to validate your license mobility rights and determine the best deployment approach.`;
    } else {
      recommendation.licensingOption = "License Included (Recommended) or Purchase New BYOL Licenses";
      recommendation.licensingDetails = `Your current SQL Server licenses do not qualify for grandfathering or BYOL on OCI. You have two options:

**Option 1: License Included (Recommended)**
- Use pre-built SQL Server images from OCI Marketplace
- SQL Server licensing included in hourly rate
- No additional license procurement needed
- Simplified compliance and support
- Best for: Cost-effective, simplified licensing

**Option 2: Purchase New BYOL Licenses**
If you prefer to purchase new licenses:

**Path 1: BYOL + Windows Server (Manual Installation)**
- Deploy Windows Server VM (BYOL)
- Manually install SQL Server with new licenses
- Full control over configuration
- Requires more setup time

**Path 2: BYOL + Custom Image (Cognosys)**
- Use pre-built SQL Server images with new BYOL licenses
- Faster deployment than manual installation
- Pre-configured and tested

**Next Steps:** Contact Microsoft Accelerator @ OCI (Pavan.srirangam@oracle.com) for new license pricing and to determine the most cost-effective licensing approach for your migration.`;
    }
  }

  // Migration approach recommendations
  const migrationLabel = answers.migrationApproach === "lift-shift" ? "Lift and Shift" : answers.migrationApproach === "replatform" ? "Re-platform" : "Re-factor";
  
  if (answers.migrationApproach === "lift-shift") {
    recommendation.keyBenefits.push("Minimal application changes required");
    recommendation.keyBenefits.push("Fastest time to production");
    recommendation.keyBenefits.push("Lower risk migration approach");
  } else if (answers.migrationApproach === "replatform") {
    recommendation.keyBenefits.push("Optimized for cloud deployment");
    recommendation.keyBenefits.push("Better performance and scalability");
    recommendation.keyBenefits.push("Reduced operational overhead");
  } else if (answers.migrationApproach === "refactor") {
    recommendation.keyBenefits.push("Modernize to Oracle databases");
    recommendation.keyBenefits.push("Better long-term cost optimization");
    recommendation.keyBenefits.push("Access to Oracle ecosystem benefits");
  }

  recommendation.costConsiderations = `**Cost Factors:**
- Compute instance sizing and type
- SQL Server licensing model (License Included vs BYOL)
- Storage requirements
- Data transfer costs
- Backup and disaster recovery infrastructure
- High availability and multi-region deployment costs`;

  recommendation.complianceNotes = `**Compliance & Support:**
- OCI provides enterprise-grade security and compliance certifications
- Microsoft Accelerator @ OCI team provides licensing validation
- Full audit trail and compliance reporting available
- Contact: Pavan.srirangam@oracle.com for licensing questions`;

  recommendation.nextSteps = [
    "Validate current SQL Server licenses with Microsoft Accelerator @ OCI",
    "Determine optimal instance types for your workload",
    "Plan migration timeline and approach",
    "Configure backup and disaster recovery strategy",
    "Prepare for deployment on OCI",
  ];

  recommendation.marketplaceLinks = [
    `OCI Marketplace SQL Server Images: ${marketplaceBaseUrl}`,
  ];

  const summary = `**Assessment Summary**

**Customer:** ${answers.customerName}
**Email:** ${answers.customerEmail}
**Instances to Migrate:** ${answers.numInstances}

**Current State:**
- Running SQL Server: ${answers.currentlyRunning === "yes" ? "Yes" : "No"}
${answers.currentlyRunning === "yes" ? `- Version: ${answers.currentVersion}` : ""}
${answers.currentlyRunning === "yes" ? `- Edition: ${answers.currentEdition}` : ""}
${answers.currentlyRunning === "yes" ? `- Deployment: ${answers.currentDeployment}` : ""}
${answers.currentlyRunning === "yes" && answers.currentDeploymentType ? `- Deployment Type: ${answers.currentDeploymentType === "paas" ? "PaaS" : "IaaS"}` : ""}

**Target Deployment:**
- Target Edition: ${answers.targetEdition}
- Migration Approach: ${migrationLabel}
- HA/DR Requirements: ${answers.hadrRequirements}

**Recommended Deployment Model:** ${recommendation.deploymentModel}
**Recommended Architecture:** ${recommendation.architecture}
**Licensing Option:** ${recommendation.licensingOption}

**Recommended Instance Types:**
${recommendation.recommendedInstances?.map((instance) => `- ${instance}`).join("\n")}

**Key Benefits:**
${recommendation.keyBenefits.map((benefit) => `- ${benefit}`).join("\n")}

**Next Steps:**
${recommendation.nextSteps.map((step) => `- ${step}`).join("\n")}`;

  const estimatedComplexity =
    answers.hadrRequirements === "disaster-recovery"
      ? "High"
      : answers.hadrRequirements === "high-availability"
        ? "Medium-High"
        : "Medium";

  return {
    recommendation,
    summary,
    estimatedComplexity,
  };
}

export interface Question {
  id: string;
  category: string;
  question: string;
  type: "radio" | "text" | "email" | "number";
  options?: Array<{ value: string; label: string }>;
  getOptions?: (answers: AssessmentAnswers) => Array<{ value: string; label: string }>;
  conditional?: { field: keyof AssessmentAnswers; value: string };
}

export const QUESTIONS: Question[] = [
  {
    id: "customerName",
    category: "Customer Information",
    question: "What's the customer name looking to migrate SQL server to OCI?",
    type: "text",
    options: [],
  },
  {
    id: "customerEmail",
    category: "Customer Information",
    question: "What is your email address? (We will use this to reach back with recommendations)",
    type: "email",
    options: [],
  },
  {
    id: "numInstances",
    category: "Customer Information",
    question: "How many SQL Server instances are you planning to migrate to OCI?",
    type: "number",
    options: [],
  },

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
      { value: "developer", label: "Developer Edition" },
    ],
  },
  {
    id: "currentDeployment",
    category: "Current State",
    question: "Where is SQL Server currently deployed?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "on-premises", label: "On-Premises (Data Center)" },
      { value: "aws", label: "Amazon Web Services (AWS)" },
      { value: "azure", label: "Microsoft Azure" },
      { value: "gcp", label: "Google Cloud Platform (GCP)" },
      { value: "other", label: "Other Cloud Provider" },
    ],
  },
  {
    id: "currentDeploymentType",
    category: "Current State",
    question: "Is your current SQL Server deployment PaaS or IaaS?",
    type: "radio",
    conditional: { field: "currentDeployment", value: "cloud" },
    options: [
      { value: "paas", label: "PaaS (Azure SQL Database, AWS RDS, etc.)" },
      { value: "iaas", label: "IaaS (EC2, Virtual Machines, etc.)" },
    ],
  },
  {
    id: "licensePurchaseDate",
    category: "Current State",
    question: "When were your SQL Server licenses purchased?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "before-oct-2019", label: "Before October 1, 2019 (Grandfathered)" },
      { value: "after-oct-2019", label: "After October 1, 2019 (No grandfathering)" },
    ],
  },
  {
    id: "softwareAssurance",
    category: "Current State",
    question: "Do you have Software Assurance (SA) on your SQL Server licenses?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "yes", label: "Yes, we have Software Assurance" },
      { value: "no", label: "No, we do not have Software Assurance" },
    ],
  },

  // Target Deployment Section
  {
    id: "targetEdition",
    category: "Target Deployment",
    question: "What edition of SQL Server do you want on OCI?",
    type: "radio",
    options: [
      { value: "enterprise", label: "Enterprise Edition" },
      { value: "standard", label: "Standard Edition" },
      { value: "developer", label: "Developer Edition" },
    ],
  },
  {
    id: "hadrRequirements",
    category: "Target Deployment",
    question: "What are your High Availability and Disaster Recovery requirements?",
    type: "radio",
    options: [
      { value: "none", label: "None - Single instance is acceptable" },
      { value: "high-availability", label: "High Availability (HA) - Minimize downtime within region" },
      { value: "disaster-recovery", label: "Disaster Recovery (DR) - Multi-region failover capability" },
    ],
  },
  {
    id: "migrationApproach",
    category: "Target Deployment",
    question: "What is your preferred migration approach?",
    type: "radio",
    getOptions: (answers: AssessmentAnswers) => {
      const options = [
        { value: "lift-shift", label: "Lift and Shift (Minimal changes to SQL Server)" },
      ];

      // Only show Re-platform if currently on PaaS
      if (answers.currentDeploymentType === "paas") {
        options.push({ value: "replatform", label: "Re-platform (Optimize for OCI cloud)" });
      }

      // Always show Re-factor for Oracle databases
      options.push({ value: "refactor", label: "Re-factor (Migrate to Oracle ATP, PostgreSQL, or MySQL Heatwave)" });

      return options;
    },
  },
];
