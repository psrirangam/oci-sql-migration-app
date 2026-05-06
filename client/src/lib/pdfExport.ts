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
  // Create HTML content for PDF with professional corporate colors and larger fonts
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
          line-height: 1.6;
          color: #2c3e50;
          background-color: #fff;
        }
        .container {
          max-width: 8.5in;
          height: 11in;
          margin: 0 auto;
          padding: 0.5in;
          background-color: white;
        }
        .header {
          background: linear-gradient(135deg, #003366 0%, #004d99 100%);
          color: white;
          padding: 0.3in;
          margin-bottom: 0.25in;
          border-radius: 4px;
        }
        .header h1 {
          font-size: 22px;
          margin-bottom: 5px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .header-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          opacity: 0.95;
          font-weight: 500;
        }
        .customer-section {
          background-color: #f8f9fa;
          border-left: 5px solid #FF6600;
          padding: 0.15in;
          margin-bottom: 0.2in;
          font-size: 13px;
        }
        .customer-name {
          font-size: 16px;
          font-weight: 800;
          color: #003366;
          margin-bottom: 5px;
        }
        .customer-details {
          color: #555;
          font-size: 11px;
          line-height: 1.5;
          font-weight: 500;
        }
        .section-header {
          background-color: #003366;
          color: white;
          padding: 0.1in 0.12in;
          margin-top: 0.15in;
          margin-bottom: 0.1in;
          font-size: 13px;
          font-weight: 800;
          border-radius: 3px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.12in;
          margin-bottom: 0.15in;
          font-size: 11px;
        }
        .info-box {
          background-color: #f0f4f8;
          padding: 0.1in;
          border-left: 4px solid #FF6600;
        }
        .info-label {
          font-weight: 800;
          color: #003366;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 3px;
        }
        .info-value {
          color: #2c3e50;
          font-size: 11px;
          font-weight: 600;
        }
        .option-box {
          background-color: #f8f9fa;
          border-left: 4px solid #FF6600;
          padding: 0.1in;
          margin-bottom: 0.1in;
          font-size: 11px;
        }
        .option-title {
          font-weight: 800;
          color: #003366;
          font-size: 12px;
          margin-bottom: 3px;
        }
        .option-desc {
          color: #555;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 500;
        }
        .benefits-list {
          list-style: none;
          font-size: 11px;
          margin-bottom: 0.12in;
          font-weight: 500;
        }
        .benefits-list li {
          padding: 3px 0 3px 18px;
          position: relative;
          color: #2c3e50;
        }
        .benefits-list li:before {
          content: "▸";
          position: absolute;
          left: 0;
          color: #FF6600;
          font-weight: bold;
          font-size: 14px;
        }
        .complexity-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-weight: 800;
          font-size: 10px;
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
          border-top: 2px solid #ddd;
          padding-top: 0.1in;
          margin-top: 0.12in;
          font-size: 10px;
          color: #666;
          line-height: 1.4;
          font-weight: 500;
        }
        .contact-box {
          background-color: #e3f2fd;
          border-left: 4px solid #2196F3;
          padding: 0.1in;
          font-size: 10px;
          margin-top: 0.1in;
          font-weight: 500;
        }
        .contact-label {
          font-weight: 800;
          color: #1565c0;
          font-size: 11px;
        }
        .disclaimer {
          background-color: #fff8e1;
          border: 2px solid #FFB300;
          padding: 0.1in;
          margin-top: 0.1in;
          font-size: 10px;
          font-weight: 500;
          line-height: 1.4;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.1in 0;
          font-size: 10px;
        }
        th {
          background-color: #003366;
          color: white;
          padding: 6px;
          text-align: left;
          font-weight: 800;
          border: 1px solid #003366;
        }
        td {
          padding: 6px;
          border: 1px solid #ddd;
          font-weight: 500;
        }
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Page 1: Header & Summary -->
        <div class="header">
          <h1>OCI SQL Server Migration Assessment</h1>
          <div class="header-meta">
            <span>Assessment ID: ${Date.now()}</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div class="customer-section">
          <div class="customer-name">${answers.customerName}</div>
          <div class="customer-details">
            <strong>Email:</strong> ${answers.customerEmail}<br>
            <strong>SQL Server Instances:</strong> ${answers.numInstances}<br>
            <strong>Assessment Complexity:</strong> <span class="complexity-badge complexity-${result.estimatedComplexity.toLowerCase()}">${result.estimatedComplexity}</span>
          </div>
        </div>

        <div class="section-header">Current State Assessment</div>
        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">Current Version</div>
            <div class="info-value">${answers.currentVersion || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Current Edition</div>
            <div class="info-value">${answers.currentEdition || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Current Deployment</div>
            <div class="info-value">${answers.currentDeployment || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Target Edition</div>
            <div class="info-value">${answers.targetEdition || 'N/A'}</div>
          </div>
        </div>

        <div class="section-header">Recommended OCI Deployment Path</div>
        <div class="option-box">
          <div class="option-title">${recommendation.deploymentModel}</div>
          <div class="option-desc">${recommendation.licensingOption}</div>
        </div>

        <div class="section-header">Licensing Options</div>
        ${recommendation.licensingDetails.split('\n').map(line => 
          line.trim() ? `<div class="option-box"><div class="option-desc">${line}</div></div>` : ''
        ).join('')}

        <div class="page-break"></div>

        <!-- Page 2: Details & Recommendations -->
        <div class="section-header">Architecture & Implementation</div>
        <div class="option-box">
          <div class="option-desc">${recommendation.architecture}</div>
        </div>

        <div class="section-header">Key Benefits</div>
        <ul class="benefits-list">
          ${recommendation.keyBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>

        <div class="section-header">Next Steps</div>
        <ul class="benefits-list">
          ${recommendation.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>

        <div class="contact-box">
          <div class="contact-label">Microsoft Accelerator @ OCI</div>
          <div style="font-size: 11px; font-weight: 600; margin-top: 3px;">Contact: Pavan.srirangam@oracle.com</div>
          <div style="font-size: 10px; margin-top: 3px;">For licensing optimization, cost analysis, and migration planning support</div>
        </div>

        <div class="disclaimer">
          <strong style="font-size: 11px;">Important Disclaimer:</strong><br>
          This assessment provides recommendations based on the information provided. Alternative solutions may exist beyond these recommendations. Please reach out to the Microsoft Accelerator @ OCI team for more informed decisions and to explore all available options for your specific requirements.
        </div>

        <div class="footer">
          <strong>Confidential - For Internal Use Only</strong><br>
          This assessment is confidential and intended for authorized Oracle personnel only. © Oracle Corporation 2026.<br><br>
          <strong>Designed and Built by:</strong> Pavan Srirangam (pavan.srirangam@oracle.com)<br>
          For feature requests or to report issues, please contact: pavan.srirangam@oracle.com
        </div>
      </div>
    </body>
    </html>
  `;

  // Convert HTML to PDF using print functionality
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}
