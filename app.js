// ==================== FULL app.js ====================
const SUPABASE_URL = 'https://kuxttskznuzbtmfxtifr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eHR0c2t6bnV6YnRtZnh0aWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5Mjg3OTQsImV4cCI6MjEwMTUwNDc5NH0.tc4XXUeDI19R1XsFJasO0Aq9gTg3JrzPL1JWM83RnYM';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Global FY Helper — saari jagah consistent FY date milegi
function getCurrentFYStartDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 11 = Dec
  const fyStartYear = month >= 3 ? year : year - 1; // April = 3
  return `${fyStartYear}-04-01`;
}

const sirenAudio = new Audio('https://actions.google.com/sounds/v1/alarms/emergency_alarm.ogg');

let activityLogs = [];
let currentRole = 'Admin';
let currentUser = 'A-101';
let currentSociety = 'Demo Society';
// Dynamic: Months elapsed since 1 April of current FY
const MONTHS_IN_FY_SO_FAR = (() => {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const fyStartMonth = 3; // April = 3 (0-indexed)
  if (currentMonth >= fyStartMonth) return currentMonth - fyStartMonth + 1;
  return (12 - fyStartMonth) + currentMonth + 1;
})(); 
let openingBalance = 105035.85;

let membersData = [];
let maintenanceData = [];
let expenseData = [];
let customBankEntries = [];
let journalVouchersData = [];
let pollsData = [];
let noticesData = [];
let meetingsData = [];
let complaintData = [];
let parkingData = [];
let assetData = [];
let fdData = [];
let societySettings = {};
let visitors = [];
let paymentProofs = [];
let teamData = [];
let allSocieties = [];
let facilitiesData = [];
let bookingsData = [];
let eventsData = [];
let societyRules = '';
let amcContractsData = [];
let deletionRequests = [];
let marketplaceData = [];
let __deepLinkLock = false;
let __userClosedOverlay = false;
let __programmaticBack = false;   // ✅ NEW — apne history.back() ko ignore karne ke liye
let __changePasswordFromGrid = false;   // ✅ NEW — change-password grid restore ke liye
let notificationBadgeCount = 0;
let communityBadgeCount = 0;

function updateFloatingButtonsVisibility(isLanding) {
  const enrollBtn = document.getElementById('enrollButtonContainer');
  const aboutBtn = document.getElementById('aboutButtonContainer');
  if (enrollBtn) enrollBtn.style.display = isLanding ? 'block' : 'none';
  if (aboutBtn) aboutBtn.style.display = isLanding ? 'block' : 'none';
}

function togglePasswordVisibility() {
  const pwdInput = document.getElementById('login-password');
  const icon = document.getElementById('togglePasswordIcon');
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    pwdInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

function toggleTenantFormFields(val, mode = 'add') {
  const directContainer = document.getElementById(mode === 'edit' ? 'edit-mem-tenant-dynamic-fields' : 'tenant-dynamic-fields');
  if (directContainer) {
    directContainer.style.display = (val === 'Yes') ? 'block' : 'none';
  }
}

function showLandingPage() {
  document.getElementById('landing-section').style.display = 'flex';
  document.getElementById('visitor-section').style.display = 'none';
  const loginSec = document.getElementById('login-section');
  if (loginSec) loginSec.style.display = 'none';
  document.getElementById('app-section').classList.add('d-none');
  updateFloatingButtonsVisibility(true);
}

function showVisitorPage() {
  updateFloatingButtonsVisibility(false);
  if (localStorage.getItem('ps_user_logged') === 'true') {
    document.getElementById('landing-section').style.display = 'none';
    document.getElementById('visitor-section').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').classList.add('d-none');
    const backBtn = document.getElementById('visitorBackBtn');
    if (backBtn) backBtn.onclick = goBackFromVisitor;
    loadTodayVisitors();
    setupVisitorRealtimeForGuard();
  } else {
    openVisitorPassword();
  }
}

function showLoginPage() {
  updateFloatingButtonsVisibility(false);

  const visitorSec = document.getElementById('visitor-section');
  if (visitorSec) visitorSec.style.display = 'none';

  document.querySelectorAll('.modal.show').forEach(m => {
    const inst = bootstrap.Modal.getInstance(m);
    if (inst) inst.hide();
  });

  const landing = document.getElementById('landing-section');
  if (landing) landing.style.display = 'none';

  const appSec = document.getElementById('app-section');
  if (appSec) appSec.classList.add('d-none');

  const loginSec = document.getElementById('login-section');
  if (loginSec) loginSec.style.display = 'flex';
}

function goBackFromVisitor() {
  document.querySelectorAll('.modal.show').forEach(modal => {
    const instance = bootstrap.Modal.getInstance(modal);
    if (instance) instance.hide();
  });
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';

   const visitorSection = document.getElementById('visitor-section');
  if (visitorSection) {
    visitorSection.style.display = 'none';
  }

  cleanupVisitorRealtimeForGuard();

  const tabOverlay = document.getElementById('tabOverlay');
  if (tabOverlay) tabOverlay.remove();

  if (localStorage.getItem('ps_user_logged') === 'true') {
    const appSection = document.getElementById('app-section');
    if (appSection) appSection.classList.remove('d-none');

    if (window.innerWidth <= 768) {
      const gridOverlay = document.getElementById('mobileMenuOverlay');
      if (gridOverlay) {
        gridOverlay.style.display = 'flex';
        gridOverlay.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
        gridOverlay.style.zIndex = '10000';
        gridOverlay.style.position = 'fixed';
        gridOverlay.style.top = '0';
        gridOverlay.style.left = '0';
        gridOverlay.style.width = '100%';
        gridOverlay.style.height = '100%';
        renderGridCards();
        document.body.style.overflow = 'hidden';
      }
    } else {
      const dashboardLink = document.querySelector('.nav-link[onclick*="dashboard"]');
      if (dashboardLink) switchTab('dashboard', dashboardLink);
    }
  } else {
    showLandingPage();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  clearAllData();

  const rawInput = (document.getElementById('login-email')?.value || '').trim();
  const password = (document.getElementById('login-password')?.value || '').trim();

  // ─────────────────────────────────────────
  // STEP 1: Empty check
  // ─────────────────────────────────────────
  if (!rawInput || !password) {
    alert('❌ कृपया Login ID और Password दर्ज करें।');
    return;
  }

  // ─────────────────────────────────────────
  // STEP 2: Strip @ps.in if user typed it
  // ─────────────────────────────────────────
  let loginId = rawInput;
  if (loginId.toLowerCase().endsWith('@ps.in')) {
    loginId = loginId.slice(0, -6);
  }

  // ─────────────────────────────────────────
  // STEP 3: No spaces allowed
  // ─────────────────────────────────────────
  if (/\s/.test(loginId)) {
    alert('❌ Login ID में space allowed नहीं है।\n\nExample: a-101_demosociety');
    return;
  }

  // ─────────────────────────────────────────
  // STEP 4: Auto-lowercase (Hybrid Option C)
  // ─────────────────────────────────────────
  loginId = loginId.toLowerCase();

  // ─────────────────────────────────────────
  // STEP 5: Must contain exactly ONE underscore
  // ─────────────────────────────────────────
  const underscoreCount = (loginId.match(/_/g) || []).length;
  if (underscoreCount !== 1) {
    alert('❌ Login ID में exactly एक underscore (_) होना चाहिए।\n\nExample: a-101_demosociety\nया: admin_demosociety');
    return;
  }

  // ─────────────────────────────────────────
  // STEP 6: Character set check
  // Only a-z, 0-9, hyphen before underscore
  // Only a-z, 0-9 after underscore
  // ─────────────────────────────────────────
  if (!/^[a-z0-9-]+_[a-z0-9]+$/.test(loginId)) {
    alert('❌ Login ID में सिर्फ small letters (a-z), numbers (0-9), और hyphen (-) allowed हैं।\n\nExample: a-101_demosociety');
    return;
  }

  // ─────────────────────────────────────────
  // STEP 7: Build full email
  // ─────────────────────────────────────────
  const fullEmail = loginId + '@ps.in';

  try {
    // ───────────────────────────────────────
    // STEP 8: Supabase Authentication
    // ───────────────────────────────────────
    const { data: authData, error: authError } = await _supabase.auth.signInWithPassword({
      email: fullEmail,
      password: password
    });

    if (authError || !authData.user) {
      alert('❌ Invalid credentials! Please check your ID and Password.');
      return;
    }

    // ───────────────────────────────────────
    // STEP 9: Fetch user role from user_master
    // ───────────────────────────────────────
    const { data: userData, error: userError } = await _supabase
      .from('user_master')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (userError || !userData) {
      alert('❌ User not found in system.');
      await _supabase.auth.signOut();
      return;
    }

    const user = userData;

    // ───────────────────────────────────────
    // STEP 10: Save session to localStorage
    // ───────────────────────────────────────
    localStorage.setItem('ps_user_logged', 'true');
    localStorage.setItem('ps_user_role', user.role);
    localStorage.setItem('ps_user_id', user.flat_no);

    // ───────────────────────────────────────
    // STEP 11: Auto-detect society from login ID slug
    // "admin_demosociety" → socSlug = "demosociety"
    // Then match against societies table
    // ───────────────────────────────────────
    const socSlug = loginId.split('_').slice(1).join('_');
    let targetSociety = user.society_name || currentSociety || 'Demo Society';

    try {
      const { data: socData } = await _supabase
        .from('societies')
        .select('name')
        .eq('is_active', true);

      if (socData && socData.length > 0) {
        const matched = socData.find(s =>
          s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === socSlug
        );
        if (matched) targetSociety = matched.name;
      }
    } catch (e) {
      console.log('[Login] Society match error (using fallback):', e);
    }

    localStorage.setItem('ps_user_society', targetSociety);
    currentSociety = targetSociety.trim();

    // ───────────────────────────────────────
    // STEP 12: Hide login/landing, show app
    // ───────────────────────────────────────
    const loginSec = document.getElementById('login-section');
    if (loginSec) loginSec.style.display = 'none';

    const landing = document.getElementById('landing-section');
    if (landing) landing.style.display = 'none';

    const appSec = document.getElementById('app-section');
    if (appSec) appSec.classList.remove('d-none');

    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';

    // ───────────────────────────────────────
    // STEP 13: Apply role-based session
    // ───────────────────────────────────────
    applyUserSession(user.role, user.flat_no);
    requestNotificationPermission();
    alert('✅ Login Successful!');

  } catch (err) {
    console.error('Login error:', err);
    alert('❌ Something went wrong: ' + err.message);
  }
}

function openForgotModal() {
  const forgotEl = document.getElementById('forgotModal');
  if (!forgotEl) return;

  // Clear previous values
  const socInput = document.getElementById('forgotSociety');
  const flatInput = document.getElementById('forgotFlat');
  if (socInput) socInput.value = '';
  if (flatInput) flatInput.value = '';

  const forgotModal = new bootstrap.Modal(forgotEl);
  forgotModal.show();
}

function closeForgotModal() {
  const forgotEl = document.getElementById('forgotModal');
  if (!forgotEl) return;
  const modalInstance = bootstrap.Modal.getInstance(forgotEl);
  if (modalInstance) modalInstance.hide();
}

// ═══════════════════════════════════════════════════
// 📩 SUBMIT FORGOT PASSWORD REQUEST (Save to DB)
// ═══════════════════════════════════════════════════
async function submitForgotPasswordRequest() {
  const societyInput = document.getElementById('forgotSociety');
  const flatInput = document.getElementById('forgotFlat');
  const btn = document.getElementById('btn-submit-forgot-request');

  const societyName = societyInput?.value.trim();
  const flatNo = flatInput?.value.trim().toUpperCase();

  // ─── Validation ───
  if (!societyName) {
    alert('❌ Please enter Society Name');
    societyInput?.focus();
    return;
  }
  if (!flatNo) {
    alert('❌ Please enter Flat Number / Login ID');
    flatInput?.focus();
    return;
  }

  // ─── Save button state ───
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Submitting...';

  try {
    // ─── Phone lookup from members table (agar mila) ───
    let phone = '';
    let userRole = 'Member';

    try {
      const { data: memberInfo } = await _supabase
        .from('members')
        .select('phone, name, status')
        .ilike('society_name', societyName)
        .ilike('flat_no', flatNo)
        .maybeSingle();

      if (memberInfo) {
        phone = memberInfo.phone || '';
        userRole = memberInfo.status || 'Member';
      }
    } catch (e) {
      console.log('[ForgotPwd] Member lookup skipped:', e.message);
    }

    // ─── Check: duplicate request in last 5 minutes? ───
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recent } = await _supabase
        .from('password_reset_requests')
        .select('id')
        .ilike('society_name', societyName)
        .ilike('flat_no', flatNo)
        .eq('status', 'Pending')
        .gte('requested_at', fiveMinAgo)
        .limit(1);

      if (recent && recent.length > 0) {
        alert('⚠️ You already submitted a request in the last 5 minutes.\n\nPlease wait — admin will respond soon.');
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        return;
      }
    } catch (e) {
      console.log('[ForgotPwd] Duplicate check skipped:', e.message);
    }

    // ─── Insert into DB ───
    const { data, error } = await _supabase
      .from('password_reset_requests')
      .insert([{
        society_name: societyName,
        flat_no: flatNo,
        phone: phone,
        user_role: userRole,
        note: 'User forgot password',
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('[ForgotPwd] Insert error:', error);
      alert('❌ Failed to submit request:\n' + error.message);
      return;
    }

    console.log('[ForgotPwd] ✅ Request submitted:', data);

    // ─── Success alert ───
    alert(
      '✅ Request Submitted Successfully!\n\n' +
      '📋 Society: ' + societyName + '\n' +
      '🏠 Flat: ' + flatNo + '\n\n' +
      'Admin will reset your password soon.\n' +
      'You will receive your new password on WhatsApp.'
    );

    // ─── Clear inputs ───
    if (societyInput) societyInput.value = '';
    if (flatInput) flatInput.value = '';

    // ─── Close modal ───
    const modalEl = document.getElementById('forgotModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

  } catch (err) {
    console.error('[ForgotPwd] Exception:', err);
    alert('❌ Something went wrong: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

// ═══════════════════════════════════════════════════
// 📱 SEND FORGOT PASSWORD REQUEST VIA WHATSAPP
// ═══════════════════════════════════════════════════
function sendPasswordRequest() {
  const society = document.getElementById('forgotSociety')?.value.trim();
  const flat = document.getElementById('forgotFlat')?.value.trim().toUpperCase();

  if (!society || !flat) {
    alert('❌ Please enter Society Name and Flat Number first');
    return;
  }

  const adminPhone = '918866376056';
  const message = 
`🔐 Password Reset Request

Society: ${society}
Flat/ID: ${flat}

User has forgotten their password. Please reset it from the Admin Panel.

- PS Society Solutions`;

  const whatsappURL = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');

  // ⚠️ Note: Modal band NAHI karna — user alag se "Submit Request" bhi dabayega
}

async function submitChangePassword(event) {
  event.preventDefault();
  const oldP = document.getElementById('pass-old').value;
  const newP = document.getElementById('pass-new').value;
  const confirmP = document.getElementById('pass-confirm').value;
  
  if (newP !== confirmP) {
    alert('❌ New Password and Confirm Password do not match!');
    return;
  }
  
  try {
    const { error } = await _supabase.auth.updateUser({ password: newP });
    if (error) {
      alert('❌ Error updating password: ' + error.message);
      return;
    }
    alert('✅ Password Updated Successfully!');
    bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
    event.target.reset();
  } catch (err) {
    console.error(err);
    alert('❌ Something went wrong.');
  }
}

function applyUserSession(role, email) {
  currentRole = role;
  currentUser = email.toUpperCase();
  loadMainApp(role);
}

async function checkUserConsent(flatNo, callback) {
  try { callback(); } catch (err) { callback(); }
}

function showConsentPopup(flatNo, callback) {
  const existingOverlay = document.getElementById('consentOverlay');
  if (existingOverlay) existingOverlay.remove();

  document.getElementById('app-section').classList.add('d-none');
  document.getElementById('landing-section').style.display = 'none';
  const loginSec = document.getElementById('login-section');
  if (loginSec) loginSec.style.display = 'none';
  document.getElementById('visitor-section').style.display = 'none';
  updateFloatingButtonsVisibility(false);

  const cleanFlat = (flatNo || '').trim();

  const overlay = document.createElement('div');
  overlay.id = 'consentOverlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(15, 23, 42, 0.92); z-index: 99999;
    display: flex; justify-content: center; align-items: center;
    padding: 20px; font-family: 'Plus Jakarta Sans', sans-serif;
    pointer-events: auto;
  `;
  overlay.innerHTML = `
    <div style="background: #fff; border-radius: 24px; padding: 30px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 30px 60px rgba(0,0,0,0.4); position: relative; z-index: 100000; pointer-events: auto;">
      <h3 style="font-weight: 800; color: #0f172a; text-align: center; margin-bottom: 10px;">
        <span style="color: #f59e0b;">PS</span> Society Solutions
      </h3>
      <p style="text-align: center; color: #475569; font-size: 14px; margin-bottom: 20px;">Your privacy matters to us.</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 14px; color: #334155; max-height: 250px; overflow-y: auto; line-height: 1.7;">
        <p><strong>We collect and process the following data:</strong></p>
        <ul style="padding-left: 20px;">
          <li>Name, Flat Number, Mobile Number</li>
          <li>Payment History & UTR References</li>
          <li>Visitor Logs & Complaint Details</li>
        </ul>
        <p><strong>How we use it:</strong><br> For society management, payment verification, and statutory compliance.</p>
        <p><strong>Your Rights:</strong><br> You can view, modify, or request deletion of your data anytime.</p>
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap; position: relative; z-index: 100001;">
        <button type="button" id="btnAcceptConsent"
                style="flex: 1; min-width: 140px; background: linear-gradient(90deg, #2563eb, #3b82f6); color: #fff; border: none; border-radius: 50px; padding: 14px; font-weight: 700; font-size: 16px; cursor: pointer;">
          ✅ I Agree
        </button>
        <button type="button" onclick="openPrivacyPolicy(); document.getElementById('consentOverlay').style.display='none';" 
                style="flex: 0 0 auto; background: transparent; color: #64748b; border: 1px solid #e2e8f0; border-radius: 50px; padding: 14px 24px; font-weight: 600; font-size: 14px; cursor: pointer;">
          View Policy
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('btnAcceptConsent').onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    acceptConsent(cleanFlat);
  };
}

async function acceptConsent(flatNo) {
  const { error } = await _supabase
    .from('user_master')
    .update({ consent_given: true, consent_date: new Date().toISOString() })
    .eq('flat_no', flatNo);

  if (error) { alert('❌ Failed to save consent.'); return; }
  const overlay = document.getElementById('consentOverlay');
  if (overlay) overlay.remove();
  loadMainApp(currentRole);
}

function loadMainApp(role) {
  document.getElementById('landing-section').style.display = 'none';
  const loginSec = document.getElementById('login-section');
  if (loginSec) loginSec.style.display = 'none';
  
  const urlParams = new URLSearchParams(window.location.search);
  const activeTab = urlParams.get('tab');

  document.querySelectorAll('#sidebarMenu li').forEach(li => {
    li.style.display = '';
    li.classList.remove('d-none');
  });
  
  document.querySelectorAll('#sidebarMenu .nav-link').forEach(el => {
    el.style.display = '';
    el.classList.remove('d-none');
    const li = el.closest('li');
    if (li) {
      li.style.display = '';
      li.classList.remove('d-none');
    }
  });

  if (activeTab === 'visitor') {
    showVisitorPage();
    return;
  }

  document.getElementById('visitor-section').style.display = 'none';
  document.getElementById('app-section').classList.remove('d-none');
  updateFloatingButtonsVisibility(false);

  document.getElementById('user-role-badge').innerText = role;
  document.getElementById('user-name-display').innerText = currentUser || 'User';
  
  const switcher = document.getElementById('society-switcher');
  if (switcher) {
    if (role === 'Admin') {
      switcher.classList.remove('d-none');
      loadSocietySwitcher();
    } else {
      switcher.classList.add('d-none');
    }
  }

  const adminStats = document.getElementById('admin-dashboard-stats');
  const memberStats = document.getElementById('member-dashboard-stats');

  if (role === 'Member') {
    document.querySelectorAll('.admin-only, .chairman-only').forEach(el => el.classList.add('d-none'));
    adminStats.classList.add('d-none'); memberStats.classList.remove('d-none');
  } 
  else if (role === 'Chairman') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.chairman-only').forEach(el => el.classList.remove('d-none'));
    adminStats.classList.remove('d-none'); memberStats.classList.add('d-none');
  } 
  else if (role === 'SocietyAdmin') {
    document.querySelectorAll('.admin-only, .chairman-only').forEach(el => el.classList.remove('d-none'));
    adminStats.classList.remove('d-none'); memberStats.classList.add('d-none');
    document.querySelectorAll('.nav-link[onclick*="manage-societies"]').forEach(el => el.closest('li').style.display = 'none');
    document.querySelectorAll('.nav-link[onclick*="settings"]').forEach(el => el.closest('li').style.display = 'none');
    document.querySelectorAll('.nav-link[onclick*="master-dashboard"]').forEach(el => el.closest('li').style.display = 'none');
    document.querySelectorAll('.nav-link[onclick*="deletion-requests"]').forEach(el => el.closest('li').style.display = 'none');
    if (switcher) switcher.classList.add('d-none');
  } 
  else {
    document.querySelectorAll('.admin-only, .chairman-only').forEach(el => el.classList.remove('d-none'));
    adminStats.classList.remove('d-none'); memberStats.classList.add('d-none');
  }

  const settingsTab = document.querySelector('a[onclick*="settings"]');
  if (settingsTab) settingsTab.closest('li').style.display = (role === 'Admin') ? '' : 'none';
  const proofsTab = document.querySelector('a[onclick*="proofs"]');
  if (proofsTab) proofsTab.closest('li').style.display = (role === 'Admin' || role === 'SocietyAdmin') ? '' : 'none';
  const manageTab = document.querySelector('a[onclick*="manage-societies"]');
  if (manageTab) manageTab.closest('li').style.display = (role === 'Admin') ? '' : 'none';
  
  if (window.innerWidth <= 768) {
  const sidebar = document.querySelector('#sidebarMenu');
  if (sidebar) sidebar.style.display = 'none';
  const hasTabParam = urlParams.has('tab');
  if (!hasTabParam) {
    // ✅ Force-show grid (toggle nahi — kyunki login pe state unknown hai)
    const gridOverlay = document.getElementById('mobileMenuOverlay');
    if (gridOverlay) {
      gridOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      renderGridCards();
      if (!history.state || !history.state.mobileMenuOpen) {
        window.history.pushState({ mobileMenuOpen: true }, "", window.location.href);
      }
    }
  }
}
 else {
    const sidebar = document.querySelector('#sidebarMenu');
    if (sidebar) sidebar.style.display = 'block';
  }
  
  clearAllData();
  
  if (activeTab === 'marketplace') {
    fetchMarketplaceData().then(() => { fetchSupabaseData(); });
  } else if (activeTab === 'community') {
    fetchEvents().then(() => {
      fetchFacilityData().then(() => { fetchSupabaseData(); });
    });
  } else if (activeTab === 'meetings') {
    _supabase.from('society_meetings').select('*').eq('society_name', currentSociety).then(({ data }) => {
      meetingsData = data || [];
      fetchSupabaseData();
    });
  } else {
    fetchSupabaseData();
  }

    setTimeout(requestNotificationPermission, 2000);
  listenForSOSAlerts();
  setupRealtimeSubscriptions();
  setTimeout(() => loadSecondaryData(), 500);
  
  // 🔒 NEW: Check subscription mode after login
  setTimeout(() => checkSocietySubscriptionMode(), 1200);
}

async function loadSocietySwitcher() {
  const dropdown = document.getElementById('switch-society-dropdown');
  if (!dropdown) return;
  const { data, error } = await _supabase.from('societies').select('name').eq('is_active', true);
  if (error) return;
  dropdown.innerHTML = '<option value="">-- Switch Society --</option>';
  data.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name;
    if (s.name === currentSociety) opt.selected = true;
    dropdown.appendChild(opt);
  });
}

// ✅ NEW: Cleanup old visitor channel before switching
  function switchSociety(societyName) {
  if (!societyName || societyName === currentSociety) return;
  if (!confirm(`Switch to "${societyName}"? Data will reload.`)) return;
  
  clearAllData();
  currentSociety = societyName;
  localStorage.setItem('ps_user_society', societyName);
  
// ✅ NEW: Cleanup old visitor channel before switching
  if (typeof cleanupVisitorRealtimeForGuard === 'function') {
    cleanupVisitorRealtimeForGuard();
  }

  fetchSupabaseData();
  setTimeout(() => loadSecondaryData(), 500);
  setupRealtimeSubscriptions();
  listenForSOSAlerts();                      // ✅ NEW: SOS channel refresh on switch

  // ✅ NEW: Save FCM token for this society (Admin multi-society support)
  setTimeout(() => requestNotificationPermission(), 1200);

  const sidebarName = document.getElementById('sidebar-society-name');
  if (sidebarName) sidebarName.innerText = societyName;
  
    const dropdown = document.getElementById('switch-society-dropdown');
  if (dropdown) dropdown.value = societyName;
  
  updateMobileHeaderInfo();
  
  // 🔒 NEW: Re-check after society switch
  setTimeout(() => checkSocietySubscriptionMode(), 1000);
}

function markAllAsRead() {
  if (maintenanceData.length > 0) localStorage.setItem('ps_last_seen_maintenance', Math.max(...maintenanceData.map(r => r.id || 0)).toString());
  if (paymentProofs.length > 0) localStorage.setItem('ps_last_seen_proofs', Math.max(...paymentProofs.map(p => p.id || 0)).toString());
  if (complaintData.length > 0) localStorage.setItem('ps_last_seen_complaints', Math.max(...complaintData.map(c => c.id || 0)).toString());
  if (pollsData.length > 0) localStorage.setItem('ps_last_seen_polls', Math.max(...pollsData.map(p => p.id || 0)).toString());
  if (noticesData.length > 0) localStorage.setItem('ps_last_seen_notice', Math.max(...noticesData.map(n => n.id || 0)).toString());
  if (visitors.length > 0) localStorage.setItem('ps_last_seen_visitors', Math.max(...visitors.map(v => v.id || 0)).toString());

  let communityMax = 0;
  if (eventsData.length > 0) communityMax = Math.max(communityMax, ...eventsData.map(e => e.id || 0));
  if (noticesData.length > 0) communityMax = Math.max(communityMax, ...noticesData.map(n => n.id || 0));
  localStorage.setItem('ps_last_community_read', communityMax.toString());

  updateBadge('maintenance-badge', 0);
  updateBadge('proofs-badge', 0);
  updateBadge('complaints-badge', 0);
  updateBadge('polls-badge', 0);
  updateBadge('community-badge', 0);
  updateBadge('visitor-badge', 0);
  updateBadge('support-badge', 0);
  updateBadge('amc-badge', 0);
  updateBadge('parking-badge', 0);
  updateBadge('notification-badge', 0);
}

function handleLogout() {
  markAllAsRead();
  _supabase.auth.signOut();
  
  localStorage.removeItem('ps_user_logged');
  localStorage.removeItem('ps_user_role');
  localStorage.removeItem('ps_user_id');
  localStorage.removeItem('ps_user_society');
  
  clearAllData();
  
  currentRole = 'Member';
  currentUser = '';
  currentSociety = 'Demo Society';
  
  // ═══════════════════════════════════════════════════
  // ✅ FIX: Show landing page FIRST (white screen fix)
  // ═══════════════════════════════════════════════════
  const landingSec = document.getElementById('landing-section');
  if (landingSec) {
    landingSec.style.display = 'flex';
    landingSec.style.visibility = 'visible';
  }
  
  // ✅ THEN hide app section
  const appSection = document.getElementById('app-section');
  if (appSection) appSection.classList.add('d-none');
  
  const gridOverlay = document.getElementById('mobileMenuOverlay');
  if (gridOverlay) gridOverlay.style.display = 'none';
  
  if (__proofRealtimeChannel) {
    try { _supabase.removeChannel(__proofRealtimeChannel); } catch(e) {}
    __proofRealtimeChannel = null;
  }

  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  
  const tabOverlay = document.getElementById('tabOverlay');
  if (tabOverlay) tabOverlay.remove();
  
  ['consentOverlay', 'visitorPasswordOverlay', 'aboutPSOverlay', 'privacyPolicyOverlay', 'termsOfServiceOverlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  if (typeof cleanupVisitorRealtimeForGuard === 'function') {
    cleanupVisitorRealtimeForGuard();
  }

  localStorage.setItem('ps_logout_broadcast', Date.now().toString());
  setTimeout(() => localStorage.removeItem('ps_logout_broadcast'), 1000);

  // ✅ Delay बढ़ाया: 100ms → 400ms (user को landing दिखेगा)
  setTimeout(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    window.location.replace(baseUrl + '?t=' + Date.now());
  }, 400);
}

async function fetchSupabaseData() {
  try {
    const [
      { data: members },
      { data: maint },
      { data: expenses },
      { data: settings },
      { data: market },
      { data: notices },
      { data: events },
      { data: facilities },
      { data: bookings },
      { data: meets },
      { data: parking }
    ] = await Promise.all([
      _supabase.from('members').select('*').eq('society_name', currentSociety),
      _supabase.from('maintenance_payments').select('*').eq('society_name', currentSociety),
      _supabase.from('expenses').select('*').eq('society_name', currentSociety),
      _supabase.from('society_settings').select('*').eq('society_name', currentSociety),
      _supabase.from('marketplace_posts').select('*').eq('society_name', currentSociety),
      _supabase.from('notices').select('*').eq('society_name', currentSociety),
      _supabase.from('events').select('*').eq('society_name', currentSociety),
      _supabase.from('facilities').select('*').eq('society_name', currentSociety),
      _supabase.from('facility_bookings').select('*').eq('society_name', currentSociety),
      _supabase.from('society_meetings').select('*').eq('society_name', currentSociety),
      _supabase.from('parking_vehicles').select('*').eq('society_name', currentSociety)
    ]);

    membersData = members || [];
    maintenanceData = maint || [];
    expenseData = expenses || [];
    marketplaceData = market || [];
    noticesData = notices || [];
    eventsData = events || [];
    facilitiesData = facilities || [];
    bookingsData = bookings || [];
    meetingsData = meets || []; 
    parkingData = parking || [];
    
    societySettings = {};
    if (settings) {
      settings.forEach(s => { societySettings[s.key] = s.value; });
    }

    societyRules = societySettings.society_rules || 'नियम सेट नहीं हैं।';
    openingBalance = parseFloat(societySettings.opening_bank_balance) || 0;

    renderAllTables();
    renderMarketplace();
    renderMeetings();
    updateAllBadges();
    renderNoticesCommunity();
    updateMobileHeaderInfo();

  } catch (err) {
    console.error('💥 Error in fetchSupabaseData:', err);
  }
}

async function loadSecondaryData() {
  try {
// ✅ FIX: Role-aware support ticket filter
    const ticketQuery = (currentRole === 'Member' || currentRole === 'Chairman')
      ? _supabase.from('support_tickets').select('*')
          .eq('society_name', currentSociety)
          .eq('raised_by_flat', (currentUser || '').toUpperCase())
          .order('created_at', { ascending: false })
      : _supabase.from('support_tickets').select('*')
          .eq('society_name', currentSociety)
          .order('created_at', { ascending: false });
    const [
      { data: assets },
      { data: fds },
      { data: complaints },
      { data: polls },
      { data: notices },
      { data: meets },
      { data: parking },
      { data: amcs },
      { data: proofs },
      { data: jvs },
      { data: team },
      { data: delReq },
      { data: bankEnt },
      { data: tickets }
    ] = await Promise.all([
      _supabase.from('assets').select('*').eq('society_name', currentSociety),
      _supabase.from('sinking_fund_fd').select('*').eq('society_name', currentSociety),
      _supabase.from('complaints').select('*').eq('society_name', currentSociety),
      _supabase.from('polls').select('*').eq('society_name', currentSociety),
      _supabase.from('notices').select('*').eq('society_name', currentSociety),
      _supabase.from('society_meetings').select('*').eq('society_name', currentSociety),
      _supabase.from('parking_vehicles').select('*').eq('society_name', currentSociety),
      _supabase.from('amc_contracts').select('*').eq('society_name', currentSociety),
      _supabase.from('payment_proofs').select('*').eq('society_name', currentSociety),
      _supabase.from('journal_vouchers').select('*').eq('society_name', currentSociety).order('date', { ascending: false }),
      _supabase.from('team').select('*').eq('society_name', currentSociety),
      _supabase.from('deletion_requests').select('*').eq('society_name', currentSociety).order('requested_at', { ascending: false }),
      _supabase.from('bank_entries').select('*').eq('society_name', currentSociety).order('date', { ascending: false }),
      ticketQuery
    ]);                                         // ⬅️ YE ZAROORI HAI

    assetData = assets || [];
    fdData = fds || [];
    complaintData = complaints || [];
    pollsData = polls || [];
    noticesData = notices || [];
    meetingsData = meets || [];
    parkingData = parking || [];
    amcContractsData = amcs || [];
    paymentProofs = proofs || [];
    journalVouchersData = jvs || [];
    teamData = team || [];
    deletionRequests = delReq || [];
    customBankEntries = bankEnt || [];
    supportTicketsData = tickets || [];

    renderJournalVouchers();
    if (currentRole === 'Admin') renderDeletionRequests();
    renderAllTables();
    updateAllBadges();
    // ✅ FIX 4: Visitor badge — light count query only (role-aware)
    try {
      const lastSeenV = parseInt(localStorage.getItem('ps_last_seen_visitors') || '0');
      let vQuery = _supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .ilike('society', currentSociety)
        .in('status', ['PENDING', 'IN'])
        .gt('id', lastSeenV);

      // Member ko sirf apne flat ke visitors dikhein
      if (currentRole === 'Member') {
        vQuery = vQuery.eq('flat_no', (currentUser || '').toUpperCase());
      }

      const { count: vCount } = await vQuery;
      updateBadge('visitor-badge', vCount || 0);
    } catch (vErr) {
      console.log('[Badge] visitor count silent error:', vErr);
    }

    // ✅ FIX 5: Support badge refresh
    if (typeof updateSupportBadge === 'function') updateSupportBadge();

  } catch (e) {
    console.log('Background sync error:', e);
  }
}

function clearAllData() {
  membersData = [];
  maintenanceData = [];
  expenseData = [];
  customBankEntries = [];
  journalVouchersData = [];
  pollsData = [];
  noticesData = [];
  meetingsData = [];
  complaintData = [];
  assetData = [];
  fdData = [];
  societySettings = {};
  visitors = [];
  paymentProofs = [];
  teamData = [];
  allSocieties = [];
  facilitiesData = [];
  bookingsData = [];
  eventsData = [];
  amcContractsData = [];
  deletionRequests = [];
  marketplaceData = [];
supportTicketsData = [];      // ⬅️ YE ADD KARO 
  openingBalance = 0;
  renderAllTables();
}

async function populateNoticeMemberSelect() {
  const select = document.getElementById('notice-target-members');
  if (!select) return;
  select.innerHTML = '<option value="">⏳ Loading members...</option>';

  if (!membersData || membersData.length === 0) {
    const { data } = await _supabase.from('members').select('flat_no, name').eq('society_name', currentSociety).order('flat_no');
    membersData = data || [];
  }

  select.innerHTML = '';
  membersData.forEach(m => {
    const flat = (m.flat_no || '').toUpperCase();
    if (flat) {
      const opt = document.createElement('option');
      opt.value = flat;
      opt.textContent = `${flat} - ${m.name || 'Unknown'}`;
      select.appendChild(opt);
    }
  });
}

const defaultRulesCategories = [
  { title: "📌 General & Common Rules", content: "1. प्रत्येक निवासी को सोसाइटी के सभी नियमों का पालन करना अनिवार्य रहेगा।\n2. कॉमन एरिया में कचरा न फेंके।" },
  { title: "🚗 Parking Rules", content: "1. वाहन केवल निर्धारित पार्किंग स्लॉट में ही पार्क करें।" },
  { title: "🏊‍♂️ Club House & Amenities", content: "1. क्लब हाउस का उपयोग करने से पहले परमिशन लें।" },
  { title: "🚨 Maintenance & Payments", content: "1. हर महीने की 10 तारीख तक मेंटेनेंस जमा कराना अनिवार्य है।" }
];

function renderRules() {
  const container = document.getElementById('rulesCategoriesContainer');
  if (!container) return;

  const editBtn = document.getElementById('editRulesBtn');
  if (editBtn) {
    if (currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin') {
      editBtn.style.display = 'inline-block';
    } else {
      editBtn.style.display = 'none';
    }
  }

  let categories = defaultRulesCategories;
  try {
    if (societyRules && societyRules.trim() !== '') {
      const parsed = JSON.parse(societyRules);
      if (Array.isArray(parsed)) categories = parsed;
    }
  } catch (e) {
    categories = [{ title: "📌 General Rules", content: societyRules }];
  }

  let html = '';
  categories.forEach((cat) => {
    const formattedContent = (cat.content || '').replace(/\n/g, '<br>');
    html += `
      <div class="col-md-6">
        <div class="card p-4 bg-white shadow-sm rounded-4 border-0 h-100">
          <h5 class="fw-bold text-dark border-bottom pb-2 mb-3">
            <i class="fa-solid fa-layer-group text-warning me-2"></i>${cat.title}
          </h5>
          <div style="white-space: pre-wrap; line-height: 1.8; color: #1e293b; font-size: 14px; font-family: inherit;">
            ${formattedContent || '<span class="text-muted">कोई नियम दर्ज नहीं हैं।</span>'}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openRulesEditor() {
  if (currentRole !== 'Admin' && currentRole !== 'Chairman' && currentRole !== 'SocietyAdmin') {
    alert('⛔ आपके पास नियम बदलने की अनुमति नहीं है।');
    return;
  }

  let categories = defaultRulesCategories;
  try {
    if (societyRules && societyRules.trim() !== '') {
      const parsed = JSON.parse(societyRules);
      if (Array.isArray(parsed)) categories = parsed;
    }
  } catch (e) {
    categories = [{ title: "📌 General Rules", content: societyRules }];
  }

  const editorContainer = document.getElementById('rulesEditorsContainer');
  editorContainer.innerHTML = '';

  categories.forEach((cat, index) => {
    appendRuleCategoryRow(cat.title, cat.content, index);
  });

  const myModal = new bootstrap.Modal(document.getElementById('rulesModal'));
  myModal.show();
}

function appendRuleCategoryRow(title = '', content = '', index = Date.now()) {
  const editorContainer = document.getElementById('rulesEditorsContainer');
  const div = document.createElement('div');
  div.className = 'card p-3 mb-3 border bg-white shadow-sm rounded-3 rule-category-row';
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <input type="text" class="form-control form-control-sm fw-bold rule-title-input w-75" placeholder="कैटेगरी का नाम (जैसे: Parking Rules)" value="${title}">
      <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.rule-category-row').remove()">
        <i class="fa-solid fa-trash"></i> Delete
      </button>
    </div>
    <textarea class="form-control rule-content-input" rows="4" placeholder="यहाँ नियम एक-एक करके लाइन से लिखें...">${content}</textarea>
  `;
  editorContainer.appendChild(div);
}

function addNewRuleCategoryField() {
  appendRuleCategoryRow('📌 New Category', '');
}

async function saveRulesFromModal() {
  const rows = document.querySelectorAll('.rule-category-row');
  let newCategories = [];

  rows.forEach(row => {
    const title = row.querySelector('.rule-title-input').value.trim();
    const content = row.querySelector('.rule-content-input').value.trim();
    if (title) { newCategories.push({ title, content }); }
  });

  if (newCategories.length === 0) {
    alert('❌ कम से कम एक कैटेगरी होना जरूरी है।');
    return;
  }

  const rulesJsonString = JSON.stringify(newCategories);

  if (!currentSociety) {
    alert('❌ सोसायटी सेलेक्ट नहीं है।');
    return;
  }

  try {
    const { error } = await _supabase
      .from('society_settings')
      .upsert({ key: 'society_rules', value: rulesJsonString, society_name: currentSociety }, { onConflict: 'key,society_name' });

    if (error) {
      alert('❌ Rules Save करने में Error: ' + error.message);
      return;
    }

    societyRules = rulesJsonString;
    societySettings.society_rules = rulesJsonString;
    alert('✅ Rules Successfully Updated!');

    const modalEl = document.getElementById('rulesModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    renderRules();
  } catch (err) {
    console.error('Save Rules Error:', err);
    alert('❌ Something went wrong.');
  }
}

function toggleMemberSelect(value) {
  const div = document.getElementById('notice-member-select');
  if (div) div.style.display = value === 'selected' ? 'block' : 'none';
}

async function fetchPollsData() {
  const { data } = await _supabase.from('polls').select('*').eq('society_name', currentSociety);
  if (data) pollsData = data;
}

async function loadSocieties() {
  const { data } = await _supabase.from('societies').select('*').eq('is_active', true);
  return data || [];
}

async function loadSocietiesForDropdown(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const societies = await loadSocieties();
  select.innerHTML = '<option value="">-- Select --</option>';
  societies.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
}

// ============= VISITOR REALTIME (For Guard / Password Flow) =============
let __visitorGuardChannel = null;

function setupVisitorRealtimeForGuard() {
  if (__visitorGuardChannel) {
    try { _supabase.removeChannel(__visitorGuardChannel); } catch(e){}
    __visitorGuardChannel = null;
  }

  if (!currentSociety) return;

  const cleanName = currentSociety.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  __visitorGuardChannel = _supabase
    .channel(`visitor-guard-${cleanName}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'visitors' },
      (payload) => {
        console.log('[Visitor RT] Change:', payload.eventType, payload);
        const row = payload.new || payload.old || {};
        const rowSociety = (row.society || '').trim().toLowerCase();
        const mySociety = (currentSociety || '').trim().toLowerCase();
        
        if (rowSociety === mySociety) {
          console.log('[Visitor RT] Match found → reloading list');
          if (typeof loadTodayVisitors === 'function') loadTodayVisitors();
        }
      }
    )
    .subscribe((status, err) => {
      console.log('[Visitor RT] Status:', status);
      if (err) console.error('[Visitor RT] Error:', err);
    });
}

function cleanupVisitorRealtimeForGuard() {
  if (__visitorGuardChannel) {
    try { _supabase.removeChannel(__visitorGuardChannel); } catch(e){}
    __visitorGuardChannel = null;
    console.log('[Visitor RT] Cleaned up');
  }
}

async function loadTodayVisitors() {
  const container = document.getElementById('visitorListContainer');
  if (!container) return;
  container.innerHTML = `<div class="alert alert-info">⏳ Loading visitors...</div>`;
  
  const today = new Date().toISOString().split('T')[0];
  const activeSociety = (currentSociety || localStorage.getItem('ps_user_society') || 'Demo Society').trim();
  const activeUser = (currentUser || localStorage.getItem('ps_user_id') || '').trim().toUpperCase();

  try {
    let query = _supabase.from('visitors').select('*').eq('visit_date', today).ilike('society', activeSociety).order('in_time', { ascending: false });

    const { data, error } = await query;
    if (error) { container.innerHTML = `<div class="alert alert-danger">❌ Error: ${error.message}</div>`; return; }
    
    let allVisitors = data || [];
    const isLogged = localStorage.getItem('ps_user_logged') === 'true';
    if (isLogged && currentRole === 'Member' && activeUser) {
      visitors = allVisitors.filter(v => (v.flat_no || '').trim().toUpperCase() === activeUser);
    } else {
      visitors = allVisitors;
    }
    renderVisitorList();
    updateVisitorBadge();
  } catch (err) {
    console.error('Visitor fetch exception:', err);
    container.innerHTML = `<div class="alert alert-danger">❌ Failed to load visitors.</div>`;
  }
}

function renderVisitorList() {
  const container = document.getElementById('visitorListContainer');
  if (!container) return;
  if (visitors.length === 0) { container.innerHTML = `<div class="alert alert-info">No visitors today.</div>`; return; }
  
  const isMemberOrAdmin = currentRole === 'Admin' || currentRole === 'SocietyAdmin' || currentRole === 'Member';

  container.innerHTML = visitors.map(v => {
    let statusBadge = '';
    let actionButtons = '';

    if (v.status === 'PENDING') {
      statusBadge = `<span class="badge bg-warning text-dark">Pending Approval</span>`;
      if (isMemberOrAdmin) {
        actionButtons = `
          <button class="btn btn-sm btn-success me-1" onclick="updateVisitorStatus(${v.id}, 'APPROVED')"><i class="fa-solid fa-check"></i> Approve</button>
          <button class="btn btn-sm btn-danger" onclick="updateVisitorStatus(${v.id}, 'REJECTED')"><i class="fa-solid fa-times"></i> Reject</button>
        `;
      }
    } else if (v.status === 'APPROVED' || v.status === 'IN') {
      statusBadge = `<span class="badge bg-success">Approved / In</span>`;
      actionButtons = `<button class="btn btn-sm btn-outline-danger" onclick="markVisitorOut(${v.id})">OUT</button>`;
    } else if (v.status === 'REJECTED') {
      statusBadge = `<span class="badge bg-danger">Rejected</span>`;
    } else {
      statusBadge = `<span class="badge bg-secondary">Out</span>`;
    }

    return `
      <div class="visitor-card ${v.status === 'REJECTED' ? 'border border-danger' : ''}">
        <div class="info">
          <h6>${v.name} <small class="text-muted">(${v.category})</small></h6>
          <small>Flat: ${v.flat_no} | ${v.society}</small><br>
          <small>Mobile: ${v.mobile || 'N/A'} | 🚗 Vehicle: <strong>${v.vehicle_number || 'N/A'}</strong></small><br>
          <small>In: ${v.in_time ? v.in_time.substring(0,5) : 'N/A'}</small> | ${statusBadge}
        </div>
        <div>${actionButtons}</div>
      </div>
    `;   
  }).join('');
}

async function updateVisitorStatus(id, newStatus) {
  const { error } = await _supabase.from('visitors').update({ status: newStatus }).eq('id', id);
  if (error) { alert('❌ Error: ' + error.message); }
  else { alert(`✅ Visitor ${newStatus.toLowerCase()} successfully!`); loadTodayVisitors(); }
}

async function submitVisitor(event) {
  event.preventDefault();
  const society = document.getElementById('visitor-society').value || currentSociety;
  const name = document.getElementById('visitor-name').value.trim();
  const mobile = document.getElementById('visitor-mobile').value.trim();
  const vehicleNumber = document.getElementById('visitor-vehicle').value.trim().toUpperCase();
  const flat = document.getElementById('visitor-flat').value;
  const category = document.getElementById('visitor-category').value;
  const purpose = document.getElementById('visitor-purpose').value.trim();
  
  if (!society || !name || !flat || !mobile) { alert('Please fill all required fields.'); return; }
  
  const now = new Date(); 
  const timeStr = now.toTimeString().substring(0,8);
  
  const newVisitor = { 
    society: society.trim(), 
    visit_date: now.toISOString().split('T')[0], 
    name, mobile, 
    vehicle_number: vehicleNumber || 'N/A',
    flat_no: flat.trim().toUpperCase(), 
    category, 
    purpose: purpose || '', 
    in_time: timeStr, 
    out_time: null, 
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  const { error } = await _supabase.from('visitors').insert([newVisitor]);
  if (error) { alert('Error: ' + error.message); return; }
  
  alert('✅ Visitor entry recorded successfully!');
  bootstrap.Modal.getInstance(document.getElementById('visitorModal')).hide();
  document.getElementById('visitorForm').reset();
  loadTodayVisitors();
}

async function markVisitorOut(id) {
  if (!confirm('Mark this visitor as OUT?')) return;
  const now = new Date(); const timeStr = now.toTimeString().substring(0,8);
  try {
    const { error } = await _supabase.from('visitors').update({ out_time: timeStr, status: 'OUT' }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    const vIndex = visitors.findIndex(v => v.id === id);
    if (vIndex !== -1) { visitors[vIndex].status = 'OUT'; visitors[vIndex].out_time = timeStr; }
    renderVisitorList();
  } catch (err) { alert('❌ Error: ' + err.message); }
}

function updateVisitorBadge() {
  const lastSeen = parseInt(localStorage.getItem('ps_last_seen_visitors') || '0');
  const count = visitors.filter(v => (v.status === 'PENDING' || v.status === 'IN') && (v.id || 0) > lastSeen).length;
  updateBadge('visitor-badge', count);
}

function renderAMCTracker() {
  const tbody = document.getElementById('amc-list');
  if (!tbody) return;
  if (!amcContractsData || amcContractsData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No AMC Contracts Found.</td></tr>`;
    updateBadge('amc-badge', 0);
    return;
  }
  
  let expiringSoonCount = 0;
  const today = new Date();
  
  tbody.innerHTML = amcContractsData.map(c => {
    const expDate = new Date(c.expiry_date);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    let statusBadge = '<span class="badge bg-success">Active</span>';
    if (diffDays < 0) {
      statusBadge = '<span class="badge bg-danger">Expired</span>';
    } else if (diffDays <= 7) {
      statusBadge = `<span class="badge bg-warning text-dark">Expiring in ${diffDays} days 🔔</span>`;
      expiringSoonCount++;
    }

    return `
      <tr>
        <td><b>${c.service_type}</b></td>
        <td>${c.vendor_name}</td>
        <td>${c.contact_person || '-'} <br><small class="text-muted"><a href="tel:${c.phone}">${c.phone || '-'}</a></small></td>
        <td>${c.start_date} to ${c.expiry_date}</td>
        <td>${c.cost || 0}</td>
        <td>${statusBadge}</td>
        <td class="no-print">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteAMCContract(${c.id})"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  updateBadge('amc-badge', expiringSoonCount > 0 ? '🔔' : 0);
}

function renderParking() {
  const tbody = document.getElementById('parking-list');
  const pendingTbody = document.getElementById('pending-parking-list');
  const pendingSection = document.getElementById('pending-parking-section');
  if (!tbody) return;

  const approvedList = parkingData.filter(p => p.status === 'Approved');
  const pendingList = parkingData.filter(p => p.status === 'Pending');

  if (approvedList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No approved vehicles registered yet.</td></tr>`;
  } else {
    const canManage = currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin';
    tbody.innerHTML = approvedList.map(p => `
      <tr>
        <td><b>${p.flat_no}</b></td>
        <td><span class="badge bg-info text-dark">${p.vehicle_type}</span></td>
        <td>${p.vehicle_number}</td>
        <td>${p.slot_number || '<span class="text-muted">Not Assigned</span>'}</td>
        <td>${p.owner_name}</td>
        <td><span class="badge bg-success">Approved</span></td>
        <td class="no-print admin-only chairman-only ${!canManage ? 'd-none' : ''}">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteParking(${p.id})"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }

  if (pendingSection && pendingTbody) {
    if (currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin') {
      pendingSection.classList.remove('d-none');
      if (pendingList.length === 0) {
        pendingTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No pending parking requests.</td></tr>`;
      } else {
        pendingTbody.innerHTML = pendingList.map(p => `
          <tr>
            <td><b>${p.flat_no}</b></td>
            <td>${p.vehicle_type}</td>
            <td>${p.vehicle_number}</td>
            <td>${p.owner_name}</td>
            <td>${p.remarks || '-'}</td>
            <td class="no-print">
              <button class="btn btn-sm btn-success me-1" onclick="approveParking(${p.id}, 'Approved')"><i class="fa-solid fa-check"></i> Approve</button>
              <button class="btn btn-sm btn-danger" onclick="approveParking(${p.id}, 'Rejected')"><i class="fa-solid fa-times"></i> Reject</button>
            </td>
          </tr>
        `).join('');
      }
    } else {
      pendingSection.classList.add('d-none');
    }
  }

  const pendingCount = pendingList.length;
  updateBadge('parking-badge', pendingCount > 0 ? pendingCount : 0);
}

function resetParkingForm() {
  const form = document.getElementById('parkingForm');
  if (form) form.reset();
  
  const select = document.getElementById('park-flat');
  if (select) {
    if (currentRole === 'Member') {
      select.innerHTML = `<option value="${currentUser}">${currentUser}</option>`;
      select.disabled = true;
      document.getElementById('park-owner').value = currentUser;
    } else {
      select.disabled = false;
      select.innerHTML = '<option value="">-- Select Flat --</option>';
      membersData.forEach(m => {
        select.innerHTML += `<option value="${m.flat_no}">${m.flat_no} - ${m.name || ''}</option>`;
      });
    }
  }
}

async function submitParkingVehicle(event) {
  event.preventDefault();
  const flatNo = currentRole === 'Member' ? currentUser : document.getElementById('park-flat').value;
  const vehicleType = document.getElementById('park-type').value;
  const vehicleNumber = document.getElementById('park-number').value.trim().toUpperCase();
  const slotNumber = document.getElementById('park-slot')?.value.trim() || '';
  const ownerName = document.getElementById('park-owner').value.trim();
  const remarks = document.getElementById('park-remarks').value.trim();

  const isMember = currentRole === 'Member';
  const initialStatus = isMember ? 'Pending' : 'Approved';

  const newVehicle = {
    society_name: currentSociety,
    flat_no: flatNo, vehicle_type: vehicleType, vehicle_number: vehicleNumber,
    slot_number: slotNumber, owner_name: ownerName, remarks: remarks,
    status: initialStatus,
    submitted_at: new Date().toISOString()
  };

  const { error } = await _supabase.from('parking_vehicles').insert([newVehicle]);
  if (error) { alert('❌ Error: ' + error.message); return; }

  alert(isMember ? '✅ Vehicle submitted for admin approval!' : '✅ Vehicle registered & approved successfully!');
  bootstrap.Modal.getInstance(document.getElementById('parkingModal')).hide();
  fetchSupabaseData();
}

async function checkAndAutoApproveVisitors() {
  if (!currentSociety) return;
  const { data: pendingVisitors } = await _supabase.from('visitors').select('*').eq('society', currentSociety).eq('status', 'PENDING');

  if (!pendingVisitors) return;

  const now = new Date().getTime();
  for (const v of pendingVisitors) {
    const createdAt = new Date(v.created_at || v.visit_date).getTime();
    if (now - createdAt > 30000) {
      await _supabase.from('visitors').update({ status: 'APPROVED' }).eq('id', v.id);
      loadTodayVisitors();
    }
  }
}

setInterval(checkAndAutoApproveVisitors, 5000);

async function approveParking(id, status) {
  if (!confirm(`Are you sure you want to ${status.toLowerCase()} this vehicle?`)) return;
  const { error } = await _supabase.from('parking_vehicles').update({ status: status }).eq('id', id);
  if (error) { alert('❌ Error: ' + error.message); }
  else { alert(`✅ Vehicle ${status} successfully!`); fetchSupabaseData(); }
}

async function deleteParking(id) {
  if (!confirm('⚠️ Delete this vehicle record permanently?')) return;
  const { error } = await _supabase.from('parking_vehicles').delete().eq('id', id);
  if (error) alert('Error: ' + error.message);
  else fetchSupabaseData();
}

async function submitAMCContract(event) {
  event.preventDefault();
  const newAMC = {
    society_name: currentSociety,
    service_type: document.getElementById('amc-service').value.trim(),
    vendor_name: document.getElementById('amc-vendor').value.trim(),
    contact_person: document.getElementById('amc-person').value.trim(),
    phone: document.getElementById('amc-phone').value.trim(),
    start_date: document.getElementById('amc-start').value,
    expiry_date: document.getElementById('amc-expiry').value,
    cost: Number(document.getElementById('amc-cost').value || 0),
    status: 'Active'
  };

  const { error } = await _supabase.from('amc_contracts').insert([newAMC]);
  if (error) { alert('❌ Error: ' + error.message); return; }
  alert('✅ AMC Contract Saved!');
  bootstrap.Modal.getInstance(document.getElementById('amcModal')).hide();
  document.getElementById('amcForm').reset();
  fetchSupabaseData();
}

async function deleteAMCContract(id) {
  if (!confirm('⚠️ Delete this AMC Contract permanently?')) return;
  const { error } = await _supabase.from('amc_contracts').delete().eq('id', id);
  if (error) alert('Error: ' + error.message);
  else fetchSupabaseData();
}

function renderBankDetails() {
  // ✅ Demo Society ke liye purane defaults rakho, baaki ke liye empty
  const isDemo = (currentSociety === 'Demo Society');

  const accName    = societySettings.bank_acc_name        || (isDemo ? 'M/S. Aakruti Heights CHS' : '');
  const bankName   = societySettings.bank_name            || (isDemo ? 'ICICI Bank' : '');
  const accNo      = societySettings.bank_acc_no          || (isDemo ? '000000000000' : '');
  const ifsc       = societySettings.bank_ifsc            || (isDemo ? 'ICIC0000000' : '');
  const upiId      = societySettings.bank_upi_id          || (isDemo ? '8866376056@icici' : '');
  const qrUrl      = societySettings.society_qr_url       || (isDemo ? 'qr-payment.png' : '');
  const openBalVal = societySettings.opening_bank_balance || '0';

  // Display text — khaali ho to "— Not Set —" dikhao
  const showOrNotSet = (val) => val ? val : '<span class="text-muted">— Not Set —</span>';

  if (document.getElementById('bank-acc-name'))     document.getElementById('bank-acc-name').innerHTML = showOrNotSet(accName);
  if (document.getElementById('bank-name-display')) document.getElementById('bank-name-display').innerHTML = showOrNotSet(bankName);
  if (document.getElementById('bank-acc-no'))       document.getElementById('bank-acc-no').innerHTML = showOrNotSet(accNo);
  if (document.getElementById('bank-ifsc'))         document.getElementById('bank-ifsc').innerHTML = showOrNotSet(ifsc);
  if (document.getElementById('bank-upi-id'))       document.getElementById('bank-upi-id').innerHTML = showOrNotSet(upiId);

  // ✅ QR image — khaali ho to placeholder SVG dikhao (no GitHub upload needed)
  const placeholderQr = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">' +
    '<rect width="220" height="220" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" rx="12"/>' +
    '<text x="110" y="100" font-family="sans-serif" font-size="14" fill="#64748b" text-anchor="middle">QR Not Uploaded</text>' +
    '<text x="110" y="122" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Click Edit to upload</text>' +
    '</svg>'
  );

  const finalQr = qrUrl || placeholderQr;
  if (document.getElementById('society-dynamic-qr'))  document.getElementById('society-dynamic-qr').src = finalQr;
  // ✅ Member Dashboard — icon + society name + UPI ID (QR nahi)
const paySocietyNameEl = document.getElementById('pay-society-name');
const paySocietyUpiEl = document.getElementById('pay-society-upi');

if (paySocietyNameEl) {
  paySocietyNameEl.innerText = societySettings.society_name || currentSociety || 'Society';
}
if (paySocietyUpiEl) {
  if (upiId) {
    paySocietyUpiEl.innerText = `UPI: ${upiId}`;
    paySocietyUpiEl.className = 'text-muted small mb-0';
  } else {
    paySocietyUpiEl.innerText = '⚠️ UPI not set';
    paySocietyUpiEl.className = 'text-warning small fw-bold mb-0';
  }
}
  if (document.getElementById('modal-qr-img'))        document.getElementById('modal-qr-img').src = finalQr;

  // Edit modal pre-fill — khaali ho to blank input rakho
  if (document.getElementById('edit-bank-acc-name'))   document.getElementById('edit-bank-acc-name').value = accName;
  if (document.getElementById('edit-bank-name'))       document.getElementById('edit-bank-name').value = bankName;
  if (document.getElementById('edit-bank-acc-no'))     document.getElementById('edit-bank-acc-no').value = accNo;
  if (document.getElementById('edit-bank-ifsc'))       document.getElementById('edit-bank-ifsc').value = ifsc;
  if (document.getElementById('edit-bank-upi'))        document.getElementById('edit-bank-upi').value = upiId;
  if (document.getElementById('edit-opening-balance')) document.getElementById('edit-opening-balance').value = openBalVal;
}

async function saveBankDetailsAndQR(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-save-bank-qr');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

  const accName = document.getElementById('edit-bank-acc-name').value.trim();
  const bankName = document.getElementById('edit-bank-name').value.trim();
  const accNo = document.getElementById('edit-bank-acc-no').value.trim();
  const ifsc = document.getElementById('edit-bank-ifsc').value.trim();
  const upiId = document.getElementById('edit-bank-upi').value.trim();
  const openingBal = parseFloat(document.getElementById('edit-opening-balance')?.value) || 0;

  const fileInput = document.getElementById('edit-bank-qr-file');
  const file = fileInput?.files?.[0];

  let qrUrl = societySettings.society_qr_url || 'qr-payment.png';

  if (file) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentSociety}/qr_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await _supabase.storage.from('qr_codes').upload(filePath, file);
    if (!uploadError) {
      const { data: urlData } = _supabase.storage.from('qr_codes').getPublicUrl(filePath);
      qrUrl = urlData?.publicUrl || qrUrl;
    }
  }

  const updates = [
    { key: 'bank_acc_name', value: accName, society_name: currentSociety },
    { key: 'bank_name', value: bankName, society_name: currentSociety },
    { key: 'bank_acc_no', value: accNo, society_name: currentSociety },
    { key: 'bank_ifsc', value: ifsc, society_name: currentSociety },
    { key: 'bank_upi_id', value: upiId, society_name: currentSociety },
    { key: 'society_qr_url', value: qrUrl, society_name: currentSociety },
    { key: 'opening_bank_balance', value: openingBal.toString(), society_name: currentSociety }
  ];

  for (const item of updates) {
    await _supabase.from('society_settings').upsert(item, { onConflict: 'key,society_name' });
  }

  alert('✅ Bank Details & Opening Balance updated successfully!');
  bootstrap.Modal.getInstance(document.getElementById('editBankDetailsModal')).hide();
  btn.disabled = false;
  btn.innerHTML = 'Save & Upload';
  fetchSupabaseData();
}

function renderSOSContacts() {
  const container = document.getElementById('sos-contacts-list');
  if (!container) return;
  const sosList = teamData.filter(t => t.type === 'Emergency');
  if (sosList.length === 0) {
    container.innerHTML = `<div class="col-12 text-muted">No emergency contacts configured yet. Add them in Committee/Team under Type: "Emergency Contact (SOS)".</div>`;
    return;
  }

  container.innerHTML = sosList.map(item => `
    <div class="col-md-6 col-lg-4">
      <div class="card p-3 shadow-sm rounded-4 border-0 border-start border-4 border-danger h-100 bg-white">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="fw-bold text-dark mb-1">${item.name}</h5>
            <span class="badge bg-danger-subtle text-danger mb-2">${item.role}</span>
          </div>
          <a href="tel:${item.mobile}" class="btn btn-danger btn-sm rounded-circle p-2" title="Call Now">
            <i class="fa-solid fa-phone"></i>
          </a>
        </div>
        <p class="mb-0 text-muted small"><i class="fa-solid fa-phone me-1"></i> ${item.mobile}</p>
      </div>
    </div>
  `).join('');
}

const firebaseConfig = {
  apiKey: "AIzaSyAEDLQQIhlkCGupdvjp8IQiEqv6miVlRVk",
  authDomain: "ps-society-solutions.firebaseapp.com",
  projectId: "ps-society-solutions",
  storageBucket: "ps-society-solutions.firebasestorage.app",
  messagingSenderId: "345202451409",
  appId: "1:345202451409:web:d72246d863c4131e7036f0",
  measurementId: "G-8CZMXHWK5M"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const messaging = firebase.messaging();

messaging.onMessage((payload) => {
  console.log('Message received in foreground: ', payload);
  alert(`📢 ${payload.notification?.title || 'Notification'}\n${payload.notification?.body || ''}`);
});

async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.register(
        '/ps-society-app/firebase-messaging-sw.js',
        { scope: '/ps-society-app/' }
      );
      await navigator.serviceWorker.ready;
      
      const token = await messaging.getToken({
        vapidKey: 'BAOek06eNgaVPYj-VTGIBss1MHzn-miGxVT6T_2l42P4cBIQdXbiGEZGMn1IEU421-udoBNNlD6GR_8GqoMKaa4',
        serviceWorkerRegistration: registration
      });

      if (token) { await saveFCMTokenToSupabase(token); }
    }
  } catch (err) { console.error('Error in notification setup:', err); }
}

async function saveFCMTokenToSupabase(token) {
  if (!currentUser || !currentSociety) return;
  try {
    const payload = { 
      society_name: currentSociety, 
      flat_no: currentUser, 
      role: currentRole,
      token: token,
      updated_at: new Date().toISOString()
    };
    await _supabase.from('fcm_tokens').upsert([payload], { onConflict: 'token' });
    console.log('✅ FCM Token saved for:', currentUser, currentRole);
  } catch (err) { 
    console.error('Error saving FCM token:', err); 
  }
}

function sendWhatsAppReminder(phone, message) {
  if (!phone) { alert('❌ No phone number found.'); return; }
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  let finalPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
}

function sendBulkWhatsAppReminder() {
  const pendingMembers = membersData.filter(m => {
    const flatNo = (m.flat_no || '').toUpperCase();
    const flatPaid = maintenanceData.filter(r => (r.flat_no || '').toUpperCase() === flatNo).reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
    const rate = Number(m.monthly_rate || 600);
    const totalDue = MONTHS_IN_FY_SO_FAR * rate;
    return (Number(m.opening_due || 0) + totalDue - flatPaid) > 0;
  });

  // Filter members with valid phone numbers
  const membersWithPhone = pendingMembers.filter(m => m.phone && m.phone.trim() !== '');

  if (membersWithPhone.length === 0) {
    alert('✅ No pending dues with valid phone numbers!');
    return;
  }

  // Show a warning if count is high
  const WARN_THRESHOLD = 5;
  let proceedMessage = `📢 ${membersWithPhone.length} members ko reminder bhejna hai?`;
  if (membersWithPhone.length > WARN_THRESHOLD) {
    proceedMessage += `\n\n⚠️ NOTE: Browser ek baar mein sirf ${WARN_THRESHOLD}-6 tabs allow karta hai.\nIsliye reminders batch mein bhejne padenge.\n\nHar batch ke baad aapko "Next Batch" button dabana hoga.`;
  }

  if (!confirm(proceedMessage)) return;

  // Build list of members with personalized messages
  const reminderList = membersWithPhone.map(m => {
    const flatNo = (m.flat_no || '').toUpperCase();
    const flatPaid = maintenanceData
      .filter(r => (r.flat_no || '').toUpperCase() === flatNo)
      .reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
    const rate = Number(m.monthly_rate || 600);
    const totalDue = MONTHS_IN_FY_SO_FAR * rate;
    const pendingAmt = Number(m.opening_due || 0) + totalDue - flatPaid;

    const message = `Dear ${m.name || 'Member'} (Flat ${flatNo}),\n\nYour maintenance dues of ₹${pendingAmt.toFixed(0)} are pending. Please clear them at the earliest.\n\n- PS Society Solutions`;

    return { name: m.name || flatNo, flatNo, phone: m.phone, message };
  });

  // Open first batch (5 tabs max at once)
  sendReminderBatch(reminderList, 0, WARN_THRESHOLD);
}

// Helper: Send a batch of reminders and show "Next Batch" button
function sendReminderBatch(list, startIndex, batchSize) {
  const batch = list.slice(startIndex, startIndex + batchSize);
  const remaining = list.length - (startIndex + batchSize);

  // Open each WhatsApp in this batch with 800ms gap
  batch.forEach((item, i) => {
    setTimeout(() => {
      const cleanPhone = item.phone.replace(/[^0-9]/g, '');
      const finalPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(item.message)}`, '_blank');
    }, i * 800);
  });

  // If more members remain, show a floating "Next Batch" button
  if (remaining > 0) {
    // Remove old button if any
    const oldBtn = document.getElementById('nextBatchBtn');
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement('button');
    btn.id = 'nextBatchBtn';
    btn.style.cssText = `
      position: fixed; bottom: 100px; right: 25px; z-index: 99999;
      background: linear-gradient(135deg, #25d366, #1da851); color: white;
      border: none; padding: 14px 26px; font-size: 15px;
      font-weight: 700; border-radius: 50px; cursor: pointer;
      box-shadow: 0 8px 25px rgba(37, 211, 102, 0.5);
      font-family: 'Plus Jakarta Sans', sans-serif;
    `;
    btn.innerHTML = `📤 Next Batch (${remaining} left) →`;
    btn.onclick = () => {
      btn.remove();
      sendReminderBatch(list, startIndex + batchSize, batchSize);
    };
    document.body.appendChild(btn);

    alert(`✅ Batch-1 bhej diya (${batch.length} members).\n\n📤 Ab "${remaining} remaining" ke liye screen pe "Next Batch" button dabao.`);
  } else {
    // All done — cleanup
    const oldBtn = document.getElementById('nextBatchBtn');
    if (oldBtn) oldBtn.remove();
    alert(`✅ All ${list.length} reminders sent successfully!`);
  }
}

// ══════════════════════════════════════════════════
// 🎬 LIVE DEMO MODE — Read-only, no login
// Society: "PS Live Demo"
// ══════════════════════════════════════════════════
const DEMO_SOCIETY_NAME = 'PS Live Demo';

function isDemoMode() {
  return localStorage.getItem('ps_demo_mode') === 'true';
}

function blockDemoWrite() {
  if (isDemoMode()) {
    alert('🔒 Demo Mode mein changes allowed nahi hain.\n\nPlease login to make changes.');
    return true;
  }
  return false;
}

async function startLiveDemo() {
  if (isDemoMode()) {
    alert('✅ You are already in Demo Mode.');
    return;
  }

  if (!confirm('🎬 Start Live Demo?\n\nSample society ka data dekh sakenge (read-only).\nKoi login zaroori nahi.')) {
    return;
  }

  localStorage.setItem('ps_demo_mode', 'true');
  localStorage.setItem('ps_demo_society', DEMO_SOCIETY_NAME);

  currentSociety = DEMO_SOCIETY_NAME;
  currentRole = 'Member';
  currentUser = 'DEMO-VIEWER';
  clearAllData();

  document.getElementById('landing-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('visitor-section').style.display = 'none';
  document.getElementById('app-section').classList.remove('d-none');
  document.body.classList.add('demo-mode');

  showDemoBanner();

  const socElem = document.getElementById('sidebar-society-name');
  if (socElem) socElem.innerText = DEMO_SOCIETY_NAME + ' 🎬';
  const roleBadge = document.getElementById('user-role-badge');
  if (roleBadge) roleBadge.innerText = 'DEMO';

  try {
    await fetchSupabaseData();
    setTimeout(() => loadSecondaryData(), 500);
  } catch (e) { console.error('Demo load error:', e); }

  if (window.innerWidth <= 768) {
    setTimeout(() => toggleMobileMenu(), 400);
  }
}

function showDemoBanner() {
  const existing = document.getElementById('demoModeBanner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.id = 'demoModeBanner';
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
    background: linear-gradient(90deg, #f59e0b, #ea580c);
    color: #fff; padding: 10px 16px; text-align: center;
    font-weight: 700; font-size: 13px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
    font-family: 'Plus Jakarta Sans', sans-serif;
  `;
  banner.innerHTML = `
    🎬 DEMO MODE — Read Only Preview (PS Live Demo)
    <button onclick="exitDemoMode()" style="
      background: #fff; color: #ea580c; border: none;
      padding: 4px 14px; border-radius: 20px;
      font-weight: 700; font-size: 12px;
      cursor: pointer; margin-left: 12px;
    ">Exit Demo</button>
  `;
  document.body.appendChild(banner);
  document.body.style.paddingTop = '42px';
}

function exitDemoMode() {
  if (!confirm('Exit Demo Mode?')) return;
  localStorage.removeItem('ps_demo_mode');
  localStorage.removeItem('ps_demo_society');
  const baseUrl = window.location.origin + window.location.pathname;
  window.location.replace(baseUrl + '?t=' + Date.now());
}

function renderPaymentProofs() {
  const containers = document.querySelectorAll('#proofs-container');
  if (containers.length === 0) return;

  let html = '';
  let pendingText = '0 Pending';

  if (paymentProofs.length === 0) {
    html = `<tr><td colspan="6" class="text-center text-muted">No payment details submitted yet.</td></tr>`;
  } else {
    const pending = paymentProofs.filter(p => p.status === 'Pending').length;
    pendingText = `${pending} Pending`;

    html = paymentProofs.map(p => {
      const member = membersData.find(m => (m.flat_no || '').toUpperCase() === (p.flat_no || '').toUpperCase());
      const memberPhone = member?.phone || '';
      const hasImage = p.image_url && p.image_url.trim() !== '';
      const isPending = p.status === 'Pending';
      const statusBadge = isPending
        ? '<span class="badge bg-warning text-dark">Pending</span>'
        : (p.status === 'Verified' ? '<span class="badge bg-success">Verified</span>' : '<span class="badge bg-danger">Rejected</span>');

      return `
        <tr>
          <td><b>${p.flat_no}</b></td>
          <td>${p.amount}</td>
          <td>${p.payment_date}</td>
          <td>${statusBadge}</td>
          <td>${hasImage ? `<img src="${p.image_url}" alt="Proof" style="height:45px; width:45px; object-fit:cover; border-radius:8px; cursor:pointer;" onclick="window.open('${p.image_url}','_blank')">` : '<span class="text-muted">-</span>'}</td>
          <td class="no-print">
            ${isPending && (currentRole === 'Admin' || currentRole === 'SocietyAdmin') ? `
              <button class="btn btn-sm btn-success me-1" onclick="verifyProof(${p.id}, 'Verified')"><i class="fa-solid fa-check"></i></button>
              <button class="btn btn-sm btn-danger me-1" onclick="verifyProof(${p.id}, 'Rejected')"><i class="fa-solid fa-times"></i></button>
            ` : '<span class="text-muted">-</span>'}
            ${(currentRole === 'Admin' || currentRole === 'SocietyAdmin') && memberPhone ? `
              <button class="btn btn-sm btn-whatsapp ms-1" onclick="sendWhatsAppReminder('${memberPhone}', 'Regarding your payment of ${p.amount} for Flat ${p.flat_no}.')"><i class="fa-brands fa-whatsapp" style="color: #25d366 !important;"></i></button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }

  containers.forEach(container => { container.innerHTML = html; });

  document.querySelectorAll('#pending-proof-count').forEach(el => {
    el.innerText = pendingText;
  });
}

// ═══════════════════════════════════════════════════
// 🗑️ DELETE SINGLE IMAGE (DB row stays, only image removed)
// ═══════════════════════════════════════════════════
async function deleteSingleImage({ table, rowId, column, bucket, imageUrl, refreshFn, label }) {
  if (currentRole !== 'Admin' && currentRole !== 'SocietyAdmin') {
    alert('⛔ Only Admin can delete images.');
    return;
  }
  if (!confirm(`⚠️ Delete this ${label || 'image'}?\n\n(Data will stay — only image removed)`)) return;
  if (!imageUrl) { alert('No image found.'); return; }

  try {
    const parts = imageUrl.split(`/${bucket}/`);
    if (parts.length < 2) { alert('❌ Invalid image URL'); return; }
    const filePath = decodeURIComponent(parts[1]);

    const { error: delErr } = await _supabase.storage.from(bucket).remove([filePath]);
    if (delErr) { alert('❌ Storage delete failed: ' + delErr.message); return; }

    const { error: updErr } = await _supabase
      .from(table)
      .update({ [column]: null })
      .eq('id', rowId);

    if (updErr) { alert('❌ DB update failed: ' + updErr.message); return; }

    console.log(`[ImgDelete] ${table}.${column} nulled for id=${rowId}`);
    alert('✅ Image deleted (data safe)');

    if (typeof refreshFn === 'function') refreshFn();
  } catch (e) {
    alert('❌ Error: ' + e.message);
  }
}

async function verifyProof(id, status) {
  if (!confirm(`Are you sure you want to mark this proof as ${status}?`)) return;
  const proof = paymentProofs.find(p => p.id === id);
  if (!proof) return;

  try {
    // ✅ STEP 1: Agar Verified, pehle maintenance payment insert karo
    if (status === 'Verified') {
      const paymentDate = new Date(proof.payment_date);
      const newReceipt = {
        receipt_no: `AUTO-${Date.now()}`,
        flat_no: proof.flat_no,
        payment_date: proof.payment_date,
        amount_paid: Number(proof.amount),
        mode_of_payment: proof.mode || 'UPI',
        month_accounted: paymentDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        remarks: `Auto-verified from UTR: ${proof.utr || 'N/A'}`,
        society_name: proof.society_name || currentSociety
      };

      const { error: mpErr } = await _supabase
        .from('maintenance_payments')
        .insert([newReceipt]);

      if (mpErr) {
        alert('❌ Failed to add maintenance record: ' + mpErr.message);
        return;
      }
    }

    // ✅ STEP 2: DB update karo (status change) — image_url abhi mat chhero
    const { error: updErr } = await _supabase
      .from('payment_proofs')
      .update({
        status: status,
        verified_at: new Date().toISOString(),
        verified_by: currentUser
      })
      .eq('id', id);

    if (updErr) {
      alert('❌ DB update failed: ' + updErr.message);
      // Maintenance payment already added — admin ko batao
      if (status === 'Verified') {
        alert('⚠️ NOTE: Maintenance entry was added, but proof status could not be updated. Please refresh and check.');
        fetchSupabaseData();
      }
      return;
    }

    // ✅ STEP 3: DB safe hai ab. Ab storage se image delete karo
    if (proof.image_url && proof.image_url.trim() !== '') {
      try {
        const urlParts = proof.image_url.split('/payment_proofs/');
        if (urlParts.length > 1) {
          const filePath = decodeURIComponent(urlParts[1]);
          const { error: delErr } = await _supabase.storage
            .from('payment_proofs')
            .remove([filePath]);

          if (delErr) {
            console.warn('[Verify] Image delete failed:', delErr.message);
            // Image delete fail hui, but DB safe hai — orphan file rahegi, koi issue nahi
          } else {
            console.log('[Verify] Image deleted from storage:', filePath);

            // ✅ STEP 4: Storage delete success → ab DB mein image_url = null karo
            const { error: nullErr } = await _supabase
              .from('payment_proofs')
              .update({ image_url: null })
              .eq('id', id);

            if (nullErr) {
              console.warn('[Verify] Could not null image_url:', nullErr.message);
            }
          }
        }
      } catch (imgErr) {
        console.warn('[Verify] Image cleanup error:', imgErr);
      }
    }

    // ✅ STEP 5: Member ko notify karo
    await sendProofNotificationToMember(
      proof.flat_no,
      Number(proof.amount),
      status,
      proof.society_name || currentSociety
    );

    alert(status === 'Verified'
      ? '✅ Payment verified! Member notified.'
      : '❌ Proof rejected! Member notified.'
    );

    // ✅ STEP 6: Fresh data fetch karo aur render
    const { data: freshProofs } = await _supabase
      .from('payment_proofs')
      .select('*')
      .eq('society_name', currentSociety);
    if (freshProofs) paymentProofs = freshProofs;

    const { data: freshMaint } = await _supabase
      .from('maintenance_payments')
      .select('*')
      .eq('society_name', currentSociety);
    if (freshMaint) maintenanceData = freshMaint;

    renderPaymentProofs();
    renderMyPaymentSubmissions();
    renderMaintenance();
    renderMembers();
    updateAllBadges();

  } catch (err) {
    alert('❌ Error: ' + err.message);
    console.error('verifyProof error:', err);
  }
}

async function submitPaymentDetails(event) {
  event.preventDefault();
  const paymentDate = document.getElementById('pay-form-date').value;
  const amount = document.getElementById('pay-form-amount').value;
  const mode = document.getElementById('pay-form-mode').value;
  const bank = document.getElementById('pay-form-bank').value;
  const utr = document.getElementById('pay-form-utr').value;
  const app = document.getElementById('pay-form-app').value;
  const notes = document.getElementById('pay-form-notes').value;
  const file = document.getElementById('pay-form-image')?.files?.[0];

  let imageUrl = null;
  if (file) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentSociety}/proof_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await _supabase.storage
      .from('payment_proofs')
      .upload(filePath, file);
    if (!uploadError) {
      const { data: urlData } = _supabase.storage
        .from('payment_proofs')
        .getPublicUrl(filePath);
      imageUrl = urlData?.publicUrl || null;
    }
  }

  const newProof = {
    flat_no: currentUser,
    payment_date: paymentDate,
    amount: parseFloat(amount),
    mode, bank, utr,
    app: app || '',
    notes: notes || '',
    image_url: imageUrl,
    status: 'Pending',
    submitted_at: new Date().toISOString(),
    society_name: currentSociety
  };

  const { error } = await _supabase.from('payment_proofs').insert([newProof]);
  if (error) { alert('❌ Error: ' + error.message); return; }

  try {
    const { data: adminUsers, error: adminErr } = await _supabase
      .from('user_master')
      .select('flat_no, role')
      .eq('society_name', currentSociety)
      .in('role', ['Admin', 'SocietyAdmin', 'Chairman']);

    if (adminErr) console.warn('[PaymentProof] Admin query error:', adminErr.message);

    const adminFlats = (adminUsers || [])
      .map(u => (u.flat_no || '').trim().toUpperCase())
      .filter(Boolean);

    const memberInfo = membersData.find(m => (m.flat_no || '').trim().toUpperCase() === currentUser.toUpperCase());
    const memberName = memberInfo?.name || 'Member';
    const memberPhone = memberInfo?.phone || '';

    console.log('[PaymentProof] Admin flats to notify:', adminFlats);

    if (adminFlats.length > 0) {
      const noticePayload = {
        society_name: currentSociety,
        title: `💰 ₹${amount} - Flat ${currentUser}`,
        content: `${memberName} (Flat ${currentUser}${memberPhone ? ', ' + memberPhone : ''}) submitted payment of ₹${amount}. UTR: ${utr || 'N/A'}.`,
        date: new Date().toISOString().split('T')[0],
        author: currentUser,
        priority: 'High',
        target_members: adminFlats,
        attachment_url: null,
        deep_link: '/?tab=proofs'
      };

      const { error: noticeErr } = await _supabase.from('notices').insert([noticePayload]);

      if (noticeErr) {
        console.warn('[PaymentProof] First insert failed, retry without deep_link:', noticeErr.message);
        delete noticePayload.deep_link;
        const { error: noticeErr2 } = await _supabase.from('notices').insert([noticePayload]);
        if (noticeErr2) {
          console.error('[PaymentProof] Fallback insert also failed:', noticeErr2.message);
        } else {
          console.log('[PaymentProof] Inserted WITHOUT deep_link');
        }
      } else {
        console.log('[PaymentProof] Admin notice inserted for:', adminFlats);
      }
    } else {
      console.warn('[PaymentProof] No admin users found for society:', currentSociety);
    }
  } catch (notifyErr) {
    console.error('[PaymentProof] Admin notify error:', notifyErr);
  }

  alert('✅ Submitted successfully! Admin will verify soon.');
  bootstrap.Modal.getInstance(document.getElementById('paymentDetailsModal')).hide();
  document.getElementById('paymentProofForm').reset();
  fetchSupabaseData();
}

let __proofRealtimeChannel = null;

function setupRealtimeSubscriptions() {
  // Cleanup old channel
  if (__proofRealtimeChannel) {
    try { _supabase.removeChannel(__proofRealtimeChannel); } catch(e) {}
    __proofRealtimeChannel = null;
  }

  if (!currentSociety) return;

  const cleanName = currentSociety.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const encodedSociety = encodeURIComponent(currentSociety);
  const socFilter = `society_name=eq.${encodedSociety}`;

  __proofRealtimeChannel = _supabase
    .channel(`society-rt-${cleanName}`)

    // 1. PAYMENT PROOFS (with Admin notification)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'payment_proofs', filter: socFilter },
      async (payload) => {
        console.log('[RT] payment_proofs:', payload.eventType);
        const { data } = await _supabase.from('payment_proofs').select('*').eq('society_name', currentSociety);
        paymentProofs = data || [];
        renderPaymentProofs();
        renderMyPaymentSubmissions();
        updateAllBadges();

        if (payload.eventType === 'INSERT' &&
            (currentRole === 'Admin' || currentRole === 'SocietyAdmin' || currentRole === 'Chairman')) {
          try {
            if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => {
                reg.showNotification('💰 New Payment Proof Submitted', {
                  body: `Flat ${payload.new.flat_no} — ₹${payload.new.amount}`,
                  icon: '/ps-society-app/icon-192.png',
                  badge: '/ps-society-app/icon-192.png',
                  tag: `proof-${payload.new.id}`,
                  renotify: true,
                  data: { url: '/ps-society-app/?tab=proofs' }
                });
              });
            }
          } catch (e) { console.log('Notify err:', e); }
        }
      })

    // 2. MEMBERS
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'members', filter: socFilter },
      async () => {
        console.log('[RT] members changed');
        const { data } = await _supabase.from('members').select('*').eq('society_name', currentSociety);
        membersData = data || [];
        renderMembers();
        renderMemberPersonalView();
        renderTenantAgreementWarnings();
        renderCelebrations();
      })

    // 3. COMPLAINTS
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'complaints', filter: socFilter },
      async () => {
        console.log('[RT] complaints changed');
        const { data } = await _supabase.from('complaints').select('*').eq('society_name', currentSociety);
        complaintData = data || [];
        renderComplaints();
        updateAllBadges();
      })

    // 4. NOTICES
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'notices', filter: socFilter },
      async () => {
        console.log('[RT] notices changed');
        const { data } = await _supabase.from('notices').select('*').eq('society_name', currentSociety);
        noticesData = data || [];
        renderNoticesCommunity();
        updateAllBadges();
      })

    // 5. POLLS
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'polls', filter: socFilter },
      async () => {
        console.log('[RT] polls changed');
        const { data } = await _supabase.from('polls').select('*').eq('society_name', currentSociety);
        pollsData = data || [];
        renderPolls();
        updateAllBadges();
      })

    // 6. VISITORS
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'visitors', filter: `society=eq.${encodedSociety}` },
      async () => {
        console.log('[RT] visitors changed');
        if (typeof loadTodayVisitors === 'function') loadTodayVisitors();
      })

    // 7. MAINTENANCE PAYMENTS
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'maintenance_payments', filter: socFilter },
      async () => {
        console.log('[RT] maintenance_payments changed');
        const { data } = await _supabase.from('maintenance_payments').select('*').eq('society_name', currentSociety);
        maintenanceData = data || [];
        renderMaintenance();
        renderMembers();
        renderMemberPersonalView();
        renderMyPaymentHistory();
        renderTallyBankBook();
      })

    // 8. EXPENSES
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'expenses', filter: socFilter },
      async () => {
        console.log('[RT] expenses changed');
        const { data } = await _supabase.from('expenses').select('*').eq('society_name', currentSociety);
        expenseData = data || [];
        renderExpenses();
        renderTallyBankBook();
        renderBankReconciliation();
      })

    // 9. BANK ENTRIES (Tally Bank + BRS)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'bank_entries', filter: socFilter },
      async () => {
        console.log('[RT] bank_entries changed');
        const { data } = await _supabase.from('bank_entries').select('*').eq('society_name', currentSociety).order('date', { ascending: false });
        customBankEntries = data || [];
        renderTallyBankBook();
        renderBankReconciliation();
      })

    // 10. ASSETS (CA Audit)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'assets', filter: socFilter },
      async () => {
        console.log('[RT] assets changed');
        const { data } = await _supabase.from('assets').select('*').eq('society_name', currentSociety);
        assetData = data || [];
        renderAssets();
        renderCAAuditReport();
      })

    // 11. FDs (CA Audit)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'sinking_fund_fd', filter: socFilter },
      async () => {
        console.log('[RT] sinking_fund_fd changed');
        const { data } = await _supabase.from('sinking_fund_fd').select('*').eq('society_name', currentSociety);
        fdData = data || [];
        renderFDs();
        renderCAAuditReport();
      })

    // 12. JOURNAL VOUCHERS (Member Ledger + CA Audit)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'journal_vouchers', filter: socFilter },
      async () => {
        console.log('[RT] journal_vouchers changed');
        const { data } = await _supabase.from('journal_vouchers').select('*').eq('society_name', currentSociety).order('date', { ascending: false });
        journalVouchersData = data || [];
        renderJournalVouchers();
        renderMembers();
        renderMemberPersonalView();
      })

        // 13. SUPPORT TICKETS (Society-isolated real-time)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'support_tickets', filter: socFilter },
      async (payload) => {
        console.log('[RT] support_tickets changed:', payload.eventType);
        await loadSupportTickets();
        renderSupportTickets();
        updateSupportBadge();
      })

    .subscribe((status) => {
      console.log('[RT] channel status:', status);
      if (status === 'SUBSCRIBED') console.log('✅ Realtime connected for', currentSociety);
      if (status === 'CHANNEL_ERROR') console.warn('⚠️ Realtime channel error');
    });
}

function renderMemberPersonalView() {
  if (currentRole !== 'Member') return;
  const userFlat = (currentUser || '').trim().toUpperCase();
  
  const ledgerContainer = document.getElementById('my-member-ledger-list');
  if (!ledgerContainer) return;

  const myFlatData = maintenanceData.filter(r => (r.flat_no || '').trim().toUpperCase() === userFlat);
  const myFlatJVs = journalVouchersData.filter(jv => (jv.flat_no || '').trim().toUpperCase() === userFlat);
  const member = membersData.find(m => (m.flat_no || '').trim().toUpperCase() === userFlat);
  
  const rate = member ? Number(member.monthly_rate || 600) : 600;
  const openingDue = member ? Number(member.opening_due || 0) : 0;
  
  const fyStartDateStr = getCurrentFYStartDate(); // ✅ Helper
  
  let runningBalance = openingDue;
  let ledgerRows = [{ date: fyStartDateStr, particulars: 'Opening Balance Due', debit: openingDue, credit: 0, balance: runningBalance }];
  
  const fyStartDate = new Date(fyStartDateStr);
  let currentIterDate = new Date(fyStartDate);
  
  let monthlyDueEntries = [];
  for (let i = 0; i < MONTHS_IN_FY_SO_FAR; i++) {
    const monthName = currentIterDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    const dueDate = `${currentIterDate.getFullYear()}-${String(currentIterDate.getMonth() + 1).padStart(2, '0')}-10`;
    monthlyDueEntries.push({ date: dueDate, type: 'monthly_due', particulars: `Monthly Maintenance Due (${monthName}) [Rate: ₹${rate}]`, amount: rate });
    currentIterDate.setMonth(currentIterDate.getMonth() + 1);
  }

  let combinedTransactions = [
    ...monthlyDueEntries.map(m => ({ date: m.date, type: 'due', data: m })),
    ...myFlatData.map(r => ({ date: r.payment_date, type: 'receipt', data: r })),
    ...myFlatJVs.map(jv => ({ date: jv.date, type: 'jv', data: jv }))
  ];
  combinedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  combinedTransactions.forEach(item => {
    if (item.type === 'due') {
      const d = item.data;
      runningBalance += d.amount;
      ledgerRows.push({ date: d.date, particulars: d.particulars, debit: d.amount, credit: 0, balance: runningBalance });
    } else if (item.type === 'receipt') {
      const r = item.data;
      const amt = Number(r.amount_paid || 0);
      runningBalance -= amt; 
      ledgerRows.push({ date: r.payment_date || '-', particulars: `Maintenance Payment Received (Receipt: ${r.receipt_no || '-'})`, debit: 0, credit: amt, balance: runningBalance });
    } else if (item.type === 'jv') {
      const jv = item.data;
      const amt = Number(jv.amount || 0);
      if (jv.type === 'Debit') {
        runningBalance += amt;
        ledgerRows.push({ date: jv.date || '-', particulars: `Journal Voucher [Debit] (${jv.jv_no}): ${jv.reason}`, debit: amt, credit: 0, balance: runningBalance });
      } else {
        runningBalance -= amt;
        ledgerRows.push({ date: jv.date || '-', particulars: `Journal Voucher [Credit/Waiver] (${jv.jv_no}): ${jv.reason}`, debit: 0, credit: amt, balance: runningBalance });
      }
    }
  });

  const finalPendingBeforeLateFee = Math.max(0, runningBalance);
  const lateFee = calculateLateFee(finalPendingBeforeLateFee, rate);
  if (lateFee > 0) {
    runningBalance += lateFee;
    ledgerRows.push({ date: new Date().toISOString().split('T')[0], particulars: `Auto Late Fee / Interest Penalty`, debit: lateFee, credit: 0, balance: runningBalance });
  }

  const myTotalPaid = myFlatData.reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
  if (document.getElementById('my-flat-pending')) {
    if (lateFee > 0) {
      document.getElementById('my-flat-pending').innerHTML = `${runningBalance} <br><small class="text-warning" style="font-size: 12px; font-weight: 600;">(Incl. Late Fee: ₹${lateFee})</small>`;
    } else {
      document.getElementById('my-flat-pending').innerText = runningBalance;
    }
  }
  if (document.getElementById('my-flat-paid')) document.getElementById('my-flat-paid').innerText = myTotalPaid;

  ledgerContainer.innerHTML = ledgerRows.map(row => `
    <tr>
      <td>${row.date}</td>
      <td>${row.particulars}</td>
      <td class="text-danger">${row.debit > 0 ? row.debit : '-'}</td>
      <td class="text-success">${row.credit > 0 ? row.credit : '-'}</td>
      <td class="fw-bold ${row.balance > 0 ? 'text-danger' : 'text-success'}">${row.balance}</td>
    </tr>
  `).join('');

  renderMyPaymentHistory();
  renderMyPaymentSubmissions();
}

function renderTallyBankBook() {
  const tbody = document.getElementById('tally-bank-entries');
  if (!tbody) return;
  
  const fyStartDate = getCurrentFYStartDate(); // ✅ Helper use karo
  
  let runningBalance = openingBalance;
  let totalMoneyIn = 0, totalMoneyOut = 0;
  let bankEntries = [{ date: fyStartDate, ref: 'OPENING-BAL', head: 'Opening Bank Balance', type: 'Receipt', deposit: openingBalance, withdraw: 0, source: null, id: null }];
  
  maintenanceData.forEach(r => {
    const amt = Number(r.amount_paid || 0);
    totalMoneyIn += amt;
    bankEntries.push({ date: r.payment_date || fyStartDate, ref: r.receipt_no || 'REC-001', head: `Maintenance - ${r.flat_no}`, type: 'Receipt (Bank In)', deposit: amt, withdraw: 0, source: 'maintenance', id: r.id });
  });
  expenseData.forEach(e => {
    const amt = Number(e.amount || 0);
    totalMoneyOut += amt;
    bankEntries.push({ date: e.expense_date || fyStartDate, ref: e.voucher_no || 'VOU-001', head: `${e.category} - ${e.paid_to}`, type: 'Payment Voucher', deposit: 0, withdraw: amt, source: 'expense', id: e.id });
  });
  customBankEntries.forEach(cb => { 
    cb.source = 'custom'; 
    bankEntries.push(cb); 
    totalMoneyIn += Number(cb.deposit || 0); 
    totalMoneyOut += Number(cb.withdraw || 0); 
  });
  
  bankEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
  tbody.innerHTML = bankEntries.map((entry, idx) => {
    if (entry.ref !== 'OPENING-BAL') runningBalance += (entry.deposit - entry.withdraw);
    return `
      <tr>
        <td>${entry.date}</td>
        <td><b>${entry.ref}</b></td>
        <td>${entry.head}</td>
        <td><span class="badge ${entry.deposit > 0 ? 'bg-success' : 'bg-danger'}">${entry.type}</span></td>
        <td class="text-success fw-bold">${entry.deposit > 0 ? entry.deposit : '-'}</td>
        <td class="text-danger fw-bold">${entry.withdraw > 0 ? entry.withdraw : '-'}</td>
        <td class="fw-bold text-primary">${runningBalance.toFixed(2)}</td>
        <td class="no-print admin-only ${currentRole !== 'Admin' && currentRole !== 'SocietyAdmin' ? 'd-none' : ''}">
          ${entry.source ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteBankEntry('${entry.source}', ${entry.id})"><i class="fa-solid fa-trash"></i></button>` : '-'}
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('tally-tot-in').innerText = totalMoneyIn.toFixed(2);
  document.getElementById('tally-tot-out').innerText = totalMoneyOut.toFixed(2);
  document.getElementById('tally-calc-balance').innerText = runningBalance.toFixed(2);
  document.getElementById('tally-opening-balance').innerText = openingBalance.toFixed(2);
}

async function deleteBankEntry(source, id) {
  if (!confirm('⚠️ Delete this entry permanently?')) return;
  if (source === 'maintenance') { await deleteMaintenance(id); }
  else if (source === 'expense') { await deleteExpense(id); }
  else if (source === 'custom') {
    const { error } = await _supabase
  .from('bank_entries')
  .delete()
  .eq('id', id)
  .eq('society_name', currentSociety);
    if (error) { alert('❌ Error: ' + error.message); return; }
    fetchSupabaseData();
    setTimeout(() => loadSecondaryData(), 500);
  }
}

function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('d-none'));
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.remove('d-none');

  document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => link.classList.remove('active'));
  if (element) element.classList.add('active');

  if (tabId === 'about') renderAboutTab();
  if (tabId === 'rules') renderRules();
  if (tabId === 'bills') { initBillsTab(); }
if (tabId === 'ca-audit') { 
  // Re-fetch settings to ensure fresh opening_capital
  _supabase.from('society_settings').select('*').eq('society_name', currentSociety).then(({ data }) => {
    if (data) {
      societySettings = {};
      data.forEach(s => { societySettings[s.key] = s.value; });
    }
    renderCAAuditReport();
  });
}

  if (tabId === 'visitor') {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';

  const visitorSection = document.getElementById('visitor-section');
  if (visitorSection) { 
    visitorSection.style.display = 'block'; 
    // ✅ History state push karo taaki native back kaam kare
    if (!history.state || !history.state.visitorOpen) {
      window.history.pushState({ visitorOpen: true }, "", window.location.href);
    }
  }

  const appSection = document.getElementById('app-section');
  if (appSection) appSection.classList.add('d-none');

  const backBtn = document.getElementById('visitorBackBtn');
  if (backBtn) backBtn.onclick = goBackFromVisitor;

  loadTodayVisitors();
  if (visitors.length > 0) { localStorage.setItem('ps_last_seen_visitors', Math.max(...visitors.map(v => v.id || 0)).toString()); }
  updateBadge('visitor-badge', 0);
  setupVisitorRealtimeForGuard();
}

  if (tabId === 'marketplace') { fetchMarketplaceData().then(renderMarketplace); }
  if (tabId === 'master-dashboard') { 
    renderSuperAdminMasterDashboard(); 
    setTimeout(() => loadSubscriptionInvoices(), 300);
  }
  if (tabId === 'bank-reconciliation') { renderBankReconciliation(); }

  if (tabId === 'parking') {
    _supabase.from('parking_vehicles').select('*').eq('society_name', currentSociety).then(({ data }) => {
      parkingData = data || [];
      renderParking();
    });
  }

  if (tabId === 'polls') {
    const maxPoll = pollsData.length > 0 ? Math.max(...pollsData.map(p => p.id || 0)) : 0;
    localStorage.setItem('ps_last_seen_polls', maxPoll.toString());
    updateAllBadges();
    renderPolls();
  }

  if (tabId === 'meetings') {
    _supabase.from('society_meetings').select('*').eq('society_name', currentSociety).then(({ data }) => {
      meetingsData = data || [];
      renderMeetings();
    });
  }

  if (tabId === 'activity-logs') { fetchActivityLogs(); }

  if (tabId === 'maintenance') {
    if (maintenanceData.length > 0) { localStorage.setItem('ps_last_seen_maintenance', Math.max(...maintenanceData.map(r => r.id || 0)).toString()); }
    updateBadge('maintenance-badge', 0);
  }

  if (tabId === 'chairman-report' || tabId === 'monthly-summary') {
    if (typeof generateMonthlySummary === 'function') { generateMonthlySummary(); }
  }

  if (tabId === 'proofs') {
    if (paymentProofs.length > 0) { localStorage.setItem('ps_last_seen_proofs', Math.max(...paymentProofs.map(p => p.id || 0)).toString()); }
    updateBadge('proofs-badge', 0);
    renderPaymentProofs();
  }

  if (tabId === 'complaints') {
    if (complaintData.length > 0) { localStorage.setItem('ps_last_seen_complaints', Math.max(...complaintData.map(c => c.id || 0)).toString()); }
    updateBadge('complaints-badge', 0);
  }

  if (tabId === 'support') {
    loadSupportTickets().then(() => {
      renderSupportTickets();
      updateSupportBadge();
    });
  }

  if (tabId === 'manage-societies') { loadSocietiesList(); }
  if (tabId === 'deletion-requests') { renderDeletionRequests(); }
  if (tabId === 'community') { markCommunityRead(); renderCommunity(); }
  if (tabId === 'amc-tracker') renderAMCTracker();
  if (tabId === 'bank-details') renderBankDetails();
  if (tabId === 'sos-contacts') renderSOSContacts();
  if (tabId === 'user-management') { initUserManagementTab(); }
  if (tabId === 'settings') { loadSettingsToForm(); }

  if (['dashboard', 'members', 'maintenance', 'expenses', 'polls', 'complaints', 'proofs', 'amc-tracker', 'assets', 'fds', 'team', 'journal-voucher', 'deletion-requests', 'sos-contacts', 'bank-details', 'tally-bank', 'ca-audit'].includes(tabId)) {
  refreshTabData(tabId);
}
}

async function refreshTabData(tabId) {
  if (!currentSociety) return;
  try {
    switch(tabId) {
      case 'dashboard':
      case 'members': {
        const { data } = await _supabase.from('members').select('*').eq('society_name', currentSociety);
        if (data) membersData = data;
        renderMembers();
        if (tabId === 'dashboard') {
          const [{ data: mnt }, { data: exp }] = await Promise.all([
            _supabase.from('maintenance_payments').select('*').eq('society_name', currentSociety),
            _supabase.from('expenses').select('*').eq('society_name', currentSociety)
          ]);
          if (mnt) maintenanceData = mnt;
          if (exp) expenseData = exp;
          renderMaintenance(); renderExpenses(); renderMemberPersonalView(); renderMyPaymentHistory(); renderMyPaymentSubmissions();
        }
        break;
      }
      case 'maintenance': {
        const { data } = await _supabase.from('maintenance_payments').select('*').eq('society_name', currentSociety);
        if (data) maintenanceData = data;
        renderMaintenance(); renderMemberPersonalView(); renderMyPaymentHistory();
        break;
      }
      case 'expenses': {
        const { data } = await _supabase.from('expenses').select('*').eq('society_name', currentSociety);
        if (data) expenseData = data;
        renderExpenses(); break;
      }
      case 'polls': {
        const { data } = await _supabase.from('polls').select('*').eq('society_name', currentSociety);
        if (data) pollsData = data;
        renderPolls(); break;
      }
      case 'complaints': {
        const { data } = await _supabase.from('complaints').select('*').eq('society_name', currentSociety);
        if (data) complaintData = data;
        renderComplaints(); break;
      }
      case 'proofs': {
        const { data } = await _supabase.from('payment_proofs').select('*').eq('society_name', currentSociety);
        if (data) paymentProofs = data;
        renderPaymentProofs(); renderMyPaymentSubmissions(); break;
      }
      case 'amc-tracker': {
        const { data } = await _supabase.from('amc_contracts').select('*').eq('society_name', currentSociety);
        if (data) amcContractsData = data;
        renderAMCTracker(); break;
      }
      case 'assets': {
        const { data } = await _supabase.from('assets').select('*').eq('society_name', currentSociety);
        if (data) assetData = data;
        renderAssets(); break;
      }
      case 'fds': {
        const { data } = await _supabase.from('sinking_fund_fd').select('*').eq('society_name', currentSociety);
        if (data) fdData = data;
        renderFDs(); break;
      }
      case 'team': {
        const { data } = await _supabase.from('team').select('*').eq('society_name', currentSociety);
        if (data) teamData = data;
        renderTeam(); renderSOSContacts(); break;
      }
      case 'journal-voucher': {
        const { data } = await _supabase.from('journal_vouchers').select('*').eq('society_name', currentSociety).order('date', { ascending: false });
        if (data) journalVouchersData = data;
        renderJournalVouchers(); break;
      }
      case 'deletion-requests': { await loadDeletionRequests(); renderDeletionRequests(); break; }
      case 'sos-contacts': {
        const { data } = await _supabase.from('team').select('*').eq('society_name', currentSociety);
        if (data) teamData = data;
        renderSOSContacts(); break;
      }
      case 'bank-details': {
        const { data } = await _supabase.from('society_settings').select('*').eq('society_name', currentSociety);
        if (data) {
          societySettings = {};
          data.forEach(s => { societySettings[s.key] = s.value; });
        }
        renderBankDetails(); break;
      }
case 'ca-audit': {
  const { data } = await _supabase.from('society_settings').select('*').eq('society_name', currentSociety);
  if (data) {
    societySettings = {};
    data.forEach(s => { societySettings[s.key] = s.value; });
  }
  await renderCAAuditReport();
  break;
}
      case 'tally-bank': {
        const [{ data: bankEnt }, { data: mnt }, { data: exp }] = await Promise.all([
          _supabase.from('bank_entries').select('*').eq('society_name', currentSociety).order('date', { ascending: false }),
          _supabase.from('maintenance_payments').select('*').eq('society_name', currentSociety),
          _supabase.from('expenses').select('*').eq('society_name', currentSociety)
        ]);
        if (bankEnt) customBankEntries = bankEnt;
        if (mnt) maintenanceData = mnt;
        if (exp) expenseData = exp;
        renderTallyBankBook(); break;
      }
    }
  } catch(e) { console.log('refreshTabData error for', tabId, e); }
}

async function sendProofNotificationToMember(flatNo, amount, status, societyName) {
  try {
    const title = status === 'Verified' ? '✅ Payment Verified' : '❌ Payment Rejected';
    const content = status === 'Verified'
      ? `Dear Member, aapka ₹${amount} ka payment society admin dwara VERIFY kar diya gaya hai. Thank you!`
      : `Dear Member, aapka ₹${amount} ka payment REJECT ho gaya hai. Kripya admin se sampark karein ya sahi receipt dobara submit karein.`;

    try {
      await _supabase.from('notices').insert([{
        society_name: societyName, title, content,
        date: new Date().toISOString().split('T')[0],
        author: currentUser || 'Admin',
        priority: status === 'Verified' ? 'Low' : 'High',
        target_members: [flatNo],
        attachment_url: null,
        deep_link: '/?tab=dashboard&section=myPaymentSubmissionsCard'
      }]);
    } catch (colErr) {
      await _supabase.from('notices').insert([{
        society_name: societyName, title, content,
        date: new Date().toISOString().split('T')[0],
        author: currentUser || 'Admin',
        priority: status === 'Verified' ? 'Low' : 'High',
        target_members: [flatNo],
        attachment_url: null
      }]);
    }
  } catch (e) { console.log('Member notification error:', e); }
}

function renderMyPaymentSubmissions() {
  const tbody = document.getElementById('my-payment-submissions-list');
  const card = document.getElementById('myPaymentSubmissionsCard');
  if (!tbody) return;

  if (currentRole !== 'Member') {
    if (card) card.style.display = 'none';
    return;
  }
  if (card) card.style.display = 'block';

  const userFlat = (currentUser || '').trim().toUpperCase();
  const myProofs = paymentProofs.filter(p => (p.flat_no || '').trim().toUpperCase() === userFlat);

  if (myProofs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No payment submissions yet.</td></tr>`;
    return;
  }

  myProofs.sort((a, b) => new Date(b.submitted_at || b.payment_date) - new Date(a.submitted_at || a.payment_date));

  tbody.innerHTML = myProofs.map(p => {
    let statusBadge = '<span class="badge bg-warning text-dark">⏳ Pending</span>';
    let remarks = '<small class="text-muted">Awaiting admin review</small>';

    if (p.status === 'Verified') {
      statusBadge = '<span class="badge bg-success">✅ Verified</span>';
      remarks = p.verified_at ? `<small class="text-success">Verified on ${new Date(p.verified_at).toLocaleDateString()}</small>` : '<small class="text-success">Verified</small>';
    } else if (p.status === 'Rejected') {
      statusBadge = '<span class="badge bg-danger">❌ Rejected</span>';
      remarks = '<small class="text-danger">Please contact admin</small>';
    }

    return `
      <tr>
        <td>${p.payment_date || '-'}</td>
        <td class="fw-bold">${p.amount || 0}</td>
        <td>${p.utr || '-'}</td>
        <td>${statusBadge}</td>
        <td>${remarks}</td>
      </tr>
    `;
  }).join('');
}

async function submitMeetingMinutes(event) {
  event.preventDefault();
  const title = document.getElementById('meet-title').value.trim();
  const date = document.getElementById('meet-date').value;
  const type = document.getElementById('meet-type').value;
  const venue = document.getElementById('meet-venue').value.trim();
  const attendees = document.getElementById('meet-attendees').value.trim();
  const content = document.getElementById('meet-content').value.trim();

  const newMeeting = {
    society_name: currentSociety,
    meeting_title: title, meeting_date: date, meeting_type: type,
    venue: venue || 'Society Clubhouse',
    attendees: attendees || 'All Members',
    minutes_content: content,
    created_by: currentUser,
    created_at: new Date().toISOString()
  };

  const { error } = await _supabase.from('society_meetings').insert([newMeeting]);
  if (error) { alert('❌ Error saving meeting: ' + error.message); return; }

  const noticeData = {
    society_name: currentSociety,
    title: `📋 New ${type} Recorded`,
    content: `${title} — held on ${date}. कृपया Meeting Minutes देखें।`,
    date: new Date().toISOString().split('T')[0],
    author: currentUser || 'Admin',
    priority: type === 'AGM' ? 'High' : 'Medium',
    target_members: [],
    attachment_url: null
  };

  const { error: noticeErr1 } = await _supabase
    .from('notices')
    .insert([{ ...noticeData, deep_link: '/?tab=meetings' }]);

  if (noticeErr1) {
    console.warn('[Meeting Notice] First insert failed:', noticeErr1.message);
    const { error: noticeErr2 } = await _supabase.from('notices').insert([noticeData]);
    if (noticeErr2) {
      console.error('[Meeting Notice] Fallback also failed:', noticeErr2.message);
      alert('⚠️ Meeting saved but notification notice failed: ' + noticeErr2.message);
    } else {
      console.log('[Meeting Notice] Inserted WITHOUT deep_link (run SQL to add column)');
    }
  } else {
    console.log('[Meeting Notice] Inserted successfully WITH deep_link');
  }

  alert('✅ Meeting Minutes Recorded & Members Notified!');
  bootstrap.Modal.getInstance(document.getElementById('meetingModal')).hide();
  document.getElementById('meetingForm').reset();
  fetchSupabaseData();
}

function renderAllTables() {
  renderCelebrations();
  renderMembers();
  renderMaintenance();
  renderExpenses();
  renderTallyBankBook();
  renderCAAuditReport();
  renderChairmanReport();
  generateMonthlySummary();
  renderComplaints();
  renderParking();
  renderPolls();
  renderAssets();
  renderFDs();
  renderTeam();
  renderMemberPersonalView();
  renderMyPaymentHistory();
  renderMyPaymentSubmissions();
  renderBankDetails();
  renderAMCTracker();
  renderSOSContacts();
  renderDeletionRequests();
  renderPaymentProofs();
  renderTenantAgreementWarnings();
  if (document.getElementById('tab-community') && !document.getElementById('tab-community').classList.contains('d-none')) {
    renderCommunity();
  }
}

function exportMonthlySummaryExcel() {
  const month = document.getElementById('summary-month-picker')?.value || 'Monthly_Report';
  exportTableToExcel('monthly-summary-table', `Financial_Summary_${month}`);
}

function exportMonthlySummaryPDF() {
  if (typeof window.jspdf === 'undefined') return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const month = document.getElementById('summary-month-picker')?.value || '';
  const societyName = societySettings.society_name || currentSociety;
  
  doc.setFontSize(16);
  doc.text(societyName, 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Monthly Financial Statement - ${month}`, 105, 23, { align: 'center' });
  
  doc.autoTable({ 
    html: '#monthly-summary-table', startY: 30, theme: 'grid',
    didParseCell: function(data) {
      if (data.section === 'body') { data.cell.text = data.cell.text.map(t => t.replace(/[₹Rs\.]/g, '').trim()); }
    }
  });
  doc.save(`Monthly_Summary_${month}.pdf`);
}

function exportCAAuditExcel() { exportTableToExcel('ca-gst-summary-table', 'CA_Audit_GST_Summary'); }

function exportCAAuditPDF() {
  if (typeof window.jspdf === 'undefined') return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const societyName = societySettings.society_name || currentSociety;
  
  doc.setFontSize(16);
  doc.text(societyName, 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text('CA Audit Report — GST Summary', 105, 23, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 105, 29, { align: 'center' });
  
  doc.autoTable({
    html: '#ca-gst-summary-table', startY: 35, theme: 'grid',
    didParseCell: function(data) {
      if (data.section === 'body') { data.cell.text = data.cell.text.map(t => t.replace(/[₹Rs\.]/g, '').trim()); }
    }
  });
  doc.save(`CA_Audit_${currentSociety}_${Date.now()}.pdf`);
}

function loadSettingsToForm() {
  const s = societySettings || {};
  const setVal = (id, val) => {
    document.querySelectorAll(`#${id}`).forEach(el => {
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) { el.value = val; }
    });
  };
  
  setVal('settings-name', s.society_name || currentSociety || '');
  setVal('settings-phone', s.society_phone || '');
  setVal('settings-address', s.society_address || '');
  setVal('settings-email', s.society_email || '');
  setVal('settings-pan', s.society_pan || '');
  setVal('settings-enable-late-fee', s.enable_late_fee || 'false');
  setVal('settings-late-fee-type', s.late_fee_type || 'fixed');
  setVal('settings-late-fee-amount', s.late_fee_amount || '');
  setVal('settings-enable-gst', s.enable_gst || 'false');
  setVal('settings-society-gstin', s.society_gstin || '');
  
  if (typeof toggleGSTFields === 'function') { toggleGSTFields(s.enable_gst || 'false'); }
}

function renderCommunity() {
  renderEventsCommunity();
  renderNoticesCommunity();
  renderFacilitiesCommunity();
  renderMyBookingsCommunity();
  if (currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin') {
    renderManageFacilities();
    renderPendingBookings();
    renderAllBookings();
  }
}

function renderEventsCommunity() {
  const container = document.getElementById('events-community-container');
  if (!container) return;
  if (!eventsData || eventsData.length === 0) {
    container.innerHTML = `<div class="col-12 text-muted text-center">No upcoming events.</div>`;
    return;
  }
  container.innerHTML = eventsData.map(ev => `
    <div class="col-md-6 col-lg-4" data-event-id="${ev.id}">
      <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
        <div class="d-flex align-items-center mb-2">
          <i class="fa-regular fa-calendar-circle-plus" style="color:#2563eb; font-size:24px;"></i>
          <h6 class="fw-bold ms-2 mb-0">${ev.title}</h6>
        </div>
        <p class="small text-muted"><i class="fa-regular fa-clock me-1"></i> ${ev.date} | ${ev.time}</p>
        ${ev.location ? `<p class="small text-muted"><i class="fa-regular fa-location-dot me-1"></i> ${ev.location}</p>` : ''}
        ${ev.description ? `<p class="small">${ev.description}</p>` : ''}
        ${(currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin') ? 
          `<button class="btn btn-sm btn-outline-danger mt-2" onclick="deleteEvent(${ev.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
      </div>
    </div>
  `).join('');
}

function renderNoticesCommunity() {
  const container = document.getElementById('notices-community-container');
  if (!container) return;
  if (!noticesData || noticesData.length === 0) {
    container.innerHTML = `<div class="col-12 text-muted text-center">No notices.</div>`;
    return;
  }

  const visibleNotices = noticesData.filter(n => {
    if (n.deep_link && String(n.deep_link).trim() !== '') return false;

    // ✅ FIXED
const systemTitlePatterns = [
  'Payment Verified',
  'Payment Rejected',
  'New Payment Proof',
  'New AGM',
  'New Managing Committee',
  'New Special Meeting',
  'Admin replied to your ticket',    // ✅ ADD
  'New Support Ticket'                // ✅ ADD
];
    if (n.title && systemTitlePatterns.some(p => n.title.includes(p))) return false;

    if (currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin') return true;

    if (!n.target_members || n.target_members.length === 0) return true;

    let targets = n.target_members;
    if (typeof targets === 'string') {
      try { targets = JSON.parse(targets); } catch (e) { targets = []; }
    }

    if (Array.isArray(targets) && targets.length > 0) {
      return targets.map(t => t.toUpperCase()).includes((currentUser || '').toUpperCase());
    }

    return true;
  });


  if (visibleNotices.length === 0) {
    container.innerHTML = `<div class="col-12 text-muted text-center">No notices for you.</div>`;
    return;
  }

  container.innerHTML = visibleNotices.map(n => {
    const priorityColor = n.priority === 'High' ? 'danger' : (n.priority === 'Medium' ? 'warning' : 'secondary');
    
    let targets = n.target_members;
    if (typeof targets === 'string') {
      try { targets = JSON.parse(targets); } catch (e) { targets = []; }
    }
    const isTargeted = Array.isArray(targets) && targets.length > 0;

    return `
      <div class="col-md-6 col-lg-4" data-notice-id="${n.id}">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-${priorityColor}">
          <div class="d-flex justify-content-between align-items-start">
            <h6 class="fw-bold">${n.title}</h6>
            <span class="badge bg-${priorityColor}">${n.priority || 'Medium'}</span>
          </div>
          <div class="d-flex gap-3 small text-muted">
            <span><i class="fa-regular fa-calendar me-1"></i> ${n.date || '-'}</span>
            <span><i class="fa-regular fa-user me-1"></i> ${n.author || 'Admin'}</span>
          </div>
          <div class="mt-1">
            ${isTargeted ? `<span class="badge bg-info text-dark">Selected: ${targets.join(', ')}</span>` : `<span class="badge bg-secondary">All Members</span>`}
          </div>
          <p class="mt-2 text-secondary mb-2">${n.content}</p>
          ${n.attachment_url ? `
  <div class="mb-2">
    <a href="${n.attachment_url}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="fa-solid fa-paperclip me-1"></i> View</a>
    ${(currentRole === 'Admin' || currentRole === 'SocietyAdmin') ? `
      <button class="btn btn-sm btn-outline-danger ms-1"
        onclick="deleteSingleImage({table:'notices',rowId:${n.id},column:'attachment_url',bucket:'notice_attachments',imageUrl:'${n.attachment_url}',refreshFn:()=>fetchSupabaseData(),label:'notice attachment'})">
        <i class="fa-solid fa-trash"></i>
      </button>` : ''}
  </div>` : ''}
          ${(currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin') ? `<button class="btn btn-link text-danger btn-sm p-0" onclick="deleteNotice(${n.id})">Delete</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function renderSuperAdminMasterDashboard() {
  if (currentRole !== 'Admin') {
    alert('⛔ Access Denied! Only Admin can view Master Dashboard.');
    return;
  }
  
  const container = document.getElementById('super-admin-master-container');
  if (!container) return;

  container.innerHTML = `<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i><p class="text-muted mt-2">Fetching master data across all active societies...</p></div>`;

  try {
    const { data: societiesList, error: socError } = await _supabase.from('societies').select('*').eq('is_active', true);

    if (socError || !societiesList || societiesList.length === 0) {
      container.innerHTML = `<div class="alert alert-warning">No active societies found.</div>`;
      return;
    }

    let masterRows = '';
    let grandTotalCollection = 0;
    let grandTotalPending = 0;
    let grandTotalSubDue = 0;

    for (const soc of societiesList) {
      const socName = soc.name;
      const [{ data: members }, { data: payments }] = await Promise.all([
        _supabase.from('members').select('*').eq('society_name', socName),
        _supabase.from('maintenance_payments').select('*').eq('society_name', socName)
      ]);

      const socMembers = members || [];
      const socPayments = payments || [];
      
      const totalCollected = socPayments.reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
      grandTotalCollection += totalCollected;

      let socPending = 0;
      socMembers.forEach(m => {
        const rate = Number(m.monthly_rate || 600);
        const opening = Number(m.opening_due || 0);
        const dueTillDate = MONTHS_IN_FY_SO_FAR * rate;
        const paid = socPayments.filter(r => (r.flat_no || '').toUpperCase() === (m.flat_no || '').toUpperCase()).reduce((s, r) => s + Number(r.amount_paid || 0), 0);
        const flatPending = Math.max(0, opening + dueTillDate - paid);
        socPending += flatPending;
      });
      grandTotalPending += socPending;

      const housesCount = socMembers.length;
      const subRatePerHouse = Number(soc.per_house_rate || 79); 
      const monthlySubDue = housesCount * subRatePerHouse;
      grandTotalSubDue += monthlySubDue;

            // ✅ Status badge
      const subStatus = soc.subscription_status || 'active';
      let statusBadge = '';
      if (subStatus === 'suspended') {
        statusBadge = '<span class="badge bg-danger">🔴 Suspended</span>';
      } else if (subStatus === 'grace') {
        statusBadge = '<span class="badge bg-warning text-dark">🟡 Grace</span>';
      } else {
        statusBadge = '<span class="badge bg-success">🟢 Active</span>';
      }

      const reactivateBtn = (subStatus === 'suspended') 
        ? `<button class="btn btn-sm btn-success ms-1" onclick="reactivateSociety('${socName}')" title="Reactivate"><i class="fa-solid fa-power-off"></i></button>` 
        : '';

      masterRows += `
        <tr>
          <td><strong>${socName}</strong><br><small class="text-muted">${soc.address || '-'}</small></td>
          <td><span class="badge bg-primary">${housesCount} Houses</span></td>
          <td class="text-success fw-bold">₹ ${totalCollected.toLocaleString('en-IN')}</td>
          <td class="text-danger fw-bold">₹ ${socPending.toLocaleString('en-IN')}</td>
          <td><span class="badge bg-warning text-dark">${soc.subscription_plan || 'Gold'} (₹${subRatePerHouse}/h)</span></td>
          <td class="text-primary fw-bold">₹ ${monthlySubDue.toLocaleString('en-IN')} /mo</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="switchSociety('${socName}')"><i class="fa-solid fa-arrow-right me-1"></i> Switch</button>
            ${reactivateBtn}
          </td>
        </tr>
      `;
    }

    const htmlContent = `
      <div class="row g-3 mb-4">
        <div class="col-md-4"><div class="card p-3 border-0 shadow-sm rounded-4 bg-success-subtle"><h6 class="text-success mb-1">Total Societies Collection</h6><h3 class="fw-bold mb-0 text-success">₹ ${grandTotalCollection.toLocaleString('en-IN')}</h3></div></div>
        <div class="col-md-4"><div class="card p-3 border-0 shadow-sm rounded-4 bg-danger-subtle"><h6 class="text-danger mb-1">Total Societies Pending Dues</h6><h3 class="fw-bold mb-0 text-danger">₹ ${grandTotalPending.toLocaleString('en-IN')}</h3></div></div>
        <div class="col-md-4"><div class="card p-3 border-0 shadow-sm rounded-4 bg-primary-subtle"><h6 class="text-primary mb-1">Your Monthly Agency Revenue</h6><h3 class="fw-bold mb-0 text-primary">₹ ${grandTotalSubDue.toLocaleString('en-IN')}</h3></div></div>
      </div>
      <div class="card border-0 shadow-sm rounded-4 p-3 border">
        <h5 class="fw-bold mb-3">🏢 All Managed Societies Overview</h5>
        <div class="table-responsive">
          <table class="table table-hover align-middle">
                        <thead class="table-light">
              <tr><th>Society Name</th><th>Total Flats</th><th>Total Collection</th><th>Total Pending</th><th>Subscription Plan</th><th>Your Revenue / Mo</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>${masterRows}</tbody>
          </table>
        </div>
      </div>
    `;

       document.querySelectorAll('#super-admin-master-container').forEach(el => { el.innerHTML = htmlContent; });
  } catch (err) {
    console.error('Master dashboard error:', err);
    container.innerHTML = `<div class="alert alert-danger">Error loading master dashboard: ${err.message}</div>`;
  }

  // ✅ Subscription billing load करो (async, background में)
  try { await loadSubscriptionInvoices(); } catch(e) { console.log('[Subscription] auto-load error:', e); }
}

async function submitNotice(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-submit-notice');
  btn.disabled = true;
  btn.innerText = 'Publishing...';

  const sendTo = document.getElementById('notice-send-to').value;
  let targetMembers = [];
  if (sendTo === 'selected') {
    const select = document.getElementById('notice-target-members');
    if (select) targetMembers = Array.from(select.selectedOptions).map(opt => opt.value);
  }

  const fileInput = document.getElementById('notice-attachment');
  const file = fileInput?.files?.[0];
  let attachmentUrl = null;

  if (file) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentSociety}/notice_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await _supabase.storage.from('notice_attachments').upload(filePath, file);
    if (!uploadError) {
      const { data: urlData } = _supabase.storage.from('notice_attachments').getPublicUrl(filePath);
      attachmentUrl = urlData?.publicUrl || null;
    }
  }

  const newNotice = {
    title: document.getElementById('notice-title').value,
    date: document.getElementById('notice-date').value || new Date().toISOString().split('T')[0],
    author: document.getElementById('notice-author').value || 'Admin',
    priority: document.getElementById('notice-priority').value,
    content: document.getElementById('notice-content').value,
    society_name: currentSociety,
    target_members: targetMembers,
    attachment_url: attachmentUrl
  };

  const { error } = await _supabase.from('notices').insert([newNotice]);
  btn.disabled = false;
  btn.innerText = 'Publish Notice';

  if (error) { alert('❌ Error: ' + error.message); return; }
  alert('✅ Notice Published Successfully!');
  bootstrap.Modal.getInstance(document.getElementById('noticeModal')).hide();
  document.getElementById('noticeForm').reset();
  document.getElementById('notice-member-select').style.display = 'none';
  fetchSupabaseData();
}

async function deleteNotice(noticeId) {
  if (!confirm('⚠️ Delete this notice permanently?')) return;
  await _supabase.from('notices').delete().eq('id', noticeId);
  fetchSupabaseData();
}

async function logActivity(actionType, details) {
  try {
    const newLog = {
      society_name: currentSociety,
      user_flat: currentUser || 'SYSTEM',
      user_role: currentRole || 'Admin',
      action_type: actionType, details: details,
      created_at: new Date().toISOString()
    };
    await _supabase.from('activity_logs').insert([newLog]);
  } catch (err) { console.error('Failed to write activity log:', err); }
}

async function fetchActivityLogs() {
  const { data, error } = await _supabase.from('activity_logs').select('*').eq('society_name', currentSociety).order('created_at', { ascending: false }).limit(100);
  if (!error) { activityLogs = data || []; renderActivityLogs(); }
}

function renderActivityLogs() {
  const tbody = document.getElementById('activity-logs-list');
  if (!tbody) return;
  if (activityLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No activity logs recorded yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = activityLogs.map(log => {
    const formattedDate = new Date(log.created_at).toLocaleString('en-IN');
    return `
      <tr>
        <td><small class="text-muted">${formattedDate}</small></td>
        <td><b>${log.user_flat}</b></td>
        <td><span class="badge bg-secondary">${log.user_role}</span></td>
        <td><span class="badge bg-info text-dark">${log.action_type}</span></td>
        <td>${log.details}</td>
      </tr>
    `;
  }).join('');
}

function insertNotice(payload) {
  const systemPatterns = ['Admin replied', 'New Support Ticket', 'Payment Verified', 'Payment Rejected', 'New AGM'];
  const isSystem = systemPatterns.some(p => (payload.title || '').includes(p));
  
  if (isSystem && !payload.deep_link) {
    console.error('❌ System notice must have deep_link:', payload.title);
    return Promise.reject(new Error('System notice requires deep_link'));
  }
  return _supabase.from('notices').insert([payload]);
}

function renderFacilitiesCommunity() {
  const container = document.getElementById('facilities-community-container');
  if (!container) return;
  if (!facilitiesData || facilitiesData.length === 0) {
    container.innerHTML = `<div class="col-12 text-muted text-center">No facilities available for booking.</div>`;
    return;
  }
  container.innerHTML = facilitiesData.map(f => `
    <div class="col-md-6 col-lg-4">
      <div class="card border-0 shadow-sm rounded-4 h-100 p-3">
        <div class="d-flex align-items-center mb-2">
          <i class="fa-solid fa-building" style="color:#2563eb; font-size:24px;"></i>
          <h6 class="fw-bold ms-2 mb-0">${f.name}</h6>
        </div>
        <p class="text-muted small mb-1">${f.description || 'No description'}</p>
        <div class="d-flex justify-content-between small text-muted">
          <span><i class="fa-regular fa-user me-1"></i> Capacity: ${f.capacity || 'N/A'}</span>
          <span>Fee: ${f.fee || 0}</span>
        </div>
        <button class="btn btn-outline-primary btn-sm mt-3" onclick="openBookingModal(${f.id})">Book Now</button>
      </div>
    </div>
  `).join('');
}

function renderMyBookingsCommunity() {
  const container = document.getElementById('my-bookings-community-container');
  if (!container) return;
  const myBookings = bookingsData.filter(b => b.flat_no === currentUser);
  if (myBookings.length === 0) {
    container.innerHTML = `<div class="alert alert-info">You have no bookings.</div>`;
    return;
  }
  container.innerHTML = myBookings.map(b => {
    const facility = facilitiesData.find(f => f.id === b.facility_id);
    const statusColor = b.status === 'Pending' ? 'warning text-dark' : (b.status === 'Approved' ? 'success' : 'danger');
    return `
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-2">
        <div class="row align-items-center">
          <div class="col-md-6"><strong>${facility?.name || 'Unknown'}</strong> <span class="badge bg-${statusColor}">${b.status}</span></div>
          <div class="col-md-3">${b.booking_date} | ${b.start_time} - ${b.end_time}</div>
          <div class="col-md-3 text-md-end"><small class="text-muted">${b.purpose}</small></div>
        </div>
      </div>
    `;
  }).join('');
}

async function fetchEvents() {
  const { data } = await _supabase.from('events').select('*').eq('society_name', currentSociety).order('date', { ascending: true });
  eventsData = data || [];
}

async function submitEvent(event) {
  event.preventDefault();
  const newEvent = {
    title: document.getElementById('event-title').value.trim(),
    date: document.getElementById('event-date').value,
    time: document.getElementById('event-time').value,
    location: document.getElementById('event-location').value.trim(),
    description: document.getElementById('event-desc').value.trim(),
    society_name: currentSociety,
    created_by: currentUser,
    created_at: new Date().toISOString()
  };
  await _supabase.from('events').insert([newEvent]);
  bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
  fetchEvents();
  renderCommunity();
}

async function deleteEvent(eventId) {
  if (!confirm('⚠️ Delete this event?')) return;
  await _supabase.from('events').delete().eq('id', eventId);
  fetchEvents();
  renderCommunity();
}

async function fetchFacilityData() {
  const { data: fData } = await _supabase.from('facilities').select('*').eq('society_name', currentSociety).eq('is_active', true);
  facilitiesData = fData || [];
  const { data: bData } = await _supabase.from('facility_bookings').select('*').eq('society_name', currentSociety).order('booking_date', { ascending: true });
  bookingsData = bData || [];
}

async function openBookingModal(facilityId) {
  await fetchFacilityData();
  const select = document.getElementById('book-facility');
  if (!select) return;
  select.innerHTML = facilitiesData.map(f => `<option value="${f.id}" ${f.id === facilityId ? 'selected' : ''}>${f.name}</option>`).join('');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('book-date').value = tomorrow.toISOString().split('T')[0];
  new bootstrap.Modal(document.getElementById('bookingModal')).show();
}

async function resetBookingForm() {
  const form = document.getElementById('bookingForm');
  if (form) form.reset();

  try {
    await fetchFacilityData();
    const select = document.getElementById('book-facility');
    if (select) {
      if (facilitiesData.length === 0) {
        select.innerHTML = '<option value="">⚠️ No facilities available. Contact Admin.</option>';
      } else {
        select.innerHTML = facilitiesData.map(f => 
          `<option value="${f.id}">${f.name}${f.fee ? ' — ₹' + f.fee : ''}</option>`
        ).join('');
      }
    }
  } catch (e) { console.log('Facility dropdown error:', e); }
}

async function submitBooking(event) {
  event.preventDefault();
  const newBooking = {
    facility_id: parseInt(document.getElementById('book-facility').value),
    flat_no: currentUser,
    booking_date: document.getElementById('book-date').value,
    start_time: document.getElementById('book-start').value,
    end_time: document.getElementById('book-end').value,
    purpose: document.getElementById('book-purpose').value.trim() || 'General',
    status: 'Pending',
    society_name: currentSociety,
    booked_at: new Date().toISOString()
  };
  await _supabase.from('facility_bookings').insert([newBooking]);
  alert('✅ Booking request submitted!');
  bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
  fetchFacilityData();
}

function renderManageFacilities() {
  const container = document.getElementById('manage-facilities-container');
  if (!container) return;
  container.innerHTML = facilitiesData.map(f => `
    <div class="col-md-4 col-lg-3">
      <div class="card border-0 shadow-sm rounded-4 p-3">
        <h6 class="fw-bold">${f.name}</h6>
        <p class="small text-muted mb-1">${f.description || '--'}</p>
        <div class="d-flex justify-content-between">
          <span class="badge bg-secondary">${f.fee || 0}</span>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteFacility(${f.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

async function addFacility(event) {
  event.preventDefault();
  const newFac = {
    name: document.getElementById('fac-name').value.trim(),
    description: document.getElementById('fac-desc').value.trim(),
    capacity: parseInt(document.getElementById('fac-capacity').value) || 0,
    fee: parseFloat(document.getElementById('fac-fee').value) || 0,
    is_active: true,
    society_name: currentSociety,
    created_at: new Date().toISOString()
  };
  await _supabase.from('facilities').insert([newFac]);
  bootstrap.Modal.getInstance(document.getElementById('addFacilityModal')).hide();
  fetchFacilityData();
}

async function deleteFacility(id) {
  if (!confirm('Delete facility?')) return;
  await _supabase.from('facilities').delete().eq('id', id);
  fetchFacilityData();
}

function renderPendingBookings() {
  const container = document.getElementById('pending-bookings-container');
  if (!container) return;
  const pending = bookingsData.filter(b => b.status === 'Pending');
  if (pending.length === 0) {
    container.innerHTML = `<div class="alert alert-success">🎉 No pending requests!</div>`;
    return;
  }
  container.innerHTML = pending.map(b => {
    const facility = facilitiesData.find(f => f.id === b.facility_id);
    return `
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-2">
        <div class="row align-items-center">
          <div class="col-md-4"><strong>${facility?.name || 'Unknown'}</strong> <span class="badge bg-warning text-dark">Pending</span></div>
          <div class="col-md-3">${b.flat_no} | ${b.booking_date}</div>
          <div class="col-md-3">${b.start_time} - ${b.end_time}</div>
          <div class="col-md-2 text-end">
            <button class="btn btn-sm btn-success me-1" onclick="approveBooking(${b.id})"><i class="fa-solid fa-check"></i></button>
            <button class="btn btn-sm btn-danger" onclick="rejectBooking(${b.id})"><i class="fa-solid fa-times"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function approveBooking(id) {
  await _supabase.from('facility_bookings').update({ status: 'Approved', approved_by: currentUser, approved_at: new Date().toISOString() }).eq('id', id);
  fetchFacilityData();
}

async function rejectBooking(id) {
  await _supabase.from('facility_bookings').update({ status: 'Rejected', approved_by: currentUser, approved_at: new Date().toISOString() }).eq('id', id);
  fetchFacilityData();
}

function renderAllBookings() {
  const container = document.getElementById('all-bookings-container');
  if (!container) return;
  container.innerHTML = bookingsData.map(b => {
    const facility = facilitiesData.find(f => f.id === b.facility_id);
    const statusColor = b.status === 'Pending' ? 'warning text-dark' : (b.status === 'Approved' ? 'success' : 'danger');
    return `
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-2">
        <div class="row align-items-center">
          <div class="col-md-3"><strong>${facility?.name || 'Unknown'}</strong></div>
          <div class="col-md-2">${b.flat_no}</div>
          <div class="col-md-2">${b.booking_date}</div>
          <div class="col-md-2"><span class="badge bg-${statusColor}">${b.status}</span></div>
          <div class="col-md-3 text-md-end"><small class="text-muted">${b.purpose}</small></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderMembers() {
  const tbody = document.getElementById('members-list');
  if (!tbody) return;
  let grandTotalPending = 0;
  if (!membersData || membersData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No Members Found</td></tr>`;
    document.getElementById('dash-pending').innerText = `0`;
    return;
  }

  const canEdit = currentRole === 'Admin' || currentRole === 'SocietyAdmin';
  const canViewLedger = currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin';

  tbody.innerHTML = membersData.map((m, index) => {
    const flatNo = (m.flat_no || '').trim().toUpperCase();
    const ownerName = m.name || '-';
    const phone = m.phone || '-';
    const status = m.status || 'Owner';
    const rate = Number(m.monthly_rate || 600);
    const openingDue = Number(m.opening_due || 0);
    
    const flatPaid = maintenanceData.filter(r => (r.flat_no || '').trim().toUpperCase() === flatNo).reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
    const totalDueTillDate = MONTHS_IN_FY_SO_FAR * rate;
    
    const flatJVs = journalVouchersData.filter(jv => (jv.flat_no || '').trim().toUpperCase() === flatNo);
    const totalDebitJV = flatJVs.filter(jv => jv.type === 'Debit').reduce((sum, jv) => sum + Number(jv.amount || 0), 0);
    const totalCreditJV = flatJVs.filter(jv => jv.type === 'Credit').reduce((sum, jv) => sum + Number(jv.amount || 0), 0);
    const netJVEffect = totalDebitJV - totalCreditJV;

    let rawPending = openingDue + totalDueTillDate + totalDebitJV - totalCreditJV - flatPaid;
    let pendingDue = Math.max(0, rawPending);
    
    const lateFee = calculateLateFee(pendingDue, rate);
    pendingDue += lateFee;

    grandTotalPending += pendingDue;
    const showWhatsApp = (currentRole === 'Admin' || currentRole === 'SocietyAdmin' || currentRole === 'Chairman') && phone;

    return `
      <tr>
        <td><b>${flatNo}</b></td>
        <td>${ownerName}</td>
        <td>${phone !== '-' ? `<a href="tel:${phone}">${phone}</a>` : '-'}</td>
        <td><span class="badge bg-success">${status}</span></td>
        <td class="role-restricted admin-only chairman-only ${currentRole === 'Member' ? 'd-none' : ''}">${rate}</td>
        <td class="role-restricted admin-only chairman-only ${currentRole === 'Member' ? 'd-none' : ''}">${openingDue}</td>
        <td class="role-restricted admin-only chairman-only ${currentRole === 'Member' ? 'd-none' : ''}">${flatPaid}</td>
        <td class="role-restricted admin-only chairman-only ${currentRole === 'Member' ? 'd-none' : ''}">
          <span class="badge ${pendingDue > 0 ? 'bg-danger' : 'bg-success'}">${pendingDue}</span>
          ${lateFee > 0 ? `<br><small class="text-warning fw-bold">(Incl. Late Fee: ₹${lateFee})</small>` : ''}
          ${netJVEffect !== 0 ? `<br><small class="text-info fw-bold">(Net JV: ₹${netJVEffect})</small>` : ''}
        </td>
        <td class="no-print">
          ${canViewLedger ? `<button class="btn btn-sm btn-outline-primary me-1" onclick="openAdminMemberLedger('${flatNo}')" title="View Ledger"><i class="fa-solid fa-file-lines"></i></button>` : ''}
          ${canEdit ? `
            <button class="btn btn-sm btn-outline-warning me-1" onclick="openEditMemberModal(${m.id})" title="Edit Member"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteMember(${m.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
          ` : ''}
          ${showWhatsApp ? `<button class="btn btn-sm btn-whatsapp ms-1" onclick="sendWhatsAppReminder('${phone}', 'Dear ${ownerName}, your maintenance dues are pending. - PS Society')"><i class="fa-brands fa-whatsapp" style="color: #25d366 !important;"></i></button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('dash-pending').innerText = grandTotalPending;
}

// ============================================================
// FEATURE 1: MAINTENANCE BILL AUTO-GENERATION
// ============================================================

// Global cache
let billsData = [];

// ═══════════════════════════════════════════════════════
// 1. Load Bills from DB
// ═══════════════════════════════════════════════════════
async function loadBillsData() {
  try {
    const { data, error } = await _supabase
      .from('maintenance_bills')
      .select('*')
      .eq('society_name', currentSociety)
      .order('bill_month', { ascending: false })
      .order('flat_no', { ascending: true });

    if (error) {
      console.error('[Bills] Load error:', error.message);
      billsData = [];
      return;
    }
    billsData = data || [];
  } catch (e) {
    console.error('[Bills] Exception:', e);
    billsData = [];
  }
}

// ═══════════════════════════════════════════════════════
// 2. Generate Bills for a Month
// ═══════════════════════════════════════════════════════
async function generateMonthlyBills() {
  const picker = document.getElementById('bill-month-picker');
  const selectedMonth = picker?.value;

  if (!selectedMonth) {
    alert('❌ Pehle month select karo.');
    return;
  }

  if (membersData.length === 0) {
    alert('❌ Koi member nahi mila. Pehle members add karo.');
    return;
  }

  if (!confirm(`📢 ${membersData.length} flats ke liye ${selectedMonth} ke bills generate karne hain?`)) return;

  // ✅ Step 1: FRESH data load करो DB से (stale cache issue fix)
  try {
    const { data: freshBills, error: fetchErr } = await _supabase
      .from('maintenance_bills')
      .select('*')
      .eq('society_name', currentSociety);

    if (fetchErr) {
      alert('❌ Failed to fetch existing bills: ' + fetchErr.message);
      return;
    }

    billsData = freshBills || [];
  } catch (e) {
    console.warn('[Bills] Fresh fetch failed, using cache:', e);
  }

  // Bill no prefix
  const societyPrefix = currentSociety
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 4)
    .toUpperCase() || 'SOC';

  // Due date = 10th of selected month
  const [year, month] = selectedMonth.split('-');
  const dueDate = `${year}-${month}-10`;

  const billsToInsert = [];
  let skippedCount = 0;

  for (const m of membersData) {
    const flatNo = (m.flat_no || '').toUpperCase();
    if (!flatNo) continue;

    // Check if bill already exists for this flat+month
    const existing = billsData.find(b =>
      (b.flat_no || '').toUpperCase() === flatNo &&
      b.bill_month === selectedMonth
    );

    if (existing) {
      skippedCount++;
      continue;
    }

    const rate = Number(m.monthly_rate || 600);
    const billNo = `${societyPrefix}-${flatNo.replace(/[^a-zA-Z0-9]/g, '')}-${selectedMonth.replace('-', '')}`;

    billsToInsert.push({
      society_name: currentSociety,
      flat_no: flatNo,
      bill_no: billNo,
      bill_month: selectedMonth,
      amount: rate,
      due_date: dueDate,
      status: 'Pending',
      paid_amount: 0,
      created_by: currentUser || 'Admin'
    });
  }

  if (billsToInsert.length === 0) {
    alert(`✅ Sabhi bills already generated hain ${selectedMonth} ke liye.\n\n(Skipped: ${skippedCount})`);
    return;
  }

  // ✅ Step 2: UPSERT with ignoreDuplicates — DB level protection
  const { error } = await _supabase
    .from('maintenance_bills')
    .upsert(billsToInsert, {
      onConflict: 'society_name,flat_no,bill_month',
      ignoreDuplicates: true
    });

  if (error) {
    alert('❌ Bill generation failed: ' + error.message);
    console.error('[Bills] Insert error:', error);
    return;
  }

  // ✅ Step 3: Count actual new bills
  const { data: finalBills } = await _supabase
    .from('maintenance_bills')
    .select('id')
    .eq('society_name', currentSociety)
    .eq('bill_month', selectedMonth);

  const finalCount = finalBills?.length || 0;

  alert(
    `✅ Bills ready!\n\n` +
    `📊 Total bills for ${selectedMonth}: ${finalCount}\n` +
    `➕ New bills created: ${billsToInsert.length}\n` +
    `⏭️ Skipped (already existed): ${skippedCount}`
  );

  // Reload fresh
  await loadBillsData();
  renderBillsTable();
}


// ═══════════════════════════════════════════════════════
// 3. Render Bills Table
// ═══════════════════════════════════════════════════════
function renderBillsTable() {
  const tbody = document.getElementById('bills-list');
  if (!tbody) return;

  const picker = document.getElementById('bill-month-picker');
  const selectedMonth = picker?.value;

  // Auto-select current month if not set
  if (!selectedMonth) {
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (picker) picker.value = defaultMonth;
    renderBillsTable();
    return;
  }

  const monthBills = billsData.filter(b => b.bill_month === selectedMonth);

  // Stats
  let totalAmount = 0, totalPaid = 0, totalPending = 0;
  monthBills.forEach(b => {
    totalAmount += Number(b.amount || 0);
    if (b.status === 'Paid') totalPaid += Number(b.paid_amount || b.amount || 0);
    else totalPending += Number(b.amount || 0);
  });

  const statTotal = document.getElementById('bill-stat-total');
  const statAmount = document.getElementById('bill-stat-amount');
  const statPaid = document.getElementById('bill-stat-paid');
  const statPending = document.getElementById('bill-stat-pending');

  if (statTotal) statTotal.innerText = monthBills.length;
  if (statAmount) statAmount.innerText = '₹' + totalAmount;
  if (statPaid) statPaid.innerText = '₹' + totalPaid;
  if (statPending) statPending.innerText = '₹' + totalPending;

  if (monthBills.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No bills for ${selectedMonth}. Click "Generate Bills" to create.</td></tr>`;
    return;
  }

  tbody.innerHTML = monthBills.map(b => {
    const statusColor = b.status === 'Paid' ? 'bg-success'
                     : b.status === 'Partial' ? 'bg-warning text-dark'
                     : 'bg-danger';

    return `
      <tr>
        <td><b>${b.bill_no}</b></td>
        <td><b>${b.flat_no}</b></td>
        <td><span class="badge bg-secondary">${b.bill_month}</span></td>
        <td class="fw-bold">${b.amount}</td>
        <td>${b.due_date}</td>
        <td><span class="badge ${statusColor}">${b.status}</span></td>
        <td class="no-print">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="generateBillPDF(${b.id})" title="Download PDF">
            <i class="fa-solid fa-file-pdf"></i>
          </button>
          <button class="btn btn-sm btn-whatsapp me-1" onclick="sendBillWhatsApp(${b.id})" title="Send WhatsApp">
            <i class="fa-brands fa-whatsapp" style="color: #25d366 !important;"></i>
          </button>
          ${b.status !== 'Paid' ? `
            <button class="btn btn-sm btn-success" onclick="markBillPaid(${b.id})" title="Mark as Paid">
              <i class="fa-solid fa-check"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════════════
// 4. Generate Single Bill PDF
// ═══════════════════════════════════════════════════════
function generateBillPDF(billId) {
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded');
    return;
  }

  const bill = billsData.find(b => b.id === billId);
  if (!bill) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const societyName = societySettings.society_name || currentSociety;
  const accName = societySettings.bank_acc_name || societyName;
  const accNo = societySettings.bank_acc_no || '-';
  const ifsc = societySettings.bank_ifsc || '-';
  const upiId = societySettings.bank_upi_id || '-';

  // Header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(societyName, 105, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  doc.text('MAINTENANCE BILL', 105, 25, { align: 'center' });
  doc.setTextColor(0);

  doc.setDrawColor(200);
  doc.line(14, 30, 196, 30);

  // Bill details
  doc.setFontSize(10);
  doc.text(`Bill No: ${bill.bill_no}`, 14, 38);
  doc.text(`Bill Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 44);
  doc.text(`Due Date: ${bill.due_date}`, 14, 50);

  doc.text(`Flat No: ${bill.flat_no}`, 130, 38);
  doc.text(`Billing Month: ${bill.bill_month}`, 130, 44);
  doc.text(`Status: ${bill.status}`, 130, 50);

  // Table
  doc.autoTable({
    startY: 58,
    head: [['Particulars', 'Amount (₹)']],
    body: [
      [`Monthly Maintenance - ${bill.bill_month}`, Number(bill.amount).toFixed(2)],
      ['', ''],
      [{ content: 'TOTAL AMOUNT', styles: { fontStyle: 'bold' } },
       { content: Number(bill.amount).toFixed(2), styles: { fontStyle: 'bold' } }]
    ],
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 163, 74] }
  });

  // Payment Info
  const tableEnd = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Payment Options:', 14, tableEnd);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`🏦 Bank: ${accName}`, 14, tableEnd + 7);
  doc.text(`Account No: ${accNo}`, 14, tableEnd + 13);
  doc.text(`IFSC: ${ifsc}`, 14, tableEnd + 19);
  doc.text(`📱 UPI: ${upiId}`, 14, tableEnd + 25);

  // UPI QR info
  doc.text(`Amount: ₹${Number(bill.amount).toFixed(2)}`, 130, tableEnd + 7);
  doc.text(`Ref: ${bill.bill_no}`, 130, tableEnd + 13);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('This is a computer-generated bill. No signature required.', 105, 280, { align: 'center' });

  doc.save(`Bill_${bill.flat_no}_${bill.bill_month}.pdf`);
}

// ═══════════════════════════════════════════════════════
// 5. Send Single Bill via WhatsApp
// ═══════════════════════════════════════════════════════
function sendBillWhatsApp(billId) {
  const bill = billsData.find(b => b.id === billId);
  if (!bill) return;

  const member = membersData.find(m => (m.flat_no || '').toUpperCase() === bill.flat_no.toUpperCase());
  if (!member || !member.phone) {
    alert('❌ Member ka phone number nahi mila.');
    return;
  }

  const societyName = societySettings.society_name || currentSociety;
  const upiId = societySettings.bank_upi_id || '';
  const accName = societySettings.bank_acc_name || societyName;

  const message =
`Dear ${member.name || 'Member'} (Flat ${bill.flat_no}),

📄 *${societyName} — Maintenance Bill*

Bill No: ${bill.bill_no}
Month: ${bill.bill_month}
Amount: ₹${bill.amount}
Due Date: ${bill.due_date}

💳 *Pay via UPI:*
UPI ID: ${upiId}
Name: ${accName}
Amount: ₹${bill.amount}

Or scan the society QR code.

Please clear your dues before the due date.

- ${societyName}`;

  sendWhatsAppReminder(member.phone, message);
}

// ═══════════════════════════════════════════════════════
// 6. Bulk WhatsApp — All Pending Bills
// ═══════════════════════════════════════════════════════
function sendBulkBillsWhatsApp() {
  const picker = document.getElementById('bill-month-picker');
  const selectedMonth = picker?.value;

  if (!selectedMonth) {
    alert('❌ Pehle month select karo.');
    return;
  }

  const pendingBills = billsData.filter(b =>
    b.bill_month === selectedMonth && b.status !== 'Paid'
  );

  if (pendingBills.length === 0) {
    alert(`✅ Koi pending bill nahi ${selectedMonth} ke liye.`);
    return;
  }

  // Attach member info
  const billsWithPhone = pendingBills
    .map(b => {
      const m = membersData.find(x => (x.flat_no || '').toUpperCase() === b.flat_no.toUpperCase());
      return m && m.phone ? { bill: b, member: m } : null;
    })
    .filter(Boolean);

  if (billsWithPhone.length === 0) {
    alert('❌ Koi bhi pending bill member ke paas phone number nahi hai.');
    return;
  }

  const WARN_THRESHOLD = 5;
  const message = `📢 ${billsWithPhone.length} members ko bill bhejne hain?` +
    (billsWithPhone.length > WARN_THRESHOLD ? `\n\n⚠️ Reminders batch mein bhejne padenge. Har batch ke baad "Next Batch" button dabao.` : '');

  if (!confirm(message)) return;

  const societyName = societySettings.society_name || currentSociety;
  const upiId = societySettings.bank_upi_id || '';
  const accName = societySettings.bank_acc_name || societyName;

  const reminderList = billsWithPhone.map(({ bill, member }) => {
    const msg =
`Dear ${member.name || 'Member'} (Flat ${bill.flat_no}),

📄 *${societyName} — Maintenance Bill*

Bill No: ${bill.bill_no}
Month: ${bill.bill_month}
Amount: ₹${bill.amount}
Due Date: ${bill.due_date}

💳 UPI: ${upiId}
Name: ${accName}

Please clear your dues before the due date.

- ${societyName}`;
    return { phone: member.phone, message: msg };
  });

  sendBillBatch(reminderList, 0, WARN_THRESHOLD);
}

function sendBillBatch(list, startIndex, batchSize) {
  const batch = list.slice(startIndex, startIndex + batchSize);
  const remaining = list.length - (startIndex + batchSize);

  batch.forEach((item, i) => {
    setTimeout(() => {
      const cleanPhone = item.phone.replace(/[^0-9]/g, '');
      const finalPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(item.message)}`, '_blank');
    }, i * 800);
  });

  if (remaining > 0) {
    const oldBtn = document.getElementById('nextBillBatchBtn');
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement('button');
    btn.id = 'nextBillBatchBtn';
    btn.style.cssText = `
      position: fixed; bottom: 100px; right: 25px; z-index: 99999;
      background: linear-gradient(135deg, #25d366, #1da851); color: white;
      border: none; padding: 14px 26px; font-size: 15px;
      font-weight: 700; border-radius: 50px; cursor: pointer;
      box-shadow: 0 8px 25px rgba(37, 211, 102, 0.5);
    `;
    btn.innerHTML = `📤 Next Bill Batch (${remaining} left) →`;
    btn.onclick = () => {
      btn.remove();
      sendBillBatch(list, startIndex + batchSize, batchSize);
    };
    document.body.appendChild(btn);

    alert(`✅ Batch-1 bhej diya (${batch.length}). Ab "Next Bill Batch" button dabao.`);
  } else {
    const oldBtn = document.getElementById('nextBillBatchBtn');
    if (oldBtn) oldBtn.remove();
    alert(`✅ All ${list.length} bills sent successfully!`);
  }
}

// ═══════════════════════════════════════════════════════
// 7. Mark Bill as Paid (Link to Payment)
// ═══════════════════════════════════════════════════════
async function markBillPaid(billId) {
  const bill = billsData.find(b => b.id === billId);
  if (!bill) return;

  if (!confirm(`Bill ${bill.bill_no} ko PAID mark karna hai?\n\nAmount: ₹${bill.amount}\nFlat: ${bill.flat_no}`)) return;

  const today = new Date().toISOString().split('T')[0];

  const { error } = await _supabase
    .from('maintenance_bills')
    .update({
      status: 'Paid',
      paid_amount: bill.amount,
      paid_date: today
    })
    .eq('id', billId);

  if (error) {
    alert('❌ Error: ' + error.message);
    return;
  }

  // Also insert payment record
  const { error: payErr } = await _supabase
    .from('maintenance_payments')
    .insert([{
      receipt_no: `BILL-${bill.bill_no}`,
      flat_no: bill.flat_no,
      payment_date: today,
      amount_paid: Number(bill.amount),
      mode_of_payment: 'Bill Payment',
      month_accounted: bill.bill_month,
      remarks: `Auto-recorded from bill ${bill.bill_no}`,
      society_name: currentSociety
    }]);

  if (payErr) {
    console.warn('[Bills] Payment record failed:', payErr.message);
  }

  await logActivity('BILL_PAID', `Bill ${bill.bill_no} (₹${bill.amount}) marked paid for Flat ${bill.flat_no}`);

  alert('✅ Bill marked as paid & payment recorded!');
  await loadBillsData();
  renderBillsTable();
  if (typeof fetchSupabaseData === 'function') fetchSupabaseData();
}

// ═══════════════════════════════════════════════════════
// 8. Export Bills to Excel
// ═══════════════════════════════════════════════════════
function exportBillsExcel() {
  const picker = document.getElementById('bill-month-picker');
  const selectedMonth = picker?.value || 'All';

  const monthBills = selectedMonth === 'All' ? billsData : billsData.filter(b => b.bill_month === selectedMonth);

  if (monthBills.length === 0) {
    alert('Koi bill nahi hai export karne ke liye.');
    return;
  }

  const data = monthBills.map(b => ({
    'Bill No': b.bill_no,
    'Flat No': b.flat_no,
    'Month': b.bill_month,
    'Amount (₹)': b.amount,
    'Due Date': b.due_date,
    'Status': b.status,
    'Paid Amount': b.paid_amount,
    'Paid Date': b.paid_date || ''
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bills');
  XLSX.writeFile(wb, `Bills_${currentSociety}_${selectedMonth}.xlsx`);
}

// ═══════════════════════════════════════════════════════
// 9. Month Picker Change Handler
// ═══════════════════════════════════════════════════════
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'bill-month-picker') {
    renderBillsTable();
  }
});

// ═══════════════════════════════════════════════════════
// 10. Hook into switchTab — auto-load bills when tab opens
// ═══════════════════════════════════════════════════════
function initBillsTab() {
  // Set default month
  const picker = document.getElementById('bill-month-picker');
  if (picker && !picker.value) {
    const now = new Date();
    picker.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  loadBillsData().then(() => {
    renderBillsTable();
  });
}

function renderMaintenance() {
  const tbody = document.getElementById('maintenance-list');
  if (!tbody) return;
  let total = 0;
  const filteredData = currentRole === 'Member' ? maintenanceData.filter(r => (r.flat_no || '').trim().toUpperCase() === currentUser.toUpperCase()) : maintenanceData;
  if (!filteredData || filteredData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No Receipts Found</td></tr>`;
    document.getElementById('dash-collected').innerText = `0`;
    return;
  }
  tbody.innerHTML = filteredData.map((r) => {
    const amt = Number(r.amount_paid || 0);
    total += amt;
    const member = membersData.find(m => (m.flat_no || '').trim().toUpperCase() === (r.flat_no || '').trim().toUpperCase());
    const memberPhone = member?.phone || '';
    const showWhatsApp = (currentRole === 'Admin' || currentRole === 'SocietyAdmin' || currentRole === 'Chairman') && memberPhone;
    return `
      <tr>
        <td>${r.receipt_no || '-'}</td>
        <td><b>${r.flat_no || '-'}</b></td>
        <td>${r.payment_date || '-'}</td>
        <td><span class="badge bg-secondary">${r.month_accounted || "-"}</span></td>
        <td>${amt}</td>
        <td><span class="badge bg-info text-dark">${r.mode_of_payment || 'UPI'}</span></td>
        <td class="no-print">
          <button class="btn btn-sm btn-outline-primary" onclick="generateTaxInvoicePDF(${r.id})" title="Tax Invoice PDF"><i class="fa-solid fa-file-pdf"></i></button>
          ${currentRole === 'Admin' || currentRole === 'SocietyAdmin' ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteMaintenance(${r.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
          ${showWhatsApp ? `<button class="btn btn-sm btn-whatsapp ms-1" onclick="sendWhatsAppReminder('${memberPhone}', 'Reminder: Your maintenance for ${r.month_accounted || ''} is due. - PS Society')"><i class="fa-brands fa-whatsapp" style="color: #25d366 !important;"></i></button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('dash-collected').innerText = total;
}

function renderMyPaymentHistory() {
  const tbody = document.getElementById('my-payment-history-list');
  if (!tbody) return;
  const userFlat = (currentUser || '').trim().toUpperCase();
  const myPayments = maintenanceData.filter(r => (r.flat_no || '').trim().toUpperCase() === userFlat);
  
  if (myPayments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No payment history found.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = myPayments.map(r => `
    <tr>
      <td><b>${r.receipt_no || '-'}</b></td>
      <td>${r.payment_date || '-'}</td>
      <td class="text-success fw-bold">${r.amount_paid || 0}</td>
      <td><span class="badge bg-info text-dark">${r.mode_of_payment || 'UPI'}</span></td>
    </tr>
  `).join('');
}

function renderExpenses() {
  const tbody = document.getElementById('expense-list');
  if (!tbody) return;
  let total = 0;
  if (!expenseData || expenseData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No Expenses</td></tr>`;
    document.getElementById('dash-expenses').innerText = `0`;
    return;
  }
  tbody.innerHTML = expenseData.map((e) => {
    const amt = Number(e.amount || 0);
    total += amt;
    return `
      <tr>
        <td>${e.voucher_no || '-'}</td>
        <td>${e.expense_date || '-'}</td>
        <td>${e.category || '-'}</td>
        <td>${e.paid_to || '-'}</td>
        <td><span class="badge bg-secondary">${e.mode || 'Bank Transfer'}</span></td>
        <td>${amt}</td>
        <td class="no-print">
          <button class="btn btn-sm btn-outline-primary" onclick="generateReceiptPDF('expense', ${e.id})" title="PDF"><i class="fa-solid fa-file-pdf"></i></button>
          ${currentRole === 'Admin' || currentRole === 'SocietyAdmin' ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${e.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('dash-expenses').innerText = total;
}

async function renderCAAuditReport() {
  // ─────────── FY Dates ───────────
  const __now = new Date();
  const __currentYear = __now.getFullYear();
  const __currentMonth = __now.getMonth();
  const __fyStartYear = __currentMonth >= 3 ? __currentYear : __currentYear - 1;
  const __fyStartDate = `${__fyStartYear}-04-01`;
  const __fyEndDate = `${__fyStartYear + 1}-03-31`;

  // ─────────── OPENING (Day 1) Balances ───────────
  const openingBank = parseFloat(openingBalance) || 0;

  const totalMembersOpeningDue = membersData.reduce(
    (sum, m) => sum + Number(m.opening_due || 0), 0
  );
  const totalAssets = assetData.reduce(
    (sum, a) => sum + Number(a.cost || 0), 0
  );
  const totalFDs = fdData.reduce(
    (sum, f) => sum + Number(f.principal_amount || 0), 0
  );
  const totalAdvanceLiability = 0;

  // ✅ AUTO-COMPUTED Opening Capital — No manual entry needed!
  const openingCapital =
    openingBank + totalMembersOpeningDue + totalAssets + totalFDs - totalAdvanceLiability;

  // ─────────── CURRENT FY INCOME ───────────
  const fyIncome = maintenanceData
    .filter(r => {
      const d = (r.payment_date || '').trim();
      return d >= __fyStartDate && d <= __fyEndDate;
    })
    .reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);

  // ─────────── CURRENT FY EXPENSES ───────────
  const fyExpenses = expenseData
    .filter(e => {
      const d = (e.expense_date || '').trim();
      return d >= __fyStartDate && d <= __fyEndDate;
    })
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // ─────────── JOURNAL VOUCHERS ───────────
  const fyJVs = journalVouchersData.filter(jv => {
    const d = (jv.date || '').trim();
    return d >= __fyStartDate && d <= __fyEndDate;
  });
  const jvDebitTotal = fyJVs
    .filter(jv => jv.type === 'Debit')
    .reduce((sum, jv) => sum + Number(jv.amount || 0), 0);
  const jvCreditTotal = fyJVs
    .filter(jv => jv.type === 'Credit')
    .reduce((sum, jv) => sum + Number(jv.amount || 0), 0);

  // ─────────── ✅ CLOSING BALANCES (auto-computed) ───────────
  const closingBank = openingBank + fyIncome - fyExpenses;
  const closingReceivable = totalMembersOpeningDue + jvDebitTotal - jvCreditTotal;

  const totalIncome = fyIncome + jvDebitTotal;
  const totalExpenses = fyExpenses + jvCreditTotal;

  // ─────────── TRIAL BALANCE TOTALS ───────────
  const totalDebit = closingBank + closingReceivable + totalAssets + totalFDs + totalExpenses;
  const totalCredit = totalIncome + openingCapital + totalAdvanceLiability;
  const variance = totalDebit - totalCredit; // Should always be 0

  const currentFYSurplus = totalIncome - totalExpenses;

  // ─────────── RENDER TRIAL BALANCE ───────────
  const tbody = document.getElementById('ca-trial-balance-rows');
  if (tbody) {
    tbody.innerHTML = `
      <tr><td>Closing Bank Balance</td><td>Asset</td><td class="text-success fw-bold">${closingBank.toFixed(2)}</td><td>-</td></tr>
      <tr><td>Members Dues Receivable</td><td>Asset / Receivable</td><td class="text-success fw-bold">${closingReceivable.toFixed(2)}</td><td>-</td></tr>
      <tr><td>Total Fixed Assets (from Register)</td><td>Asset</td><td class="text-success fw-bold">${totalAssets.toFixed(2)}</td><td>-</td></tr>
      <tr><td>Total Fixed Deposits & Reserves</td><td>Asset / Reserve</td><td class="text-success fw-bold">${totalFDs.toFixed(2)}</td><td>-</td></tr>
      <tr><td>Maintenance Collections Income</td><td>Income</td><td>-</td><td class="text-primary fw-bold">${fyIncome.toFixed(2)}</td></tr>
      ${jvDebitTotal > 0 ? `<tr><td>&nbsp;&nbsp;+ JV (Debit — Penalties / Extra Charges)</td><td>Income</td><td>-</td><td class="text-primary fw-bold">${jvDebitTotal.toFixed(2)}</td></tr>` : ''}
      <tr><td>Total Society Expenses (from Ledger)</td><td>Expense</td><td class="text-danger fw-bold">${fyExpenses.toFixed(2)}</td><td>-</td></tr>
      ${jvCreditTotal > 0 ? `<tr><td>&nbsp;&nbsp;+ JV (Credit — Waivers / Discounts)</td><td>Expense</td><td class="text-danger fw-bold">${jvCreditTotal.toFixed(2)}</td><td>-</td></tr>` : ''}
      <tr><td>Advance Maintenance Received (Liability)</td><td>Current Liability</td><td>-</td><td class="text-warning fw-bold">${totalAdvanceLiability.toFixed(2)}</td></tr>
      <tr><td>Opening Capital / Corpus Fund <span class="badge bg-info-subtle text-info ms-1" style="font-size: 9px;">AUTO</span></td><td>Capital / Liability</td><td>-</td><td class="text-primary fw-bold">${openingCapital.toFixed(2)}</td></tr>
      ${Math.abs(variance) > 0.01 ? `<tr class="table-warning"><td>⚠️ Variance (should be 0)</td><td>Check</td><td class="text-danger fw-bold">${variance > 0 ? variance.toFixed(2) : '-'}</td><td class="text-danger fw-bold">${variance < 0 ? Math.abs(variance).toFixed(2) : '-'}</td></tr>` : ''}
      <tr class="table-info fw-bold">
        <td><i class="fa-solid fa-info-circle me-1"></i>Current FY ${currentFYSurplus >= 0 ? 'Surplus' : 'Deficit'} — Memo</td>
        <td>${currentFYSurplus >= 0 ? 'Surplus' : 'Deficit'}</td>
        <td colspan="2" class="${currentFYSurplus >= 0 ? 'text-success' : 'text-danger'} text-center">
          ${Math.abs(currentFYSurplus).toFixed(2)} ${currentFYSurplus < 0 ? '(Deficit)' : '(Surplus)'}
        </td>
      </tr>
      <tr class="table-secondary fw-bold">
        <td colspan="2">GRAND TOTAL (BALANCED)</td>
        <td class="text-success">${totalDebit.toFixed(2)}</td>
        <td class="text-primary">${totalCredit.toFixed(2)}</td>
      </tr>
    `;
  }

  // ─────────── GST Summary (unchanged) ───────────
  const gstTbody = document.getElementById('ca-gst-summary-rows');
  const gstCardContainer = gstTbody?.closest('.card');
  const isGstOn = societySettings.enable_gst === true || societySettings.enable_gst === 'true';

  if (!isGstOn) {
    if (gstCardContainer) gstCardContainer.style.display = 'none';
  } else {
    if (gstCardContainer) gstCardContainer.style.display = 'block';
    try {
      const { data: invData, error } = await _supabase
        .from('society_invoices')
        .select('*')
        .eq('society_name', currentSociety);

      if (!gstTbody) return;

      if (error || !invData || invData.length === 0) {
        gstTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No GST Invoices recorded for this society yet.</td></tr>`;
        return;
      }

      let totalBase = 0, totalCgst = 0, totalSgst = 0, totalInvoiceVal = 0;
      invData.forEach(inv => {
        totalBase += Number(inv.base_amount || 0);
        totalCgst += Number(inv.cgst_amount || 0);
        totalSgst += Number(inv.sgst_amount || 0);
        totalInvoiceVal += Number(inv.total_amount || 0);
      });

      gstTbody.innerHTML = `
        <tr><td><strong>Central Goods & Services Tax (CGST)</strong></td><td>9%</td><td>₹ ${totalBase.toFixed(2)}</td><td class="text-primary fw-bold">₹ ${totalCgst.toFixed(2)}</td></tr>
        <tr><td><strong>State Goods & Services Tax (SGST)</strong></td><td>9%</td><td>₹ ${totalBase.toFixed(2)}</td><td class="text-primary fw-bold">₹ ${totalSgst.toFixed(2)}</td></tr>
        <tr class="table-primary fw-bold"><td colspan="2">TOTAL GST OUTPUT LIABILITY (CGST + SGST)</td><td>₹ ${totalBase.toFixed(2)}</td><td class="text-success">₹ ${(totalCgst + totalSgst).toFixed(2)}</td></tr>
        <tr class="table-secondary fw-bold"><td colspan="2">TOTAL GROSS TAXABLE TURNOVER (Incl. GST)</td><td colspan="2" class="text-dark">₹ ${totalInvoiceVal.toFixed(2)}</td></tr>
      `;
    } catch (err) {
      console.error('Error loading CA GST summary:', err);
    }
  }
}

function renderChairmanReport() { generateMonthlySummary(); }

function renderAssets() {
  const tbody = document.getElementById('assets-list');
  if (!tbody) return;
  if (!assetData || assetData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No Assets</td></tr>`;
    return;
  }
  tbody.innerHTML = assetData.map((a, index) => `
    <tr>
      <td><b>${a.asset_code || '-'}</b></td>
      <td>${a.name || '-'}</td>
      <td>${a.location || 'Terrace'}</td>
      <td>${a.quantity || 1}</td>
      <td>${a.cost || 0}</td>
      <td><span class="badge bg-success">${a.condition_status || 'Good'}</span></td>
      <td>${a.details || '-'}</td>
      <td class="no-print admin-only ${currentRole !== 'Admin' && currentRole !== 'SocietyAdmin' ? 'd-none' : ''}">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteAsset(${a.id || index})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function renderFDs() {
  const tbody = document.getElementById('fds-list');
  if (!tbody) return;
  if (!fdData || fdData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No FDs</td></tr>`;
    return;
  }
  tbody.innerHTML = fdData.map((f, index) => `
    <tr>
      <td><b>${f.bank_name || '-'}</b></td>
      <td>${f.account_number || '-'}</td>
      <td>${f.principal_amount || 0}</td>
      <td>${f.interest_rate || '7.5%'}</td>
      <td>${f.maturity_amount || 0}</td>
      <td><span class="badge bg-success">${f.status || 'Active'}</span></td>
      <td class="no-print admin-only ${currentRole !== 'Admin' && currentRole !== 'SocietyAdmin' ? 'd-none' : ''}">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteFD(${f.id || index})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

async function populateComplaintFlatDropdown() {
  const select = document.getElementById('cmp-flat');
  if (!select) return;
  select.innerHTML = '<option value="">⏳ Loading flats...</option>';

  if (currentRole === 'Member') {
    select.innerHTML = `<option value="${currentUser}">${currentUser}</option>`;
    select.disabled = true;
    return;
  }

  if (!membersData || membersData.length === 0) {
    const { data } = await _supabase.from('members').select('flat_no, name').eq('society_name', currentSociety).order('flat_no');
    membersData = data || [];
  }

  if (membersData.length === 0) {
    select.innerHTML = '<option value="">⚠️ No flats found</option>';
    return;
  }

  select.innerHTML = '<option value="">-- Select Flat --</option>';
  membersData.forEach(m => {
    const flat = (m.flat_no || '').toUpperCase();
    if (flat) {
      const opt = document.createElement('option');
      opt.value = flat;
      opt.textContent = `${flat} ${m.name ? '- ' + m.name : ''}`;
      select.appendChild(opt);
    }
  });
  select.disabled = false;
}

function renderComplaints() {
  const tbody = document.getElementById('complaint-list');
  if (!tbody) return;
  const visibleComplaints = (currentRole === 'Member') ? complaintData.filter(c => c.flat_no === currentUser) : complaintData;
  if (!visibleComplaints || visibleComplaints.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No Complaints</td></tr>`;
    return;
  }
  tbody.innerHTML = visibleComplaints.map((c, index) => {
    const hasImage = c.image_url && c.image_url.trim() !== '';
    const member = membersData.find(m => (m.flat_no || '').trim().toUpperCase() === (c.flat_no || '').trim().toUpperCase());
    const memberPhone = c.phone || member?.phone || '';
    return `
      <tr data-complaint-id="${c.id || index+1}">
        <td><b>CMP-${c.id || index+1}</b></td>
        <td>${c.flat_no || '-'}</td>
        <td>${memberPhone ? `<a href="tel:${memberPhone}">${memberPhone}</a>` : '-'}</td>
        <td>${c.category || '-'}</td>
        <td>${c.description || '-'}</td>
        <td><span class="badge ${c.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}">${c.status || 'Pending'}</span></td>
        <td>
  ${hasImage ? `
    <a href="${c.image_url}" target="_blank" class="btn btn-sm btn-outline-primary me-1" title="View"><i class="fa-solid fa-image"></i></a>
    ${(currentRole === 'Admin' || currentRole === 'SocietyAdmin') ? `
      <button class="btn btn-sm btn-outline-danger" title="Delete image only"
        onclick="deleteSingleImage({table:'complaints',rowId:${c.id},column:'image_url',bucket:'complaint_images',imageUrl:'${c.image_url}',refreshFn:()=>fetchSupabaseData(),label:'complaint photo'})">
        <i class="fa-solid fa-trash"></i>
      </button>` : ''}
  ` : '-'}
</td>
        <td class="no-print admin-only chairman-only ${currentRole === 'Member' ? 'd-none' : ''}">
          ${c.status !== 'Resolved' ? `<button class="btn btn-sm btn-success" onclick="resolveComplaint(${index})">Resolve</button>` : '-'}
        </td>
      </tr>
    `;
  }).join('');
}

function openComplaintModal() {
  populateComplaintFlatDropdown();
  const modalEl = document.getElementById('complaintModal');
  if (modalEl) { new bootstrap.Modal(modalEl).show(); }
}

async function submitComplaint(event) {
  event.preventDefault();
  const flat = document.getElementById('cmp-flat').value;
  const phone = document.getElementById('cmp-phone').value;
  const category = document.getElementById('cmp-category').value;
  const desc = document.getElementById('cmp-desc').value;
  const file = document.getElementById('cmp-image')?.files?.[0];
  let imageUrl = null;

  if (file) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentSociety}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await _supabase.storage.from('complaint_images').upload(filePath, file);
    if (!uploadError) {
      const { data: urlData } = _supabase.storage.from('complaint_images').getPublicUrl(filePath);
      imageUrl = urlData?.publicUrl || null;
    }
  }

  const newComplaint = {
    flat_no: flat, phone: phone, category: category, description: desc,
    status: 'Pending',
    complaint_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    society_name: currentSociety, image_url: imageUrl
  };

  await _supabase.from('complaints').insert([newComplaint]);
  alert('✅ Complaint submitted!');
  bootstrap.Modal.getInstance(document.getElementById('complaintModal')).hide();
  fetchSupabaseData();
}

function openEditMemberModal(id) {
  const member = membersData.find(m => m.id === id);
  if (!member) return;

  document.getElementById('edit-mem-id').value = member.id;
  document.getElementById('edit-mem-flat').value = member.flat_no;
  document.getElementById('edit-mem-name').value = member.name || '';
  document.getElementById('edit-mem-phone').value = member.phone || '';
  document.getElementById('edit-mem-is-tenant').value = member.is_tenant || 'No';
  document.getElementById('edit-mem-tenant-name').value = member.tenant_name || '';
  document.getElementById('edit-mem-tenant-phone').value = member.tenant_phone || '';
  
  toggleTenantFormFields(member.is_tenant || 'No', 'edit');
  new bootstrap.Modal(document.getElementById('editMemberModal')).show();
}

async function updateMember(event) {
  event.preventDefault();
  const id = document.getElementById('edit-mem-id').value;
  const is_tenant = document.getElementById('edit-mem-is-tenant').value;
  const originalFlat = document.getElementById('edit-mem-flat').value.trim().toUpperCase();
  
  // ══════════════════════════════════════════════
  // ✅ Safety: Flat No edit protection
  // ══════════════════════════════════════════════
  const currentFlat = document.getElementById('edit-mem-flat').value.trim().toUpperCase();
  if (currentFlat !== originalFlat) {
    alert('⚠️ Flat No बदला नहीं जा सकता। इसे delete करके नया member add करें।');
    return;
  }

  // ══════════════════════════════════════════════
  // ✅ Build update payload
  // ══════════════════════════════════════════════
  let updatePayload = {
    name: document.getElementById('edit-mem-name').value.trim(),
    phone: document.getElementById('edit-mem-phone').value.trim(),
    is_tenant: is_tenant,
    status: is_tenant === 'Yes' ? 'Tenant' : 'Owner',
    tenant_name: is_tenant === 'Yes' ? document.getElementById('edit-mem-tenant-name').value.trim() : null,
    tenant_phone: is_tenant === 'Yes' ? document.getElementById('edit-mem-tenant-phone').value.trim() : null,
    monthly_rate: Number(document.getElementById('edit-mem-rate').value),
    opening_due: Number(document.getElementById('edit-mem-opening-due').value)
  };

  // ══════════════════════════════════════════════
  // ✅ Rent agreement upload
  // ══════════════════════════════════════════════
  const fileInput = document.getElementById('edit-mem-rent-agreement-file');
  const file = fileInput?.files?.[0];
  if (file) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentSociety}/agreement_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await _supabase.storage.from('notice_attachments').upload(filePath, file);
    if (!uploadError) {
      const { data: urlData } = _supabase.storage.from('notice_attachments').getPublicUrl(filePath);
      updatePayload.rent_agreement_url = urlData?.publicUrl || null;
    }
  }

  // ══════════════════════════════════════════════
  // ✅ Update
  // ══════════════════════════════════════════════
  const { error } = await _supabase.from('members').update(updatePayload).eq('id', id);
  
  if (error) {
    if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
      alert(`❌ Duplicate flat detected। DB ने रोका।`);
      return;
    }
    alert('❌ Error: ' + error.message);
    return;
  }

  alert('✅ Member details updated successfully!');
  bootstrap.Modal.getInstance(document.getElementById('editMemberModal')).hide();
  fetchSupabaseData();
}

function renderTenantAgreementWarnings() {
  const containers = document.querySelectorAll('.tenant-warning-banner');
  if (containers.length === 0) return;

  const pendingAgreements = membersData.filter(m => 
    (m.is_tenant === 'Yes' || m.status === 'Tenant') && 
    (!m.rent_agreement_url || m.rent_agreement_url.trim() === '')
  );

  let htmlContent = '';

  if (pendingAgreements.length > 0) {
    if (currentRole === 'Member') {
      const myPending = pendingAgreements.find(m => (m.flat_no || '').toUpperCase() === (currentUser || '').toUpperCase());
      if (myPending) {
        htmlContent = `
          <div class="alert alert-danger fw-semibold d-flex align-items-center justify-content-between shadow-sm rounded-4 mb-3">
            <div><i class="fa-solid fa-triangle-exclamation me-2"></i> आपकी रेंट एग्रीमेंट की कॉपी अभी तक सोसाइटी चेयरमैन को नहीं मिली है। कृपया जल्द सबमिट करवाएं।</div>
          </div>
        `;
      }
    } 
    else if (currentRole === 'Admin' || currentRole === 'SocietyAdmin' || currentRole === 'Chairman') {
      const listHtml = pendingAgreements.map(m => `<li>Flat <b>${m.flat_no}</b> (Tenant: ${m.tenant_name || m.name || 'N/A'})</li>`).join('');
      htmlContent = `
        <div class="alert alert-danger shadow-sm rounded-4 mb-3">
          <h6 class="fw-bold mb-1"><i class="fa-solid fa-triangle-exclamation me-2"></i> Pending Rent Agreements Follow-up:</h6>
          <ul class="mb-0 small">${listHtml}</ul>
        </div>
      `;
    }
  }

  containers.forEach(container => { container.innerHTML = htmlContent; });
}

function openAdminMemberLedger(flatNo) {
  const targetFlat = flatNo.trim().toUpperCase();
  document.getElementById('ledger-flat-title').innerText = targetFlat;
  
  const ledgerContainer = document.getElementById('admin-member-ledger-list');
  if (!ledgerContainer) return;

  const myFlatData = maintenanceData.filter(r => (r.flat_no || '').trim().toUpperCase() === targetFlat);
  const myFlatJVs = journalVouchersData.filter(jv => (jv.flat_no || '').trim().toUpperCase() === targetFlat);
  const member = membersData.find(m => (m.flat_no || '').trim().toUpperCase() === targetFlat);
  
  const rate = member ? Number(member.monthly_rate || 600) : 600;
  const openingDue = member ? Number(member.opening_due || 0) : 0;
  
  const fyStartDateStr = getCurrentFYStartDate(); // ✅ Helper
  
  let runningBalance = openingDue;
  let ledgerRows = [{ date: fyStartDateStr, particulars: 'Opening Balance Due', debit: openingDue, credit: 0, balance: runningBalance }];
  
  const fyStartDate = new Date(fyStartDateStr);
  let currentIterDate = new Date(fyStartDate);
  
  let monthlyDueEntries = [];
  for (let i = 0; i < MONTHS_IN_FY_SO_FAR; i++) {
    // ... baaki code same rahega
    const monthName = currentIterDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    const dueDate = `${currentIterDate.getFullYear()}-${String(currentIterDate.getMonth() + 1).padStart(2, '0')}-05`;
    monthlyDueEntries.push({ date: dueDate, type: 'monthly_due', particulars: `Monthly Maintenance Due (${monthName}) [Rate: ₹${rate}]`, amount: rate });
    currentIterDate.setMonth(currentIterDate.getMonth() + 1);
  }

  let combinedTransactions = [
    ...monthlyDueEntries.map(m => ({ date: m.date, type: 'due', data: m })),
    ...myFlatData.map(r => ({ date: r.payment_date, type: 'receipt', data: r })),
    ...myFlatJVs.map(jv => ({ date: jv.date, type: 'jv', data: jv }))
  ];
  combinedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  combinedTransactions.forEach(item => {
    if (item.type === 'due') {
      const d = item.data;
      runningBalance += d.amount;
      ledgerRows.push({ date: d.date, particulars: d.particulars, debit: d.amount, credit: 0, balance: runningBalance });
    } else if (item.type === 'receipt') {
      const r = item.data;
      const amt = Number(r.amount_paid || 0);
      runningBalance -= amt; 
      ledgerRows.push({ date: r.payment_date || '-', particulars: `Maintenance Payment Received (Receipt: ${r.receipt_no || '-'})`, debit: 0, credit: amt, balance: runningBalance });
    } else if (item.type === 'jv') {
      const jv = item.data;
      const amt = Number(jv.amount || 0);
      if (jv.type === 'Debit') {
        runningBalance += amt;
        ledgerRows.push({ date: jv.date || '-', particulars: `Journal Voucher [Debit] (${jv.jv_no}): ${jv.reason}`, debit: amt, credit: 0, balance: runningBalance });
      } else {
        runningBalance -= amt;
        ledgerRows.push({ date: jv.date || '-', particulars: `Journal Voucher [Credit/Waiver] (${jv.jv_no}): ${jv.reason}`, debit: 0, credit: amt, balance: runningBalance });
      }
    }
  });

  const finalPendingBeforeLateFee = Math.max(0, runningBalance);
  const lateFee = calculateLateFee(finalPendingBeforeLateFee, rate);
  if (lateFee > 0) {
    runningBalance += lateFee;
    ledgerRows.push({ date: new Date().toISOString().split('T')[0], particulars: `Auto Late Fee / Interest Penalty`, debit: lateFee, credit: 0, balance: runningBalance });
  }

  ledgerContainer.innerHTML = ledgerRows.map(row => `
    <tr>
      <td>${row.date}</td>
      <td>${row.particulars}</td>
      <td class="text-danger">${row.debit > 0 ? row.debit : '-'}</td>
      <td class="text-success">${row.credit > 0 ? row.credit : '-'}</td>
      <td class="fw-bold ${row.balance > 0 ? 'text-danger' : 'text-success'}">${row.balance}</td>
    </tr>
  `).join('');

  new bootstrap.Modal(document.getElementById('adminMemberLedgerModal')).show();
}

function renderMeetings() {
  const container = document.getElementById('meetings-container');
  if (!container) return;
  
  if (!meetingsData || meetingsData.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted p-4">No meeting minutes recorded yet.</div>`;
    return;
  }

  const canDelete = currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin';

  container.innerHTML = meetingsData.map(m => `
    <div class="col-md-6 col-lg-4" data-meeting-id="${m.id}">
      <div class="card border-0 shadow-sm rounded-4 p-4 h-100 border-start border-4 border-primary bg-white">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="badge bg-primary-subtle text-primary fw-semibold">${m.meeting_type}</span>
          <small class="text-muted"><i class="fa-regular fa-calendar me-1"></i> ${m.meeting_date}</small>
        </div>
        <h5 class="fw-bold text-dark mb-2">${m.meeting_title}</h5>
        <p class="small text-muted mb-1"><i class="fa-solid fa-location-dot me-1"></i> <strong>Venue:</strong> ${m.venue || 'N/A'}</p>
        <p class="small text-muted mb-3"><i class="fa-solid fa-users me-1"></i> <strong>Attendees:</strong> ${m.attendees || 'N/A'}</p>
        <div class="p-3 bg-light rounded-3 small text-secondary mb-3" style="white-space: pre-line; max-height: 150px; overflow-y: auto;">
          ${m.minutes_content}
        </div>
        <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
          <small class="text-muted">By: ${m.created_by || 'Admin'}</small>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" onclick="window.print()"><i class="fa-solid fa-print"></i></button>
            ${canDelete ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteMeeting(${m.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function deleteMeeting(id) {
  if (!confirm('⚠️ Delete these meeting minutes permanently?')) return;
  const { error } = await _supabase.from('society_meetings').delete().eq('id', id);
  if (error) alert('Error: ' + error.message);
  else fetchSupabaseData();
}

async function resolveComplaint(index) {
  if (!confirm('✅ Mark complaint as resolved?')) return;
  const complaint = complaintData[index];
  if (!complaint?.id) return;
  await _supabase.from('complaints').update({ status: 'Resolved', resolved_date: new Date().toISOString().split('T')[0], resolved_by: currentUser }).eq('id', complaint.id);
  fetchSupabaseData();
}

function renderBankReconciliation() {
  const tbody = document.getElementById('brs-entries-list');
  if (!tbody) return;

  let softwareBalance = openingBalance;
  let allEntries = [];

  maintenanceData.forEach(r => {
    const amt = Number(r.amount_paid || 0);
    softwareBalance += amt;
    allEntries.push({ date: r.payment_date || '-', ref: r.receipt_no || 'REC', head: `Maintenance - ${r.flat_no}`, amount: amt, type: 'Deposit (+)' });
  });

  expenseData.forEach(e => {
    const amt = Number(e.amount || 0);
    softwareBalance -= amt;
    allEntries.push({ date: e.expense_date || '-', ref: e.voucher_no || 'VOU', head: `${e.category} - ${e.paid_to}`, amount: amt, type: 'Withdrawal (-)' });
  });

  // ✅ NEW: Manual Bank Entries (from bank_entries table)
  customBankEntries.forEach(cb => {
    const depositAmt = Number(cb.deposit || 0);
    const withdrawAmt = Number(cb.withdraw || 0);
    
    if (depositAmt > 0) {
      softwareBalance += depositAmt;
      allEntries.push({
        date: cb.date || '-',
        ref: cb.ref || 'BNK',
        head: cb.head || 'Manual Bank Entry',
        amount: depositAmt,
        type: 'Deposit (+)'
      });
    }
    
    if (withdrawAmt > 0) {
      softwareBalance -= withdrawAmt;
      allEntries.push({
        date: cb.date || '-',
        ref: cb.ref || 'BNK',
        head: cb.head || 'Manual Bank Entry',
        amount: withdrawAmt,
        type: 'Withdrawal (-)'
      });
    }
  });

  document.getElementById('brs-software-balance').innerText = `₹${softwareBalance.toFixed(2)}`;

  const balanceInput = document.getElementById('actual-bank-balance-input');
  if (balanceInput) { balanceInput.disabled = (currentRole === 'Chairman'); }

  const isChairman = (currentRole === 'Chairman');

  tbody.innerHTML = allEntries.map((item, idx) => `
    <tr>
      <td>${item.date}</td>
      <td><b>${item.ref}</b></td>
      <td>${item.head}</td>
      <td class="fw-bold ${item.type.includes('Deposit') ? 'text-success' : 'text-danger'}">${item.amount}</td>
      <td><span class="badge ${item.type.includes('Deposit') ? 'bg-success' : 'bg-danger'}">${item.type}</span></td>
      <td>
        <select class="form-select form-select-sm" onchange="calculateBRS()" ${isChairman ? 'disabled' : ''}>
          <option value="cleared">Cleared in Bank</option>
          <option value="pending">Not Reflected Yet (Pending)</option>
        </select>
      </td>
    </tr>
  `).join('');

  window.currentSoftwareBalance = softwareBalance;
  calculateBRS();
}

function calculateBRS() {
  const inputElem = document.querySelector('#tabOverlay #actual-bank-balance-input') || document.getElementById('actual-bank-balance-input');
  const actualBankInput = parseFloat(inputElem?.value) || window.currentSoftwareBalance || 0;
  const softwareBal = window.currentSoftwareBalance || 0;
  const diff = actualBankInput - softwareBal;

  document.querySelectorAll('#brs-difference').forEach(diffElem => {
    diffElem.innerText = `₹${diff.toFixed(2)}`;
    diffElem.className = diff === 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
  });
}

function renderPolls() {
  const container = document.getElementById('polls-container');
  if (!container) return;
  if (!pollsData || pollsData.length === 0) {
    container.innerHTML = `<div class="col-12"><p class="text-muted text-center">No Polls Available</p></div>`;
    return;
  }
  container.innerHTML = pollsData.map((p, index) => {
    const options = p.options || [];
    const votes = p.votes || new Array(options.length).fill(0);
    const totalVotes = votes.reduce((a, b) => a + b, 0);
    const hasVoted = p.voters && p.voters.includes(currentUser);
    return `
      <div class="col-md-6" data-poll-id="${p.id}">
        <div class="card p-3 bg-white shadow-sm border-0 rounded-3">
          <h6 class="fw-bold">${p.question}</h6>
          <div class="mt-2">
            ${options.map((opt, i) => {
              const percent = totalVotes === 0 ? 0 : Math.round((votes[i] / totalVotes) * 100);
              return `
                <div class="d-flex align-items-center gap-2 mb-1">
                  <input type="radio" name="poll_radio_${p.id}" value="${i}" onchange="handlePollVote(${p.id}, ${i})" ${hasVoted ? 'disabled' : ''} ${hasVoted && p.voter_choices && p.voter_choices[currentUser] === i ? 'checked' : ''}>
                  <span style="flex:1;">${opt}</span>
                  <span class="badge bg-secondary">${votes[i]} votes</span>
                </div>
                <div class="poll-bar"><div class="poll-bar-fill" style="width:${percent}%;"></div></div>
              `;
            }).join('')}
          </div>
          <div class="mt-3 d-flex justify-content-between align-items-center">
            <div>
              ${hasVoted 
                ? `<span class="badge bg-success me-2"><i class="fa-solid fa-check-circle me-1"></i> Voted</span>
                   <button class="btn btn-sm btn-outline-warning" onclick="withdrawVote(${index})"><i class="fa-solid fa-undo me-1"></i> Withdraw</button>` 
                : `<span class="badge bg-secondary">Select an option to vote</span>`}
            </div>
            <span class="text-muted small">Total: ${totalVotes}</span>
          </div>
          ${(currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin') 
            ? `<button class="btn btn-link text-danger btn-sm p-0 mt-2" onclick="deletePoll(${index})">Delete Poll</button>` 
            : ''}
        </div>
      </div>
    `;
  }).join('');
}

function handlePollVote(pollId, optIndex) {
  const pollIdx = pollsData.findIndex(p => p.id == pollId);
  if (pollIdx !== -1) { votePoll(pollIdx, optIndex); }
}

async function votePoll(pollIndex, optIndex) {
  const poll = pollsData[pollIndex];
  if (!poll || !poll.id) return;
  if (poll.voters && poll.voters.includes(currentUser)) {
    alert('⚠️ आप पहले ही इस Poll में वोट कर चुके हैं!');
    renderPolls();
    return;
  }
  if (!poll.voters) poll.voters = [];
  if (!poll.voter_choices) poll.voter_choices = {};
  if (!poll.votes) poll.votes = new Array(poll.options.length).fill(0);
  
  poll.votes[optIndex] = (poll.votes[optIndex] || 0) + 1;
  poll.voters.push(currentUser);
  poll.voter_choices[currentUser] = optIndex;

  try {
    const { error } = await _supabase.from('polls').update({ votes: poll.votes, voters: poll.voters, voter_choices: poll.voter_choices }).eq('id', poll.id);
    if (error) {
      alert('❌ Error: ' + error.message);
      await fetchPollsData();
      renderPolls();
      return;
    }
    await fetchPollsData();
    renderPolls();
    alert('✅ आपका वोट दर्ज कर लिया गया!');
  } catch (err) { alert('❌ Error saving vote.'); }
}

async function withdrawVote(pollIndex) {
  const poll = pollsData[pollIndex];
  if (!poll || !poll.id) return;
  if (!confirm('⚠️ क्या आप अपना वोट वापस लेना चाहते हैं?')) return;
  
  const choiceIndex = poll.voter_choices ? poll.voter_choices[currentUser] : undefined;
  if (choiceIndex !== undefined) { poll.votes[choiceIndex] = Math.max(0, (poll.votes[choiceIndex] || 1) - 1); }
  poll.voters = (poll.voters || []).filter(v => v !== currentUser);
  if (poll.voter_choices) delete poll.voter_choices[currentUser];

  const { error } = await _supabase.from('polls').update({ votes: poll.votes, voters: poll.voters, voter_choices: poll.voter_choices }).eq('id', poll.id);
  if (error) alert('Error: ' + error.message);
  else { alert('✅ वोट वापस ले लिया गया!'); fetchPollsData().then(renderPolls); }
}

async function deletePoll(index) {
  if (!confirm('⚠️ Delete this Poll?')) return;
  const poll = pollsData[index];
  if (!poll?.id) return;
  await _supabase.from('polls').delete().eq('id', poll.id);
  fetchPollsData().then(renderPolls);
}

async function submitPoll(event) {
  event.preventDefault();
  const question = document.getElementById('poll-question').value.trim();
  const opts = [
    document.getElementById('poll-opt1').value.trim(),
    document.getElementById('poll-opt2').value.trim(),
    document.getElementById('poll-opt3').value.trim(),
    document.getElementById('poll-opt4').value.trim()
  ].filter(o => o !== '');
  if (opts.length < 2) { alert('❌ Please add at least 2 options.'); return; }

  const newPoll = {
    question: question, options: opts,
    votes: new Array(opts.length).fill(0),
    voters: [], voter_choices: {},
    created_by: currentUser,
    created_at: new Date().toISOString(),
    society_name: currentSociety
  };

  const { error } = await _supabase.from('polls').insert([newPoll]);
  if (error) { alert('❌ Error creating poll: ' + error.message); return; }

  bootstrap.Modal.getInstance(document.getElementById('pollModal')).hide();
  document.getElementById('pollModal').querySelector('form').reset();
  fetchSupabaseData();
}

function generateReceiptPDF(type, id) {
  if (typeof window.jspdf === 'undefined') return;
  let data = type === 'maintenance' ? maintenanceData.find(r => r.id === id) : expenseData.find(r => r.id === id);
  if (!data) return;
  const { jsPDF } = window.jspdf; 
  const doc = new jsPDF('p', 'mm', 'a4');
  const societyName = societySettings.society_name || currentSociety;
  doc.setFontSize(16); doc.text(societyName, 105, 20, { align: 'center' });
  doc.text(type === 'maintenance' ? 'MAINTENANCE RECEIPT' : 'PAYMENT VOUCHER', 105, 30, { align: 'center' });
  
  let headers = type === 'maintenance' ? ['Receipt No', 'Flat No', 'Date', 'Amount'] : ['Voucher No', 'Date', 'Category', 'Amount'];
  let rows = type === 'maintenance' ? [[data.receipt_no, data.flat_no, data.payment_date, data.amount_paid]] : [[data.voucher_no, data.expense_date, data.category, data.amount]];
  doc.autoTable({ startY: 45, head: [headers], body: rows });
  doc.save(`${type}-${id}.pdf`);
}

async function updateSocietySettings(event) {
  event.preventDefault();
  
  const sigFile = document.getElementById('settings-signature-file')?.files?.[0];
  let sigUrl = societySettings.digital_signature_url || '';

  if (sigFile) {
    const fileExt = sigFile.name.split('.').pop();
    const filePath = `${currentSociety}/signature_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await _supabase.storage.from('qr_codes').upload(filePath, sigFile);
    if (!uploadError) {
      const { data: urlData } = _supabase.storage.from('qr_codes').getPublicUrl(filePath);
      sigUrl = urlData?.publicUrl || sigUrl;
    }
  }

  const settings = {
    society_name: document.getElementById('settings-name').value,
    society_address: document.getElementById('settings-address').value,
    society_phone: document.getElementById('settings-phone').value,
    society_email: document.getElementById('settings-email').value,
    society_pan: document.getElementById('settings-pan').value,
    enable_late_fee: document.getElementById('settings-enable-late-fee').value,
    late_fee_type: document.getElementById('settings-late-fee-type').value,
    late_fee_amount: document.getElementById('settings-late-fee-amount').value,
    enable_gst: document.getElementById('settings-enable-gst').value,
    society_gstin: document.getElementById('settings-society-gstin').value.trim(),
    digital_signature_url: sigUrl
  };

  for (const [key, value] of Object.entries(settings)) {
    await _supabase.from('society_settings').upsert({ key, value: String(value), society_name: currentSociety }, { onConflict: 'key,society_name' });
  }

  alert('✅ Society Settings & GST Details Updated Successfully!');
  fetchSupabaseData();
}

// ══════════════════════════════════════════════════════════════
// 🛡️ FULL DATA BACKUP & EXPORT (Admin Only)
// ══════════════════════════════════════════════════════════════

/**
 * Sanitize filename (remove special chars)
 */
function __sanitizeFilename(name) {
  return (name || 'Society').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
}

/**
 * Generate timestamp string for filenames
 */
function __getBackupTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

/**
 * Fetch ALL society data from all tables
 */
async function __fetchAllBackupData() {
  const soc = currentSociety;
  const results = {};

  const tables = [
    { key: 'members', table: 'members' },
    { key: 'maintenance_payments', table: 'maintenance_payments' },
    { key: 'maintenance_bills', table: 'maintenance_bills' },
    { key: 'expenses', table: 'expenses' },
    { key: 'journal_vouchers', table: 'journal_vouchers' },
    { key: 'bank_entries', table: 'bank_entries' },
    { key: 'sinking_fund_fd', table: 'sinking_fund_fd' },
    { key: 'assets', table: 'assets' },
    { key: 'visitors', table: 'visitors' },
    { key: 'complaints', table: 'complaints' },
    { key: 'polls', table: 'polls' },
    { key: 'notices', table: 'notices' },
    { key: 'society_meetings', table: 'society_meetings' },
    { key: 'parking_vehicles', table: 'parking_vehicles' },
    { key: 'payment_proofs', table: 'payment_proofs' },
    { key: 'team', table: 'team' },
    { key: 'amc_contracts', table: 'amc_contracts' },
    { key: 'marketplace_posts', table: 'marketplace_posts' },
    { key: 'facilities', table: 'facilities' },
    { key: 'facility_bookings', table: 'facility_bookings' },
    { key: 'events', table: 'events' },
    { key: 'society_settings', table: 'society_settings' },
    { key: 'activity_logs', table: 'activity_logs' },
    { key: 'deletion_requests', table: 'deletion_requests' }
  ];

  const promises = tables.map(async ({ key, table }) => {
    try {
      const { data, error } = await _supabase
        .from(table)
        .select('*')
        .eq('society_name', soc);

      if (error) {
        console.warn(`[Backup] ${table} error:`, error.message);
        results[key] = [];
      } else {
        results[key] = data || [];
      }
    } catch (e) {
      console.warn(`[Backup] ${table} exception:`, e);
      results[key] = [];
    }
  });

  await Promise.all(promises);

  // Also fetch society master info (no society_name column filter)
  try {
    const { data: socInfo } = await _supabase
      .from('societies')
      .select('*')
      .eq('name', soc)
      .maybeSingle();
    results.society_info = socInfo || null;
  } catch (e) {
    results.society_info = null;
  }

  return results;
}

/**
 * Convert nested objects/arrays to string for Excel compatibility
 */
function __flattenForExcel(obj) {
  const flat = {};
  for (const [key, val] of Object.entries(obj || {})) {
    if (val === null || val === undefined) {
      flat[key] = '';
    } else if (typeof val === 'object') {
      flat[key] = JSON.stringify(val);
    } else {
      flat[key] = val;
    }
  }
  return flat;
}

// ──────────────────────────────────────────────────────────────
// 📥 JSON Backup
// ──────────────────────────────────────────────────────────────
async function downloadFullBackupJSON() {
  // ─── Role check ───
  if (currentRole !== 'Admin') {
    alert('⛔ Only Admin can download full backup.');
    return;
  }

  if (!confirm(`📦 Full society data का JSON backup download करना है?\n\nSociety: ${currentSociety}\n\nये process 20-40 seconds ले सकता है।`)) {
    return;
  }

  const btn = document.getElementById('btn-backup-json');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Preparing Backup...';

  try {
    const data = await __fetchAllBackupData();

    // Count total records
    let totalRecords = 0;
    Object.keys(data).forEach(k => {
      if (Array.isArray(data[k])) totalRecords += data[k].length;
    });

    const backup = {
      _meta: {
        app: 'PS Society Solutions',
        version: '1.0',
        backup_type: 'FULL_JSON',
        society_name: currentSociety,
        generated_at: new Date().toISOString(),
        generated_by: currentUser || 'Admin',
        total_records: totalRecords,
        tables_count: Object.keys(data).length
      },
      data: data
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const socSafe = __sanitizeFilename(currentSociety);
    const ts = __getBackupTimestamp();
    const filename = `PS_Backup_${socSafe}_${ts}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log activity
    try {
      await logActivity('FULL_BACKUP_JSON', `Downloaded JSON backup — ${totalRecords} records`);
    } catch (e) {}

    alert(`✅ JSON Backup downloaded successfully!\n\n📁 File: ${filename}\n📊 Total records: ${totalRecords}\n🗂️ Tables: ${Object.keys(data).length}`);

  } catch (err) {
    console.error('[Backup] JSON error:', err);
    alert('❌ Backup failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

// ──────────────────────────────────────────────────────────────
// 📥 Excel Backup (Multi-sheet)
// ──────────────────────────────────────────────────────────────
async function downloadFullBackupExcel() {
  // ─── Role check ───
  if (currentRole !== 'Admin') {
    alert('⛔ Only Admin can download full backup.');
    return;
  }

  if (typeof XLSX === 'undefined') {
    alert('❌ Excel library not loaded. Please refresh page.');
    return;
  }

  if (!confirm(`📊 Full society data का Excel backup download करना है?\n\nSociety: ${currentSociety}\n\nये process 30-60 seconds ले सकता है।`)) {
    return;
  }

  const btn = document.getElementById('btn-backup-excel');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Preparing Excel...';

  try {
    const data = await __fetchAllBackupData();

    const wb = XLSX.utils.book_new();
    let totalRecords = 0;
    let sheetsAdded = 0;

    // ─── Sheet 0: Meta / Overview ───
    const metaSheet = XLSX.utils.json_to_sheet([{
      'App': 'PS Society Solutions',
      'Backup Type': 'FULL_EXCEL',
      'Society Name': currentSociety,
      'Generated At': new Date().toLocaleString('en-IN'),
      'Generated By': currentUser || 'Admin',
      'Version': '1.0'
    }]);
    XLSX.utils.book_append_sheet(wb, metaSheet, '1_Overview');
    sheetsAdded++;

    // ─── Sheet order for readability ───
    const sheetOrder = [
      { key: 'society_settings', name: '2_Settings' },
      { key: 'members', name: '3_Members' },
      { key: 'maintenance_payments', name: '4_Maintenance' },
      { key: 'maintenance_bills', name: '5_Bills' },
      { key: 'expenses', name: '6_Expenses' },
      { key: 'journal_vouchers', name: '7_Journal_Vouchers' },
      { key: 'bank_entries', name: '8_Bank_Entries' },
      { key: 'sinking_fund_fd', name: '9_FDs' },
      { key: 'assets', name: '10_Assets' },
      { key: 'visitors', name: '11_Visitors' },
      { key: 'complaints', name: '12_Complaints' },
      { key: 'polls', name: '13_Polls' },
      { key: 'notices', name: '14_Notices' },
      { key: 'society_meetings', name: '15_Meetings' },
      { key: 'parking_vehicles', name: '16_Parking' },
      { key: 'payment_proofs', name: '17_Payment_Proofs' },
      { key: 'team', name: '18_Team' },
      { key: 'amc_contracts', name: '19_AMC' },
      { key: 'marketplace_posts', name: '20_Marketplace' },
      { key: 'facilities', name: '21_Facilities' },
      { key: 'facility_bookings', name: '22_Bookings' },
      { key: 'events', name: '23_Events' },
      { key: 'activity_logs', name: '24_Activity_Logs' },
      { key: 'deletion_requests', name: '25_Deletion_Requests' }
    ];

    for (const { key, name } of sheetOrder) {
      const rows = data[key];
      if (!Array.isArray(rows)) continue;

      if (rows.length === 0) {
        // Empty sheet with placeholder
        const ws = XLSX.utils.json_to_sheet([{ _info: 'No records' }]);
        XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
      } else {
        const flatRows = rows.map(r => __flattenForExcel(r));
        const ws = XLSX.utils.json_to_sheet(flatRows);
        XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
        totalRecords += rows.length;
      }
      sheetsAdded++;
    }

    // ─── Write file ───
    const socSafe = __sanitizeFilename(currentSociety);
    const ts = __getBackupTimestamp();
    const filename = `PS_Backup_${socSafe}_${ts}.xlsx`;

    XLSX.writeFile(wb, filename);

    // Log activity
    try {
      await logActivity('FULL_BACKUP_EXCEL', `Downloaded Excel backup — ${totalRecords} records across ${sheetsAdded} sheets`);
    } catch (e) {}

    alert(`✅ Excel Backup downloaded successfully!\n\n📁 File: ${filename}\n📊 Total records: ${totalRecords}\n🗂️ Sheets: ${sheetsAdded}`);

  } catch (err) {
    console.error('[Backup] Excel error:', err);
    alert('❌ Backup failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

// ══════════════════════════════════════════════════════════════
// 💰 SUBSCRIPTION BILLING SYSTEM (Super Admin Only)
// ══════════════════════════════════════════════════════════════

let subscriptionInvoicesData = [];

/**
 * Fetch ALL subscription invoices (across all societies)
 */
async function loadSubscriptionInvoices() {
  const tbody = document.getElementById('subscription-invoices-list');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted"><i class="fa-solid fa-spinner fa-spin me-2"></i> Loading invoices...</td></tr>`;

  try {
    const { data, error } = await _supabase
      .from('subscription_invoices')
      .select('*')
      .order('billing_month', { ascending: false })
      .order('society_name', { ascending: true });

    if (error) {
      console.error('[Subscription] Load error:', error.message);
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">❌ Error: ${error.message}</td></tr>`;
      return;
    }

        subscriptionInvoicesData = data || [];

    // Set default month picker if empty
    const picker = document.getElementById('sub-invoice-month-picker');
    if (picker && !picker.value) {
      const now = new Date();
      picker.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    renderSubscriptionInvoices();
    renderSubscriptionStats();
    renderSubscriptionOverdueBanner();

    // ✅ Step 6: Status check + banner
    try {
      await checkAndUpdateSubscriptionStatus();
      renderSubscriptionStatusBanner();
    } catch (e) { console.log('[Status Check] error:', e); }

  } catch (err) {
    console.error('[Subscription] Exception:', err);
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">❌ Failed to load invoices.</td></tr>`;
  }
}

/**
 * Render invoices table (respects month filter)
 */
function renderSubscriptionInvoices() {
  const tbody = document.getElementById('subscription-invoices-list');
  if (!tbody) return;

  const picker = document.getElementById('sub-invoice-month-picker');
  const selectedMonth = picker?.value;

  let filtered = subscriptionInvoicesData;
  if (selectedMonth) {
    filtered = subscriptionInvoicesData.filter(inv => inv.billing_month === selectedMonth);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No invoices found${selectedMonth ? ` for ${selectedMonth}` : ''}.<br><small>Click "Generate Invoices" to create, or "Show All".</small></td></tr>`;
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  tbody.innerHTML = filtered.map(inv => {
    let statusBadge = '';
    const isOverdue = inv.status === 'Pending' && inv.due_date && inv.due_date < today;

    if (inv.status === 'Paid') {
      statusBadge = '<span class="badge bg-success">✅ Paid</span>';
    } else if (inv.status === 'Waived') {
      statusBadge = '<span class="badge bg-secondary">⚪ Waived</span>';
    } else if (isOverdue) {
      statusBadge = '<span class="badge bg-danger">🚨 Overdue</span>';
    } else {
      statusBadge = '<span class="badge bg-warning text-dark">⏳ Pending</span>';
    }

    return `
      <tr>
        <td><b>${inv.invoice_no}</b></td>
        <td>${inv.society_name}</td>
        <td><span class="badge bg-secondary">${inv.billing_month}</span></td>
        <td>${inv.houses_count}</td>
        <td>₹${inv.rate_per_house}</td>
        <td class="fw-bold">₹${Number(inv.total_amount).toLocaleString('en-IN')}</td>
        <td>${inv.due_date}</td>
        <td>${statusBadge}</td>
        <td class="no-print">
          ${inv.status !== 'Paid' ? `
            <button class="btn btn-sm btn-success me-1" onclick="markSubscriptionPaid(${inv.id})" title="Mark Paid">
              <i class="fa-solid fa-check"></i>
            </button>
            <button class="btn btn-sm btn-whatsapp" onclick="sendSubscriptionReminder(${inv.id})" title="WhatsApp">
              <i class="fa-brands fa-whatsapp" style="color: #25d366 !important;"></i>
            </button>
          ` : '<span class="text-muted small">-</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Render 4 stat cards (Pending, Overdue, Collected, Expected)
 */
function renderSubscriptionStats() {
  const today = new Date().toISOString().split('T')[0];

  let pendingCount = 0;
  let overdueAmount = 0;
  let collectedTotal = 0;
  let expectedAmount = 0;

  subscriptionInvoicesData.forEach(inv => {
    const amt = Number(inv.total_amount || 0);
    if (inv.status === 'Paid') {
      collectedTotal += Number(inv.paid_amount || amt);
    } else if (inv.status === 'Pending') {
      if (inv.due_date && inv.due_date < today) {
        overdueAmount += amt;
      } else {
        pendingCount++;
      }
      expectedAmount += amt;
    }
  });

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setText('sub-stat-pending-count', pendingCount);
  setText('sub-stat-overdue', `₹${overdueAmount.toLocaleString('en-IN')}`);
  setText('sub-stat-collected', `₹${collectedTotal.toLocaleString('en-IN')}`);
  setText('sub-stat-expected', `₹${expectedAmount.toLocaleString('en-IN')}`);
}

/**
 * Render overdue alert banner
 */
function renderSubscriptionOverdueBanner() {
  const banner = document.getElementById('subscription-overdue-banner');
  if (!banner) return;

  const today = new Date().toISOString().split('T')[0];
  const overdue = subscriptionInvoicesData.filter(inv =>
    inv.status === 'Pending' && inv.due_date && inv.due_date < today
  );

  if (overdue.length === 0) {
    banner.innerHTML = '';
    return;
  }

  const totalOverdue = overdue.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  banner.innerHTML = `
    <div class="alert alert-danger d-flex align-items-center justify-content-between flex-wrap gap-2 shadow-sm" style="border-radius: 12px;">
      <div>
        <i class="fa-solid fa-triangle-exclamation me-2"></i>
        <strong>${overdue.length} ${overdue.length === 1 ? 'society has' : 'societies have'} overdue payment!</strong>
        <span class="ms-2">Total: ₹${totalOverdue.toLocaleString('en-IN')}</span>
      </div>
      <button class="btn btn-sm btn-danger fw-semibold" onclick="showAllOverdueInvoices()">
        <i class="fa-solid fa-bolt me-1"></i> View Overdue
      </button>
    </div>
  `;
}

/**
 * Show all invoices (clear month filter)
 */
function showAllSubscriptionInvoices() {
  const picker = document.getElementById('sub-invoice-month-picker');
  if (picker) picker.value = '';
  renderSubscriptionInvoices();
}

/**
 * Show only overdue invoices
 */
function showAllOverdueInvoices() {
  const picker = document.getElementById('sub-invoice-month-picker');
  if (picker) picker.value = '';

  const tbody = document.getElementById('subscription-invoices-list');
  if (!tbody) return;

  const today = new Date().toISOString().split('T')[0];
  const overdue = subscriptionInvoicesData.filter(inv =>
    inv.status === 'Pending' && inv.due_date && inv.due_date < today
  );

  if (overdue.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-success">🎉 No overdue invoices!</td></tr>`;
    return;
  }

  tbody.innerHTML = overdue.map(inv => `
    <tr class="table-danger">
      <td><b>${inv.invoice_no}</b></td>
      <td>${inv.society_name}</td>
      <td><span class="badge bg-secondary">${inv.billing_month}</span></td>
      <td>${inv.houses_count}</td>
      <td>₹${inv.rate_per_house}</td>
      <td class="fw-bold">₹${Number(inv.total_amount).toLocaleString('en-IN')}</td>
      <td>${inv.due_date}</td>
      <td><span class="badge bg-danger">🚨 Overdue</span></td>
      <td class="no-print">
        <button class="btn btn-sm btn-success me-1" onclick="markSubscriptionPaid(${inv.id})" title="Mark Paid">
          <i class="fa-solid fa-check"></i>
        </button>
        <button class="btn btn-sm btn-whatsapp" onclick="sendSubscriptionReminder(${inv.id})" title="WhatsApp">
          <i class="fa-brands fa-whatsapp" style="color: #25d366 !important;"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Month picker change handler
 */
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'sub-invoice-month-picker') {
    renderSubscriptionInvoices();
  }
});

/**
 * ══════════════════════════════════════════════════════════════
 * 💰 GENERATE MONTHLY SUBSCRIPTION INVOICES
 * ══════════════════════════════════════════════════════════════
 * - Selected month के लिए सभी active societies के invoices बनाएगा
 * - Auto house count (members table से)
 * - Duplicate check (society_name + billing_month unique)
 */
async function generateSubscriptionInvoices() {
  const picker = document.getElementById('sub-invoice-month-picker');
  const selectedMonth = picker?.value;

  // ─── Validation ───
  if (!selectedMonth) {
    alert('❌ पहले month select करो।');
    return;
  }

  const btn = event?.target?.closest('button');
  const originalHTML = btn?.innerHTML;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...';
  }

  try {
    // ─── Step 1: सभी active societies fetch करो ───
    const { data: societies, error: socErr } = await _supabase
      .from('societies')
      .select('*')
      .eq('is_active', true);

    if (socErr || !societies || societies.length === 0) {
      alert('❌ कोई active society नहीं मिली।');
      return;
    }

    // ─── Step 2: हर society के members count करो ───
    const { data: allMembers, error: memErr } = await _supabase
      .from('members')
      .select('society_name, flat_no');

    if (memErr) {
      alert('❌ Members fetch failed: ' + memErr.message);
      return;
    }

    // ─── Step 3: Existing invoices fetch करो (duplicate check के लिए) ───
    const { data: existingInvoices } = await _supabase
      .from('subscription_invoices')
      .select('society_name, billing_month')
      .eq('billing_month', selectedMonth);

    const existingKeys = new Set(
      (existingInvoices || []).map(inv => `${inv.society_name}::${inv.billing_month}`)
    );

    // ─── Step 4: हर society के लिए invoice prepare करो ───
    const dueDate = `${selectedMonth}-10`; // 10th of month
    const monthSafe = selectedMonth.replace('-', '');

    const invoicesToInsert = [];
    const skipped = [];

    societies.forEach(soc => {
      const socName = soc.name;
      const key = `${socName}::${selectedMonth}`;

      // Skip if invoice already exists
      if (existingKeys.has(key)) {
        skipped.push(socName);
        return;
      }

      // Count houses for this society
      const socMembers = (allMembers || []).filter(m => m.society_name === socName);
      const housesCount = socMembers.length;

      // Rate from society record
      const ratePerHouse = Number(soc.per_house_rate || 79);

      // Total amount
      const totalAmount = housesCount * ratePerHouse;

      // Invoice No: PSINV-{Society Prefix}-{YYYYMM}
      const socPrefix = socName
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 6)
        .toUpperCase() || 'SOC';

      const invoiceNo = `PSINV-${socPrefix}-${monthSafe}`;

      invoicesToInsert.push({
        society_name: socName,
        invoice_no: invoiceNo,
        billing_month: selectedMonth,
        houses_count: housesCount,
        rate_per_house: ratePerHouse,
        total_amount: totalAmount,
        due_date: dueDate,
        status: 'Pending',
        created_by: currentUser || 'Admin'
      });
    });

    // ─── Step 5: कुछ नया नहीं है तो बताओ ───
    if (invoicesToInsert.length === 0) {
      alert(`✅ ${selectedMonth} के सभी invoices पहले से generate हो चुके हैं।\n\n(Skipped: ${skipped.length} societies)`);
      return;
    }

    // ─── Step 6: Confirmation दिखाओ ───
    const totalAmount = invoicesToInsert.reduce((sum, inv) => sum + inv.total_amount, 0);
    const confirmMsg =
      `📢 ${selectedMonth} के लिए subscription invoices generate करने हैं?\n\n` +
      `🏢 Societies: ${invoicesToInsert.length}\n` +
      `💰 Total Amount: ₹${totalAmount.toLocaleString('en-IN')}\n` +
      (skipped.length > 0 ? `\n⚠️ ${skipped.length} societies skip होंगी (invoice exists)\n` : '');

    if (!confirm(confirmMsg)) return;

    // ─── Step 7: Insert करो ───
    const { error: insertErr } = await _supabase
      .from('subscription_invoices')
      .insert(invoicesToInsert);

    if (insertErr) {
      alert('❌ Invoice generation failed: ' + insertErr.message);
      return;
    }

    // ─── Step 8: Log Activity ───
    try {
      await logActivity(
        'SUBSCRIPTION_INVOICES_GENERATED',
        `Generated ${invoicesToInsert.length} invoices for ${selectedMonth} — Total ₹${totalAmount}`
      );
    } catch (e) { /* silent */ }

    // ─── Step 9: Success message ───
    let successMsg = `✅ ${invoicesToInsert.length} invoices generate हो गए!\n\n💰 Total: ₹${totalAmount.toLocaleString('en-IN')}`;
    if (skipped.length > 0) {
      successMsg += `\n\n⚠️ ${skipped.length} societies skipped (already existed):\n${skipped.join(', ')}`;
    }
    alert(successMsg);

    // ─── Step 10: Reload table + stats ───
    await loadSubscriptionInvoices();

  } catch (err) {
    console.error('[Subscription] Generate error:', err);
    alert('❌ Error: ' + err.message);
  } finally {
    if (btn && originalHTML) {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  }
}


// ══════════════════════════════════════════════════════════════
// ✅ MARK SUBSCRIPTION INVOICE AS PAID
// ══════════════════════════════════════════════════════════════
async function markSubscriptionPaid(id) {
  const invoice = subscriptionInvoicesData.find(inv => inv.id === id);
  if (!invoice) {
    alert('❌ Invoice not found in memory. Please refresh.');
    return;
  }

  document.getElementById('sub-paid-invoice-id').value = invoice.id;
  document.getElementById('sub-paid-society-name').innerText = invoice.society_name;
  document.getElementById('sub-paid-invoice-no').innerText = invoice.invoice_no;
  document.getElementById('sub-paid-amount').value = invoice.total_amount;
  document.getElementById('sub-paid-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('sub-paid-utr').value = '';
  document.getElementById('sub-paid-notes').value = '';
  document.getElementById('sub-paid-mode').value = 'UPI';

  new bootstrap.Modal(document.getElementById('subscriptionPaidModal')).show();
}

async function submitSubscriptionPaid(event) {
  event.preventDefault();

  const id = parseInt(document.getElementById('sub-paid-invoice-id').value);
  const paidDate = document.getElementById('sub-paid-date').value;
  const paidAmount = parseFloat(document.getElementById('sub-paid-amount').value);
  const paymentMode = document.getElementById('sub-paid-mode').value;
  const utr = document.getElementById('sub-paid-utr').value.trim();
  const notes = document.getElementById('sub-paid-notes').value.trim();

  if (!id || !paidDate || !paidAmount) {
    alert('❌ सभी required fields भरें।');
    return;
  }

  const invoice = subscriptionInvoicesData.find(inv => inv.id === id);
  if (!invoice) return;

  const btn = document.getElementById('btn-subscription-paid-submit');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Saving...';

  try {
    const { error } = await _supabase
      .from('subscription_invoices')
      .update({
        status: 'Paid',
        paid_date: paidDate,
        paid_amount: paidAmount,
        payment_mode: paymentMode,
        utr_ref: utr || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      alert('❌ Error: ' + error.message);
      return;
    }

    try {
      await logActivity(
        'SUBSCRIPTION_PAID',
        `${invoice.society_name} — ₹${paidAmount} for ${invoice.billing_month}`
      );
    } catch (e) { /* silent */ }

    alert(
      `✅ Invoice ${invoice.invoice_no} marked as Paid!\n\n` +
      `🏢 Society: ${invoice.society_name}\n` +
      `💰 Amount: ₹${paidAmount.toLocaleString('en-IN')}\n` +
      `📅 Date: ${paidDate}\n` +
      `💳 Mode: ${paymentMode}`
    );

        bootstrap.Modal.getInstance(document.getElementById('subscriptionPaidModal')).hide();

    // ✅ Auto-reactivate society after payment
    try {
      await _supabase
        .from('societies')
        .update({ subscription_status: 'active' })
        .eq('name', invoice.society_name);
      console.log(`[Auto-Activate] ${invoice.society_name} reactivated`);
    } catch (e) { console.warn('[Auto-Activate] error:', e); }

    await loadSubscriptionInvoices();

  } catch (err) {
    console.error('[Subscription Paid] Error:', err);
    alert('❌ Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

// ══════════════════════════════════════════════════════════════
// 📲 SEND SUBSCRIPTION REMINDER VIA WHATSAPP
// ══════════════════════════════════════════════════════════════
async function sendSubscriptionReminder(id) {
  const invoice = subscriptionInvoicesData.find(inv => inv.id === id);
  if (!invoice) {
    alert('❌ Invoice not found.');
    return;
  }

  let societyPhone = '';
  try {
    const { data: society } = await _supabase
      .from('societies')
      .select('phone, name')
      .eq('name', invoice.society_name)
      .maybeSingle();

    if (society && society.phone) {
      societyPhone = society.phone;
    }
  } catch (e) {
    console.warn('[Subscription Reminder] Society lookup failed:', e);
  }

  if (!societyPhone) {
    alert(
      `❌ ${invoice.society_name} का phone number नहीं मिला।\n\n` +
      `कृपया "Manage Societies" में society का phone number add करें।`
    );
    return;
  }

  const message =
`Dear ${invoice.society_name} Committee,

📄 *Subscription Invoice Reminder*

Invoice No: ${invoice.invoice_no}
Month: ${invoice.billing_month}
Flats: ${invoice.houses_count}
Rate: ₹${invoice.rate_per_house} /house
Total Amount: ₹${Number(invoice.total_amount).toLocaleString('en-IN')}
Due Date: ${invoice.due_date}

💳 *Pay via UPI / Bank:*
Agency: PS Society Solutions
Phone: +91 8866376056
UPI: 8866376056@icici

Please clear the payment before the due date to avoid service interruption.

Thank you,
PS Society Solutions`;

  sendWhatsAppReminder(societyPhone, message);
}

// ══════════════════════════════════════════════════════════════
// 🔒 GRACE PERIOD + AUTO-SUSPEND LOGIC
// ══════════════════════════════════════════════════════════════

const SUBSCRIPTION_GRACE_DAYS = 30;   // ✅ 7 → 30 दिन

/**
 * Compute days overdue for an invoice
 */
function __daysOverdue(dueDate) {
  if (!dueDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = today - due;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Compute status for a single society based on its pending invoices
 * Returns: 'active' | 'grace' | 'suspended'
 */
function __computeSocietyStatus(societyName) {
  const socInvoices = subscriptionInvoicesData.filter(inv => inv.society_name === societyName);

  // Find oldest unpaid invoice
  const unpaid = socInvoices
    .filter(inv => inv.status === 'Pending')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  if (unpaid.length === 0) return 'active';

  const oldest = unpaid[0];
  const days = __daysOverdue(oldest.due_date);

  if (days <= 0) return 'active';
  if (days <= SUBSCRIPTION_GRACE_DAYS) return 'grace';
  return 'suspended';
}

/**
 * Check all societies and update subscription_status in DB
 */
async function checkAndUpdateSubscriptionStatus() {
  if (currentRole !== 'Admin') return;
  if (!subscriptionInvoicesData || subscriptionInvoicesData.length === 0) return;

  try {
    // Fetch all active + recently suspended societies
    const { data: societies } = await _supabase
      .from('societies')
      .select('id, name, subscription_status');

    if (!societies || societies.length === 0) return;

    const updates = [];
    societies.forEach(soc => {
      const currentStatus = soc.subscription_status || 'active';
      const newStatus = __computeSocietyStatus(soc.name);

      // ✅ Auto-reactivate: अगर unpaid invoice नहीं है और पहले suspended था → active कर दो
      let finalStatus = newStatus;
      if (currentStatus === 'suspended' && newStatus === 'active') {
        finalStatus = 'active';
      }
      // ✅ Manual override respected: अगर active है और suspended होना चाहिए, तो suspended करो
      // (यही default behavior है)

      if (finalStatus !== currentStatus) {
        updates.push({ id: soc.id, name: soc.name, from: currentStatus, to: finalStatus });
      }
    });

    // Update one by one
    for (const u of updates) {
      await _supabase
        .from('societies')
        .update({ subscription_status: u.to })
        .eq('id', u.id);

      console.log(`[Subscription Status] ${u.name}: ${u.from} → ${u.to}`);
    }

    if (updates.length > 0) {
      console.log(`[Subscription Status] ${updates.length} societies updated`);
    }
  } catch (err) {
    console.warn('[Subscription Status] Error:', err);
  }
}

/**
 * Render banner showing grace + suspended societies
 */
function renderSubscriptionStatusBanner() {
  const banner = document.getElementById('subscription-status-banner');
  if (!banner) return;

  if (!subscriptionInvoicesData || subscriptionInvoicesData.length === 0) {
    banner.innerHTML = '';
    return;
  }

  // Group societies by status
  const societyNames = [...new Set(subscriptionInvoicesData.map(inv => inv.society_name))];

  const graceList = [];
  const suspendedList = [];

  societyNames.forEach(name => {
    const status = __computeSocietyStatus(name);
    if (status === 'grace') graceList.push(name);
    if (status === 'suspended') suspendedList.push(name);
  });

  if (graceList.length === 0 && suspendedList.length === 0) {
    banner.innerHTML = '';
    return;
  }

  let html = '';

  if (suspendedList.length > 0) {
    html += `
      <div class="alert alert-danger shadow-sm" style="border-radius: 12px;">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1">
              <i class="fa-solid fa-ban me-2"></i> ${suspendedList.length} Society${suspendedList.length > 1 ? 'ies' : ''} Suspended
            </h6>
            <p class="small mb-1">Due date + ${SUBSCRIPTION_GRACE_DAYS} days बीत चुके हैं और payment नहीं आई।</p>
            <div class="small">
              ${suspendedList.map(n => `<span class="badge bg-danger me-1 mb-1">${n}</span>`).join('')}
            </div>
          </div>
          <button class="btn btn-sm btn-danger fw-semibold" onclick="showAllOverdueInvoices()">
            <i class="fa-solid fa-list me-1"></i> View All
          </button>
        </div>
      </div>
    `;
  }

  if (graceList.length > 0) {
    html += `
      <div class="alert alert-warning shadow-sm" style="border-radius: 12px;">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1">
              <i class="fa-solid fa-clock me-2"></i> ${graceList.length} Society${graceList.length > 1 ? 'ies' : ''} In Grace Period
            </h6>
            <p class="small mb-1">Due date निकल गई है — ${SUBSCRIPTION_GRACE_DAYS} दिन में payment नहीं आई तो suspend हो जाएँगी।</p>
            <div class="small">
              ${graceList.map(n => `<span class="badge bg-warning text-dark me-1 mb-1">${n}</span>`).join('')}
            </div>
          </div>
          <button class="btn btn-sm btn-warning fw-semibold" onclick="sendBulkSubscriptionReminders('grace')">
            <i class="fa-brands fa-whatsapp me-1"></i> Send Reminders
          </button>
        </div>
      </div>
    `;
  }

  banner.innerHTML = html;
}

/**
 * Manual reactivate society (override auto-suspend)
 */
async function reactivateSociety(societyName) {
  if (!confirm(`⚠️ Reactivate "${societyName}"?\n\nयह manually society को active कर देगा, चाहे payment pending हो।\n\nक्या आप sure हैं?`)) {
    return;
  }

  try {
    const { error } = await _supabase
      .from('societies')
      .update({ subscription_status: 'active' })
      .eq('name', societyName);

    if (error) {
      alert('❌ Error: ' + error.message);
      return;
    }

    try {
      await logActivity(
        'SOCIETY_REACTIVATED',
        `Manually reactivated: ${societyName}`
      );
    } catch (e) { /* silent */ }

    alert(`✅ "${societyName}" reactivated successfully!`);
    await renderSuperAdminMasterDashboard();
    await loadSubscriptionInvoices();

  } catch (err) {
    console.error('[Reactivate] Error:', err);
    alert('❌ Error: ' + err.message);
  }
}

/**
 * Bulk WhatsApp reminder for grace/suspended societies
 */
async function sendBulkSubscriptionReminders(filterType) {
  const societyNames = [...new Set(subscriptionInvoicesData.map(inv => inv.society_name))];

  const targetSocieties = societyNames.filter(name => {
    const status = __computeSocietyStatus(name);
    if (filterType === 'grace') return status === 'grace';
    if (filterType === 'suspended') return status === 'suspended';
    return status === 'grace' || status === 'suspended';
  });

  if (targetSocieties.length === 0) {
    alert('✅ No societies need reminders right now!');
    return;
  }

  if (!confirm(`📢 ${targetSocieties.length} societies ko WhatsApp reminder bhejna hai?`)) return;

  // Fetch society phones
  const { data: socData } = await _supabase
    .from('societies')
    .select('name, phone')
    .in('name', targetSocieties);

  const phones = (socData || []).filter(s => s.phone);

  if (phones.length === 0) {
    alert('❌ Kisi bhi society ka phone number नहीं मिला।');
    return;
  }

  // Send one by one with delay
  for (let i = 0; i < phones.length; i++) {
    const s = phones[i];
    setTimeout(() => {
      const message =
`Dear ${s.name} Committee,

⚠️ *Subscription Payment Reminder*

Aapki society ka subscription payment pending hai. Kripya jald se jald payment karein warna services suspend ho sakti hain.

💳 *Pay via UPI:*
Agency: PS Society Solutions
UPI: 8866376056@icici
Phone: +91 8866376056

Thank you,
PS Society Solutions`;

      sendWhatsAppReminder(s.phone, message);
    }, i * 1000);
  }

  alert(`✅ ${phones.length} reminders खोल दिए गए।`);
}

function generateMonthlySummary() {
  let monthInput = document.querySelector('#tabOverlay #summary-month-picker') || document.getElementById('summary-month-picker');
  let selectedMonth = monthInput ? monthInput.value : '';

  if (!selectedMonth) {
    const now = new Date();
    selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (monthInput) monthInput.value = selectedMonth;
  }

  const monthCollections = maintenanceData.filter(r => {
    if (!r.payment_date) return false;
    const d = new Date(r.payment_date);
    if (!isNaN(d.getTime())) { const yyyy = d.getFullYear(); const mm = String(d.getMonth() + 1).padStart(2, '0'); return `${yyyy}-${mm}` === selectedMonth; }
    return (r.payment_date || '').startsWith(selectedMonth);
  });
  const totalCollected = monthCollections.reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);

  const monthExpenses = expenseData.filter(e => {
    if (!e.expense_date) return false;
    const d = new Date(e.expense_date);
    if (!isNaN(d.getTime())) { const yyyy = d.getFullYear(); const mm = String(d.getMonth() + 1).padStart(2, '0'); return `${yyyy}-${mm}` === selectedMonth; }
    return (e.expense_date || '').startsWith(selectedMonth);
  });
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const netCashflow = totalCollected - totalExpenses;

  let defaulterCount = 0;
  membersData.forEach(m => {
    const flatNo = (m.flat_no || '').trim().toUpperCase();
    const rate = Number(m.monthly_rate || 600);
    const openingDue = Number(m.opening_due || 0);
    const flatPaid = maintenanceData.filter(r => (r.flat_no || '').trim().toUpperCase() === flatNo).reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
    const totalDue = openingDue + (MONTHS_IN_FY_SO_FAR * rate);
    if (totalDue - flatPaid > 0) defaulterCount++;
  });

  document.querySelectorAll('#summary-month-collected').forEach(el => el.innerText = totalCollected);
  document.querySelectorAll('#summary-month-expenses').forEach(el => el.innerText = totalExpenses);
  document.querySelectorAll('#summary-month-net').forEach(el => {
    el.innerText = netCashflow;
    el.className = netCashflow >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
  });
  document.querySelectorAll('#summary-month-defaulters').forEach(el => el.innerText = `${defaulterCount} Flats`);

  renderMonthlySummaryTable(monthCollections, monthExpenses, totalCollected, totalExpenses, netCashflow);
}

function renderMonthlySummaryTable(collections, expenses, totalColl, totalExp, net) {
  const expCategories = {
    'Administrative Expenses': 0, 'Utility Expenses': 0, 'Repairs & Maintenance': 0,
    'Staff & Salary': 0, 'Statutory & Legal': 0, 'Other Expenses': 0
  };

  expenses.forEach(e => {
    const cat = e.category || 'Other Expenses';
    if (expCategories[cat] !== undefined) { expCategories[cat] += Number(e.amount || 0); }
    else { expCategories['Other Expenses'] += Number(e.amount || 0); }
  });

  let html = `
    <tr class="table-success fw-bold">
      <td>Maintenance Collections (Total Receipts)</td>
      <td><span class="badge bg-success">Income</span></td>
      <td>${collections.length} Receipts</td>
      <td>${totalColl.toFixed(2)}</td>
    </tr>
  `;

  for (const [cat, amt] of Object.entries(expCategories)) {
    if (amt > 0) {
      html += `
        <tr>
          <td>Expense Head: ${cat}</td>
          <td><span class="badge bg-danger">Expense Group</span></td>
          <td>-</td>
          <td class="text-danger fw-bold">${amt.toFixed(2)}</td>
        </tr>
      `;
    }
  }

  html += `
    <tr class="table-secondary fw-bold">
      <td colspan="3">Total Expenses Paid</td>
      <td class="text-danger">${totalExp.toFixed(2)}</td>
    </tr>
    <tr class="table-primary fw-bold">
      <td colspan="3">Net Monthly Surplus / (Deficit)</td>
      <td class="${net >= 0 ? 'text-success' : 'text-danger'}">${net.toFixed(2)}</td>
    </tr>
  `;

  const tbodies = document.querySelectorAll('#monthly-summary-rows');
  tbodies.forEach(tbody => { tbody.innerHTML = html; });
}

async function submitMember(event) {
  event.preventDefault();
  
  const flatNo = document.getElementById('mem-flat').value.trim().toUpperCase();
  const name = document.getElementById('mem-name').value.trim();
  const phone = document.getElementById('mem-phone').value.trim();
  const is_tenant = document.getElementById('mem-is-tenant').value;

  // ══════════════════════════════════════════════
  // ✅ STEP 1: Frontend duplicate check
  // ══════════════════════════════════════════════
  if (!flatNo) {
    alert('❌ Flat No खाली नहीं हो सकता।');
    return;
  }

  // Check against already-loaded membersData (fast, no DB call)
  const existingInMemory = membersData.find(m => 
    (m.flat_no || '').trim().toUpperCase() === flatNo
  );

  if (existingInMemory) {
    alert(`❌ Flat "${flatNo}" पहले से मौजूद है!\n\nOwner: ${existingInMemory.name || 'N/A'}\nPhone: ${existingInMemory.phone || 'N/A'}\n\nडुप्लीकेट flat add नहीं कर सकते।`);
    return;
  }

  // ══════════════════════════════════════════════
  // ✅ STEP 2: DB-level double check (safety)
  // ══════════════════════════════════════════════
  try {
    const { data: dbCheck, error: checkErr } = await _supabase
      .from('members')
      .select('id, name, phone')
      .eq('society_name', currentSociety)
      .ilike('flat_no', flatNo)
      .maybeSingle();

    if (checkErr && checkErr.code !== 'PGRST116') {
      console.warn('[Member] DB check error:', checkErr.message);
    }

    if (dbCheck) {
      alert(`❌ Flat "${flatNo}" database में पहले से मौजूद है!\n\nOwner: ${dbCheck.name || 'N/A'}\n\nकृपया पहले से मौजूद member को edit करें।`);
      return;
    }
  } catch (err) {
    console.warn('[Member] Duplicate check failed, continuing:', err);
  }

  // ══════════════════════════════════════════════
  // ✅ STEP 3: Rent Agreement upload
  // ══════════════════════════════════════════════
  let rent_agreement_url = null;

  if (is_tenant === 'Yes') {
    const fileInput = document.getElementById('mem-rent-agreement-file');
    const file = fileInput?.files?.[0];
    if (file) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${currentSociety}/agreement_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await _supabase.storage.from('notice_attachments').upload(filePath, file);
      if (!uploadError) {
        const { data: urlData } = _supabase.storage.from('notice_attachments').getPublicUrl(filePath);
        rent_agreement_url = urlData?.publicUrl || null;
      }
    }
  }

  // ══════════════════════════════════════════════
  // ✅ STEP 4: Insert with final DB-level protection
  // ══════════════════════════════════════════════
  const newMember = {
    flat_no: flatNo,
    name: name,
    phone: phone,
    status: is_tenant === 'Yes' ? 'Tenant' : 'Owner',
    is_tenant: is_tenant,
    tenant_name: document.getElementById('mem-tenant-name')?.value.trim() || null,
    tenant_phone: document.getElementById('mem-tenant-phone')?.value.trim() || null,
    rent_agreement_url: rent_agreement_url,
    monthly_rate: Number(document.getElementById('mem-rate').value),
    opening_due: Number(document.getElementById('mem-opening-due')?.value || 0),
    society_name: currentSociety
  };

  const { error } = await _supabase.from('members').insert([newMember]);

  if (error) {
    // ✅ Catch unique constraint violation from DB
    if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
      alert(`❌ Flat "${flatNo}" पहले से मौजूद है!\n\n(DB protection ने रोका)\n\nकृपया existing record को edit करें।`);
      return;
    }
    alert('❌ Error adding member: ' + error.message);
    return;
  }

  alert(`✅ Member "${flatNo}" successfully added!`);
  bootstrap.Modal.getInstance(document.getElementById('memberModal')).hide();
  document.getElementById('memberModal').querySelector('form').reset();
  
  await fetchSupabaseData();
  renderAllTables();
}

async function submitFD(event) {
  event.preventDefault();
  const newFD = {
    fund_type: document.getElementById('fd-fund-type').value,
    bank_name: document.getElementById('fd-bank').value,
    account_number: document.getElementById('fd-acc').value,
    principal_amount: Number(document.getElementById('fd-amount').value),
    interest_rate: Number(document.getElementById('fd-rate').value),
    deposit_date: document.getElementById('fd-dep-date').value,
    maturity_date: document.getElementById('fd-mat-date').value,
    maturity_amount: Number(document.getElementById('fd-maturity').value),
    status: document.getElementById('fd-status').value,
    society_name: currentSociety
  };
  await _supabase.from('sinking_fund_fd').insert([newFD]);
  bootstrap.Modal.getInstance(document.getElementById('fdModal')).hide();
  fetchSupabaseData();
}

async function submitJournalVoucher(event) {
  event.preventDefault();
  const newJV = {
    society_name: currentSociety,
    jv_no: document.getElementById('jv-no').value.trim(),
    date: document.getElementById('jv-date').value,
    flat_no: document.getElementById('jv-flat').value.trim().toUpperCase(),
    type: document.getElementById('jv-type').value,
    amount: Number(document.getElementById('jv-amount').value),
    reason: document.getElementById('jv-reason').value.trim(),
    created_at: new Date().toISOString()
  };

  const { error } = await _supabase.from('journal_vouchers').insert([newJV]);
  if (error) { alert('❌ Error saving JV: ' + error.message); return; }

  alert('✅ Journal Voucher Posted Successfully!');
  bootstrap.Modal.getInstance(document.getElementById('journalModal')).hide();
  document.getElementById('journalForm').reset();
  
  // ✅ Reload journal vouchers data FIRST
  const { data: freshJVs } = await _supabase
    .from('journal_vouchers')
    .select('*')
    .eq('society_name', currentSociety)
    .order('date', { ascending: false });
  journalVouchersData = freshJVs || [];
  
  // Then refresh everything
  renderJournalVouchers();
  renderCAAuditReport();
  renderMembers();
  renderMemberPersonalView();
  updateAllBadges();
}

function renderJournalVouchers() {
  const tbody = document.getElementById('journal-list');
  if (!tbody) return;
  if (!journalVouchersData || journalVouchersData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No journal vouchers recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = journalVouchersData.map((jv, index) => `
    <tr>
      <td><b>${jv.jv_no}</b></td>
      <td>${jv.date}</td>
      <td>${jv.flat_no}</td>
      <td><span class="badge ${jv.type === 'Debit' ? 'bg-danger' : 'bg-success'}">${jv.type}</span></td>
      <td class="fw-bold">${jv.amount}</td>
      <td>${jv.reason}</td>
      <td class="no-print admin-only">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteJournalVoucher(${jv.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

async function deleteJournalVoucher(id) {
  if (!confirm('⚠️ Delete this Journal Voucher?')) return;
  const { error } = await _supabase.from('journal_vouchers').delete().eq('id', id);
  if (error) alert('Error: ' + error.message);
  else {
    // ✅ Reload journal vouchers data FIRST
    const { data: freshJVs } = await _supabase
      .from('journal_vouchers')
      .select('*')
      .eq('society_name', currentSociety)
      .order('date', { ascending: false });
    journalVouchersData = freshJVs || [];
    
    // Then refresh everything
    renderJournalVouchers();
    renderCAAuditReport();
    renderMembers();
    renderMemberPersonalView();
    updateAllBadges();
  }
}

async function submitAsset(event) {
  event.preventDefault();
  const newAsset = {
  asset_code: `AST-${Date.now()}`,
  name: document.getElementById('asset-name').value,
  location: document.getElementById('asset-loc').value,
  quantity: parseInt(document.getElementById('asset-qty').value) || 1,
  cost: Number(document.getElementById('asset-cost').value),
  purchase_date: document.getElementById('asset-purchase-date')?.value || null,
  depreciation_rate: Number(document.getElementById('asset-dep-rate')?.value || 10),
  condition_status: document.getElementById('asset-condition').value,
  details: document.getElementById('asset-details').value || '',
  society_name: currentSociety
};
  await _supabase.from('assets').insert([newAsset]);
  bootstrap.Modal.getInstance(document.getElementById('assetModal')).hide();
  fetchSupabaseData();
}

async function submitMaintenance(event) {
  event.preventDefault();
  const newReceipt = {
    receipt_no: document.getElementById('maint-form-ref').value || `REC-${Date.now()}`,
    flat_no: document.getElementById('maint-form-flat').value.toUpperCase(),
    payment_date: document.getElementById('maint-form-date').value || new Date().toISOString().split('T')[0],
    amount_paid: Number(document.getElementById('maint-form-amount').value),
    mode_of_payment: document.getElementById('maint-form-mode').value,
    month_accounted: document.getElementById('maint-form-month').value || "July'26",
    remarks: document.getElementById('maint-form-remarks').value || "-",
    society_name: currentSociety
  };

  await _supabase.from('maintenance_payments').insert([newReceipt]);
  bootstrap.Modal.getInstance(document.getElementById('maintenanceModal')).hide();
  
  await fetchSupabaseData();
  renderAllTables();
}

function openExpenseModal() {
  document.getElementById('expenseForm')?.reset();
  new bootstrap.Modal(document.getElementById('expenseModal')).show();
}

async function submitExpense(event) {
  event.preventDefault();
  const newExpense = {
    voucher_no: document.getElementById('exp-form-no').value.trim() || `VOU-${Date.now()}`,
    expense_date: document.getElementById('exp-form-date').value || new Date().toISOString().split('T')[0],
    category: document.getElementById('exp-form-category').value.trim(),
    paid_to: document.getElementById('exp-form-paidto').value.trim(),
    amount: Number(document.getElementById('exp-form-amount').value),
    mode: document.getElementById('exp-form-mode').value,
    remarks: document.getElementById('exp-form-remarks').value.trim() || "-",
    society_name: currentSociety
  };

  await _supabase.from('expenses').insert([newExpense]);
  await logActivity('ADD_EXPENSE', `Added voucher ${newExpense.voucher_no} of ${newExpense.amount} for ${newExpense.paid_to}`);
  
  bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
  fetchSupabaseData();
}

async function submitBankEntry(event) {
  event.preventDefault();
  const type = document.getElementById('bank-form-type').value;
  const amt = Number(document.getElementById('bank-form-amount').value);
  
  const newEntry = {
    society_name: currentSociety,
    date: document.getElementById('bank-form-date').value,
    ref: document.getElementById('bank-form-ref').value,
    head: document.getElementById('bank-form-head').value,
    type: type === 'deposit' ? 'Bank Deposit' : 'Withdrawal',
    deposit: type === 'deposit' ? amt : 0,
    withdraw: type === 'withdraw' ? amt : 0
  };
  
  const { error } = await _supabase.from('bank_entries').insert([newEntry]);
  if (error) { alert('❌ Error: ' + error.message); return; }
  
  alert('✅ Bank entry saved permanently!');
  bootstrap.Modal.getInstance(document.getElementById('bankModal')).hide();
  document.getElementById('bankModal').querySelector('form').reset();
  await fetchSupabaseData();
  setTimeout(() => loadSecondaryData(), 500);
}

function openEnrollModal() { new bootstrap.Modal(document.getElementById('enrollModal')).show(); }

async function submitEnroll(event) {
  event.preventDefault();
  const newLead = {
    full_name: document.getElementById('enroll-name').value.trim(),
    society_name: document.getElementById('enroll-society').value.trim(),
    city: document.getElementById('enroll-city').value.trim(),
    mobile: document.getElementById('enroll-mobile').value.trim(),
    status: 'New'
  };
  await _supabase.from('leads').insert([newLead]);
  alert('✅ Enrollment Submitted!');
  bootstrap.Modal.getInstance(document.getElementById('enrollModal')).hide();
}

async function deleteMember(id) { 
  if (confirm('Delete member?')) { 
    await _supabase.from('members').delete().eq('id', id); 
    logActivity('DELETE_MEMBER', `Deleted member ID: ${id}`);
    fetchSupabaseData(); 
  } 
}

async function deleteMaintenance(id) { 
  if (confirm('Delete receipt?')) { 
    await _supabase.from('maintenance_payments').delete().eq('id', id); 
    fetchSupabaseData(); 
  } 
}

async function deleteExpense(id) { 
  if (confirm('Delete voucher?')) { 
    await _supabase.from('expenses').delete().eq('id', id); 
    logActivity('DELETE_EXPENSE', `Deleted voucher ID: ${id}`);
    fetchSupabaseData(); 
  } 
}

async function deleteAsset(id) { 
  if (confirm('Delete asset?')) { 
    await _supabase.from('assets').delete().eq('id', id); 
    fetchSupabaseData(); 
  } 
}

async function deleteFD(id) { 
  if (confirm('Delete FD?')) { 
    await _supabase.from('sinking_fund_fd').delete().eq('id', id); 
    fetchSupabaseData(); 
  } 
}

async function submitTeamMember(event) {
  event.preventDefault();
  const newMember = {
    name: document.getElementById('team-name').value.trim(),
    mobile: document.getElementById('team-mobile').value.trim(),
    role: document.getElementById('team-role').value.trim(),
    type: document.getElementById('team-type').value,
    society_name: currentSociety
  };
  await _supabase.from('team').insert([newMember]);
  bootstrap.Modal.getInstance(document.getElementById('teamModal')).hide();
  fetchSupabaseData();
}

async function deleteTeamMember(id) {
  if (!confirm('Delete team member?')) return;
  await _supabase.from('team').delete().eq('id', id);
  fetchSupabaseData();
}

function exportTableToExcel(tableId, filename) {
  const table = document.getElementById(tableId);
  const tableClone = table.cloneNode(true);
  tableClone.querySelectorAll('td').forEach(td => { td.innerText = td.innerText.replace(/[₹Rs\.]/g, '').trim(); });
  const wb = XLSX.utils.table_to_book(tableClone, { sheet: "Sheet1", raw: true });
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ✅ Change Password button handler (Desktop sidebar ke liye)
function handleChangePasswordClick() {
  // 🔒 Sirf PS Live Demo mein block
  if (typeof isDemoMode === 'function' && isDemoMode()) {
    alert('🔒 Password change is not available in Demo Mode.\n\n' +
          'This is just a preview. To change your password:\n' +
          '1. Go to the landing page\n' +
          '2. Login with your account\n' +
          '3. Then change your password');
    return;
  }
  
  // Normal flow — modal kholo
  const modalEl = document.getElementById('changePasswordModal');
  if (modalEl) new bootstrap.Modal(modalEl).show();
}

function toggleMobileMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  if (!overlay) return;
  if (overlay.style.display === 'flex') { closeMobileMenu(); }
  else { overlay.style.display = 'flex'; document.body.style.overflow = 'hidden'; renderGridCards(); window.history.pushState({ mobileMenuOpen: true }, "", window.location.href); }
}

function closeMobileMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function updateMobileHeaderInfo() {
  const socElem = document.getElementById('mobile-society-name');
  const userElem = document.getElementById('mobile-user-details');
  if (socElem) { socElem.innerText = societySettings.society_name || currentSociety || 'PS Society'; }
  if (userElem) {
    if (currentRole === 'Admin' || currentRole === 'SocietyAdmin') { userElem.innerText = `👑 ${currentRole} (${currentUser})`; }
    else if (currentRole === 'Chairman') { userElem.innerText = `🎖️ Chairman (${currentUser})`; }
    else {
      const member = membersData.find(m => (m.flat_no || '').toUpperCase() === currentUser.toUpperCase());
      const memberName = member && member.name ? member.name : '';
      userElem.innerText = memberName ? `🏠 ${currentUser} - ${memberName}` : `🏠 ${currentUser}`;
    }
  }
}

function renderGridCards() {
  updateMobileHeaderInfo();
  const container = document.querySelector('#mobileMenuOverlay .grid-container');
  if (!container) return;
  const role = currentRole || 'Member';
  let allCards = [
    { id: 'master-dashboard', icon: 'fa-chart-pie', label: 'Master Dashboard', color: '#8b5cf6' },    
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard', color: '#2563eb' },
    { id: 'activity-logs', icon: 'fa-list-check', label: 'Activity Logs', color: '#0ea5e9' },
    { id: 'members', icon: 'fa-users', label: 'Members', color: '#22c55e' },
    { id: 'maintenance', icon: 'fa-indian-rupee-sign', label: 'Maintenance', color: '#f59e0b' },
    { id: 'bills', icon: 'fa-file-invoice-dollar', label: 'Monthly Bills', color: '#16a34a' },
    { id: 'expenses', icon: 'fa-receipt', label: 'Expenses', color: '#ef4444' },
    { id: 'amc-tracker', icon: 'fa-screwdriver-wrench', label: 'AMC Tracker', color: '#f59e0b' },
    { id: 'visitor', icon: 'fa-user-plus', label: 'Visitor', color: '#8b5cf6' },
    { id: 'complaints', icon: 'fa-headset', label: 'Complaints', color: '#ec4899' },
    { id: 'support', icon: 'fa-life-ring', label: 'Support', color: '#0ea5e9' },
    { id: 'ca-audit', icon: 'fa-calculator', label: 'CA Audit', color: '#06b6d4' },
    { id: 'bank-reconciliation', icon: 'fa-scale-balanced', label: 'Bank BRS', color: '#0ea5e9' },
    { id: 'polls', icon: 'fa-check-to-slot', label: 'Polls', color: '#f97316' },
    { id: 'parking', icon: 'fa-square-parking', label: 'Parking', color: '#f59e0b' },
    { id: 'tally-bank', icon: 'fa-building-columns', label: 'Tally Bank', color: '#8b5cf6' },
    { id: 'journal-voucher', icon: 'fa-file-pen', label: 'Journal Voucher', color: '#2563eb' },
    { id: 'chairman-report', icon: 'fa-file-invoice-dollar', label: 'Chairman Report', color: '#f59e0b' },
    { id: 'community', icon: 'fa-people-group', label: 'Community Hub', color: '#14b8a6' },
    { id: 'meetings', icon: 'fa-book-open', label: 'Meeting Minutes', color: '#2563eb' },
    { id: 'bank-details', icon: 'fa-qrcode', label: 'Bank / QR', color: '#2563eb' },
    { id: 'marketplace', icon: 'fa-store', label: 'Marketplace', color: '#f59e0b' },
    { id: 'sos-contacts', icon: 'fa-truck-medical', label: 'Emergency SOS', color: '#ef4444' },
    { id: 'assets', icon: 'fa-boxes-stacked', label: 'Assets', color: '#64748b' },
    { id: 'fds', icon: 'fa-piggy-bank', label: 'FDs', color: '#8b5cf6' },
    { id: 'proofs', icon: 'fa-file-invoice', label: 'Payment Details', color: '#3b82f6' },
    { id: 'user-management', icon: 'fa-user-shield', label: 'User Mgmt', color: '#f59e0b' },
    { id: 'settings', icon: 'fa-gear', label: 'Settings', color: '#475569' },
    { id: 'about', icon: 'fa-circle-info', label: 'About PS', color: '#0f172a' },
    { id: 'team', icon: 'fa-people-group', label: 'Committee', color: '#8b5cf6' },
    { id: 'manage-societies', icon: 'fa-building', label: 'Manage Societies', color: '#2563eb' },
    { id: 'rules', icon: 'fa-book', label: 'Society Rules', color: '#f59e0b' },
    { id: 'deletion-requests', icon: 'fa-trash-can', label: 'Deletion Requests', color: '#ef4444' },
    { id: 'change-password', icon: 'fa-key', label: 'Change Password', color: '#f59e0b' }
  ];

  if (role === 'Member') {
    const memberCards = ['dashboard', 'members', 'marketplace', 'maintenance', 'visitor', 'complaints', 'support', 'polls', 'community', 'parking', 'bank-details', 'sos-contacts', 'rules', 'about', 'team', 'change-password'];
    allCards = allCards.filter(c => memberCards.includes(c.id));
  } else if (role === 'Chairman') {
    allCards = allCards.filter(c => c.id !== 'settings' && c.id !== 'manage-societies' && c.id !== 'deletion-requests' && c.id !== 'master-dashboard' && c.id !== 'activity-logs' && c.id !== 'proofs' && c.id !== 'user-management');
  } else if (role === 'SocietyAdmin') {
    allCards = allCards.filter(c => c.id !== 'settings' && c.id !== 'manage-societies' && c.id !== 'master-dashboard' && c.id !== 'deletion-requests' && c.id !== 'user-management');
 }

  allCards.sort((a, b) => {
    if (a.id === 'dashboard') return -1;
    if (b.id === 'dashboard') return 1;
    if (a.id === 'about') return 1;
    if (b.id === 'about') return -1;
    return a.label.localeCompare(b.label);
  });

  container.innerHTML = allCards.map(card => `
  <div onclick="openTabOverlay('${card.id}')" class="grid-card-item">
    <i class="fa-solid ${card.icon}" style="color: ${card.color};"></i>
    <span style="color: #fff; font-weight: 500; display: block;">${card.label}</span>
    <span class="grid-badge" id="grid-badge-${card.id}" data-count="0"></span>
  </div>
`).join('');

// ✅ Badges sync करो
syncMobileGridBadges();
}

function openAboutPS() {
  const overlay = document.getElementById('aboutPSOverlay');
  const body = document.getElementById('aboutPSBody');
  if (!overlay || !body) return;

  body.innerHTML = `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; text-align: left;">
      <div class="text-center mb-3">
        <h3 class="fw-bold mb-1"><span style="color: #f59e0b;">PS</span> Society Solutions</h3>
        <p class="text-primary fw-semibold small mb-0">Smart Society Management Engine • Simple • Transparent • Affordable</p>
      </div>

      <h6 class="fw-bold text-dark border-bottom pb-2 mb-2">🏷️ Subscription Plans (Per House / Month)</h6>
      <div class="row g-2 mb-3 text-center">
        <div class="col-4"><div class="p-2 border rounded-3 bg-light"><span class="badge bg-secondary mb-1">SILVER</span><h5 class="fw-bold mb-0 text-dark">49</h5><small class="text-muted" style="font-size: 10px;">Digital Accounting</small></div></div>
        <div class="col-4"><div class="p-2 border border-warning rounded-3 bg-warning-subtle"><span class="badge bg-warning text-dark mb-1">GOLD (Popular)</span><h5 class="fw-bold mb-0 text-dark">79</h5><small class="text-muted" style="font-size: 10px;">Accounting + Visits</small></div></div>
        <div class="col-4"><div class="p-2 border border-primary rounded-3 bg-primary-subtle"><span class="badge bg-primary mb-1">PLATINUM</span><h5 class="fw-bold mb-0 text-dark">149</h5><small class="text-muted" style="font-size: 10px;">Complete Operations</small></div></div>
      </div>

      <h6 class="fw-bold text-dark border-bottom pb-2 mb-2">✨ What Your Society Gets</h6>
      <ul class="small text-muted ps-3 mb-3" style="line-height: 1.6;">
        <li>📊 <strong>Digital Accounting:</strong> Member ledgers, automated collection tracking & vouchers.</li>
        <li>📑 <strong>CA-Ready Audit Records:</strong> Automatic Balance Sheet & Trial Balance generation.</li>
        <li>📢 <strong>WhatsApp Reminders:</strong> Direct 1-click pending payment alerts to defaulters.</li>
        <li>🛡️ <strong>Zero Cash Handling:</strong> Complete bank & QR transparency with Society's own accounts.</li>
        <li>👥 <strong>Committee & Staff Support:</strong> Vendor AMC tracking, security logs & complaint tickets.</li>
      </ul>

      <div class="p-3 bg-light rounded-3 text-center border">
        <p class="small text-muted mb-2">📞 Call / WhatsApp: <strong>+91 8866376056</strong> | 📍 Vadodara, Gujarat</p>
        <div class="d-flex justify-content-center gap-2">
          <a href="https://wa.me/918866376056" target="_blank" class="btn btn-success btn-sm px-3 fw-semibold"><i class="fa-brands fa-whatsapp me-1"></i> WhatsApp</a>
          <a href="tel:8866376056" class="btn btn-primary btn-sm px-3 fw-semibold"><i class="fa-solid fa-phone me-1"></i> Call Us</a>
        </div>
      </div>
    </div>
  `;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function syncMobileGridBadges() {
  const badgeMap = {
    'maintenance': 'maintenance-badge',
    'proofs': 'proofs-badge',
    'complaints': 'complaints-badge',
    'polls': 'polls-badge',
    'community': 'community-badge',
    'visitor': 'visitor-badge',
    'amc-tracker': 'amc-badge',
    'parking': 'parking-badge',
        'support': 'support-badge',
    'user-management': 'user-mgmt-badge'
  };

  Object.entries(badgeMap).forEach(([cardId, srcBadgeId]) => {
    const gridBadge = document.getElementById(`grid-badge-${cardId}`);
    const srcBadge = document.getElementById(srcBadgeId);
    if (!gridBadge) return;
    
    const count = srcBadge && srcBadge.style.display !== 'none' 
      ? (srcBadge.textContent || '').trim() 
      : '0';
    
    gridBadge.textContent = (count && count !== '0' && count !== '') ? count : '';
    gridBadge.setAttribute('data-count', count || '0');
  });
}

async function openTabOverlay(tabId, skipHistory = false) {
  // ✅ Change-Password special handling — grid ko band mat karo, sirf temporarily hide karo
  if (tabId === 'change-password') {
    // 🔒 PS Live Demo check — SIRF preview mode ke liye
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      alert('🔒 Password change is not available in Demo Mode.\n\n' +
            'This is just a preview. To change your password:\n' +
            '1. Go to the landing page\n' +
            '2. Login with your account\n' +
            '3. Then change your password');
      return;
    }

    const gridOverlay = document.getElementById('mobileMenuOverlay');
    const fromGrid = !!(gridOverlay && gridOverlay.style.display === 'flex' && window.innerWidth <= 768);
    __changePasswordFromGrid = fromGrid;

    if (fromGrid) {
      gridOverlay.style.display = 'none';
      document.body.style.overflow = 'hidden';
    } else {
      closeMobileMenu();
    }

    const modalEl = document.getElementById('changePasswordModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
    return;
  }

  closeMobileMenu();
  if (tabId === 'visitor') { showVisitorPage(); return; }

  if (tabId === 'terms' || tabId === 'privacy') { tabId = 'about'; }

  const existingOverlay = document.getElementById('tabOverlay');
  if (existingOverlay) existingOverlay.remove();

  let actualTabId = `tab-${tabId}`;
  if (tabId === 'rules') actualTabId = 'tab-rules';
  if (tabId === 'journal-voucher') actualTabId = 'tab-journal-voucher';

  const target = document.getElementById(actualTabId);
  if (!target) return;

  const immediateOverlay = createTabOverlay(tabId, '');
  immediateOverlay.setAttribute('data-current-tab', tabId);
  document.body.appendChild(immediateOverlay);
  document.body.style.overflow = 'hidden';

  if (!skipHistory) {
    window.history.pushState({ overlayOpen: true, tabId: tabId }, "", window.location.href);
  }

  try {
    // ✅ CONTENT PEHLE MOVE KARO (white screen avoid karne ke liye)
    const newTarget = document.getElementById(actualTabId);
    const contentDiv = document.querySelector('#tabOverlay #tabOverlayContent');
    if (newTarget && contentDiv) {
      contentDiv.innerHTML = '';
      contentDiv.appendChild(newTarget);
      newTarget.classList.remove('d-none');
      newTarget.setAttribute('data-in-overlay', 'true');
      if (tabId === 'settings') loadSettingsToForm();
    }

    // ═══════════════════════════════════════════════
    // SPECIAL CASE: Community tab (early return)
    // ═══════════════════════════════════════════════
    if (tabId === 'community' || tabId === 'notice' || tabId === 'notices') {
      tabId = 'community';
      markCommunityRead();

      const [{ data: fData }, { data: bData }, { data: nData }, { data: eData }] = await Promise.all([
        _supabase.from('facilities').select('*').eq('society_name', currentSociety).eq('is_active', true),
        _supabase.from('facility_bookings').select('*').eq('society_name', currentSociety).order('booking_date', { ascending: true }),
        _supabase.from('notices').select('*').eq('society_name', currentSociety),
        _supabase.from('events').select('*').eq('society_name', currentSociety).order('date', { ascending: true })
      ]);
      facilitiesData = fData || [];
      bookingsData = bData || [];
      noticesData = nData || [];
      eventsData = eData || [];

      renderCommunity();

      const communityTarget = document.getElementById('tab-community');
      const communityContent = document.querySelector('#tabOverlay #tabOverlayContent');
      if (communityTarget && communityContent) {
        communityContent.innerHTML = '';
        communityContent.appendChild(communityTarget);
        communityTarget.classList.remove('d-none');
        communityTarget.setAttribute('data-in-overlay', 'true');
      }
      return;   // ⬅️ SIRF community यहाँ return करेगा
    }

    // ═══════════════════════════════════════════════
    // ALL OTHER TABS — यहाँ तक पहुँचेंगे
    // ═══════════════════════════════════════════════
    if (tabId === 'marketplace') { await fetchMarketplaceData(); renderMarketplace(); }
        if (tabId === 'master-dashboard') { 
      await renderSuperAdminMasterDashboard(); 
      await loadSubscriptionInvoices(); 
    }
    if (tabId === 'bank-reconciliation') { renderBankReconciliation(); }
    if (tabId === 'about') renderAboutTab();
    if (tabId === 'rules') { renderRules(); }
    if (tabId === 'journal-voucher') { renderJournalVouchers(); }
    if (tabId === 'polls') renderPolls();
    if (tabId === 'chairman-report') generateMonthlySummary();
    if (tabId === 'activity-logs') fetchActivityLogs();
    if (tabId === 'meetings') renderMeetings();
    if (tabId === 'amc-tracker') renderAMCTracker();
    if (tabId === 'bank-details') renderBankDetails();
    if (tabId === 'sos-contacts') renderSOSContacts();
    if (tabId === 'proofs') renderPaymentProofs();
    if (tabId === 'support') { 
      await loadSupportTickets(); 
      renderSupportTickets(); 
      updateSupportBadge(); 
    }
    if (tabId === 'manage-societies') loadSocietiesList();
if (tabId === 'user-management') { await initUserManagementTab(); }   // ← ये line ADD करो!
    if (['dashboard', 'members', 'maintenance', 'expenses', 'polls', 'complaints', 'proofs', 'amc-tracker', 'assets', 'fds', 'team', 'journal-voucher', 'deletion-requests', 'sos-contacts', 'bank-details', 'tally-bank'].includes(tabId)) {
      refreshTabData(tabId);
    }

   } catch (e) {
    console.log('[OpenTabOverlay] error:', e);
  }
}

function createTabOverlay(tabId, content) {
  const overlay = document.createElement('div');
  overlay.id = 'tabOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100dvh; background: rgba(15, 23, 42, 0.95); z-index: 1040; padding: 20px; overflow: hidden; display: flex; flex-direction: column;';
  overlay.innerHTML = `
    <div style="flex: 0 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 10px 0 20px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <button onclick="closeTabOverlay()" style="background: none; border: none; color: #fff; font-size: 18px; cursor: pointer;"><i class="fa-solid fa-arrow-left"></i> Back</button>
      <span style="color: #f59e0b; font-weight: 600;">${tabId.toUpperCase()}</span>
      <span style="width: 50px;"></span>
    </div>
    <div id="tabOverlayContent" style="flex: 1 1 auto; min-height: 0; margin-top: 15px; background: #fff; border-radius: 16px; padding: 20px; overflow-y: auto; -webkit-overflow-scrolling: touch; color: #0f172a;">
      ${content}
    </div>
  `;
  return overlay;
}

function closeTabOverlay() {
  __userClosedOverlay = true;
  const overlay = document.getElementById('tabOverlay');
  
  // ✅ GRID PEHLE show karo (white flash avoid)
  if (window.innerWidth <= 768) {
    const gridOverlay = document.getElementById('mobileMenuOverlay');
    if (gridOverlay) {
      renderGridCards();
      gridOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }
  
  // ✅ AB overlay remove karo
  if (overlay) {
    const movedContent = overlay.querySelector('.tab-content[data-in-overlay="true"]');
    if (movedContent) {
      movedContent.classList.add('d-none');
      movedContent.removeAttribute('data-in-overlay');
      const mainElement = document.querySelector('main');
      if (mainElement) mainElement.appendChild(movedContent);
    }
    overlay.remove();
  }
  
  if (window.history.state && window.history.state.overlayOpen) {
    __programmaticBack = true;
    window.history.back();
  }
}

function openTermsOfService() {
  const overlay = document.getElementById('termsOfServiceOverlay');
  const body = document.getElementById('termsOfServiceBody');
  if (!overlay || !body) return;

  body.innerHTML = `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; padding: 5px;">
      <h3 class="fw-bold border-bottom pb-2"><span style="color: #f59e0b;">PS</span> Society Solutions — Terms of Service</h3>
      <p class="text-muted small">Effective Date: August 2026 • Last Updated: August 2026</p>
      
      <h5 class="fw-bold mt-3">1. Acceptance of Terms</h5>
      <p class="small text-muted">By accessing or using PS Society Solutions ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. We reserve the right to update these Terms at any time.</p>

      <h5 class="fw-bold mt-3">2. Description of Service</h5>
      <p class="small text-muted">PS Society Solutions is a Software-as-a-Service (SaaS) platform providing housing societies with digital management tools including member directory, maintenance billing, expense tracking, visitor management, and financial reporting. The Service is provided "as-is".</p>

      <h5 class="fw-bold mt-3">3. User Accounts and Responsibility</h5>
      <p class="small text-muted">You are solely responsible for maintaining the confidentiality of your login credentials (Flat Number and Password) and for all activities that occur under your account.</p>

      <h5 class="fw-bold mt-3">4. Acceptable Use Policy</h5>
      <p class="small text-muted">You agree not to use the Service for unlawful purposes, upload defamatory content, attempt unauthorized system access, introduce malware, or reverse engineer the platform.</p>

      <h5 class="fw-bold mt-3">5. Data Privacy and DPDP Act 2023 Compliance</h5>
      <p class="small text-muted">We comply with the Digital Personal Data Protection (DPDP) Act, 2023. Data is collected strictly for society administrative operations based on explicit consent. We do not sell or share personal data with third-party advertisers. You hold rights to access, correct, or erase your data.</p>

      <h5 class="fw-bold mt-3">6. Payments and Subscription</h5>
      <p class="small text-muted">Subscription plans include Silver (₹49/month), Gold (₹79/month), and Platinum (₹149/month) per house. Fees are billed in advance and are non-refundable except as required by law.</p>

      <h5 class="fw-bold mt-3">7. Intellectual Property</h5>
      <p class="small text-muted">All software, code, logos, and designs are the property of PS Society Solutions. Users retain ownership of content they upload but grant us a license to host and display it for service operations.</p>

      <h5 class="fw-bold mt-3">8. Limitation of Liability</h5>
      <p class="small text-muted">The Service is provided "AS IS" without warranties of any kind. Our total liability shall not exceed the total amount paid by you during the preceding twelve (12) months.</p>

      <h5 class="fw-bold mt-3">9. Governing Law and Jurisdiction</h5>
      <p class="small text-muted">These Terms are governed by the laws of India. Legal disputes are subject to the exclusive jurisdiction of the courts in Vadodara, Gujarat, India.</p>

      <h5 class="fw-bold mt-3">10. Contact and Grievance Redressal</h5>
      <p class="small text-muted mb-0">Grievance Officer: PS Society Solutions Team<br>Email: ps.societysolutions@gmail.com | Phone: +91 8866376056</p>
    </div>
  `;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeTermsOfService() { const overlay = document.getElementById('termsOfServiceOverlay'); if (overlay) overlay.style.display = 'none'; document.body.style.overflow = ''; }
function closeAboutPS() { const overlay = document.getElementById('aboutPSOverlay'); if (overlay) overlay.style.display = 'none'; document.body.style.overflow = ''; }
function closePrivacyPolicy() { const overlay = document.getElementById('privacyPolicyOverlay'); if (overlay) overlay.style.display = 'none'; document.body.style.overflow = ''; }

function openPrivacyPolicy() {
  const overlay = document.getElementById('privacyPolicyOverlay');
  const body = document.getElementById('privacyPolicyBody');
  if (!overlay || !body) return;

  body.innerHTML = `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; padding: 5px;">
      <h3 class="fw-bold border-bottom pb-2"><span style="color: #f59e0b;">PS</span> Society Solutions — Privacy Policy</h3>
      <p class="text-muted small">Effective Date: August 2026 • Compliant with Digital Personal Data Protection (DPDP) Act 2023</p>
      
      <h5 class="fw-bold mt-3">1. Information We Collect</h5>
      <p class="small text-muted">We collect resident details (name, flat number, phone, email), maintenance payment proofs (UTR numbers, receipt screenshots), visitor logs (visitor name, phone, purpose, in/out timestamps), and maintenance ticket data exclusively for society administrative operations.</p>

      <h5 class="fw-bold mt-3">2. How Your Data Is Handled</h5>
      <ul class="small text-muted ps-3">
        <li><strong>Data Isolation:</strong> Each housing society's database is segregated using Row-Level Security (RLS) policies.</li>
        <li><strong>No Third-Party Commercial Sharing:</strong> Personal information is never sold, rented, or shared with third-party advertisers.</li>
        <li><strong>Payment Safety:</strong> Society collections route strictly through authorized society bank accounts and UPI IDs.</li>
      </ul>

      <h5 class="fw-bold mt-3">3. Your Rights & Data Deletion</h5>
      <p class="small text-muted">Residents reserve the right to review payment histories and request removal of personal data via the in-app <em>Deletion Request</em> workflow under statutory compliance terms.</p>

      <h5 class="fw-bold mt-3">4. Grievance Redressal</h5>
      <p class="small text-muted mb-0">For privacy inquiries or data requests, contact our Grievance Officer at <strong>ps.societysolutions@gmail.com</strong> or call <strong>+91 8866376056</strong>.</p>
    </div>
  `;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function openQRModal() { new bootstrap.Modal(document.getElementById('qrModal')).show(); }

function renderTeam() {
  const tbody = document.getElementById('team-list');
  if (!tbody) return;
  tbody.innerHTML = teamData.map(member => `
    <tr>
      <td><strong>${member.name || '-'}</strong></td>
      <td>${member.mobile ? `<a href="tel:${member.mobile}">${member.mobile}</a>` : '-'}</td>
      <td>${member.role || '-'}</td>
      <td><span class="badge ${member.type === 'Emergency' ? 'bg-danger' : 'bg-primary'}">${member.type || 'Committee'}</span></td>
      <td class="no-print admin-only ${currentRole !== 'Admin' && currentRole !== 'SocietyAdmin' ? 'd-none' : ''}">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTeamMember(${member.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function renderAboutTab() {
  const body = document.getElementById('aboutTabBody');
  if (body) {
    body.innerHTML = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; text-align: left; line-height: 1.7;">
        
        <div class="text-center mb-4 pb-3 border-bottom">
          <h3 class="fw-bold mb-1"><span style="color: #f59e0b;">PS</span> Society Solutions</h3>
          <p class="text-primary fw-semibold small mb-0">Smart Society Management Engine • Simple • Transparent • Affordable</p>
        </div>

        <h5 class="fw-bold text-dark mb-3">🏷️ Subscription Plans (Per House / Month)</h5>
        <div class="row g-2 mb-4 text-center">
          <div class="col-4"><div class="p-2 border rounded-3 bg-light"><span class="badge bg-secondary mb-1">SILVER</span><h5 class="fw-bold mb-0 text-dark">₹49</h5><small class="text-muted" style="font-size: 10px;">Digital Accounting</small></div></div>
          <div class="col-4"><div class="p-2 border border-warning rounded-3 bg-warning-subtle"><span class="badge bg-warning text-dark mb-1">GOLD</span><h5 class="fw-bold mb-0 text-dark">₹79</h5><small class="text-muted" style="font-size: 10px;">Accounting + Visits</small></div></div>
          <div class="col-4"><div class="p-2 border border-primary rounded-3 bg-primary-subtle"><span class="badge bg-primary mb-1">PLATINUM</span><h5 class="fw-bold mb-0 text-dark">₹149</h5><small class="text-muted" style="font-size: 10px;">Complete Operations</small></div></div>
        </div>

        <h5 class="fw-bold text-dark mb-2">✨ What Your Society Gets</h5>
        <ul class="small text-muted ps-3 mb-4">
          <li>📊 <strong>Digital Accounting:</strong> Member ledgers, automated collection tracking & vouchers.</li>
          <li>📑 <strong>CA-Ready Audit Records:</strong> Automatic Balance Sheet & Trial Balance generation.</li>
          <li>📢 <strong>WhatsApp Reminders:</strong> Direct 1-click pending payment alerts to defaulters.</li>
          <li>🛡️ <strong>Zero Cash Handling:</strong> Complete bank & QR transparency with Society's own accounts.</li>
          <li>👥 <strong>Committee & Staff Support:</strong> Vendor AMC tracking, security logs & complaint tickets.</li>
        </ul>

        <div class="p-3 bg-light rounded-3 text-center border mb-4">
          <p class="small text-muted mb-2">📞 Call / WhatsApp: <strong>+91 8866376056</strong> | 📍 Vadodara, Gujarat</p>
          <div class="d-flex justify-content-center gap-2">
            <a href="https://wa.me/918866376056" target="_blank" class="btn btn-success btn-sm px-3 fw-semibold"><i class="fa-brands fa-whatsapp me-1"></i> WhatsApp</a>
            <a href="tel:8866376056" class="btn btn-primary btn-sm px-3 fw-semibold"><i class="fa-solid fa-phone me-1"></i> Call Us</a>
          </div>
        </div>
      </div>
    `;
  }
}

async function loadSocietiesList() {
  const tbody = document.getElementById('societies-list');
  if (!tbody) return;
  const { data } = await _supabase.from('societies').select('*').order('name');
  allSocieties = data || [];
  if (allSocieties.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No societies found.</td></tr>`;
    return;
  }
  tbody.innerHTML = allSocieties.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.address || '-'}</td>
      <td>${s.phone ? `<a href="tel:${s.phone}">${s.phone}</a>` : '-'}</td>
      <td><span class="badge ${s.is_active ? 'bg-success' : 'bg-secondary'}">${s.is_active ? 'Active' : 'Inactive'}</span></td>
      <td><button class="btn btn-sm btn-outline-primary" onclick="switchSociety('${s.name}')"><i class="fa-solid fa-arrow-right me-1"></i> Switch</button></td>
    </tr>
  `).join('');
}

function openAddSocietyModal() { new bootstrap.Modal(document.getElementById('addSocietyModal')).show(); }

async function addNewSociety(event) {
  event.preventDefault();
  const name = document.getElementById('society-name').value.trim();
  const address = document.getElementById('society-address').value.trim();
  const phone = document.getElementById('society-phone').value.trim();
  const email = document.getElementById('society-email').value.trim();
  const openingBalanceVal = document.getElementById('society-opening-balance').value.trim() || '0';
  const visitorPassword = document.getElementById('society-visitor-password').value.trim() || '1234';
  const planVal = document.getElementById('society-plan-select').value;
  const [planName, planRate] = planVal.split('|');

  const newSoc = { name, address, phone, email, is_active: true, subscription_plan: planName, per_house_rate: Number(planRate) };

  const { error } = await _supabase.from('societies').insert([newSoc]);
  if (error) { alert('Error: ' + error.message); return; }

  const settingsBatch = [
    { key: 'visitor_password', value: visitorPassword, society_name: name },
    { key: 'opening_bank_balance', value: openingBalanceVal, society_name: name }
  ];

  for (const setting of settingsBatch) {
    await _supabase.from('society_settings').upsert(setting, { onConflict: 'key,society_name' });
  }

  alert(`✅ Society "${name}" added successfully with ${planName} Plan!`);
  bootstrap.Modal.getInstance(document.getElementById('addSocietyModal')).hide();
  document.getElementById('addSocietyForm').reset();
  loadSocietySwitcher();
  renderSuperAdminMasterDashboard();
}

// ⚠️ DEPRECATED — Not called anywhere. Kept for reference only.
// Logic is now handled inside updateAllBadges()
function checkForNewNotifications() {
  if (localStorage.getItem('ps_user_logged') !== 'true') return;
  const lastSeenNotice = parseInt(localStorage.getItem('ps_last_seen_notice') || '0');
  const lastSeenPoll = parseInt(localStorage.getItem('ps_last_seen_polls') || '0');
  let count = 0;
  if (noticesData.length > 0) count += noticesData.filter(n => (n.id || 0) > lastSeenNotice).length;
  if (pollsData.length > 0) count += pollsData.filter(p => (p.id || 0) > lastSeenPoll).length;
  updateBadge('notification-badge', count);
}

async function updateAllBadges() {
  if (!currentSociety) return;

  try {
    if (currentRole === 'Admin' || currentRole === 'SocietyAdmin' || currentRole === 'Chairman') {
      const lastSeenMaint = parseInt(localStorage.getItem('ps_last_seen_maintenance') || '0');
      const newMaintCount = maintenanceData.filter(r => (r.id || 0) > lastSeenMaint).length;
      updateBadge('maintenance-badge', newMaintCount);

      const lastSeenProof = parseInt(localStorage.getItem('ps_last_seen_proofs') || '0');
      const newProofCount = paymentProofs.filter(p => (p.id || 0) > lastSeenProof).length;
      updateBadge('proofs-badge', newProofCount);

      const lastSeenComp = parseInt(localStorage.getItem('ps_last_seen_complaints') || '0');
      const newCompCount = complaintData.filter(c => (c.id || 0) > lastSeenComp && c.status === 'Pending').length;
      updateBadge('complaints-badge', newCompCount);
    }

    const lastSeenPoll = parseInt(localStorage.getItem('ps_last_seen_polls') || '0');
    const newPollsCount = pollsData.filter(p => (p.id || 0) > lastSeenPoll).length;

    const lastSeenNotice = parseInt(localStorage.getItem('ps_last_seen_notice') || '0');
    const newNoticesCount = noticesData.filter(n => {
      const isTargeted = !n.target_members || n.target_members.length === 0 || n.target_members.includes(currentUser);
      return (n.id || 0) > lastSeenNotice && isTargeted;
    }).length;

    const totalNotificationCount = newPollsCount + newNoticesCount;
    updateBadge('polls-badge', newPollsCount);
    
    const notifBadge = document.getElementById('notification-badge');
    if (notifBadge) {
      notifBadge.textContent = totalNotificationCount;
      notifBadge.style.display = totalNotificationCount > 0 ? 'inline-block' : 'none';
    }
// ✅ FIX 1: Ye 5 badges bhi refresh honge — zero extra cost
    if (typeof updateVisitorBadge === 'function') updateVisitorBadge();
    if (typeof updateSupportBadge === 'function') updateSupportBadge();
    if (typeof updateCommunityBadge === 'function') updateCommunityBadge();

    const amcExpiringSoon = (amcContractsData || []).filter(c => {
      const diffDays = Math.ceil((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    updateBadge('amc-badge', amcExpiringSoon > 0 ? '🔔' : 0);

    const parkingPending = (parkingData || []).filter(p => p.status === 'Pending').length;
    updateBadge('parking-badge', parkingPending > 0 ? parkingPending : 0);

  } catch (err) { console.error('Error loading badges:', err); }
}

function updateBadge(elementId, count) {
  const badge = document.getElementById(elementId);
  if (!badge) return;
  if (count > 0 || count === '🔔') { 
    badge.textContent = count; 
    badge.style.display = 'inline-block'; 
  } else { 
    badge.style.display = 'none'; 
  }
  
  // ✅ Mobile grid badge भी sync करो
  syncMobileGridBadges();
}

function updateCommunityBadge() {
  const lastRead = parseInt(localStorage.getItem('ps_last_community_read') || '0');
  let count = 0;
  if (eventsData.length > 0) count += eventsData.filter(e => (e.id || 0) > lastRead).length;
  if (noticesData.length > 0) count += noticesData.filter(n => (n.id || 0) > lastRead && (!n.deep_link || n.deep_link.trim() === '')).length;
  updateBadge('community-badge', count);
}

function markCommunityRead() {
  let maxId = 0;
  if (eventsData.length > 0) maxId = Math.max(maxId, ...eventsData.map(e => e.id || 0));
  if (noticesData.length > 0) maxId = Math.max(maxId, ...noticesData.map(n => n.id || 0));
  localStorage.setItem('ps_last_community_read', maxId.toString());
  localStorage.setItem('ps_last_seen_notice', maxId.toString());
  updateBadge('community-badge', 0);

  // ✅ FIX 2: notification-badge ko 0 mat karo — polls pending ho sakte hain
  const lastSeenPoll = parseInt(localStorage.getItem('ps_last_seen_polls') || '0');
  const newPollsCount = pollsData.filter(p => (p.id || 0) > lastSeenPoll).length;
  updateBadge('notification-badge', newPollsCount);
}

async function openVisitorPassword() {
  await loadSocietiesForDropdown('visitor-password-society');
  document.getElementById('visitorPasswordOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeVisitorPassword() {
  document.getElementById('visitorPasswordOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

async function verifyVisitorPassword(event) {
  event.preventDefault();
  const society = document.getElementById('visitor-password-society').value;
  const password = document.getElementById('visitor-password-input').value.trim();
  if (!society || !password) { alert('Please select society and enter password.'); return; }

  const { data } = await _supabase.from('society_settings').select('value').eq('key', 'visitor_password').eq('society_name', society).maybeSingle();
  const storedPassword = data?.value || '1234';
  
  if (password !== storedPassword) { alert('❌ Incorrect password. Please try again.'); return; }

  currentSociety = society;
  closeVisitorPassword();
  document.getElementById('landing-section').style.display = 'none';
  document.getElementById('visitor-section').style.display = 'block';
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('app-section').classList.add('d-none');
  updateFloatingButtonsVisibility(false);
  
    const backBtn = document.getElementById('visitorBackBtn');
  if (backBtn) backBtn.onclick = showLandingPage;
  loadTodayVisitors();
  setupVisitorRealtimeForGuard();
}

async function loadFlatsDropdown() {
  const select = document.getElementById('visitor-flat');
  if (!select) return;
  
  select.innerHTML = '<option value="">⏳ Loading flats...</option>';
  
  // ✅ Use RPC function (anon-friendly, sirf flat_no dega)
  const { data, error } = await _supabase.rpc('get_society_flats', {
    p_society_name: currentSociety
  });

  if (error) {
    console.error('[loadFlatsDropdown] RPC error:', error.message);
    select.innerHTML = '<option value="">❌ Failed to load flats</option>';
    return;
  }

  select.innerHTML = '<option value="">-- Select Flat --</option>';
  (data || []).forEach(m => {
    select.innerHTML += `<option value="${m.flat_no}">${m.flat_no}</option>`;
  });
  
  console.log(`[loadFlatsDropdown] Loaded ${(data || []).length} flats`);
}

function openUPIPayment() {
  // ✅ Fallback chain: bank_acc_name → society_name → currentSociety → 'Society'
  const accName = societySettings.bank_acc_name 
                || societySettings.society_name 
                || currentSociety 
                || 'Society';
  
  const merchantEl = document.getElementById('upi-merchant-display');
  if (merchantEl) {
    merchantEl.innerText = accName;
  }
  
  // ✅ Auto-fill amount with member's actual pending due
  let prefillAmount = '1000';  // Default fallback
  try {
    const pendingEl = document.getElementById('my-flat-pending');
    if (pendingEl) {
      // Text like "3401" or "3401 (Incl. Late Fee: ₹60)" — extract first number
      const match = pendingEl.innerText.match(/(\d+)/);
      if (match && Number(match[1]) > 0) {
        prefillAmount = match[1];
      }
    }
  } catch (e) {
    console.warn('[UPI] Could not read pending amount:', e);
  }
  
  document.getElementById('upi-amount').value = prefillAmount;
  new bootstrap.Modal(document.getElementById('upiPaymentModal')).show();
}

function processUPIPayment() {
  const isDemo = (currentSociety === 'Demo Society');
  const upiId = societySettings.bank_upi_id || (isDemo ? '8866376056@icici' : '');
  const name = societySettings.bank_acc_name 
             || societySettings.society_name 
             || currentSociety 
             || 'Society';

  // ✅ UPI nahi hai to payment mat karo
  if (!upiId) {
    alert('❌ Is society ka UPI ID set nahi hai.\n\nPlease admin se contact karein.');
    return;
  }

  const amount = parseFloat(document.getElementById('upi-amount').value || 1000).toFixed(2);
  const note = document.getElementById('upi-note').value || 'Maintenance';
  window.location.href = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}

async function loadDeletionRequests() {
  if (currentRole !== 'Admin') return;
  const { data } = await _supabase.from('deletion_requests').select('*').eq('society_name', currentSociety).order('requested_at', { ascending: false });
  deletionRequests = data || [];
}

function renderDeletionRequests() {
  const tbody = document.getElementById('deletion-requests-list');
  if (!tbody || currentRole !== 'Admin') return;
  if (!deletionRequests || deletionRequests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No deletion requests found.</td></tr>`;
    return;
  }
  tbody.innerHTML = deletionRequests.map(r => {
    const isPending = r.status === 'Pending';
    const statusBadge = isPending 
      ? '<span class="badge bg-warning text-dark">Pending</span>' 
      : (r.status === 'Approved' ? '<span class="badge bg-success">Approved</span>' : '<span class="badge bg-danger">Rejected</span>');
    
    return `
      <tr>
        <td><b>${r.flat_no}</b></td>
        <td>${new Date(r.requested_at).toLocaleDateString()}</td>
        <td>${statusBadge}</td>
        <td class="no-print">
          ${isPending ? `
            <button class="btn btn-sm btn-success me-1" onclick="processDeletionRequest(${r.id}, 'Approved')"><i class="fa-solid fa-check"></i> Approve</button>
            <button class="btn btn-sm btn-danger" onclick="processDeletionRequest(${r.id}, 'Rejected')"><i class="fa-solid fa-times"></i> Reject</button>
          ` : (r.status === 'Approved' ? '<span class="text-success small fw-bold">✓ Approved</span>' : '<span class="text-danger small fw-bold">✗ Rejected</span>')}
        </td>
      </tr>
    `;
  }).join('');
}

async function requestDataDeletion() {
  if (!confirm('⚠️ Are you sure you want to request data deletion?')) return;
  await _supabase.from('deletion_requests').insert([{ flat_no: currentUser, requested_at: new Date().toISOString(), status: 'Pending', society_name: currentSociety }]);
  alert('✅ Request submitted to admin.');
}

async function processDeletionRequest(id, status) {
  if (!confirm(`Are you sure you want to ${status} this request?`)) return;
  await _supabase.from('deletion_requests').update({ status }).eq('id', id);
  await loadDeletionRequests();
  renderDeletionRequests();
}

async function triggerSOS(alertType) {
  if (!confirm(`🚨 क्या आप सच में ${alertType.toUpperCase()} इमरजेंसी अलर्ट ट्रिगर करना चाहते हैं?`)) return;
  try {
    const newAlert = {
      society_name: currentSociety,
      flat_no: currentUser || 'Unknown',
      user_role: currentRole || 'Member',
      alert_type: alertType,
      status: 'active',
      created_at: new Date().toISOString()
    };
    const { error } = await _supabase.from('sos_alerts').insert([newAlert]);
    if (error) alert('❌ SOS Failed: ' + error.message);
    else alert(`🚨 ${alertType} SOS Alert Sent!`);
  } catch (err) { console.error(err); }
}

function showSOSBanner(alertData) {
  const existingBanner = document.getElementById('sosAlertBanner');
  if (existingBanner) existingBanner.remove();

  const banner = document.createElement('div');
  banner.id = 'sosAlertBanner';
  banner.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(220, 38, 38, 0.95); z-index: 2147483647; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; text-align: center; padding: 20px; font-family: 'Plus Jakarta Sans', sans-serif; pointer-events: auto !important;`;
  
  banner.innerHTML = `
    <div style="font-size: 80px; margin-bottom: 20px;"><i class="fa-solid fa-triangle-exclamation fa-beat" style="pointer-events: none;"></i></div>
    <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 10px;">🚨 EMERGENCY SOS ALERT! 🚨</h1>
    <h3 style="font-weight: 700; margin-bottom: 15px; background: rgba(0,0,0,0.3); padding: 10px 20px; border-radius: 50px;">
      Type: ${alertData.alert_type || 'Medical'} | Flat: ${alertData.flat_no || 'A-101'}
    </h3>
    <p style="font-size: 1.1rem; margin-bottom: 30px; max-width: 500px;">इमरजेंसी अलर्ट ट्रिगर किया गया है! कृपया तुरंत सहायता भेजें या एक्शन लें।</p>
    <button type="button" id="stopSirenBtn" style="background: #fff; color: #dc2626; border: none; padding: 16px 45px; font-size: 18px; font-weight: 800; border-radius: 50px; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.4); pointer-events: auto !important; touch-action: manipulation; position: relative; z-index: 2147483647;">
      <i class="fa-solid fa-check-circle me-2" style="pointer-events: none;"></i> Acknowledge & Stop Siren
    </button>
  `;
  
  document.body.appendChild(banner);

  const stopBtn = document.getElementById('stopSirenBtn');
  if (stopBtn) {
    const handleStop = (e) => { if (e) { e.preventDefault(); e.stopPropagation(); } resolveSOSAlert(alertData.id || 0); };
    stopBtn.onclick = handleStop;
    stopBtn.ontouchend = handleStop;
  }

  try { sirenAudio.loop = true; sirenAudio.play().catch(e => { console.log("Audio autoplay restricted:", e); }); } catch (err) { console.log("Siren error:", err); }
  if ("vibrate" in navigator) { try { navigator.vibrate([500, 250, 500, 250, 500, 250, 1000]); } catch (e) { console.log("Vibration error:", e); } }
}

async function resolveSOSAlert(alertId) {
  try { if (alertId) { await _supabase.from('sos_alerts').update({ status: 'resolved' }).eq('id', alertId); } } catch (err) { console.error('Error resolving SOS:', err); }
  if (typeof sirenAudio !== 'undefined' && sirenAudio) { sirenAudio.pause(); sirenAudio.currentTime = 0; }
  const banner = document.getElementById('sosAlertBanner');
  if (banner) banner.remove();
}

window.resolveSOSAlert = resolveSOSAlert;

function listenForSOSAlerts() {
  const cleanSocietyName = (currentSociety || 'default').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const channelName = `sos-realtime-${cleanSocietyName}`;

  try {
    const allChannels = _supabase.getChannels();
    allChannels.forEach(ch => { if (ch.topic && ch.topic.includes('sos-realtime-')) { _supabase.removeChannel(ch); } });
  } catch (e) { console.log('SOS channel cleanup note:', e); }

  const channel = _supabase.channel(channelName);

  channel
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts' }, (payload) => {
      if (payload.new && payload.new.status === 'active') {
        if ((payload.new.society_name || '').trim().toLowerCase() === (currentSociety || '').trim().toLowerCase()) { showSOSBanner(payload.new); }
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') { console.log('✅ SOS Realtime: Connected successfully'); }
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { console.log('⚠️ SOS Realtime status:', status); }
    });
}

function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  let tab = params.get('tab');
  const section = params.get('section');

  if (!tab && !section) return;
  if (tab === 'notice' || tab === 'notices') tab = 'community';
  if (!tab) tab = 'dashboard';

  if (section === 'myPaymentSubmissionsCard') { tab = 'dashboard'; }

  let attempts = 0;
  const MAX_ATTEMPTS = 50;
  __userClosedOverlay = false;

  const tryOpen = async () => {
    attempts++;

    const loggedIn = localStorage.getItem('ps_user_logged') === 'true';
    if (!loggedIn) { if (attempts < MAX_ATTEMPTS) return setTimeout(tryOpen, 300); return; }

    const storedSociety = localStorage.getItem('ps_user_society');
    if (storedSociety && currentSociety !== storedSociety) currentSociety = storedSociety;
    if (!currentSociety) { if (attempts < MAX_ATTEMPTS) return setTimeout(tryOpen, 300); return; }

    const appSection = document.getElementById('app-section');
    if (!appSection || appSection.classList.contains('d-none')) {
      if (attempts < MAX_ATTEMPTS) return setTimeout(tryOpen, 300);
      return;
    }

    try {
      if (tab === 'polls') {
        const { data } = await _supabase.from('polls').select('*').eq('society_name', currentSociety);
        pollsData = data || [];
        renderPolls();
      } else if (tab === 'community') {
        const [{ data: n }, { data: e }, { data: f }, { data: b }] = await Promise.all([
          _supabase.from('notices').select('*').eq('society_name', currentSociety),
          _supabase.from('events').select('*').eq('society_name', currentSociety),
          _supabase.from('facilities').select('*').eq('society_name', currentSociety).eq('is_active', true),
          _supabase.from('facility_bookings').select('*').eq('society_name', currentSociety)
        ]);
        noticesData = n || []; eventsData = e || [];
        facilitiesData = f || []; bookingsData = b || [];
        renderCommunity();
      } else if (tab === 'dashboard') {
        const [{ data: proofs }, { data: mnt }] = await Promise.all([
          _supabase.from('payment_proofs').select('*').eq('society_name', currentSociety),
          _supabase.from('maintenance_payments').select('*').eq('society_name', currentSociety)
        ]);
        if (proofs) paymentProofs = proofs;
        if (mnt) maintenanceData = mnt;
        renderMyPaymentSubmissions();
        renderMemberPersonalView();
      } else if (tab === 'marketplace') {
        await fetchMarketplaceData(); renderMarketplace();
      } else if (tab === 'complaints') {
        const { data } = await _supabase.from('complaints').select('*').eq('society_name', currentSociety);
        complaintData = data || []; renderComplaints();
      } else if (tab === 'proofs') {
        const { data } = await _supabase.from('payment_proofs').select('*').eq('society_name', currentSociety);
        paymentProofs = data || []; renderPaymentProofs();
      } else if (tab === 'meetings') {
        const { data } = await _supabase.from('society_meetings').select('*').eq('society_name', currentSociety);
        meetingsData = data || []; renderMeetings();
      }
    } catch (err) { console.error('[DeepLink] fetch error:', err); }

    if (typeof clearStuckOverlays === 'function') clearStuckOverlays();
    const gridOverlay = document.getElementById('mobileMenuOverlay');
    if (gridOverlay) gridOverlay.style.display = 'none';
    document.body.style.overflow = '';

    if (tab === 'visitor') { showVisitorPage(); return; }

    __deepLinkLock = true;
    setTimeout(() => { __deepLinkLock = false; console.log('[DeepLink] Lock released'); }, 15000);

    console.log('[DeepLink] Opening tab:', tab);

    if (window.innerWidth <= 768) { openTabOverlay(tab, true); }
    else {
      const link = document.querySelector(`.nav-link[onclick*="switchTab('${tab}')"]`);
      if (link) switchTab(tab, link);
    }

    let watchdogTick = 0;
    const watchdog = setInterval(() => {
      watchdogTick++;
      if (watchdogTick > 35 || __userClosedOverlay === true) {
        clearInterval(watchdog);
        console.log('[DeepLink] Watchdog stopped. Reason:', __userClosedOverlay ? 'user closed' : 'timeout');
        return;
      }
      const ov = document.getElementById('tabOverlay');
      if (!ov && window.innerWidth <= 768) {
        console.log('[DeepLink] ⚠️ Overlay missing! Re-opening...');
        openTabOverlay(tab, true);
      }
    }, 400);

    if (section) {
      setTimeout(async () => {
        if (section === 'myPaymentSubmissionsCard') {
          try {
            const { data: proofs } = await _supabase.from('payment_proofs').select('*').eq('society_name', currentSociety);
            if (proofs) paymentProofs = proofs;
            renderMyPaymentSubmissions();
          } catch (e) { console.log(e); }
        }
        
        const el = document.getElementById(section);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.style.transition = 'box-shadow 0.3s';
          el.style.boxShadow = '0 0 0 4px #f59e0b';
          setTimeout(() => { el.style.boxShadow = ''; }, 3000);
        }
      }, 800);
    }
  };

  setTimeout(tryOpen, 700);
}

document.addEventListener('show.bs.modal', function (event) {
  window.history.pushState({ modalOpen: true }, "", window.location.href);
});

// ✅ NEW — Change Password modal band hone pe grid wapas restore karo
document.addEventListener('hidden.bs.modal', function (event) {
  if (event.target && event.target.id === 'changePasswordModal') {
    if (__changePasswordFromGrid) {
      __changePasswordFromGrid = false;
      if (window.innerWidth <= 768) {
        const gridOverlay = document.getElementById('mobileMenuOverlay');
        if (gridOverlay) {
          renderGridCards();
          gridOverlay.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      }
    }
  }
});

window.addEventListener('popstate', function(event) {
  // ✅ Sabse pehle programmatic flag capture + reset karo
  const wasProgrammatic = __programmaticBack;
  __programmaticBack = false;

  if (__deepLinkLock === true) {
    console.log('[DeepLink] popstate ignored during lock');
    return;
  }

  // Apne hi history.back() se aaya hai — skip karo
  if (wasProgrammatic) {
    console.log('[Popstate] Skipped (programmatic back from closeTabOverlay)');
    return;
  }

  const tabOverlay       = document.getElementById('tabOverlay');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const visitorSection   = document.getElementById('visitor-section');

    // ---------- 1. VISITOR SECTION ----------
  if (visitorSection && visitorSection.style.display === 'block') {
    visitorSection.style.display = 'none';
    document.body.style.overflow = '';

    cleanupVisitorRealtimeForGuard();

    if (localStorage.getItem('ps_user_logged') === 'true') {
      const appSection = document.getElementById('app-section');
      if (appSection) appSection.classList.remove('d-none');

      if (window.innerWidth <= 768 && mobileMenuOverlay) {
        mobileMenuOverlay.style.display = 'flex';
        renderGridCards();
        document.body.style.overflow = 'hidden';
      } else {
        const dashboardLink = document.querySelector('.nav-link[onclick*="dashboard"]');
        if (dashboardLink) switchTab('dashboard', dashboardLink);
      }
    } else {
      showLandingPage();
    }
    return;
  }

  // ---------- 2. OPEN MODAL ----------
  const openModal = document.querySelector('.modal.show');
  if (openModal) {
    const inst = bootstrap.Modal.getInstance(openModal);
    if (inst) inst.hide();
    return;
  }

  // ---------- 3. TAB OVERLAY ----------
if (tabOverlay) {
  __userClosedOverlay = true;
  
  // ✅ GRID PEHLE show karo (white flash avoid karne ke liye)
  if (window.innerWidth <= 768 && mobileMenuOverlay) {
    renderGridCards();
    mobileMenuOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  
  // ✅ AB tab overlay content wapas main mein bhejo
  const movedContent = tabOverlay.querySelector('.tab-content[data-in-overlay="true"]');
  if (movedContent) {
    movedContent.classList.add('d-none');
    movedContent.removeAttribute('data-in-overlay');
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.appendChild(movedContent);
  }
  tabOverlay.remove();
  
  if (window.innerWidth > 768) {
    document.body.style.overflow = '';
    const dashboardLink = document.querySelector('.nav-link[onclick*="dashboard"]');
    if (dashboardLink) switchTab('dashboard', dashboardLink);
  }
  return;
}

    // ---------- 4. MOBILE MENU OVERLAY (grid) ----------
  if (mobileMenuOverlay && mobileMenuOverlay.style.display === 'flex') {
    mobileMenuOverlay.style.display = 'none';
    document.body.style.overflow = '';
    return;
  }

  // Else: dashboard par hai, kuch nahi karna (app exit ho jayega naturally)
});

function renderCelebrations() {
  const container = document.getElementById('dashboard-celebrations-container');
  if (!container) return;
  const today = new Date();
  const monthDay = `-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const birthdays = membersData.filter(m => m.dob && m.dob.endsWith(monthDay));
  const anniversaries = membersData.filter(m => m.anniversary_date && m.anniversary_date.endsWith(monthDay));

  if (birthdays.length === 0 && anniversaries.length === 0) { container.innerHTML = ''; return; }

  let html = `<div class="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-warning-subtle"><h6 class="fw-bold text-dark mb-2">🎉 Today's Celebrations</h6>`;
  birthdays.forEach(m => {
    const msg = `Happy Birthday ${m.name}! 🎂 - PS Society`;
    html += `<div class="d-flex justify-content-between align-items-center bg-white p-2 rounded mb-1"><strong>🎂 ${m.name} (${m.flat_no})</strong> ${m.phone ? `<button class="btn btn-sm btn-success" onclick="sendWhatsAppReminder('${m.phone}', '${msg}')">Wish</button>` : ''}</div>`;
  });
  anniversaries.forEach(m => {
    const msg = `Happy Anniversary ${m.name}! 💍 - PS Society`;
    html += `<div class="d-flex justify-content-between align-items-center bg-white p-2 rounded mb-1"><strong>💍 ${m.name} (${m.flat_no})</strong> ${m.phone ? `<button class="btn btn-sm btn-success" onclick="sendWhatsAppReminder('${m.phone}', '${msg}')">Wish</button>` : ''}</div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}

async function fetchMarketplaceData() {
  const { data } = await _supabase.from('marketplace_posts').select('*').eq('society_name', currentSociety).order('created_at', { ascending: false });
  marketplaceData = data || [];
}

function renderMarketplace() {
  const container = document.getElementById('marketplace-container');
  if (!container) return;
  if (!marketplaceData.length) { container.innerHTML = `<div class="col-12 text-center text-muted p-4">No marketplace listings yet.</div>`; return; }
  
  const canDelete = currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin';

  container.innerHTML = marketplaceData.map(item => `
    <div class="col-md-4">
      <div class="card p-3 shadow-sm border-0 rounded-4">
        <span class="badge bg-primary mb-2" style="width:fit-content;">${item.category}</span>
        <h6 class="fw-bold">${item.title}</h6>
        <p class="small text-muted mb-1">${item.price} | Flat: ${item.flat_no}</p>
        <p class="small">${item.description || ''}</p>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-sm btn-success" onclick="sendWhatsAppReminder('${item.contact_phone}', 'Hi, regarding your post ${item.title}: ')"><i class="fa-brands fa-whatsapp me-1"></i> Contact</button>
          ${canDelete ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteMarketplacePost(${item.id})"><i class="fa-solid fa-trash"></i> Delete</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

async function deleteMarketplacePost(id) {
  if (!confirm('⚠️ Are you sure you want to delete this marketplace post?')) return;
  const { error } = await _supabase.from('marketplace_posts').delete().eq('id', id);
  if (error) { alert('❌ Error: ' + error.message); }
  else { alert('✅ Post deleted successfully!'); fetchMarketplaceData().then(renderMarketplace); }
}

async function submitMarketplacePost(event) {
  event.preventDefault();
  const newPost = {
    society_name: currentSociety, flat_no: currentUser,
    title: document.getElementById('market-title').value,
    category: document.getElementById('market-category').value,
    price: Number(document.getElementById('market-price').value),
    contact_phone: document.getElementById('market-phone').value,
    description: document.getElementById('market-desc').value,
    status: 'Approved', created_at: new Date().toISOString()
  };
  await _supabase.from('marketplace_posts').insert([newPost]);
  alert('✅ Posted successfully!');
  bootstrap.Modal.getInstance(document.getElementById('marketplaceModal')).hide();
  fetchMarketplaceData().then(renderMarketplace);
}

function calculateLateFee(flatPendingDue, monthlyRate) {
  const isLateFeeEnabled = societySettings.enable_late_fee === 'true';
  if (!isLateFeeEnabled || flatPendingDue <= 0) return 0;

  const lateFeeType = societySettings.late_fee_type || 'fixed'; 
  const customRate = Number(societySettings.late_fee_amount || 0);

  let calculatedLateFee = 0;
  if (lateFeeType === 'fixed') {
    const rate = Number(monthlyRate || 600);
    const pendingMonths = Math.ceil(flatPendingDue / rate); 
    calculatedLateFee = customRate * Math.max(1, pendingMonths); 
  } else if (lateFeeType === 'percentage') {
    calculatedLateFee = (flatPendingDue * customRate) / 100; 
  }
  return Math.round(calculatedLateFee);
}

function forceResetScreen() {
  const activeModals = document.querySelectorAll('.modal.show');
  if (activeModals.length > 0) return;
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

  const overlays = ['tabOverlay', 'consentOverlay', 'mobileMenuOverlay', 'visitorPasswordOverlay', 'aboutPSOverlay', 'privacyPolicyOverlay', 'termsOfServiceOverlay'];
  overlays.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });

  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.pointerEvents = 'auto';
}

function clearStuckOverlays() {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  
  const overlays = ['tabOverlay', 'consentOverlay', 'mobileMenuOverlay', 'visitorPasswordOverlay', 'aboutPSOverlay', 'privacyPolicyOverlay', 'termsOfServiceOverlay'];
  overlays.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'mobileMenuOverlay' || id === 'visitorPasswordOverlay' || id === 'aboutPSOverlay' || id === 'privacyPolicyOverlay' || id === 'termsOfServiceOverlay') { el.style.display = 'none'; }
      else { el.remove(); }
    }
  });

  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
}

// ==================== MULTI-TAB LOGOUT SYNC ====================
// Jab ek tab mein logout hota hai → dusre tabs bhi auto logout ho jayen
window.addEventListener('storage', (event) => {
  if (event.key === 'ps_logout_broadcast' && event.newValue) {
    console.log('[Multi-Tab] Logout detected from another tab — syncing...');
    
    // Prevent infinite loop — don't re-broadcast
    localStorage.removeItem('ps_user_logged');
    localStorage.removeItem('ps_user_role');
    localStorage.removeItem('ps_user_id');
    localStorage.removeItem('ps_user_society');
    
    // Cleanup
    if (typeof __proofRealtimeChannel !== 'undefined' && __proofRealtimeChannel) {
      try { _supabase.removeChannel(__proofRealtimeChannel); } catch(e) {}
    }
    if (typeof cleanupVisitorRealtimeForGuard === 'function') {
      cleanupVisitorRealtimeForGuard();
    }
    if (typeof clearStuckOverlays === 'function') {
      clearStuckOverlays();
    }
    
    // Redirect to landing page (fresh state)
    const baseUrl = window.location.origin + window.location.pathname;
    window.location.replace(baseUrl + '?t=' + Date.now());
  }
});

// ═══════════════════════════════════════════════════
// 🎫 SUPPORT TICKET SYSTEM
// ═══════════════════════════════════════════════════

let supportTicketsData = [];
let __currentSupportTicketId = null;

async function loadSupportTickets() {
  try {
    // ✅ Base: society filter always
    let query = _supabase
      .from('support_tickets')
      .select('*')
      .eq('society_name', currentSociety)
      .order('created_at', { ascending: false });

    // ✅ Extra tight filter for Member/Chairman — only their own
    if (currentRole === 'Member' || currentRole === 'Chairman') {
      query = query.eq('raised_by_flat', (currentUser || '').toUpperCase());
    }

    const { data, error } = await query;
    if (error) { console.warn('[Support] Load error:', error.message); supportTicketsData = []; return; }
    supportTicketsData = data || [];
    updateSupportBadge();
  } catch (e) {
    console.error('[Support] Exception:', e);
    supportTicketsData = [];
  }
}

function renderSupportTickets() {
  const tbody = document.getElementById('support-tickets-list');
  if (!tbody) return;

    const isAdmin = currentRole === 'Admin' || currentRole === 'SocietyAdmin';   // ✅ YE

  // ✅ Data already society-filtered (see loadSupportTickets)
  // Now apply role-based filter on top
  let tickets = supportTicketsData;

  if (currentRole === 'Member' || currentRole === 'Chairman') {
    // Members/Chairman see ONLY their own tickets
    tickets = tickets.filter(t => (t.raised_by_flat || '').toUpperCase() === (currentUser || '').toUpperCase());
  }
  // Admin / SocietyAdmin: see ALL tickets of THIS society (already filtered)

  const filter = document.getElementById('support-filter-status')?.value || 'all';
  if (filter !== 'all') tickets = tickets.filter(t => t.status === filter);

  if (tickets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isAdmin ? 8 : 7}" class="text-center text-muted py-4">
      <i class="fa-solid fa-inbox fa-2x d-block mb-2"></i>
      No support tickets ${filter !== 'all' ? 'with this status' : 'yet'}.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = tickets.map(t => {
    const statusColor =
      t.status === 'Open' ? 'warning text-dark' :
      t.status === 'In Progress' ? 'info text-dark' :
      t.status === 'Resolved' ? 'success' : 'secondary';
    const priorityColor =
      t.priority === 'Urgent' ? 'danger' :
      t.priority === 'High' ? 'warning text-dark' :
      t.priority === 'Medium' ? 'primary' : 'secondary';

    return `
      <tr>
        <td><b>#${String(t.id).padStart(4,'0')}</b></td>
        ${isAdmin ? `<td><small>${t.society_name || '-'}</small></td>` : ''}
        <td><b>${t.raised_by_flat || '-'}</b><br><small class="text-muted">${t.raised_by_name || ''}</small></td>
        <td>
          <b>${t.subject}</b>
          <br><small class="text-muted">${t.category || '-'}</small>
        </td>
        <td><span class="badge bg-${priorityColor}">${t.priority || 'Medium'}</span></td>
        <td><span class="badge bg-${statusColor}">${t.status}</span></td>
        <td><small>${new Date(t.created_at).toLocaleDateString('en-IN')}</small></td>
        <td class="no-print">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openSupportViewModal(${t.id})" title="View"><i class="fa-solid fa-eye"></i></button>
          ${isAdmin ? `
            <button class="btn btn-sm btn-success me-1" onclick="openSupportViewModal(${t.id}, true)" title="Reply"><i class="fa-solid fa-reply"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteSupportTicket(${t.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

function openSupportCreateModal() {
  if (typeof isDemoMode === 'function' && isDemoMode()) {
    alert('🔒 Demo Mode mein ticket raise nahi kar sakte.\n\nPlease login to raise a ticket.');
    return;
  }
  document.getElementById('supportCreateForm')?.reset();
  new bootstrap.Modal(document.getElementById('supportCreateModal')).show();
}

async function submitSupportTicket(event) {
  event.preventDefault();
  if (typeof blockDemoWrite === 'function' && blockDemoWrite()) return;

  const btn = document.getElementById('btn-support-submit');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Submitting...';

  try {
    const subject = document.getElementById('support-subject').value.trim();
    const priority = document.getElementById('support-priority').value;
    const category = document.getElementById('support-category').value;
    const phone = document.getElementById('support-phone').value.trim();
    const description = document.getElementById('support-description').value.trim();
    const file = document.getElementById('support-attachment')?.files?.[0];

    let attachmentUrl = null;
    if (file) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${currentSociety}/ticket_${Date.now()}.${fileExt}`;
      const { error: upErr } = await _supabase.storage.from('complaint_images').upload(filePath, file);
      if (!upErr) {
        const { data: urlData } = _supabase.storage.from('complaint_images').getPublicUrl(filePath);
        attachmentUrl = urlData?.publicUrl || null;
      }
    }

    const member = membersData.find(m => (m.flat_no || '').toUpperCase() === (currentUser || '').toUpperCase());

    const ticket = {
      society_name: currentSociety,
      raised_by_flat: currentUser || 'UNKNOWN',
      raised_by_role: currentRole,
      raised_by_name: member?.name || '',
      raised_by_phone: phone || member?.phone || '',
      category, priority, subject, description,
      attachment_url: attachmentUrl,
      status: 'Open',
      created_at: new Date().toISOString()
    };

    const { error } = await _supabase.from('support_tickets').insert([ticket]);
    if (error) { alert('❌ ' + error.message); return; }

    try {
      const { data: adminUsers } = await _supabase
        .from('user_master').select('flat_no')
        .in('role', ['Admin', 'SocietyAdmin'])
        .eq('society_name', currentSociety);
      const adminFlats = (adminUsers || []).map(u => (u.flat_no || '').toUpperCase()).filter(Boolean);

      if (adminFlats.length > 0) {
  await _supabase.from('notices').insert([{
    society_name: currentSociety,
    title: `🎫 New Support Ticket — ${priority}`,
    content: `${currentUser} raised: "${subject}" (${category})`,
    date: new Date().toISOString().split('T')[0],
    author: currentUser,
    priority: (priority === 'Urgent' || priority === 'High') ? 'High' : 'Medium',
    target_members: adminFlats,
    attachment_url: null,
    deep_link: '/?tab=support'
  }]);
}
    } catch (nErr) { console.warn('[Support] Notify error:', nErr); }

    alert('✅ Ticket submitted! Admin will respond soon.');
    bootstrap.Modal.getInstance(document.getElementById('supportCreateModal')).hide();
    await loadSupportTickets();
    renderSupportTickets();
    updateSupportBadge();
  } catch (err) {
    console.error(err);
    alert('❌ ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

function openSupportViewModal(ticketId, showReply = false) {
  const t = supportTicketsData.find(x => x.id === ticketId);
  if (!t) { alert('Ticket not found.'); return; }

  __currentSupportTicketId = ticketId;

  document.getElementById('support-view-id').textContent = String(t.id).padStart(4,'0');
  document.getElementById('support-view-society').textContent = t.society_name || '-';
  document.getElementById('support-view-raisedby').textContent = `${t.raised_by_flat || '-'} (${t.raised_by_role || '-'})`;
  document.getElementById('support-view-category').textContent = t.category || '-';
  document.getElementById('support-view-priority').textContent = t.priority || '-';
  document.getElementById('support-view-status').textContent = t.status || '-';
  document.getElementById('support-view-date').textContent = new Date(t.created_at).toLocaleString('en-IN');
  document.getElementById('support-view-phone').textContent = t.raised_by_phone || '-';
  document.getElementById('support-view-subject').textContent = t.subject || '-';
  document.getElementById('support-view-description').textContent = t.description || '-';

  const pColor =
    t.priority === 'Urgent' ? 'bg-danger' :
    t.priority === 'High' ? 'bg-warning text-dark' :
    t.priority === 'Medium' ? 'bg-primary' : 'bg-secondary';
  document.getElementById('support-view-priority').className = `badge ${pColor}`;

  const sColor =
    t.status === 'Open' ? 'bg-warning text-dark' :
    t.status === 'In Progress' ? 'bg-info text-dark' :
    t.status === 'Resolved' ? 'bg-success' : 'bg-secondary';
  document.getElementById('support-view-status').className = `badge ${sColor}`;

    const attBox = document.getElementById('support-view-attachment-box');
  const delBtn = document.getElementById('support-delete-attachment-btn');
  if (t.attachment_url && t.attachment_url.trim() !== '') {
    document.getElementById('support-view-attachment-link').href = t.attachment_url;
    attBox.style.display = 'block';

    // Delete button — only for Admin
    if (delBtn && (currentRole === 'Admin' || currentRole === 'SocietyAdmin')) {
      delBtn.style.display = 'inline-block';
      delBtn.onclick = () => deleteSingleImage({
        table: 'support_tickets', rowId: t.id, column: 'attachment_url',
        bucket: 'complaint_images', imageUrl: t.attachment_url,
        refreshFn: async () => {
          await loadSupportTickets();
          renderSupportTickets();
          bootstrap.Modal.getInstance(document.getElementById('supportViewModal')).hide();
        },
        label: 'ticket attachment'
      });
    } else if (delBtn) {
      delBtn.style.display = 'none';
    }
  } else {
    attBox.style.display = 'none';
    if (delBtn) delBtn.style.display = 'none';
  }

  const replyBox = document.getElementById('support-existing-reply-box');
  if (t.admin_reply && t.admin_reply.trim() !== '') {
    document.getElementById('support-existing-reply-text').textContent = t.admin_reply;
    document.getElementById('support-existing-reply-meta').textContent =
      `Replied by ${t.replied_by || 'Admin'} on ${t.replied_at ? new Date(t.replied_at).toLocaleString('en-IN') : '-'}`;
    replyBox.style.display = 'block';
  } else {
    replyBox.style.display = 'none';
  }

  const adminSection = document.getElementById('support-admin-reply-section');
  if (showReply && currentRole === 'Admin') {
    adminSection.style.display = 'block';
    document.getElementById('support-reply-text').value = '';
    document.getElementById('support-reply-status').value = t.status === 'Open' ? 'In Progress' : t.status;
  } else {
    adminSection.style.display = 'none';
  }

  new bootstrap.Modal(document.getElementById('supportViewModal')).show();
}

async function submitSupportReply() {
  if (currentRole !== 'Admin') { alert('⛔ Only Admin can reply.'); return; }
  if (!__currentSupportTicketId) return;

  const replyText = document.getElementById('support-reply-text').value.trim();
  const newStatus = document.getElementById('support-reply-status').value;

  if (!replyText && newStatus === (supportTicketsData.find(t => t.id === __currentSupportTicketId)?.status)) {
    alert('Please write a reply or change status.'); return;
  }

  try {
    const { error } = await _supabase
      .from('support_tickets')
      .update({
        admin_reply: replyText || undefined,
        status: newStatus,
        replied_at: new Date().toISOString(),
        replied_by: currentUser,
        updated_at: new Date().toISOString()
      })
      .eq('id', __currentSupportTicketId);

    if (error) { alert('❌ ' + error.message); return; }

    const t = supportTicketsData.find(x => x.id === __currentSupportTicketId);
    if (t) {
      try {
        await _supabase.from('notices').insert([{
          society_name: t.society_name,
          title: `🎫 Admin replied to your ticket #${String(t.id).padStart(4,'0')}`,
          content: `Status: ${newStatus}. Reply: ${replyText || '(no message)'}`,
          date: new Date().toISOString().split('T')[0],
          author: 'Support',
          priority: 'Medium',
                target_members: [t.raised_by_flat],
      attachment_url: null,
      deep_link: '/?tab=support'   // ✅ ADD THIS COMMA + LINE
    }]);
      } catch (e) { console.warn('Notify user error:', e); }
    }

    alert('✅ Reply sent & status updated!');
    bootstrap.Modal.getInstance(document.getElementById('supportViewModal')).hide();
    await loadSupportTickets();
    renderSupportTickets();
    updateSupportBadge();
  } catch (err) {
    console.error(err); alert('❌ ' + err.message);
  }
}

async function deleteSupportTicket(id) {
  if (currentRole !== 'Admin') { alert('⛔ Only Admin can delete.'); return; }
  if (!confirm('⚠️ Delete this support ticket permanently?\n\n(Attachment image will also be deleted)')) return;

  try {
    // STEP 1: Pehle ticket ka attachment_url nikalo
    const { data: ticket, error: fetchErr } = await _supabase
      .from('support_tickets')
      .select('attachment_url')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) {
      console.warn('[DeleteTicket] Fetch warning:', fetchErr.message);
    }

    // STEP 2: Storage se attachment delete karo (agar hai)
    if (ticket?.attachment_url && ticket.attachment_url.trim() !== '') {
      try {
        const parts = ticket.attachment_url.split('/complaint_images/');
        if (parts.length > 1) {
          const filePath = decodeURIComponent(parts[1]);
          const { error: delErr } = await _supabase.storage
            .from('complaint_images')
            .remove([filePath]);

          if (delErr) {
            console.warn('[DeleteTicket] Storage delete failed:', delErr.message);
            // Continue anyway — DB delete karna important hai
          } else {
            console.log('[DeleteTicket] Attachment deleted:', filePath);
          }
        }
      } catch (imgErr) {
        console.warn('[DeleteTicket] Image cleanup error:', imgErr);
      }
    }

    // STEP 3: DB se ticket delete karo
    const { error } = await _supabase.from('support_tickets').delete().eq('id', id);
    if (error) { alert('❌ ' + error.message); return; }

    console.log('[DeleteTicket] Ticket deleted: #' + id);
    alert('✅ Ticket & attachment deleted successfully!');

    await loadSupportTickets();
    renderSupportTickets();
    updateSupportBadge();

  } catch (err) {
    console.error('[DeleteTicket] Error:', err);
    alert('❌ Error: ' + err.message);
  }
}

function updateSupportBadge() {
  const badge = document.getElementById('support-badge');
  if (!badge) return;

  let count = 0;
  if (currentRole === 'Admin' || currentRole === 'SocietyAdmin') {
    // Admin / SocietyAdmin: count of open + in-progress tickets in current society
    count = supportTicketsData.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  } else {
    // Member / Chairman: only their own open tickets
    count = supportTicketsData.filter(t =>
      (t.raised_by_flat || '').toUpperCase() === (currentUser || '').toUpperCase() &&
      t.status !== 'Closed'
    ).length;
  }

  if (count > 0) { badge.textContent = count; badge.style.display = 'inline-block'; }
  else { badge.style.display = 'none'; }

  const gridBadge = document.getElementById('grid-badge-support');
  if (gridBadge) {
    gridBadge.textContent = count > 0 ? count : '';
    gridBadge.setAttribute('data-count', count.toString());
  }
}

window.onload = async () => {
  clearStuckOverlays();

// ✅ Demo mode check — sabse pehle
  if (localStorage.getItem('ps_demo_mode') === 'true') {
    const demoSoc = localStorage.getItem('ps_demo_society') || 'PS Live Demo';
    currentSociety = demoSoc;
    currentRole = 'Member';
    currentUser = 'DEMO-VIEWER';
    
    document.getElementById('landing-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('visitor-section').style.display = 'none';
    document.getElementById('app-section').classList.remove('d-none');
    document.body.classList.add('demo-mode');
    showDemoBanner();
    
    const socElem = document.getElementById('sidebar-society-name');
    if (socElem) socElem.innerText = demoSoc + ' 🎬';
    const roleBadge = document.getElementById('user-role-badge');
    if (roleBadge) roleBadge.innerText = 'DEMO';
    
    try {
      await fetchSupabaseData();
      setTimeout(() => loadSecondaryData(), 500);
    } catch(e) { console.log('Demo restore error:', e); }
    return;
  }

  const isLogged = localStorage.getItem('ps_user_logged');
  const role = localStorage.getItem('ps_user_role') || 'Admin';
  const email = localStorage.getItem('ps_user_id') || 'A-101';
  currentSociety = localStorage.getItem('ps_user_society') || 'Demo Society';

  await loadSocietiesForDropdown('visitor-society');
  await loadSocietiesForDropdown('visitor-password-society');

  if (isLogged === 'true') { applyUserSession(role, email); }
  else { showLandingPage(); }
};

setInterval(async () => {
  if (localStorage.getItem('ps_user_logged') === 'true' && currentSociety) {
    try {
      let { data: notices } = await _supabase.from('notices').select('*').eq('society_name', currentSociety);
      if (notices) noticesData = notices;

      let { data: polls } = await _supabase.from('polls').select('*').eq('society_name', currentSociety);
      if (polls) pollsData = polls;

      updateAllBadges();
      updateCommunityBadge();
    } catch (e) { console.log('Background sync silent error', e); }
  }
}, 30000);

handleDeepLink();

// ==================== VISIBILITY SYNC (Realtime Fallback) ====================
// Jab user wapas app pe aaye (tab switch / phone unlock), fresh data load karo
// Sirf tab refresh karo jab 5 second se zyada app hidden thi
let __lastHiddenAt = 0;

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    __lastHiddenAt = Date.now();
  } else if (document.visibilityState === 'visible') {
    const hiddenFor = Date.now() - __lastHiddenAt;
    
    // Agar 5 sec se zyada hidden tha, data refresh karo
    if (__lastHiddenAt > 0 && hiddenFor > 5000) {
      if (localStorage.getItem('ps_user_logged') === 'true' && currentSociety) {
        console.log('[Visibility] App visible after', Math.round(hiddenFor / 1000) + 's — refreshing data');
        fetchSupabaseData();
        setTimeout(() => loadSecondaryData(), 300);
      }
    }
    __lastHiddenAt = 0;
  }
});
// ==================== MANUAL REFRESH BUTTON ====================
let __lastRefreshTime = 0;

async function manualRefresh() {
  const now = Date.now();
  const cooldown = 10000; // ✅ 10 second cooldown
  
  // Agar 10 second se pehle click kiya to ignore karo
  if (now - __lastRefreshTime < cooldown) {
    const remaining = Math.ceil((cooldown - (now - __lastRefreshTime)) / 1000);
    console.log('[Refresh] Cooldown active. Please wait', remaining, 'sec');
    
    // User ko countdown dikhao
    const btns = document.querySelectorAll('.refresh-btn');
    btns.forEach(btn => {
      const originalContent = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-clock"></i> ${remaining}s`;
      setTimeout(() => {
        btn.innerHTML = originalContent;
      }, 1000);
    });
    return;
  }
  
  __lastRefreshTime = now;

  const btns = document.querySelectorAll('.refresh-btn');
  
  // Loading state
  btns.forEach(btn => {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
  });

  try {
    console.log('[Manual Refresh] Started...');
    
        // Main data
    await fetchSupabaseData();

    // Secondary data
    await loadSecondaryData();

    // ✅ Agar overlay open है → उस tab का specific render function call करो
    const overlay = document.getElementById('tabOverlay');
    if (overlay && window.innerWidth <= 768) {
      const currentTab = overlay.getAttribute('data-current-tab');
      if (currentTab) {
        console.log('[Refresh] Re-rendering overlay tab:', currentTab);
        
        // हर tab के लिए सही render function
        const renderMap = {
          'dashboard': () => { renderMembers(); renderMaintenance(); renderMemberPersonalView(); },
          'members': () => renderMembers(),
          'maintenance': () => { renderMaintenance(); renderMemberPersonalView(); },
          'expenses': () => renderExpenses(),
          'polls': () => renderPolls(),
          'complaints': () => renderComplaints(),
          'proofs': () => renderPaymentProofs(),
          'amc-tracker': () => renderAMCTracker(),
          'assets': () => renderAssets(),
          'fds': () => renderFDs(),
          'team': () => { renderTeam(); renderSOSContacts(); },
          'journal-voucher': () => renderJournalVouchers(),
          'tally-bank': () => renderTallyBankBook(),
          'ca-audit': () => renderCAAuditReport(),
          'bank-reconciliation': () => renderBankReconciliation(),
          'parking': () => renderParking(),
          'meetings': () => renderMeetings(),
          'marketplace': () => renderMarketplace(),
          'sos-contacts': () => renderSOSContacts(),
          'community': () => renderCommunity()
        };
        
        if (renderMap[currentTab]) {
          try { 
            renderMap[currentTab](); 
          } catch(e) { 
            console.log('[Refresh] Render error:', e); 
          }
        }
        
        // Mobile grid badges भी update करो
        syncMobileGridBadges();
      }
    }
    
 
    // Visitor page khuli hai to visitors bhi refresh
    const visitorSection = document.getElementById('visitor-section');
    if (visitorSection && visitorSection.style.display === 'block') {
      await loadTodayVisitors();
    }
    
    console.log('[Manual Refresh] Done ✅');
    
    // Success indicator
    btns.forEach(btn => {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Done!';
      btn.style.background = 'rgba(34, 197, 94, 0.2)';
      btn.style.borderColor = 'rgba(34, 197, 94, 0.5)';
      btn.style.color = '#4ade80';
    });
    
    setTimeout(() => {
      btns.forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-rotate"></i>';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      });
    }, 1500);
    
  } catch (err) {
    console.error('[Manual Refresh] Error:', err);
    
    btns.forEach(btn => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-rotate"></i>';
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    });
    
    alert('❌ Refresh failed. Please check your connection and try again.');
  }
}
// ══════════════════════════════════════════════════════════════
// 🔒 READ-ONLY MODE — Subscription Overdue Enforcement
// ══════════════════════════════════════════════════════════════

async function checkSocietySubscriptionMode() {
  if (!currentSociety) return;

  // 🎯 Super Admin ALWAYS exempt (तुम कभी block नहीं होगे)
  if (currentRole === 'Admin') {
    disableReadOnlyMode();
    return;
  }

  // Demo Mode भी exempt
  if (typeof isDemoMode === 'function' && isDemoMode()) {
    disableReadOnlyMode();
    return;
  }

  try {
    const { data: socData, error } = await _supabase
      .from('societies')
      .select('subscription_status')
      .eq('name', currentSociety)
      .maybeSingle();

    if (error) {
      console.warn('[ReadOnly] Check error:', error.message);
      return;
    }

    if (socData?.subscription_status === 'suspended') {
      enableReadOnlyMode();
    } else {
      disableReadOnlyMode();
    }
  } catch (e) {
    console.warn('[ReadOnly] Exception:', e);
  }
}

function enableReadOnlyMode() {
  if (document.body.classList.contains('read-only-mode')) return;
  document.body.classList.add('read-only-mode');
  showReadOnlyBanner();
  console.log('[ReadOnly] 🔒 Mode ACTIVATED for', currentSociety);
}

function disableReadOnlyMode() {
  document.body.classList.remove('read-only-mode');
  removeReadOnlyBanner();
}

function showReadOnlyBanner() {
  if (document.getElementById('readOnlyBanner')) return;

  const banner = document.createElement('div');
  banner.id = 'readOnlyBanner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(90deg, #dc2626, #ef4444);
    color: #fff;
    padding: 12px 20px;
    text-align: center;
    font-weight: 700;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
    font-family: 'Plus Jakarta Sans', sans-serif;
    line-height: 1.5;
  `;

  const upiLink = 'upi://pay?pa=8866376056@icici&pn=PS%20Society%20Solutions&cu=INR&tn=Society%20Subscription';

  banner.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      🚨 <strong>SOCIETY SUBSCRIPTION OVERDUE</strong> — Read-Only Mode
      <div style="margin-top: 5px; font-size: 12px; font-weight: 500;">
        <a href="${upiLink}" style="color: #fff; text-decoration: underline; font-weight: 700;">
          💳 Pay via UPI
        </a>
        &nbsp;|&nbsp;
        📞 +91 8866376056
        &nbsp;|&nbsp;
        📧 ps.societysolutions@gmail.com
      </div>
    </div>
  `;
  document.body.appendChild(banner);
  document.body.style.paddingTop = '58px';
}

function removeReadOnlyBanner() {
  const banner = document.getElementById('readOnlyBanner');
  if (banner) banner.remove();
  document.body.style.paddingTop = '';
}

// ═══════════════════════════════════════════════════════
// 1️⃣4️⃣ INIT (Called from switchTab)
// ═══════════════════════════════════════════════════════
async function initUserManagementTab() {
  if (currentRole !== 'Admin') {
    alert('⛔ Only Admin');
    return;
  }
  
  await loadAllUsers();
  await loadPendingResetRequests();
  setupUserMgmtRealtime();
}

// ये सब app.js के सबसे आखिर में जोड़ो (initUserManagementTab के बाद):

let allUsersData = [];
let passwordResetRequests = [];
let __userMgmtRealtimeChannel = null;

// 1. Load All Users
async function loadAllUsers() {
  if (currentRole !== 'Admin') {
    alert('⛔ Only Admin');
    return;
  }

  const tbody = document.getElementById('user-management-list');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin me-2"></i> Loading users...</td></tr>';

  try {
    const { data, error } = await _supabase
      .from('user_master')
      .select('user_id, flat_no, role, society_name')
      .order('society_name')
      .order('flat_no');

    if (error) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">❌ ${error.message}</td></tr>`;
      return;
    }

    allUsersData = data || [];
    console.log('[UserMgmt] Loaded', allUsersData.length, 'users');

    buildSocietyFilterDropdown();
    renderUserManagementTable();

  } catch (e) {
    console.error('[UserMgmt] Exception:', e);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">❌ ${e.message}</td></tr>`;
  }
}

// 2. Build Society Filter Dropdown
function buildSocietyFilterDropdown() {
  const select = document.getElementById('user-mgmt-society-filter');
  if (!select) return;

  const societies = [...new Set(allUsersData.map(u => u.society_name).filter(Boolean))].sort();

  let html = '<option value="all">All Societies (' + allUsersData.length + ')</option>';
  societies.forEach(s => {
    const count = allUsersData.filter(u => u.society_name === s).length;
    html += `<option value="${s}">${s} (${count})</option>`;
  });

  select.innerHTML = html;
}

// 3. Render User Table
function renderUserManagementTable() {
  const tbody = document.getElementById('user-management-list');
  if (!tbody) return;

  const societyFilter = document.getElementById('user-mgmt-society-filter')?.value || 'all';
  const searchTerm = (document.getElementById('user-mgmt-search')?.value || '').toLowerCase().trim();

  let filtered = allUsersData;

  if (societyFilter !== 'all') {
    filtered = filtered.filter(u => u.society_name === societyFilter);
  }

  if (searchTerm) {
    filtered = filtered.filter(u => 
      (u.flat_no || '').toLowerCase().includes(searchTerm) ||
      (u.role || '').toLowerCase().includes(searchTerm) ||
      (u.society_name || '').toLowerCase().includes(searchTerm) ||
      (u.user_id || '').toLowerCase().includes(searchTerm)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">
      <i class="fa-solid fa-search fa-2x d-block mb-2"></i>
      No users match the current filter
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const roleColor = 
      u.role === 'Admin' ? 'bg-dark' :
      u.role === 'Chairman' ? 'bg-warning text-dark' :
      u.role === 'SocietyAdmin' ? 'bg-info text-dark' : 'bg-primary';

    return `
      <tr>
        <td><b>${u.flat_no || '-'}</b></td>
        <td><span class="badge ${roleColor}">${u.role || '-'}</span></td>
        <td><small>${u.society_name || '-'}</small></td>
        <td><small class="text-muted font-monospace">${(u.user_id || '').substring(0, 8)}...</small></td>
        <td class="no-print">
          <button class="btn btn-sm btn-warning fw-semibold"
            onclick="openResetPasswordModal('${u.user_id}', '${u.flat_no}', '${u.role}', '${u.society_name}')">
            <i class="fa-solid fa-key me-1"></i> Reset
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function clearUserMgmtFilters() {
  const socFilter = document.getElementById('user-mgmt-society-filter');
  const search = document.getElementById('user-mgmt-search');
  if (socFilter) socFilter.value = 'all';
  if (search) search.value = '';
  renderUserManagementTable();
}

// 4. Load Pending Password Reset Requests
async function loadPendingResetRequests() {
  if (currentRole !== 'Admin') return;

  try {
    const { data, error } = await _supabase
      .from('password_reset_requests')
      .select('*')
      .eq('status', 'Pending')
      .order('requested_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('[ResetReq] Load error:', error.message);
      return;
    }

    passwordResetRequests = data || [];
    renderPendingResetRequests();
    updateUserMgmtBadge();

  } catch (e) {
    console.error('[ResetReq] Exception:', e);
  }
}

// 5. Render Pending Requests Panel
function renderPendingResetRequests() {
  const panel = document.getElementById('pending-reset-requests-panel');
  if (!panel) return;

  if (!passwordResetRequests || passwordResetRequests.length === 0) {
    panel.innerHTML = `
      <div class="alert alert-success d-flex align-items-center mb-0" style="border-radius:12px;">
        <i class="fa-solid fa-check-circle me-2"></i>
        <strong>All clear!</strong> &nbsp; No pending password reset requests.
      </div>
    `;
    return;
  }

  const societyFilter = document.getElementById('user-mgmt-society-filter')?.value || 'all';
  let visible = passwordResetRequests;

  if (societyFilter !== 'all') {
    visible = visible.filter(r => r.society_name === societyFilter);
  }

  if (visible.length === 0) {
    panel.innerHTML = `
      <div class="alert alert-info mb-0" style="border-radius:12px;">
        <i class="fa-solid fa-info-circle me-2"></i>
        ${passwordResetRequests.length} pending request(s) in other societies. Change filter to view.
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="card border-0 shadow-sm rounded-4 p-3 bg-warning-subtle">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold text-warning-emphasis mb-0">
          <i class="fa-solid fa-bell me-2"></i> 
          ${visible.length} Pending Password Reset Request${visible.length > 1 ? 's' : ''}
        </h6>
        <button class="btn btn-sm btn-outline-warning" onclick="loadPendingResetRequests()">
          <i class="fa-solid fa-rotate"></i>
        </button>
      </div>
      <div class="row g-2">
        ${visible.map(r => {
          const timeAgo = getTimeAgo(r.requested_at);
          return `
            <div class="col-md-6">
              <div class="card border-0 shadow-sm rounded-3 p-3 bg-white">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 class="fw-bold mb-1">
                      <i class="fa-solid fa-user-clock text-warning me-1"></i>
                      ${r.flat_no}
                    </h6>
                    <span class="badge bg-secondary">${r.user_role || 'Member'}</span>
                    <span class="badge bg-info text-dark ms-1">${r.society_name}</span>
                  </div>
                  <small class="text-muted">${timeAgo}</small>
                </div>
                ${r.phone ? `<p class="small mb-2"><i class="fa-solid fa-phone me-1"></i> ${r.phone}</p>` : ''}
                <div class="d-flex gap-1 flex-wrap">
                  <button class="btn btn-sm btn-warning fw-semibold flex-grow-1" 
                    onclick="resetFromRequest(${r.id})">
                    <i class="fa-solid fa-key me-1"></i> Reset Now
                  </button>
                  <button class="btn btn-sm btn-outline-danger" onclick="dismissResetRequest(${r.id})" title="Dismiss">
                    <i class="fa-solid fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' hr ago';
  const days = Math.floor(hrs / 24);
  return days + ' day ago';
}

// 6. Badge Update
function updateUserMgmtBadge() {
  const count = passwordResetRequests.filter(r => r.status === 'Pending').length;

  const badge = document.getElementById('user-mgmt-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  const gridBadge = document.getElementById('grid-badge-user-management');
  if (gridBadge) {
    gridBadge.textContent = count > 0 ? count : '';
    gridBadge.setAttribute('data-count', count.toString());
  }
}

// 7. Reset From Request
async function resetFromRequest(requestId) {
  const req = passwordResetRequests.find(r => r.id === requestId);
  if (!req) { alert('❌ Request not found'); return; }

  const user = allUsersData.find(u => 
    (u.flat_no || '').toUpperCase() === (req.flat_no || '').toUpperCase() &&
    (u.society_name || '').toLowerCase() === (req.society_name || '').toLowerCase()
  );

  if (!user) {
    alert(`❌ User not found in user_master\n\nFlat: ${req.flat_no}\nSociety: ${req.society_name}`);
    return;
  }

  openResetPasswordModal(user.user_id, user.flat_no, user.role, user.society_name, requestId);
}

// 8. Dismiss Request
async function dismissResetRequest(requestId) {
  if (!confirm('⚠️ Dismiss this password reset request?\n\nUser will NOT be notified.')) return;

  try {
    const { error } = await _supabase
      .from('password_reset_requests')
      .update({
        status: 'Dismissed',
        resolved_at: new Date().toISOString(),
        resolved_by: currentUser,
        resolved_note: 'Dismissed by admin'
      })
      .eq('id', requestId);

    if (error) { alert('❌ ' + error.message); return; }

    alert('✅ Request dismissed');
    await loadPendingResetRequests();

  } catch (e) {
    alert('❌ ' + e.message);
  }
}

// 9. Random Password Generator
function generateRandomPassword() {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#$!';
  const all = uppercase + lowercase + digits + symbols;

  let pwd = '';
  pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
  pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 0; i < 6; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

// 10. Open Reset Password Modal
function openResetPasswordModal(userId, flatNo, role, society, requestId = null) {
  const existing = document.getElementById('resetPasswordModal');
  if (existing) existing.remove();

  const randomPwd = generateRandomPassword();

  const modal = document.createElement('div');
  modal.id = 'resetPasswordModal';
  modal.className = 'modal fade';
  modal.setAttribute('data-bs-backdrop', 'static');
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
        <div class="modal-header bg-warning text-dark" style="border-radius: 20px 20px 0 0;">
          <h5 class="modal-title fw-bold">
            <i class="fa-solid fa-key me-2"></i> Reset User Password
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4">
          <div class="alert alert-info py-2 px-3 mb-3" style="border-radius: 10px; font-size: 13px;">
            <div><strong>Flat/ID:</strong> ${flatNo}</div>
            <div><strong>Role:</strong> ${role}</div>
            <div><strong>Society:</strong> ${society}</div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">
              New Password 
              <button class="btn btn-sm btn-outline-warning ms-2 py-0 px-2" onclick="regeneratePassword()" type="button">
                <i class="fa-solid fa-rotate me-1"></i> Regenerate
              </button>
            </label>
            <div class="input-group">
              <input type="text" id="reset-new-pwd" class="form-control font-monospace fw-bold" 
                     value="${randomPwd}" readonly>
              <button class="btn btn-outline-secondary" type="button" onclick="copyResetPwd()" title="Copy">
                <i class="fa-solid fa-copy"></i>
              </button>
            </div>
            <small class="text-muted">
              <i class="fa-solid fa-info-circle me-1"></i>
              User will get this password via WhatsApp
            </small>
          </div>

          <div class="alert alert-warning small mb-3" style="border-radius: 10px;">
            <i class="fa-solid fa-shield-halved me-1"></i>
            User ko WhatsApp pe message jayega: <em>"Login karke Change Password se apna password set kar lein"</em>
          </div>

          <button class="btn btn-warning w-100 fw-bold py-2" id="btn-do-reset"
            onclick="doResetPassword('${userId}', '${flatNo}', '${role}', '${society}', ${requestId || 'null'})">
            <i class="fa-solid fa-check me-1"></i> Reset Password
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  new bootstrap.Modal(modal).show();
}

function regeneratePassword() {
  const input = document.getElementById('reset-new-pwd');
  if (input) input.value = generateRandomPassword();
}

function copyResetPwd() {
  const input = document.getElementById('reset-new-pwd');
  if (!input) return;
  input.select();
  document.execCommand('copy');
  input.setSelectionRange(0, 0);
  alert('✅ Password copied to clipboard');
}

// 11. Do Reset Password
async function doResetPassword(userId, flatNo, role, society, requestId) {
  const newPwd = document.getElementById('reset-new-pwd').value.trim();

  if (!newPwd || newPwd.length < 6) {
    alert('❌ Password minimum 6 characters');
    return;
  }

  const btn = document.getElementById('btn-do-reset');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Resetting...';

  try {
    const { data: authData } = await _supabase.auth.getUser();
    if (!authData?.user?.id) {
      alert('❌ Not authenticated');
      return;
    }

    const { data, error } = await _supabase.functions.invoke('reset-user-password', {
      body: {
        userId: userId,
        newPassword: newPwd,
        callerUserId: authData.user.id
      }
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);

    if (requestId) {
      try {
        await _supabase
          .from('password_reset_requests')
          .update({
            status: 'Resolved',
            resolved_at: new Date().toISOString(),
            resolved_by: currentUser,
            resolved_note: `Reset by Admin. New password length: ${newPwd.length}`
          })
          .eq('id', requestId);
      } catch (e) { console.warn('Request mark error:', e); }
    }

    try {
      await logActivity('PASSWORD_RESET', `Reset password for ${flatNo} (${role}) in ${society}`);
    } catch (e) {}

    const modalEl = document.getElementById('resetPasswordModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
    setTimeout(() => modalEl?.remove(), 400);

    showResetSuccessModal(flatNo, role, society, newPwd);

    setTimeout(() => loadPendingResetRequests(), 500);

  } catch (err) {
    console.error('[ResetPwd] Error:', err);
    alert('❌ Failed to reset password:\n\n' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

// 12. Success Modal + WhatsApp Button
function showResetSuccessModal(flatNo, role, society, newPwd) {
  const existing = document.getElementById('resetSuccessModal');
  if (existing) existing.remove();

  const loginId = `${flatNo.toLowerCase()}_${society.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  
  const waMessage = 
`🔐 *Password Reset Successful*

Namaste,

Aapka password reset kar diya gaya hai.

*Login ID:* ${loginId}
*New Password:* ${newPwd}

⚠️ *IMPORTANT:*
Login karne ke baad, kripya turant apna password change kar lein.
👉 Login karo → "Change Password" tab me jao → apna naya password set karo.

- PS Society Solutions`;

  const member = membersData.find(m => (m.flat_no || '').toUpperCase() === flatNo.toUpperCase());
  const phone = member?.phone || '';

  const modal = document.createElement('div');
  modal.id = 'resetSuccessModal';
  modal.className = 'modal fade';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
        <div class="modal-header bg-success text-white" style="border-radius: 20px 20px 0 0;">
          <h5 class="modal-title fw-bold">
            <i class="fa-solid fa-check-circle me-2"></i> Password Reset!
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4 text-center">
          <div class="mb-3">
            <i class="fa-solid fa-check-circle text-success" style="font-size: 70px;"></i>
          </div>

          <div class="alert alert-success mb-3" style="border-radius: 12px;">
            <div class="mb-1"><strong>User:</strong> ${flatNo} (${role})</div>
            <div class="mb-1"><strong>Society:</strong> ${society}</div>
            <div class="mt-2">
              <strong>New Password:</strong><br>
              <code class="fs-6 fw-bold" style="background:#fff; padding:6px 12px; border-radius:8px; display:inline-block; margin-top:4px;">${newPwd}</code>
            </div>
          </div>

          ${phone ? `
            <button class="btn btn-success w-100 fw-bold mb-2 py-2"
              onclick="sendResetWhatsApp('${phone}', ${JSON.stringify(waMessage).replace(/"/g, '&quot;')})">
              <i class="fa-brands fa-whatsapp me-2" style="font-size:18px;"></i> 
              Send via WhatsApp
            </button>
          ` : `
            <div class="alert alert-warning small mb-2">
              ⚠️ Member ka phone number nahi mila.<br>
              Copy karke manually bhej dein:
              <div class="mt-2">
                <button class="btn btn-sm btn-outline-secondary" onclick="copyText(\`${waMessage.replace(/`/g, '')}\`)">
                  <i class="fa-solid fa-copy me-1"></i> Copy Message
                </button>
              </div>
            </div>
          `}

          <button class="btn btn-outline-secondary w-100" data-bs-dismiss="modal">
            <i class="fa-solid fa-times me-1"></i> Close
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  new bootstrap.Modal(modal).show();
}

function sendResetWhatsApp(phone, message) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const finalPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Copied to clipboard');
  }).catch(() => {
    alert('⚠️ Copy failed — manually select and copy');
  });
}

// 13. Realtime Subscription
function setupUserMgmtRealtime() {
  if (__userMgmtRealtimeChannel) {
    try { _supabase.removeChannel(__userMgmtRealtimeChannel); } catch(e) {}
    __userMgmtRealtimeChannel = null;
  }

  if (currentRole !== 'Admin') return;

  __userMgmtRealtimeChannel = _supabase
    .channel('password-reset-requests-rt')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'password_reset_requests' },
      async (payload) => {
        console.log('[RT] password_reset_requests:', payload.eventType);
        await loadPendingResetRequests();

        if (payload.eventType === 'INSERT') {
          const newReq = payload.new;
          if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
            try {
              navigator.serviceWorker.ready.then(reg => {
                reg.showNotification('🔐 Password Reset Request', {
                  body: `${newReq.flat_no} (${newReq.society_name}) needs password reset`,
                  icon: '/ps-society-app/icon-192.png',
                  badge: '/ps-society-app/icon-192.png',
                  tag: `reset-${newReq.id}`,
                  renotify: true,
                  data: { url: '/ps-society-app/?tab=user-management' }
                });
              });
            } catch (e) { console.log('Notify error:', e); }
          }
        }
      }
    )
    .subscribe((status) => {
      console.log('[RT] User Mgmt channel:', status);
    });
}
