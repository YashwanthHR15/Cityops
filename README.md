# CityOps

CityOps is a civic complaint portal with a static citizen/worker/admin frontend and an Express + Prisma backend.

## Local development

Start the backend:

```powershell
cd cityops-backend
node app.js
```

Start the frontend in another terminal:

```powershell
cd DSU
npm.cmd run dev -- --host 127.0.0.1
```

The frontend expects the backend at `http://localhost:4000` by default. Override it before loading the pages with:

```html
<script>window.CITYOPS_API_BASE = "https://your-backend.onrender.com";</script>
```

## Deployment

- **Backend:** Create a Render Web Service from this repository. Render can use `render.yaml`, or set root directory to `cityops-backend`, build command to `npm install && npx prisma generate`, and start command to `node app.js`.
- **Frontend:** Import the repository into Vercel. The included `vercel.json` serves `DSU` as the output directory.
- Set `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` in Render. Never commit `.env`.
- After the backend is deployed, set `window.CITYOPS_API_BASE` in the frontend deployment to the Render backend URL.

The deployment database must contain the required departments, categories, wards, and office/admin users before worker and admin flows can be used.
