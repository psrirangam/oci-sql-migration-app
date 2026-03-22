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
    marketplaceLinks: [],
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

  // Determine deployment model based on edition and HA/DR requirements
  if (answers.targetEdition === "enterprise") {
    if (answers.hadrRequirements === "disaster-recovery") {
      recommendation.deploymentModel = "Bare Metal or VM.Optimized3.Flex (for maximum performance)";
      recommendation.architecture = "Multi-region AlwaysOn Availability Groups with OCI FastConnect";
    } else if (answers.hadrRequirements === "advanced-ha") {
      recommendation.deploymentModel = "VM.Optimized3.Flex or VM.Standard3.Flex (balanced performance)";
      recommendation.architecture = "AlwaysOn Availability Groups within single Availability Domain";
    } else {
      recommendation.deploymentModel = "VM.Standard3.Flex or VM.Optimized3.Flex";
      recommendation.architecture = "Single instance or basic failover cluster";
    }
  } else if (answers.targetEdition === "standard") {
    if (answers.hadrRequirements === "disaster-recovery") {
      recommendation.deploymentModel = "VM.Optimized3.Flex (max 24 cores)";
      recommendation.architecture = "Multi-region failover with manual or automated scripts";
    } else if (answers.hadrRequirements === "advanced-ha") {
      recommendation.deploymentModel = "VM.Standard3.Flex (max 24 cores)";
      recommendation.architecture = "Failover Cluster Instance within single Availability Domain";
    } else {
      recommendation.deploymentModel = "VM.Standard3.Flex (max 24 cores)";
      recommendation.architecture = "Single instance deployment";
    }
  } else {
    recommendation.deploymentModel = "VM.Standard.E4.Flex or smaller";
    recommendation.architecture = "Single instance deployment";
  }

  // Determine licensing option based on current state and rules
  if (isGrandfathered && !isNewVersion && !isUpgrading) {
    // Grandfathered license for existing workload on same version
    recommendation.licensingOption = "BYOL (License Mobility - Grandfathered License)";
    recommendation.licensingDetails = `Your SQL Server license was purchased before October 1, 2019 and qualifies for License Mobility on OCI. Since OCI is not a Listed Provider, you have maximum flexibility with your existing licenses.

**Three BYOL Deployment Paths:**

1. **BYOL + OCI Marketplace Images** (Fastest)
   - Use pre-built SQL Server images from OCI Marketplace
   - Bring your own licenses
   - Fastest deployment path
   - Pre-configured and tested

2. **BYOL + Customer-Built Images** (Custom)
   - Build custom SQL Server images with your licenses
   - Full control over configuration
   - Requires more setup time

3. **BYOL + Migrate Existing Instances** (Migration)
   - Migrate your existing SQL Server instances to OCI
   - Keep existing configurations and data
   - Requires migration planning

All three options provide the lowest cost - only pay for OCI compute infrastructure.`;
    recommendation.keyBenefits.push("Use existing licenses on OCI");
    recommendation.keyBenefits.push("License Mobility available without restrictions");
    recommendation.keyBenefits.push("Three flexible deployment paths");
    recommendation.keyBenefits.push("Lowest cost option - only pay for compute");
    recommendation.costConsiderations = "Lowest cost: only OCI compute charges. Requires valid Microsoft license and proper documentation.";
    recommendation.complianceNotes = "Grandfathered licenses can be used on OCI for existing workloads. When upgrading to new versions, new licensing rules apply.";
    recommendation.nextSteps.push("Contact SQL Server Licensing Partner: Pavan.srirangam@oracle.com for license verification");
    recommendation.nextSteps.push("Choose deployment path: Marketplace images, custom build, or migration");
    recommendation.nextSteps.push("Prepare license documentation for BYOL deployment");
  } else if (isGrandfathered && hasSA) {
    // Grandfathered with SA - can use for new workloads
    recommendation.licensingOption = "BYOL (License Mobility with Software Assurance)";
    recommendation.licensingDetails = `With active Software Assurance and a grandfathered license, you have maximum flexibility on OCI for both existing and new workloads.

**Three BYOL Deployment Paths:**

1. **BYOL + OCI Marketplace Images** (Fastest)
   - Use pre-built SQL Server images from OCI Marketplace
   - Bring your own licenses
   - Fastest deployment path

2. **BYOL + Customer-Built Images** (Custom)
   - Build custom SQL Server images with your licenses
   - Full control over configuration

3. **BYOL + Migrate Existing Instances** (Migration)
   - Migrate your existing SQL Server instances to OCI
   - Keep existing configurations and data

With Software Assurance, you can also upgrade versions and add new workloads.`;
    recommendation.keyBenefits.push("Use SA benefits on OCI");
    recommendation.keyBenefits.push("Full License Mobility flexibility");
    recommendation.keyBenefits.push("Can add new workloads with SA coverage");
    recommendation.keyBenefits.push("Three flexible deployment paths");
    recommendation.costConsiderations = "Cost includes SA maintenance + OCI compute. Lowest total cost for long-term deployments.";
    recommendation.complianceNotes = "Software Assurance provides maximum flexibility for workload expansion and version upgrades.";
    recommendation.nextSteps.push("Contact SQL Server Licensing Partner: Pavan.srirangam@oracle.com for license verification");
    recommendation.nextSteps.push("Choose deployment path: Marketplace images, custom build, or migration");
    recommendation.nextSteps.push("Verify SA coverage and renewal dates");
  } else {
    // No grandfathered license or new workload - recommend License Included or BYOL
    recommendation.licensingOption = "License Included (OCI Marketplace) or BYOL";
    recommendation.licensingDetails = `For new workloads or if you don't have grandfathered licenses, you have two main options:

**Option 1: License Included (Recommended for Simplicity)**
- Use pre-built SQL Server images from OCI Marketplace
- Licensing included in hourly rate
- Includes Microsoft support
- Fastest deployment path
- Simplified compliance

**Option 2: BYOL (If You Have Available Licenses)**
Three deployment paths:
1. **BYOL + OCI Marketplace Images** - Use pre-built images with your licenses (fastest)
2. **BYOL + Customer-Built Images** - Build custom images with your licenses
3. **BYOL + Migrate Existing Instances** - Migrate existing SQL Server instances

BYOL provides lower compute costs but requires valid licenses and documentation.`;
    recommendation.keyBenefits.push("License Included: Simplified licensing, includes support");
    recommendation.keyBenefits.push("BYOL: Cost-effective if licenses available");
    recommendation.keyBenefits.push("OCI Marketplace provides pre-configured images");
    recommendation.keyBenefits.push("Flexible deployment options for both models");
    recommendation.costConsiderations = "License Included: Higher per-hour cost (~40-50% premium), includes support. BYOL: Lower compute costs but requires valid licenses and documentation.";
    recommendation.complianceNotes = "License Included includes Microsoft support and simplified compliance. BYOL requires proper license documentation and verification.";
    recommendation.nextSteps.push("Review OCI Marketplace SQL Server offerings for License Included option");
    recommendation.nextSteps.push("If choosing BYOL: Contact SQL Server Licensing Partner: Pavan.srirangam@oracle.com for license verification");
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
- **Topic:** SQL Server licensing strategy, BYOL optimization, cost analysis

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
      { value: "web", label: "Web Edition (Limited features, cloud-only)" },
      { value: "express", label: "Express Edition (Max 4 cores, 10 GB database)" },
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
