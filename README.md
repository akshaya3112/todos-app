# Todos App — Serverless Backend + React Frontend

A full-stack serverless TODO application built as part of the **Cloud Computing With AWS** training (Gokboru Tech Pvt. Ltd) — *"Make a Serverless backend for a TODOs App using Lambda"*.

**Live demo:** https://todos-app-two-nu.vercel.app

---

## Architecture

```
                 ┌──────────────┐
   Browser  ───▶ │  React (SPA)  │   Vercel
                 └──────┬───────┘
                        │ HTTPS
                        ▼
                ┌───────────────┐
                │  API Gateway   │  (HTTP API)
                │  (CORS enabled)│
                └───────┬────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
   ┌────────────┐ ┌──────────┐ ┌─────────────┐
   │   /login    │ │Lambda    │ │ /todos/*    │
   │  (Lambda)   │ │Authorizer│ │(5 Lambdas:  │
   │ issues JWT  │ │validates │ │create/list/ │
   └─────────────┘ │  JWT     │ │get/update/  │
                    └──────────┘ │delete)      │
                                  └──────┬──────┘
                                         ▼
                                  ┌─────────────┐
                                  │  DynamoDB    │
                                  │  (todos      │
                                  │   table)     │
                                  └─────────────┘
```

The whole backend is deployed via **AWS SAM** (Infrastructure as Code) — every resource (Lambdas, API Gateway routes, DynamoDB table, IAM roles) is declared in `todos-sam/template.yaml` and deployed as a single CloudFormation stack.

---

## What this project demonstrates

- **Serverless architecture** — no servers to provision or manage; each function runs only on request and scales automatically
- **Lambda Authorizer pattern** — a dedicated Lambda function validates a JWT on every protected request *before* API Gateway forwards it to the business-logic Lambda, decoupling authentication from application code
- **API Gateway as the routing layer** — maps HTTP methods + paths to individual Lambda functions
- **Microservice-style decomposition** — each CRUD operation (`create`, `list`, `get`, `update`, `delete`) is its own independent Lambda function rather than one monolithic handler
- **Infrastructure as Code** — the entire stack is reproducible from `template.yaml` via `sam deploy`

---

## Tech stack

**Backend**
- AWS Lambda (Node.js 18)
- Amazon API Gateway (HTTP API)
- Amazon DynamoDB (pay-per-request)
- AWS Systems Manager Parameter Store (JWT secret storage)
- AWS SAM (deployment / IaC)
- `jsonwebtoken` for JWT signing/verification

**Frontend**
- React 18 + Vite
- Deployed on Vercel

---

## Project structure

```
todos-app/
├── todos-sam/          # Backend — AWS SAM project
│   ├── template.yaml    # Infrastructure definition
│   ├── package.json
│   └── src/handlers/
│       ├── login.js       # Issues JWT for demo user
│       ├── authorizer.js  # Validates JWT on protected routes
│       ├── createTodo.js
│       ├── listTodos.js
│       ├── getTodo.js
│       ├── updateTodo.js
│       └── deleteTodo.js
│
└── todos-frontend/     # Frontend — React + Vite
    ├── src/
    │   ├── App.jsx       # Login screen + todo board
    │   └── api.js        # API client
    └── index.html
```

---

## API Endpoints

| Method | Path         | Auth required | Description                |
|--------|--------------|----------------|-----------------------------|
| POST   | `/login`     | No             | Returns a JWT for the demo user |
| GET    | `/todos`     | Yes (JWT)      | List all todos              |
| POST   | `/todos`     | Yes (JWT)      | Create a todo                |
| GET    | `/todos/{id}`| Yes (JWT)      | Get a single todo            |
| PUT    | `/todos/{id}`| Yes (JWT)      | Update a todo                |
| DELETE | `/todos/{id}`| Yes (JWT)      | Delete a todo                |

Protected routes require an `Authorization: Bearer <token>` header, where the token is obtained from `/login`.

---

## Running locally

### Backend
```bash
cd todos-sam
npm install
sam build
sam deploy --guided
```
Requires an AWS account (free tier), AWS CLI configured, and the AWS SAM CLI installed. See deployment notes below for setting up the JWT secret in SSM before deploying.

### Frontend
```bash
cd todos-frontend
npm install
cp .env.example .env
# edit .env and set VITE_API_URL to your deployed API's base URL
npm run dev
```

---

## Cost

Every service used (Lambda, API Gateway, DynamoDB, SSM) sits within AWS's free tier for this scale of usage. The stack can be fully torn down with `sam delete` at any time with zero residual cost.

---

## Notes

- The demo login uses a single hardcoded user for simplicity/demo purposes — a production version would hash passwords and store users in a dedicated table.
- The JWT signing secret is stored in AWS SSM Parameter Store rather than hardcoded, so it isn't committed to this repo.
