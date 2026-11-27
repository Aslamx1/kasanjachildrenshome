// ===== GLOBAL STATE =====
let currentUser = null;
let selectedLoginRole = 'admin';
let payAmount = 25000;
let payMethod = 'mtn';

const roleLoginProfiles = {
  admin: { label: 'Admin', placeholder: 'Admin email address' },
  staff: { label: 'Staff', placeholder: 'Staff email address' },
  donor: { label: 'Donor', placeholder: 'Donor email address' },
  volunteer: { label: 'Volunteer', placeholder: 'Volunteer email address' }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initScrollEffects();
  initRippleEffects();
  initFormEnhancements();
  initMagneticButtons();
  initScrollReveal();
  initParallax();
  initLightbox();
});

// ===== AUTHENTICATION =====
async function initAuth() {
  selectLoginRole('admin');
  if (!localStorage.getItem('kch_token')) return;

  try {
    const response = await apiCall('/auth/me');
    currentUser = response.user;
    localStorage.setItem('kch_user', JSON.stringify(currentUser));
    const loginPage = document.getElementById('page-login');
    if (loginPage && loginPage.classList.contains('active')) showPage(currentUser.role);
  } catch (error) {
    console.error('Session verification failed:', error);
    if (localStorage.getItem('kch_token')) {
      showToast('Could not verify your session. Check the server and sign in again.', 'error');
    }
  }
}

function selectLoginRole(role, trigger) {
  const profile = roleLoginProfiles[role] || roleLoginProfiles.admin;
  selectedLoginRole = role;

  document.querySelectorAll('.login-role-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.role === role);
  });
  if (trigger) trigger.classList.add('active');

  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  if (email) {
    email.placeholder = profile.placeholder;
    email.value = '';
  }
  if (password) {
    password.placeholder = `${profile.label} password`;
    password.value = '';
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value; 
  const btn = document.getElementById('login-btn');

  if (!email || !password) {
    showToast(' Please enter both email and password', 'error');
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = 'Logging in...';

    const data = await loginUser(email, password);
    currentUser = data.user;
    localStorage.setItem('kch_user', JSON.stringify(currentUser));
    showToast(`Welcome back, ${currentUser.name}!`, 'success');
    showPage(currentUser.role);
  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message || 'Unable to sign in. Check your connection.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const firstName = document.getElementById('reg-fname')?.value.trim();
  const lastName = document.getElementById('reg-lname')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const password = document.getElementById('reg-pass')?.value;
  const confirmPassword = document.getElementById('reg-pass-confirm')?.value;
  const joinAs = document.getElementById('reg-method')?.value || 'donor';
  const agreedTerms = document.getElementById('reg-terms')?.checked;

  // Validation
  if (!firstName || !lastName || !email || !password) {
    showToast(' Please fill in all required fields', 'error');
    return;
  }

  if (password.length < 8) {
    showToast(' Password must be at least 8 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast(' Passwords do not match', 'error');
    return;
  }

  if (!agreedTerms) {
    showToast(' Please agree to the terms and privacy policy', 'error');
    return;
  }

  try {
    const btn = document.querySelector('#page-register button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    // Call real signup API
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        joinAs
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Save token and user to localStorage
      authToken = data.token;
      localStorage.setItem('kch_token', data.token);
      localStorage.setItem('kch_user', JSON.stringify(data.user));
      
      showToast(` Account created successfully! Welcome, ${data.user.name}!`, 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        showPage('dashboard');
        initAuth();
      }, 500);
    } else {
      showToast(` ${data.message || 'Signup failed'}`, 'error');
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  } catch (error) {
    console.error('Signup error:', error);
    showToast(' Connection error. Please try again.', 'error');
    const btn = document.querySelector('#page-register button[type="submit"]');
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

function togglePassword() {
  const input = document.getElementById('login-password');
  const button = document.querySelector('.password-toggle');
  if (!input || !button) return;

  const showPassword = input.type === 'password';
  input.type = showPassword ? 'text' : 'password';
  button.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
}

function handleForgotPassword() {
  showToast('Password reset is not configured. Contact an administrator.', 'error');
}

function handleSocialLogin(provider) {
  showToast(`${provider} sign-in is not configured.`, 'error');
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('kch_user');
  showToast('You have been logged out.', 'success');
  showPage('home');
}

// ===== UI ENHANCEMENTS =====
function shakeElement(element) {
  if (!element) return;
  element.style.animation = 'none';
  element.offsetHeight;
  element.style.animation = 'shake 0.4s ease';
  setTimeout(() => {
    element.style.animation = '';
  }, 400);
}

function initRippleEffects() {
  document.querySelectorAll('.btn-primary, .social-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;
      
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

function initScrollEffects() {
  const nav = document.getElementById('main-nav');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  });
}

function initFormEnhancements() {
  document.querySelectorAll('.form-input').forEach(input => {
    const label = input.previousElementSibling;
    if (label && label.tagName === 'LABEL') {
      input.addEventListener('focus', () => {
        label.style.color = 'var(--green)';
        label.style.transform = 'translateY(-2px)';
      });
      
      input.addEventListener('blur', () => {
        label.style.color = '';
        label.style.transform = '';
      });
    }
  });
  
  document.querySelectorAll('.auth-form input[required]').forEach(input => {
    input.addEventListener('invalid', (e) => {
      e.preventDefault();
      input.style.borderColor = 'var(--red)';
      setTimeout(() => {
        input.style.borderColor = '';
      }, 2000);
    });
  });
}

function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-primary, .social-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .fadeup, .slide-left, .slide-right, .scale-in');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 50);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(el => observer.observe(el));
}

function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.3;
    hero.style.backgroundPosition = `center ${rate}px`;
  });
}

