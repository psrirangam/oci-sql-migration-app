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
      <title>OCI SQL Server Migration Assessment Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
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
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
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
        }
        .info-box value {
          color: #333;
          display: block;
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
        }
        .steps-list li {
          padding: 8px 0;
          color: #333;
        }
        .footer {
          border-top: 2px solid #ddd;
          padding-top: 20px;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        .complexity-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: bold;
          margin: 10px 0;
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
          <p><strong>Customer:</strong> ${answers.customerName || 'N/A'}</p>
          <p><strong>Email:</strong> ${answers.customerEmail || 'N/A'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
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

        <!-- Footer -->
        <div class="footer">
          <p><strong>Disclaimer:</strong> This assessment is based on the SQL Server 2022 Licensing Guide and provides general guidance. For specific licensing decisions, please consult with your Microsoft licensing representative or Oracle Cloud sales team.</p>
          <p><strong>Contact:</strong> For implementation support and licensing optimization, contact your Oracle sales representative or the SQL Server licensing partner at Pavan.srirangam@oracle.com</p>
          <p>Report generated on ${new Date().toLocaleString()}</p>
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
