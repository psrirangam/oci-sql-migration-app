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
- Request custom SQL Server image from Cognosys Inc.
- Pre-configured with your SQL Server version
- Bring your own licenses
- Faster than manual installation
- Best for: Standardized deployments with BYOL

**Cost Comparison:**
- License Included: ~40-50% premium, includes support
- BYOL with New Licenses: Lower compute costs but requires new license purchase (~$2,000-5,000 per 2-core pack)

**Recommendation:**
For new deployments without existing licenses, License Included is recommended for simplicity and support.`;
    recommendation.keyBenefits.push("License Included: Simplified licensing, includes support");
    recommendation.keyBenefits.push("BYOL: Cost-effective if purchasing new licenses");
    recommendation.keyBenefits.push("OCI Marketplace provides pre-configured images");
    recommendation.keyBenefits.push("Flexible deployment options for both models");
    recommendation.costConsiderations = "License Included: ~40-50% premium, includes support. BYOL: Lower compute costs but requires new license purchase (~$2,000-5,000 per 2-core pack).";
    recommendation.complianceNotes = "License Included includes Microsoft support and simplified compliance. BYOL requires proper license documentation and verification.";
    recommendation.nextSteps.push("Review OCI Marketplace SQL Server offerings for License Included option");
    recommendation.nextSteps.push("If choosing BYOL: Contact Microsoft Accelerator @ OCI: Pavan.srirangam@oracle.com for new license pricing and optimization");
    recommendation.nextSteps.push("Compare License Included vs BYOL costs for your workload");
  } else if (isGrandfathered) {
    // Existing grandfathered licenses (purchased before Oct 1, 2019)
    recommendation.licensingOption = "BYOL with Grandfathered Licenses";
    recommendation.licensingDetails = `Your SQL Server licenses purchased before October 1, 2019 are grandfathered and can be used on OCI for existing workloads:

**Deployment Options:**

**Path 1: BYOL + Windows Server (Manual SQL Installation)**
- Deploy base Windows Server VM (BYOL)
- Install existing SQL Server with your grandfathered licenses
- Full control over configuration
- Best for: Preserving existing configurations

**Path 2: BYOL + Custom Image (Cognosys)**
- Request custom SQL Server image from Cognosys Inc.
- Pre-configured with your SQL Server version
- Use your grandfathered licenses
- Faster deployment than manual installation
- Best for: Standardized deployments

**Path 3: Migrate Existing Instances**
- Migrate your existing SQL Server instances to OCI
- Keep existing configurations and data
- Use OCI Database Migration Service
- Best for: Preserving complex configurations

**Cost Advantage:**
You only pay for OCI compute infrastructure. No additional SQL Server licensing costs for existing workloads.

**Limitations:**
- Cannot add new workloads with this license
- Cannot upgrade to new SQL Server versions
- Consider purchasing Software Assurance for flexibility`;
    recommendation.keyBenefits.push("Use existing grandfathered licenses on OCI");
    recommendation.keyBenefits.push("License Mobility available without restrictions");
    recommendation.keyBenefits.push("Lowest cost for existing workloads");
    recommendation.costConsiderations = "Lowest cost: only OCI compute charges. Estimated 30-50% savings vs License Included. Limited to existing workloads only.";
    recommendation.complianceNotes = "Grandfathered licenses can be used on OCI for existing workloads only. Cannot add new workloads or upgrade versions without Software Assurance.";
    recommendation.nextSteps.push("Contact Microsoft Accelerator @ OCI: Pavan.srirangam@oracle.com for license verification and migration planning");
    recommendation.nextSteps.push("Choose deployment path: Manual installation, custom image, or migration");
    recommendation.nextSteps.push("Consider purchasing Software Assurance for future flexibility");
  } else if (!isGrandfathered && hasSA) {
    // New license with SA
    recommendation.licensingOption = "License Included (OCI Marketplace) or BYOL with New Licenses";
    recommendation.licensingDetails = `You have active Software Assurance but no grandfathered licenses. You have two options:

**Option 1: License Included (Recommended for Simplicity)**
- Use pre-built SQL Server images from OCI Marketplace
- Licensing included in hourly rate
- Includes Microsoft support and updates
- Fastest deployment path
- Simplified compliance
- Best for: Quick deployment, no license procurement needed

