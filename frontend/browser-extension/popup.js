// popup.js - Handles the extension popup UI

document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    statusBadge: document.getElementById('status-badge'),
    currentJob: document.getElementById('current-job'),
    noJob: document.getElementById('no-job'),
    successMessage: document.getElementById('success-message'),
    jobTitle: document.getElementById('job-title'),
    jobCompany: document.getElementById('job-company'),
    jobUrl: document.getElementById('job-url'),
    saveBtn: document.getElementById('save-btn'),
    captureBtn: document.getElementById('capture-btn'),
    appCount: document.getElementById('app-count'),
    openApp: document.getElementById('open-app')
  };

  let currentJobData = null;

  // Initialize
  init();

  async function init() {
    await checkApiStatus();
    await loadJobFromPage();
    await updateAppCount();
  }

  // Check API connection status
  async function checkApiStatus() {
    chrome.runtime.sendMessage({ action: 'testApi' }, (response) => {
      if (response?.success) {
        elements.statusBadge.textContent = 'Connected';
        elements.statusBadge.classList.remove('disconnected');
        elements.statusBadge.classList.add('connected');
      } else {
        elements.statusBadge.textContent = 'Offline';
        elements.statusBadge.classList.remove('connected');
        elements.statusBadge.classList.add('disconnected');
      }
    });
  }

  // Extract job from current page
  async function loadJobFromPage() {
    showLoading();
    
    chrome.runtime.sendMessage({ action: 'getJobFromPage' }, (response) => {
      hideLoading();
      
      if (response?.error) {
        showNoJob();
        return;
      }
      
      if (response?.title) {
        currentJobData = response;
        displayJob(response);
      } else {
        showNoJob();
      }
    });
  }

  // Display detected job
  function displayJob(job) {
    elements.jobTitle.textContent = job.title || 'Unknown Title';
    elements.jobCompany.textContent = job.company || 'Unknown Company';
    elements.jobUrl.textContent = job.url || window.location.href;
    elements.jobUrl.href = job.url || '#';
    
    elements.currentJob.classList.remove('hidden');
    elements.noJob.classList.add('hidden');
    elements.successMessage.classList.add('hidden');
  }

  // Show no job state
  function showNoJob() {
    elements.currentJob.classList.add('hidden');
    elements.noJob.classList.remove('hidden');
    elements.successMessage.classList.add('hidden');
  }

  // Show success message
  function showSuccess() {
    elements.currentJob.classList.add('hidden');
    elements.noJob.classList.add('hidden');
    elements.successMessage.classList.remove('hidden');
    
    setTimeout(() => {
      showNoJob();
      currentJobData = null;
    }, 3000);
  }

  // Show loading state
  function showLoading() {
    elements.noJob.querySelector('p').textContent = 'Detecting...';
  }

  function hideLoading() {
    elements.noJob.querySelector('p').textContent = 'No job detected on this page';
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
    elements.saveBtn.querySelector('.btn-text').textContent = 'Saving...';
    
    chrome.runtime.sendMessage({ 
      action: 'saveJobApplication', 
      data: currentJobData 
    }, (response) => {
      elements.saveBtn.disabled = false;
      elements.saveBtn.querySelector('.btn-text').textContent = 'Save Application';
      
      if (response?.success) {
        showSuccess();
        updateAppCount();
      } else {
        alert('Failed to save. Try again.');
      }
    });
  }

  // Event Listeners
  elements.saveBtn.addEventListener('click', saveJob);
  
  elements.captureBtn.addEventListener('click', loadJobFromPage);
  
  elements.openApp.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });
});