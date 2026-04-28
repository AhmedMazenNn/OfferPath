# OfferPath Extension - Test Checklist

## Prerequisites
1. Backend running: `cd backend && source .venv/bin/activate && python run.py`
2. Frontend running: `cd frontend && npm run dev`
3. Chrome extension loaded: `chrome://extensions` → "Load unpacked" → `frontend/browser-extension`

## Test Steps

### 1. Verify Extension Loads
- [ ] Open `chrome://extensions`
- [ ] Find "OfferPath - Job Tracker"
- [ ] Check for any error badges (red icons)
- [ ] Click "Details" → Check "Inspect views: service worker" opens without errors

### 2. Test Authentication
- [ ] Click the OfferPath icon in toolbar
- [ ] You should see "Sign In" button (auth section)
- [ ] Enter email: `test@example.com`
- [ ] Click "Sign In"
- [ ] Should show "Connected" status and your email
- [ ] Check console: Right-click popup → "Inspect popup" → Console tab

### 3. Test Auto-Detection on Known Sites
Visit these sites and check if job is detected:

- [ ] **LinkedIn**: Visit any LinkedIn job posting
  - Click extension icon
  - Should show: Job title, company name
  
- [ ] **Indeed**: Visit any Indeed job posting
  - Click extension icon
  - Should show: Job title, company name

- [ ] **Lever**: Visit any `lever.co` job posting
- [ ] **Greenhouse**: Visit any `greenhouse.io` job posting
- [ ] **Workday**: Visit any `workday.com` job posting

### 4. Test Solvedhire.com (Your Issue)
- [ ] Visit: `https://solvedhire.com/jobs/1720642-315153.html`
- [ ] Open extension popup
- [ ] Check "Inspect popup" console for `OfferPath:` log messages
- [ ] If not detected automatically:
  - Click "Capture from Page" button
  - Check console logs in the page (F12 → Console)
  - Look for `OfferPath: Detected site: solvedhire.com` message

### 5. Test Manual Entry (Fallback)
If auto-detect fails on any site:
- [ ] Scroll down in popup (after "Capture from Page")
- [ ] Enter job title manually
- [ ] Enter company name manually
- [ ] Click "Save Manual Entry"
- [ ] Should show "Application Saved!" message

### 6. Test Saving to Backend
- [ ] Sign in to extension
- [ ] Detect or manually enter a job
- [ ] Click "Save Application"
- [ ] Should show success message
- [ ] Open web app at `http://localhost:5173`
- [ ] Check if the application appears in the list

### 7. Test Web App Auth Sync
- [ ] Sign in via extension
- [ ] Open `http://localhost:5173`
- [ ] Should be automatically signed in (no login page)
- [ ] If not, check Chrome storage:
  - Go to `chrome://extensions`
  - Click "Details" on OfferPath
  - Click "Inspect views: service worker"
  - In console: `chrome.storage.local.get(['authToken', 'user'], console.log)`
  - Should show your auth token and user info

## Debugging Tips

### Extension Not Detecting Jobs
1. Open page with job listing
2. Press F12 → Console tab
3. Look for messages starting with `OfferPath:`
4. Check if content script is loaded: `OfferPath: Content script loaded on...`

### Extension Shows "Offline"
1. Check backend is running: `curl http://localhost:8000/health`
2. Should return: `{"status":"healthy"}`
3. Check for CORS issues in console

### Auth Not Syncing Between Extension and Web App
1. Both must be on same domain (localhost)
2. Check Chrome storage in extension's service worker console:
   ```javascript
   chrome.storage.local.get(null, (items) => console.log(items))
   ```
3. Web app reads from `localStorage` with keys `offerpath_token` and `offerpath_user`

### Manual Test of API
```bash
# Test auth endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test"}'

# Should return: {"user":{...},"token":"..."}

# Test saving application
export TOKEN="<your_token_from_above>"
curl -X POST http://localhost:8000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"company":"Test Co","role":"Engineer","job_url":"http://test.com","applied_date":"2024-01-01","status":"applied"}'
```

## Quick Fixes

### Reload Extension After Code Changes
1. Go to `chrome://extensions`
2. Find OfferPath
3. Click the "Reload" icon (circular arrow)
4. Refresh the job page (F5)

### Clear Extension Data
1. Go to `chrome://extensions`
2. Click "Details" on OfferPath
3. Scroll down → Click "Clear data"

### Check Content Script Loading
Visit any job site, press F12, in Console:
```javascript
document.querySelector('h1')?.textContent
// Should show the page's H1 title
```
