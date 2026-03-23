import { AssessmentAnswers } from './assessmentLogic';

interface Recommendation {
  deploymentModel: string;
  licensingOption: string;
  licensingDetails: string;
  architecture: string;
  costConsiderations: string;
  complianceNotes: string;
  keyBenefits: string[];
  nextSteps: string[];
  recommendedInstances?: string[];
}

interface AssessmentResult {
  recommendation: Recommendation;
  summary: string;
  estimatedComplexity: 'Low' | 'Medium' | 'High';
}

export function generatePDF(answers: AssessmentAnswers, result: AssessmentResult, recommendation: Recommendation) {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>OCI SQL Server Migration Assessment Report - ${answers.customerName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 3px solid #F80000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #F80000;
          margin: 0 0 5px 0;
          font-size: 28px;
        }
        .customer-headline {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 15px 0 10px 0;
          padding: 15px;
          background-color: #f0f0f0;
          border-left: 5px solid #F80000;
          border-radius: 4px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #F80000;
          border-bottom: 2px solid #F80000;
          padding-bottom: 10px;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .section h3 {
          color: #333;
          margin-top: 15px;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: bold;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-box {
          background-color: #f9f9f9;
          padding: 15px;
          border-left: 4px solid #F80000;
          border-radius: 4px;
        }
        .info-box label {
          font-weight: bold;
          color: #F80000;
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
        }
        .info-box value {
          color: #333;
          display: block;
          font-size: 13px;
        }
        .recommendation-box {
          background-color: #fff5f5;
          padding: 20px;
          border: 2px solid #F80000;
          border-radius: 6px;
          margin: 15px 0;
        }
        .recommendation-box h3 {
          margin-top: 0;
          color: #F80000;
        }
        .benefits-list {
          list-style: none;
          padding: 0;
        }
        .benefits-list li {
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
          font-size: 13px;
        }
        .benefits-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #F80000;
          font-weight: bold;
        }
        .steps-list {
          list-style: decimal;
          padding-left: 20px;
          font-size: 13px;
        }
        .steps-list li {
          padding: 8px 0;
          color: #333;
        }
        .ha-dr-section {
          background-color: #f0f8ff;
          padding: 20px;
          border-left: 5px solid #0066cc;
          border-radius: 6px;
          margin: 20px 0;
        }
        .ha-dr-section h3 {
          color: #0066cc;
          margin-top: 0;
        }
        .ha-dr-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 12px;
        }
        .ha-dr-table th {
          background-color: #0066cc;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: bold;
        }
        .ha-dr-table td {
          border: 1px solid #ddd;
          padding: 10px;
        }
        .ha-dr-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .disclaimer-box {
          background-color: #fff3cd;
          border: 2px solid #ffc107;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
          font-size: 12px;
        }
        .disclaimer-box h3 {
          color: #856404;
          margin-top: 0;
        }
        .disclaimer-box p {
          margin: 8px 0;
          line-height: 1.5;
        }
        .contact-box {
          background-color: #e7f3ff;
          border: 2px solid #2196F3;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          font-size: 12px;
        }
        .contact-box strong {
          color: #1565c0;
        }
        .footer {
          border-top: 2px solid #ddd;
          padding-top: 20px;
          margin-top: 30px;
          font-size: 11px;
          color: #666;
        }
        .complexity-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: bold;
          margin: 10px 0;
          font-size: 12px;
        }
        .complexity-low {
          background-color: #d4edda;
          color: #155724;
        }
        .complexity-medium {
          background-color: #fff3cd;
          color: #856404;
        }
        .complexity-high {
          background-color: #f8d7da;
          color: #721c24;
        }
        .page-break {
          page-break-after: always;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #F80000;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>OCI SQL Server Migration Assessment Report</h1>
          <div class="customer-headline">Customer: ${answers.customerName || 'N/A'}</div>
          <p><strong>Email:</strong> ${answers.customerEmail || 'N/A'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Assessment ID:</strong> ${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>

        <!-- Executive Summary -->
        <div class="section">
          <h2>Executive Summary</h2>
          <div class="recommendation-box">
            <h3>Assessment Overview</h3>
            <p>${result.summary.split('\n').slice(0, 5).join('<br>')}</p>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="section">
          <h2>Customer Information</h2>
          <div class="info-grid">
            <div class="info-box">
              <label>Customer/Company Name</label>
              <value>${answers.customerName || 'N/A'}</value>
            </div>
            <div class="info-box">
              <label>Number of SQL Server Instances</label>
              <value>${answers.numInstances || 'N/A'}</value>
            </div>
            <div class="info-box">
              <label>Contact Email</label>
              <value>${answers.customerEmail || 'N/A'}</value>
            </div>
            <div class="info-box">
              <label>Assessment Date</label>
              <value>${new Date().toLocaleDateString()}</value>
            </div>
          </div>
        </div>

        <!-- Current State Assessment -->
        <div class="section">
          <h2>Current State Assessment</h2>
          <div class="info-grid">
            <div class="info-box">
              <label>Currently Running SQL Server</label>
              <value>${answers.currentlyRunning === 'yes' ? 'Yes' : 'No'}</value>
            </div>
            ${answers.currentlyRunning === 'yes' ? `
            <div class="info-box">
              <label>Current Version</label>
              <value>SQL Server ${answers.currentVersion || 'N/A'}</value>
            </div>
            <div class="info-box">
              <label>Current Edition</label>
              <value>${answers.currentEdition || 'N/A'}</value>
            </div>
            <div class="info-box">
              <label>Current Deployment</label>
              <value>${answers.currentDeployment || 'N/A'}</value>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Target Deployment -->
        <div class="section">
          <h2>Target Deployment on OCI</h2>
          <div class="info-grid">
            <div class="info-box">
              <label>Target SQL Server Version</label>
              <value>SQL Server ${answers.targetVersion || '2022'}</value>
            </div>
            <div class="info-box">
              <label>Target Edition</label>
              <value>${answers.targetEdition || 'N/A'}</value>
            </div>
            <div class="info-box">
              <label>HA/DR Requirements</label>
              <value>${answers.hadrRequirements || 'No HA/DR required'}</value>
            </div>
            <div class="info-box">
              <label>Migration Approach</label>
              <value>${answers.migrationApproach || 'N/A'}</value>
            </div>
          </div>
        </div>

        <!-- Complexity Assessment -->
        <div class="section">
          <h2>Complexity Assessment</h2>
          <div class="complexity-badge complexity-${result.estimatedComplexity.toLowerCase()}">
            Estimated Complexity: ${result.estimatedComplexity}
          </div>
        </div>

        <!-- OCI Recommendation -->
        <div class="section">
          <h2>OCI Recommendation</h2>
          
          <div class="recommendation-box">
            <h3>Deployment Model</h3>
            <p>${recommendation.deploymentModel}</p>
          </div>

          <div class="recommendation-box">
            <h3>Licensing Option</h3>
            <p>${recommendation.licensingOption}</p>
          </div>

          <div class="recommendation-box">
            <h3>Recommended Architecture</h3>
            <p>${recommendation.architecture}</p>
          </div>

          ${recommendation.recommendedInstances && recommendation.recommendedInstances.length > 0 ? `
          <div class="recommendation-box">
            <h3>Recommended OCI Instance Types</h3>
            <ul class="benefits-list">
              ${recommendation.recommendedInstances.map(instance => `<li>${instance}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="recommendation-box">
            <h3>Licensing Details</h3>
            <p>${recommendation.licensingDetails}</p>
          </div>

          <div class="recommendation-box">
            <h3>Cost Considerations</h3>
            <p>${recommendation.costConsiderations}</p>
          </div>
        </div>

        <!-- HA/DR Architecture Optimization -->
        <div class="section ha-dr-section">
          <h2>High Availability & Disaster Recovery Architecture</h2>
          
          <h3>HA/DR Assessment for ${answers.hadrRequirements || 'Standard Deployment'}</h3>
          
          <table class="ha-dr-table">
            <thead>
              <tr>
                <th>Architecture Component</th>
                <th>OCI Implementation</th>
                <th>RTO/RPO Target</th>
                <th>Estimated Cost Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Compute Redundancy</strong></td>
                <td>Multi-availability domain deployment with Oracle Database Exadata or VM.Optimized.E5.Flex instances across ADs</td>
                <td>RTO: 5-15 min | RPO: 0-5 min</td>
                <td>+25-35% for redundant infrastructure</td>
              </tr>
              <tr>
                <td><strong>Storage Replication</strong></td>
                <td>OCI Block Volume cross-region replication with automated snapshots</td>
                <td>RTO: 15-30 min | RPO: 1 hour</td>
                <td>+15-20% for replication services</td>
              </tr>
              <tr>
                <td><strong>Database Mirroring</strong></td>
                <td>SQL Server Always On Availability Groups with 2-3 replicas across OCI regions</td>
                <td>RTO: 1-2 min | RPO: Near-zero</td>
                <td>+40-50% for multi-region deployment</td>
              </tr>
              <tr>
                <td><strong>Backup & Recovery</strong></td>
                <td>OCI Backup Service with cross-region backup copies and point-in-time recovery</td>
                <td>RTO: 30-60 min | RPO: 4 hours</td>
                <td>+10-15% for backup infrastructure</td>
              </tr>
              <tr>
                <td><strong>Failover Automation</strong></td>
                <td>OCI Database Exadata with automatic failover, or custom failover scripts with OCI Monitoring</td>
                <td>RTO: 2-5 min | RPO: 0 min</td>
                <td>+5-10% for automation tooling</td>
              </tr>
            </tbody>
          </table>

          <h3>Recommended HA/DR Strategy</h3>
          <p><strong>For Critical Workloads (RTO < 5 min, RPO < 1 min):</strong></p>
          <ul class="benefits-list">
            <li>Deploy SQL Server Always On Availability Groups across multiple OCI availability domains</li>
            <li>Implement synchronous replication for primary and secondary replicas within same region</li>
            <li>Configure asynchronous replication for cross-region disaster recovery replica</li>
            <li>Use OCI Database Exadata for maximum performance and built-in HA capabilities</li>
            <li>Implement automated failover with OCI Monitoring and alerting</li>
          </ul>

          <p><strong>For Standard Workloads (RTO 15-30 min, RPO 1-4 hours):</strong></p>
          <ul class="benefits-list">
            <li>Deploy SQL Server in VM.Optimized.E5.Flex instances with local storage redundancy</li>
            <li>Implement daily backups with OCI Backup Service and cross-region backup copies</li>
            <li>Configure manual failover procedures with documented runbooks</li>
            <li>Use OCI Database Exadata for non-critical workloads with standard HA</li>
            <li>Implement quarterly disaster recovery drills</li>
          </ul>

          <p><strong>For Development/Test Workloads (RTO > 1 hour, RPO > 4 hours):</strong></p>
          <ul class="benefits-list">
            <li>Deploy on VM.Standard.E5.Flex instances with cost optimization focus</li>
            <li>Implement weekly backups with OCI Backup Service</li>
            <li>Manual failover procedures acceptable for non-production environments</li>
            <li>Consider single-region deployment to minimize costs</li>
          </ul>
        </div>

        <!-- Key Benefits -->
        <div class="section">
          <h2>Key Benefits of OCI Deployment</h2>
          <ul class="benefits-list">
            ${recommendation.keyBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        </div>

        <!-- Next Steps -->
        <div class="section">
          <h2>Recommended Next Steps</h2>
          <ol class="steps-list">
            ${recommendation.nextSteps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>

        <!-- Compliance Notes -->
        <div class="section">
          <h2>Compliance & Important Notes</h2>
          <p>${recommendation.complianceNotes}</p>
        </div>

        <!-- Disclaimer Section -->
        <div class="disclaimer-box">
          <h3>⚠️ Important Disclaimer & Alternative Solutions</h3>
          <p><strong>This assessment provides general guidance based on the SQL Server 2022 Licensing Guide and OCI capabilities.</strong> However, alternative solutions may exist that better suit your specific business requirements, including:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Hybrid cloud deployments combining on-premises and OCI infrastructure</li>
            <li>Azure Hybrid Benefit scenarios if already invested in Microsoft ecosystem</li>
            <li>Third-party managed services for specialized SQL Server workloads</li>
            <li>Database modernization strategies (migrating to Oracle Database, PostgreSQL, etc.)</li>
            <li>Containerized SQL Server deployments using OCI Container Engine for Kubernetes</li>
          </ul>
          <p><strong>For more informed decision-making and to explore alternative architectures, we strongly recommend consulting with the Microsoft Accelerator Team</strong> who can provide independent technical validation and licensing optimization strategies.</p>
          
          <div class="contact-box">
            <strong>Microsoft Accelerator Team Contact:</strong><br>
            Reach out to your Microsoft account team or contact the SQL Server licensing specialists for comprehensive architectural review and licensing optimization.
          </div>

          <div class="contact-box">
            <strong>Oracle SQL Server Licensing Partner:</strong><br>
            Email: <strong>Pavan.srirangam@oracle.com</strong><br>
            For licensing optimization, cost analysis, and implementation support specific to OCI deployment.
          </div>

          <p><strong>Recommendation Validity:</strong> This assessment is valid for 90 days. SQL Server licensing rules and OCI offerings may change. Please re-assess if significant changes occur in your environment or licensing requirements.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Assessment Basis:</strong> SQL Server 2022 Licensing Guide (effective October 1, 2019 licensing model changes)</p>
          <p><strong>Confidentiality Notice:</strong> This report contains confidential information and is intended solely for the use of the named customer. Unauthorized access, use, or distribution is prohibited.</p>
          <p style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
            <em>This assessment was generated using the OCI SQL Server Migration Questionnaire Tool. For questions or clarifications, contact your Oracle Cloud sales representative.</em>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a blob from the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Create an iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);

  // Wait for the iframe to load, then print
  iframe.onload = () => {
    iframe.contentWindow?.print();
    
    // Clean up after printing
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 1000);
  };
}
