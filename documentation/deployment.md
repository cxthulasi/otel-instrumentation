# Deployment Guide

This document provides instructions for deploying the frontend and backend components of our application to AWS.

## Prerequisites

- AWS CLI installed and configured with appropriate credentials
- Node.js (v16 or later)
- npm or yarn
- Serverless Framework CLI installed globally (`npm install -g serverless`)

## Infrastructure Overview

The application is deployed using the following AWS services:

- **Frontend**: Static website hosted on AWS S3
- **Backend**: Serverless function deployed on AWS Lambda with API Gateway

```
┌─────────────────┐                ┌─────────────────┐
│                 │                │                 │
│    AWS S3       │◄──────────────►│  API Gateway    │
│  Static Website │    HTTP/REST   │                 │
│                 │                │                 │
└─────────────────┘                └────────┬────────┘
                                            │
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │                 │
                                   │   AWS Lambda    │
                                   │                 │
                                   │                 │
                                   └─────────────────┘
```

## Deployment Configuration

### Backend Deployment (Serverless Framework)

The backend is deployed using the Serverless Framework with the following configuration (`infrastructure/backend/serverless.yml`):

```yaml
service: cx-rum-backend

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  stage: ${opt:stage, 'dev'}
  profile: default
  region: 'ap-south-1'
  environment:
    NODE_ENV: ${self:provider.stage}
    OTEL_EXPORTER_OTLP_ENDPOINT: ${param:otelEndpoint, 'https://ingress.coralogix.in:443/v1/traces'}
    CORALOGIX_PRIVATE_KEY: ${param:coralogixPrivateKey, ''}
    SERVICE_NAME: cx-rum-backend-${self:provider.stage}
    SERVICE_VERSION: '1.0.0'
  apiGateway:
    minimumCompressionSize: 1024
  httpApi:
    cors: true

functions:
  api:
    handler: dist/lambda.handler
    package:
      patterns:
        - 'dist/**'
    events:
      - httpApi:
          path: /api/{proxy+}
          method: any
    environment:
      STAGE: ${self:provider.stage}
```

### Frontend Deployment (S3 Static Website)

The frontend is deployed as a static website on AWS S3 using the Serverless Framework with the following configuration (`infrastructure/frontend/serverless.yml`):

```yaml
service: cx-rum-frontend

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  stage: ${opt:stage, 'dev'}
  region: 'ap-south-1'
  profile: default

custom:
  s3Bucket: cx-rum-frontend-${self:provider.stage}
  client:
    bucketName: ${self:custom.s3Bucket}
    distributionFolder: ../../frontend/out
    indexDocument: index.html
    errorDocument: 404.html

resources:
  Resources:
    StaticSite:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${self:custom.s3Bucket}
        AccessControl: PublicRead
        WebsiteConfiguration:
          IndexDocument: index.html
          ErrorDocument: 404.html
    
    StaticSiteS3BucketPolicy:
      Type: AWS::S3::BucketPolicy
      Properties:
        Bucket:
          Ref: StaticSite
        PolicyDocument:
          Statement:
            - Sid: PublicReadGetObject
              Effect: Allow
              Principal: "*"
              Action:
                - s3:GetObject
              Resource: arn:aws:s3:::${self:custom.s3Bucket}/*
```

## Deployment Steps

### Backend Deployment

1. Navigate to the backend deployment directory:
   ```bash
   cd infrastructure/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

4. Deploy to AWS:
   ```bash
   npm run deploy
   ```

   For production:
   ```bash
   npm run deploy:prod
   ```

### Frontend Deployment

1. Navigate to the frontend deployment directory:
   ```bash
   cd infrastructure/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build and export the Next.js application:
   ```bash
   npm run build
   ```

4. Deploy to AWS:
   ```bash
   npm run deploy
   ```

   For production:
   ```bash
   npm run deploy:prod
   ```

### Automated Deployment Script

For convenience, a deployment script is provided to deploy both the frontend and backend in one step:

```bash
#!/bin/bash

# Exit on error
set -e

# Get the stage from command line arguments or use 'dev' as default
STAGE=${1:-dev}

echo "Deploying to stage: $STAGE"

# Deploy backend
echo "Deploying backend..."
cd backend
npm install
npm run build
npm run deploy -- --stage $STAGE

# Get the API URL from the backend deployment
API_URL=$(serverless info --stage $STAGE | grep -o 'https://[^[:space:]]*')
echo "Backend API URL: $API_URL"

# Update frontend environment with the API URL
cd ../frontend
echo "Updating frontend environment..."
node update-env.js $API_URL $STAGE

# Deploy frontend
echo "Deploying frontend..."
npm install
npm run build
npm run deploy -- --stage $STAGE

echo "Deployment completed successfully!"
```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=3001

# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.coralogix.in:443/v1/traces
CORALOGIX_PRIVATE_KEY=your-coralogix-private-key

# Service Information
SERVICE_NAME=cx-rum-backend
SERVICE_VERSION=1.0.0
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Coralogix RUM Configuration
NEXT_PUBLIC_CORALOGIX_KEY=your-coralogix-public-key
NEXT_PUBLIC_CORALOGIX_APPLICATION_NAME=cx-rum-fullstack-ts
NEXT_PUBLIC_CORALOGIX_DOMAIN=AP1
NEXT_PUBLIC_APP_VERSION=1.0.0
```

For production, a `.env.production` file is automatically created during deployment with the correct API URL.

## Cleanup

To remove the deployed resources:

```bash
# Remove backend
cd infrastructure/backend
npm run remove

# Remove frontend
cd infrastructure/frontend
npm run remove
```

## Next Steps

- [Frontend Documentation](./frontend.md)
- [Backend Documentation](./backend.md)
- [Trace Correlation](./trace-correlation.md)
