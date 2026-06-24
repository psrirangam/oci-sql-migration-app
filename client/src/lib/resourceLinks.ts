export type ResourceLink = {
  category: "Licensing" | "Marketplace" | "Deployment" | "HA/DR" | "Identity" | "Internal";
  title: string;
  description: string;
  url: string;
};

export const RESOURCE_LINKS: ResourceLink[] = [
  {
    category: "Licensing",
    title: "Microsoft Licensing on OCI",
    description: "BYOL vs OCI-provided licensing, SQL Server billing rules, and 744-hour minimum.",
    url: "https://docs.oracle.com/en-us/iaas/Content/Compute/References/microsoftlicensing.htm",
  },
  {
    category: "Marketplace",
    title: "Oracle Cloud Marketplace SQL Server Images",
    description: "Search landing page for available SQL Server images.",
    url: "https://cloudmarketplace.oracle.com/marketplace/en_US/homePage.jspx?tag=SQL+Server",
  },
  {
    category: "Deployment",
    title: "Deploy a Windows Instance",
    description: "Quickstart for Windows instance deployment, RDP, security lists, and KMS.",
    url: "https://docs.oracle.com/en/learn/oci-window-instance/",
  },
  {
    category: "Deployment",
    title: "Single-node SQL Server Deploy",
    description: "Quickstart for Windows plus block storage.",
    url: "https://blogs.oracle.com/cloud-infrastructure/deploying-microsoft-sql-server-on-oracle-cloud-infrastructure",
  },
  {
    category: "HA/DR",
    title: "Always On Availability Groups Tutorial",
    description: "Step-by-step tutorial for multi-subnet, WSFC, and file share witness.",
    url: "https://docs.oracle.com/en/learn/oci-sql-server-aoag/index.html",
  },
  {
    category: "HA/DR",
    title: "Always On Availability Groups with Listener",
    description: "Automatic failover configuration.",
    url: "https://blogs.oracle.com/cloud-infrastructure/ms-sql-server-db-oci-alwayson-availability-group",
  },
  {
    category: "HA/DR",
    title: "Log Shipping for DR or Low-downtime Migration",
    description: "Disaster recovery and migration pattern using SQL Server log shipping.",
    url: "https://blogs.oracle.com/cloud-infrastructure/dr-migration-sql-server-database-log-shipping",
  },
  {
    category: "HA/DR",
    title: "Reference Architecture for HA SQL Server",
    description: "SQL Server with Active Directory, quorum, and multi-AZ design.",
    url: "https://docs.oracle.com/en/solutions/deploy-microsoft-sql-on-oci/index.html",
  },
  {
    category: "Identity",
    title: "Active Directory on OCI with File Storage",
    description: "Configure File Storage for Active Directory.",
    url: "https://docs.oracle.com/en/solutions/configure-file-storage-for-active-directory/index.html",
  },
  {
    category: "Identity",
    title: "Entra Domain Services Integration",
    description: "OCI to Azure AD DS integration through VPN.",
    url: "https://docs.oracle.com/en/learn/oci-compute-with-meds/index.html",
  },
  {
    category: "Internal",
    title: "Oracle Internal Microsoft Resource Page",
    description: "Internal Oracle SharePoint reference for Microsoft migration resources.",
    url: "https://oracle.sharepoint.com/sites/naci/SitePages/Micro.aspx",
  },
];
