# Recipe Manager

This workspace contains two projects:

- `api` - Express + TypeScript backend with JWT auth, Prisma, categories, ingredients, recipes, favorites, and dashboard.
- `frontend` - React + Vite frontend for browsing recipes, authentication, favorites, dashboard, and recipe creation.

## Backend

### Setup

```bash
cd api
npm install
cp .env.example .env
# update DATABASE_URL and secrets
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Run

```bash
cd api
npm run dev
```

## Frontend

### Setup

```bash
cd frontend
npm install
```

### Run

```bash
cd frontend
npm run dev
```

## Notes

- Frontend expects backend API at `http://localhost:4000/api` by default.
- The backend uses cookies for refresh tokens and JWT bearer tokens for authenticated API requests.