function initLightbox() {
  let lbImages = [], lbIndex = 0;

  function buildLightboxData() {
    lbImages = [];
    var containers = document.querySelectorAll('[onclick="openLightbox(this)"]');
    containers.forEach(function(card) {
      var img = card.querySelector('img');
      var capEl = card.querySelector('div[style*="position:absolute"]');
      if (img) {
        lbImages.push({
          src: img.src,
          caption: capEl ? capEl.textContent.trim() : (img.alt || '')
        });
      }
    });
  }

  window.openLightbox = function(card) {
    buildLightboxData();
    var img = card.querySelector('img');
    if (!img) return;
    lbIndex = 0;
    for (var i = 0; i < lbImages.length; i++) {
      if (lbImages[i].src === img.src) { lbIndex = i; break; }
    }
    showLightboxAt(lbIndex);
    var overlay = document.getElementById('lb-overlay');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.showLightboxAt = function(idx) {
    var item = lbImages[idx];
    if (!item) return;
    var lbImg = document.getElementById('lb-img');
    var lbCap = document.getElementById('lb-caption');
    var lbCtr = document.getElementById('lb-counter');
    if (lbImg) lbImg.src = item.src;
    if (lbCap) lbCap.textContent = item.caption;
    if (lbCtr) lbCtr.textContent = (idx + 1) + ' / ' + lbImages.length;
  };

  window.closeLightbox = function() {
    var overlay = document.getElementById('lb-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  window.lbPrev = function() { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLightboxAt(lbIndex); };
  window.lbNext = function() { lbIndex = (lbIndex + 1) % lbImages.length; showLightboxAt(lbIndex); };

  document.addEventListener('keydown', function(e) {
    var overlay = document.getElementById('lb-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') lbPrev();
    if (e.key === 'ArrowRight') lbNext();
    if (e.key === 'Escape') closeLightbox();
  });
}

// ===== PAGE NAVIGATION =====
let isTransitioning = false;
function showPage(id) {
  if (isTransitioning) return;
  isTransitioning = true;

  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.opacity = '0';
  });
  
  const targetPage = document.getElementById('page-' + id);
  if (targetPage) {
    targetPage.classList.add('active');
    setTimeout(() => {
      targetPage.style.opacity = '1';
    }, 10);
  }

  // Handle sidebar, top nav, bottom nav, and footer visibility for clean full-screen experience
  const authDashPages = ['login', 'register', 'admin', 'staff', 'donor', 'volunteer', 'engineer'];
  const sidebar = document.querySelector('.sidebar');
  const mainNav = document.getElementById('main-nav');
  const bottomNav = document.querySelector('.bottom-nav');
  const mainFooter = document.querySelector('footer');
  const mainContent = document.querySelector('.main-content');

  if (authDashPages.includes(id)) {
    if (sidebar) sidebar.style.display = 'none';
    if (mainNav) mainNav.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';
    if (mainFooter) mainFooter.style.display = 'none';
    if (mainContent) {
      mainContent.style.marginLeft = '0';
      mainContent.style.paddingBottom = '0';
      mainContent.style.minHeight = '100vh';
    }
  } else {
    if (sidebar) sidebar.style.display = '';
    if (mainNav) mainNav.style.display = '';
    if (bottomNav) bottomNav.style.display = '';
    if (mainFooter) mainFooter.style.display = '';
    if (mainContent) {
      mainContent.style.marginLeft = '';
      mainContent.style.paddingBottom = '';
      mainContent.style.minHeight = '';
    }
  }
  
  // Clear active states
  document.querySelectorAll('.nav-link, .bottom-nav-link').forEach(l => l.classList.remove('active'));
  
  // Activate links
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  const bottomNavEl = document.getElementById('bottom-nav-' + id);
  if (bottomNavEl) bottomNavEl.classList.add('active');
  
  window.scrollTo(0, 0);
  
  if (id === 'donor') showPortal('overview');
  if (id === 'admin') showAdmin('overview');
  if (id === 'blog') renderBlogPosts();
  if (id === 'engineer') updateEngineerStatus();

  setTimeout(() => { isTransitioning = false; }, 300);
}

function updateEngineerStatus() {
  const mode = document.getElementById('engineer-db-mode');
  if (mode) mode.textContent = window.KCHDatabase?.isConfigured() ? 'Live' : 'Local';
}

function showAdmin(id, trigger) {
  const activeTrigger = trigger || (typeof event !== 'undefined' ? (event.currentTarget || event.target) : null);
  document.querySelectorAll('.admin-page, .admin-view-3d').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link, .nav-btn-3d').forEach(l => l.classList.remove('active'));
  const el = document.getElementById('ap-' + id) || document.getElementById('admin-' + id);
  if (el) el.classList.add('active');
  if (activeTrigger) activeTrigger.classList.add('active');
  if (!activeTrigger) {
    const navButton = document.querySelector(`.nav-btn-3d[onclick*="showAdmin('${id}')"]`);
    if (navButton) navButton.classList.add('active');
  }
  if (id === 'blog') renderAdminBlogPosts();
}

function showPortal(id, trigger) {
  const activeTrigger = trigger || (typeof event !== 'undefined' ? (event.currentTarget || event.target) : null);
  const donorPage = document.getElementById('page-donor');
  donorPage?.querySelectorAll('.portal-page, .admin-view-3d').forEach(p => p.classList.remove('active'));
  donorPage?.querySelectorAll('.portal-sidebar-link, .nav-btn-3d').forEach(l => l.classList.remove('active'));
  const el = document.getElementById('pp-' + id);
  if (el) el.classList.add('active');
  if (activeTrigger) activeTrigger.classList.add('active');
  if (!activeTrigger) {
    const navButton = donorPage?.querySelector(`.nav-btn-3d[onclick*="showPortal('${id}')"]`);
    if (navButton) navButton.classList.add('active');
  }
}

function showTab(btn, id) {
  const parent = btn.closest('.data-card') || btn.closest('.admin-page');
  parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ===== DONATION FLOW =====
let dAmt = 10000, dType = 'once', dMethod = 'mtn';

function setDType(t) {
  dType = t;
  document.getElementById('tog-once').classList.toggle('active', t === 'once');
  document.getElementById('tog-monthly').classList.toggle('active', t === 'monthly');
}

function selAmt(amt, el) {
  dAmt = amt;
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('custom-amount').value = '';
}

function setCustomAmt(v) {
  dAmt = parseInt(v) || 0;
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
}

function selMethod(el, m) {
  dMethod = m;
  document.querySelectorAll('.method-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('fields-mtn').style.display = (m === 'mtn' || m === 'airtel') ? 'block' : 'none';
  document.getElementById('fields-bank').style.display = m === 'bank' ? 'block' : 'none';
  document.getElementById('fields-card').style.display = m === 'card' ? 'block' : 'none';
  const lbl = document.getElementById('momo-label');
  if (lbl) lbl.textContent = m === 'airtel' ? 'Airtel Money number' : 'MTN Mobile Money number';
}

function goStep(n) {
  [1,2,3,4].forEach(i => {
    document.getElementById('ds'+i).style.display = i===n ? 'block' : 'none';
    const si = document.getElementById('si-'+i);
    if (si) {
      si.classList.toggle('active', i===n);
      si.classList.toggle('done', i<n);
    }
  });
  if (n === 4) {
    const fmt = new Intl.NumberFormat('en-UG').format(dAmt);
    document.getElementById('confirm-amount').textContent = 'UGX ' + fmt;
    const mLabels = {mtn:'MTN Mobile Money',airtel:'Airtel Money',bank:'Bank Transfer',card:'Card / PayPal'};
    document.getElementById('confirm-meta').textContent = (dType==='monthly'?'Monthly':'One-Time') + ' Â· ' + (document.getElementById('donate-purpose')?.value||'General Support') + ' Â· ' + (mLabels[dMethod]||'');
    const name = document.getElementById('d-name')?.value || '';
    document.getElementById('confirm-title').textContent = name ? 'Thank you, ' + name.split(' ')[0] + '!' : 'Thank you!';
    const ref = 'KCH-TXN-' + Math.floor(Math.random()*90000+10000);
    document.getElementById('txn-id').textContent = ref;
  }
  window.scrollTo(0,0);
}

function showDonateMonthly() {
  openPaymentModal('monthly');
}

// ===== PAYMENT MODAL =====
function openPaymentModal(dType) {
  window._payType = dType || 'once';
  payAmount = 25000;
  payMethod = 'mtn';
  const overlay = document.getElementById('payment-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  if (document.getElementById('pay-summary-amount')) document.getElementById('pay-summary-amount').textContent = '25,000';
  if (document.getElementById('pay-summary-type')) document.getElementById('pay-summary-type').textContent = window._payType === 'monthly' ? 'Monthly donation' : 'One-time donation';
  if (document.getElementById('pay-custom-amount')) document.getElementById('pay-custom-amount').value = '';
  document.querySelectorAll('.payment-method-btn').forEach(c => c.classList.remove('active'));
  const mtnBtn = document.querySelector('.payment-method-btn[data-method="mtn"]');
  if (mtnBtn) mtnBtn.classList.add('active');
  document.querySelectorAll('.payment-fields').forEach(f => f.classList.remove('visible'));
  const mtnFields = document.getElementById('pay-fields-mtn');
  if (mtnFields) mtnFields.classList.add('visible');
  const submitBtn = document.getElementById('pay-submit-btn');
  if (submitBtn) submitBtn.textContent = 'Pay UGX 25,000 with MTN Mobile Money';
}

function closePaymentModal() {
  const overlay = document.getElementById('payment-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closePaymentModal();
});

function selectPayMethod(m, el) {
  payMethod = m;
  document.querySelectorAll('.payment-method-btn').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  document.querySelectorAll('.payment-fields').forEach(f => f.classList.remove('visible'));
  const fieldMap = {mtn:'pay-fields-mtn', airtel:'pay-fields-airtel', visa:'pay-fields-visa', mastercard:'pay-fields-mastercard', paypal:'pay-fields-paypal', bank:'pay-fields-bank'};
  const fieldId = fieldMap[m];
  if (fieldId) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.add('visible');
  }
  const fmt = payAmount.toLocaleString();
  const typeLabel = window._payType === 'monthly' ? 'Monthly donation' : 'One-time donation';
  if (document.getElementById('pay-summary-amount')) document.getElementById('pay-summary-amount').textContent = fmt;
  if (document.getElementById('pay-summary-type')) document.getElementById('pay-summary-type').textContent = typeLabel;
  const submitBtn = document.getElementById('pay-submit-btn');
  if (submitBtn) {
    if (m === 'mtn') submitBtn.textContent = `Pay UGX ${fmt} with MTN Mobile Money`;
    else if (m === 'airtel') submitBtn.textContent = `Pay UGX ${fmt} with Airtel Money`;
    else if (m === 'bank') submitBtn.textContent = `Donate UGX ${fmt} via Bank Transfer`;
    else submitBtn.textContent = `Donate UGX ${fmt} â€” Complete donation`;
  }
}

function processPayment() {
  const name = document.getElementById('pay-donor-name')?.value?.trim() || 'Friend';
  const txnId = 'KCH-TXN-' + Math.floor(Math.random() * 90000 + 10000);
  let ok = true;
  if (payMethod === 'mtn') {
    const phone = document.getElementById('pay-mtn-phone')?.value?.trim();
    if (!phone || phone.length < 10) {
      showToast('Please enter your MTN Mobile Money phone number.', 'error');
      ok = false;
    }
  } else if (payMethod === 'airtel') {
    const phone = document.getElementById('pay-airtel-phone')?.value?.trim();
    if (!phone || phone.length < 10) {
      showToast('Please enter your Airtel Money phone number.', 'error');
      ok = false;
    }
  } else if (payMethod === 'visa' || payMethod === 'mastercard') {
    const prefix = payMethod === 'visa' ? 'pay-visa' : 'pay-mc';
    const num = document.getElementById(prefix + '-number')?.value?.replace(/\s/g, '') || '';
    const exp = document.getElementById(prefix + '-expiry')?.value?.trim() || '';
    const cvv = document.getElementById(prefix + '-cvv')?.value?.trim() || '';
    if (num.length < 13 || !/^\d+$/.test(num)) {
      showToast('Please enter a valid card number.', 'error');
      ok = false;
    } else if (!/^\d{2}\s*\/\s*\d{2}$/.test(exp) && !/^\d{4}$/.test(exp)) {
      showToast('Please enter expiry as MM/YY.', 'error');
      ok = false;
    } else if (cvv.length < 3) {
      showToast('Please enter a valid CVC.', 'error');
      ok = false;
    }
  } else if (payMethod === 'paypal') {
    const email = document.getElementById('pay-paypal-email')?.value?.trim() || '';
    if (!email.includes('@')) {
      showToast('Please enter a valid PayPal email.', 'error');
      ok = false;
    }
  }
  if (!ok) return;
  const fmt = new Intl.NumberFormat('en-UG').format(payAmount);
  const methodLabels = {mtn:'MTN Mobile Money', airtel:'Airtel Money', bank:'Bank Transfer', visa:'Visa Card', mastercard:'Mastercard', paypal:'PayPal', card:'Credit / Debit Card'};
  const methodLabel = methodLabels[payMethod] || payMethod;
  setTimeout(() => {
    showToast(`Thank you, ${name}. Your UGX ${fmt} donation via ${methodLabel} is being processed. Transaction ID: ${txnId}`, 'info');
    closePaymentModal();
    if (document.getElementById('page-donations-page')) {
    }
  }, 600);
}

// ===== CONTACT FORM =====
function handleContactSubmit(event) {
  event.preventDefault();
  const fname = document.getElementById('contact-fname')?.value.trim();
  const lname = document.getElementById('contact-lname')?.value.trim();
  const email = document.getElementById('contact-email')?.value.trim();
  const subject = document.getElementById('contact-subject')?.value;
  const message = document.getElementById('contact-message')?.value.trim();

  if (!fname || !lname || !email || !message) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  if (!email.includes('@')) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    showToast(`Thank you, ${fname}! Your message has been sent. We'll respond within 24 hours.`);
    event.target.reset();
    btn.textContent = originalText;
    btn.disabled = false;
  }, 1500);
}

// ===== FAQ ACCORDION =====
function toggleFAQ(button) {
  const answer = button.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('active'));
  
  if (!isOpen) {
    answer.classList.add('open');
    button.classList.add('active');
  }
}

