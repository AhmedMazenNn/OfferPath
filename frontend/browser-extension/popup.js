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
    appsList: document.getElementById('apps-list'),
    appsListSection: document.getElementById('apps-list-section'),
    listSearch: document.getElementById('list-search'),
    listFilter: document.getElementById('list-filter'),
    listPagination: document.getElementById('list-pagination'),
    prevPage: document.getElementById('prev-page'),
    nextPage: document.getElementById('next-page'),
    pageInfo: document.getElementById('page-info'),
  };

  let API_BASE_URL = 'https://ahmedmazen-offer-path-backend.hf.space/api';
  
  async function getApiUrl() {
    const { apiUrl } = await chrome.storage.local.get('apiUrl');
    if (apiUrl) {
      API_BASE_URL = apiUrl.replace(/\/+$/, '') + '/api';
    }
    return API_BASE_URL;
  }

  let currentJobData = null;
  let isAuthenticated = false;
  
  // List state
  let allApplications = [];
  let currentPage = 1;
  const itemsPerPage = 4;

  // Initialize
  init();

  async function init() {
    await checkAuthStatus();
    await checkApiStatus();
    if (isAuthenticated) {
      await loadJobFromPage();
      await updateAppCount();
      await renderApplicationsList();
    }
  }

  // Check if user is authenticated
  async function checkAuthStatus() {
    const { accessToken, user } = await chrome.storage.local.get(['accessToken', 'user']);
    
    if (accessToken && user) {
      isAuthenticated = true;
      elements.authSection.classList.add('hidden');
      elements.mainSection.classList.remove('hidden');
      elements.appsListSection.classList.remove('hidden');
      elements.userName.textContent = user.name || user.email;
    } else {
      isAuthenticated = false;
      elements.authSection.classList.remove('hidden');
      elements.mainSection.classList.add('hidden');
      elements.appsListSection.classList.add('hidden');
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
      renderApplicationsList();
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
        // Also update the list if we're here
        if (isAuthenticated) renderApplicationsList(response.data);
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
        if (response.local) {
          alert('Saved locally to extension (offline). Open the OfferPath web app to sync.');
        } else {
          showSuccess();
        }
        updateAppCount();
        renderApplicationsList();
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
      const baseUrl = await getApiUrl();
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        const expiry = Date.now() + (30 * 60 * 1000);
        await chrome.storage.local.set({ 
          accessToken: data.access_token, 
          refreshToken: data.refresh_token,
          user: data.user,
          tokenExpiry: String(expiry)
        });
        
        isAuthenticated = true;
        elements.authSection.classList.add('hidden');
        elements.mainSection.classList.remove('hidden');
        elements.userName.textContent = data.user.name;
        
        chrome.runtime.sendMessage({ 
          action: 'setAuthTokens', 
          accessToken: data.access_token, 
          refreshToken: data.refresh_token,
          userId: data.user.id 
        });

        await loadJobFromPage();
        await updateAppCount();
        await renderApplicationsList();
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
      const baseUrl = await getApiUrl();
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        const expiry = Date.now() + (30 * 60 * 1000);
        await chrome.storage.local.set({ 
          accessToken: data.access_token, 
          refreshToken: data.refresh_token,
          user: data.user,
          tokenExpiry: String(expiry)
        });
        
        isAuthenticated = true;
        elements.authSection.classList.add('hidden');
        elements.mainSection.classList.remove('hidden');
        elements.userName.textContent = data.user.name;
        
        chrome.runtime.sendMessage({ 
          action: 'setAuthTokens', 
          accessToken: data.access_token, 
          refreshToken: data.refresh_token,
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
    await chrome.storage.local.remove(['accessToken', 'refreshToken', 'user', 'tokenExpiry']);
    isAuthenticated = false;
    elements.authSection.classList.remove('hidden');
    elements.mainSection.classList.add('hidden');
  }

  // Render applications list
  async function renderApplicationsList(providedData) {
    if (!isAuthenticated) return;
    
    if (providedData) {
      allApplications = providedData;
    } else {
      const response = await new Promise(resolve => {
        chrome.runtime.sendMessage({ action: 'getApplications' }, resolve);
      });
      allApplications = response?.data || [];
    }
    
    if (allApplications.length === 0) {
      elements.appsList.innerHTML = '<div class="empty-apps">No applications yet</div>';
      elements.listPagination.classList.add('hidden');
      return;
    }
    
    // Apply filters
    const query = (elements.listSearch.value || '').toLowerCase();
    const statusFilter = elements.listFilter.value;
    
    let filtered = allApplications.filter(app => {
      const matchesSearch = !query || 
        (app.company || '').toLowerCase().includes(query) || 
        (app.role || '').toLowerCase().includes(query);
      
      const status = (app.status || 'applied').toLowerCase();
      const matchesStatus = statusFilter === 'all' || status.includes(statusFilter);
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort by newest first
    filtered.sort((a, b) => {
      const dateA = new Date(a.applied_date || a.appliedDate || 0);
      const dateB = new Date(b.applied_date || b.appliedDate || 0);
      return dateB - dateA;
    });
    
    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filtered.slice(start, end);
    
    // Update UI
    if (filtered.length === 0) {
      elements.appsList.innerHTML = '<div class="empty-apps">No matches found</div>';
      elements.listPagination.classList.add('hidden');
    } else {
      elements.appsList.innerHTML = pageItems.map(app => {
        const status = (app.status || 'Applied').toLowerCase();
        let statusClass = 'status-applied';
        if (status.includes('interview')) statusClass = 'status-interview';
        else if (status.includes('offer')) statusClass = 'status-offer';
        else if (status.includes('rejected')) statusClass = 'status-rejected';
        
        return `
          <div class="app-item">
            <div class="app-info">
              <div class="app-company">${app.company}</div>
              <div class="app-role">${app.role}</div>
            </div>
            <div class="app-status-badge ${statusClass}">${app.status || 'Applied'}</div>
          </div>
        `;
      }).join('');
      
      // Update pagination info
      elements.listPagination.classList.toggle('hidden', totalPages <= 1);
      elements.pageInfo.textContent = `${currentPage} / ${totalPages}`;
      elements.prevPage.disabled = currentPage === 1;
      elements.nextPage.disabled = currentPage === totalPages;
    }
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
    chrome.tabs.create({ url: 'https://offer-path-weld.vercel.app' });
  });

  // Allow Enter key to submit
  elements.emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  elements.passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // List event listeners
  elements.listSearch.addEventListener('input', () => {
    currentPage = 1;
    renderApplicationsList();
  });
  
  elements.listFilter.addEventListener('change', () => {
    currentPage = 1;
    renderApplicationsList();
  });
  
  elements.prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderApplicationsList();
    }
  });
  
  elements.nextPage.addEventListener('click', () => {
    const totalPages = Math.ceil(allApplications.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderApplicationsList();
    }
  });
});
