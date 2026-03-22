// OCI SQL Server Migration Assessment Logic
// Based on SQL Server 2022 Licensing Guide and October 1, 2019 Licensing Changes
// Note: OCI only supports IaaS deployments (BYOL or License Included from Marketplace)

export interface AssessmentAnswers {
  // Customer Information
  customerName?: string;
  customerEmail?: string;
  numInstances?: number;
  
  // Current State
  currentlyRunning: string;
  currentVersion?: string;
  currentEdition?: string;
  currentDeployment?: string;
  currentDeploymentType?: string; // PaaS or IaaS for cloud deployments
  licensePurchaseDate?: string;
  currentLicensingModel?: string;
  softwareAssurance?: string;
  
  // Target State
  targetVersion: string;
  targetEdition?: string;
  
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
  marketplaceLinks?: string[];
  recommendedInstances?: string[];
}

export interface AssessmentResult {
  recommendation: Recommendation;
  summary: string;
  estimatedComplexity: "Low" | "Medium" | "High";
}

function getRecommendedInstances(edition: string, hadrRequirements: string): string[] {
  const instances: string[] = [];

  if (edition === "enterprise") {
    if (hadrRequirements === "disaster-recovery") {
      instances.push("Primary: BM.Standard.E5 or BM.Standard.E6 (96-128 cores, maximum performance)");
      instances.push("DR: VM.Optimized.E5.Flex (32-64 vCPU, cost-optimized)");
    } else if (hadrRequirements === "advanced-ha") {
      instances.push("VM.Optimized.E5.Flex (32-64 vCPU, memory-optimized for HA)");
      instances.push("Alternative: BM.Standard.E5 (96 cores, if maximum performance needed)");
    } else if (hadrRequirements === "basic-ha") {
      instances.push("VM.Optimized.E5.Flex (16-32 vCPU, memory-optimized)");
      instances.push("Alternative: VM.Standard.E5.Flex (16-32 vCPU, if cost is priority)");
    } else {
      instances.push("VM.Optimized.E5.Flex (16-32 vCPU, memory-optimized for critical workloads)");
      instances.push("Alternative: VM.Standard.E5.Flex (16-32 vCPU, for general workloads)");
    }
  } else if (edition === "standard") {
    if (hadrRequirements === "disaster-recovery") {
      instances.push("VM.Optimized.E5.Flex (16-24 vCPU, max 24 cores for Standard)");
      instances.push("DR: VM.Standard.E5.Flex (8-12 vCPU, cost-optimized)");
    } else if (hadrRequirements === "advanced-ha") {
      instances.push("VM.Optimized.E5.Flex (16-24 vCPU, memory-optimized)");
    } else if (hadrRequirements === "basic-ha") {
      instances.push("VM.Standard.E5.Flex (16-24 vCPU, balanced performance)");
    } else {
      instances.push("VM.Standard.E5.Flex (16-24 vCPU, general purpose)");
      instances.push("Alternative: VM.Optimized.E5.Flex (16-24 vCPU, if memory-intensive)");
    }
  } else if (edition === "web") {
    instances.push("VM.Standard.E5.Flex (8-16 vCPU, cost-effective)");
  } else {
    instances.push("VM.Standard.E5.Flex (4-8 vCPU, Express/Dev)");
  }

  return instances;
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
    marketplaceLinks: [],
    recommendedInstances: [],
  };

  // Determine if customer is upgrading or staying on same version
  const isUpgrading = answers.currentVersion !== answers.targetVersion;
  const isNewVersion = answers.targetVersion === "2022";
  
  // OCI is not a Listed Provider, so License Mobility is always available
  const marketplaceBaseUrl = "https://marketplace.oracle.com/listings?query=SQL+server";
  
  // Check if license was purchased before October 1, 2019 (grandfathered)
  const isGrandfathered = answers.licensePurchaseDate === "before-oct-2019";
  const hasSA = answers.softwareAssurance === "yes";
  
  // Check current deployment type
  const currentIsPaaS = answers.currentDeploymentType === "paas";

  // If customer currently uses PaaS, inform them about OCI IaaS options
  if (currentIsPaaS) {
    recommendation.complianceNotes = "Note: OCI does not offer native PaaS for SQL Server. You must migrate to IaaS with License Included (OCI Marketplace images) or BYOL options below.";
  }

  // Get recommended instances
  recommendation.recommendedInstances = getRecommendedInstances(answers.targetEdition || "standard", answers.hadrRequirements || "no-hadr");

  // Determine deployment model based on edition and HA/DR requirements
  if (answers.targetEdition === "enterprise") {
    if (answers.hadrRequirements === "disaster-recovery") {
      recommendation.deploymentModel = "Bare Metal (BM.Standard.E5/E6) or VM.Optimized3.Flex (for maximum performance and multi-region HA)";
      recommendation.architecture = "Multi-region AlwaysOn Availability Groups with OCI FastConnect";
    } else if (answers.hadrRequirements === "advanced-ha") {
      recommendation.deploymentModel = "VM.Optimized.E5.Flex or Bare Metal (balanced performance and memory)";
      recommendation.architecture = "AlwaysOn Availability Groups within single Availability Domain";
    } else {
      recommendation.deploymentModel = "VM.Standard.E5.Flex or VM.Optimized.E5.Flex";
      recommendation.architecture = "Single instance or basic failover cluster";
    }
  } else if (answers.targetEdition === "standard") {
    if (answers.hadrRequirements === "disaster-recovery") {
      recommendation.deploymentModel = "VM.Optimized.E5.Flex (max 24 cores)";
      recommendation.architecture = "Multi-region failover with manual or automated scripts";
    } else if (answers.hadrRequirements === "advanced-ha") {
      recommendation.deploymentModel = "VM.Standard.E5.Flex (max 24 cores)";
      recommendation.architecture = "Failover Cluster Instance within single Availability Domain";
    } else {
      recommendation.deploymentModel = "VM.Standard.E5.Flex (max 24 cores)";
      recommendation.architecture = "Single instance deployment";
    }
  } else {
    recommendation.deploymentModel = "VM.Standard.E5.Flex or smaller";
    recommendation.architecture = "Single instance deployment";
  }

  // Determine licensing option based on current state and rules
  if (isGrandfathered && hasSA) {
    // Grandfathered license with SA - best case
    recommendation.licensingOption = "BYOL (License Mobility with Software Assurance)";
    recommendation.licensingDetails = `Your SQL Server license was purchased before October 1, 2019 with active Software Assurance. This is the most cost-effective option for OCI deployment.

**Two BYOL Deployment Paths:**

**Path 1: BYOL + OCI Marketplace Images** (Recommended - Fastest)
- Use pre-built SQL Server images from OCI Marketplace
- Bring your own grandfathered licenses with Software Assurance
- Fastest deployment path (hours, not days)
- Pre-configured and tested
- Includes Windows Server licensing
- Best for: Quick migration, standard configurations

**Path 2: BYOL + Migrate Existing Instances** (Migration)
- Migrate your existing SQL Server instances to OCI
- Keep existing configurations and data
- Use OCI Database Migration Service
- Best for: Preserving complex configurations, existing databases

**Cost Advantage:**
With Software Assurance, you only pay for OCI compute infrastructure. No additional SQL Server licensing costs. This is the lowest-cost deployment option.

**Flexibility:**
Software Assurance allows you to upgrade versions and add new workloads without additional licensing costs.`;
    recommendation.keyBenefits.push("Use existing grandfathered licenses with Software Assurance");
    recommendation.keyBenefits.push("License Mobility available without restrictions");
    recommendation.keyBenefits.push("Lowest cost option - only pay for compute");
    recommendation.keyBenefits.push("Can upgrade versions and add new workloads");
    recommendation.costConsiderations = "Lowest cost: only OCI compute charges. Your SA covers licensing. Estimated 30-50% savings vs License Included.";
    recommendation.complianceNotes = "Software Assurance provides maximum flexibility for workload expansion and version upgrades on OCI.";
    recommendation.nextSteps.push("Contact SQL Server Licensing Partner: Pavan.srirangam@oracle.com for license verification");
    recommendation.nextSteps.push("Choose deployment path: Marketplace images or migration");
    recommendation.nextSteps.push("Prepare license documentation for BYOL deployment");
  } else if (isGrandfathered && !isNewVersion && !isUpgrading) {
    // Grandfathered license without SA - can use for existing workload only
    recommendation.licensingOption = "BYOL (License Mobility - Grandfathered License)";
    recommendation.licensingDetails = `Your SQL Server license was purchased before October 1, 2019 and qualifies for License Mobility on OCI. However, without Software Assurance, usage is limited to existing workloads on the same version.

**Two BYOL Deployment Paths:**

**Path 1: BYOL + OCI Marketplace Images** (Recommended - Fastest)
- Use pre-built SQL Server images from OCI Marketplace
- Bring your own grandfathered licenses
- Fastest deployment path
- Pre-configured and tested
- Best for: Quick migration of existing workloads

**Path 2: BYOL + Migrate Existing Instances** (Migration)
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
    recommendation.nextSteps.push("Contact SQL Server Licensing Partner: Pavan.srirangam@oracle.com for license verification");
    recommendation.nextSteps.push("Choose deployment path: Marketplace images or migration");
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

**Path 1: BYOL + OCI Marketplace Images** (Fastest)
- Use pre-built SQL Server images from OCI Marketplace
- Bring new licenses with Software Assurance
- Fastest deployment path
- Pre-configured and tested

**Path 2: BYOL + Customer-Built Images** (Custom)
- Build custom SQL Server images with your licenses
- Full control over configuration
- Requires more setup time

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
    recommendation.nextSteps.push("Contact SQL Server Licensing Partner: Pavan.srirangam@oracle.com for new license pricing");
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

**Path 1: BYOL + OCI Marketplace Images** (Fastest)
- Use pre-built SQL Server images from OCI Marketplace
- Bring new licenses
- Fastest deployment path
- Pre-configured and tested
- Best for: Standard configurations with new licenses

**Path 2: BYOL + Customer-Built Images** (Custom)
- Build custom SQL Server images with your licenses
- Full control over configuration
- Requires more setup time
- Best for: Custom configurations

**Special Consideration for PaaS Migrations:**
If you're migrating from PaaS (Azure SQL Database, AWS RDS, Google Cloud SQL):
- **License Included**: Simplest path, includes support, no license procurement
- **BYOL with New Licenses**: Contact our licensing partner for cost-optimized licensing strategy

**Cost Comparison:**
- License Included: ~40-50% premium, includes support
- BYOL with New Licenses: Lower compute costs but requires license purchase (~$2,000-5,000 per 2-core pack)

**Recommendation:**
For new deployments without existing licenses, License Included is recommended for simplicity and support.`;
    recommendation.keyBenefits.push("License Included: Simplified licensing, includes support");
    recommendation.keyBenefits.push("BYOL: Cost-effective if purchasing new licenses");
    recommendation.keyBenefits.push("OCI Marketplace provides pre-configured images");
    recommendation.keyBenefits.push("Flexible deployment options for both models");
    recommendation.costConsiderations = "License Included: ~40-50% premium, includes support. BYOL: Lower compute costs but requires new license purchase (~$2,000-5,000 per 2-core pack).";
    recommendation.complianceNotes = "License Included includes Microsoft support and simplified compliance. BYOL requires proper license documentation and verification.";
    recommendation.nextSteps.push("Review OCI Marketplace SQL Server offerings for License Included option");
    recommendation.nextSteps.push("If choosing BYOL: Contact SQL Server Licensing Partner: Pavan.srirangam@oracle.com for new license pricing");
    recommendation.nextSteps.push("Compare License Included vs BYOL costs for your workload");
  }

  // Add OCI Marketplace links
  recommendation.marketplaceLinks = [
    `${marketplaceBaseUrl} - Browse all SQL Server offerings`,
    `${marketplaceBaseUrl}&version=${answers.targetVersion}&edition=${answers.targetEdition} - Filtered for your selection`,
  ];

  // Determine architecture based on HA/DR requirements
  if (answers.hadrRequirements === "disaster-recovery") {
    recommendation.architecture = "Multi-region AlwaysOn Availability Groups with OCI FastConnect or VPN for replication";
    recommendation.keyBenefits.push("Geographic redundancy for business continuity");
    recommendation.keyBenefits.push("Automated failover capabilities");
    recommendation.nextSteps.push("Plan multi-region deployment topology");
    recommendation.nextSteps.push("Configure OCI FastConnect or VPN for inter-region connectivity");
    recommendation.nextSteps.push("Set up monitoring and automated failover policies");
  } else if (answers.hadrRequirements === "advanced-ha") {
    recommendation.architecture = "AlwaysOn Availability Groups within single Availability Domain";
    recommendation.keyBenefits.push("High availability with automatic failover");
    recommendation.keyBenefits.push("Synchronous data replication");
    recommendation.nextSteps.push("Configure AlwaysOn Availability Groups");
    recommendation.nextSteps.push("Set up listener for application failover");
    recommendation.nextSteps.push("Configure backup and restore strategies");
  } else if (answers.hadrRequirements === "basic-ha") {
    recommendation.architecture = "Failover Cluster Instance within single Availability Domain";
    recommendation.keyBenefits.push("Basic failover protection");
    recommendation.keyBenefits.push("Shared storage via OCI Block Volume");
    recommendation.nextSteps.push("Configure Windows Failover Cluster");
    recommendation.nextSteps.push("Set up OCI Block Volume for shared storage");
  } else {
    recommendation.architecture = "Single instance deployment";
    recommendation.keyBenefits.push("Simple deployment and management");
    recommendation.keyBenefits.push("Lower infrastructure costs");
    recommendation.nextSteps.push("Plan backup and recovery procedures");
  }

  // Add migration approach guidance
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
- [OCI Marketplace - SQL Server](https://marketplace.oracle.com/listings?query=SQL+server)

Available options include:
- SQL Server 2022 Enterprise & Standard (Windows Server 2022, Ubuntu 22.04)
- SQL Server 2019 Enterprise & Standard (Windows Server 2019/2016, Ubuntu 20.04)
- License Included and BYOL options

---

### Next Steps

${recommendation.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

---

### SQL Server Licensing Support

For SQL Server licensing questions and optimization:
- **Contact:** Pavan.srirangam@oracle.com
- **Topic:** SQL Server licensing strategy, BYOL optimization, cost analysis, new license procurement

---

**Assessment Generated:** ${new Date().toLocaleDateString()}
**For Questions:** Contact your Oracle Sales Representative
  `.trim();
  
  return summary;
}

export const QUESTIONS = [
  // Customer Information Section
  {
    id: "customerName",
    category: "Customer Information",
    question: "Who is the customer looking to migrate SQL Server?",
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
      { value: "on-premises", label: "On-premises (physical or virtualized)" },
      { value: "azure", label: "Microsoft Azure" },
      { value: "aws", label: "Amazon Web Services (AWS)" },
      { value: "gcp", label: "Google Cloud Platform (GCP)" },
      { value: "oci", label: "Oracle Cloud Infrastructure (OCI)" },
      { value: "other", label: "Other cloud provider" },
    ],
  },
  {
    id: "currentDeploymentType",
    category: "Current State",
    question: "Is your current SQL Server deployed as PaaS or IaaS?",
    type: "radio",
    conditional: { field: "currentDeployment", value: "cloud-deployment" },
    options: [
      { value: "iaas", label: "IaaS (Virtual Machines - SQL Server on VMs)" },
      { value: "paas", label: "PaaS (Managed Database Service - Azure SQL Database, AWS RDS, Google Cloud SQL, etc.)" },
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
      { value: "developer", label: "Developer Edition (Full features, development/testing only)" },
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
