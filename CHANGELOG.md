# Changelog

## [0.2.0] - 2026-04-01

### Changed
- Enabled custom domain (`duan.bio` and `www.duan.bio`) on CloudFront distribution
- Migrated from AWS Amplify hosting to S3 + CloudFront + Lambda@Edge
- ACM certificate with DNS validation for `duan.bio` and `www.duan.bio`
- Route 53 A record and CNAME pointing to CloudFront

### Verified
- Bio page, dashboard, API, and redirect all working on custom domain
- Security headers (HSTS, X-Frame-Options, X-Content-Type-Options)
- HTTP to HTTPS redirect
- Cognito PKCE auth flow end-to-end
- Mobile responsiveness at 375px, 768px, 1024px

## [0.1.0] - 2026-04-01

### Added
- CDK infrastructure: DynamoDB table (DuanLinks), S3 bucket, ACM certificate, CloudFront distribution
- API Gateway with Cognito authorizer for link management
- Lambda functions for CRUD operations (links.mjs) and stats (stats.mjs)
- Lambda@Edge for short code redirect with click tracking
- React dashboard with glassmorphism design matching duan.bio brand
- Dashboard page with link cards, search, edit, and delete
- Create Link page with live QR code preview
- Stats page with charts and performance table
- Cognito PKCE auth flow
- Bio page login icon linking to /dashboard
- Route 53 DNS records for duan.bio and www.duan.bio
- CloudFront behaviors for bio page, dashboard SPA, API, and redirect
- CloudWatch alarms for Lambda errors
- Security headers (HSTS, X-Content-Type-Options, X-Frame-Options)
