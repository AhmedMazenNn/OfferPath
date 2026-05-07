// background.js - Service worker for Chrome extension

let API_BASE_URL = 'https://ahmedmazen-offer-path-backend.hf.space/api';

async function getApiUrl() {
  const { apiUrl } = await chrome.storage.local.get('apiUrl');
  if (apiUrl) {
    let cleanBase = apiUrl.trim();
    const isLocal = cleanBase.includes('localhost') || cleanBase.includes('127.0.0.1');
    
    if (!isLocal && cleanBase.startsWith('http://')) {
      cleanBase = cleanBase.replace('http://', 'https://');
    }
    
    API_BASE_URL = cleanBase.replace(/\/+$/, '') + '/api';
    console.log('OfferPath: Using API URL from storage:', API_BASE_URL);
  } else {
    console.log('OfferPath: Using default API URL:', API_BASE_URL);
  }
  return API_BASE_URL;
}

// Background script loaded
console.log('OfferPath: Background script loaded');

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('OfferPath extension installed');
  chrome.storage.local.set({
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
    applications: []
  });
});

// Get access token with automatic refresh
async function getAccessToken() {
  const { accessToken, refreshToken, tokenExpiry } = await chrome.storage.local.get(['accessToken', 'refreshToken', 'tokenExpiry']);
  
  if (!accessToken || !refreshToken) {
    return null;
  }
  
  const expiry = parseInt(tokenExpiry || '0', 10);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  // Token needs refresh
  if (expiry && now >= expiry - fiveMinutes) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (!refreshed) {
      return null;
    }
    const { accessToken: newAccessToken } = await chrome.storage.local.get('accessToken');
    return newAccessToken;
  }
  
  return accessToken;
}

// Refresh access token
async function refreshAccessToken(refreshToken) {
  try {
    const baseUrl = await getApiUrl();
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshToken
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    if (data.access_token && data.refresh_token) {
      const expiry = Date.now() + (data.expires_in * 1000);
      await chrome.storage.local.set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiry: String(expiry)
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// Handle messages from content.js and popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received:', request.action);
  
  switch (request.action) {
    case 'saveJobApplication':
      saveApplication(request.data, sendResponse);
      return true;
      
    case 'getApplications':
      getApplications(sendResponse);
      return true;
      
    case 'getJobFromPage':
      extractFromActiveTab(sendResponse);
      return true;
      
    case 'testApi':
      testApiConnection(sendResponse);
      return true;

    case 'setAuthTokens':
      const expiry = Date.now() + (30 * 60 * 1000);
      chrome.storage.local.set({ 
        accessToken: request.accessToken, 
        refreshToken: request.refreshToken,
        tokenExpiry: String(expiry),
        userId: request.userId 
      });
      sendResponse({ success: true });
      return true;
      
    case 'clearAuth':
      chrome.storage.local.remove(['accessToken', 'refreshToken', 'tokenExpiry', 'userId']);
      sendResponse({ success: true });
      return true;

    case 'getAllApplications':
      getAllApplicationsWithFilter(request.filter, sendResponse);
      return true;
      
    default:
      console.log('Unknown action:', request.action);
  }
  
  return true;
});

// Save job application to backend
async function saveApplication(jobData, sendResponse) {
  try {
    const accessToken = await getAccessToken();
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const applicationData = {
      company: jobData.company,
      role: jobData.title,
      job_url: jobData.url,
      source: jobData.source || 'Extension',
      applied_date: new Date().toISOString().split('T')[0],
      current_stage_index: 0,
      custom_stages: [
        { name: 'Applied', color: '#3b82f6' },
        { name: 'Rejected', color: '#ef4444' },
        { name: 'Offer', color: '#10b981' }
      ],
    };
    
    const baseUrl = await getApiUrl();
    console.log('OfferPath: Attempting to save to:', `${baseUrl}/applications`);
    
    const response = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(applicationData)
    });
    
    console.log('OfferPath: Save response status:', response.status);
    
    if (response.ok) {
      const savedApp = await response.json();
      console.log('OfferPath: Successfully saved to API:', savedApp);
      sendResponse({ success: true, data: savedApp });
    } else if (response.status === 401) {
      // Try to refresh token and retry
      const { refreshToken } = await chrome.storage.local.get('refreshToken');
      if (refreshToken) {
        const refreshed = await refreshAccessToken(refreshToken);
        if (refreshed) {
          const newAccessToken = await getAccessToken();
          if (newAccessToken) {
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            const baseUrl = await getApiUrl();
            const retryResponse = await fetch(`${baseUrl}/applications`, {
              method: 'POST',
              headers,
              body: JSON.stringify(applicationData)
            });
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              sendResponse({ success: true, data: retryData });
              return;
            }
          }
        }
      }
      throw new Error('Authentication failed');
    } else {
      throw new Error('API save failed');
    }
  } catch (error) {
    console.error('OfferPath: Save error:', error);
    
    // Save to local storage as fallback
    const { applications } = await chrome.storage.local.get('applications');
    const localApp = { 
      ...jobData, 
      id: Date.now().toString(),
      applied_date: new Date().toISOString().split('T')[0],
      locallySaved: true 
    };
    
    await chrome.storage.local.set({ 
      applications: [localApp, ...(applications || [])] 
    });
    
    console.log('OfferPath: Saved locally (fallback):', localApp);
    sendResponse({ success: true, data: localApp, local: true });
  }
}

