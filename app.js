// ==================== FULL app.js ====================
const SUPABASE_URL = 'https://kuxttskznuzbtmfxtifr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eHR0c2t6bnV6YnRtZnh0aWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5Mjg3OTQsImV4cCI6MjEwMTUwNDc5NH0.tc4XXUeDI19R1XsFJasO0Aq9gTg3JrzPL1JWM83RnYM';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const sirenAudio = new Audio('https://actions.google.com/sounds/v1/alarms/emergency_alarm.ogg');

let activityLogs = [];
let currentRole = 'Admin';
let currentUser = 'A-101';
let currentSociety = 'Demo Society';
const MONTHS_IN_FY_SO_FAR = 5; 
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
let amcContractsData = [];
let deletionRequests = [];

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

function showLandingPage() {
  document.getElementById('landing-section').style.display = 'flex';
  document.getElementById('visitor-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('app-section').classList.add('d-none');
  updateFloatingButtonsVisibility(true);
}

// ==================== DYNAMIC AUTO LATE FEE FUNCTION ====================
function calculateLateFee(flatPendingDue) {
  const isLateFeeEnabled = societySettings.enable_late_fee === 'true';
  if (!isLateFeeEnabled || flatPendingDue <= 0) return 0;

  const lateFeeType = societySettings.late_fee_type || 'fixed'; 
  const customRate = Number(societySettings.late_fee_amount || 0);

  let calculatedLateFee = 0;
  
  if (lateFeeType === 'fixed') {
    calculatedLateFee = customRate; 
  } else if (lateFeeType === 'percentage') {
    calculatedLateFee = (flatPendingDue * customRate) / 100; 
  }

  return Math.round(calculatedLateFee);
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
  } else {
    openVisitorPassword();
  }
}

function showLoginPage() {
  updateFloatingButtonsVisibility(false);
  document.getElementById('landing-section').style.display = 'none';
  document.getElementById('visitor-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'flex';
  document.getElementById('app-section').classList.add('d-none');
  loadSocietiesForDropdown('login-society');
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
    visitorSection.style.height = '0';
    visitorSection.style.overflow = 'hidden';
    visitorSection.style.background = 'transparent';
  }

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
  const society = document.getElementById('login-society').value;
  if (!society) { alert('❌ Please select a Society.'); return; }
  
  const flatInput = document.getElementById('login-email').value.trim().toUpperCase();
  const password = document.getElementById('login-password').value.trim();
  const selectedRole = document.getElementById('login-role').value;
  const email = flatInput.toLowerCase() + '@ps.in';
  
  try {
    const { data: authData, error: authError } = await _supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (authError || !authData.user) {
      alert('❌ Invalid credentials! Please check your Login ID and Password.');
      return;
    }
    
    const { data: userData, error: userError } = await _supabase
      .from('user_master')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (userError || !userData) {
      alert('❌ User not found in system. Please contact admin.');
      await _supabase.auth.signOut();
      return;
    }
    
    const user = userData;
    if (user.role.toLowerCase() !== selectedRole.toLowerCase()) {
      alert(`⛔ Access Denied! Your role is "${user.role}".`);
      await _supabase.auth.signOut();
      return;
    }
    
    if (user.role !== 'Admin' && user.society_name !== society) {
      alert(`⛔ You are not authorized for "${society}".`);
      await _supabase.auth.signOut();
      return;
    }
    
    localStorage.setItem('ps_user_logged', 'true');
    localStorage.setItem('ps_user_role', user.role);
    localStorage.setItem('ps_user_id', user.flat_no);
    
    let targetSociety = society;
    if (user.role !== 'Admin') {
      targetSociety = user.society_name || society;
    }
    localStorage.setItem('ps_user_society', targetSociety);
    currentSociety = targetSociety.trim();
    
    applyUserSession(user.role, user.flat_no);
  } catch (err) {
    console.error('Login error:', err);
    alert('❌ Something went wrong. Please try again.');
  }
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
  checkUserConsent(currentUser, () => {
    loadMainApp(role);
  });
}

async function checkUserConsent(flatNo, callback) {
  try {
    const cleanFlat = (flatNo || '').trim();
    const { data, error } = await _supabase
      .from('user_master')
      .select('consent_given')
      .ilike('flat_no', cleanFlat)
      .maybeSingle();

    if (error || !data || data.consent_given !== true) {
      showConsentPopup(cleanFlat, callback);
    } else {
      callback();
    }
  } catch (err) {
    console.error('Consent check error:', err);
    showConsentPopup(flatNo, callback);
  }
}

