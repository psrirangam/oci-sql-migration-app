# OCI SQL Server Migration Questionnaire App - Deployment Guide

## Overview

This is a professional web-based assessment tool that guides customers through a structured questionnaire based on the SQL Server 2022 Licensing Guide. The app provides personalized OCI recommendation paths for SQL Server migration.

## Features

- **Interactive Questionnaire**: 10 progressive questions covering SQL Server editions, licensing models, virtualization, Software Assurance benefits, HA/DR requirements, and migration approaches
- **Intelligent Recommendations**: Personalized OCI deployment recommendations based on user answers
- **Licensing-Aware**: Incorporates key insights from the SQL Server 2022 Licensing Guide, including passive failover rights, License Mobility, and Software Assurance benefits
- **Professional UI**: Enterprise-grade interface with Oracle branding and responsive design
- **No Backend Required**: Fully static frontend application

## Deployment Options

### Option 1: OCI Object Storage (Recommended for Internal Tools)

#### Prerequisites
- OCI Account with Object Storage access
- OCI CLI configured locally
- Bucket created in OCI Object Storage

#### Steps

1. **Build the Application**
   ```bash
   cd /home/ubuntu/oci-sql-migration-app
   pnpm build
   ```

2. **Create OCI Object Storage Bucket**
   ```bash
   oci os bucket create --compartment-id <COMPARTMENT_ID> --name sql-migration-app
   ```

3. **Upload Built Files to OCI Object Storage**
   ```bash
   # Upload the dist/public directory contents
   oci os object bulk-upload --bucket-name sql-migration-app --src-dir dist/public
   ```

4. **Configure Bucket for Web Hosting**
   ```bash
   # Make bucket public (if desired for internal access)
   oci os bucket update --bucket-name sql-migration-app --public-access-type ObjectRead
   ```

5. **Access the Application**
   - Navigate to: `https://<namespace>.objectstorage.<region>.oraclecloud.com/n/<namespace>/b/sql-migration-app/o/index.html`
   - Or configure a custom domain with OCI CDN

#### Enable CORS (if needed for API calls)
```bash
oci os bucket cors-rules put --bucket-name sql-migration-app --cors-rules '[{
  "allowedHeaders": ["*"],
  "allowedMethods": ["GET", "HEAD", "POST", "PUT", "DELETE"],
  "allowedOrigins": ["*"],
  "exposeHeaders": ["*"],
  "maxAgeSeconds": 3000
}]'
```

### Option 2: OCI Compute Instance

1. **Build the Application**
   ```bash
   pnpm build
   ```

2. **Deploy to OCI Compute**
   ```bash
   # Copy files to compute instance
   scp -r dist/public/* ubuntu@<COMPUTE_IP>:/var/www/html/
   ```