**Option 2: BYOL with New Licenses (Cost Optimization)**
If you're purchasing new SQL Server licenses with Software Assurance:

**Path 1: BYOL + Windows Server (Manual SQL Installation)**
- Deploy base Windows Server VM (BYOL)
- Manually install SQL Server with your new licenses
- Full control over configuration
- Requires more setup time
- Best for: Custom configurations with specific requirements

**Path 2: BYOL + Custom Image (Cognosys)**
- Request custom SQL Server image from Cognosys Inc.
- Pre-configured with your SQL Server version
- Bring your own licenses
- Faster than manual installation
- Best for: Standardized deployments with BYOL

**Cost Comparison:**
- License Included: Higher per-hour cost (~40-50% premium), includes support
- BYOL with New Licenses: Lower compute costs but requires license purchase

**Recommendation:**
For new deployments with Software Assurance, License Included is often simpler. For long-term deployments (3+ years), BYOL with new licenses may provide better ROI.`;
    recommendation.keyBenefits.push("License Included: Simplified licensing, includes support");
    recommendation.keyBenefits.push("BYOL: Cost-effective for long-term deployments");
    recommendation.keyBenefits.push("Software Assurance provides flexibility");
    recommendation.costConsiderations = "License Included: ~40-50% premium, includes support. BYOL: Lower compute costs but requires license purchase (~$2,000-5,000 per 2-core pack).";
    recommendation.complianceNotes = "License Included includes Microsoft support. BYOL requires proper license documentation and verification.";
    recommendation.nextSteps.push("Review OCI Marketplace SQL Server offerings for License Included option");
    recommendation.nextSteps.push("Contact Microsoft Accelerator @ OCI: Pavan.srirangam@oracle.com for licensing strategy and cost optimization");
    recommendation.nextSteps.push("Compare License Included vs BYOL costs for your workload");
  } else {
    // No grandfathered license, no SA - recommend License Included or BYOL with new licenses
    recommendation.licensingOption = "License Included (OCI Marketplace) or BYOL with New Licenses";
    recommendation.licensingDetails = `For new workloads or if you don't have grandfathered licenses, you have two main options:

**Option 1: License Included (Recommended for Simplicity)**
- Use pre-built SQL Server images from OCI Marketplace
- Licensing included in hourly rate
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
- Request custom SQL Server image from Cognosys Inc.
- Pre-configured with your SQL Server version
- Bring your own licenses
- Faster than manual installation
- Best for: Standardized deployments with BYOL

**Special Consideration for PaaS Migrations:**
If you're migrating from PaaS (Azure SQL Database, AWS RDS, Google Cloud SQL):
- **License Included**: Simplest path, includes support, no license procurement
- **BYOL with New Licenses**: Contact our licensing partner for cost-optimized licensing strategy

**Cost Comparison:**
- License Included: ~40-50% premium, includes support
- BYOL with New Licenses: Lower compute costs but requires new license purchase (~$2,000-5,000 per 2-core pack)

