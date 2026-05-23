# Stock Manager - Architecture Overview

## Goals
- Enterprise-grade, extensible, and cloud-native stock management and analysis platform for Indian markets.
- Modular microservices: API, AI analysis, notifications, and frontend.
- Secure auth (email + Google OAuth), role-based access, and reliable data storage.
- Scalable hosting on Kubernetes with Docker images and CI/CD.

## High-level Components
- Frontend: React + TypeScript (Vite) SPA for dashboards, charts, watchlists, portfolios, and reports.
- Backend API: Node.js + TypeScript (Express or NestJS) providing REST/GraphQL endpoints, business logic, and integration with services.
- Database: PostgreSQL for relational data (users, portfolios, watchlists, notifications, audit logs).
- AI Analysis Service: Python FastAPI service for model-based stock analysis and report generation (models served via TensorFlow/PyTorch or external model endpoints).
- Notifications Service: Node worker (BullMQ) or Python Celery to deliver emails, WhatsApp, SMS, and webhook channels.
- Message broker: Redis for job queues and caching.
- Object storage: S3-compatible storage for exports, reports, and large assets.

## Data Model (core concepts)
- User: authentication, preferences, notification channels.
- Stock: symbol, exchange, metadata, historical price series.
- Watchlist: user-owned list of stock symbols.
- Portfolio: positions, transactions, valuations, multiple portfolios per user.
- Alert: thresholds, channels, recurrence, linked to stock/watchlist/portfolio.

## Tech Choices & Rationale
- Node.js + TypeScript for API: wide adoption, rich ecosystem, and easy integration with frontend.
- PostgreSQL: ACID, advanced queries, JSONB for flexible fields.
- Python FastAPI for AI: better ecosystem for ML libraries and model experimentation.
- Redis: caching and job queue backend.
- React + TypeScript: interactive UI and charting ecosystem (Recharts, Chart.js, or ApexCharts).
- Kubernetes + Helm: for production deployment, autoscaling, and observability.

## Integration Points
- OAuth2 (Google) + email-based auth (password + verification) via backend auth service.
- Notification adapters: SMTP, Twilio/WhatsApp API, and third-party webhook connectors.
- ML models exposed via REST/gRPC from the AI service; scheduled tasks generate daily reports.

## Next Steps
1. Scaffold backend API with user, stock, watchlist, portfolio models and auth.
2. Scaffold frontend SPA with login/signup and dashboard skeleton.
3. Create AI analysis service skeleton and notification worker.
4. Add Dockerfiles, k8s manifests, and CI templates.
