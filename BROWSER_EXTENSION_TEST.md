# Browser Extension Test Guide

## Testing the Browser Extension

### 1. Load the Extension
1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked" and select: `/home/mazen/Desktop/OfferPath/frontend/browser-extension`

### 2. Test Authentication
1. Click the extension icon in the toolbar
2. You should see the auth section (not logged in)
3. Enter an email (e.g., `test@example.com`)
4. Optionally enter a name
5. Click "Sign In"
6. You should see "Connected" status and your name displayed

### 3. Test Job Detection
1. Visit a job listing page on LinkedIn, Indeed, Glassdoor, Lever, Greenhouse, or Workday
2. Click the extension icon
3. It should auto-detect the job title, company, and URL
4. If not detected, click "Capture from Page"

### 4. Test Saving Application
1. With a job detected, click "Save Application"
2. You should see a success message
3. The "Tracked" count should increase
4. Open the web app to verify the application appears

### 5. Verify Web App Auth Sync
1. After signing in via the extension, open `http://localhost:5173`
2. You should be automatically signed in (auth state is shared via Chrome storage)
3. The application you saved via extension should appear in the list

## Troubleshooting

### Extension shows "Offline"
- Make sure the backend is running at `http://localhost:8000`
- Check the browser console for errors (right-click extension popup → Inspect popup)

### Sign in fails
- Verify backend is running: `curl http://localhost:8000/health`
- Check that the auth endpoints work: `curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","name":"Test"}'`

### Application not saving
- Check that you're signed in (check extension popup)
- Open Chrome DevTools for the background script: `chrome://extensions` → "Inspect views: service worker"

## Quick Backend Test
```bash
# Start backend
cd /home/mazen/Desktop/OfferPath/backend
source .venv/bin/activate
python run.py

# Test in another terminal
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","name":"Test"}'
curl http://localhost:8000/api/applications -H "Authorization: Bearer <your_token>"
```

## Quick Frontend Test
```bash
# Start frontend
cd /home/mazen/Desktop/OfferPath/frontend
npm run dev

# Open http://localhost:5173
# Should redirect to /login
# After signing in, should redirect to dashboard
```