**Recommendation:**
For new deployments without existing licenses, License Included is recommended for simplicity and support.`;
    recommendation.keyBenefits.push("License Included: Simplified licensing, includes support");
    recommendation.keyBenefits.push("BYOL: Cost-effective if purchasing new licenses");
    recommendation.keyBenefits.push("OCI Marketplace provides pre-configured images");
    recommendation.keyBenefits.push("Flexible deployment options for both models");
    recommendation.costConsiderations = "License Included: ~40-50% premium, includes support. BYOL: Lower compute costs but requires new license purchase (~$2,000-5,000 per 2-core pack).";
    recommendation.complianceNotes = "License Included includes Microsoft support and simplified compliance. BYOL requires proper license documentation and verification.";
    recommendation.nextSteps.push("Review OCI Marketplace SQL Server offerings for License Included option");
    recommendation.nextSteps.push("If choosing BYOL: Contact Microsoft Accelerator @ OCI: Pavan.srirangam@oracle.com for new license pricing and optimization");
    recommendation.nextSteps.push("Compare License Included vs BYOL costs for your workload");
  }

  // Add OCI Marketplace links
  recommendation.marketplaceLinks = [
    `${marketplaceBaseUrl} - Browse all SQL Server offerings`,
    `${marketplaceBaseUrl}&version=${answers.targetVersion}&edition=${answers.targetEdition} - Filtered for your selection`,
  ];

  // Add migration approach specific next steps
  if (answers.migrationApproach === "lift-shift") {
    recommendation.nextSteps.push("Use OCI Database Migration Service for lift-and-shift");
    recommendation.nextSteps.push("Minimal application changes required");
  } else if (answers.migrationApproach === "replatform") {
    recommendation.nextSteps.push("Optimize for OCI VM shapes and storage");
    recommendation.nextSteps.push("Consider managed database services for specific workloads");
  } else {
    recommendation.nextSteps.push("Plan application refactoring for cloud-native architecture");
    recommendation.nextSteps.push("Consider containerization or microservices");
  }

  // Add general next steps
  recommendation.nextSteps.push("Review recommended OCI instance types and sizing");
  recommendation.nextSteps.push("Review OCI Marketplace SQL Server images");
  recommendation.nextSteps.push("Estimate costs using OCI Cost Estimator");
  recommendation.nextSteps.push("Schedule OCI architecture review");

  const summary = generateSummary(answers, recommendation);
  return {
    recommendation,
    summary,
    estimatedComplexity: answers.hadrRequirements === "disaster-recovery" ? "High" : "Medium",
  };
}

export function generateSummary(answers: AssessmentAnswers, recommendation: Recommendation): string {
  const currentVersion = answers.currentlyRunning === "yes" ? (answers.currentVersion || "Unknown") : "New Deployment";
  const currentEdition = answers.currentlyRunning === "yes" ? answers.currentEdition : "N/A";
  const targetVersion = answers.targetVersion || "Unknown";
  const targetEdition = answers.targetEdition ? answers.targetEdition.charAt(0).toUpperCase() + answers.targetEdition.slice(1) : "Unknown";
  const hadrLabel = answers.hadrRequirements === "no-hadr" ? "No HA/DR" : (answers.hadrRequirements || "standard").replace(/-/g, " ").toUpperCase();
  const migrationLabel = answers.migrationApproach === "lift-shift" ? "Lift and Shift" : answers.migrationApproach === "replatform" ? "Re-platform" : "Re-factor";
  
  const summary = `
## OCI SQL Server Migration Assessment Report

**Customer/Company Name:** ${answers.customerName || "Not provided"}
**Number of SQL Server Instances to Migrate:** ${answers.numInstances || "Not specified"}

---

### Current State Assessment

| **Aspect** | **Details** |
|--------|----------|
| **Customer/Company** | ${answers.customerName || "Not provided"} |
| **Current Version** | ${currentVersion} ${currentEdition} Edition |
| **Current Deployment** | ${answers.currentDeployment || "Unknown"} |
| **Deployment Type** | ${answers.currentDeploymentType === "paas" ? "PaaS (Managed Service)" : "IaaS (Virtual Machines)"} |
| **License Purchase Date** | ${answers.licensePurchaseDate === "before-oct-2019" ? "Before October 1, 2019 (Grandfathered)" : answers.licensePurchaseDate === "after-oct-2019" ? "On or after October 1, 2019" : "Unknown"} |
| **Current Licensing Model** | ${answers.currentLicensingModel === "per-core" ? "Per Core" : "Server + CAL"} |
| **Software Assurance** | ${answers.softwareAssurance === "yes" ? "Active" : "Not Active"} |

---

### Target Deployment Plan

| Aspect | Details |
|--------|---------|
| **Target Version** | ${targetVersion} |
| **Target Edition** | ${targetEdition} Edition |
| **Deployment Model** | ${recommendation.deploymentModel} |
| **Licensing Option** | ${recommendation.licensingOption} |
| **Architecture** | ${recommendation.architecture} |
| **HA/DR Strategy** | ${hadrLabel} |
| **Migration Approach** | ${migrationLabel} |

---

### Recommended OCI Instance Types

${recommendation.recommendedInstances?.map(instance => `- ${instance}`).join('\n')}