// ===== NEWSLETTER =====
function handleNewsletterSubmit(event) {
  event.preventDefault();
  const email = event.target.querySelector('input[type="email"]')?.value.trim();

  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Subscribing...';
  btn.disabled = true;

  setTimeout(() => {
    showToast(`Welcome to the KCH family! Check your inbox (${email}) for our next update.`);
    event.target.reset();
    btn.textContent = originalText;
    btn.disabled = false;
  }, 1000);
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${type === 'error' ? 'var(--red)' : 
                 type === 'success' ? 'var(--green)' : 
                 type === 'warning' ? 'var(--amber)' : 'var(--green-dark)'};
    color: #fff;
    padding: 14px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    z-index: 10000;
    animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    font-size: 14px;
    max-width: 320px;
    backdrop-filter: blur(8px);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===== GALLERY FILTER =====
function filterGallery(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.style.display = (cat === 'all' || item.classList.contains(cat)) ? 'flex' : 'none';
  });
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg || 'Copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
}

// ===== BLOG MANAGEMENT =====
function normalizeBlogPost(post) {
  if (!post) return null;
  return {
    id: post.id,
    title: post.title,
    category: post.category,
    image: post.image,
    excerpt: post.excerpt,
    content: post.content,
    published: !!post.published,
    createdAt: post.createdAt || post.created_at,
    updatedAt: post.updatedAt || post.updated_at
  };
}

async function loadBlogPostsFromStore(admin = false) {
  const rows = await apiCall(admin ? '/admin-data/blog_posts' : '/blog');
  if (!Array.isArray(rows)) throw new Error('The server returned an invalid post list.');
  return rows.map(normalizeBlogPost).filter(Boolean);
}

