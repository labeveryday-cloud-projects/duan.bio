# duan.bio — Personal Link Shortener

A personal link shortener for Du'An Lightfoot at `duan.bio`. Create branded short links, generate QR codes, and track clicks.

## Architecture

```
duan.bio/                → Bio page (static HTML from S3)
duan.bio/dashboard       → React SPA (Cognito auth required)
duan.bio/api/*           → API Gateway → Lambda (CRUD + stats)
duan.bio/{short-code}    → Lambda@Edge → DynamoDB → 301 redirect
```

CloudFront sits in front of everything with path-based routing. Lambda@Edge handles short code lookups on the default behavior's origin-request.

## Prerequisites

- Node.js 20+
- AWS CLI configured with credentials
- AWS CDK CLI (`npm install -g aws-cdk`)
- AWS account in `us-east-1`

## Quick Start

```bash
# Install dependencies
cd backend && npm install && cd ..
cd backend/redirect && npm install && cd ../..
cd frontend && npm install && cd ..
cd infra && npm install && cd ..

# Build frontend
cd frontend && npm run build && cd ..

# Deploy
cd infra && cdk deploy --all
```

## How to Update the Bio Page

Edit files in `bio/` directory (`index.html`, `styles.css`, `app.js`), then:

```bash
cd infra && cdk deploy DuanLinksHostingStack
```

## How to Update the Dashboard Frontend

Edit files in `frontend/src/`, then:

```bash
cd frontend && npm run build
cd ../infra && cdk deploy DuanLinksHostingStack
```

## How to Update Backend Lambda Code

Edit files in `backend/`, then:

```bash
cd infra && cdk deploy DuanLinksStack
```

## How to Add/Modify Infrastructure

Edit CDK stacks in `infra/lib/`, then:

```bash
cd infra && cdk diff    # Preview changes
cdk deploy              # Apply changes
```

## Environment & Config

| Resource | Value |
|----------|-------|
| Cognito Pool | Set via `VITE_COGNITO_POOL_ID` env var |
| Cognito Client | Set via `VITE_COGNITO_CLIENT_ID` env var |
| Cognito Domain | Set via `VITE_COGNITO_DOMAIN` env var |
| Route 53 Zone | Set via `HOSTED_ZONE_ID` env var |
| Region | `us-east-1` |
| DynamoDB Table | `DuanLinks` |

## Testing

Verify the deployment:

```bash
# Bio page loads
curl -sI https://duan.bio | head -5

# Dashboard SPA loads
curl -sI https://duan.bio/dashboard | head -5

# API requires auth
curl -s https://duan.bio/api/links
# → {"message":"Unauthorized"}

# Non-existent short codes serve bio page
curl -sI https://duan.bio/nonexistent-code | head -5
# → 200 (bio page)

# Security headers present
curl -sI https://duan.bio | grep -iE '(strict-transport|x-frame|x-content-type)'

# HTTPS redirect
curl -sI http://duan.bio | head -3
# → 301 Moved Permanently
```

## Troubleshooting

- **CloudFront cache**: After deploying, changes may take a few minutes to propagate. CDK automatically invalidates paths on deployment.
- **Lambda@Edge deploy delay**: Lambda@Edge replicas take 5-15 minutes to propagate globally.
- **CORS errors**: API Gateway is locked to `https://duan.bio` origin only.
- **Auth issues**: Ensure callback URL `https://duan.bio/dashboard` is in the Cognito app client settings.
