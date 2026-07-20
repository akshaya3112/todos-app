# Todos — Field Notes (Frontend)

A small React UI for the serverless TODOs API (Lambda + API Gateway + DynamoDB + JWT auth).

## Setup

```bash
npm install
```

Create a `.env` file (copy `.env.example`) and set it to your deployed API's URL:

```
VITE_API_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com
```

## Run locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

Outputs a static site to `dist/` — deployable to Vercel, Netlify, or any static host.

## Demo login

Uses the same hardcoded demo user as the backend:
- username: `demo`
- password: `password123`
