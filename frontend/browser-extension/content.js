// content.js - Extracts job information from pages

console.log('OfferPath: Content script loaded');

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData' || request.action === 'getJobFromPage') {
    const jobData = extractJobData();
    sendResponse(jobData);
  }
  
  if (request.action === 'getDetectedSite') {
    sendResponse({ site: getSite() });
  }
  
  return true;
});

function getSite() {
  const hostname = window.location.hostname;
  const sites = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'lever.co', 'greenhouse.io', 'workday.com', 'solvedhire.com'];
  for (const site of sites) {
    if (hostname.includes(site)) return site;
  }
  return 'default';
}

function extractJobData() {
  const site = getSite();
  const hostname = window.location.hostname;
  
  console.log('OfferPath: Detecting on', hostname);
  
  let title = '';
  let company = '';
  
  // Try LinkedIn - multiple selectors for job details
  if (hostname.includes('linkedin.com')) {
    // Job title - try multiple selectors
    const titleSelectors = [
      'h1', '.top-card-layout__title', '.job-details-skill-match-status__container h1',
      '. jobs-details-job-details__entity-title', '[data-test-id="job-detail-title"]'
    ];
    for (const sel of titleSelectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim() && !el.textContent.toLowerCase().includes('sign in')) {
        title = el.textContent.trim();
        break;
      }
    }
    
    // Company name - multiple selectors
    const companySelectors = [
      '.top-card-layout__company-name', '.job-details-skill-match-status__company-name',
      '.jobs-details-job-details__company-name', '[data-test-id="job-detail-company-name"]',
      'a[href*="/company/"]', '.company-name'
    ];
    for (const sel of companySelectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) {
        company = el.textContent.trim();
        break;
      }
    }
    
    // If still no company, try from URL pattern
    if (!company) {
      const companyMatch = window.location.pathname.match(/\/company\/([^\/]+)/);
      if (companyMatch) {
        company = companyMatch[1].replace(/-/g, ' ');
        company = company.replace(/([a-z])([A-Z])/g, '$1 $2');
      }
    }
  }
  
  // Try Indeed
  if (hostname.includes('indeed.com')) {
    const titleEl = document.querySelector('[data-testid="jobsearch-JobTitle"], .jobTitle, h1.jobTitle');
    if (titleEl?.textContent?.trim()) {
      title = titleEl.textContent.trim();
    }
    
    const companyEl = document.querySelector('[data-testid="companyOverview"], .companyName, .company');
    if (companyEl?.textContent?.trim()) {
      company = companyEl.textContent.trim();
    }
  }
  
  // Try Glassdoor
  if (hostname.includes('glassdoor.com')) {
    const titleEl = document.querySelector('[data-testid="job-title"], .jobTitle, h1');
    if (titleEl?.textContent?.trim()) {
      title = titleEl.textContent.trim();
    }
    
    const companyEl = document.querySelector('[data-testid="employer-name"], .employer-name');
    if (companyEl?.textContent?.trim()) {
      company = companyEl.textContent.trim();
    }
  }
  
  // Try Lever
  if (hostname.includes('lever.co')) {
    const titleEl = document.querySelector('h1');
    if (titleEl?.textContent?.trim()) {
      title = titleEl.textContent.trim();
    }
    
    const companyEl = document.querySelector('.posting-company, .company-logo-name');
    if (companyEl?.textContent?.trim()) {
      company = companyEl.textContent.trim();
    }
  }
  
  // Try Greenhouse
  if (hostname.includes('greenhouse.io')) {
    const titleEl = document.querySelector('.app-title h1, .job-title h1');
    if (titleEl?.textContent?.trim()) {
      title = titleEl.textContent.trim();
    }
    
    const companyEl = document.querySelector('.company-name, .company-logo-name');
    if (companyEl?.textContent?.trim()) {
      company = companyEl.textContent.trim();
    }
  }
  
  // Generic fallback: use page title
  if (!title || title === 'Unknown Title') {
    const pageTitle = document.title
      .replace(/[-|–|—|:|•|LinkedIn|Indeed|Jobs|Careers|Apply]/g, '|')
      .split('|')
      .filter(t => t.trim().length > 3)[0] || '';
    
    if (pageTitle.length > 3) {
      title = pageTitle.trim().split(' ').slice(0, 8).join(' ');
    }
  }
  
  // Clean up title
  title = title.replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').trim();
  
  // Try to extract company from page title if still unknown
  if (!company || company === 'Unknown') {
    const title = document.title;
    // Try pattern like "Company - Job Title" or "Job Title at Company"
    const atMatch = title.match(/at\s+([A-Z][a-zA-Z\s]+?)(?:\s*[-|]|$)/i);
    const dashMatch = title.match(/^([A-Z][a-zA-Z\s]+?)\s*[-–—]\s*/i);
    
    if (atMatch) {
      company = atMatch[1].trim();
    } else if (dashMatch) {
      company = dashMatch[1].trim();
    }
  }
  
  // Final fallback
  title = title || document.title.split(' ').slice(0, 6).join(' ') || 'Unknown Job';
  company = company || hostname.replace('www.', '').split('.')[0].charAt(0).toUpperCase() + hostname.replace('www.', '').split('.')[0].slice(1);
  
  // Clean company name
  company = company.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
  
  console.log('OfferPath: Extracted - Title:', title, '| Company:', company);
  
  return {
    title,
    company,
    url: window.location.href,
    source: site === 'default' ? 'Company Site' : site,
    detectedAt: new Date().toISOString()
  };
}

// Create floating capture button
function createFloatButton() {
  if (document.getElementById('offerpath-float-btn')) return;
  
  const btn = document.createElement('div');
  btn.id = 'offerpath-float-btn';
  btn.innerHTML = `
    <button style="
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
    ">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="white">
        <path d="M8 20L14 14L18 18L24 10" stroke="#6366f1" stroke-width="2.5" fill="none"/>
      </svg>
    </button>
  `;
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;';
  
  btn.onclick = () => {
    const data = extractJobData();
    chrome.runtime.sendMessage({ action: 'saveJobApplication', data });
    btn.querySelector('button').innerHTML = '✓';
    setTimeout(() => {
      btn.querySelector('button').innerHTML = '<svg width="24" height="24" viewBox="0 0 32 32" fill="white"><path d="M8 20L14 14L18 18L24 10" stroke="#6366f1" stroke-width="2.5" fill="none"/></svg>';
    }, 1500);
  };
  
  document.body.appendChild(btn);
}

setTimeout(createFloatButton, 3000);