**Instance Type Guidance:**
- **VM.Standard.E5.Flex**: General-purpose workloads, balanced performance (1 GB memory per vCPU)
- **VM.Optimized.E5.Flex**: Memory-intensive workloads, critical applications (2-4 GB memory per vCPU)
- **BM.Standard.E5/E6**: Maximum performance, mission-critical workloads (Bare Metal, 96-128 cores)
- **Extended Memory**: Very large databases (8-16 GB memory per vCPU)

---

### OCI Recommendation

**Licensing Strategy:** ${recommendation.licensingOption}

${recommendation.licensingDetails}

**Key Benefits:**
${recommendation.keyBenefits.map(benefit => `- ${benefit}`).join('\n')}

**Cost Considerations:**
${recommendation.costConsiderations}

**Compliance Notes:**
${recommendation.complianceNotes}

---

### OCI Marketplace SQL Server Images

Access the OCI Marketplace to explore available SQL Server images:

${recommendation.marketplaceLinks?.map(link => `- ${link}`).join('\n')}

**Note:** OCI Marketplace images include SQL Server licensing (License Included model). For BYOL deployments, deploy base Windows Server and manually install SQL Server, or request custom image from Cognosys Inc.

---

### Next Steps

${recommendation.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

---

### Assessment Details

- **Assessment Date:** ${new Date().toLocaleDateString()}
- **Assessor Email:** ${answers.customerEmail || "Not provided"}
- **Estimated Complexity:** High
- **Basis:** SQL Server 2022 Licensing Guide (October 1, 2019 changes)
`;

  return summary;
}

export const QUESTIONS = [
  // Customer Information Section
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
      { value: "on-premises", label: "On-Premises (Data Center)" },
      { value: "aws", label: "Amazon Web Services (AWS)" },
      { value: "azure", label: "Microsoft Azure" },
      { value: "gcp", label: "Google Cloud Platform" },
      { value: "other-cloud", label: "Other Cloud Provider" },
    ],
  },
  {
    id: "currentDeploymentType",
    category: "Current State",
    question: "Is your current SQL Server deployment PaaS (Managed Service) or IaaS (Virtual Machines)?",
    type: "radio",
    conditional: { field: "currentDeployment", operator: "in", values: ["aws", "azure", "gcp", "other-cloud"] },
    options: [
      { value: "paas", label: "PaaS (Managed Service like Azure SQL Database, AWS RDS)" },
      { value: "iaas", label: "IaaS (Virtual Machines like EC2, Azure VMs)" },
    ],
  },
  {
    id: "licensePurchaseDate",
    category: "Current State",
    question: "When were your SQL Server licenses purchased?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "before-oct-2019", label: "Before October 1, 2019 (Grandfathered Licenses)" },
      { value: "after-oct-2019", label: "On or after October 1, 2019" },
    ],
  },
  {
    id: "currentLicensingModel",
    category: "Current State",
    question: "What is your current SQL Server licensing model?",
    type: "radio",
    conditional: { field: "currentlyRunning", value: "yes" },
    options: [
      { value: "per-core", label: "Per Core Licensing" },
      { value: "server-cal", label: "Server + CAL Licensing" },
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
      { value: "no", label: "No, we don't have Software Assurance" },
    ],
  },

  // Target State Section
  {
    id: "targetVersion",
    category: "Target Deployment",
    question: "What version of SQL Server do you want on OCI?",
    type: "radio",
    options: [
      { value: "2019", label: "SQL Server 2019" },
      { value: "2022", label: "SQL Server 2022" },
    ],
  },
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
      { value: "no-hadr", label: "No HA/DR needed (Development/Testing)" },
      { value: "high-availability", label: "High Availability (Multi-AD, RTO < 15 min)" },
      { value: "disaster-recovery", label: "Disaster Recovery (Multi-Region, RTO < 1 hour)" },
    ],
  },
  {
    id: "migrationApproach",
    category: "Target Deployment",
    question: "What is your preferred migration approach?",
    type: "radio",
    options: [
      { value: "lift-shift", label: "Lift and Shift (Minimal changes)" },
      { value: "replatform", label: "Re-platform (Optimize for cloud)" },
      { value: "refactor", label: "Re-factor (Modernize architecture)" },
    ],
  },
];
