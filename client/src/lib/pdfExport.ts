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
  // Create HTML content for PDF with professional corporate colors
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
          line-height: 1.5;
          color: #2c3e50;
          background-color: #fff;
        }
        .container {
          max-width: 8.5in;
          height: 11in;
          margin: 0 auto;
          padding: 0.4in;
          background-color: white;
        }
        .header {
          background: linear-gradient(135deg, #003366 0%, #004d99 100%);
          color: white;
          padding: 0.25in;
          margin-bottom: 0.2in;
          border-radius: 4px;
        }
        .header h1 {
          font-size: 18px;
          margin-bottom: 3px;
          font-weight: 700;
        }
        .header-meta {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          opacity: 0.9;
        }
        .customer-section {
          background-color: #f8f9fa;
          border-left: 4px solid #FF6600;
          padding: 0.12in;
          margin-bottom: 0.15in;
          font-size: 11px;
        }
        .customer-name {
          font-size: 13px;
          font-weight: 700;
          color: #003366;
          margin-bottom: 3px;
        }
        .customer-details {
          color: #555;
          font-size: 9px;
          line-height: 1.4;
        }
        .section-header {
          background-color: #003366;
          color: white;
          padding: 0.08in 0.1in;
          margin-top: 0.12in;
          margin-bottom: 0.08in;
          font-size: 11px;
          font-weight: 700;
          border-radius: 2px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.1in;
          margin-bottom: 0.12in;
          font-size: 9px;
        }
        .info-box {
          background-color: #f0f4f8;
          padding: 0.08in;
          border-left: 3px solid #FF6600;
        }
        .info-label {
          font-weight: 700;
          color: #003366;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .info-value {
          color: #2c3e50;
          font-size: 9px;
        }
        .option-box {
          background-color: #f8f9fa;
          border-left: 3px solid #FF6600;
          padding: 0.08in;
          margin-bottom: 0.08in;
          font-size: 9px;
        }
        .option-title {
          font-weight: 700;
          color: #003366;
          font-size: 9px;
          margin-bottom: 2px;
        }
        .option-desc {
          color: #555;
          font-size: 8px;
          line-height: 1.3;
        }
        .benefits-list {
          list-style: none;
          font-size: 9px;
          margin-bottom: 0.1in;
        }
        .benefits-list li {
          padding: 2px 0 2px 15px;
          position: relative;
          color: #2c3e50;
        }
        .benefits-list li:before {
          content: "▸";
          position: absolute;
          left: 0;
          color: #FF6600;
          font-weight: bold;
        }
        .complexity-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 700;
          font-size: 8px;
          text-transform: uppercase;
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
        .footer {
          border-top: 1px solid #ddd;
          padding-top: 0.08in;
          margin-top: 0.1in;
          font-size: 8px;
          color: #666;
          line-height: 1.3;
        }
        .contact-box {
          background-color: #e3f2fd;
          border-left: 3px solid #2196F3;
          padding: 0.08in;
          font-size: 8px;
          margin-top: 0.08in;
        }
        .contact-label {
          font-weight: 700;
          color: #1565c0;
        }
        .disclaimer {
          background-color: #fff8e1;
          border: 1px solid #FFB300;
          padding: 0.08in;
          margin-top: 0.08in;
          font-size: 8px;
          line-height: 1.3;
          color: #5d4037;
        }
        .disclaimer-title {
          font-weight: 700;
          color: #d84315;
          margin-bottom: 2px;
        }
        .compact-text {
          font-size: 8px;
          line-height: 1.3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- PAGE 1 -->
        
        <!-- HEADER -->
        <div class="header">
          <h1>SQL Server Migration Assessment</h1>
          <div class="header-meta">
            <span>Date: ${new Date().toLocaleDateString()}</span>
            <span>ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
        </div>

        <!-- CUSTOMER INFO -->
        <div class="customer-section">
          <div class="customer-name">${answers.customerName || 'N/A'}</div>
          <div class="customer-details">
            <strong>Email:</strong> ${answers.customerEmail || 'N/A'}<br>
            <strong>Instances to Migrate:</strong> ${answers.numInstances || 'N/A'}<br>
            <strong>Complexity:</strong> <span class="complexity-badge complexity-${result.estimatedComplexity.toLowerCase()}">
              ${result.estimatedComplexity}
            </span>
          </div>
        </div>

        <!-- EXECUTIVE SUMMARY -->
        <div class="section-header">Executive Summary</div>
        <div class="compact-text" style="margin-bottom: 0.1in; color: #555;">
          ${result.summary.split('\n').slice(0, 2).join('<br>')}
        </div>

        <!-- CURRENT & TARGET STATE -->
        <div class="section-header">Assessment Details</div>
        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">Current Version</div>
            <div class="info-value">${answers.currentlyRunning === 'yes' ? 'SQL Server ' + (answers.currentVersion || 'N/A') : 'New Deployment'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Target Version</div>
            <div class="info-value">SQL Server ${answers.targetVersion || '2022'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Current Edition</div>
            <div class="info-value">${answers.currentEdition || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Target Edition</div>
            <div class="info-value">${answers.targetEdition || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Deployment</div>
            <div class="info-value">${answers.currentDeployment || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">HA/DR Strategy</div>
            <div class="info-value">${answers.hadrRequirements || 'Standard'}</div>
          </div>
        </div>

        <!-- RECOMMENDED INSTANCES -->
        <div class="section-header">Recommended OCI Instance Types</div>
        <div class="compact-text" style="margin-bottom: 0.1in;">
          ${recommendation.recommendedInstances?.map(instance => `<div>• ${instance}</div>`).join('')}
        </div>

        <!-- LICENSING OPTIONS -->
        <div class="section-header">Licensing Options</div>
        <div style="font-size: 9px;">
          ${recommendation.licensingDetails.split('\n\n').map((paragraph, idx) => {
            if (paragraph.includes('**Option') || paragraph.includes('**Path')) {
              const lines = paragraph.split('\n');
              const title = lines[0].replace(/\*\*/g, '');
              const desc = lines.slice(1).join(' ').replace(/\*\*/g, '').replace(/- /g, '• ');
              return `
                <div class="option-box">
                  <div class="option-title">${title}</div>
                  <div class="option-desc">${desc}</div>
                </div>
              `;
            }
            return `<div class="compact-text" style="margin-bottom: 0.05in;">${paragraph.replace(/\*\*/g, '')}</div>`;
          }).join('')}
        </div>

        <!-- PAGE BREAK -->
        <div class="page-break"></div>

        <!-- PAGE 2 -->
        
        <div class="header" style="margin-bottom: 0.15in;">
          <h1>Assessment Details (Continued)</h1>
          <div class="header-meta">
            <span>${answers.customerName || 'N/A'}</span>
          </div>
        </div>

        <!-- KEY BENEFITS -->
        <div class="section-header">Key Benefits</div>
        <ul class="benefits-list">
          ${recommendation.keyBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>

        <!-- COST CONSIDERATIONS -->
        <div class="section-header">Cost Considerations</div>
        <div class="compact-text" style="margin-bottom: 0.1in;">
          ${recommendation.costConsiderations}
        </div>

        <!-- NEXT STEPS -->
        <div class="section-header">Next Steps</div>
        <ul class="benefits-list">
          ${recommendation.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>

        <!-- FOOTER -->
        <div class="footer">
          <div class="contact-box">
            <span class="contact-label">Microsoft Accelerator @ OCI:</span><br>
            Pavan.srirangam@oracle.com
          </div>
          <div class="disclaimer">
            <div class="disclaimer-title">DISCLAIMER</div>
            <p>This assessment provides recommendations based on the information provided. Alternative solutions may exist. For more informed decision-making and licensing optimization, please contact the Microsoft Accelerator @ OCI team. This report is confidential and intended for internal use only.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Use html2pdf or similar library to generate PDF
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  
  // For now, we'll use a simpler approach - open in new window for printing
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

export function isValidOracleEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@oracle.com');
}
