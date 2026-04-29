// popup.js - Handles the extension popup UI

document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    statusBadge: document.getElementById('status-badge'),
    authSection: document.getElementById('auth-section'),
    mainSection: document.getElementById('main-section'),
    userName: document.getElementById('user-name'),
    logoutBtn: document.getElementById('logout-btn'),
    emailInput: document.getElementById('email-input'),
    passwordInput: document.getElementById('password-input'),
    submitLogin: document.getElementById('submit-login'),
    submitSignup: document.getElementById('submit-signup'),
    jobDetected: document.getElementById('job-detected'),
    noJob: document.getElementById('no-job'),
    successMessage: document.getElementById('success-message'),
    jobTitle: document.getElementById('job-title'),
    jobCompany: document.getElementById('job-company'),
    jobUrl: document.getElementById('job-url'),
    saveBtn: document.getElementById('save-btn'),
    captureBtn: document.getElementById('capture-btn'),
    manualTitle: document.getElementById('manual-title'),
    manualCompany: document.getElementById('manual-company'),
    manualSaveBtn: document.getElementById('manual-save-btn'),
    appCount: document.getElementById('app-count'),
    openApp: document.getElementById('open-app'),
  };

  const API_BASE_URL = 'https://ahmedmazen-offerpath.hf.space/api';

  let currentJobData = null;
  let isAuthenticated = false;

  // Initialize
  init();

  async function init() {
    await checkAuthStatus();
    await checkApiStatus();
    if (isAuthenticated) {
      await loadJobFromPage();
      await updateAppCount();
    }
  }

  // Check if user is authenticated
  async function checkAuthStatus() {
    const { authToken, user } = await chrome.storage.local.get(['authToken', 'user']);
    
    if (authToken && user) {
      isAuthenticated = true;
      elements.authSection.classList.add('hidden');
      elements.mainSection.classList.remove('hidden');
      elements.userName.textContent = user.name || user.email;
    } else {
      isAuthenticated = false;
      elements.authSection.classList.remove('hidden');
      elements.mainSection.classList.add('hidden');
    }
  }

  // Check API connection status
  async function checkApiStatus() {
    try {
      elements.statusBadge.textContent = 'Checking...';
      elements.statusBadge.className = 'badge badge-disconnected';
      
      // Use background script - it runs in service worker with full network access
      chrome.runtime.sendMessage({ action: 'testApi' }, (response) => {
        console.log('OfferPath: Background API response:', response);
        if (response?.success) {
          elements.statusBadge.textContent = 'Connected';
          elements.statusBadge.className = 'badge badge-connected';
        } else {
          elements.statusBadge.textContent = 'Offline';
          elements.statusBadge.className = 'badge badge-disconnected';
        }
      });
    } catch (err) {
      console.error('OfferPath: API check error:', err);
      elements.statusBadge.textContent = 'Offline';
      elements.statusBadge.className = 'badge badge-disconnected';
    }
  }

  // Extract job from current page
  async function loadJobFromPage() {
    showLoading();
    console.log('OfferPath: Requesting job from page...');
    
    chrome.runtime.sendMessage({ action: 'getJobFromPage' }, (response) => {
      console.log('OfferPath: Job response:', response);
      hideLoading();
      
      if (response?.title && response.title !== 'Unknown Title') {
        currentJobData = response;
        displayJob(response);
      } else {
        showNoJob();
      }
    });
  }

  // Display detected job
  function displayJob(job) {
    elements.jobTitle.textContent = job.title || 'Unknown';
    elements.jobCompany.textContent = job.company || 'Unknown';
    elements.jobUrl.textContent = job.url || '-';
    elements.jobDetected.classList.remove('hidden');
    elements.noJob.classList.add('hidden');
    elements.successMessage.classList.add('hidden');
  }

  // Show no job state
  function showNoJob() {
    elements.jobDetected.classList.add('hidden');
    elements.noJob.classList.remove('hidden');
    elements.successMessage.classList.add('hidden');
  }

  // Show success message
  function showSuccess() {
    elements.jobDetected.classList.add('hidden');
    elements.noJob.classList.add('hidden');
    elements.successMessage.classList.remove('hidden');
    
    setTimeout(() => {
      showNoJob();
      currentJobData = null;
    }, 2000);
  }

  // Show loading state
  function showLoading() {
    const p = elements.noJob.querySelector('p');
    if (p) p.textContent = 'Detecting...';
  }

  function hideLoading() {
    const p = elements.noJob.querySelector('p');
    if (p) p.textContent = 'No job detected';
  }

  // Update app count
  async function updateAppCount() {
    chrome.runtime.sendMessage({ action: 'getApplications' }, (response) => {
      if (response?.data) {
        elements.appCount.textContent = response.data.length;
      }
    });
  }

  // Save current job
  async function saveJob() {
    if (!currentJobData) return;
    
    elements.saveBtn.disabled = true;
    elements.saveBtn.textContent = 'Saving...';
    
    chrome.runtime.sendMessage({ 
      action: 'saveJobApplication', 
      data: currentJobData 
    }, (response) => {
      elements.saveBtn.disabled = false;
      elements.saveBtn.textContent = 'Save Application';
      
      if (response?.success) {
        showSuccess();
        updateAppCount();
      } else {
        alert('Failed to save: ' + (response?.error || 'Unknown error'));
      }
    });
  }

  // Login handler
  async function handleLogin() {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value.trim();
    
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    elements.submitLogin.disabled = true;
    elements.submitLogin.textContent = 'Signing in...';

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        await chrome.storage.local.set({ 
          authToken: data.token, 
          user: data.user 
        });
        
        isAuthenticated = true;
        elements.authSection.classList.add('hidden');
        elements.mainSection.classList.remove('hidden');
        elements.userName.textContent = data.user.name;
        
        chrome.runtime.sendMessage({ 
          action: 'setAuthToken', 
          token: data.token, 
          userId: data.user.id 
        });

        await loadJobFromPage();
        await updateAppCount();
      } else {
        const error = await response.json();
        alert(`Login failed: ${error.detail || 'Invalid credentials'}`);
      }
    } catch (error) {
      alert('Login failed. Make sure the backend is running.');
    } finally {
      elements.submitLogin.disabled = false;
      elements.submitLogin.textContent = 'Sign In';
    }
  }

  // Signup handler
  async function handleSignup() {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value.trim();
    const name = email.split('@')[0];
    
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    elements.submitSignup.disabled = true;
    elements.submitSignup.textContent = 'Creating...';

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        await chrome.storage.local.set({ 
          authToken: data.token, 
          user: data.user 
        });
        
        isAuthenticated = true;
        elements.authSection.classList.add('hidden');
        elements.mainSection.classList.remove('hidden');
        elements.userName.textContent = data.user.name;
        
        chrome.runtime.sendMessage({ 
          action: 'setAuthToken', 
          token: data.token, 
          userId: data.user.id 
        });

        await loadJobFromPage();
        await updateAppCount();
      } else {
        const error = await response.json();
        alert(`Signup failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Signup failed. Make sure the backend is running.');
    } finally {
      elements.submitSignup.disabled = false;
      elements.submitSignup.textContent = 'Sign Up';
    }
  }

  // Logout handler
  async function handleLogout() {
    await chrome.storage.local.remove(['authToken', 'user']);
    isAuthenticated = false;
    elements.authSection.classList.remove('hidden');
    elements.mainSection.classList.add('hidden');
  }

  // Manual save
  function handleManualSave() {
    const title = elements.manualTitle.value.trim();
    const company = elements.manualCompany.value.trim();
    
    if (!title || !company) {
      alert('Please enter job title and company');
      return;
    }
    
    currentJobData = {
      title,
      company,
      url: window.location.href,
      source: 'Manual Entry',
    };
    
    saveJob();
    elements.manualTitle.value = '';
    elements.manualCompany.value = '';
  }

  // Event Listeners
  elements.saveBtn.addEventListener('click', saveJob);
  elements.captureBtn.addEventListener('click', loadJobFromPage);
  elements.manualSaveBtn.addEventListener('click', handleManualSave);
  elements.submitLogin.addEventListener('click', handleLogin);
  elements.submitSignup.addEventListener('click', handleSignup);
  elements.logoutBtn.addEventListener('click', handleLogout);

  elements.openApp.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });

  // Allow Enter key to submit
  elements.emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  elements.passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
});
