// background.js - Service worker for Chrome extension

const API_BASE_URL = 'http://localhost:8000/api';

// Default to localhost for development
const CONFIG = {
  apiBaseUrl: API_BASE_URL,
  userId: null
};

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('OfferPath extension installed');
  
  // Set default auth in storage
  chrome.storage.local.set({
    config: CONFIG,
    userId: 'demo-user',
    applications: []
  });
});

// Handle messages from content.js and popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);
  
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
      
    case 'updateApiUrl':
      updateConfig(request.config, sendResponse);
      return true;
      
    case 'testApi':
      testApiConnection(sendResponse);
      return true;
      
    default:
      console.log('Unknown action:', request.action);
  }
  
  return true;
});

// Save job application to backend
async function saveApplication(jobData, sendResponse) {
  try {
    // Get user info
    const { userId } = await chrome.storage.local.get('userId');
    
    const applicationData = {
      company: jobData.company,
      role: jobData.title,
      jobUrl: jobData.url,
      source: jobData.source || 'Company Site',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      currentStageIndex: 0,
      customStages: ['Applied', 'Screening', 'Phone Screen', 'Technical', 'Onsite', 'Offer'],
      userId: userId || 'anonymous'
    };
    
    // Try to send to API
    const response = await fetch(`${CONFIG.apiBaseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData)
    });
    
    if (response.ok) {
      const savedApp = await response.json();
      
      // Also save locally as backup
      const { applications } = await chrome.storage.local.get('applications');
      const updatedApps = [savedApp, ...(applications || [])];
      await chrome.storage.local.set({ applications: updatedApps });
      
      sendResponse({ success: true, data: savedApp });
    } else {
      // If API fails, save locally
      console.log('API unavailable, saving locally');
      const { applications } = await chrome.storage.local.get('applications');
      const localApp = { ...applicationData, id: Date.now().toString(), locallySaved: true };
      const updatedApps = [localApp, ...(applications || [])];
      await chrome.storage.local.set({ applications: updatedApps });
      
      sendResponse({ success: true, data: localApp, local: true });
    }
  } catch (error) {
    console.error('Error saving application:', error);
    
    // Fallback: save locally
    const { applications } = await chrome.storage.local.get('applications');
    const localApp = { 
      ...jobData, 
      id: Date.now().toString(), 
      status: 'applied',
      currentStageIndex: 0,
      appliedDate: new Date().toISOString().split('T')[0],
      locallySaved: true 
    };
    const updatedApps = [localApp, ...(applications || [])];
    await chrome.storage.local.set({ applications: updatedApps });
    
    sendResponse({ success: true, data: localApp, local: true });
  }
}

// Get all applications
async function getApplications(sendResponse) {
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/applications`);
    if (response.ok) {
      const data = await response.json();
      await chrome.storage.local.set({ applications: data });
      sendResponse({ success: true, data });
    } else {
      throw new Error('API unavailable');
    }
  } catch (error) {
    // Get from local storage
    const { applications } = await chrome.storage.local.get('applications');
    sendResponse({ success: true, data: applications || [], local: true });
  }
}

// Extract job data from active tab
async function extractFromActiveTab(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      sendResponse({ error: 'No active tab' });
      return;
    }
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' }, (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: 'Could not extract from this page' });
      } else {
        sendResponse(response);
      }
    });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Update API config
async function updateConfig(newConfig, sendResponse) {
  Object.assign(CONFIG, newConfig);
  await chrome.storage.local.set({ config: CONFIG });
  sendResponse({ success: true });
}

// Test API connection
async function testApiConnection(sendResponse) {
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/applications`);
    sendResponse({ success: response.ok, status: response.status });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}