function showConsentPopup(flatNo, callback) {
  const existingOverlay = document.getElementById('consentOverlay');
  if (existingOverlay) existingOverlay.remove();

  document.getElementById('app-section').classList.add('d-none');
  document.getElementById('landing-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'none';
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

  if (error) {
    alert('❌ Failed to save consent.');
    return;
  }
  const overlay = document.getElementById('consentOverlay');
  if (overlay) overlay.remove();
  loadMainApp(currentRole);
}

function loadMainApp(role) {
  document.getElementById('landing-section').style.display = 'none';
  document.getElementById('visitor-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'none';
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
    
    // 🟢 यहाँ चेक करें कि क्या URL में कोई 'tab' पैरामीटर (Notification Deep Link) है या नहीं
    const urlParams = new URLSearchParams(window.location.search);
    const hasTabParam = urlParams.has('tab');

    // अगर डीप लिंक नहीं है तभी मोबाइल का मेनू ग्रिड खोलें, वरना सीधे नोटिफाइड टैब पर रहने दें
    if (!hasTabParam) {
      toggleMobileMenu();
    }
  } else {
    const sidebar = document.querySelector('#sidebarMenu');
    if (sidebar) sidebar.style.display = 'block';
  }
  
  clearAllData();
  fetchSupabaseData();
  setTimeout(requestNotificationPermission, 2000);
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

function switchSociety(societyName) {
  if (!societyName || societyName === currentSociety) return;
  if (!confirm(`Switch to "${societyName}"? Data will reload.`)) return;
  currentSociety = societyName;
  localStorage.setItem('ps_user_society', societyName);
  clearAllData();
  fetchSupabaseData();
  document.getElementById('sidebar-society-name').innerText = societyName;
  const dropdown = document.getElementById('switch-society-dropdown');
  if (dropdown) dropdown.value = societyName;
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
}

function handleLogout() {
  markAllAsRead();
  _supabase.auth.signOut();
  localStorage.removeItem('ps_user_logged');
  localStorage.removeItem('ps_user_role');
  localStorage.removeItem('ps_user_id');
  localStorage.removeItem('ps_user_society');
  document.getElementById('app-section').classList.add('d-none');
  const gridOverlay = document.getElementById('mobileMenuOverlay');
  if (gridOverlay) gridOverlay.style.display = 'none';
  showLandingPage();
}

async function fetchSupabaseData() {
  try {
    await _supabase.rpc('clean_old_activity_logs');

    // 🟢 यहाँ marketplace_posts, notices, events और facilities को तुरंत लोड होने वाले ग्रुप में जोड़ा गया है
    const [
      { data: members },
      { data: maint },
      { data: expenses },
      { data: settings },
      { data: market },
      { data: notices },
      { data: events },
      { data: facilities },
      { data: bookings }
    ] = await Promise.all([
      _supabase.from('members').select('*').eq('society_name', currentSociety),
      _supabase.from('maintenance_payments').select('*').eq('society_name', currentSociety),
      _supabase.from('expenses').select('*').eq('society_name', currentSociety),
      _supabase.from('society_settings').select('*').eq('society_name', currentSociety),
      _supabase.from('marketplace_posts').select('*').eq('society_name', currentSociety).order('created_at', { ascending: false }),
      _supabase.from('notices').select('*').eq('society_name', currentSociety),
      _supabase.from('events').select('*').eq('society_name', currentSociety).order('date', { ascending: true }),
      _supabase.from('facilities').select('*').eq('society_name', currentSociety).eq('is_active', true),
      _supabase.from('facility_bookings').select('*').eq('society_name', currentSociety).order('booking_date', { ascending: true })
    ]);

    membersData = members || [];
    maintenanceData = maint || [];
    expenseData = expenses || [];
    marketplaceData = market || [];
    noticesData = notices || [];
    eventsData = events || [];
    facilitiesData = facilities || [];
    bookingsData = bookings || [];
    
    societySettings = {};
    if (settings) {
      settings.forEach(s => { societySettings[s.key] = s.value; });
    }
    openingBalance = parseFloat(societySettings.opening_bank_balance) || 0;

    // तुरंत डैशबोर्ड, मार्केटप्लेस और कम्युनिटी रेंडर करें
    renderAllTables();
    renderMarketplace();
    updateAllBadges();
    updateMobileHeaderInfo();

    // बाकी सेकंडरी डेटा बैकग्राउंड में लोड होगा
    loadSecondaryData();

  } catch (err) {
    console.error('💥 Error in fetchSupabaseData:', err);
  }
}

async function loadSecondaryData() {
  try {
    const [
      { data: assets },
      { data: fds },
      { data: complaints },
      { data: polls },
      { data: notices },
      { data: meets },
      { data: amcs },
      { data: proofs },
      { data: jvs },
      { data: team },
      { data: delReq }
    ] = await Promise.all([
      _supabase.from('assets').select('*').eq('society_name', currentSociety),
      _supabase.from('sinking_fund_fd').select('*').eq('society_name', currentSociety),
      _supabase.from('complaints').select('*').eq('society_name', currentSociety),
      _supabase.from('polls').select('*').eq('society_name', currentSociety),
      _supabase.from('notices').select('*').eq('society_name', currentSociety),
      _supabase.from('society_meetings').select('*').eq('society_name', currentSociety),
      _supabase.from('amc_contracts').select('*').eq('society_name', currentSociety),
      _supabase.from('payment_proofs').select('*').eq('society_name', currentSociety),
      _supabase.from('journal_vouchers').select('*').eq('society_name', currentSociety).order('date', { ascending: false }),
      _supabase.from('team').select('*').eq('society_name', currentSociety),
      _supabase.from('deletion_requests').select('*').eq('society_name', currentSociety).order('requested_at', { ascending: false })
    ]);

    assetData = assets || [];
    fdData = fds || [];
    complaintData = complaints || [];
    pollsData = polls || [];
    noticesData = notices || [];
    meetingsData = meets || [];
    amcContractsData = amcs || [];
    paymentProofs = proofs || [];
    journalVouchersData = jvs || [];
    teamData = team || [];
    deletionRequests = delReq || [];

    // डेटा आने के बाद इनकी टेबल्स और डेटा को अपडेट करें
    renderJournalVouchers();
    if (currentRole === 'Admin') renderDeletionRequests();
    renderAllTables();
    updateAllBadges();
  } catch (e) {
    console.log('Background sync error:', e);
  }
}

function clearAllData() {
  membersData = [];
  maintenanceData = [];
  expenseData = [];
  customBankEntries = [];
  pollsData = [];
  noticesData = [];
  complaintData = [];
  assetData = [];
  fdData = [];
  societySettings = {};
  visitors = [];
  paymentProofs = [];
  teamData = [];
  amcContractsData = [];
  deletionRequests = [];
  openingBalance = 0;
  renderAllTables();
}

function populateNoticeMemberSelect() {
  const select = document.getElementById('notice-target-members');
  if (!select) return;
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

async function loadTodayVisitors() {
  const container = document.getElementById('visitorListContainer');
  if (!container) return;
  const today = new Date().toISOString().split('T')[0];
  let query = _supabase.from('visitors').select('*').eq('visit_date', today).eq('society', currentSociety).order('in_time', { ascending: false });
  const isLogged = localStorage.getItem('ps_user_logged') === 'true';
  if (isLogged && currentRole === 'Member') {
    query = query.eq('flat_no', currentUser);
  }
  const { data, error } = await query;
  if (error) { container.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`; return; }
  visitors = data || [];
  renderVisitorList();
  updateVisitorBadge();
}

function renderVisitorList() {
  const container = document.getElementById('visitorListContainer');
  if (!container) return;
  if (visitors.length === 0) { container.innerHTML = `<div class="alert alert-info">No visitors today.</div>`; return; }
  const isLogged = localStorage.getItem('ps_user_logged') === 'true';
  container.innerHTML = visitors.map(v => {
    const showOutButton = !isLogged && v.status === 'IN';
    return `
      <div class="visitor-card ${v.status === 'OUT' ? 'out' : ''}">
        <div class="info">
          <h6>${v.name} <small class="text-muted">(${v.category})</small></h6>
          <small>Flat: ${v.flat_no} | ${v.society}</small><br>
          <small>Mobile: ${v.mobile || 'N/A'}</small><br>
          <small>In: ${v.in_time ? v.in_time.substring(0,5) : 'N/A'}</small>
          ${v.out_time ? `| Out: ${v.out_time.substring(0,5)}` : ''}
          ${v.purpose ? `| Purpose: ${v.purpose}` : ''}
        </div>
        ${showOutButton ? `<button class="btn btn-sm btn-outline-danger" onclick="markVisitorOut(${v.id})">OUT</button>` : (v.status === 'OUT' ? '<span class="badge bg-secondary">Out</span>' : '<span class="badge bg-success">In</span>')}
      </div>
    `;
  }).join('');
}

async function submitVisitor(event) {
  event.preventDefault();
  const society = document.getElementById('visitor-society').value;
  const name = document.getElementById('visitor-name').value.trim();
  const mobile = document.getElementById('visitor-mobile').value.trim();
  const flat = document.getElementById('visitor-flat').value;
  const category = document.getElementById('visitor-category').value;
  const purpose = document.getElementById('visitor-purpose').value.trim();
  if (!society || !name || !flat || !mobile) { alert('Please fill all required fields.'); return; }
  const now = new Date(); const timeStr = now.toTimeString().substring(0,8);
  const newVisitor = { society, visit_date: now.toISOString().split('T')[0], name, mobile, flat_no: flat, category, purpose: purpose || '', in_time: timeStr, out_time: null, status: 'IN' };
  const { error } = await _supabase.from('visitors').insert([newVisitor]);
  if (error) { alert('Error: ' + error.message); return; }
  alert('✅ Visitor entry recorded!');
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
    if (vIndex !== -1) {
      visitors[vIndex].status = 'OUT';
      visitors[vIndex].out_time = timeStr;
    }
    renderVisitorList();
  } catch (err) { alert('❌ Error: ' + err.message); }
}

function updateVisitorBadge() {
  const lastSeen = parseInt(localStorage.getItem('ps_last_seen_visitors') || '0');
  const inCount = visitors.filter(v => v.status === 'IN' && (v.id || 0) > lastSeen).length;
  updateBadge('visitor-badge', inCount);
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

async function submitAMCContract(event) {
  event.preventDefault();
  const service = document.getElementById('amc-service').value.trim();
  const vendor = document.getElementById('amc-vendor').value.trim();
  const person = document.getElementById('amc-person').value.trim();
  const phone = document.getElementById('amc-phone').value.trim();
  const start = document.getElementById('amc-start').value;
  const expiry = document.getElementById('amc-expiry').value;
  const cost = Number(document.getElementById('amc-cost').value || 0);

  const newAMC = {
    society_name: currentSociety,
    service_type: service,
    vendor_name: vendor,
    contact_person: person,
    phone: phone,
    start_date: start,
    expiry_date: expiry,
    cost: cost,
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
  const accName = societySettings.bank_acc_name || 'M/S. Aakruti Heights CHS';
  const bankName = societySettings.bank_name || 'ICICI Bank';
  const accNo = societySettings.bank_acc_no || '000000000000';
  const ifsc = societySettings.bank_ifsc || 'ICIC0000000';
  const upiId = societySettings.bank_upi_id || '8866376056@icici';
  const qrUrl = societySettings.society_qr_url || 'qr-payment.png';
  const openBalVal = societySettings.opening_bank_balance || '0';

  if (document.getElementById('bank-acc-name')) document.getElementById('bank-acc-name').innerText = accName;
  if (document.getElementById('bank-name-display')) document.getElementById('bank-name-display').innerText = bankName;
  if (document.getElementById('bank-acc-no')) document.getElementById('bank-acc-no').innerText = accNo;
  if (document.getElementById('bank-ifsc')) document.getElementById('bank-ifsc').innerText = ifsc;
  if (document.getElementById('bank-upi-id')) document.getElementById('bank-upi-id').innerText = upiId;
  
  if (document.getElementById('society-dynamic-qr')) document.getElementById('society-dynamic-qr').src = qrUrl;
  if (document.getElementById('member-dashboard-qr')) document.getElementById('member-dashboard-qr').src = qrUrl;
  if (document.getElementById('modal-qr-img')) document.getElementById('modal-qr-img').src = qrUrl;

  if (document.getElementById('edit-bank-acc-name')) document.getElementById('edit-bank-acc-name').value = accName;
  if (document.getElementById('edit-bank-name')) document.getElementById('edit-bank-name').value = bankName;
  if (document.getElementById('edit-bank-acc-no')) document.getElementById('edit-bank-acc-no').value = accNo;
  if (document.getElementById('edit-bank-ifsc')) document.getElementById('edit-bank-ifsc').value = ifsc;
  if (document.getElementById('edit-bank-upi')) document.getElementById('edit-bank-upi').value = upiId;
  
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

// ==================== FIREBASE PUSH NOTIFICATION SETUP ====================
const firebaseConfig = {
  apiKey: "AIzaSyAEDLQQIhlkCGupdvjp8IQiEqv6miVlRVk",
  authDomain: "ps-society-solutions.firebaseapp.com",
  projectId: "ps-society-solutions",
  storageBucket: "ps-society-solutions.firebasestorage.app",
  messagingSenderId: "345202451409",
  appId: "1:345202451409:web:d72246d863c4131e7036f0",
  measurementId: "G-8CZMXHWK5M"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onMessage((payload) => {
  console.log('Message received in foreground: ', payload);
  alert(`📢 ${payload.notification?.title || 'Notification'}\n${payload.notification?.body || ''}`);
});

async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;
      
      const token = await messaging.getToken({
        vapidKey: 'BAOek06eNgaVPYj-VTGIBss1MHzn-miGxVT6T_2l42P4cBIQdXbiGEZGMn1IEU421-udoBNNlD6GR_8GqoMKaa4',
        serviceWorkerRegistration: registration
      });

      if (token) {
        await saveFCMTokenToSupabase(token);
      }
    }
  } catch (err) {
    console.error('Error in notification setup:', err);
  }
}

async function saveFCMTokenToSupabase(token) {
  if (!currentUser || !currentSociety) return;
  try {
    await _supabase.from('fcm_tokens').upsert([
      { society_name: currentSociety, flat_no: currentUser, token: token }
    ], { onConflict: 'token' });
  } catch (err) {
    console.error('Error saving FCM token to Supabase:', err);
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
  if (pendingMembers.length === 0) {
    alert('✅ No pending dues! All members are up to date.');
    return;
  }
  if (!confirm(`📢 Send reminders to ${pendingMembers.length} members with pending dues?`)) return;
  pendingMembers.forEach((m, index) => {
    if (!m.phone) return;
    const message = `Dear ${m.name || 'Member'}, your maintenance dues are pending. Please clear them at the earliest. - PS Society`;
    setTimeout(() => sendWhatsAppReminder(m.phone, message), index * 1000);
  });
}

function renderPaymentProofs() {
  const container = document.getElementById('proofs-container');
  if (!container) return;
  
  if (paymentProofs.length === 0) {
    container.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No payment details submitted yet.</td></tr>`;
    const pendingCount = document.getElementById('pending-proof-count');
    if (pendingCount) pendingCount.innerText = '0 Pending';
    return;
  }

  const pending = paymentProofs.filter(p => p.status === 'Pending').length;
  const pendingCount = document.getElementById('pending-proof-count');
  if (pendingCount) pendingCount.innerText = `${pending} Pending`;

  container.innerHTML = paymentProofs.map(p => {
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
        <td>
          ${hasImage ? `<img src="${p.image_url}" alt="Proof" style="height:45px; width:45px; object-fit:cover; border-radius:8px; cursor:pointer;" onclick="window.open('${p.image_url}','_blank')">` : '<span class="text-muted">-</span>'}
        </td>
        <td class="no-print">
          ${isPending && (currentRole === 'Admin' || currentRole === 'SocietyAdmin') ? `
            <button class="btn btn-sm btn-success me-1" onclick="verifyProof(${p.id}, 'Verified')"><i class="fa-solid fa-check"></i></button>
            <button class="btn btn-sm btn-danger me-1" onclick="verifyProof(${p.id}, 'Rejected')"><i class="fa-solid fa-times"></i></button>
          ` : '<span class="text-muted">-</span>'}
          ${(currentRole === 'Admin' || currentRole === 'SocietyAdmin' || currentRole === 'Chairman') && memberPhone ? `
            <button class="btn btn-sm btn-whatsapp ms-1" onclick="sendWhatsAppReminder('${memberPhone}', 'Regarding your payment of ${p.amount} for Flat ${p.flat_no}.')"><i class="fa-brands fa-whatsapp"></i></button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

async function verifyProof(id, status) {
  if (!confirm(`Are you sure you want to mark this proof as ${status}?`)) return;
  const proof = paymentProofs.find(p => p.id === id);
  if (!proof) return;

  try {
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
      
      await _supabase.from('maintenance_payments').insert([newReceipt]);

      if (proof.image_url) {
        const filePath = proof.image_url.split('/payment_proofs/')[1];
        if (filePath) {
          await _supabase.storage.from('payment_proofs').remove([decodeURIComponent(filePath)]);
        }
      }

      await _supabase.from('payment_proofs').delete().eq('id', id);
      alert('✅ Payment verify हो गया और Storage साफ़ कर दी गई!');
    } else {
      await _supabase.from('payment_proofs').update({ status: status }).eq('id', id);
      alert('❌ Proof Rejected!');
    }
    
    fetchSupabaseData();
  } catch (err) { 
    alert('❌ Error: ' + err.message); 
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
    const { error: uploadError } = await _supabase.storage.from('payment_proofs').upload(filePath, file);
    if (!uploadError) {
      const { data: urlData } = _supabase.storage.from('payment_proofs').getPublicUrl(filePath);
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
  alert('✅ Submitted successfully! Admin will verify soon.');
  bootstrap.Modal.getInstance(document.getElementById('paymentDetailsModal')).hide();
  document.getElementById('paymentProofForm').reset();
  fetchSupabaseData();
}

// ==================== MEMBER CENTRAL VIEW & LEDGER ====================
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
  
  let runningBalance = openingDue;
  let ledgerRows = [{ date: '2026-04-01', particulars: 'Opening Balance Due', debit: openingDue, credit: 0, balance: runningBalance }];
  
  const fyStartDate = new Date('2026-04-01');
  let currentIterDate = new Date(fyStartDate);
  
  let monthlyDueEntries = [];
  for (let i = 0; i < MONTHS_IN_FY_SO_FAR; i++) {
    const monthName = currentIterDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    const dueDate = `${currentIterDate.getFullYear()}-${String(currentIterDate.getMonth() + 1).padStart(2, '0')}-05`;
    monthlyDueEntries.push({
      date: dueDate,
      type: 'monthly_due',
      particulars: `Monthly Maintenance Due (${monthName}) [Rate: ₹${rate}]`,
      amount: rate
    });
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
      ledgerRows.push({
        date: d.date,
        particulars: d.particulars,
        debit: d.amount,
        credit: 0,
        balance: runningBalance
      });
    } else if (item.type === 'receipt') {
      const r = item.data;
      const amt = Number(r.amount_paid || 0);
      runningBalance -= amt; 
      ledgerRows.push({
        date: r.payment_date || '-',
        particulars: `Maintenance Payment Received (Receipt: ${r.receipt_no || '-'})`,
        debit: 0,
        credit: amt,
        balance: runningBalance
      });
    } else if (item.type === 'jv') {
      const jv = item.data;
      const amt = Number(jv.amount || 0);
      if (jv.type === 'Debit') {
        runningBalance += amt;
        ledgerRows.push({
          date: jv.date || '-',
          particulars: `Journal Voucher [Debit] (${jv.jv_no}): ${jv.reason}`,
          debit: amt,
          credit: 0,
          balance: runningBalance
        });
      } else {
        runningBalance -= amt;
        ledgerRows.push({
          date: jv.date || '-',
          particulars: `Journal Voucher [Credit/Waiver] (${jv.jv_no}): ${jv.reason}`,
          debit: 0,
          credit: amt,
          balance: runningBalance
        });
      }
    }
  });

  const finalPendingBeforeLateFee = Math.max(0, runningBalance);
  const lateFee = calculateLateFee(finalPendingBeforeLateFee, rate);
  if (lateFee > 0) {
    runningBalance += lateFee;
    ledgerRows.push({
      date: new Date().toISOString().split('T')[0],
      particulars: `Auto Late Fee / Interest Penalty`,
      debit: lateFee,
      credit: 0,
      balance: runningBalance
    });
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
}

function renderTallyBankBook() {
  const tbody = document.getElementById('tally-bank-entries');
  if (!tbody) return;
  let runningBalance = openingBalance;
  let totalMoneyIn = 0, totalMoneyOut = 0;
  let bankEntries = [{ date: '2026-04-01', ref: 'OPENING-BAL', head: 'Opening Bank Balance', type: 'Receipt', deposit: openingBalance, withdraw: 0, source: null, id: null }];
  maintenanceData.forEach(r => {
    const amt = Number(r.amount_paid || 0);
    totalMoneyIn += amt;
    bankEntries.push({ date: r.payment_date || '2026-04-01', ref: r.receipt_no || 'REC-001', head: `Maintenance - ${r.flat_no}`, type: 'Receipt (Bank In)', deposit: amt, withdraw: 0, source: 'maintenance', id: r.id });
  });
  expenseData.forEach(e => {
    const amt = Number(e.amount || 0);
    totalMoneyOut += amt;
    bankEntries.push({ date: e.expense_date || '2026-05-01', ref: e.voucher_no || 'VOU-001', head: `${e.category} - ${e.paid_to}`, type: 'Payment Voucher', deposit: 0, withdraw: amt, source: 'expense', id: e.id });
  });
  customBankEntries.forEach(cb => { bankEntries.push(cb); totalMoneyIn += cb.deposit; totalMoneyOut += cb.withdraw; });
  bankEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
  tbody.innerHTML = bankEntries.map((entry, idx) => {
    if (entry.ref !== 'OPENING-BAL') runningBalance += (entry.deposit - entry.withdraw);
    const isDeletable = entry.source || (entry.ref && entry.ref !== 'OPENING-BAL');
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
          ${isDeletable ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteBankEntry(${idx})"><i class="fa-solid fa-trash"></i></button>` : '-'}
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('tally-tot-in').innerText = totalMoneyIn.toFixed(2);
  document.getElementById('tally-tot-out').innerText = totalMoneyOut.toFixed(2);
  document.getElementById('tally-calc-balance').innerText = runningBalance.toFixed(2);
  document.getElementById('tally-opening-balance').innerText = openingBalance.toFixed(2);
}

async function deleteBankEntry(index) {
  if (!confirm('⚠️ Delete this entry permanently?')) return;
  let bankEntries = [{ ref: 'OPENING-BAL', source: null, id: null }];
  maintenanceData.forEach(r => { bankEntries.push({ ref: r.receipt_no || 'REC-001', source: 'maintenance', id: r.id }); });
  expenseData.forEach(e => { bankEntries.push({ ref: e.voucher_no || 'VOU-001', source: 'expense', id: e.id }); });
  customBankEntries.forEach(cb => { bankEntries.push({ ref: cb.ref, source: 'custom', id: null }); });
  const entry = bankEntries[index];
  if (!entry) return;
  if (entry.source === 'maintenance') { await deleteMaintenance(entry.id); } 
  else if (entry.source === 'expense') { await deleteExpense(entry.id); } 
  else if (entry.source === 'custom') { const cIdx = customBankEntries.findIndex(cb => cb.ref === entry.ref); if (cIdx !== -1) { customBankEntries.splice(cIdx, 1); renderAllTables(); } }
}

function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('d-none'));
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.remove('d-none');

  document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => link.classList.remove('active'));
  if (element) element.classList.add('active');

  // 🟢 नया जोड़ा गया कोड: जब भी डेस्कटॉप पर 'about' टैब खुले, उसके अंदर सारा डेटा रेंडर हो जाए
  if (tabId === 'about') {
    renderAboutTab();
  }

  if (tabId === 'visitor') {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';

    const visitorSection = document.getElementById('visitor-section');
    if (visitorSection) {
      visitorSection.style.display = 'block';
      visitorSection.style.minHeight = '100vh';
      visitorSection.style.background = '#f8fafc';
    }

    const appSection = document.getElementById('app-section');
    if (appSection) appSection.classList.add('d-none');

    const backBtn = document.getElementById('visitorBackBtn');
    if (backBtn) backBtn.onclick = goBackFromVisitor;

    loadTodayVisitors();
    if (visitors.length > 0) {
      localStorage.setItem('ps_last_seen_visitors', Math.max(...visitors.map(v => v.id || 0)).toString());
    }
    updateBadge('visitor-badge', 0);
  }

if (tabId === 'marketplace') {
    fetchMarketplaceData().then(renderMarketplace);
  }

  if (tabId === 'community') {
    markCommunityRead();
    fetchEvents().then(() => {
      fetchFacilityData().then(renderCommunity);
    });
  }

  if (tabId === 'polls') {
    const maxPoll = pollsData.length > 0 ? Math.max(...pollsData.map(p => p.id || 0)) : 0;
    localStorage.setItem('ps_last_seen_polls', maxPoll.toString());
    updateAllBadges();
    renderPolls();
  }

  if (tabId === 'activity-logs') {
    fetchActivityLogs();
  }

  if (tabId === 'maintenance') {
    if (maintenanceData.length > 0) {
      localStorage.setItem('ps_last_seen_maintenance', Math.max(...maintenanceData.map(r => r.id || 0)).toString());
    }
    updateBadge('maintenance-badge', 0);
  }

  if (tabId === 'chairman-report' || tabId === 'monthly-summary') {
    if (typeof generateMonthlySummary === 'function') {
      generateMonthlySummary();
     }
  }

  if (tabId === 'proofs') {
    if (paymentProofs.length > 0) {
      localStorage.setItem('ps_last_seen_proofs', Math.max(...paymentProofs.map(p => p.id || 0)).toString());
    }
    updateBadge('proofs-badge', 0);
    renderPaymentProofs();
  }

  if (tabId === 'complaints') {
    if (complaintData.length > 0) {
      localStorage.setItem('ps_last_seen_complaints', Math.max(...complaintData.map(c => c.id || 0)).toString());
    }
    updateBadge('complaints-badge', 0);
  }

  if (tabId === 'manage-societies') {
    loadSocietiesList();
  }

  if (tabId === 'deletion-requests') {
    renderDeletionRequests();
  }

  if (tabId === 'community') {
    markCommunityRead();
    renderCommunity();
  }

  if (tabId === 'marketplace') {
    fetchMarketplaceData().then(renderMarketplace);
  }

  if (tabId === 'amc-tracker') renderAMCTracker();
  if (tabId === 'bank-details') renderBankDetails();
  if (tabId === 'sos-contacts') renderSOSContacts();
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
    meeting_title: title,
    meeting_date: date,
    meeting_type: type,
    venue: venue || 'Society Clubhouse',
    attendees: attendees || 'All Members',
    minutes_content: content,
    created_by: currentUser,
    created_at: new Date().toISOString()
  };

  const { error } = await _supabase.from('society_meetings').insert([newMeeting]);
  if (error) {
    alert('❌ Error saving meeting: ' + error.message);
    return;
  }

  alert('✅ Meeting Minutes Recorded Successfully!');
  bootstrap.Modal.getInstance(document.getElementById('meetingModal')).hide();
  document.getElementById('meetingForm').reset();
  fetchSupabaseData();
}

function renderAllTables() {
  renderMembers();
  renderMaintenance();
  renderExpenses();
  renderTallyBankBook();
  renderCAAuditReport();
  renderChairmanReport();
  generateMonthlySummary();
  renderComplaints();
  renderPolls();
  renderAssets();
  renderFDs();
  renderTeam();
  renderMemberPersonalView();
  renderBankDetails();
  renderAMCTracker();
  renderSOSContacts();
  renderDeletionRequests();
  renderPaymentProofs();
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
    html: '#monthly-summary-table', 
    startY: 30,
    theme: 'grid',
    didParseCell: function(data) {
      if (data.section === 'body') {
        data.cell.text = data.cell.text.map(t => t.replace(/[₹Rs\.]/g, '').trim());
      }
    }
  });
  doc.save(`Monthly_Summary_${month}.pdf`);
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
    if (currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin') return true;
    if (!n.target_members || n.target_members.length === 0) return true;
    return n.target_members.includes(currentUser);
  });
  if (visibleNotices.length === 0) {
    container.innerHTML = `<div class="col-12 text-muted text-center">No notices for you.</div>`;
    return;
  }
  container.innerHTML = visibleNotices.map(n => {
    const priorityColor = n.priority === 'High' ? 'danger' : (n.priority === 'Medium' ? 'warning' : 'secondary');
    const isTargeted = n.target_members && n.target_members.length > 0;
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
            ${isTargeted ? `<span class="badge bg-info text-dark">Selected: ${n.target_members.join(', ')}</span>` : `<span class="badge bg-secondary">All Members</span>`}
          </div>
          <p class="mt-2 text-secondary mb-2">${n.content}</p>
          ${n.attachment_url ? `
            <div class="mb-2">
              <a href="${n.attachment_url}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="fa-solid fa-paperclip me-1"></i> View Attachment</a>
            </div>` : ''}
          ${(currentRole === 'Admin' || currentRole === 'Chairman' || currentRole === 'SocietyAdmin') ? `<button class="btn btn-link text-danger btn-sm p-0" onclick="deleteNotice(${n.id})">Delete</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
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
      action_type: actionType,
      details: details,
      created_at: new Date().toISOString()
    };
    await _supabase.from('activity_logs').insert([newLog]);
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
}

async function fetchActivityLogs() {
  if (currentRole !== 'Admin') return;
  const { data, error } = await _supabase
    .from('activity_logs')
    .select('*')
    .eq('society_name', currentSociety)
    .order('created_at', { ascending: false })
    .limit(100);
    
  if (!error) {
    activityLogs = data || [];
    renderActivityLogs();
  }
}

function renderActivityLogs() {
  const tbody = document.getElementById('activity-logs-list');
  if (!tbody || currentRole !== 'Admin') return;
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

function renderFacilitiesCommunity() {
  const container = document.getElementById('facilities-community-container');
  if (!container) return;
  if (facilitiesData.length === 0) {
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

function resetBookingForm() {
  const form = document.getElementById('bookingForm');
  if (form) form.reset();
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
          ${showWhatsApp ? `<button class="btn btn-sm btn-whatsapp ms-1" onclick="sendWhatsAppReminder('${phone}', 'Dear ${ownerName}, your maintenance dues are pending. - PS Society')"><i class="fa-brands fa-whatsapp"></i></button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('dash-pending').innerText = grandTotalPending;
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
          ${showWhatsApp ? `<button class="btn btn-sm btn-whatsapp ms-1" onclick="sendWhatsAppReminder('${memberPhone}', 'Reminder: Your maintenance for ${r.month_accounted || ''} is due. - PS Society')"><i class="fa-brands fa-whatsapp"></i></button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('dash-collected').innerText = total;
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

// 🟢 CA Audit & GST Summary Report Generator
async function renderCAAuditReport() {
  const totalIncome = maintenanceData.reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
  const totalExp = expenseData.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalAssets = assetData.reduce((sum, a) => sum + Number(a.cost || 0), 0);
  const totalFDs = fdData.reduce((sum, f) => sum + Number(f.principal_amount || 0), 0);

  const totalDebit = openingBalance + totalAssets + totalExp + totalFDs;
  const openingCapitalOrSurplus = Math.max(0, totalDebit - totalIncome);

  const tbody = document.getElementById('ca-trial-balance-rows');
  if (tbody) {
    tbody.innerHTML = `
      <tr><td>Opening Bank Balance</td><td>Asset</td><td class="text-success fw-bold">${openingBalance.toFixed(2)}</td><td>-</td></tr>
      <tr><td>Maintenance Collections Income</td><td>Income</td><td>-</td><td class="text-primary fw-bold">${totalIncome.toFixed(2)}</td></tr>
      <tr><td>Total Fixed Assets (from Register)</td><td>Asset</td><td class="text-success fw-bold">${totalAssets.toFixed(2)}</td><td>-</td></tr>
      <tr><td>Total Society Expenses (from Ledger)</td><td>Expense</td><td class="text-danger fw-bold">${totalExp.toFixed(2)}</td><td>-</td></tr>
      <tr><td>Total Fixed Deposits & Reserves</td><td>Asset / Reserve</td><td class="text-success fw-bold">${totalFDs.toFixed(2)}</td><td>-</td></tr>
      <tr><td>Opening Capital / Accumulated Surplus</td><td>Capital / Liability</td><td>-</td><td class="text-primary fw-bold">${openingCapitalOrSurplus.toFixed(2)}</td></tr>
      <tr class="table-secondary fw-bold">
        <td colspan="2">GRAND TOTAL (MATCHED)</td>
        <td class="text-success">${totalDebit.toFixed(2)}</td>
        <td class="text-primary">${(totalIncome + openingCapitalOrSurplus).toFixed(2)}</td>
      </tr>
    `;
  }

  // 🟢 Fetch & Render GST Invoices Summary for CA
  try {
    const { data: invData, error } = await _supabase
      .from('society_invoices')
      .select('*')
      .eq('society_name', currentSociety);

    const gstTbody = document.getElementById('ca-gst-summary-rows');
    if (!gstTbody) return;

    if (error || !invData || invData.length === 0) {
      gstTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No GST Invoices recorded for this society yet.</td></tr>`;
      return;
    }

    let totalBase = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalInvoiceVal = 0;

    invData.forEach(inv => {
      totalBase += Number(inv.base_amount || 0);
      totalCgst += Number(inv.cgst_amount || 0);
      totalSgst += Number(inv.sgst_amount || 0);
      totalInvoiceVal += Number(inv.total_amount || 0);
    });

    gstTbody.innerHTML = `
      <tr>
        <td><strong>Central Goods & Services Tax (CGST)</strong></td>
        <td>9%</td>
        <td>₹ ${totalBase.toFixed(2)}</td>
        <td class="text-primary fw-bold">₹ ${totalCgst.toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>State Goods & Services Tax (SGST)</strong></td>
        <td>9%</td>
        <td>₹ ${totalBase.toFixed(2)}</td>
        <td class="text-primary fw-bold">₹ ${totalSgst.toFixed(2)}</td>
      </tr>
      <tr class="table-primary fw-bold">
        <td colspan="2">TOTAL GST OUTPUT LIABILITY (CGST + SGST)</td>
        <td>₹ ${totalBase.toFixed(2)}</td>
        <td class="text-success">₹ ${(totalCgst + totalSgst).toFixed(2)}</td>
      </tr>
      <tr class="table-secondary fw-bold">
        <td colspan="2">TOTAL GROSS TAXABLE TURNOVER (Incl. GST)</td>
        <td colspan="2" class="text-dark">₹ ${totalInvoiceVal.toFixed(2)}</td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading CA GST summary:', err);
  }
}

function renderChairmanReport() {
  generateMonthlySummary();
}

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

function populateComplaintFlatDropdown() {
  const select = document.getElementById('cmp-flat');
  if (!select) return;
  select.innerHTML = '';
  if (currentRole === 'Member') {
    const option = document.createElement('option');
    option.value = currentUser;
    option.textContent = currentUser;
    select.appendChild(option);
    select.disabled = true;
  } else {
    membersData.forEach(m => {
      const flat = (m.flat_no || '').toUpperCase();
      if (flat) {
        const opt = document.createElement('option');
        opt.value = flat;
        opt.textContent = flat;
        select.appendChild(opt);
      }
    });
    select.disabled = false;
  }
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
        <td>${hasImage ? `<a href="${c.image_url}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="fa-solid fa-image"></i></a>` : '-'}</td>
        <td class="no-print admin-only chairman-only ${currentRole === 'Member' ? 'd-none' : ''}">
          ${c.status !== 'Resolved' ? `<button class="btn btn-sm btn-success" onclick="resolveComplaint(${index})">Resolve</button>` : '-'}
        </td>
      </tr>
    `;
  }).join('');
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
    flat_no: flat,
    phone: phone,
    category: category,
    description: desc,
    status: 'Pending',
    complaint_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    society_name: currentSociety,
    image_url: imageUrl
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
  document.getElementById('edit-mem-status').value = member.status || 'Owner';
  document.getElementById('edit-mem-rate').value = member.monthly_rate || 600;
  document.getElementById('edit-mem-opening-due').value = member.opening_due || 0;

  new bootstrap.Modal(document.getElementById('editMemberModal')).show();
}

async function updateMember(event) {
  event.preventDefault();
  const id = document.getElementById('edit-mem-id').value;
  const name = document.getElementById('edit-mem-name').value.trim();
  const phone = document.getElementById('edit-mem-phone').value.trim();
  const status = document.getElementById('edit-mem-status').value;
  const monthly_rate = Number(document.getElementById('edit-mem-rate').value);
  const opening_due = Number(document.getElementById('edit-mem-opening-due').value);

  const { error } = await _supabase.from('members').update({
    name, phone, status, monthly_rate, opening_due
  }).eq('id', id);

  if (error) {
    alert('❌ Error updating member: ' + error.message);
    return;
  }

  alert('✅ Member details updated successfully!');
  bootstrap.Modal.getInstance(document.getElementById('editMemberModal')).hide();
  fetchSupabaseData();
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
  
  let runningBalance = openingDue;
  let ledgerRows = [{ date: '2026-04-01', particulars: 'Opening Balance Due', debit: openingDue, credit: 0, balance: runningBalance }];
  
  const fyStartDate = new Date('2026-04-01');
  let currentIterDate = new Date(fyStartDate);
  
  let monthlyDueEntries = [];
  for (let i = 0; i < MONTHS_IN_FY_SO_FAR; i++) {
    const monthName = currentIterDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    const dueDate = `${currentIterDate.getFullYear()}-${String(currentIterDate.getMonth() + 1).padStart(2, '0')}-05`;
    monthlyDueEntries.push({
      date: dueDate,
      type: 'monthly_due',
      particulars: `Monthly Maintenance Due (${monthName}) [Rate: ₹${rate}]`,
      amount: rate
    });
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
      ledgerRows.push({
        date: d.date,
        particulars: d.particulars,
        debit: d.amount,
        credit: 0,
        balance: runningBalance
      });
    } else if (item.type === 'receipt') {
      const r = item.data;
      const amt = Number(r.amount_paid || 0);
      runningBalance -= amt; 
      ledgerRows.push({
        date: r.payment_date || '-',
        particulars: `Maintenance Payment Received (Receipt: ${r.receipt_no || '-'})`,
        debit: 0,
        credit: amt,
        balance: runningBalance
      });
    } else if (item.type === 'jv') {
      const jv = item.data;
      const amt = Number(jv.amount || 0);
      if (jv.type === 'Debit') {
        runningBalance += amt;
        ledgerRows.push({
          date: jv.date || '-',
          particulars: `Journal Voucher [Debit] (${jv.jv_no}): ${jv.reason}`,
          debit: amt,
          credit: 0,
          balance: runningBalance
        });
      } else {
        runningBalance -= amt;
        ledgerRows.push({
          date: jv.date || '-',
          particulars: `Journal Voucher [Credit/Waiver] (${jv.jv_no}): ${jv.reason}`,
          debit: 0,
          credit: amt,
          balance: runningBalance
        });
      }
    }
  });

  const finalPendingBeforeLateFee = Math.max(0, runningBalance);
  const lateFee = calculateLateFee(finalPendingBeforeLateFee, rate);
  if (lateFee > 0) {
    runningBalance += lateFee;
    ledgerRows.push({
      date: new Date().toISOString().split('T')[0],
      particulars: `Auto Late Fee / Interest Penalty`,
      debit: lateFee,
      credit: 0,
      balance: runningBalance
    });
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
    meeting_title: title,
    meeting_date: date,
    meeting_type: type,
    venue: venue || 'Society Clubhouse',
    attendees: attendees || 'All Members',
    minutes_content: content,
    created_by: currentUser,
    created_at: new Date().toISOString()
  };

  const { error } = await _supabase.from('society_meetings').insert([newMeeting]);
  if (error) {
    alert('❌ Error saving meeting: ' + error.message);
    return;
  }

  alert('✅ Meeting Minutes Recorded Successfully!');
  bootstrap.Modal.getInstance(document.getElementById('meetingModal')).hide();
  document.getElementById('meetingForm').reset();
  fetchSupabaseData();
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
                  <input type="radio" 
                         name="poll_radio_${p.id}" 
                         value="${i}" 
                         onchange="handlePollVote(${p.id}, ${i})"
                         ${hasVoted ? 'disabled' : ''} 
                         ${hasVoted && p.voter_choices && p.voter_choices[currentUser] === i ? 'checked' : ''}>
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
  if (pollIdx !== -1) {
    votePoll(pollIdx, optIndex);
  }
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
  } catch (err) {
    alert('❌ Error saving vote.');
  }
}

async function withdrawVote(pollIndex) {
  const poll = pollsData[pollIndex];
  if (!poll || !poll.id) return;
  if (!confirm('⚠️ क्या आप अपना वोट वापस लेना चाहते हैं?')) return;
  
  const choiceIndex = poll.voter_choices ? poll.voter_choices[currentUser] : undefined;
  if (choiceIndex !== undefined) {
    poll.votes[choiceIndex] = Math.max(0, (poll.votes[choiceIndex] || 1) - 1);
  }
  poll.voters = (poll.voters || []).filter(v => v !== currentUser);
  if (poll.voter_choices) delete poll.voter_choices[currentUser];

  const { error } = await _supabase.from('polls').update({ votes: poll.votes, voters: poll.voters, voter_choices: poll.voter_choices }).eq('id', poll.id);
  if (error) alert('Error: ' + error.message);
  else {
    alert('✅ वोट वापस ले लिया गया!');
    fetchPollsData().then(renderPolls);
  }
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
    question: question,
    options: opts,
    votes: new Array(opts.length).fill(0),
    voters: [],
    voter_choices: {},
    created_by: currentUser,
    created_at: new Date().toISOString(),
    society_name: currentSociety
  };

  await _supabase.from('polls').insert([newPoll]);
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

// 🟢 Single, Unified & Safe Society Settings Update
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
    enable_gst: document.getElementById('settings-enable-gst').value, // 👈 अब यह सुरक्षित रूप से सेव होगा
    society_gstin: document.getElementById('settings-society-gstin').value.trim(), // 👈 GSTIN सुरक्षित रहेगा
    digital_signature_url: sigUrl
  };

  for (const [key, value] of Object.entries(settings)) {
    await _supabase.from('society_settings').upsert({ key, value: String(value), society_name: currentSociety }, { onConflict: 'key,society_name' });
  }

  alert('✅ Society Settings & GST Details Updated Successfully!');
  fetchSupabaseData();
}

// 🟢 Toggle GST Input Box based on Dropdown
function toggleGSTFields(val) {
  const container = document.getElementById('gstin-input-container');
  if (container) {
    container.style.display = val === 'true' ? 'block' : 'none';
  }
}

// 🟢 Load GST Settings into UI
function loadGSTSettingsToUI() {
  const isGstEnabled = societySettings.enable_gst || 'false';
  const gstinField = document.getElementById('settings-enable-gst');
  if (gstinField) {
    gstinField.value = isGstEnabled;
    toggleGSTFields(isGstEnabled);
  }
  const gstinInput = document.getElementById('settings-society-gstin');
  if (gstinInput) {
    gstinInput.value = societySettings.society_gstin || '';
  }
}

// 🟢 Smart GST-Aware Invoice & Receipt Generator (Fixed & Clean)
async function generateTaxInvoicePDF(receiptId) {
  if (typeof window.jspdf === 'undefined') return;
  const data = maintenanceData.find(r => r.id === receiptId);
  if (!data) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const societyName = societySettings.society_name || currentSociety;
  
  const isGstOn = societySettings.enable_gst === true || societySettings.enable_gst === 'true';
  const societyGstin = societySettings.society_gstin || '24AAAAA0000A1Z5';

  doc.setFontSize(16);
  doc.text(societyName, 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(isGstOn ? 'TAX INVOICE (GST 18%)' : 'MAINTENANCE RECEIPT', 105, 23, { align: 'center' });

  if (isGstOn) {
    doc.setFontSize(10);
    doc.text(`Society GSTIN: ${societyGstin}`, 14, 30);
  }

  const totalPaid = Number(data.amount_paid || 0);
  let baseAmount = totalPaid;
  let cgst = 0, sgst = 0;
  let finalTotal = totalPaid;

  let tableRows = [
    ['Receipt / Invoice No', data.receipt_no || '-'],
    ['Flat No', data.flat_no || '-'],
    ['Date', data.payment_date || '-'],
    ['Billing Period', data.month_accounted || '-']
  ];

  if (isGstOn) {
    // Inclusive GST Calculation (₹2000 के अंदर ही 18% GST शामिल है)
    baseAmount = totalPaid / 1.18; 
    const totalTax = totalPaid - baseAmount;
    cgst = totalTax / 2;
    sgst = totalTax / 2;
    finalTotal = totalPaid;

    tableRows.push(
      ['Base Amount', `Rs. ${baseAmount.toFixed(2)}`],
      ['CGST (9%)', `Rs. ${cgst.toFixed(2)}`],
      ['SGST (9%)', `Rs. ${sgst.toFixed(2)}`],
      ['Total Invoice Amount (Incl. GST)', `Rs. ${finalTotal.toFixed(2)}`]
    );

    // 🟢 डेटाबेस की `society_invoices` टेबल में रिकॉर्ड सिंक करना
    try {
      await _supabase.from('society_invoices').upsert([{
        society_name: currentSociety,
        invoice_no: data.receipt_no || `INV-${Date.now()}`,
        invoice_date: data.payment_date,
        flat_no: data.flat_no,
        base_amount: Number(baseAmount.toFixed(2)),
        cgst_rate: 9,
        sgst_rate: 9,
        cgst_amount: Number(cgst.toFixed(2)),
        sgst_amount: Number(sgst.toFixed(2)),
        total_amount: finalTotal,
        is_gst_applicable: true,
        gstin: societyGstin
      }], { onConflict: 'society_name,invoice_no' });
    } catch (e) {
      console.log('Invoice table sync note:', e);
    }

  } else {
    tableRows.push(
      ['Total Amount Paid', `Rs. ${finalTotal.toFixed(2)}`]
    );
  }

  doc.autoTable({
    startY: isGstOn ? 35 : 30,
    head: [['Description', 'Details']],
    body: tableRows,
    theme: 'grid'
  });

  if (societySettings.digital_signature_url) {
    doc.text('Authorized Signatory', 160, doc.lastAutoTable.finalY + 25);
  }

  doc.save(`${isGstOn ? 'Tax_Invoice' : 'Receipt'}_${data.flat_no}_${data.receipt_no || 'REC'}.pdf`);
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
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${yyyy}-${mm}` === selectedMonth;
    }
    return (r.payment_date || '').startsWith(selectedMonth);
  });
  const totalCollected = monthCollections.reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);

  const monthExpenses = expenseData.filter(e => {
    if (!e.expense_date) return false;
    const d = new Date(e.expense_date);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${yyyy}-${mm}` === selectedMonth;
    }
    return (e.expense_date || '').startsWith(selectedMonth);
  });
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const netCashflow = totalCollected - totalExpenses;

  let defaulterCount = 0;
  membersData.forEach(m => {
    const flatNo = (m.flat_no || '').trim().toUpperCase();
    const rate = Number(m.monthly_rate || 600);
    const openingDue = Number(m.opening_due || 0);
    const flatPaid = maintenanceData.filter(r => (r.flat_no || '').trim().toUpperCase() === flatNo)
                                     .reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
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
    'Administrative Expenses': 0,
    'Utility Expenses': 0,
    'Repairs & Maintenance': 0,
    'Staff & Salary': 0,
    'Statutory & Legal': 0,
    'Other Expenses': 0
  };

  expenses.forEach(e => {
    const cat = e.category || 'Other Expenses';
    if (expCategories[cat] !== undefined) {
      expCategories[cat] += Number(e.amount || 0);
    } else {
      expCategories['Other Expenses'] += Number(e.amount || 0);
    }
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

  // 🟢 यहाँ हमने .querySelectorAll का इस्तेमाल किया है ताकि मोबाइल और डेस्कटॉप दोनों जगह की टेबल एक साथ अपडेट हो जाएं
  const tbodies = document.querySelectorAll('#monthly-summary-rows');
  tbodies.forEach(tbody => {
    tbody.innerHTML = html;
  });
}

async function submitMember(event) {
  event.preventDefault();
  const newMember = {
    flat_no: document.getElementById('mem-flat').value.toUpperCase(),
    name: document.getElementById('mem-name').value,
    phone: document.getElementById('mem-phone').value,
    status: document.getElementById('mem-status').value,
    monthly_rate: Number(document.getElementById('mem-rate').value),
    opening_due: Number(document.getElementById('mem-opening-due')?.value || 0),
    society_name: currentSociety
  };
  
  await _supabase.from('members').insert([newMember]);
  await logActivity('ADD_MEMBER', `Added: ${newMember.flat_no}`);
  bootstrap.Modal.getInstance(document.getElementById('memberModal')).hide();
  
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
  const jvNo = document.getElementById('jv-no').value.trim();
  const date = document.getElementById('jv-date').value;
  const flat = document.getElementById('jv-flat').value.trim().toUpperCase();
  const type = document.getElementById('jv-type').value;
  const amount = Number(document.getElementById('jv-amount').value);
  const reason = document.getElementById('jv-reason').value.trim();

  const newJV = {
    society_name: currentSociety,
    jv_no: jvNo,
    date: date,
    flat_no: flat,
    type: type,
    amount: amount,
    reason: reason,
    created_at: new Date().toISOString()
  };

  const { error } = await _supabase.from('journal_vouchers').insert([newJV]);
  if (error) {
    alert('❌ Error saving JV: ' + error.message);
    return;
  }

  alert('✅ Journal Voucher Posted Successfully!');
  bootstrap.Modal.getInstance(document.getElementById('journalModal')).hide();
  document.getElementById('journalForm').reset();
  fetchSupabaseData();
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
  else fetchSupabaseData();
}

async function submitAsset(event) {
  event.preventDefault();
  const newAsset = {
    asset_code: `AST-${Date.now()}`,
    name: document.getElementById('asset-name').value,
    location: document.getElementById('asset-loc').value,
    quantity: parseInt(document.getElementById('asset-qty').value) || 1,
    cost: Number(document.getElementById('asset-cost').value),
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

function submitBankEntry(event) {
  event.preventDefault();
  const type = document.getElementById('bank-form-type').value;
  const amt = Number(document.getElementById('bank-form-amount').value);
  customBankEntries.push({
    date: document.getElementById('bank-form-date').value,
    ref: document.getElementById('bank-form-ref').value,
    head: document.getElementById('bank-form-head').value,
    type: type === 'deposit' ? 'Bank Deposit' : 'Withdrawal',
    deposit: type === 'deposit' ? amt : 0,
    withdraw: type === 'withdraw' ? amt : 0
  });
  renderAllTables();
  bootstrap.Modal.getInstance(document.getElementById('bankModal')).hide();
}

function openEnrollModal() {
  new bootstrap.Modal(document.getElementById('enrollModal')).show();
}

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
  tableClone.querySelectorAll('td').forEach(td => {
    td.innerText = td.innerText.replace(/[₹Rs\.]/g, '').trim();
  });
  
  const wb = XLSX.utils.table_to_book(tableClone, { sheet: "Sheet1", raw: true });
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function toggleMobileMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  if (overlay.style.display === 'flex') {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  } else {
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderGridCards();
  }
}

function closeMobileMenu() {
  document.getElementById('mobileMenuOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

function updateMobileHeaderInfo() {
  const socElem = document.getElementById('mobile-society-name');
  const userElem = document.getElementById('mobile-user-details');
  
  if (socElem) {
    socElem.innerText = societySettings.society_name || currentSociety || 'PS Society';
  }

  if (userElem) {
    if (currentRole === 'Admin' || currentRole === 'SocietyAdmin') {
      userElem.innerText = `👑 ${currentRole} (${currentUser})`;
    } else if (currentRole === 'Chairman') {
      userElem.innerText = `🎖️ Chairman (${currentUser})`;
    } else {
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
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard', color: '#2563eb' },
    { id: 'activity-logs', icon: 'fa-list-check', label: 'Activity Logs', color: '#0ea5e9' },
    { id: 'members', icon: 'fa-users', label: 'Members', color: '#22c55e' },
    { id: 'maintenance', icon: 'fa-indian-rupee-sign', label: 'Maintenance', color: '#f59e0b' },
    { id: 'expenses', icon: 'fa-receipt', label: 'Expenses', color: '#ef4444' },
    { id: 'amc-tracker', icon: 'fa-screwdriver-wrench', label: 'AMC Tracker', color: '#f59e0b' },
    { id: 'visitor', icon: 'fa-user-plus', label: 'Visitor', color: '#8b5cf6' },
    { id: 'complaints', icon: 'fa-headset', label: 'Complaints', color: '#ec4899' },
    { id: 'ca-audit', icon: 'fa-calculator', label: 'CA Audit', color: '#06b6d4' },
    { id: 'polls', icon: 'fa-check-to-slot', label: 'Polls', color: '#f97316' },
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
    { id: 'settings', icon: 'fa-gear', label: 'Settings', color: '#475569' },
    
    // 🟢 यहाँ सिर्फ 'about' (About PS) रखा गया है, 'terms' और 'privacy' हटा दिए गए हैं
    { id: 'about', icon: 'fa-circle-info', label: 'About PS', color: '#0f172a' },
    
    { id: 'team', icon: 'fa-people-group', label: 'Committee', color: '#8b5cf6' },
    { id: 'manage-societies', icon: 'fa-building', label: 'Manage Societies', color: '#2563eb' },
    { id: 'deletion-requests', icon: 'fa-trash-can', label: 'Deletion Requests', color: '#ef4444' }
  ];

  if (role === 'Member') {
    const memberCards = ['dashboard', 'members','marketplace', 'maintenance', 'visitor', 'complaints', 'polls', 'community', 'bank-details', 'sos-contacts', 'about', 'team'];
    allCards = allCards.filter(c => memberCards.includes(c.id));
  } else if (role === 'Chairman' || role === 'SocietyAdmin') {
    allCards = allCards.filter(c => c.id !== 'settings' && c.id !== 'manage-societies' && c.id !== 'deletion-requests');
  }

  allCards.sort((a, b) => {
    if (a.id === 'dashboard') return -1;
    if (b.id === 'dashboard') return 1;
    if (a.id === 'about') return 1;
    if (b.id === 'about') return -1;
    return a.label.localeCompare(b.label);
  });

  container.innerHTML = allCards.map(card => `
    <div onclick="openTabOverlay('${card.id}')" class="grid-card-item" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 20px 10px; text-align: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.05);">
      <i class="fa-solid ${card.icon}" style="color: ${card.color};"></i>
      <span style="color: #fff; font-weight: 500; display: block;">${card.label}</span>
    </div>
  `).join('');
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
        <div class="col-4">
          <div class="p-2 border rounded-3 bg-light">
            <span class="badge bg-secondary mb-1">SILVER</span>
            <h5 class="fw-bold mb-0 text-dark">49</h5>
            <small class="text-muted" style="font-size: 10px;">Digital Accounting</small>
          </div>
        </div>
        <div class="col-4">
          <div class="p-2 border border-warning rounded-3 bg-warning-subtle">
            <span class="badge bg-warning text-dark mb-1">GOLD (Popular)</span>
            <h5 class="fw-bold mb-0 text-dark">79</h5>
            <small class="text-muted" style="font-size: 10px;">Accounting + Visits</small>
          </div>
        </div>
        <div class="col-4">
          <div class="p-2 border border-primary rounded-3 bg-primary-subtle">
            <span class="badge bg-primary mb-1">PLATINUM</span>
            <h5 class="fw-bold mb-0 text-dark">149</h5>
            <small class="text-muted" style="font-size: 10px;">Complete Operations</small>
          </div>
        </div>
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

async function openTabOverlay(tabId) {
  closeMobileMenu();
  if (tabId === 'visitor') { showVisitorPage(); return; }

  if (tabId === 'terms' || tabId === 'privacy') {
    tabId = 'about'; 
  }

if (tabId === 'marketplace') {
    fetchMarketplaceData().then(renderMarketplace);
  }
  if (tabId === 'community') {
    fetchEvents().then(() => {
      fetchFacilityData().then(renderCommunity);
    });
  }

  if (tabId === 'about') renderAboutTab();

  let actualTabId = `tab-${tabId}`;
  if (tabId === 'journal-voucher') {
    actualTabId = 'tab-journal-voucher';
    renderJournalVouchers();
  }

  if (tabId === 'polls') renderPolls();
  if (tabId === 'chairman-report') generateMonthlySummary(); 
  if (tabId === 'activity-logs') fetchActivityLogs(); 
  if (tabId === 'community') renderCommunity();
  if (tabId === 'meetings') renderMeetings();
  if (tabId === 'amc-tracker') renderAMCTracker();
  if (tabId === 'bank-details') renderBankDetails();
  if (tabId === 'sos-contacts') renderSOSContacts();
  if (tabId === 'proofs') renderPaymentProofs();
  if (tabId === 'marketplace') renderMarketplace();
  if (tabId === 'manage-societies') loadSocietiesList();

  const target = document.getElementById(actualTabId);
  if (!target) return;

  const finalOverlay = createTabOverlay(tabId, target.innerHTML);
  document.body.appendChild(finalOverlay);
  document.body.style.overflow = 'hidden';

  window.history.pushState({ overlayOpen: true, tabId: tabId }, "", window.location.href);
}

function createTabOverlay(tabId, content) {
  const overlay = document.createElement('div');
  overlay.id = 'tabOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.95); z-index: 1040; padding: 20px; overflow-y: auto; display: flex; flex-direction: column;';
  overlay.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0 20px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <button onclick="closeTabOverlay()" style="background: none; border: none; color: #fff; font-size: 18px; cursor: pointer;"><i class="fa-solid fa-arrow-left"></i> Back</button>
      <span style="color: #f59e0b; font-weight: 600;">${tabId.toUpperCase()}</span>
      <span style="width: 50px;"></span>
    </div>
    <div id="tabOverlayContent" style="flex: 1; margin-top: 15px; background: #fff; border-radius: 16px; padding: 20px; overflow-y: auto; color: #0f172a;">
      ${content}
    </div>
  `;
  return overlay;
}