function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function formatBlogDate(value) {
  try {
    return new Intl.DateTimeFormat('en-UG', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  } catch (e) {
    return 'Recent';
  }
}

async function renderBlogPosts() {
  const grid = document.getElementById('blog-posts');
  const empty = document.getElementById('blog-empty');
  if (!grid) return;

  try {
    const posts = await loadBlogPostsFromStore();
    grid.innerHTML = posts.map(post => `
      <article class="blog-card">
        ${post.image ? `<img src="${escapeHTML(post.image)}" alt="${escapeHTML(post.title)}">` : ''}
        <div class="blog-card-body">
          <div class="blog-meta">
            <span>${escapeHTML(post.category)}</span>
            <span>${formatBlogDate(post.createdAt)}</span>
          </div>
          <h3>${escapeHTML(post.title)}</h3>
          <p>${escapeHTML(post.excerpt)}</p>
          <button class="news-more" type="button" onclick="openBlogPost('${escapeHTML(post.id)}')">Read update</button>
        </div>
      </article>
    `).join('');
    if (empty) empty.style.display = posts.length ? 'none' : 'block';
  } catch (error) {
    console.error('Loading published blog posts failed:', error);
    grid.innerHTML = '';
    if (empty) {
      empty.textContent = `Unable to load updates: ${error.message}`;
      empty.style.display = 'block';
    }
  }
}

async function openBlogPost(id) {
  try {
    const post = (await loadBlogPostsFromStore()).find(item => String(item.id) === String(id));
    if (!post) return showToast('Blog post not found.', 'error');
    alert(`${post.title}\n\n${post.content}`);
  } catch (error) {
    console.error('Loading blog post failed:', error);
    showToast(`Could not load post: ${error.message}`, 'error');
  }
}

async function renderAdminBlogPosts() {
  const list = document.getElementById('admin-blog-list');
  if (!list) return;

  let posts;
  try {
    posts = (await loadBlogPostsFromStore(true)).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  } catch (error) {
    console.error('Loading admin blog posts failed:', error);
    list.innerHTML = `<div class="blog-empty">Unable to load posts: ${escapeHTML(error.message)}</div>`;
    return;
  }
  if (!posts.length) {
    list.innerHTML = '<div class="blog-empty">No posts yet. Create the first update using the form.</div>';
    return;
  }

  list.innerHTML = posts.map(post => `
    <div class="admin-blog-item">
      <div class="blog-meta">
        <span>${escapeHTML(post.category)}</span>
        <span>${post.published ? 'Published' : 'Draft'}</span>
        <span>${formatBlogDate(post.updatedAt || post.createdAt)}</span>
      </div>
      <h4>${escapeHTML(post.title)}</h4>
      <p>${escapeHTML(post.excerpt)}</p>
      <div class="admin-blog-actions">
        <button class="btn btn-sm btn-secondary" type="button" onclick="editBlogPost('${escapeHTML(post.id)}')">Edit</button>
        <button class="btn btn-sm btn-ghost" type="button" onclick="toggleBlogPublish('${escapeHTML(post.id)}')">${post.published ? 'Unpublish' : 'Publish'}</button>
        <button class="btn btn-sm btn-danger" type="button" onclick="deleteBlogPost('${escapeHTML(post.id)}')">Delete</button>
      </div>
    </div>
  `).join('');
}

async function saveBlogPost(event) {
  event.preventDefault();
  const id = document.getElementById('blog-edit-id')?.value;
  const post = {
    title: document.getElementById('blog-title')?.value.trim(),
    category: document.getElementById('blog-category')?.value.trim(),
    image: document.getElementById('blog-image')?.value.trim() || null,
    excerpt: document.getElementById('blog-excerpt')?.value.trim(),
    content: document.getElementById('blog-content')?.value.trim(),
    published: !!document.getElementById('blog-published')?.checked
  };

  if (!post.title || !post.category || !post.excerpt || !post.content) {
    showToast('Please complete the required blog fields.', 'error');
    return;
  }

  try {
    await apiCall(`/admin-data/blog_posts${id ? `/${encodeURIComponent(id)}` : ''}`, id ? 'PUT' : 'POST', post);
    resetBlogForm();
    await renderBlogPosts();
    await renderAdminBlogPosts();
    showToast(id ? 'Blog post updated.' : 'Blog post published.', 'success');
  } catch (error) {
    console.error('Saving blog post failed:', error);
    showToast(`Could not save post: ${error.message}`, 'error');
  }
}

async function editBlogPost(id) {
  try {
    const post = (await loadBlogPostsFromStore(true)).find(item => String(item.id) === String(id));
    if (!post) return showToast('Blog post not found.', 'error');
    document.getElementById('blog-edit-id').value = post.id;
    document.getElementById('blog-title').value = post.title || '';
    document.getElementById('blog-category').value = post.category || '';
    document.getElementById('blog-image').value = post.image || '';
    document.getElementById('blog-excerpt').value = post.excerpt || '';
    document.getElementById('blog-content').value = post.content || '';
    document.getElementById('blog-published').checked = !!post.published;
    const btn = document.getElementById('blog-save-btn');
    if (btn) btn.textContent = 'Save Changes';
  } catch (error) {
    console.error('Loading blog post for editing failed:', error);
    showToast(`Could not load post: ${error.message}`, 'error');
  }
}

async function toggleBlogPublish(id) {
  try {
    const post = (await loadBlogPostsFromStore(true)).find(item => String(item.id) === String(id));
    if (!post) return showToast('Blog post not found.', 'error');
    await apiCall(`/admin-data/blog_posts/${encodeURIComponent(id)}`, 'PUT', { published: !post.published });
    await renderBlogPosts();
    await renderAdminBlogPosts();
    showToast(post.published ? 'Post moved to draft.' : 'Post published.', 'success');
  } catch (error) {
    console.error('Changing blog publication status failed:', error);
    showToast(`Could not update post: ${error.message}`, 'error');
  }
}

async function deleteBlogPost(id) {
  if (!confirm('Delete this blog post?')) return;
  try {
    await apiCall(`/admin-data/blog_posts/${encodeURIComponent(id)}`, 'DELETE');
    resetBlogForm();
    await renderBlogPosts();
    await renderAdminBlogPosts();
    showToast('Blog post deleted.', 'success');
  } catch (error) {
    console.error('Deleting blog post failed:', error);
    showToast(`Could not delete post: ${error.message}`, 'error');
  }
}

function resetBlogForm() {
  const form = document.querySelector('.blog-admin-form');
  if (form) form.reset();
  const id = document.getElementById('blog-edit-id');
  if (id) id.value = '';
  const published = document.getElementById('blog-published');
  if (published) published.checked = true;
  const btn = document.getElementById('blog-save-btn');
  if (btn) btn.textContent = 'Publish Post';
}

// ===== GENERIC CRUD MODAL =====
let crudConfig = null;
let crudEditingId = null;

function openCrudModal(config, existingData) {
  crudConfig = config;
  crudEditingId = existingData ? existingData.id : null;
  document.getElementById('crud-modal-title').textContent = existingData ? `Edit ${config.singular}` : `Add ${config.singular}`;
  const fieldsContainer = document.getElementById('crud-modal-fields');
  fieldsContainer.innerHTML = config.fields.map(f => {
    const val = existingData ? (existingData[f.key] ?? '') : '';
    if (f.type === 'select') {
      const opts = f.options.map(option => {
        const item = typeof option === 'string' ? { value: option, label: option } : option;
        return `<option value="${escapeHTML(item.value)}" ${String(val) === String(item.value) ? 'selected' : ''}>${escapeHTML(item.label)}</option>`;
      }).join('');
      return `<div class="admin-form-group"><label class="admin-form-label">${escapeHTML(f.label)}</label><select class="admin-form-input" data-field="${escapeHTML(f.key)}" ${f.required ? 'required' : ''}>${opts}</select></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="admin-form-group"><label class="admin-form-label">${escapeHTML(f.label)}</label><textarea class="admin-form-input admin-form-textarea" data-field="${escapeHTML(f.key)}" rows="${f.rows||4}" ${f.required?'required':''}>${escapeHTML(val)}</textarea></div>`;
    }
    return `<div class="admin-form-group"><label class="admin-form-label">${escapeHTML(f.label)}</label><input class="admin-form-input" type="${f.type||'text'}" data-field="${escapeHTML(f.key)}" value="${escapeHTML(val)}" ${f.required?'required':''} ${f.placeholder?`placeholder="${escapeHTML(f.placeholder)}"`:''}></div>`;
  }).join('');
  document.getElementById('crud-submit-btn').textContent = existingData ? `Save Changes` : `Add ${config.singular}`;
  document.getElementById('admin-crud-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeCrudModal() {
  document.getElementById('admin-crud-modal').style.display = 'none';
  document.body.style.overflow = '';
  crudConfig = null;
  crudEditingId = null;
}

async function handleCrudSubmit(event) {
  event.preventDefault();
  if (!crudConfig) return;
  const data = { id: crudEditingId || Date.now().toString() };
  crudConfig.fields.forEach(f => {
    const el = document.querySelector(`#crud-modal-fields [data-field="${f.key}"]`);
    data[f.key] = el ? el.value.trim() : '';
  });
  const submitButton = document.getElementById('crud-submit-btn');
  if (submitButton) submitButton.disabled = true;
  try {
    await crudConfig.onSubmit(data, crudEditingId);
    closeCrudModal();
  } catch (error) {
    console.error('Saving admin record failed:', error);
    showToast(`Could not save record: ${error.message}`, 'error');
    if (submitButton) submitButton.disabled = false;
  }
}

// ===== GENERIC DELETE MODAL =====
let deleteCallback = null;

function openDeleteModal(title, callback) {
  document.getElementById('delete-modal-title').textContent = title;
  deleteCallback = callback;
  document.getElementById('admin-delete-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  document.getElementById('admin-delete-modal').style.display = 'none';
  document.body.style.overflow = '';
  deleteCallback = null;
}

async function confirmDelete() {
  if (!deleteCallback) return;
  const result = await deleteCallback();
  if (result !== false) closeDeleteModal();
}

// ===== CHILDREN, DONATIONS AND STAFF DATA =====
let childrenCache = [];
let donationsCache = [];
let staffCache = [];

async function renderChildrenTable() {
  const tbody = document.getElementById('admin-children-tbody');
  if (!tbody) return;
  setAdminTableMessage(tbody, 6, 'Loading children…');
  try {
    childrenCache = await fetchChildren();
    if (!childrenCache.length) return setAdminTableMessage(tbody, 6, 'No child records have been added yet.');
    tbody.innerHTML = childrenCache.map(child => `
      <tr data-id="${escapeHTML(child.id)}">
        <td><strong>${escapeHTML(child.name)}</strong></td>
        <td>${escapeHTML(child.age ?? '—')}</td>
        <td>${escapeHTML(child.gender)}</td>
        <td>${renderAdminBadge(child.status)}</td>
        <td>${child.sponsor_id ? 'Yes' : 'No'}</td>
        <td><div class="admin-actions">
          <button class="admin-action-btn view" type="button" onclick="viewChild('${escapeHTML(child.id)}')">View</button>
          <button class="admin-action-btn edit" type="button" onclick="editChild('${escapeHTML(child.id)}')">Edit</button>
          <button class="admin-action-btn delete" type="button" onclick="deleteChild('${escapeHTML(child.id)}')">Delete</button>
        </div></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Loading children failed:', error);
    setAdminTableMessage(tbody, 6, `Could not load children: ${error.message}`);
  }
}

function childFormConfig() {
  return {
    singular: 'Child',
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'age', label: 'Age', type: 'number', required: true },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Graduated', 'Sponsored'] },
      { key: 'sponsor_id', label: 'Sponsor user ID', type: 'number' },
      { key: 'enrollment_date', label: 'Enrollment date', type: 'date' },
      { key: 'bio', label: 'Notes', type: 'textarea' },
      { key: 'medical_info', label: 'Medical notes', type: 'textarea' }
    ],
    onSubmit: saveChildRecord
  };
}

function viewChild(id) {
  const child = childrenCache.find(item => String(item.id) === String(id));
  if (!child) return showToast('Child record not found. Refresh and try again.', 'error');
  alert(`${child.name}\nStatus: ${child.status || '—'}\nAge: ${child.age ?? '—'}\nNotes: ${child.bio || '—'}`);
}

function editChild(id) {
  const child = childrenCache.find(item => String(item.id) === String(id));
  if (!child) return showToast('Child record not found. Refresh and try again.', 'error');
  openCrudModal(childFormConfig(), child);
}

function addChild() {
  openCrudModal(childFormConfig(), null);
}

async function saveChildRecord(data, existingId) {
  const payload = { ...data, age: Number(data.age) };
  delete payload.id;
  payload.sponsor_id = payload.sponsor_id ? Number(payload.sponsor_id) : null;
  await apiCall(`/children${existingId ? `/${encodeURIComponent(existingId)}` : ''}`, existingId ? 'PUT' : 'POST', payload);
  await renderChildrenTable();
  showToast(existingId ? 'Child record updated.' : 'Child added successfully.', 'success');
}

function deleteChild(id) {
  const child = childrenCache.find(item => String(item.id) === String(id));
  if (!child) return showToast('Child record not found. Refresh and try again.', 'error');
  openDeleteModal(`Delete ${child.name}?`, async () => {
    try {
      await apiCall(`/children/${encodeURIComponent(id)}`, 'DELETE');
      await renderChildrenTable();
      showToast('Child record deleted.', 'success');
      return true;
    } catch (error) {
      console.error('Deleting child failed:', error);
      showToast(`Could not delete child: ${error.message}`, 'error');
      return false;
    }
  });
}

async function renderDonationsTable() {
  const tbody = document.getElementById('admin-donations');
  if (!tbody) return;
  setAdminTableMessage(tbody, 7, 'Loading donations…');
  try {
    donationsCache = await fetchDonations();
    if (!donationsCache.length) {
      setAdminTableMessage(tbody, 7, 'No donation records have been added yet.');
      await renderFundraisingMetrics(donationsCache);
      return;
    }
    tbody.innerHTML = donationsCache.map(donation => `
      <tr data-id="${escapeHTML(donation.id)}">
        <td>${formatAdminDate(donation.donation_date)}</td>
        <td><strong>${escapeHTML(donation.donor_name)}</strong></td>
        <td>${formatAdminMoney(donation.amount)}</td>
        <td>${escapeHTML(donation.method)}</td>
        <td>${renderAdminBadge(donation.status)}</td>
        <td>${escapeHTML(donation.notes || '—')}</td>
        <td><div class="admin-actions">
          <button class="admin-action-btn view" type="button" onclick="viewDonation('${escapeHTML(donation.id)}')">View</button>
          <button class="admin-action-btn edit" type="button" onclick="editDonation('${escapeHTML(donation.id)}')">Edit</button>
          <button class="admin-action-btn delete" type="button" onclick="deleteDonation('${escapeHTML(donation.id)}')">Delete</button>
        </div></td>
      </tr>
    `).join('');
    await renderFundraisingMetrics(donationsCache);
  } catch (error) {
    console.error('Loading donations failed:', error);
    setAdminTableMessage(tbody, 7, `Could not load donations: ${error.message}`);
  }
}

function donationFormConfig() {
  return {
    singular: 'Donation',
    fields: [
      { key: 'donor_name', label: 'Donor name', required: true },
      { key: 'donor_email', label: 'Donor email', type: 'email' },
      { key: 'amount', label: 'Amount (UGX)', type: 'number', required: true },
      { key: 'method', label: 'Payment method', type: 'select', options: ['bank_transfer', 'mobile_money', 'credit_card', 'check'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Received', 'Declined'] },
      { key: 'donation_date', label: 'Date', type: 'date' },
      { key: 'notes', label: 'Reference or notes', type: 'textarea' }
    ],
    onSubmit: saveDonationRecord
  };
}

function viewDonation(id) {
  const donation = donationsCache.find(item => String(item.id) === String(id));
  if (!donation) return showToast('Donation not found. Refresh and try again.', 'error');
  alert(`${donation.donor_name}\nAmount: ${formatAdminMoney(donation.amount)}\nStatus: ${donation.status}\nNotes: ${donation.notes || '—'}`);
}

function editDonation(id) {
  const donation = donationsCache.find(item => String(item.id) === String(id));
  if (!donation) return showToast('Donation not found. Refresh and try again.', 'error');
  openCrudModal(donationFormConfig(), donation);
}

function addDonation() {
  openCrudModal(donationFormConfig(), null);
}

async function saveDonationRecord(data, existingId) {
  const payload = { ...data, amount: Number(data.amount) };
  delete payload.id;
  await apiCall(`/donations${existingId ? `/${encodeURIComponent(existingId)}` : ''}`, existingId ? 'PUT' : 'POST', payload);
  await renderDonationsTable();
  showToast(existingId ? 'Donation record updated.' : 'Donation record added.', 'success');
}

function deleteDonation(id) {
  const donation = donationsCache.find(item => String(item.id) === String(id));
  if (!donation) return showToast('Donation not found. Refresh and try again.', 'error');
  openDeleteModal(`Delete donation from ${donation.donor_name}?`, async () => {
    try {
      await apiCall(`/donations/${encodeURIComponent(id)}`, 'DELETE');
      await renderDonationsTable();
      showToast('Donation record deleted.', 'success');
      return true;
    } catch (error) {
      console.error('Deleting donation failed:', error);
      showToast(`Could not delete donation: ${error.message}`, 'error');
      return false;
    }
  });
}

async function loadStaffDirectory() {
  staffCache = await apiCall('/staff');
  if (!Array.isArray(staffCache)) throw new Error('The server returned an invalid staff list.');
}

async function renderStaffTable() {
  const tbody = document.getElementById('admin-staff-tbody');
  if (!tbody) return;
  setAdminTableMessage(tbody, 5, 'Loading staff…');
  try {
    await loadStaffDirectory();
    if (!staffCache.length) setAdminTableMessage(tbody, 5, 'No staff records have been added yet.');
    else tbody.innerHTML = staffCache.map(member => `
      <tr data-id="${escapeHTML(member.id)}">
        <td><strong>${escapeHTML(member.name)}</strong></td>
        <td>${escapeHTML(member.role)}</td>
        <td>${escapeHTML(member.email)}</td>
        <td>${renderAdminBadge(member.status)}</td>
        <td><div class="admin-actions">
          <button class="admin-action-btn edit" type="button" onclick="editStaff('${escapeHTML(member.id)}')">Edit</button>
          <button class="admin-action-btn delete" type="button" onclick="deleteStaff('${escapeHTML(member.id)}')">Remove</button>
        </div></td>
      </tr>
    `).join('');
    renderStaffManagementTable();
  } catch (error) {
    console.error('Loading staff failed:', error);
    setAdminTableMessage(tbody, 5, `Could not load staff: ${error.message}`);
  }
}

async function renderStaffManagementTable() {
  const container = document.getElementById('staffTableContainer');
  if (!container) return;
  if (!staffCache.length) {
    try {
      await loadStaffDirectory();
    } catch (error) {
      console.error('Loading staff management list failed:', error);
      container.textContent = `Could not load staff: ${error.message}`;
      return;
    }
  }
  if (!staffCache.length) {
    container.textContent = 'No staff records have been added yet.';
    return;
  }
  container.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
        <tbody>${staffCache.map(member => `
          <tr>
            <td><strong>${escapeHTML(member.name)}</strong></td>
            <td>${escapeHTML(member.role)}</td>
            <td>${escapeHTML(member.email)}</td>
            <td>${escapeHTML(member.phone || '—')}</td>
            <td>${renderAdminBadge(member.status)}</td>
          </tr>
        `).join('')}</tbody>
      </table>
    </div>
  `;
}

function staffFormConfig() {
  return {
    singular: 'Staff Member',
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'email', label: 'Email address', type: 'email', required: true },
      { key: 'role', label: 'Role', type: 'select', options: ['staff', 'manager', 'coordinator'], required: true },
      { key: 'phone', label: 'Phone' }
    ],
    onSubmit: saveStaffRecord
  };
}

function editStaff(id) {
  const member = staffCache.find(item => String(item.id) === String(id));
  if (!member) return showToast('Staff member not found. Refresh and try again.', 'error');
  openCrudModal({
    singular: 'Staff Member',
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'role', label: 'Role', type: 'select', options: ['staff', 'manager', 'coordinator'], required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], required: true }
    ],
    onSubmit: saveStaffRecord
  }, member);
}

