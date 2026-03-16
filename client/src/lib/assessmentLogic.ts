// Assessment Logic and Recommendation Engine for OCI SQL Server Migration
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
  
  // Check current deployment type
  const currentIsPaaS = answers.currentDeploymentType === "paas";

  // Check if customer wants PaaS on OCI
  if (isOCI && currentIsPaaS) {
    recommendation.deploymentModel = "Managed Database Service (PaaS) - Contact Oracle Managed Services Partner";
    recommendation.licensingOption = "Managed Services Partner Engagement";
    recommendation.licensingDetails = "OCI does not offer native PaaS SQL Server services. However, Oracle has partnerships with managed services providers who can deliver PaaS-like SQL Server experiences on OCI infrastructure. Please contact our managed services partner for a customized solution.";
    recommendation.architecture = "Custom PaaS architecture managed by Oracle partner";
    recommendation.costConsiderations = "Pricing depends on the managed services partner's offering and SLA requirements.";
    recommendation.keyBenefits.push("Fully managed SQL Server experience");
    recommendation.keyBenefits.push("Reduced operational overhead");
    recommendation.keyBenefits.push("Professional support and SLAs");
    recommendation.nextSteps.push("Contact Oracle Managed Services Partner: Pavan.srirangam@oracle.com");
    recommendation.nextSteps.push("Discuss PaaS requirements and custom solution options");
    recommendation.complianceNotes = "PaaS solutions are delivered through Oracle's managed services partners. Licensing and support terms will be defined in partnership agreements.";
    
    const summary = generateSummary(answers, recommendation);
    return {
      recommendation,
      summary,
      estimatedComplexity: "High",
    };
  }

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
    // OCI only supports IaaS (no PaaS option)
    recommendation.nextSteps.push("Note: OCI offers only IaaS deployment options (SQL Server on VMs)");
    
    if (isUpgrading && isNewVersion) {
      // Upgrading to new version requires SA or other option
      if (hasSA) {
        recommendation.licensingOption = "BYOL with License Mobility (Software Assurance)";
        recommendation.licensingDetails = "Use License Mobility to deploy SQL Server 2022 on OCI. With SA, you can reassign licenses within server farm more than once every 90 days.";
        recommendation.keyBenefits.push("Leverage existing SQL Server licenses on OCI");
        recommendation.keyBenefits.push("License Mobility enables flexible deployment");
        recommendation.costConsiderations = "Cost includes SA maintenance + OCI infrastructure. Most cost-effective if you have active SA.";
      } else {
        recommendation.licensingOption = "License Included (OCI Marketplace)";
        recommendation.licensingDetails = "For SQL Server 2022, purchase License Included from OCI Marketplace. This includes licensing, support, and infrastructure in one package.";
        recommendation.keyBenefits.push("Simplified licensing and compliance");
        recommendation.keyBenefits.push("Included support from Oracle and Microsoft");
        recommendation.costConsiderations = "License Included option has higher per-hour cost but simplifies management.";
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

  // Add migration context if coming from PaaS
  if (currentIsPaaS && isOCI) {
    recommendation.complianceNotes = (recommendation.complianceNotes || "") + " Note: You are migrating from a PaaS SQL Server service. OCI offers only IaaS options, which means you will manage SQL Server directly on VMs. This provides more control but requires more operational overhead.";
  }

  // Determine complexity
  let complexity: "Low" | "Medium" | "High" = "Low";
  if (answers.hadrRequirements === "disaster-recovery") {
    complexity = "High";
  } else if (answers.hadrRequirements === "advanced-ha") {
    complexity = "Medium";
  }
  
  // Increase complexity if migrating from PaaS to IaaS
  if (currentIsPaaS && isOCI && complexity === "Low") {
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
  const currentVersion = answers.currentVersion ? `SQL Server ${answers.currentVersion}` : "Unknown";
  const currentEdition = answers.currentEdition ? answers.currentEdition.charAt(0).toUpperCase() + answers.currentEdition.slice(1) : "Unknown";
  const hadrLabel = answers.hadrRequirements === "no-hadr" ? "No HA/DR" : (answers.hadrRequirements || "standard").replace(/-/g, " ").toUpperCase();
  const migrationLabel = answers.migrationApproach === "lift-shift" ? "Lift and Shift" : answers.migrationApproach === "replatform" ? "Re-platform" : "Re-factor";
  
  const summary = `
## OCI SQL Server Migration Assessment Report

**Customer Name:** ${answers.customerName || "Not provided"}
**Number of SQL Server Instances to Migrate:** ${answers.numInstances || "Not specified"}

---

### Current State Assessment

| Aspect | Details |
|--------|---------|
| **Current Version** | ${currentVersion} ${currentEdition} Edition |
| **Current Deployment** | ${answers.currentDeployment || "Unknown"} |
| **Deployment Type** | ${answers.currentDeploymentType === "paas" ? "PaaS (Managed Service)" : "IaaS (Virtual Machines)"} |
| **License Purchase Date** | ${answers.licensePurchaseDate === "before-oct-2019" ? "Before October 1, 2019 (Grandfathered)" : answers.licensePurchaseDate === "after-oct-2019" ? "After October 1, 2019" : "Unknown"} |
| **Current Licensing Model** | ${answers.currentLicensingModel === "per-core" ? "Per Core" : "Server + CAL"} |
| **Software Assurance** | ${answers.softwareAssurance === "yes" ? "Active" : "Not Active"} |

---

### Target Deployment Plan

| Aspect | Details |
|--------|---------|
| **Target Version** | ${targetVersion} |
| **Target Edition** | ${targetEdition} Edition |
| **Target Cloud** | OCI (Oracle Cloud Infrastructure) |
| **HA/DR Requirements** | ${hadrLabel} |
| **Migration Approach** | ${migrationLabel} |

---

### Recommended OCI Deployment Path

**Deployment Model:** ${recommendation.deploymentModel}

**Licensing Option:** ${recommendation.licensingOption}

**Architecture:** ${recommendation.architecture}

---

### Key Benefits

${recommendation.keyBenefits.map((benefit, idx) => `${idx + 1}. ${benefit}`).join("\n")}

---

### Cost Considerations

${recommendation.costConsiderations}

---

### Licensing Details

${recommendation.licensingDetails}

---

### Implementation Roadmap

${recommendation.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}

---

${recommendation.complianceNotes ? `### Compliance & Important Notes

${recommendation.complianceNotes}

---

` : ""}

### Next Steps

1. **Review this assessment** with your IT and procurement teams
2. **Contact Oracle Sales** for detailed pricing and licensing terms
3. **Engage with Oracle Managed Services** if PaaS options are required
4. **Plan migration timeline** based on your business requirements
5. **Validate application compatibility** on OCI infrastructure

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
    question: "What is your name or company name?",
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