function closeTabOverlay() {
  const overlay = document.getElementById('tabOverlay');
  if (overlay) overlay.remove();
  document.body.style.overflow = '';
  if (window.innerWidth <= 768) {
    const gridOverlay = document.getElementById('mobileMenuOverlay');
    if (gridOverlay) {
      gridOverlay.style.display = 'flex';
      renderGridCards();
      document.body.style.overflow = 'hidden';
    }
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
      <p class="small text-muted"> We comply with the Digital Personal Data Protection (DPDP) Act, 2023. Data is collected strictly for society administrative operations based on explicit consent. We do not sell or share personal data with third-party advertisers. You hold rights to access, correct, or erase your data.</p>

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

function closeTermsOfService() {
  const overlay = document.getElementById('termsOfServiceOverlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function closeAboutPS() {
  const overlay = document.getElementById('aboutPSOverlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function closePrivacyPolicy() {
  const overlay = document.getElementById('privacyPolicyOverlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

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

function openQRModal() {
  new bootstrap.Modal(document.getElementById('qrModal')).show();
}

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
        
        <!-- 1. About / Main Branding Section -->
        <div class="text-center mb-4 pb-3 border-bottom">
          <h3 class="fw-bold mb-1"><span style="color: #f59e0b;">PS</span> Society Solutions</h3>
          <p class="text-primary fw-semibold small mb-0">Smart Society Management Engine • Simple • Transparent • Affordable</p>
        </div>

        <h5 class="fw-bold text-dark mb-3">🏷️ Subscription Plans (Per House / Month)</h5>
        <div class="row g-2 mb-4 text-center">
          <div class="col-4">
            <div class="p-2 border rounded-3 bg-light">
              <span class="badge bg-secondary mb-1">SILVER</span>
              <h5 class="fw-bold mb-0 text-dark">₹49</h5>
              <small class="text-muted" style="font-size: 10px;">Digital Accounting</small>
            </div>
          </div>
          <div class="col-4">
            <div class="p-2 border border-warning rounded-3 bg-warning-subtle">
              <span class="badge bg-warning text-dark mb-1">GOLD</span>
              <h5 class="fw-bold mb-0 text-dark">₹79</h5>
              <small class="text-muted" style="font-size: 10px;">Accounting + Visits</small>
            </div>
          </div>
          <div class="col-4">
            <div class="p-2 border border-primary rounded-3 bg-primary-subtle">
              <span class="badge bg-primary mb-1">PLATINUM</span>
              <h5 class="fw-bold mb-0 text-dark">₹149</h5>
              <small class="text-muted" style="font-size: 10px;">Complete Operations</small>
            </div>
          </div>
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

        <hr class="my-4">

        <!-- 2. Terms of Service Section -->
        <h4 class="fw-bold text-dark mb-2">📜 Terms of Service</h4>
        <p class="text-muted small">Effective Date: August 2026 • Last Updated: August 2026</p>
        
        <h6 class="fw-bold text-dark mt-3">1. Acceptance of Terms</h6>
        <p class="small text-muted">By accessing or using PS Society Solutions ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. We reserve the right to update these Terms at any time.</p>

        <h6 class="fw-bold text-dark mt-3">2. Description of Service</h6>
        <p class="small text-muted">PS Society Solutions is a Software-as-a-Service (SaaS) platform providing housing societies with digital management tools including member directory, maintenance billing, expense tracking, visitor management, and financial reporting. The Service is provided "as-is".</p>

        <h6 class="fw-bold text-dark mt-3">3. User Accounts and Responsibility</h6>
        <p class="small text-muted">You are solely responsible for maintaining the confidentiality of your login credentials (Flat Number and Password) and for all activities that occur under your account.</p>

        <h6 class="fw-bold text-dark mt-3">4. Acceptable Use Policy</h6>
        <p class="small text-muted">You agree not to use the Service for unlawful purposes, upload defamatory content, attempt unauthorized system access, introduce malware, or reverse engineer the platform.</p>

        <h6 class="fw-bold text-dark mt-3">5. Data Privacy and DPDP Act 2023 Compliance</h6>
        <p class="small text-muted">We comply with the Digital Personal Data Protection (DPDP) Act, 2023. Data is collected strictly for society administrative operations based on explicit consent. We do not sell or share personal data with third-party advertisers. You hold rights to access, correct, or erase your data.</p>

        <h6 class="fw-bold text-dark mt-3">6. Payments and Subscription</h6>
        <p class="small text-muted">Subscription plans include Silver (₹49/month), Gold (₹79/month), and Platinum (₹149/month) per house. Fees are billed in advance and are non-refundable except as required by law.</p>

        <h6 class="fw-bold text-dark mt-3">7. Intellectual Property</h6>
        <p class="small text-muted">All software, code, logos, and designs are the property of PS Society Solutions. Users retain ownership of content they upload but grant us a license to host and display it for service operations.</p>

        <h6 class="fw-bold text-dark mt-3">8. Limitation of Liability</h6>
        <p class="small text-muted">The Service is provided "AS IS" without warranties of any kind. Our total liability shall not exceed the total amount paid by you during the preceding twelve (12) months.</p>

        <h6 class="fw-bold text-dark mt-3">9. Governing Law and Jurisdiction</h6>
        <p class="small text-muted">These Terms are governed by the laws of India. Legal disputes are subject to the exclusive jurisdiction of the courts in Vadodara, Gujarat, India.</p>

        <h6 class="fw-bold text-dark mt-3">10. Contact and Grievance Redressal</h6>
        <p class="small text-muted mb-0">Grievance Officer: PS Society Solutions Team<br>Email: ps.societysolutions@gmail.com | Phone: +91 8866376056</p>

        <hr class="my-4">

        <!-- 3. Privacy Policy Section -->
        <h4 class="fw-bold text-dark mb-2">🛡️ Privacy Policy</h4>
        <p class="text-muted small">Effective Date: August 2026 • Compliant with Digital Personal Data Protection (DPDP) Act 2023</p>
        
        <h6 class="fw-bold text-dark mt-3">1. Information We Collect</h6>
        <p class="small text-muted">We collect resident details (name, flat number, phone, email), maintenance payment proofs (UTR numbers, receipt screenshots), visitor logs (visitor name, phone, purpose, in/out timestamps), and maintenance ticket data exclusively for society administrative operations.</p>

        <h6 class="fw-bold text-dark mt-3">2. How Your Data Is Handled</h6>
        <ul class="small text-muted ps-3">
          <li><strong>Data Isolation:</strong> Each housing society's database is segregated using Row-Level Security (RLS) policies.</li>
          <li><strong>No Third-Party Commercial Sharing:</strong> Personal information is never sold, rented, or shared with third-party advertisers.</li>
          <li><strong>Payment Safety:</strong> Society collections route strictly through authorized society bank accounts and UPI IDs.</li>
        </ul>

        <h6 class="fw-bold text-dark mt-3">3. Your Rights & Data Deletion</h6>
        <p class="small text-muted">Residents reserve the right to review payment histories and request removal of personal data via the in-app <em>Deletion Request</em> workflow under statutory compliance terms.</p>

        <h6 class="fw-bold text-dark mt-3">4. Grievance Redressal</h6>
        <p class="small text-muted mb-0">For privacy inquiries or data requests, contact our Grievance Officer at <strong>ps.societysolutions@gmail.com</strong> or call <strong>+91 8866376056</strong>.</p>

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
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="switchSociety('${s.name}')"><i class="fa-solid fa-arrow-right me-1"></i> Switch</button>
      </td>
    </tr>
  `).join('');
}

function openAddSocietyModal() {
  new bootstrap.Modal(document.getElementById('addSocietyModal')).show();
}

async function addNewSociety(event) {
  event.preventDefault();
  const name = document.getElementById('society-name').value.trim();
  const address = document.getElementById('society-address').value.trim();
  const phone = document.getElementById('society-phone').value.trim();
  const email = document.getElementById('society-email').value.trim();
  const openingBalanceVal = document.getElementById('society-opening-balance').value.trim() || '0';
  const visitorPassword = document.getElementById('society-visitor-password').value.trim() || '1234';

  const newSoc = { name, address, phone, email, is_active: true };
  const { error } = await _supabase.from('societies').insert([newSoc]);
  if (error) { alert('Error: ' + error.message); return; }

  const settingsBatch = [
    { key: 'visitor_password', value: visitorPassword, society_name: name },
    { key: 'opening_bank_balance', value: openingBalanceVal, society_name: name }
  ];

  for (const setting of settingsBatch) {
    await _supabase.from('society_settings').upsert(setting, { onConflict: 'key,society_name' });
  }

  alert(`✅ Society "${name}" added successfully with Opening Balance & Password!`);
  bootstrap.Modal.getInstance(document.getElementById('addSocietyModal')).hide();
  document.getElementById('addSocietyForm').reset();
  loadSocietySwitcher();
}

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

  } catch (err) {
    console.error('Badge update error:', err);
  }
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
}

function updateCommunityBadge() {
  const lastRead = parseInt(localStorage.getItem('ps_last_community_read') || '0');
  let count = 0;
  if (eventsData.length > 0) count += eventsData.filter(e => (e.id || 0) > lastRead).length;
  if (noticesData.length > 0) count += noticesData.filter(n => (n.id || 0) > lastRead).length;
  updateBadge('community-badge', count);
}

function markCommunityRead() {
  let maxId = 0;
  if (eventsData.length > 0) maxId = Math.max(maxId, ...eventsData.map(e => e.id || 0));
  if (noticesData.length > 0) maxId = Math.max(maxId, ...noticesData.map(n => n.id || 0));
  
  localStorage.setItem('ps_last_community_read', maxId.toString());
  localStorage.setItem('ps_last_seen_notice', maxId.toString());
  
  updateBadge('community-badge', 0);
  updateBadge('notification-badge', 0);
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
  
  if (password !== storedPassword) {
    alert('❌ Incorrect password. Please try again.');
    return;
  }

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
}

async function loadFlatsDropdown() {
  const select = document.getElementById('visitor-flat');
  if (!select) return;
  const { data } = await _supabase.from('members').select('flat_no').eq('society_name', currentSociety).order('flat_no');
  select.innerHTML = '<option value="">-- Select Flat --</option>';
  (data || []).forEach(m => {
    select.innerHTML += `<option value="${m.flat_no}">${m.flat_no}</option>`;
  });
}

function openUPIPayment() {
  document.getElementById('upi-amount').value = '1000';
  new bootstrap.Modal(document.getElementById('upiPaymentModal')).show();
}

function processUPIPayment() {
  const upiId = societySettings.bank_upi_id || '8866376056@icici';
  const name = societySettings.bank_acc_name || 'PS Society';
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

function listenForSOSAlerts() {
  const channelName = `sos-realtime-${currentSociety.replace(/\s+/g, '_')}`;
  _supabase.channel(channelName)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts' }, (payload) => {
      if (payload.new && payload.new.status === 'active' && payload.new.society_name === currentSociety) {
        showSOSBanner(payload.new);
        sirenAudio.play().catch(e => console.log(e));
      }
    })
    .subscribe();
}

function handleDeepLink() {
    setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const pollId = params.get('pollId');
        const noticeId = params.get('noticeId');
        const complaintId = params.get('complaintId');
        const eventId = params.get('eventId');

        if (tab) {
            const gridOverlay = document.getElementById('mobileMenuOverlay');
            if (gridOverlay) {
                gridOverlay.style.display = 'none';
                document.body.style.overflow = '';
            }
            if (typeof closeMobileMenu === 'function') {
                closeMobileMenu();
            }

            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                openTabOverlay(tab);
            } else {
                const link = document.querySelector(`.nav-link[onclick*="switchTab('${tab}')"]`);
                if (link) {
                    switchTab(tab, link);
                } else {
                    switchTab(tab, null);
                    document.querySelectorAll('.nav-link').forEach(l => {
                        if (l.textContent.trim().toLowerCase() === tab.toLowerCase()) {
                            l.classList.add('active');
                        }
                    });
                }
            }
        }
    }, 400);
}

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        handleDeepLink();
    }
});

window.addEventListener('load', handleDeepLink);

async function resolveSOSAlert(alertId) {
  try {
    await _supabase.from('sos_alerts').update({ status: 'resolved' }).eq('id', alertId);
  } catch (err) {
    console.error('Error resolving SOS:', err);
  }
  
  if (typeof sirenAudio !== 'undefined' && sirenAudio) {
    sirenAudio.pause();
    sirenAudio.currentTime = 0;
  }
  
  const banner = document.getElementById('sosAlertBanner');
  if (banner) banner.remove();
}

// 🟢 PWA और मोबाइल का नेटिव बैक बटन हैंडलर (अपडेटेड)
window.addEventListener('popstate', function(event) {
  const tabOverlay = document.getElementById('tabOverlay');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  
  // 1. अगर कोई भी बूटस्ट्रैप मॉडल (पॉप-अप) खुला है, तो पहले उसे बंद करें
  document.querySelectorAll('.modal.show').forEach(modal => {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
  });

  // 2. स्क्रीन पर बचे हुए किसी भी मॉडल बैकड्रॉप या स्टक ओवरले को साफ़ करें
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';

  if (tabOverlay) {
    // अगर कोई अंदर का टैब खुला है, तो बैक दबाने पर वह बंद होकर ग्रिड पर आ जाएगा
    tabOverlay.remove();
    
    if (window.innerWidth <= 768 && mobileMenuOverlay) {
      mobileMenuOverlay.style.display = 'flex';
      renderGridCards();
      document.body.style.overflow = 'hidden';
    }
  } else if (mobileMenuOverlay && mobileMenuOverlay.style.display === 'flex') {
    // अगर मोबाइल ग्रिड मेनू खुला है, तो वह बंद हो जाएगा
    closeMobileMenu();
  }
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

let marketplaceData = [];

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
  if (error) {
    alert('❌ Error: ' + error.message);
  } else {
    alert('✅ Post deleted successfully!');
    fetchMarketplaceData().then(renderMarketplace);
  }
}

async function submitMarketplacePost(event) {
  event.preventDefault();
  const newPost = {
    society_name: currentSociety,
    flat_no: currentUser,
    title: document.getElementById('market-title').value,
    category: document.getElementById('market-category').value,
    price: Number(document.getElementById('market-price').value),
    contact_phone: document.getElementById('market-phone').value,
    description: document.getElementById('market-desc').value,
    status: 'Approved',
    created_at: new Date().toISOString()
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

function clearStuckOverlays() {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  
  const overlays = ['tabOverlay', 'consentOverlay', 'mobileMenuOverlay', 'visitorPasswordOverlay', 'aboutPSOverlay', 'privacyPolicyOverlay', 'termsOfServiceOverlay'];
  overlays.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'mobileMenuOverlay' || id === 'visitorPasswordOverlay' || id === 'aboutPSOverlay' || id === 'privacyPolicyOverlay' || id === 'termsOfServiceOverlay') {
        el.style.display = 'none';
      } else {
        el.remove();
      }
    }
  });

  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
}

window.onload = async () => {
  clearStuckOverlays();

  const isLogged = localStorage.getItem('ps_user_logged');
  const role = localStorage.getItem('ps_user_role') || 'Admin';
  const email = localStorage.getItem('ps_user_id') || 'A-101';
  currentSociety = localStorage.getItem('ps_user_society') || 'Demo Society';

  await loadSocietiesForDropdown('visitor-society');
  await loadSocietiesForDropdown('login-society');
  await loadSocietiesForDropdown('visitor-password-society');

  if (isLogged === 'true') {
    applyUserSession(role, email);
  } else {
    showLandingPage();
  }
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
    } catch (e) {
      console.log('Background sync silent error', e);
    }
  }
}, 30000);

handleDeepLink();