3. **Configure Web Server (nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Option 3: OCI Container Registry + OCI Container Instances

1. **Build Docker Image**
   ```dockerfile
   FROM node:22-alpine
   WORKDIR /app
   COPY . .
   RUN pnpm install && pnpm build
   EXPOSE 3000
   CMD ["pnpm", "start"]
   ```

2. **Push to OCI Container Registry**
   ```bash
   docker build -t sql-migration-app .
   docker tag sql-migration-app <region>.ocir.io/<namespace>/sql-migration-app:latest
   docker push <region>.ocir.io/<namespace>/sql-migration-app:latest
   ```

3. **Deploy to OCI Container Instances**
   - Use OCI Console to create container instance from the image
   - Configure networking and security groups

## Building the Application

### Development Build
```bash
cd /home/ubuntu/oci-sql-migration-app
pnpm install
pnpm dev
```

### Production Build
```bash
pnpm build
```

The built files will be in the `dist/public` directory.

## Project Structure

```
client/
  src/
    pages/
      Home.tsx           # Main page with questionnaire flow
    components/
      Header.tsx         # App header with branding
      QuestionnaireView.tsx  # Question display and navigation
      RecommendationView.tsx # Results and recommendations
      ui/                # shadcn/ui components
    hooks/
      useAssessment.ts   # Assessment state management
    contexts/
      AssessmentContext.tsx  # Global assessment context
    lib/
      assessmentLogic.ts # Recommendation engine
    index.css            # Global styles with Oracle branding
  index.html
  public/
    favicon.ico

server/
  index.ts              # Express server (for local development)
```

## Questionnaire Flow

The app guides users through 10 questions across these categories:

1. **SQL Server Configuration**
   - Edition selection (Enterprise, Standard, Web, Developer, Express)

2. **Licensing Model**
   - Per Core vs. Server + CAL

3. **Deployment**
   - Virtualization preferences
   - vCPU allocation (conditional)
   - VMs per host (conditional)

4. **Licensing Benefits**
   - Software Assurance status
   - License Mobility interest (conditional)
   - HA/DR benefits interest (conditional)

5. **High Availability & Disaster Recovery**
   - HA/DR requirements (No HA/DR, Basic HA, Advanced HA, Disaster Recovery)

6. **Migration Strategy**
   - Migration approach (Lift and Shift, Re-platform, Re-factor)

## Recommendation Engine

The recommendation engine analyzes user answers and provides:

- **Deployment Model**: Bare Metal, VM.Standard.E4.Flex, VM.Optimized3.Flex
- **Licensing Option**: BYOL with License Mobility, BYOL with SA, License Included
- **Architecture**: Single instance, Failover Cluster (recommended for Standard Edition), Failover Cluster with multi-region replication (cost-effective DR)
- **Cost Considerations**: High-level cost implications
- **Key Benefits**: Specific advantages of the recommended path
- **Next Steps**: Actionable implementation steps

## Licensing Guide Integration

The questionnaire incorporates key insights from the SQL Server 2022 Licensing Guide:

- **Failover Clustering**: Cost-effective high availability for SQL Server Standard Edition without additional licensing requirements
- **License Mobility**: Allows reassignment of licenses within server farm more than once every 90 days
- **Flexible Virtualization Benefit**: Enables deployment on shared OCI infrastructure
- **Unlimited Virtualization**: Enterprise Edition with SA supports unlimited VMs on licensed physical cores
- **Core Counting**: Minimum 4 cores per VM, all physical cores must be counted for licensing

## Customization

### Adding New Questions

1. Edit `client/src/lib/assessmentLogic.ts`
2. Add question object to the `QUESTIONS` array
3. Update `AssessmentAnswers` interface
4. Update `generateRecommendation()` function to handle new logic

### Updating Recommendations

1. Modify the logic in `generateRecommendation()` function
2. Update recommendation templates in `RecommendationView.tsx`
3. Test with different answer combinations

### Branding

- Update colors in `client/src/index.css` (Oracle Red: #FF6B35, Oracle Blue: #0051BA)
- Modify header in `client/src/components/Header.tsx`
- Update logo/favicon in `client/public/`

## Performance Considerations

- **Bundle Size**: ~150KB gzipped (React + shadcn/ui components)
- **Load Time**: <2 seconds on typical broadband
- **Storage**: ~500KB uncompressed
- **No External API Calls**: All logic runs client-side

## Security Considerations

- No sensitive data is stored or transmitted
- All assessment data remains on the user's browser
- No authentication required (suitable for internal tools)
- Static files only - no server-side processing

## Support and Maintenance

### Updating SQL Server Licensing Information

When Microsoft releases updated licensing guidance:

1. Review the latest SQL Server Licensing Guide
2. Update question options in `assessmentLogic.ts`
3. Revise recommendation logic in `generateRecommendation()`
4. Test all question paths
5. Redeploy to OCI Object Storage

### Monitoring

For OCI Object Storage deployment:
- Monitor access logs via OCI Console
- Track usage metrics in OCI Monitoring
- Set up alerts for unusual access patterns

## Troubleshooting

### App Not Loading
- Verify CORS configuration if accessing from different domain
- Check browser console for errors
- Ensure all files uploaded to Object Storage

### Questions Not Displaying
- Clear browser cache
- Verify `assessmentLogic.ts` has no syntax errors
- Check that conditional logic is correct

### Recommendations Not Generating
- Check browser console for JavaScript errors
- Verify all required questions have answers
- Review recommendation logic in `assessmentLogic.ts`

## Contact & Support

For questions about:
- **OCI Deployment**: Contact OCI Sales or Support
- **SQL Server Licensing**: Consult Microsoft licensing representative
- **App Development**: Review code comments and documentation

## License

This tool is provided as-is for internal use within your organization.

## References

- [SQL Server 2022 Licensing Guide](https://download.microsoft.com/download/9/3/d/93d32de6-f268-45ed-ba25-2f9a6756b6af/SQL_Server_2022_Licensing_guide.pdf)
- [Microsoft Licensing on Oracle Cloud Infrastructure](https://docs.oracle.com/en-us/iaas/Content/Compute/References/microsoftlicensing.htm)
- [OCI Object Storage Documentation](https://docs.oracle.com/en-us/iaas/Content/Object/home.htm)
- [OCI Compute Shapes](https://docs.oracle.com/en-us/iaas/Content/Compute/References/computeshapes.htm)
