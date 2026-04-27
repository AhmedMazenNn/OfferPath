// content.js - Runs on job listing pages to extract job information

const JOB_SITE_CONFIGS = {
  'linkedin.com': {
    jobTitleSelector: '.job-card-container__title, .t-24',
    companySelector: '.job-card-container__company-name, .t-16',
    getJobUrl: () => window.location.href,
    getJobId: () => {
      const urlMatch = window.location.href.match(/linkedin\.com\/jobs\/(\d+)/);
      return urlMatch ? urlMatch[1] : null;
    }
  },
  'indeed.com': {
    jobTitleSelector: '.jobTitle, h2[data-testid="jobsearch-JobTitle"]',
    companySelector: '.companyName, [data-testid="companyoverview"] a',
    getJobUrl: () => window.location.href,
    getJobId: () => {
      const jobKey = document.querySelector('[data-jobkey]');
      return jobKey ? jobKey.dataset.jobkey : null;
    }
  },
  'glassdoor.com': {
    jobTitleSelector: '.job-title, h1[data-test="job-detail-title"]',
    companySelector: '.employer-name, [data-test="employer-short-name"]',
    getJobUrl: () => window.location.href,
    getJobId: null
  },
  'default': {
    jobTitleSelector: 'h1, [class*="title"], [class*="job-title"]',
    companySelector: '[class*="company"], [class*="employer"]',
    getJobUrl: () => window.location.href,
    getJobId: null
  }
};

function detectSite() {
  const hostname = window.location.hostname;
  for (const site of Object.keys(JOB_SITE_CONFIGS)) {
    if (hostname.includes(site)) {
      return site;
    }
  }
  return 'default';
}

function extractJobData() {
  const site = detectSite();
  const config = JOB_SITE_CONFIGS[site] || JOB_SITE_CONFIGS['default'];
  
  const titleEl = document.querySelector(config.jobTitleSelector);
  const companyEl = document.querySelector(config.companySelector);
  
  const jobData = {
    title: titleEl?.textContent?.trim() || document.title,
    company: companyEl?.textContent?.trim() || 'Unknown Company',
    url: config.getJobUrl(),
    jobId: config.getJobId ? config.getJobId() : null,
    source: site === 'default' ? 'Company Site' : `${site} Job Listing`,
    detectedAt: new Date().toISOString()
  };
  
  return jobData;
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData') {
    const jobData = extractJobData();
    sendResponse(jobData);
  }
  return true;
});

// Auto-detect button on page (for sites without structured data)
function createDetectionOverlay() {
  const existingOverlay = document.getElementById('offerpath-capture-btn');
  if (existingOverlay) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'offerpath-capture-btn';
  overlay.innerHTML = `
    <button id="offerpath-capture-trigger" title="Track with OfferPath">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
    </button>
  `;
  overlay.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
  `;
  
  const btn = overlay.querySelector('button');
  btn.style.cssText = `
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #6366f1;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  `;
  btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';
  btn.onclick = async () => {
    const jobData = extractJobData();
    
    // Show success feedback
    btn.innerHTML = '✓';
    btn.style.background = '#10b981';
    setTimeout(() => {
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
          <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      `;
      btn.style.background = '#6366f1';
    }, 2000);
    
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'saveJobApplication',
      data: jobData
    });
  };
  
  document.body.appendChild(overlay);
}

// Show capture button when on a known job site
if (detectSite() !== 'default') {
  // Delay to ensure page is loaded
  setTimeout(createDetectionOverlay, 2000);
}