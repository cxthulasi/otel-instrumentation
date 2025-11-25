# Coralogix RUM and OpenTelemetry Full-Stack Application

This documentation provides a comprehensive guide to the architecture, implementation, and deployment of our full-stack application with Coralogix RUM SDK on the frontend and OpenTelemetry instrumentation on the backend.

## Table of Contents

- [Architecture Overview](./architecture.md)
- [Frontend Documentation](./frontend.md)
- [Backend Documentation](./backend.md)
- [Trace Correlation](./trace-correlation.md)
- [Deployment Guide](./deployment.md)

## Introduction

This project demonstrates how to implement distributed tracing across a full-stack application using:

- **Frontend**: Next.js with Coralogix RUM SDK
- **Backend**: Node.js with OpenTelemetry instrumentation

The application allows users to browse products and users, with trace context propagation from the frontend to the backend, enabling end-to-end visibility of user requests.

## Key Features

- Next.js frontend with TypeScript and Chakra UI
- Node.js backend with Express and TypeScript
- Frontend instrumented with Coralogix Browser RUM SDK
- Backend auto-instrumented with OpenTelemetry
- Trace context propagation from frontend to backend
- Real data fetched from JSONPlaceholder API
- AWS deployment configuration for both frontend and backend

## Getting Started

To get started with the project, please refer to the [Architecture Overview](./architecture.md) for a high-level understanding of the system, then proceed to the specific documentation for the [Frontend](./frontend.md) and [Backend](./backend.md) components.

For information on how to deploy the application, see the [Deployment Guide](./deployment.md).

## Visual Overview

![Architecture Overview](./images/architecture-diagram.png)

*Note: The above image is a placeholder. The actual diagram will be created and placed in the images directory.*