// Get all applications with optional filtering
async function getAllApplicationsWithFilter(filter, sendResponse) {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      const { applications } = await chrome.storage.local.get('applications');
      sendResponse({ success: true, data: applications || [], needsAuth: true });
      return;
    }
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`
    };
    
    const baseUrl = await getApiUrl();
    const response = await fetch(`${baseUrl}/applications`, { headers });
    
    if (response.ok) {
      let data = await response.json();
      
      // Apply client-side filtering
      if (filter) {
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          data = data.filter(app => 
            app.company?.toLowerCase().includes(searchLower) ||
            app.role?.toLowerCase().includes(searchLower)
          );
        }
        if (filter.status && filter.status !== 'all') {
          data = data.filter(app => app.status === filter.status);
        }
      }
      
      await chrome.storage.local.set({ applications: data });
      sendResponse({ success: true, data });
    } else if (response.status === 401) {
      // Token expired, try to refresh
      const { refreshToken } = await chrome.storage.local.get('refreshToken');
      if (refreshToken) {
        const refreshed = await refreshAccessToken(refreshToken);
        if (refreshed) {
          const newAccessToken = await getAccessToken();
          if (newAccessToken) {
            const baseUrl = await getApiUrl();
            const retryResponse = await fetch(`${baseUrl}/applications`, { 
              headers: { 'Authorization': `Bearer ${newAccessToken}` } 
            });
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              sendResponse({ success: true, data: retryData });
              return;
            }
          }
        }
      }
      const { applications } = await chrome.storage.local.get('applications');
      sendResponse({ success: true, data: applications || [], needsAuth: true });
    } else {
      throw new Error('API unavailable');
    }
  } catch (error) {
    console.error('Get applications error:', error);
    const { applications } = await chrome.storage.local.get('applications');
    sendResponse({ success: true, data: applications || [] });
  }
}

// Get all applications (legacy function)
async function getApplications(sendResponse) {
  try {
    const accessToken = await getAccessToken();
    
    const headers = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const baseUrl = await getApiUrl();
    const response = await fetch(`${baseUrl}/applications`, { headers });
    if (response.ok) {
      const data = await response.json();
      await chrome.storage.local.set({ applications: data });
      sendResponse({ success: true, data });
    } else {
      throw new Error('API unavailable');
    }
  } catch (error) {
    const { applications } = await chrome.storage.local.get('applications');
    sendResponse({ success: true, data: applications || [] });
  }
}

// Extract job data from active tab
async function extractFromActiveTab(sendResponse) {
  console.log('OfferPath: extractFromActiveTab called');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    console.log('OfferPath: Active tab:', tab?.url);
    
    if (!tab?.id) {
      sendResponse({ error: 'No active tab' });
      return;
    }
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' }, (response) => {
      console.log('OfferPath: Content response:', response);
      if (chrome.runtime.lastError) {
        console.log('OfferPath: Runtime error:', chrome.runtime.lastError.message);
      } else if (response?.title && response.title !== 'Unknown') {
        sendResponse(response);
      }
    });
    
    setTimeout(() => {
      const url = tab.url || '';
      const title = tab.title || '';
      const hostname = new URL(url).hostname || '';
      
      let jobTitle = title.split('|')[0].split('-')[0].split('–')[0].split('at')[0].trim();
      let company = '';
      
      const atMatch = title.match(/\bat\s+([A-Z][a-zA-Z\s]+?)(?:\s*[-|]|$|\s)/i);
      const dashMatch = title.match(/^([A-Z][a-zA-Z\s]+?)\s*[-–—]\s*/i);
      
      if (atMatch) {
        company = atMatch[1].trim();
      } else if (dashMatch) {
        company = dashMatch[1].trim();
      } else {
        company = hostname.replace('www.', '').split('.')[0];
      }
      
      jobTitle = jobTitle.replace(/job|jobs|apply|hire|opening/i, '').trim();
      company = company.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
      company = company.charAt(0).toUpperCase() + company.slice(1);
      
      console.log('OfferPath: Fallback extraction:', { title: jobTitle, company, url });
      
      sendResponse({
        title: jobTitle || 'Unknown',
        company: company || 'Unknown',
        url: url,
        source: hostname.includes('linkedin') ? 'linkedin.com' : 
               hostname.includes('indeed') ? 'indeed.com' : 'Company Site',
        detectedAt: new Date().toISOString()
      });
    }, 1500);
    
  } catch (error) {
    console.log('OfferPath: Extract error:', error.message);
    sendResponse({ error: error.message });
  }
}

// Test API connection
async function testApiConnection(sendResponse) {
  console.log('OfferPath: Testing API via background...');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const baseUrl = await getApiUrl();
    const response = await fetch(`${baseUrl.replace('/api', '')}/health`, { 
      signal: controller.signal 
    });
    clearTimeout(timeout);
    
    console.log('OfferPath: Background API response:', response.status);
    sendResponse({ success: response.ok });
  } catch (error) {
    console.error('OfferPath: Background API error:', error.message);
    sendResponse({ success: false, error: error.message });
  }
}