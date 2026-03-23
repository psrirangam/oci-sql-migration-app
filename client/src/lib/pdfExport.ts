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
      <title>OCI SQL Server Migration Assessment - ${answers.customerName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.4;
          color: #333;
          background-color: #fff;
        }
        .container {
          max-width: 8.5in;
          height: 11in;
          margin: 0 auto;
          padding: 0.5in;
          background-color: white;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #F80000;
          padding-bottom: 0.3in;
          margin-bottom: 0.3in;
        }
        .header-left h1 {
          color: #F80000;
          font-size: 20px;
          margin-bottom: 5px;
        }
        .header-left p {
          font-size: 11px;
          color: #666;
          margin: 2px 0;
        }
        .header-right {
          text-align: right;
          font-size: 10px;
          color: #666;
        }
        .customer-banner {
          background-color: #f0f0f0;
          border-left: 5px solid #F80000;
          padding: 0.15in;
          margin-bottom: 0.2in;
          font-size: 12px;
        }
        .customer-banner strong {
          color: #F80000;
          display: block;
          font-size: 14px;
          margin-bottom: 3px;
        }
        .section-title {
          color: #F80000;
          font-size: 12px;
          font-weight: bold;
          border-bottom: 2px solid #F80000;
          padding-bottom: 5px;
          margin-top: 0.15in;
          margin-bottom: 0.1in;
        }
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.15in;
          margin-bottom: 0.15in;
          font-size: 10px;
        }
        .info-item {
          background-color: #f9f9f9;
          padding: 0.1in;
          border-left: 3px solid #F80000;
        }
        .info-label {
          font-weight: bold;
          color: #F80000;
          font-size: 9px;
          display: block;
          margin-bottom: 2px;
        }
        .info-value {
          color: #333;
          font-size: 10px;
        }
        .recommendation-box {
          background-color: #fff5f5;
          border: 1px solid #F80000;
          padding: 0.1in;
          margin-bottom: 0.1in;
          font-size: 10px;
        }
        .recommendation-box h3 {
          color: #F80000;
          font-size: 11px;
          margin-bottom: 5px;
        }
        .option-box {
          background-color: #f9f9f9;
          border-left: 3px solid #F80000;
          padding: 0.08in;
          margin-bottom: 0.08in;
          font-size: 10px;
        }
        .option-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 3px;
        }
        .option-description {
          color: #555;
          font-size: 9px;
          line-height: 1.3;
        }
        .ha-dr-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.1in 0;
          font-size: 9px;
        }
        .ha-dr-table th {
          background-color: #F80000;
          color: white;
          padding: 5px;
          text-align: left;
          font-weight: bold;
        }
        .ha-dr-table td {
          border: 1px solid #ddd;
          padding: 5px;
        }
        .ha-dr-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .benefits-list {
          list-style: none;
          padding: 0;
          font-size: 10px;
        }
        .benefits-list li {
          padding: 3px 0;
          padding-left: 15px;
          position: relative;
        }
        .benefits-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #F80000;
          font-weight: bold;
        }
        .disclaimer-box {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          padding: 0.1in;
          margin-top: 0.15in;
          font-size: 9px;
          line-height: 1.3;
        }
        .disclaimer-box h3 {
          color: #856404;
          font-size: 10px;
          margin-bottom: 5px;
        }
        .contact-info {
          background-color: #e7f3ff;
          border-left: 3px solid #2196F3;
          padding: 0.08in;
          margin: 5px 0;
          font-size: 9px;
        }
        .contact-info strong {
          color: #1565c0;
        }
        .page-break {
          page-break-after: always;
        }
        .footer {
          border-top: 1px solid #ddd;
          padding-top: 0.1in;
          margin-top: 0.15in;
          font-size: 8px;
          color: #666;
        }
        .complexity-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 15px;
          font-weight: bold;
          font-size: 9px;
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
      </style>
    </head>
    <body>
      <div class="container">
        <!-- HEADER -->
        <div class="header-section">
          <div class="header-left">
            <h1>OCI SQL Server Migration Assessment</h1>
            <p>Professional Assessment Report</p>
          </div>
          <div class="header-right">
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>ID:</strong> ${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        </div>

        <!-- CUSTOMER INFO BANNER -->
        <div class="customer-banner">
          <strong>Customer: ${answers.customerName || 'N/A'}</strong>
          Email: ${answers.customerEmail || 'N/A'} | Instances: ${answers.numInstances || 'N/A'}
        </div>

        <!-- EXECUTIVE SUMMARY -->
        <div class="section-title">Executive Summary</div>
        <div class="recommendation-box">
          <p style="font-size: 10px; line-height: 1.4;">
            ${result.summary.split('\n').slice(0, 3).join('<br>')}
          </p>
          <div style="margin-top: 5px;">
            <span class="complexity-badge complexity-${result.estimatedComplexity.toLowerCase()}">
              Complexity: ${result.estimatedComplexity}
            </span>
          </div>
        </div>

        <!-- CURRENT STATE & TARGET STATE (2 COLUMN) -->
        <div class="section-title">Current & Target State</div>
        <div class="two-column">
          <div>
            <div class="info-item">
              <span class="info-label">Current Version</span>
              <span class="info-value">${answers.currentlyRunning === 'yes' ? 'SQL Server ' + (answers.currentVersion || 'N/A') : 'New Deployment'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Current Edition</span>
              <span class="info-value">${answers.currentEdition || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Deployment</span>
              <span class="info-value">${answers.currentDeployment || 'N/A'}</span>
            </div>
          </div>
          <div>
            <div class="info-item">
              <span class="info-label">Target Version</span>
              <span class="info-value">SQL Server ${answers.targetVersion || '2022'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Target Edition</span>
              <span class="info-value">${answers.targetEdition || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">HA/DR Strategy</span>
              <span class="info-value">${answers.hadrRequirements || 'Standard'}</span>
            </div>
          </div>
        </div>

        <!-- RECOMMENDED INSTANCE TYPES -->
        <div class="section-title">Recommended OCI Instance Types</div>
        <div style="font-size: 10px; margin-bottom: 0.1in;">
          ${recommendation.recommendedInstances?.map(instance => `<div style="margin-bottom: 3px;">• ${instance}</div>`).join('')}
        </div>

        <!-- LICENSING OPTIONS -->
        <div class="section-title">Licensing Options</div>
        <div style="font-size: 10px;">
          ${recommendation.licensingDetails.split('\n\n').map((paragraph, idx) => {
            if (paragraph.includes('**Option') || paragraph.includes('**Path')) {
              const lines = paragraph.split('\n');
              const title = lines[0].replace(/\*\*/g, '');
              const desc = lines.slice(1).join(' ').replace(/\*\*/g, '').replace(/- /g, '• ');
              return `
                <div class="option-box">
                  <div class="option-title">${title}</div>
                  <div class="option-description">${desc}</div>
                </div>
              `;
            }
            return `<div style="margin-bottom: 0.08in; line-height: 1.3;">${paragraph.replace(/\*\*/g, '')}</div>`;
          }).join('')}
        </div>

        <!-- PAGE BREAK -->
        <div class="page-break"></div>

        <!-- PAGE 2 HEADER -->
        <div class="header-section" style="margin-bottom: 0.2in;">
          <div class="header-left">
            <h1>OCI SQL Server Migration Assessment (Continued)</h1>
          </div>
          <div class="header-right">
            <p><strong>Customer:</strong> ${answers.customerName || 'N/A'}</p>
          </div>
        </div>

        <!-- HA/DR ARCHITECTURE -->
        <div class="section-title">High Availability & Disaster Recovery Architecture</div>
        <table class="ha-dr-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>OCI Implementation</th>
              <th>RTO/RPO</th>
              <th>Cost Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Compute Redundancy</strong></td>
              <td>Multi-AD deployment with VM.Optimized.E5.Flex instances across availability domains</td>
              <td>RTO: 5-15 min | RPO: 0-5 min</td>
              <td>+25-35%</td>
            </tr>
            <tr>
              <td><strong>Storage Replication</strong></td>
              <td>OCI Block Volume cross-region replication with automated snapshots</td>
              <td>RTO: 15-30 min | RPO: 1 hour</td>
              <td>+15-20%</td>
            </tr>
            <tr>
              <td><strong>Database Mirroring</strong></td>
              <td>SQL Server Always On Availability Groups with 2-3 replicas across OCI regions</td>
              <td>RTO: 1-2 min | RPO: Near-zero</td>
              <td>+40-50%</td>
            </tr>
            <tr>
              <td><strong>Backup & Recovery</strong></td>
              <td>OCI Backup Service with cross-region backup copies and point-in-time recovery</td>
              <td>RTO: 30-60 min | RPO: 4 hours</td>
              <td>+10-15%</td>
            </tr>
            <tr>
              <td><strong>Failover Automation</strong></td>
              <td>Automated failover with OCI Monitoring and alerting</td>
              <td>RTO: 2-5 min | RPO: 0 min</td>
              <td>+5-10%</td>
            </tr>
          </tbody>
        </table>

        <!-- KEY BENEFITS -->
        <div class="section-title">Key Benefits</div>
        <ul class="benefits-list">
          ${recommendation.keyBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>

        <!-- COST CONSIDERATIONS -->
        <div class="section-title">Cost Considerations</div>
        <div class="recommendation-box">
          <p>${recommendation.costConsiderations}</p>
        </div>

        <!-- NEXT STEPS -->
        <div class="section-title">Recommended Next Steps</div>
        <ol style="font-size: 10px; padding-left: 0.15in;">
          ${recommendation.nextSteps.slice(0, 5).map(step => `<li style="margin-bottom: 3px;">${step}</li>`).join('')}
        </ol>

        <!-- DISCLAIMER & CONTACTS -->
        <div class="disclaimer-box">
          <h3>⚠️ Important Notice</h3>
          <p style="margin-bottom: 5px;">
            This assessment provides guidance based on the SQL Server 2022 Licensing Guide. Alternative solutions may exist that better suit your specific requirements. We recommend consulting with the Microsoft Accelerator team for independent technical validation.
          </p>
          <div class="contact-info">
            <strong>Microsoft Accelerator @ OCI</strong><br>
            Email: <strong>pavan.srirangam@oracle.com</strong><br>
            For licensing optimization, cost analysis, and implementation support
          </div>
          <p style="margin-top: 5px; font-size: 8px;">
            <strong>Report Validity:</strong> 90 days | <strong>Basis:</strong> SQL Server 2022 Licensing Guide (October 1, 2019 changes)
          </p>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <p>Generated: ${new Date().toLocaleString()} | Confidential - For Authorized Use Only</p>
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
