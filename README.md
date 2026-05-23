# Stock Manager (Enterprise)

This workspace contains the Stock Manager web application: a full-stack, enterprise-ready system for Indian stock management, analysis, alerts, and reporting.

See [ARCHITECTURE.md](ARCHITECTURE.md) for high-level design and components.

## Included features
- Email-based sign up and sign in
- Google OAuth integration hook on the backend
- Watchlist CRUD with export/import
- Portfolio CRUD with export/import
- Alert creation and evaluation
- Report generation and delivery queue
- Charts for day/month/six-month/year analytics
- Docker Compose and Kubernetes manifests for deployment

## Run locally

### Backend

```bash
cd stock-manager-backend
npm install
npm run dev
```

### AI service

```bash
cd stock-manager-ai
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd stock-manager-frontend
npm install
npm run dev
```

### Docker Compose

```bash
docker compose up --build
```

### Kubernetes

Apply the manifests in `k8s/`:

```bash
kubectl apply -f k8s/
```
