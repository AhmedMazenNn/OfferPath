// background.js - Service worker for Chrome extension

const API_BASE_URL = 'https://ahmedmazen-offerpath.hf.space/api';

// Background script loaded
console.log('OfferPath: Background script loaded');

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('OfferPath extension installed');
  chrome.storage.local.set({
    authToken: null,
    applications: []
  });
});

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

    case 'setAuthToken':
      chrome.storage.local.set({ authToken: request.token, userId: request.userId });
      sendResponse({ success: true });
      return true;
      
    default:
      console.log('Unknown action:', request.action);
  }
  
  return true;
});

// Save job application to backend
async function saveApplication(jobData, sendResponse) {
  try {
    const { authToken } = await chrome.storage.local.get(['authToken']);
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const applicationData = {
      company: jobData.company,
      role: jobData.title,
      job_url: jobData.url,
      source: jobData.source || 'Company Site',
      applied_date: new Date().toISOString().split('T')[0],
      current_stage_index: 0,
      custom_stages: ['Applied', 'Screening', 'Interview', 'Offer'],
    };
    
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(applicationData)
    });
    
    if (response.ok) {
      const savedApp = await response.json();
      console.log('OfferPath: Saved to API:', savedApp);
      sendResponse({ success: true, data: savedApp });
    } else {
      // API error - try to save locally
      console.log('OfferPath: API error, saving locally');
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
    
    sendResponse({ success: true, data: localApp, local: true });
  }
}

// Get all applications
async function getApplications(sendResponse) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    
    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/applications`, { headers });
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
    
    // First try content script
    chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' }, (response) => {
      console.log('OfferPath: Content response:', response);
      if (chrome.runtime.lastError) {
        console.log('OfferPath: Runtime error:', chrome.runtime.lastError.message);
      } else if (response?.title && response.title !== 'Unknown') {
        sendResponse(response);
        return;
      }
    });
    
    // Wait and check if content script worked, otherwise use fallback
    setTimeout(() => {
      const url = tab.url || '';
      const title = tab.title || '';
      const hostname = new URL(url).hostname || '';
      
      // Parse job info from title (e.g., "Software Engineer at Google - LinkedIn Jobs")
      let jobTitle = title.split('|')[0].split('-')[0].split('–')[0].split('at')[0].trim();
      let company = '';
      
      // Try to extract "at Company" from title
      const atMatch = title.match(/\bat\s+([A-Z][a-zA-Z\s]+?)(?:\s*[-|]|$|\s)/i);
      const dashMatch = title.match(/^([A-Z][a-zA-Z\s]+?)\s*[-–—]\s*/i);
      
      if (atMatch) {
        company = atMatch[1].trim();
      } else if (dashMatch) {
        company = dashMatch[1].trim();
      } else {
        company = hostname.replace('www.', '').split('.')[0];
      }
      
      // Clean up
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
    // Use IPv4 explicitly
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, { 
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
