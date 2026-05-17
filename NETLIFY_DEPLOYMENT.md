# Netlify Frontend Deployment

This project is now ready for Netlify static hosting.

## 1. Deploy the backend first

Host the Express backend on Render, Railway, or another Node host.

Backend start command:

```bash
node hospital-emr-backend/server.js
```

Backend environment variables:

```text
MONGO_URI=your_mongodb_atlas_connection_string
AUTH_SECRET=use-a-long-random-secret
CORS_ORIGIN=https://your-netlify-site.netlify.app
```

After deploy, test:

```text
https://your-backend-host/api/health
```

## 2. Set the frontend backend URL

Edit:

```text
hospital-emr-frontend/config.json
```

Change:

```json
{
  "apiBase": "https://homabay-emr-system.onrender.com/api"
}

```

to your real backend API URL.

## 3. Deploy to Netlify

In Netlify:

- Build command: leave empty
- Publish directory: `hospital-emr-frontend`

The included `netlify.toml` already sets this publish directory.

## Important

Do not put MongoDB passwords or `AUTH_SECRET` inside frontend files. Only the public backend API URL belongs in `config.json`.
