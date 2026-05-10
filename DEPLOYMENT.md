# Deployment Guide for Zyagra

## Prerequisites
- MongoDB Atlas cluster (already set up)
- Git repository pushed to GitHub
- Node.js installed locally

---

## Deploying to Render.com (Recommended)

### Backend Deployment

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment config"
   git push
   ```

2. **Create Web Service on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `zyagra-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`

3. **Set Environment Variables** in Render dashboard:
   ```
   MONGO_URI=mongodb+srv://zyagraadmin:GFftAEhksLQVqe3D@cluster0.i4brgch.mongodb.net/?appName=Cluster0
   JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmZhNDE2ZGVhNzM3M2M3MzlmNWFlZSIsImVtYWlsIjoic3VwZXJhZG1pbkB6eWFncmEuY29tIiwicm9sZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzc4MzYxMzc1LCJleHAiOjE3Nzg0NDc3NzV9.d9RwSafqqBt7uigkNiI5bc-4mBQlmdpaX7XA_zV_kss
   PORT=5001
   RAZORPAY_KEY_ID=rzp_test_SneBT8vTroqiGc
   RAZORPAY_KEY_SECRET=kFQUoiZNkAqMT0QmxmiuDGyi
   ```

4. **Deploy** - Click "Create Web Service" and wait for build to complete

---

### Frontend Deployment

1. **Update `.env` in Client folder** with the deployed backend URL:
   ```
   VITE_API_URL=https://zyagra-backend.onrender.com
   ```

2. **Deploy to Render (Static Site)**
   - Create another "Static Site" service in Render
   - Connect same GitHub repo
   - Configure:
     - **Build Command**: `cd Client && npm install && npm run build`
     - **Publish Directory**: `Client/dist`
     - **Root Directory**: `.`

3. **Set Environment Variables**:
   ```
   VITE_API_URL=https://zyagra-backend.onrender.com
   ```

---

## Alternative: Deploy with Vercel (Frontend) + Render (Backend)

### Frontend on Vercel
1. Go to https://vercel.com/new
2. Import GitHub repository
3. Set Root Directory: `Client`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
5. Deploy

---

## Troubleshooting

### Server won't start
- Check MongoDB connection: `MONGO_URI` is correct
- Verify `PORT` is set (default 5001)
- Check logs in Render dashboard

### Frontend can't connect to backend
- Verify `VITE_API_URL` matches your backend URL
- Check CORS is enabled in `server.js` (already enabled with `cors()`)
- Check Network tab in browser DevTools for actual request URL

### Environment Variables not loading
- Ensure `.env` files are in correct directories:
  - Server: `Server/.env`
  - Client: `Client/.env`
- Restart servers after environment changes
- On Render, changes take effect automatically on redeploy

---

## Important Security Notes ⚠️

**NEVER commit `.env` to GitHub** (already in `.gitignore`):
- `.env` files contain sensitive credentials
- Use `.env.example` as template for team/deployment

**Rotate credentials after deployment**:
- MongoDB credentials should be changed
- JWT_SECRET should be regenerated
- Razorpay keys should be verified

---

## Local Testing Before Deploy

```bash
# Terminal 1 - Backend
cd Server
npm install
node server.js

# Terminal 2 - Frontend
cd Client
npm install
npm run dev
```

Visit `http://localhost:5173` in browser