function addStaff() {
  openCrudModal(staffFormConfig(), null);
}

async function saveStaffRecord(data, existingId) {
  const payload = { ...data };
  delete payload.id;
  const result = await apiCall(`/staff${existingId ? `/${encodeURIComponent(existingId)}` : ''}`, existingId ? 'PUT' : 'POST', payload);
  await loadStaffDirectory();
  await renderStaffTable();
  if (result.tempPassword) {
    alert(`Temporary password for ${result.email}: ${result.tempPassword}\nShare this password securely.`);
  }
  showToast(existingId ? 'Staff record updated.' : 'Staff member added.', 'success');
}

async function handleAdminStaffSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  try {
    const result = await apiCall('/staff', 'POST', {
      name: document.getElementById('staffName').value.trim(),
      email: document.getElementById('staffEmail').value.trim(),
      role: document.getElementById('staffRole').value,
      phone: document.getElementById('staffPhone').value.trim()
    });
    form.reset();
    await loadStaffDirectory();
    await renderStaffTable();
    if (result.tempPassword) {
      alert(`Temporary password for ${result.email}: ${result.tempPassword}\nShare this password securely.`);
    }
    showToast('Staff member added successfully.', 'success');
  } catch (error) {
    console.error('Adding staff member failed:', error);
    showToast(`Could not add staff member: ${error.message}`, 'error');
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

function deleteStaff(id) {
  const member = staffCache.find(item => String(item.id) === String(id));
  if (!member) return showToast('Staff member not found. Refresh and try again.', 'error');
  openDeleteModal(`Remove ${member.name} from staff?`, async () => {
    try {
      await apiCall(`/staff/${encodeURIComponent(id)}`, 'DELETE');
      await loadStaffDirectory();
      await renderStaffTable();
      showToast('Staff member removed.', 'success');
      return true;
    } catch (error) {
      console.error('Removing staff member failed:', error);
      showToast(`Could not remove staff member: ${error.message}`, 'error');
      return false;
    }
  });
}

// ===== GALLERY CRUD =====
let galleryCache = [];

async function renderGalleryTable() {
  const container = document.getElementById('admin-gallery-list');
  if (!container) return;
  container.textContent = 'Loading gallery records…';
  try {
    galleryCache = await apiCall('/admin-data/gallery');
    if (!Array.isArray(galleryCache)) throw new Error('The server returned an invalid gallery list.');
    if (!galleryCache.length) {
      container.textContent = 'No gallery items have been added yet.';
      return;
    }
    container.innerHTML = galleryCache.map(item => `
      <div class="admin-blog-item" data-id="${escapeHTML(item.id)}" style="display:flex;gap:16px;align-items:center">
        <img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.title)}" style="width:80px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0">
        <div style="flex:1;min-width:0">
          <div class="blog-meta"><span>${escapeHTML(item.category)}</span><span>${formatAdminDate(item.date)}</span></div>
          <h4 style="margin:4px 0 0">${escapeHTML(item.title)}</h4>
        </div>
        <div class="admin-blog-actions">
          <button class="btn btn-sm btn-secondary" type="button" onclick="editGalleryItem('${escapeHTML(item.id)}')">Edit</button>
          <button class="btn btn-sm btn-danger" type="button" onclick="deleteGalleryItem('${escapeHTML(item.id)}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Loading gallery failed:', error);
    container.textContent = `Could not load gallery: ${error.message}`;
  }
}

function galleryFormConfig() {
  return {
    singular: 'Photo',
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'category', label: 'Category', type: 'select', options: [
        'education', 'feed', 'graduation', 'volunteers', 'community', 'infrastructure'
      ], required: true },
      { key: 'src', label: 'Image path or URL', required: true, placeholder: 'img/folder/image.jpg' },
      { key: 'date', label: 'Date', type: 'date' }
    ],
    onSubmit: saveGalleryRecord
  };
}

function addGalleryItem() {
  const config = galleryFormConfig();
  openCrudModal(config, null);
}

function editGalleryItem(id) {
  const item = galleryCache.find(record => String(record.id) === String(id));
  if (!item) return showToast('Gallery item not found. Refresh and try again.', 'error');
  openCrudModal(galleryFormConfig(), item);
}

async function saveGalleryRecord(data, existingId) {
  const payload = { ...data };
  delete payload.id;
  await apiCall(`/admin-data/gallery${existingId ? `/${encodeURIComponent(existingId)}` : ''}`, existingId ? 'PUT' : 'POST', payload);
  await renderGalleryTable();
  showToast(existingId ? 'Gallery item updated.' : 'Photo added to gallery.', 'success');
}

function deleteGalleryItem(id) {
  const item = galleryCache.find(record => String(record.id) === String(id));
  if (!item) return showToast('Gallery item not found. Refresh and try again.', 'error');
  openDeleteModal(`Delete "${item.title}" from gallery?`, async () => {
    try {
      await apiCall(`/admin-data/gallery/${encodeURIComponent(id)}`, 'DELETE');
      await renderGalleryTable();
      showToast('Gallery item deleted.', 'success');
      return true;
    } catch (error) {
      console.error('Deleting gallery item failed:', error);
      showToast(`Could not delete gallery item: ${error.message}`, 'error');
      return false;
    }
  });
}

// ===== ADMIN NAVIGATION =====
function showAdmin(sectionId, trigger) {
  const activeTrigger = trigger || (typeof event !== 'undefined' ? (event.currentTarget || event.target) : null);
  
  // 1. Hide all possible admin sections/pages
  document.querySelectorAll('.admin-section, .admin-page, .admin-view-3d').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  
  // 2. Show target section (Support both admin- and ap- prefixes)
  const target = document.getElementById('admin-' + sectionId) || document.getElementById('ap-' + sectionId);
  if (target) {
    target.style.display = 'block';
    target.classList.add('active');
  }

  // 3. Update Nav Button Active State (Sidebar and Nav Pills)
  document.querySelectorAll('.admin-nav-btn, .sidebar-link, .nav-btn-3d').forEach(b => b.classList.remove('active'));
  
  const activeBtn = activeTrigger || document.querySelector(`[onclick*="'${sectionId}'"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // 4. Enterprise Module Breadcrumb Names
  const names = {
    overview: '1. Main Overview & Live Pulse',
    donations: '2. General Donation Engine',
    recurring: '3. Recurring Giving & Subscriptions',
    campaigns: '4. Campaign & Appeal Builder',
    p2p: '5. Peer-to-Peer Fundraising Hub',
    children: '6. Sponsor-a-Child Profiles',
    matching: '7. Sponsorship Matching & Ledger',
    correspondence: '8. Moderated Supporter Correspondence',
    crm: '9. Constituent Relationship Manager (CRM)',
    cases: '10. Beneficiary Case Management',
    volunteers: '11. Volunteer Onboarding & Roster',
    scheduling: '12. Volunteer Scheduling & Shift Logs',
    cms: '13. Content Management System (CMS)',
    events: '14. Public Event & Ticket Coordinator',
    inventory: '15. Inventory & Asset Control',
    logistics: '16. Logistics & Supply Distribution',
    budget: '17. Operational Budget & Expense Tracker',
    grants: '18. Grant Compliance & Tracking',
    governance: '19. Governance, Roles, & Permissions',
    privacy: '20. Data Privacy & Redaction Center',
    'manage-staff': 'Staff Administration'
  };

  const breadcrumb = document.getElementById('breadcrumb-current');
  if (breadcrumb) {
    breadcrumb.textContent = names[sectionId] || (sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
  }

  const sidebar = document.querySelector('.admin-sidebar');
  const mobileMenuButton = document.getElementById('mobile-menu-btn');
  if (sidebar) sidebar.classList.remove('open');
  if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');

  // "Make it Life" - Trigger functional renderers
  refreshAdminModule(sectionId);
}

function toggleAdminMenu() {
  const sidebar = document.querySelector('.admin-sidebar');
  const button = document.getElementById('mobile-menu-btn');
  if (!sidebar || !button) return;

  const isOpen = sidebar.classList.toggle('open');
  button.setAttribute('aria-expanded', String(isOpen));
}

function openAdminSection(id) {
  const trigger = typeof event !== 'undefined' ? (event.currentTarget || event.target) : null;
  showAdmin(id, trigger);
}

/**
 * The Engine: Refreshes data based on the active enterprise pillar
 */
function refreshAdminModule(id) {
  if (id === 'overview') {
    updateLiveImpactCounters();
    updateActivityStream();
    renderOverviewQuickActions();
  }

  if (id === 'donations') renderDonationsTable();
  if (id === 'campaigns') renderAdminResourceTable('campaigns');
  if (id === 'peertopeer' || id === 'p2p') renderAdminResourceTable('peer_fundraising');
  if (id === 'events') renderAdminResourceTable('events');
  if (id === 'children') renderChildrenTable();
  if (id === 'staff') renderStaffTable();
  if (id === 'manage-staff') renderStaffManagementTable();
  if (id === 'registrations') renderUserRegistrationsTable();
  if (id === 'volunteers') renderAdminResourceTable('volunteers');
  if (id === 'inventory') renderAdminResourceTable('inventory');
  if (id === 'logistics') renderAdminResourceTable('logistics');
  if (id === 'budget') renderAdminResourceTable('budget');
  if (id === 'blog') renderAdminBlogPosts();
  if (id === 'gallery') renderGalleryTable();
  if (id === 'correspondence') renderAdminResourceTable('correspondence');
  if (id === 'grants') renderAdminResourceTable('grants');
  if (id === 'sponsorships') renderAdminResourceTable('sponsorships');
  if (id === 'roles') renderAdminRolesTable();
  if (id === 'cms') {
    renderAdminBlogPosts();
    renderGalleryTable();
  }
}

const ADMIN_RESOURCE_CONFIGS = {
  campaigns: {
    title: 'Campaign',
    tbody: 'admin-campaigns-tbody',
    fields: [
      { key: 'name', label: 'Campaign name', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'goal_amount', label: 'Goal (UGX)', type: 'number', required: true },
      { key: 'raised_amount', label: 'Raised (UGX)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Active', 'Completed', 'Cancelled'] },
      { key: 'start_date', label: 'Start date', type: 'date' },
      { key: 'end_date', label: 'End date', type: 'date' }
    ],
    columns: [
      ['Campaign Name', r => `<strong>${escapeHTML(r.name)}</strong>`],
      ['Goal (UGX)', r => formatAdminMoney(r.goal_amount)],
      ['Raised (UGX)', r => formatAdminMoney(r.raised_amount)],
      ['Status', r => renderAdminBadge(r.status)],
      ['Progress', r => {
        const goal = Number(r.goal_amount) || 0;
        const progress = goal ? Math.min(Math.round((Number(r.raised_amount || 0) / goal) * 100), 100) : 0;
        return `${progress}%`;
      }]
    ]
  },
  sponsorships: {
    title: 'Sponsorship',
    tbody: 'admin-sponsorships-tbody',
    fields: [
      { key: 'child_id', label: 'Child ID', type: 'number', required: true },
      { key: 'sponsor_id', label: 'Sponsor user ID', type: 'number', required: true },
      { key: 'sponsor_name', label: 'Sponsor name' },
      { key: 'start_date', label: 'Start date', type: 'date' },
      { key: 'end_date', label: 'Renewal date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Paused', 'Completed'] },
      { key: 'monthly_amount', label: 'Monthly amount (UGX)', type: 'number' }
    ],
    columns: [
      ['Child', r => escapeHTML(r.child_name || `Child #${r.child_id}`)],
      ['Sponsor', r => escapeHTML(r.sponsor_display_name || `User #${r.sponsor_id}`)],
      ['Start Date', r => formatAdminDate(r.start_date)],
      ['Status', r => renderAdminBadge(r.status)],
      ['Renewal Date', r => formatAdminDate(r.end_date)]
    ]
  },
  peer_fundraising: {
    title: 'Peer fundraiser',
    tbody: 'admin-peertopeer-tbody',
    fields: [
      { key: 'ambassador_name', label: 'Ambassador name', required: true },
      { key: 'campaign', label: 'Campaign', required: true },
      { key: 'target_amount', label: 'Target (UGX)', type: 'number', required: true },
      { key: 'raised_amount', label: 'Raised (UGX)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Active', 'Completed', 'Cancelled'] }
    ],
    columns: [
      ['Ambassador Name', r => `<strong>${escapeHTML(r.ambassador_name)}</strong>`],
      ['Campaign', r => escapeHTML(r.campaign)],
      ['Target (UGX)', r => formatAdminMoney(r.target_amount)],
      ['Raised (UGX)', r => formatAdminMoney(r.raised_amount)],
      ['Status', r => renderAdminBadge(r.status)]
    ]
  },
  events: {
    title: 'Event',
    tbody: 'admin-events-tbody',
    fields: [
      { key: 'name', label: 'Event name', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'event_date', label: 'Event date', type: 'date', required: true },
      { key: 'location', label: 'Location' },
      { key: 'event_type', label: 'Event type', type: 'select', options: ['Fundraising', 'Community', 'Workshop'] },
      { key: 'expected_attendees', label: 'Expected attendees', type: 'number' },
      { key: 'actual_attendees', label: 'Registrations', type: 'number' },
      { key: 'revenue', label: 'Revenue (UGX)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Active', 'Completed', 'Cancelled'] }
    ],
    columns: [
      ['Event Name', r => `<strong>${escapeHTML(r.name)}</strong>`],
      ['Date', r => formatAdminDate(r.event_date)],
      ['Location', r => escapeHTML(r.location)],
      ['Registrations', r => escapeHTML(r.actual_attendees ?? 0)],
      ['Revenue (UGX)', r => formatAdminMoney(r.revenue)]
    ]
  },
  volunteers: {
    title: 'Volunteer',
    tbody: 'admin-volunteers-tbody',
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone' },
      { key: 'hours_contributed', label: 'Hours', type: 'number' },
      { key: 'last_visit_date', label: 'Last visit', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'On Break'] },
      { key: 'bio', label: 'Notes', type: 'textarea' }
    ],
    columns: [
      ['Name', r => `<strong>${escapeHTML(r.name)}</strong>`],
      ['Email', r => escapeHTML(r.email)],
      ['Hours', r => escapeHTML(r.hours_contributed ?? 0)],
      ['Last Visit', r => formatAdminDate(r.last_visit_date)],
      ['Status', r => renderAdminBadge(r.status)]
    ]
  },
  inventory: {
    title: 'Inventory item',
    tbody: 'admin-inventory-tbody',
    fields: [
      { key: 'item_name', label: 'Item name', required: true },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'unit_price', label: 'Unit price (UGX)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
      { key: 'location', label: 'Location' }
    ],
    columns: [
      ['Item Name', r => `<strong>${escapeHTML(r.item_name)}</strong>`],
      ['Category', r => escapeHTML(r.category)],
      ['Quantity', r => escapeHTML(r.quantity ?? 0)],
      ['Unit Price (UGX)', r => formatAdminMoney(r.unit_price)],
      ['Total Value', r => formatAdminMoney(Number(r.quantity || 0) * Number(r.unit_price || 0))],
      ['Status', r => renderAdminBadge(r.status)]
    ]
  },
  logistics: {
    title: 'Shipment',
    tbody: 'admin-logistics-tbody',
    fields: [
      { key: 'shipment_id', label: 'Shipment ID', required: true },
      { key: 'destination', label: 'Destination', required: true },
      { key: 'items', label: 'Items', type: 'textarea' },
      { key: 'sent_date', label: 'Sent date', type: 'date' },
      { key: 'received_date', label: 'Received date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Transit', 'Delivered', 'Delayed'] },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ],
    columns: [
      ['Shipment ID', r => escapeHTML(r.shipment_id)],
      ['Destination', r => escapeHTML(r.destination)],
      ['Items', r => escapeHTML(r.items)],
      ['Sent Date', r => formatAdminDate(r.sent_date)],
      ['Received Date', r => formatAdminDate(r.received_date)],
      ['Status', r => renderAdminBadge(r.status)]
    ]
  },
  budget: {
    title: 'Budget',
    tbody: 'admin-budget-tbody',
    fields: [
      { key: 'category', label: 'Category', required: true },
      { key: 'budgeted_amount', label: 'Budgeted (UGX)', type: 'number', required: true },
      { key: 'spent_amount', label: 'Spent (UGX)', type: 'number' },
      { key: 'fiscal_year', label: 'Fiscal year', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['On Track', 'At Risk', 'Over Budget'] }
    ],
    columns: [
      ['Category', r => escapeHTML(r.category)],
      ['Budgeted (UGX)', r => formatAdminMoney(r.budgeted_amount)],
      ['Spent (UGX)', r => formatAdminMoney(r.spent_amount)],
      ['Variance', r => formatAdminMoney(Number(r.budgeted_amount || 0) - Number(r.spent_amount || 0))],
      ['% of Budget', r => `${r.budgeted_amount ? Math.round((Number(r.spent_amount || 0) / Number(r.budgeted_amount)) * 100) : 0}%`],
      ['Status', r => renderAdminBadge(r.status)]
    ]
  },
  correspondence: {
    title: 'Correspondence',
    tbody: 'admin-correspondence-tbody',
    fields: [
      { key: 'type', label: 'Type', type: 'select', options: ['Thank You Letter', 'Progress Report', 'Invitation', 'Other'] },
      { key: 'title', label: 'Title', required: true },
      { key: 'sent_date', label: 'Date', type: 'date' },
      { key: 'recipient', label: 'Recipient' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Sent', 'Archived'] },
      { key: 'content', label: 'Content', type: 'textarea' }
    ],
    columns: [
      ['Type', r => escapeHTML(r.type)],
      ['Title', r => escapeHTML(r.title)],
      ['Date', r => formatAdminDate(r.sent_date || r.created_at)],
      ['Recipient', r => escapeHTML(r.recipient)],
      ['Status', r => renderAdminBadge(r.status)]
    ]
  },
  grants: {
    title: 'Grant',
    tbody: 'admin-grants-tbody',
    fields: [
      { key: 'name', label: 'Grant name', required: true },
      { key: 'funder', label: 'Funder' },
      { key: 'amount', label: 'Amount (UGX)', type: 'number' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Applied', 'Approved', 'Rejected', 'Active', 'Completed'] },
      { key: 'description', label: 'Description', type: 'textarea' }
    ],
    columns: [
      ['Grant Name', r => `<strong>${escapeHTML(r.name)}</strong>`],
      ['Funder', r => escapeHTML(r.funder)],
      ['Amount (UGX)', r => formatAdminMoney(r.amount)],
      ['Deadline', r => formatAdminDate(r.deadline)],
      ['Status', r => renderAdminBadge(r.status)]
    ]
  }
};

const adminResourceCache = Object.create(null);

function formatAdminMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `UGX ${amount.toLocaleString()}` : '—';
}

function formatAdminDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : escapeHTML(date.toLocaleDateString());
}

function renderAdminBadge(value) {
  const status = String(value || '—');
  const style = ['Active', 'Completed', 'Delivered', 'In Stock', 'On Track', 'Approved', 'Sent'].includes(status)
    ? 'admin-badge-success'
    : ['Pending', 'Planning', 'Low Stock', 'At Risk', 'Applied', 'Draft', 'On Break'].includes(status)
      ? 'admin-badge-warning'
      : ['Inactive', 'Cancelled', 'Delayed', 'Out of Stock', 'Over Budget', 'Rejected'].includes(status)
        ? 'admin-badge-danger'
        : 'admin-badge-neutral';
  return `<span class="admin-badge ${style}">${escapeHTML(status)}</span>`;
}

function setAdminTableMessage(tbody, colspan, message) {
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;padding:20px;color:#718096;">${escapeHTML(message)}</td></tr>`;
}

async function renderAdminResourceTable(key) {
  const config = ADMIN_RESOURCE_CONFIGS[key];
  const tbody = config && document.getElementById(config.tbody);
  if (!config || !tbody) return;

  setAdminTableMessage(tbody, config.columns.length + 1, 'Loading records…');
  try {
    const records = await apiCall(`/admin-data/${key}`);
    if (!Array.isArray(records)) throw new Error('The server returned an invalid record list.');
    adminResourceCache[key] = records;
    if (!records.length) {
      setAdminTableMessage(tbody, config.columns.length + 1, 'No records have been added yet.');
      return;
    }

    tbody.innerHTML = records.map(record => `
      <tr data-id="${escapeHTML(record.id)}">
        ${config.columns.map(([, render]) => `<td>${render(record)}</td>`).join('')}
        <td>
          <div class="admin-actions">
            <button class="admin-action-btn edit" type="button" onclick="editAdminResource('${key}', '${escapeHTML(record.id)}')">Edit</button>
            <button class="admin-action-btn delete" type="button" onclick="deleteAdminResource('${key}', '${escapeHTML(record.id)}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error(`Loading ${key} failed:`, error);
    setAdminTableMessage(tbody, config.columns.length + 1, `Could not load records: ${error.message}`);
  }
}

async function renderAdminRolesTable() {
  const tbody = document.getElementById('admin-roles-tbody');
  if (!tbody) return;
  setAdminTableMessage(tbody, 5, 'Loading roles…');
  try {
    const roles = await apiCall('/admin-data/roles');
    if (!Array.isArray(roles)) throw new Error('The server returned an invalid role list.');
    if (!roles.length) {
      setAdminTableMessage(tbody, 5, 'No user roles are configured.');
      return;
    }
    tbody.innerHTML = roles.map(role => `
      <tr>
        <td><strong>${escapeHTML(role.role)}</strong></td>
        <td>${escapeHTML(role.role === 'admin' ? 'Administrator access' : 'Standard account access')}</td>
        <td>${escapeHTML(role.user_count)}</td>
        <td>${formatAdminDate(role.created_at)}</td>
        <td>${renderAdminBadge(role.role)}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Loading roles failed:', error);
    setAdminTableMessage(tbody, 5, `Could not load roles: ${error.message}`);
  }
}

function openAdminResourceForm(key, record) {
  const config = ADMIN_RESOURCE_CONFIGS[key];
  if (!config) return;
  openCrudModal({
    singular: config.title,
    fields: config.fields,
    onSubmit: (data, existingId) => saveAdminResource(key, data, existingId)
  }, record || null);
}

function editAdminResource(key, id) {
  const record = (adminResourceCache[key] || []).find(item => String(item.id) === String(id));
  if (!record) {
    showToast('This record is no longer available. Refresh the section and try again.', 'error');
    return;
  }
  openAdminResourceForm(key, record);
}

async function saveAdminResource(key, data, id) {
  const payload = { ...data };
  delete payload.id;
  await apiCall(`/admin-data/${key}${id ? `/${encodeURIComponent(id)}` : ''}`, id ? 'PUT' : 'POST', payload);
  await renderAdminResourceTable(key);
  showToast(`${ADMIN_RESOURCE_CONFIGS[key].title} ${id ? 'updated' : 'added'}.`, 'success');
}

function deleteAdminResource(key, id) {
  openDeleteModal(`Delete this ${ADMIN_RESOURCE_CONFIGS[key].title.toLowerCase()} record?`, async () => {
    try {
      await apiCall(`/admin-data/${key}/${encodeURIComponent(id)}`, 'DELETE');
      await renderAdminResourceTable(key);
      showToast('Record deleted.', 'success');
      return true;
    } catch (error) {
      console.error(`Deleting ${key} record failed:`, error);
      showToast(`Could not delete record: ${error.message}`, 'error');
      return false;
    }
  });
}

// ===== ENTERPRISE DATA GENERATORS (Bringing it to Life) =====

function renderOverviewQuickActions() {
  const container = document.getElementById('admin-quick-actions');
  if (!container) return;
  const actions = [
    { label: 'Register Child', description: 'Add a child profile', command: "showAdmin('children')" },
    { label: 'Log Donation', description: 'Record a contribution', command: "addDonation()" },
    { label: 'New Blog Post', description: 'Share a KCH update', command: "showAdmin('blog')" },
  ];
  container.innerHTML = actions.map(a => `
    <button class="quick-action-card" type="button" onclick="${a.command}">
      <span class="quick-action-copy">
        <span class="label">${a.label}</span>
        <span class="description">${a.description}</span>
      </span>
      <svg class="quick-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6"/>
      </svg>
    </button>
  `).join('');
}

function renderFundraisingMetrics(donations = donationsCache) {
  const container = document.getElementById('fundraising-viz');
  if (!container) return;
  const received = donations.filter(donation => donation.status === 'Received');
  const total = received.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  container.innerHTML = `
    <div class="viz-card">
      <div class="viz-header">
        <span>Received donations</span>
        <strong>${received.length} records</strong>
      </div>
      <div class="viz-footer">
        <span>${formatAdminMoney(total)}</span>
        <span>Confirmed total</span>
      </div>
    </div>
  `;
}

async function renderUserRegistrationsTable() {
  const tbody = document.querySelector('#admin-registrations-tbody');
  if (!tbody) return;
  setAdminTableMessage(tbody, 5, 'Loading registered users…');
  try {
    const [data, recent] = await Promise.all([
      apiCall('/dashboard/user-registrations'),
      apiCall('/dashboard/user-registrations/recent')
    ]);
    const users = data.users || [];
    const totalCount = document.getElementById('total-users-count');
    const recentCount = document.getElementById('recent-users-count');
    if (totalCount) totalCount.textContent = String(data.total_users ?? users.length);
    if (recentCount) recentCount.textContent = String(recent.recently_registered || 0);
    if (!users.length) return setAdminTableMessage(tbody, 5, 'No registered users yet.');

    tbody.innerHTML = users.map(user => {
      const createdDate = new Date(user.created_at);
      const today = new Date();
      const daysAgo = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
      const formattedDate = Number.isNaN(createdDate.getTime()) ? '—' : createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const roleLabel = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
      return `
        <tr>
          <td><strong>${escapeHTML(user.name || 'N/A')}</strong></td>
          <td>${escapeHTML(user.email)}</td>
          <td>${renderAdminBadge(roleLabel)}</td>
          <td>${formattedDate}</td>
          <td>${daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : daysAgo + ' days ago'}</td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Loading user registrations failed:', error);
    setAdminTableMessage(tbody, 5, `Could not load registrations: ${error.message}`);
  }
}

// ===== NAMECHEAP SERVICES DASHBOARD =====


function renderNamecheapServicesTable(services) {
  const tbody = document.getElementById('namecheap-services-tbody');
  if (!tbody || !services.length) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#94a3b8;">No services found.</td></tr>';
    return;
  }

  tbody.innerHTML = services.map(service => {
    const expiryDate = new Date(service.expiry_date);
    const today = new Date();
    const daysUntil = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    const formattedDate = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    let statusColor = 'admin-badge-success';
    if (daysUntil <= 0) statusColor = 'admin-badge-danger';
    else if (daysUntil <= 14) statusColor = 'admin-badge-warning';
    else if (daysUntil <= 30) statusColor = 'admin-badge-info';

    return `
      <tr>
        <td><strong>${escapeHTML(service.service_name)}</strong></td>
        <td><span class="admin-badge">${service.service_type}</span></td>
        <td>${escapeHTML(service.domain_name || 'N/A')}</td>
        <td>${formattedDate}</td>
        <td>${daysUntil <= 0 ? 'Expired' : daysUntil + ' days'}</td>
        <td><span class="admin-badge ${statusColor}">${service.status}</span></td>
        <td>${service.auto_renew ? 'Yes' : 'No'}</td>
        <td><button class="admin-action-btn view" onclick="showToast('Service details...', 'info')">View</button></td>
      </tr>
    `;
  }).join('');
}

function renderNamecheapRenewalsTable(renewals) {
  const tbody = document.getElementById('namecheap-renewals-tbody');
  if (!tbody) return;

  if (!renewals || !renewals.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">No upcoming renewals in next 90 days.</td></tr>';
    return;
  }

  tbody.innerHTML = renewals.map(renewal => {
    const renewalDate = new Date(renewal.next_renewal);
    const expiryDate = new Date(renewal.current_expiry);
    const formattedRenewal = renewalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formattedExpiry = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    let priorityColor = 'admin-badge-success';
    if (renewal.priority === 'Overdue') priorityColor = 'admin-badge-danger';
    else if (renewal.priority === 'Critical') priorityColor = 'admin-badge-warning';
    else if (renewal.priority === 'Urgent') priorityColor = 'admin-badge-info';

    return `
      <tr>
        <td><strong>${escapeHTML(renewal.service_name)}</strong></td>
        <td>${formattedExpiry}</td>
        <td>${formattedRenewal}</td>
        <td>${renewal.days_until_renewal} days</td>
        <td><span class="admin-badge ${priorityColor}">${renewal.priority}</span></td>
        <td>UGX ${(renewal.renewal_price || renewal.price || 0).toLocaleString()}</td>
        <td><button class="admin-action-btn edit" onclick="showToast('Renewing...', 'info')">Renew</button></td>
      </tr>
    `;
  }).join('');
}


// ===== ANIMATION STYLES =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* Enterprise Dashboard Enhancements */
  .quick-action-card {
    background: white;
    border: 1px solid var(--admin-border);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .quick-action-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: var(--green);
  }
  .viz-progress-bg {
    background: #eee;
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
    margin: 10px 0;
  }
  .viz-progress-bar {
    background: linear-gradient(90deg, var(--green), #2ecc71);
    height: 100%;
    transition: width 1.5s cubic-bezier(0.1, 0, 0.1, 1);
  }
  .crm-score-container {
    background: #f0f0f0;
    height: 18px;
    border-radius: 9px;
    position: relative;
    width: 100px;
    overflow: hidden;
  }
  .crm-score-bar {
    background: var(--green);
    height: 100%;
  }
  .crm-score-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10px;
    font-weight: bold;
    color: #333;
  }
  .status-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .status-pulse.green { background: #27ae60; box-shadow: 0 0 0 rgba(39, 174, 96, 0.4); animation: pulse-green 2s infinite; }
  .status-pulse.amber { background: #f39c12; }
  @keyframes pulse-green {
    0% { box-shadow: 0 0 0 0px rgba(39, 174, 96, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(39, 174, 96, 0); }
    100% { box-shadow: 0 0 0 0px rgba(39, 174, 96, 0); }
  }
  .churn-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .churn-dot.low { background: #27ae60; }
  .churn-dot.healthy { background: #2ecc71; }
  .churn-dot.high { background: #e74c3c; }
  .audit-row { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
  .health-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pulse-ring {
    width: 12px;
    height: 12px;
    background: #10b981;
    border-radius: 50%;
    position: relative;
  }
  .pulse-ring::after {
    content: '';
    position: absolute;
    width: 100%; height: 100%;
    border-radius: 50%;
    border: 2px solid #10b981;
    animation: ring-pulse 1.5s infinite;
  }
  @keyframes ring-pulse {
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(3); opacity: 0; }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
  @keyframes ripple {
    to { transform: scale(4); opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);

async function updateLiveImpactCounters() {
  try {
    const stats = await apiCall('/dashboard/overview');
    const values = {
      'ov-children': Number(stats.children_enrolled).toLocaleString(),
      'ov-donations': formatAdminMoney(stats.total_donations),
      'ov-staff': Number(stats.active_staff).toLocaleString(),
      'ov-volunteers': Number(stats.volunteers).toLocaleString()
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  } catch (error) {
    console.error('Loading dashboard overview failed:', error);
    ['ov-children', 'ov-donations', 'ov-staff', 'ov-volunteers'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = 'Unavailable';
    });
  }
}

async function updateActivityStream() {
  const stream = document.getElementById('admin-activity-stream');
  if (!stream) return;
  stream.textContent = 'Loading activity…';
  try {
    const activities = await apiCall('/dashboard/activity');
    if (!Array.isArray(activities)) throw new Error('The server returned an invalid activity list.');
    if (!activities.length) {
      stream.textContent = 'No recent activity.';
      return;
    }
    stream.innerHTML = activities.map(activity => `
      <div class="activity-item" style="padding:10px;border-left:3px solid var(--green);margin-bottom:8px;background:rgba(0,0,0,0.02);border-radius:0 4px 4px 0">
        <div style="font-size:0.85rem;font-weight:600">${escapeHTML(activity.action)}</div>
        <div style="font-size:0.75rem;color:#888">${escapeHTML(activity.type)} · ${formatAdminDate(activity.timestamp)}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Loading dashboard activity failed:', error);
    stream.textContent = `Could not load activity: ${error.message}`;
  }
}

// ===== POST-LOAD INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  renderBlogPosts();
  renderAdminBlogPosts();

  // Initialize the "Life" of the dashboard
  setInterval(() => {
    const overviewActive = document.getElementById('admin-overview')?.style.display === 'block';
    if (overviewActive) {
      updateLiveImpactCounters();
      updateActivityStream();
    }
  }, 30000);

  // Admin filter buttons
  document.querySelectorAll('.admin-page .filter-btn:not([onclick])').forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = this.parentElement;
      parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  document.querySelectorAll('.admin-page .action-btn:not([onclick]), .admin-page .btn[data-unavailable]').forEach(btn => {
    btn.addEventListener('click', () => showToast('This action is not available yet.', 'error'));
  });

  // Button click feedback
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.98)');
    btn.addEventListener('mouseup', () => btn.style.transform = 'scale(1)');
    btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
  });

  // Reveal elements
  setTimeout(() => {
    document.querySelectorAll('.fadeup, .slide-left, .slide-right, .scale-in').forEach(el => {
      el.classList.add('visible');
    });
  }, 100);
});







