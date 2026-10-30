const categories = ["invest", "spend", "save", "fun", "emergency"];

const categoryColors = {
  invest: "#E3A857", spend: "#34D399", save: "#5B6EE8",
  fun: "#F76C6C", emergency: "#A78BFA"
};

let categoryLabels = JSON.parse(localStorage.getItem("categoryLabels")) || {
  invest: "ລົງທຸນ", spend: "ໃຊ້ຈ່າຍ", save: "ເກັບ",
  fun: "ຕາມໃຈ", emergency: "ພັດທະນາ"
};

let totals   = JSON.parse(localStorage.getItem("totals"))   || { invest:0, spend:0, save:0, fun:0, emergency:0 };
let percents = JSON.parse(localStorage.getItem("percents")) || { invest:30, spend:20, save:20, fun:10, emergency:20 };
let percentsLastSaved = localStorage.getItem("percentsLastSaved") || null;

let incomeMonth    = parseFloat(localStorage.getItem("incomeMonth"))   || 0;
let withdrawMonth  = parseFloat(localStorage.getItem("withdrawMonth")) || 0;
let lastResetMonth = localStorage.getItem("lastResetMonth") || getCurrentMonthKey();

let potUSD = parseFloat(localStorage.getItem("potUSD")) || 0;
let currentExchangeRate = parseFloat(localStorage.getItem("currentExchangeRate")) || 21000;
let exchangeRateMode = localStorage.getItem("exchangeRateMode") || "auto";
let lastPotTransactionRate = parseFloat(localStorage.getItem("lastPotTransactionRate")) || 0;

let withdrawnRealizedPnL = parseFloat(localStorage.getItem("withdrawnRealizedPnL")) || 0;

let tradeData   = JSON.parse(localStorage.getItem("tradeData"))   || {};
let potTransactions = JSON.parse(localStorage.getItem("potTransactions")) || [];
let debtors     = JSON.parse(localStorage.getItem("debtors"))     || {};
let debtHistory = JSON.parse(localStorage.getItem("debtHistory")) || {};

let historyByDay      = JSON.parse(localStorage.getItem("historyByDay"))      || {};
let portHistoryByDay  = JSON.parse(localStorage.getItem("portHistoryByDay"))  || {};
let debtActivityByDay = JSON.parse(localStorage.getItem("debtActivityByDay")) || {};

let viewingDate   = getTodayKey();
let activeHistTab = 'cash';

let cloudApiKey = localStorage.getItem("cloudApiKey") || "";
let cloudBinId  = localStorage.getItem("cloudBinId")  || "";

let tradeChartInstance = null;
let donutChartInstance = null;
let tradeTimeframe = "day";
let tradeCalViewYear = new Date().getFullYear();
let tradeCalViewMonth = new Date().getMonth();
let tradeEntryDateKey = null;
let archiveYear = new Date().getFullYear();
let archiveExpandedMonth = null;

let spareChange = parseFloat(localStorage.getItem("spareChange")) || 0;

let travelCalendar  = JSON.parse(localStorage.getItem("travelCalendar"))  || {};
let travelExpenses  = JSON.parse(localStorage.getItem("travelExpenses"))  || {};
let herbCalendar    = JSON.parse(localStorage.getItem("herbCalendar"))    || {};
let herbExpenses    = JSON.parse(localStorage.getItem("herbExpenses"))    || {};
let calViewYear  = new Date().getFullYear();
let calViewMonth = new Date().getMonth();
let expensePanelDateKey = null;

let pendingWithdrawUSD = 0;
let pendingWithdrawLAK = 0;
let pendingWithdrawRate = 0;
let potTransactionMode = "add";
let tradeYearView = new Date().getFullYear();

let travelMonthlySummary = JSON.parse(localStorage.getItem("travelMonthlySummary")) || {};
let herbMonthlySummary   = JSON.parse(localStorage.getItem("herbMonthlySummary"))   || {};

let travelGroupedChartInstance = null;

const LAO_MONTHS = ['ມັງກອນ','ກຸມພາ','ມີນາ','ເມສາ','ພຶດສະພາ','ມິຖຸນາ','ກໍລະກົດ','ສິງຫາ','ກັນຍາ','ຕຸລາ','ພະຈິກ','ທັນວາ'];
const LAO_MONTHS_SHORT = ['ມ.ກ.','ກ.ພ.','ມີ.ນ.','ເມ.ສ.','ພ.ພ.','ມິ.ຖ.','ກ.ກ.','ສ.ຫ.','ກ.ຍ.','ຕ.ລ.','ພ.ຈ.','ທ.ວ.'];
const LAO_DAYS = ['ອາທິດ','ຈັນ','ອັງຄານ','ພຸດ','ພະຫັດ','ສຸກ','ເສົາ'];
const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const THAI_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

// ==========================================================
// ฟังก์ชันจัดรูปแบบ
// ==========================================================

function formatNum(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDateAD(d) {
  return String(d.getDate()).padStart(2,'0') + '/' +
         String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
}

function formatTimeAD(d) {
  return String(d.getHours()).padStart(2,'0') + ':' +
         String(d.getMinutes()).padStart(2,'0') + ':' +
         String(d.getSeconds()).padStart(2,'0');
}

function formatDateTimeAD(d) {
  return formatDateAD(d) + ' ' + formatTimeAD(d);
}

function formatDateLao(d) {
  return 'ວັນ' + LAO_DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + LAO_MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear();
}

function dateKeyToLao(dateKey) {
  const d = new Date(dateKey + 'T00:00:00');
  return formatDateLao(d);
}

// ==========================================================
// Key helper
// ==========================================================

function getTodayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function getDateKeyDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function getMonthKeyPadded(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
}

function getCurrentMonthKey() {
  const n = new Date();
  return n.getFullYear() + '-' + (n.getMonth() + 1);
}

// ==========================================================
// Undo Stack
// ==========================================================
let stateHistory = [];

function pushToHistory() {
  stateHistory.push({
    totals:           JSON.parse(JSON.stringify(totals)),
    incomeMonth, withdrawMonth, potUSD, spareChange, withdrawnRealizedPnL,
    tradeData:        JSON.parse(JSON.stringify(tradeData)),
    potTransactions:  JSON.parse(JSON.stringify(potTransactions)),
    debtors:          JSON.parse(JSON.stringify(debtors)),
    debtHistory:      JSON.parse(JSON.stringify(debtHistory)),
    historyByDay:     JSON.parse(JSON.stringify(historyByDay)),
    portHistoryByDay: JSON.parse(JSON.stringify(portHistoryByDay)),
    debtActivityByDay:JSON.parse(JSON.stringify(debtActivityByDay))
  });
  if (stateHistory.length > 20) stateHistory.shift();
  updateUndoButtonState();
}

function handleUndo() {
  if (stateHistory.length === 0) {
    showCustomModal("ບໍ່ມີຫຍັງໃຫ້ຍ້ອນ");
    return;
  }
  const s = stateHistory.pop();
  totals            = s.totals;
  incomeMonth       = s.incomeMonth;
  withdrawMonth     = s.withdrawMonth;
  potUSD            = s.potUSD;
  spareChange       = s.spareChange !== undefined ? s.spareChange : spareChange;
  withdrawnRealizedPnL = s.withdrawnRealizedPnL !== undefined ? s.withdrawnRealizedPnL : withdrawnRealizedPnL;
  tradeData         = s.tradeData;
  potTransactions   = s.potTransactions || [];
  debtors           = s.debtors;
  debtHistory       = s.debtHistory;
  historyByDay      = s.historyByDay;
  portHistoryByDay  = s.portHistoryByDay  || {};
  debtActivityByDay = s.debtActivityByDay || {};

  saveData();
  updateSummary();
  updateDebtorsUI();
  renderTradeCalendar();
  renderTradeMonthlyStats();
  renderMonthlyArchive();
  renderHistoryForDate(getTodayKey());
  updateUndoButtonState();
  showCustomModal("↩️ ຍ້ອນໄດ້");
}

function updateUndoButtonState() {
  const btn = document.getElementById("undoGlobalBtn");
  if (!btn) return;
  if (stateHistory.length > 0) { btn.classList.add("active"); btn.disabled = false; }
  else { btn.classList.remove("active"); btn.disabled = true; }
}

// ==========================================================
// บันทึก / โหลดข้อมูล
// ==========================================================
function getPersistedStatePayload() {
  return {
    historyByDay, portHistoryByDay, debtActivityByDay,
    totals, percents, percentsLastSaved, categoryLabels,
    incomeMonth, withdrawMonth, lastResetMonth,
    potUSD, currentExchangeRate, exchangeRateMode,
    lastPotTransactionRate,
    tradeData, potTransactions, debtors, debtHistory,
    spareChange, withdrawnRealizedPnL,
    travelCalendar, travelExpenses, travelMonthlySummary,
    herbCalendar, herbExpenses, herbMonthlySummary
  };
}

function saveData() {
  localStorage.setItem("historyByDay",      JSON.stringify(historyByDay));
  localStorage.setItem("portHistoryByDay",  JSON.stringify(portHistoryByDay));
  localStorage.setItem("debtActivityByDay", JSON.stringify(debtActivityByDay));
  localStorage.setItem("spareChange",    spareChange);
  localStorage.setItem("totals",         JSON.stringify(totals));
  localStorage.setItem("percents",       JSON.stringify(percents));
  localStorage.setItem("categoryLabels", JSON.stringify(categoryLabels));
  localStorage.setItem("incomeMonth",    incomeMonth);
  localStorage.setItem("withdrawMonth",  withdrawMonth);
  localStorage.setItem("lastResetMonth", lastResetMonth);
  localStorage.setItem("potUSD",              potUSD);
  localStorage.setItem("withdrawnRealizedPnL", withdrawnRealizedPnL);
  localStorage.setItem("currentExchangeRate", currentExchangeRate);
  localStorage.setItem("exchangeRateMode",    exchangeRateMode);
  localStorage.setItem("lastPotTransactionRate", lastPotTransactionRate);
  localStorage.setItem("tradeData",   JSON.stringify(tradeData));
  localStorage.setItem("potTransactions", JSON.stringify(potTransactions));
  localStorage.setItem("debtors",     JSON.stringify(debtors));
  localStorage.setItem("debtHistory", JSON.stringify(debtHistory));
  localStorage.setItem("travelCalendar", JSON.stringify(travelCalendar));
  localStorage.setItem("travelExpenses", JSON.stringify(travelExpenses));
  localStorage.setItem("herbCalendar",  JSON.stringify(herbCalendar));
  localStorage.setItem("herbExpenses",  JSON.stringify(herbExpenses));
  localStorage.setItem("travelMonthlySummary", JSON.stringify(travelMonthlySummary));
  localStorage.setItem("herbMonthlySummary",   JSON.stringify(herbMonthlySummary));
  localStorage.setItem("anoualdenStateJSON", JSON.stringify(getPersistedStatePayload()));
  triggerAutoCloudBackup();
}

// ==========================================================
// สลับแท็บหลัก
// ==========================================================
function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  const activeBtn = Array.from(document.querySelectorAll(".tab-btn")).find(
    b => b.getAttribute("onclick") && b.getAttribute("onclick").includes(tabId)
  );
  if (activeBtn) activeBtn.classList.add("active");

  if (tabId === 'cash-tab') setTimeout(() => { renderCompareDonut(); renderCategoryBarChart(); renderMonthlyArchive(); }, 80);
  else if (tabId === 'port-tab') setTimeout(() => { renderCompareDonut(); renderTradeCalendar(); renderTradeMonthlyStats(); }, 80);
  else if (tabId === 'travel-tab') setTimeout(() => { renderCalendar(); renderRecentTrips(); renderTravelGroupedChart(); }, 80);
}

// ==========================================================
// Modal ทั่วไป
// ==========================================================
function showCustomModal(title, msg, onConfirm = null) {
  document.getElementById("modalTitle").textContent   = title;
  document.getElementById("modalMessage").textContent = msg || '';
  const confirmBtn = document.getElementById("modalBtnConfirm");
  confirmBtn.onclick = () => { closeCustomModal(); if (onConfirm) onConfirm(); };
  document.getElementById("customModalOverlay").style.display = "flex";
}
function closeCustomModal() {
  document.getElementById("customModalOverlay").style.display = "none";
}

// ==========================================================
// แก้ชื่อหมวดหมู่
// ==========================================================
function startEditCategoryName(cat) {
  const labelSpan = document.getElementById("labelPercent" + capitalize(cat));
  const currentName = categoryLabels[cat];
  labelSpan.innerHTML = `<input type="text" value="${currentName}" style="width:80px;">`;
  const input = labelSpan.querySelector("input");
  input.focus(); input.select();
  const save = () => finishEditCategoryName(cat, input.value);
  input.addEventListener("blur", save);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") input.blur(); });
}
function finishEditCategoryName(cat, newName) {
  newName = newName.trim();
  if (newName) { pushToHistory(); categoryLabels[cat] = newName; }
  saveData(); renderCategoryLabelsUI(); updateSummary();
}
function renderCategoryLabelsUI() {
  categories.forEach(cat => {
    const el = document.getElementById("labelPercent" + capitalize(cat));
    if (el) el.textContent = categoryLabels[cat] + ":";
  });
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// ==========================================================
// สัดส่วน%
// ==========================================================
function savePercentages() {
  let sum = 0;
  const idMap = { invest:"percentInvest", spend:"percentSpend", save:"percentSave", fun:"percentFun", emergency:"percentEmergency" };
  categories.forEach(cat => {
    const val = Number(document.getElementById(idMap[cat]).value);
    percents[cat] = val; sum += val;
  });
  const errorDiv = document.getElementById("percentError");
  if (sum !== 100) {
    errorDiv.textContent = "ສັດສ່ວນຕ້ອງລວມໄດ້ 100%";
  } else {
    errorDiv.textContent = "";
    pushToHistory();
    percentsLastSaved = new Date().toISOString();
    localStorage.setItem("percentsLastSaved", percentsLastSaved);
    saveData();
    renderPercentsLastSavedLabel();
    showCustomModal(" ບັນທຶກແຫລະ");
  }
  updateSummary();
}

function loadPercentsToUI() {
  const idMap = { invest:"percentInvest", spend:"percentSpend", save:"percentSave", fun:"percentFun", emergency:"percentEmergency" };
  categories.forEach(cat => {
    const el = document.getElementById(idMap[cat]);
    if (el) el.value = percents[cat];
  });
  renderPercentsLastSavedLabel();
}

function renderPercentsLastSavedLabel() {
  const el = document.getElementById("percentsLastSavedLabel");
  if (!el) return;
  if (percentsLastSaved) {
    const d = new Date(percentsLastSaved);
    el.textContent = " ບັນທຶກຫຼ້າສຸດ: " + formatDateTimeAD(d);
  } else {
    el.textContent = "ຍັງບໍ່ໄດ້ບັນທຶກສັດສ່ວນ";
  }
}

// ==========================================================
// ເພີ່ມເງິນ
// ==========================================================
function stripSpareChange(cat) {
  const remainder = totals[cat] % 1000;
  if (remainder > 0.0001) {
    totals[cat] -= remainder;
    spareChange += remainder;
    logCashHistory(` ຄັດເງິນເສດ +${formatNum(remainder)} ກີບ (${categoryLabels[cat]}) → ໝວດເງິນເສດ`);
  }
}

function handleIncome() {
  const incomeInput = document.getElementById("incomeInput");
  const income = parseMoneyVal(incomeInput);
  if (!income || income <= 0) return;
  pushToHistory();

  categories.forEach(cat => {
    totals[cat] += (income * percents[cat]) / 100;
  });
  incomeMonth += income;

  let collected = 0;
  categories.forEach(cat => {
    const remainder = totals[cat] % 1000;
    if (remainder > 0) {
      collected += remainder;
      totals[cat] = totals[cat] - remainder;
    }
  });
  if (collected > 0) {
    spareChange += collected;
    logCashHistory(` ຄັດເງິນເສດ +${formatNum(collected)} ກີບ → ໝວດເງິນເສດ`);
  }

  incomeInput.value = "";
  logCashHistory(` ເພີ່ມເງິນ ${formatNum(income)} ກີບ`);
  saveData(); updateSummary();
  showCustomModal("ເພີ່ເຂັ້າແລ້ວ!");
}

// ==========================================================
// ຖອນ / ໂອນ
// ==========================================================
function handleSingleWithdraw(cat) {
  const input = document.getElementById(`withdraw-${cat}`);
  const amount = parseMoneyVal(input);
  if (!amount || amount <= 0 || amount > totals[cat]) {
    showCustomModal("ແຈ້ງເຕືອນ", "ກວນຕີນ");
    return;
  }
  pushToHistory();
  totals[cat] -= amount; withdrawMonth += amount;
  logCashHistory(` ຖອນຈາກ ${categoryLabels[cat]} ${formatNum(amount)} ກີບ`);
  stripSpareChange(cat);
  input.value = ""; saveData(); updateSummary();
}

function handleTransfer() {
  const from   = document.getElementById("transferFrom").value;
  const to     = document.getElementById("transferTo").value;
  const amount = parseMoneyVal(document.getElementById("transferAmount"));
  if (from === to || !amount || amount <= 0 || amount > totals[from]) {
    showCustomModal("ໃສ່ເງີນບໍ່ຖືກບັກສັສ", "ເບີ່ງເງີນໃຫທ່ແລະ ໝວດປາຍທາງ");
    return;
  }
  pushToHistory();
  totals[from] -= amount; totals[to] += amount;
  logCashHistory(` ໂອນ ${formatNum(amount)} ກີບ ຈາກ ${categoryLabels[from]} → ${categoryLabels[to]}`);
  stripSpareChange(from);
  stripSpareChange(to);
  document.getElementById("transferAmount").value = "";
  saveData(); updateSummary();
  showCustomModal(" ໂອນເງີນຮຽບຮ້ອຍ");
}

// ==========================================================
// ພອດ
// ==========================================================
function formatPotUSD(value) {
  return (Number(value) || 0).toFixed(2);
}

function getPotTransactionDateKey(transaction) {
  if (transaction?.dateKey) return transaction.dateKey;
  if (transaction?.timestamp) return String(transaction.timestamp).slice(0, 10);
  return "";
}

function getLatestPotRate() {
  if (lastPotTransactionRate > 0) return lastPotTransactionRate;
  const latest = potTransactions.find(transaction => Number(transaction.rate) > 0);
  return latest ? Number(latest.rate) : currentExchangeRate;
}

function getPotPortfolioStats() {
  let depositedUSD = 0;
  let withdrawnUSD = 0;
  potTransactions.forEach(transaction => {
    const usd = Number(transaction.usd) || 0;
    if (transaction.type === "deposit" || transaction.type === "add") depositedUSD += usd;
    if (transaction.type === "withdraw") withdrawnUSD += usd;
  });
  const grossPrincipal = depositedUSD > 0 ? depositedUSD : Math.max(0, potUSD);
  const principalRemaining = Math.max(0, grossPrincipal - withdrawnUSD);
  const currentUSD = Math.max(0, potUSD + getUnrealizedPnL());
  return {
    depositedUSD: grossPrincipal,
    withdrawnUSD,
    principalRemaining,
    currentUSD,
    profitUSD: currentUSD - principalRemaining
  };
}

function renderPotPortfolioBalance() {
  const balanceNote = document.getElementById("potTxnBalanceNote");
  if (!balanceNote) return;
  if (potTransactionMode === "add") {
    balanceNote.innerHTML = `<span>${categoryLabels.invest}</span><strong>${formatNum(totals.invest)} ກີບ</strong>`;
    return;
  }
  const stats = getPotPortfolioStats();
  const profitClass = stats.profitUSD >= 0 ? "positive" : "negative";
  balanceNote.innerHTML = `
    <div class="pot-balance-primary">
      <span>ຍອດທີ່ຢູ່ໃນພອດ / ຖອນໄດ້</span>
      <strong>${formatPotUSD(stats.currentUSD)} USD</strong>
    </div>
    <div class="pot-balance-grid">
      <span>ຕົ້ນທຶນທີ່ເຕີມ <b>${formatPotUSD(stats.depositedUSD)}</b></span>
       <span>ຍອດປັດຈຸບັນ <b>${formatPotUSD(stats.currentUSD)}</b></span>
      <span class="${profitClass}">ກຳໄລ/ຂາດທຶນ <b>${signedUSD(stats.profitUSD)}</b></span>
    </div>`;
}

function openPotTransactionModal(mode) {
  potTransactionMode = mode === "withdraw" ? "withdraw" : "add";
  const title = document.getElementById("potTxnTitle");
  const eyebrow = document.getElementById("potTxnEyebrow");
  const helper = document.getElementById("potTxnHelper");
  const lakInput = document.getElementById("potTxnLak");
  const usdInput = document.getElementById("potTxnUsd");
  const lakWrap = document.getElementById("potTxnLakWrap");
  const lakLabel = document.getElementById("potTxnLakLabel");
  const usdLabel = document.getElementById("potTxnUsdLabel");
  const rateLabel = document.getElementById("potTxnRateLabel");
  const distribution = document.getElementById("potWithdrawDistribution");
  if (title) title.textContent = potTransactionMode === "add" ? "ເພີ່ມພອດ" : "ຖອນພອດ";
  if (eyebrow) eyebrow.textContent = potTransactionMode === "add" ? "ADD CAPITAL" : "WITHDRAW CAPITAL";
  if (helper) helper.textContent = potTransactionMode === "add"
    ? "ກອກເງິນກີບ ແລະ USD ຕາມລາຍການຈິງ. ການເພີ່ມຈະຫັກຈາກໝວດລົງທຶນເທົ່ານັ້ນ."
    : "ກອກ 2 ຊ່ອງເທິງເພື່ອຄຳນວນເລດ ແລະກອກຊ່ອງລຸ່ມເປັນເງິນກີບທີ່ເຂົ້າກະເປົາຈິງ.";
  if (lakLabel) lakLabel.textContent = potTransactionMode === "add"
    ? "ເງິນທຶນ (ກີບ)"
    : "ເງິນກີບຂອງລາຍການ (ຄຳນວນເລດ)";
  if (usdLabel) usdLabel.textContent = potTransactionMode === "add" ? "ຈຳນວນ USD" : "USD ທີ່ຖອນຈາກພອດ";
  if (rateLabel) rateLabel.textContent = potTransactionMode === "add"
    ? "ເລດຂອງລາຍການນີ້"
    : "ເລດຈາກ 2 ຊ່ອງເທິງ";
  if (lakInput) lakInput.value = "";
  if (usdInput) usdInput.value = "";
  const withdrawLakInput = document.getElementById("withdrawReceivedLak");
  if (withdrawLakInput) withdrawLakInput.value = "";
  if (lakWrap) lakWrap.style.display = "flex";
  if (distribution) distribution.style.display = potTransactionMode === "withdraw" ? "block" : "none";
  if (potTransactionMode === "withdraw") prepareWithdrawDistributionUI();
  renderPotPortfolioBalance();
  updatePotTransactionPreview();
  const modal = document.getElementById("potTransactionModal");
  if (modal) modal.style.display = "flex";
  setTimeout(() => lakInput?.focus(), 40);
}

function closePotTransactionModal() {
  const modal = document.getElementById("potTransactionModal");
  if (modal) modal.style.display = "none";
  pendingWithdrawUSD = 0;
  pendingWithdrawLAK = 0;
  pendingWithdrawRate = 0;
}

function updatePotTransactionPreview() {
  const rateEl = document.getElementById("potTxnRateDisplay");
  const effectEl = document.getElementById("potTxnEffect");
  const lak = parseMoneyVal(document.getElementById("potTxnLak"));
  const usd = parseMoneyVal(document.getElementById("potTxnUsd"));
  const rate = usd > 0 ? lak / usd : 0;
  renderPotPortfolioBalance();
  if (rateEl) {
    rateEl.textContent = rate > 0
      ? `${rate.toLocaleString("en-US", { maximumFractionDigits: 2 })} LAK / USD`
      : `${getLatestPotRate().toLocaleString("en-US", { maximumFractionDigits: 2 })} LAK / USD · ຫຼ້າສຸດ`;
  }
  if (!effectEl) return;
  const receivedLak = parseMoneyVal(document.getElementById("withdrawReceivedLak"));
  if (!lak && !usd && !receivedLak) {
    effectEl.textContent = potTransactionMode === "add"
      ? "ກອກເງິນທັງສອງຊ່ອງ"
      : "ກອກ USD + ກີບ 2 ຊ່ອງເທິງ ແລະເງິນກີບຊ່ອງລຸ່ມ";
    effectEl.className = "pot-txn-effect";
    return;
  }
  if (!lak || !usd) {
    effectEl.textContent = "ຕ້ອງກອກທັງເງິນກີບ ແລະ USD";
    effectEl.className = "pot-txn-effect warning";
    return;
  }
  if (potTransactionMode === "withdraw" && !receivedLak) {
    effectEl.textContent = "ຕ້ອງກອກເງິນກີບທີ່ເຂົ້າກະເປົາຈິງ";
    effectEl.className = "pot-txn-effect warning";
    return;
  }
  const text = potTransactionMode === "add"
    ? `ຈະຫັກ ${formatNum(lak)} ກີບຈາກ ${categoryLabels.invest} ແລະເພີ່ມ ${formatPotUSD(usd)} USD`
    : `ຈະຫັກ ${formatPotUSD(usd)} USD ຈາກພອດ ແລະບັນທຶກເຂົ້າກະເປົາ ${formatNum(receivedLak)} ກີບ`;
  effectEl.textContent = text;
  const currentValue = getPotPortfolioStats().currentUSD;
  effectEl.className = "pot-txn-effect" +
    ((potTransactionMode === "add" && lak > totals.invest) ||
     (potTransactionMode === "withdraw" && usd > currentValue) ? " warning" : "");
}

function syncWithdrawalReceivedLak(value) {
  updatePotTransactionPreview();
}

function createPotTransaction(type, lak, usd, rate, extra = {}) {
  return {
    id: `pot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    dateKey: getTodayKey(),
    timestamp: new Date().toISOString(),
    lak: Number(lak.toFixed(2)),
    usd: Number(usd.toFixed(2)),
    rate: Number(rate.toFixed(4)),
    ...extra
  };
}

function prepareWithdrawDistributionUI() {
  const usdAmount = parseMoneyVal(document.getElementById("potTxnUsd")) || pendingWithdrawUSD || 0;
  const lakAmount = parseMoneyVal(document.getElementById("potTxnLak")) || pendingWithdrawLAK || 0;
  const rate = usdAmount > 0 && lakAmount > 0 ? lakAmount / usdAmount : getLatestPotRate();
  const catSel = document.getElementById("distCategory");
  if (catSel) {
    catSel.innerHTML = categories.map(cat => `<option value="${cat}">${categoryLabels[cat]}</option>`).join("");
  }
  const customRows = document.getElementById("distCustomRows");
  if (customRows) {
    customRows.innerHTML = categories.map(cat => `
      <div class="dist-custom-row">
        <span>${categoryLabels[cat]}</span>
        <input type="number" step="0.01" min="0" id="distCustom-${cat}" value="${percents[cat]}">
        <span>%</span>
      </div>`).join("");
  }
  const firstRadio = document.querySelector('input[name="distMode"][value="category"]');
  if (firstRadio) firstRadio.checked = true;
  showDistPanel("category");
  const error = document.getElementById("distCustomError");
  if (error) error.textContent = "";
}

function confirmPotTransaction() {
  const lak = parseMoneyVal(document.getElementById("potTxnLak"));
  const usd = parseMoneyVal(document.getElementById("potTxnUsd"));
  const receivedLak = parseMoneyVal(document.getElementById("withdrawReceivedLak"));
  if (lak <= 0 || usd <= 0) {
    showCustomModal("⚠️ ຂໍ້ມູນບໍ່ຄົບ", "ກອກເງິນກີບ ແລະ USD ໃຫ້ຄົບກ່ອນ");
    return;
  }
  if (potTransactionMode === "withdraw" && receivedLak <= 0) {
    showCustomModal("⚠️ ຂໍ້ມູນບໍ່ຄົບ", "ກອກເງິນກີບທີ່ເຂົ້າກະເປົາຈິງໃຫ້ຄົບກ່ອນ");
    return;
  }
  const rate = lak / usd;
  if (potTransactionMode === "add") {
    if (lak > totals.invest + 0.0001) {
      showCustomModal("⚠️ ເງິນລົງທຶນບໍ່ພໍ", `${categoryLabels.invest} ມີ ${formatNum(totals.invest)} ກີບ`);
      return;
    }
    pushToHistory();
    totals.invest -= lak;
    potUSD += usd;
    lastPotTransactionRate = rate;
    potTransactions.unshift(createPotTransaction("deposit", lak, usd, rate));
    logCashHistory(` ຫັກຈາກ ${categoryLabels.invest} ໄປພອດ ${formatNum(lak)} ກີບ`);
    logPortHistory(` ເພີ່ມພອດ +${formatPotUSD(usd)} USD (${formatNum(lak)} ກີບ, ເລດ ${rate.toFixed(2)})`);
    stripSpareChange("invest");
    closePotTransactionModal();
    saveData(); updateSummary(); renderTradeMonthlyStats();
    showCustomModal("✅ ເພີ່ມພອດແລ້ວ", `ເລດລາຍການ ${rate.toFixed(2)} LAK/USD`);
    return;
  }

  const currentPotValue = getPotPortfolioStats().currentUSD;
  if (usd > currentPotValue + 0.0001) {
    showCustomModal("⚠️ ເງິນພອດບໍ່ພໍ", `ຍອດທີ່ຖອນໄດ້ສູງສຸດ ${formatPotUSD(Math.max(0, currentPotValue))} USD`);
    return;
  }
  const portfolioBefore = getPotPortfolioStats();
  pendingWithdrawUSD = usd;
  pendingWithdrawLAK = receivedLak;
  pendingWithdrawRate = rate;
  const mode = document.querySelector('input[name="distMode"]:checked')?.value || "category";
  let customShares = null;
  if (mode === "custom") {
    customShares = {};
    let sum = 0;
    categories.forEach(cat => {
      customShares[cat] = Number(document.getElementById(`distCustom-${cat}`)?.value) || 0;
      sum += customShares[cat];
    });
    if (Math.abs(sum - 100) > 0.0001) {
      const error = document.getElementById("distCustomError");
      if (error) error.textContent = "ສັດສ່ວນຕ້ອງລວມໄດ້ 100%";
      return;
    }
  }

  pushToHistory();
  const totalPnLNow = getTotalTradePnL();
  const unrealizedPnL = totalPnLNow - withdrawnRealizedPnL;
  potUSD = Math.max(0, potUSD + unrealizedPnL - pendingWithdrawUSD);
  withdrawnRealizedPnL = totalPnLNow;
  lastPotTransactionRate = rate;
  logPortHistory(` ຖອນພອດ -${formatPotUSD(pendingWithdrawUSD)} USD, ລາຍການ ${formatNum(lak)} ກີບ, ເຂົ້າກະເປົາຈິງ ${formatNum(pendingWithdrawLAK)} ກີບ`);

  if (mode === "category") {
    const cat = document.getElementById("distCategory").value;
    totals[cat] += receivedLak;
    incomeMonth += receivedLak;
    logCashHistory(` ຮັບຈາກພອດ ${formatNum(receivedLak)} ກີບ → ${categoryLabels[cat]}`);
    stripSpareChange(cat);
  } else {
    categories.forEach(cat => {
      const pct = mode === "percent" ? percents[cat] : customShares[cat];
      const share = (receivedLak * pct) / 100;
      const remainder = share % 1000;
      totals[cat] += share - remainder;
      if (remainder > 0) spareChange += remainder;
    });
    incomeMonth += receivedLak;
    logCashHistory(` ຮັບຈາກພອດ ${formatNum(receivedLak)} ກີບ (${mode === "percent" ? "ແບ່ງຕາມ%" : "ຕັ້ງ% ເອງ"})`);
  }

  potTransactions.unshift(createPotTransaction("withdraw", lak, usd, rate, {
    distribution: mode,
    category: mode === "category" ? document.getElementById("distCategory").value : null,
    receivedLak,
    principalBeforeUSD: portfolioBefore.principalRemaining,
    currentBeforeUSD: currentPotValue
  }));
  closePotTransactionModal();
  saveData(); updateSummary();
  renderTradeMonthlyStats();
  showCustomModal("✅ ຖອນແລ້ວ", `ເລດລາຍການ ${rate.toFixed(2)} LAK/USD`);
}

function showDistPanel(mode) {
  document.getElementById("distCategoryWrap").style.display = mode === 'category' ? 'block' : 'none';
  document.getElementById("distPercentWrap").style.display  = mode === 'percent'  ? 'block' : 'none';
  document.getElementById("distCustomWrap").style.display   = mode === 'custom'   ? 'block' : 'none';
}

function confirmWithdrawDistribution() {
  confirmPotTransaction();
}

// ==========================================================
// Exchange Rate
// ==========================================================
function setExchangeRateMode(mode) {
  exchangeRateMode = mode;
  document.getElementById("rateModeAuto").classList.toggle("active", mode === "auto");
  document.getElementById("rateModeManual").classList.toggle("active", mode === "manual");
  document.getElementById("manualRateContainer").style.display = mode === "manual" ? "block" : "none";
  if (mode === "auto") { fetchExchangeRate(true); }
  else {
    const r = parseFloat(document.getElementById("manualRateInput").value) || 21000;
    currentExchangeRate = r; updatePotSummary();
  }
  saveData();
}

function updateManualRate(val) {
  const p = parseFloat(val);
  if (p && p > 0) { currentExchangeRate = p; updatePotSummary(); }
}

async function fetchExchangeRate(forceRefresh) {
  if (exchangeRateMode === "manual") return;
  const cached = JSON.parse(localStorage.getItem("exchangeRateData")) || null;
  const oneHour = 60 * 60 * 1000;
  if (!forceRefresh && cached && (Date.now() - cached.updatedAt < oneHour)) {
    currentExchangeRate = cached.rate; updateRateUpdatedLabel(cached.updatedAt, false); updatePotSummary(); return;
  }
  try {
    const res  = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    if (data?.rates?.LAK) {
      currentExchangeRate = data.rates.LAK;
      const now = Date.now();
      localStorage.setItem("exchangeRateData", JSON.stringify({ rate: currentExchangeRate, updatedAt: now }));
      updateRateUpdatedLabel(now, false);
    } else throw new Error("no LAK");
  } catch {
    if (cached) { currentExchangeRate = cached.rate; updateRateUpdatedLabel(cached.updatedAt, true); }
    else { currentExchangeRate = 21000; updateRateUpdatedLabel(null, true); }
  }
  updatePotSummary();
}

function updateRateUpdatedLabel(ts, offline) {
  const el = document.getElementById("rateUpdatedAt");
  if (!el) return;
  el.textContent = offline
    ? "ດຶງສົດບໍ່ໄດ້ ໃຊ້ຄ່າຫຼ້າສຸດ" + (ts ? " (" + formatDateTimeAD(new Date(ts)) + ")" : "")
    : "ອັບເດດລ່າສຸດ: " + formatDateTimeAD(new Date(ts));
}

function getTotalTradePnL() {
  return Object.values(tradeData).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function getUnrealizedPnL() {
  return getTotalTradePnL() - withdrawnRealizedPnL;
}

function updatePotSummary() {
  const rate = currentExchangeRate || 0;
  const portfolio = getPotPortfolioStats();
  const capitalUSD = portfolio.principalRemaining;
  const cur = portfolio.currentUSD;
  const pnlUSD = portfolio.profitUSD;
  const potLAK = cur * rate;
  const capLAK = capitalUSD * rate;
  const pnlLAK = pnlUSD * rate;

  document.getElementById("heroPotUSD").textContent   = cur.toFixed(2) + " USD";
  document.getElementById("heroPotLAK").textContent   = "≈ " + formatNum(potLAK) + " ກີບ";
  document.getElementById("exchangeRateDisplay").textContent = rate ? rate.toLocaleString('en-US',{maximumFractionDigits:2}) : "-";
  document.getElementById("metricCapitalUSD").textContent = capitalUSD.toFixed(2) + " USD";
  document.getElementById("metricCapitalLAK").textContent = "≈ " + formatNum(capLAK) + " ກີບ";
  document.getElementById("metricCurrentUSD").textContent = cur.toFixed(2) + " USD";
  document.getElementById("metricCurrentLAK").textContent = "≈ " + formatNum(potLAK) + " ກີບ";
  const pnlEl = document.getElementById("metricPnLUSD");
  if (pnlEl) {
    pnlEl.textContent = (pnlUSD >= 0 ? "+" : "") + pnlUSD.toFixed(2) + " USD";
    pnlEl.className = "metric-value " + (pnlUSD >= 0 ? "pnl-profit" : "pnl-loss");
  }
  document.getElementById("metricPnLLAK").textContent =
    (pnlUSD >= 0 ? "+" : "-") + formatNum(Math.abs(pnlLAK)) + " ກີບ";
  renderCompareDonut();
}

// ==========================================================
// Trade log / PNL calendar
// ==========================================================
function handleTradeLogProcess() {
  const dateInput = document.getElementById("tradeDate")?.value;
  if (!dateInput) return;
  tradeEntryDateKey = dateInput;
  saveTradeFromPanel();
}

function pruneTradeData() {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 10);
  const cutoff = cutoffDate.getFullYear() + '-' +
    String(cutoffDate.getMonth() + 1).padStart(2, '0') + '-' +
    String(cutoffDate.getDate()).padStart(2, '0');
  Object.keys(tradeData).forEach(k => {
    if (k < cutoff) delete tradeData[k];
  });
}

function getTradeCalendarMonthIndex(year, month) {
  return year * 12 + month;
}

function getTradeCalendarMinMonthIndex() {
  const now = new Date();
  return getTradeCalendarMonthIndex(now.getFullYear(), now.getMonth()) - 119;
}

function getTradeDateKey(year, month, day) {
  return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

function hasPortfolioFunding() {
  return potUSD > 0.0001 ||
    potTransactions.some(transaction =>
      (transaction.type === "deposit" || transaction.type === "add") &&
      Number(transaction.usd) > 0
    );
}

function formatTradeDate(dateKey) {
  const d = new Date(dateKey + 'T00:00:00');
  return 'ວັນທີ ' + d.getDate() + ' ' + THAI_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}

function formatTradeUSD(value, signed = true) {
  const n = Number(value) || 0;
  const sign = signed && n > 0 ? '+' : n < 0 ? '-' : '';
  return sign + Math.abs(n).toFixed(2) + ' USD';
}

function parseTradeUSDValue() {
  const input = document.getElementById("tradeAmount");
  return parseMoneyVal(input);
}

function changeTradeCalMonth(delta) {
  if (!hasPortfolioFunding()) {
    showCustomModal("⚠️ ເພີ່ມພອດກ່ອນ", "ຕ້ອງເພີ່ມເງິນເຂົ້າພອດກ່ອນ ຈຶ່ງຈະເລື່ອນປະຕິທິນເທຣດໄດ້");
    return;
  }
  const nextIndex = getTradeCalendarMonthIndex(tradeCalViewYear, tradeCalViewMonth) + delta;
  const now = new Date();
  const currentIndex = getTradeCalendarMonthIndex(now.getFullYear(), now.getMonth());
  if (nextIndex < getTradeCalendarMinMonthIndex() || nextIndex > currentIndex) return;
  tradeCalViewYear = Math.floor(nextIndex / 12);
  tradeCalViewMonth = nextIndex % 12;
  tradeYearView = tradeCalViewYear;
  hideTradeEntryPanel();
  renderTradeCalendar();
  renderTradeMonthlyStats();
}

function showTradeEntryPanel(dateKey) {
  if (dateKey > getTodayKey()) return;
  if (!hasPortfolioFunding()) {
    showCustomModal("⚠️ ເພີ່ມພອດກ່ອນ", "ຕ້ອງກົດເພີ່ມພອດ ແລະມີເງິນໃນພອດກ່ອນບັນທຶກຜົນເທຣດ");
    return;
  }
  tradeEntryDateKey = dateKey;
  const panel = document.getElementById("tradeEntryPanel");
  if (!panel) return;
  const dateEl = document.getElementById("tradeEntryDate");
  if (dateEl) dateEl.textContent = formatTradeDate(dateKey);

  const value = Number(tradeData[dateKey]) || 0;
  const typeEl = document.getElementById("tradeType");
  const amountEl = document.getElementById("tradeAmount");
  if (typeEl) typeEl.value = value < 0 ? "loss" : "profit";
  if (amountEl) setMoneyInputValue(amountEl, value ? Math.abs(value).toFixed(2) : "");
  panel.style.display = "block";
}

function hideTradeEntryPanel() {
  const panel = document.getElementById("tradeEntryPanel");
  if (panel) panel.style.display = "none";
  tradeEntryDateKey = null;
}

function saveTradeFromPanel() {
  if (!tradeEntryDateKey) return;
  if (!hasPortfolioFunding()) {
    showCustomModal("⚠️ ເພີ່ມພອດກ່ອນ", "ຕ້ອງເພີ່ມເງິນເຂົ້າພອດກ່ອນ ຈຶ່ງຈະບັນທຶກຜົນເທຣດໄດ້");
    return;
  }
  const amount = parseTradeUSDValue();
  if (!amount || amount <= 0) {
    showCustomModal("⚠️ ແຈ້ງເຕືອນ", "ໃສ່ຈຳນວນຜົນການເທຣດກ່ອນ");
    return;
  }
  pushToHistory();
  const type = document.getElementById("tradeType")?.value || "profit";
  const finalAmount = type === "loss" ? -amount : amount;
  const previous = Number(tradeData[tradeEntryDateKey]) || 0;
  tradeData[tradeEntryDateKey] = Number(finalAmount.toFixed(2));
  logPortHistory(` ເທຣດ ${tradeEntryDateKey}: ${formatTradeUSD(finalAmount)}`);
  saveData();
  updateSummary();
  renderTradeCalendar();
  renderTradeMonthlyStats();
  hideTradeEntryPanel();
  if (previous !== finalAmount) showCustomModal("✅ ບັນທຶກຜົນແລ້ວ", formatTradeUSD(finalAmount));
}

function deleteTradeFromPanel() {
  if (!tradeEntryDateKey || tradeData[tradeEntryDateKey] === undefined) {
    hideTradeEntryPanel();
    return;
  }
  const removed = Number(tradeData[tradeEntryDateKey]) || 0;
  pushToHistory();
  delete tradeData[tradeEntryDateKey];
  logPortHistory(` ລຶບຜົນເທຣດ ${tradeEntryDateKey}: ${formatTradeUSD(removed)}`);
  saveData();
  updateSummary();
  renderTradeCalendar();
  renderTradeMonthlyStats();
  hideTradeEntryPanel();
  showCustomModal("✅ ລຶບລາຍການແລ້ວ", formatTradeUSD(removed));
}

function renderTradeCalendar() {
  const grid = document.getElementById("tradeDaysGrid");
  if (!grid) return;
  const monthLabel = document.getElementById("tradeCalMonthLabel");
  const monthKey = tradeCalViewYear + '-' + String(tradeCalViewMonth + 1).padStart(2, '0');
  if (monthLabel) monthLabel.textContent = THAI_MONTHS[tradeCalViewMonth] + ' ' + tradeCalViewYear;

  const firstDay = new Date(tradeCalViewYear, tradeCalViewMonth, 1).getDay();
  const daysInMonth = new Date(tradeCalViewYear, tradeCalViewMonth + 1, 0).getDate();
  const today = getTodayKey();
  const funded = hasPortfolioFunding();
  const notice = document.getElementById("tradeFundingNotice");
  if (notice) notice.style.display = funded ? "none" : "block";
  ["tradePrevMonthBtn", "tradeNextMonthBtn"].forEach(id => {
    const button = document.getElementById(id);
    if (button) button.disabled = !funded;
  });
  grid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    grid.appendChild(empty);
  }

  let monthProfit = 0;
  let monthLoss = 0;
  let totalPnL = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = monthKey + '-' + String(day).padStart(2, '0');
    const value = Number(tradeData[dateKey]) || 0;
    totalPnL += value;
    if (value > 0) monthProfit += value;
    if (value < 0) monthLoss += Math.abs(value);

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cal-day trade-cal-day" +
      (value > 0 ? " trade-positive" : value < 0 ? " trade-negative" : "") +
      (dateKey === today ? " today" : "") +
      (dateKey > today ? " future" : "") +
      (!funded ? " trade-locked" : "");
    cell.disabled = dateKey > today || !funded;
    cell.innerHTML = `<span class="cal-day-num">${day}</span><span class="trade-day-pnl">${formatTradeUSD(value).replace(" USD", "")}</span>`;
    cell.addEventListener("click", () => showTradeEntryPanel(dateKey));
    grid.appendChild(cell);
  }

  const profitEl = document.getElementById("tradeMonthProfit");
  const lossEl = document.getElementById("tradeMonthLoss");
  if (profitEl) profitEl.textContent = '+' + monthProfit.toFixed(2);
  if (lossEl) lossEl.textContent = '-' + monthLoss.toFixed(2);

  totalPnL = Object.values(tradeData).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const totalEl = document.getElementById("totalTradeResult");
  if (totalEl) {
    totalEl.textContent = (totalPnL >= 0 ? '+' : '-') + Math.abs(totalPnL).toFixed(2) + ' USD';
    totalEl.className = totalPnL >= 0 ? "trade-profit" : "trade-loss";
  }
}

function getTradeMonthStats(year, month) {
  const monthKey = year + '-' + String(month + 1).padStart(2, '0');
  const stats = {
    depositUSD: 0, depositLAK: 0, withdrawUSD: 0, withdrawLAK: 0,
    pnl: 0, winDays: 0, lossDays: 0, tradeDays: 0, cumulativePnL: 0
  };
  Object.keys(tradeData).forEach(dateKey => {
    if (!dateKey.startsWith(monthKey + '-')) return;
    const value = Number(tradeData[dateKey]) || 0;
    stats.pnl += value;
    if (value > 0) stats.winDays++;
    if (value < 0) stats.lossDays++;
    if (value !== 0) stats.tradeDays++;
  });
  potTransactions.forEach(transaction => {
    if (getPotTransactionDateKey(transaction).slice(0, 7) !== monthKey) return;
    const lak = Number(transaction.lak) || 0;
    const usd = Number(transaction.usd) || 0;
    if (transaction.type === "deposit" || transaction.type === "add") {
      stats.depositLAK += lak; stats.depositUSD += usd;
    } else if (transaction.type === "withdraw") {
      stats.withdrawLAK += lak; stats.withdrawUSD += usd;
    }
  });
  for (let m = 0; m <= month; m++) {
    const key = year + '-' + String(m + 1).padStart(2, '0');
    Object.keys(tradeData).forEach(dateKey => {
      if (dateKey.startsWith(key + '-')) stats.cumulativePnL += Number(tradeData[dateKey]) || 0;
    });
  }
  stats.growth = stats.depositUSD > 0 ? (stats.pnl / stats.depositUSD) * 100 : null;
  return stats;
}

function getTradeYearStats(year) {
  const stats = {
    depositUSD: 0, depositLAK: 0, withdrawUSD: 0, withdrawLAK: 0,
    pnl: 0, winDays: 0, lossDays: 0, tradeDays: 0
  };
  Object.keys(tradeData).forEach(dateKey => {
    if (!dateKey.startsWith(year + '-')) return;
    const value = Number(tradeData[dateKey]) || 0;
    stats.pnl += value;
    if (value > 0) stats.winDays++;
    if (value < 0) stats.lossDays++;
    if (value !== 0) stats.tradeDays++;
  });
  potTransactions.forEach(transaction => {
    if (!getPotTransactionDateKey(transaction).startsWith(year + '-')) return;
    const lak = Number(transaction.lak) || 0;
    const usd = Number(transaction.usd) || 0;
    if (transaction.type === "deposit" || transaction.type === "add") {
      stats.depositLAK += lak; stats.depositUSD += usd;
    } else if (transaction.type === "withdraw") {
      stats.withdrawLAK += lak; stats.withdrawUSD += usd;
    }
  });
  stats.growth = stats.depositUSD > 0 ? (stats.pnl / stats.depositUSD) * 100 : null;
  return stats;
}

function signedUSD(value) {
  const n = Number(value) || 0;
  return `${n >= 0 ? "+" : "-"}${Math.abs(n).toFixed(2)} USD`;
}

function renderTradeMonthlyStats() {
  const container = document.getElementById("tradeMonthlyStats");
  if (!container) return;
  const year = tradeYearView;
  const yearLabel = document.getElementById("tradeYearLabel");
  if (yearLabel) yearLabel.textContent = year;
  container.innerHTML = "";
  for (let month = 0; month < 12; month++) {
    const stats = getTradeMonthStats(year, month);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "trade-month-card" + (stats.pnl > 0 ? " positive" : stats.pnl < 0 ? " negative" : "");
    const growthText = stats.growth === null ? "-" : `${stats.growth >= 0 ? "+" : ""}${stats.growth.toFixed(1)}%`;
    card.innerHTML = `
      <span class="trade-month-name">${THAI_MONTHS[month]}</span>
      <span class="trade-month-capital">ເຕີມ ${formatPotUSD(stats.depositUSD)} USD</span>
      <span class="trade-month-growth ${stats.growth >= 0 ? "up" : "down"}">ເຕີບໂຕ ${growthText}</span>
      <span class="trade-month-days">ຊະນະ ${stats.winDays} · ແພ້ ${stats.lossDays} ວັນ</span>
      <span class="trade-month-withdraw">ຖອນ ${formatPotUSD(stats.withdrawUSD)} USD</span>
      <span class="trade-month-divider"></span>
      <strong class="trade-month-net">${signedUSD(stats.pnl)}</strong>
      <span class="trade-month-cumulative">PNL ສະສົມ ${signedUSD(stats.cumulativePnL)}</span>`;
    card.addEventListener("click", () => {
      if (!hasPortfolioFunding()) {
        showCustomModal("⚠️ ເພີ່ມພອດກ່ອນ", "ຕ້ອງເພີ່ມເງິນເຂົ້າພອດກ່ອນ ຈຶ່ງຈະເປີດປະຕິທິນເທຣດໄດ້");
        return;
      }
      tradeCalViewMonth = month;
      tradeCalViewYear = year;
      hideTradeEntryPanel();
      renderTradeCalendar();
      document.getElementById("tradeCalendarSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    container.appendChild(card);
  }
  renderTradeYearlySummary();
  requestAnimationFrame(() => { container.scrollLeft = container.scrollWidth; });
}

function changeTradeYear(delta) {
  const currentYear = new Date().getFullYear();
  const nextYear = tradeYearView + delta;
  if (nextYear < currentYear - 2 || nextYear > currentYear) return;
  tradeYearView = nextYear;
  tradeCalViewYear = nextYear;
  tradeCalViewMonth = nextYear === currentYear ? new Date().getMonth() : 11;
  hideTradeEntryPanel();
  renderTradeCalendar();
  renderTradeMonthlyStats();
}

function renderTradeYearlySummary() {
  const container = document.getElementById("tradeYearlySummary");
  if (!container) return;
  const currentYear = new Date().getFullYear();
  container.innerHTML = "";
  for (let offset = 0; offset < 3; offset++) {
    const year = currentYear - offset;
    const stats = getTradeYearStats(year);
    const card = document.createElement("div");
    card.className = "trade-year-card" + (stats.pnl > 0 ? " positive" : stats.pnl < 0 ? " negative" : "");
    const growthText = stats.growth === null ? "-" : `${stats.growth >= 0 ? "+" : ""}${stats.growth.toFixed(1)}%`;
    card.innerHTML = `
      <div class="trade-year-card-heading"><strong>${year}</strong><span>${stats.tradeDays} ວັນເທຣດ</span></div>
      <div class="trade-year-main">${signedUSD(stats.pnl)}</div>
      <div class="trade-year-grid">
        <span>ເຕີບໂຕ <b>${growthText}</b></span>
        <span>ຊະນະ/ແພ້ <b>${stats.winDays}/${stats.lossDays}</b></span>
        <span>ຖອນ USD <b>${formatPotUSD(stats.withdrawUSD)}</b></span>
        <span>ຖອນກີບ <b>${formatNum(stats.withdrawLAK)}</b></span>
      </div>`;
    card.addEventListener("click", () => {
      if (!hasPortfolioFunding()) {
        showCustomModal("⚠️ ເພີ່ມພອດກ່ອນ", "ຕ້ອງເພີ່ມເງິນເຂົ້າພອດກ່ອນ ຈຶ່ງຈະເປີດປະຕິທິນເທຣດໄດ້");
        return;
      }
      tradeYearView = year;
      tradeCalViewYear = year;
      tradeCalViewMonth = year === currentYear ? new Date().getMonth() : 11;
      renderTradeCalendar();
      renderTradeMonthlyStats();
    });
    container.appendChild(card);
  }
}

function setTradeTimeframe(tf) {
  tradeTimeframe = tf;
  document.querySelectorAll(".timeframe-btn").forEach(b => b.classList.toggle("filter-active", b.dataset.tf === tf));
  renderTradeCalendar();
  renderTradeMonthlyStats();
}

function renderChart() {
  let chartLabels = [], chartData = [], chartType = "line";
  const todayD = new Date();

  if (tradeTimeframe === "month") {
    chartType = "bar";
    for (let i = 11; i >= 0; i--) {
      const d = new Date(todayD.getFullYear(), todayD.getMonth() - i, 1);
      const key = getMonthKeyPadded(d);
      let sum = 0;
      Object.keys(tradeData).forEach(ds => { if (ds.startsWith(key)) sum += tradeData[ds]; });
      chartLabels.push(LAO_MONTHS_SHORT[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2));
      chartData.push(Number(sum.toFixed(2)));
    }

  } else if (tradeTimeframe === "week") {
    chartType = "bar";
    const weekTotals = [0, 0, 0, 0];
    for (let i = 0; i < 28; i++) {
      const d = new Date(todayD);
      d.setDate(d.getDate() - i);
      const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      if (tradeData[key]) {
        const weekIdx = 3 - Math.floor(i / 7);
        weekTotals[weekIdx] += tradeData[key];
      }
    }
    ['ອາທິດ 1','ອາທິດ 2','ອາທິດ 3','ອາທິດນີ້'].forEach((lbl, i) => {
      chartLabels.push(lbl);
      chartData.push(Number(weekTotals[i].toFixed(2)));
    });

  } else {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayD);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    let cum = 0;
    days.forEach(d => {
      const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      if (tradeData[key] !== undefined) {
        cum += tradeData[key];
        chartLabels.push(d.getDate() + ' ' + LAO_MONTHS_SHORT[d.getMonth()]);
        chartData.push(Number(cum.toFixed(2)));
      }
    });
  }

  let totalPnL = 0;
  Object.values(tradeData).forEach(v => { totalPnL += v; });
  const totalEl = document.getElementById("totalTradeResult");
  if (totalEl) {
    totalEl.textContent = (totalPnL >= 0 ? "+" : "") + totalPnL.toFixed(2);
    totalEl.className = totalPnL >= 0 ? "trade-profit" : "trade-loss";
  }

  const canvas = document.getElementById('tradeChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (tradeChartInstance) tradeChartInstance.destroy();

  let datasetConfig;
  if (chartType === "line") {
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, 'rgba(52,211,153,0.4)');
    gradient.addColorStop(1, 'rgba(52,211,153,0.0)');
    datasetConfig = {
      label: 'ພອດສະສົມ', data: chartData, borderColor: '#34d399',
      backgroundColor: gradient, borderWidth: 2, fill: true, tension: 0.3,
      pointBackgroundColor: '#34d399', pointRadius: chartLabels.length > 15 ? 2 : 4
    };
  } else {
    datasetConfig = {
      label: tradeTimeframe === "month" ? "ກຳໄລ/ຂາດທຶນລາຍເດືອນ" : "ລາຍອາທິດ",
      data: chartData,
      backgroundColor: chartData.map(v => v >= 0 ? 'rgba(52,211,153,0.75)' : 'rgba(247,108,108,0.75)'),
      borderRadius: 6,
      maxBarThickness: 48
    };
  }

  tradeChartInstance = new Chart(ctx, {
    type: chartType,
    data: { labels: chartLabels, datasets: [datasetConfig] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: { display: false }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8b96a5', font: { size: 9 } } },
        y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8b96a5', font: { size: 9 } } }
      }
    }
  });
}

// ==========================================================
// ระบบหนี้สิน
// ==========================================================
function handleDebt(action) {
  const nameInput   = document.getElementById("debtorName");
  const amountInput = document.getElementById("debtAmount");
  const name   = nameInput.value.trim();
  const amount = parseMoneyVal(amountInput);
  if (!name)            { showCustomModal("⚠️", "ລືມຫລືແກ້ງບ້າໃສ່ຊື່ກ່ອນ"); return; }
  if (!amount || amount <= 0) { showCustomModal("⚠️", "ໃສ່ເງີນກ່ອນແມະ!"); return; }
  pushToHistory();
  if (action === 'add') {
    debtors[name] = (debtors[name] || 0) + amount;
    logDebtorHistory(name, ` +${formatNum(amount)} ກີບ (ເຫລືອ: ${formatNum(debtors[name])} ກີບ)`);
    logDebtActivity(` ${name}: ເພີ່ມໜີ້ +${formatNum(amount)} ກີບ`);
  } else {
    if (!debtors[name] || debtors[name] <= 0) { showCustomModal("⚠️", "ມັນຫມົດຫນີ້ແລ້ວ!"); return; }
    debtors[name] -= amount;
    logDebtorHistory(name, ` -${formatNum(amount)} ກີບ (ເຫລືອ: ${formatNum(debtors[name])} ກີບ)`);
    logDebtActivity(`${name}: ໃຊ້ໜີ້ -${formatNum(amount)} ກີບ`);
    if (debtors[name] <= 0) { debtors[name] = 0; logDebtActivity(` ${name}: ຫນີ້ມັນຫມົດແລ້ວ!`); }
  }
  nameInput.value = ""; amountInput.value = "";
  saveData(); updateDebtorsUI();
}

function updateDebtorsUI() {
  const container = document.getElementById("debtorsContainer");
  if (!container) return;
  container.innerHTML = "";
  const all = Array.from(new Set([...Object.keys(debtors), ...Object.keys(debtHistory)]));
  if (all.length === 0) {
    container.innerHTML = "<p style='color:#888;font-style:italic;'> ບໍ່ມີຫຍັງ</p>";
    calculateGrandTotal(); return;
  }
  all.forEach(name => {
    const cur  = debtors[name] || 0;
    const hist = debtHistory[name] || [];
    const item = document.createElement("div");
    item.className = "debt-item";
    item.innerHTML = `
      <div class="debt-header">
        <div>👤 <strong>${name}</strong>: <span style="color:${cur > 0 ? '#f59e0b' : '#10b981'};">${formatNum(cur)}</span> ກີບ</div>
      </div>
      <div class="debt-quick-actions">
        <input class="quick-debt-input money-input" data-money-input data-money-decimals="false" type="text" inputmode="decimal" placeholder="ຈຳນວນ">
        <button class="btn-quick-add">+</button>
        <button class="btn-quick-sub">-</button>
      </div>
      <ul class="individual-log">
        ${hist.map(t => `<li>${t}</li>`).join('') || "<li>ຍັງບໍ່ມີປະຫວັດ</li>"}
      </ul>`;
    item.querySelector(".btn-quick-add").addEventListener("click", () => quickDebtAction(name, 'add', item.querySelector(".quick-debt-input")));
    item.querySelector(".btn-quick-sub").addEventListener("click", () => quickDebtAction(name, 'sub', item.querySelector(".quick-debt-input")));
    container.appendChild(item);
  });
  calculateGrandTotal();
}

function quickDebtAction(name, action, inputEl) {
  const amount = parseMoneyVal(inputEl);
  if (!amount || amount <= 0) { showCustomModal("⚠️", "ຢາກວ່ານັກ ໃສ່ເງີນກ່ອນຕິ"); return; }
  pushToHistory();
  if (action === 'add') {
    debtors[name] = (debtors[name] || 0) + amount;
    logDebtorHistory(name, ` ເພີ່ມ +${formatNum(amount)} ກີບ (ເຫລືອ: ${formatNum(debtors[name])} ກີບ)`);
    logDebtActivity(` ${name}: ເພີ່ມ +${formatNum(amount)} ກີບ`);
  } else {
    if (!debtors[name] || debtors[name] <= 0) { showCustomModal("⚠️", "ມັນບໍ່ມີຫນີ້!"); return; }
    debtors[name] -= amount;
    logDebtorHistory(name, `ລຸດ -${formatNum(amount)} ກີບ (ເຫລືອ: ${formatNum(debtors[name])} ກີບ)`);
    logDebtActivity(` ${name}: ລຸດ -${formatNum(amount)} ກີບ`);
    if (debtors[name] <= 0) { debtors[name] = 0; logDebtActivity(` ${name}: ຫນີ້ຫມົດ!`); }
  }
  inputEl.value = "";
  saveData(); updateDebtorsUI();
}

function logDebtorHistory(name, msg) {
  if (!debtHistory[name]) debtHistory[name] = [];
  debtHistory[name].unshift(`[${formatDateTimeAD(new Date())}] ${msg}`);
}

function calculateGrandTotal() {
  let debtTotal = 0;
  Object.keys(debtors).forEach(n => { debtTotal += debtors[n]; });
  const el = document.getElementById("grandTotalBalance");
  if (el) el.textContent = formatNum(getCashGrandTotal() + debtTotal);
}

// ==========================================================
// กราฟโดนัท
// ==========================================================
function renderCompareDonut() {
  const cashTotal = getCashGrandTotal();
  const rate = currentExchangeRate || 0;
  const currentPotUSD = potUSD + getUnrealizedPnL();
  const potLAK = currentPotUSD * rate;

  const cashEl = document.getElementById("compareCashValue");
  const potEl  = document.getElementById("comparePotValue");
  if (cashEl) cashEl.textContent = formatNum(cashTotal) + " ກີບ";
  if (potEl)  potEl.textContent  = formatNum(potLAK) + " ກີບ";
  const pctEl = document.getElementById("comparePercentLabel");
  if (pctEl) pctEl.textContent = "ພອດຄິດເປັນ " + (cashTotal > 0 ? (potLAK / cashTotal * 100).toFixed(2) : "0.00") + "% ຂອງເງິນສົດ";

  const canvas = document.getElementById("cashPotDonut");
  if (!canvas) return;
  if (donutChartInstance) donutChartInstance.destroy();
  donutChartInstance = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: { labels: ["ເງິນສົດ","ພອດ"], datasets: [{ data: [cashTotal, potLAK], backgroundColor: ["#E3A857","#7DD3FC"], borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "68%",
      plugins: {
        legend: { display: false },
        datalabels: { display: false }
      }
    }
  });
}

// ==========================================================
// Category Bar Chart
// ==========================================================
function renderCategoryBarChart() {
  const bar = document.getElementById("categoryBar");
  const legend = document.getElementById("categoryBarLegend");
  if (!bar || !legend) return;
  bar.innerHTML = ""; legend.innerHTML = "";
  const total = getTotalAllCategories();
  categories.forEach(cat => {
    const pct = total > 0 ? (totals[cat] / total * 100) : 0;
    const seg = document.createElement("div");
    seg.className = "category-bar-seg";
    seg.style.flexBasis = pct + "%";
    seg.style.backgroundColor = categoryColors[cat];
    bar.appendChild(seg);
    const li = document.createElement("div");
    li.className = "category-bar-legend-item";
    li.innerHTML = `<span class="dot" style="background:${categoryColors[cat]}"></span>${categoryLabels[cat]}: <strong>${pct.toFixed(1)}%</strong>`;
    legend.appendChild(li);
  });
}

function getTotalAllCategories() {
  let s = 0; categories.forEach(cat => { s += totals[cat]; }); return s;
}

function getCashGrandTotal() {
  return getTotalAllCategories() + spareChange;
}

function handleSpareTransfer() {
  const toEl  = document.getElementById("spare-transfer-to");
  const amtEl = document.getElementById("spare-transfer-amount");
  if (!toEl || !amtEl) return;
  const to     = toEl.value;
  const amount = parseMoneyVal(amtEl);
  if (!amount || amount <= 0 || amount > spareChange + 0.0001) {
    showCustomModal("ກົດເງີນຜິດ", "ເງີນບຊ່ຖືກ ຫຼື ເງີນເສດບໍ່ພໍ!");
    return;
  }
  pushToHistory();
  spareChange = Math.max(0, spareChange - amount);
  totals[to] += amount;
  logCashHistory(` ໂອນເງິນເສດ ${formatNum(amount)} ກີບ → ${categoryLabels[to]}`);
  stripSpareChange(to);
  amtEl.value = "";
  saveData(); updateSummary();
  showCustomModal(" ໂອນແລ້ວ", `ໂອນເງິນເສດໄປ ${categoryLabels[to]} ແລ້ວ!`);
}

// ==========================================================
// updateSummary
// ==========================================================
function updateSummary() {
  const container = document.getElementById("categoriesSummary");
  if (!container) return;
  container.innerHTML = "";

  categories.forEach(cat => {
    const box = document.createElement("div");
    box.className = "category";
    box.innerHTML = `
      <h3>${categoryLabels[cat]}</h3>
      <span class="cat-amount">${formatNum(totals[cat])} ກີບ</span>
      <div class="withdraw-inline">
        <input id="withdraw-${cat}" class="money-input" data-money-input data-money-decimals="false" type="text" inputmode="decimal" placeholder="0.00">
        <button onclick="handleSingleWithdraw('${cat}')">ຖອນ</button>
      </div>`;
    container.appendChild(box);
  });

  const spareBox = document.createElement("div");
  spareBox.className = "category spare-cat";
  spareBox.innerHTML = `
    <h3> ເງິນເສດ</h3>
    <span class="cat-amount spare-amount">${formatNum(spareChange)} ກີບ</span>
    <div class="spare-transfer-inline">
      <input id="spare-transfer-amount" class="money-input" data-money-input data-money-decimals="false" type="text" inputmode="decimal" placeholder="ຈຳນວນໂອນ">
      <select id="spare-transfer-to"></select>
    </div>
    <button class="spare-btn" onclick="handleSpareTransfer()">ໂອນ →</button>`;
  container.appendChild(spareBox);

  const tf  = document.getElementById("transferFrom");
  const tt  = document.getElementById("transferTo");
  const idc = document.getElementById("investDeductCategory");
  const st  = document.getElementById("spare-transfer-to");
  if (tf && tt) {
    tf.innerHTML = ""; tt.innerHTML = "";
    categories.forEach(cat => {
      tf.innerHTML += `<option value="${cat}">${categoryLabels[cat]}</option>`;
      tt.innerHTML += `<option value="${cat}">${categoryLabels[cat]}</option>`;
    });
  }
  if (idc) {
    idc.innerHTML = "";
    categories.forEach(cat => { idc.innerHTML += `<option value="${cat}">${categoryLabels[cat]}</option>`; });
  }
  if (st) {
    st.innerHTML = "";
    categories.forEach(cat => { st.innerHTML += `<option value="${cat}">${categoryLabels[cat]}</option>`; });
  }

  document.getElementById("heroTotalBalance").textContent  = formatNum(getCashGrandTotal());
  document.getElementById("heroIncomeMonth").textContent   = formatNum(incomeMonth);
  document.getElementById("heroWithdrawMonth").textContent = formatNum(withdrawMonth);
  updatePotSummary(); calculateGrandTotal(); renderCompareDonut(); renderCategoryBarChart();
}

// ==========================================================
// ประวัติ
// ==========================================================
function logCashHistory(msg) {
  const key = getTodayKey();
  if (!historyByDay[key]) historyByDay[key] = [];
  historyByDay[key].unshift(`[${formatTimeAD(new Date())}] ${msg}`);
  pruneOldHistory();
  if (viewingDate === key && activeHistTab === 'cash') renderHistoryForDate(key);
}

function logPortHistory(msg) {
  const key = getTodayKey();
  if (!portHistoryByDay[key]) portHistoryByDay[key] = [];
  portHistoryByDay[key].unshift(`[${formatTimeAD(new Date())}] ${msg}`);
  pruneOldHistory();
  if (viewingDate === key && activeHistTab === 'port') renderHistoryForDate(key);
}

function logDebtActivity(msg) {
  const key = getTodayKey();
  if (!debtActivityByDay[key]) debtActivityByDay[key] = [];
  debtActivityByDay[key].unshift(`[${formatTimeAD(new Date())}] ${msg}`);
  pruneOldHistory();
  if (viewingDate === key && activeHistTab === 'debt') renderHistoryForDate(key);
}

function setHistoryTab(tab) {
  activeHistTab = tab;
  document.querySelectorAll(".hist-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.ht === tab));
  renderHistoryForDate(viewingDate);
}

function pruneOldHistory() {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 10);
  const cutoff = cutoffDate.getFullYear() + '-' +
    String(cutoffDate.getMonth() + 1).padStart(2, '0') + '-' +
    String(cutoffDate.getDate()).padStart(2, '0');
  [historyByDay, portHistoryByDay, debtActivityByDay].forEach(obj => {
    Object.keys(obj).forEach(k => { if (k < cutoff) delete obj[k]; });
  });
}

function renderHistoryForDate(dateKey) {
  viewingDate = dateKey;
  const viewEl = document.getElementById("historyDateView");
  if (viewEl) viewEl.value = dateKey;

  const label = document.getElementById("historyDateLabel");
  if (label) label.textContent = dateKeyToLao(dateKey);

  const log = document.getElementById("historyLog");
  if (!log) return;
  log.innerHTML = "";

  let src;
  if (activeHistTab === 'cash')      src = historyByDay[dateKey]      || [];
  else if (activeHistTab === 'port') src = portHistoryByDay[dateKey]  || [];
  else                               src = debtActivityByDay[dateKey] || [];

  if (src.length === 0) {
    log.innerHTML = "<li style='color:#888;font-style:italic;'>ບໍ່ມີຫຍັງໃນມື້ນີ້</li>"; return;
  }
  src.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text; log.appendChild(li);
  });
}

function onHistoryDateChange() {
  const picked = document.getElementById("historyDateView").value;
  const todayKey = getTodayKey();
  const cutoff   = getDateKeyDaysAgo(30);
  if (picked > todayKey) { showCustomModal("⚠️", "!"); renderHistoryForDate(todayKey); return; }
  if (picked < cutoff)   { showCustomModal("⚠️", "ເບີ່ງຍ້ອນຫລັງໄດ້ 30 ມື້"); renderHistoryForDate(todayKey); return; }
  renderHistoryForDate(picked);
}

function changeHistoryDay(delta) {
  const d = new Date(viewingDate + "T00:00:00"); d.setDate(d.getDate() + delta);
  const newKey = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  const todayKey = getTodayKey(); const cutoff = getDateKeyDaysAgo(30);
  if (newKey > todayKey) return;
  if (newKey < cutoff) { showCustomModal("⚠️", "ເບີ່ງຍ້ອນຫລັງໄດ້ 30 ມື້!"); return; }
  renderHistoryForDate(newKey);
}
function jumpToToday() { renderHistoryForDate(getTodayKey()); }

// ==========================================================
// คลังประวัติยอดเงินเข้า-ออกย้อนหลัง
// ==========================================================
function changeArchiveYear(delta) {
  const currentYear = new Date().getFullYear();
  const nextYear = archiveYear + delta;
  if (nextYear < currentYear - 4 || nextYear > currentYear) return;
  archiveYear = nextYear;
  archiveExpandedMonth = null;
  renderMonthlyArchive();
}

function parseCashArchiveEntry(text) {
  const amountMatch = String(text).match(/([+-]?\d[\d.]*)\s*ກີບ/);
  if (!amountMatch) return null;
  const amount = Number(amountMatch[1].replace(/\./g, ''));
  if (!amount) return null;

  const isPortfolioDeposit = text.includes('ໄປພອດ');
  const isPortfolioWithdraw = text.includes('ຮັບຈາກພອດ');
  const isInflow = text.includes('ເພີ່ມເງິນ') || isPortfolioWithdraw;
  const isOutflow = text.includes('ຖອນຈາກ') || isPortfolioDeposit ||
    text.includes('ຄ່າທ່ຽວ') || text.includes('ຄ່າກັນຊາ');
  if (isInflow) return { amount, inflow: amount, outflow: 0, isPortfolioWithdraw };
  if (isOutflow) return { amount, inflow: 0, outflow: amount, isPortfolioDeposit };
  return null;
}

function getArchiveYearDays(year) {
  return new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
}

function isArchiveDate(dateKey, year, month = null) {
  if (!String(dateKey).startsWith(`${year}-`)) return false;
  return month === null || String(dateKey).startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`);
}

function getArchivePortfolioStats(year, month = null) {
  const stats = {
    depositUSD: 0,
    depositCostLAK: 0,
    withdrawalUSD: 0,
    withdrawalQuoteLAK: 0,
    withdrawalLAK: 0,
    tradePnLUSD: 0,
    growthPct: null,
    entries: { deposit: [], withdraw: [], trade: [] }
  };

  potTransactions.forEach(transaction => {
    if (!isArchiveDate(getPotTransactionDateKey(transaction), year, month)) return;
    const usd = Number(transaction.usd) || 0;
    const rate = Number(transaction.rate) || currentExchangeRate || 0;
    const lak = Number(transaction.lak) || usd * rate;
    if (transaction.type === "deposit" || transaction.type === "add") {
      stats.depositUSD += usd;
      stats.depositCostLAK += lak;
      stats.entries.deposit.push(transaction);
    } else if (transaction.type === "withdraw") {
      stats.withdrawalUSD += usd;
      stats.withdrawalQuoteLAK += lak;
      stats.withdrawalLAK += Number(transaction.receivedLak) || 0;
      stats.entries.withdraw.push(transaction);
    }
  });

  Object.keys(tradeData).forEach(dateKey => {
    if (!isArchiveDate(dateKey, year, month)) return;
    const pnl = Number(tradeData[dateKey]) || 0;
    stats.tradePnLUSD += pnl;
    stats.entries.trade.push({ dateKey, pnl });
  });

  stats.growthPct = stats.depositUSD > 0
    ? (stats.tradePnLUSD / stats.depositUSD) * 100
    : null;
  return stats;
}

function getArchiveMonthStats(year, month) {
  const monthKey = year + '-' + String(month + 1).padStart(2, '0');
  const stats = {
    monthKey,
    inflow: 0,
    outflow: 0,
    outflowAll: 0,
    balance: 0,
    travelDays: 0,
    herbDays: 0,
    travelCost: 0,
    herbCost: 0,
    cashInEntries: [],
    cashOutEntries: [],
    cashOtherEntries: [],
    portEntries: { deposit: [], withdraw: [], trade: [], other: [] },
    portfolio: getArchivePortfolioStats(year, month)
  };

  Object.keys(historyByDay).forEach(dateKey => {
    if (!dateKey.startsWith(monthKey + '-')) return;
    (historyByDay[dateKey] || []).forEach(text => {
      const parsed = parseCashArchiveEntry(text);
      if (parsed) {
        stats.inflow += parsed.inflow;
        stats.outflowAll += parsed.outflow;
        if (parsed.outflow > 0 && !parsed.isPortfolioDeposit) stats.outflow += parsed.outflow;
        const entry = { dateKey, text, amount: parsed.amount };
        if (parsed.inflow > 0) stats.cashInEntries.push(entry);
        else if (parsed.outflow > 0 && !parsed.isPortfolioDeposit) stats.cashOutEntries.push(entry);
      } else {
        stats.cashOtherEntries.push({ dateKey, text });
      }
    });
  });

  Object.keys(travelCalendar).forEach(dateKey => {
    if (!dateKey.startsWith(monthKey + '-')) return;
    stats.travelDays++;
    stats.travelCost += Number(travelExpenses[dateKey]) || 0;
  });
  Object.keys(herbCalendar).forEach(dateKey => {
    if (!dateKey.startsWith(monthKey + '-')) return;
    stats.herbDays++;
    stats.herbCost += Number(herbExpenses[dateKey]) || 0;
  });

  Object.keys(portHistoryByDay).forEach(dateKey => {
    if (!dateKey.startsWith(monthKey + '-')) return;
    (portHistoryByDay[dateKey] || []).forEach(text => {
      const entry = { dateKey, text };
      if (text.includes('ເພີ່ມພອດ')) stats.portEntries.deposit.push(entry);
      else if (text.includes('ຖອນພອດ')) stats.portEntries.withdraw.push(entry);
      else if (text.includes('ເທຣດ')) stats.portEntries.trade.push(entry);
      else stats.portEntries.other.push(entry);
    });
  });

  stats.balance = stats.inflow - stats.outflowAll;
  return stats;
}

function getArchiveYearStats(year) {
  const stats = {
    year,
    daysInYear: getArchiveYearDays(year),
    travelDays: 0,
    herbDays: 0,
    inflow: 0,
    outflow: 0,
    outflowAll: 0,
    balance: 0,
    travelCost: 0,
    herbCost: 0,
    portfolio: {
      depositUSD: 0,
      depositCostLAK: 0,
      withdrawalUSD: 0,
      withdrawalQuoteLAK: 0,
      withdrawalLAK: 0,
      tradePnLUSD: 0,
      growthPct: null
    }
  };
  for (let month = 0; month < 12; month++) {
    const monthStats = getArchiveMonthStats(year, month);
    stats.travelDays += monthStats.travelDays;
    stats.herbDays += monthStats.herbDays;
    stats.inflow += monthStats.inflow;
    stats.outflow += monthStats.outflow;
    stats.outflowAll += monthStats.outflowAll;
    stats.travelCost += monthStats.travelCost;
    stats.herbCost += monthStats.herbCost;
    stats.portfolio.depositUSD += monthStats.portfolio.depositUSD;
    stats.portfolio.depositCostLAK += monthStats.portfolio.depositCostLAK;
    stats.portfolio.withdrawalUSD += monthStats.portfolio.withdrawalUSD;
    stats.portfolio.withdrawalQuoteLAK += monthStats.portfolio.withdrawalQuoteLAK;
    stats.portfolio.withdrawalLAK += monthStats.portfolio.withdrawalLAK;
    stats.portfolio.tradePnLUSD += monthStats.portfolio.tradePnLUSD;
  }
  stats.balance = stats.inflow - stats.outflowAll;
  stats.portfolio.growthPct = stats.portfolio.depositUSD > 0
    ? (stats.portfolio.tradePnLUSD / stats.portfolio.depositUSD) * 100
    : null;
  return stats;
}

function formatArchiveSignedLAK(value) {
  const n = Number(value) || 0;
  return `${n >= 0 ? "+" : "-"}${formatNum(Math.abs(n))} ກີບ`;
}

function formatArchiveLAK(value) {
  return `${formatNum(Math.abs(Number(value) || 0))} ກີບ`;
}

function createArchiveEntryGroup(title, entries, className, amountText = "") {
  if (!entries || !entries.length) return null;
  const section = document.createElement("section");
  section.className = `archive-detail-group ${className}`;
  const heading = document.createElement("div");
  heading.className = "archive-detail-group-heading";
  heading.innerHTML = `<span>${title}</span><strong>${amountText}</strong>`;
  section.appendChild(heading);
  const list = document.createElement("ul");
  list.className = "archive-log-list";
  entries
    .slice()
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .forEach(entry => {
      const item = document.createElement("li");
      item.textContent = `${entry.dateKey}  ${entry.text}`;
      list.appendChild(item);
    });
  section.appendChild(list);
  return section;
}

function renderArchiveYearRail() {
  const currentYear = new Date().getFullYear();
  const rail = document.getElementById("archiveYearTicks");
  const rangeLabel = document.getElementById("archiveRangeLabel");
  if (rangeLabel) rangeLabel.textContent = `${currentYear - 4}—${currentYear}`;
  if (!rail) return;
  rail.innerHTML = '<span class="archive-year-rail-label">5 ປີ</span>';
  for (let year = currentYear - 4; year <= currentYear; year++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "archive-year-tick" + (year === archiveYear ? " active" : "");
    button.textContent = year;
    button.setAttribute("aria-label", `ເບິ່ງລາຍລະອຽດປີ ${year}`);
    button.addEventListener("click", () => {
      archiveYear = year;
      archiveExpandedMonth = null;
      renderMonthlyArchive();
    });
    rail.appendChild(button);
  }
}

function renderArchiveYearSummary() {
  const stats = getArchiveYearStats(archiveYear);
  const totalEl = document.getElementById("archiveYearTotal");
  const outflowEl = document.getElementById("archiveYearOutflow");
  const daysLabel = document.getElementById("archiveTripDaysLabel");
  const progress = document.getElementById("archiveTripDaysProgress");
  const costEl = document.getElementById("archiveYearCost");
  const profitEl = document.getElementById("archiveYearProfit");
  const ratioEl = document.getElementById("archiveYearRatio");
  const percent = Math.min(100, (stats.travelDays / stats.daysInYear) * 100);
  if (totalEl) {
    totalEl.textContent = formatArchiveLAK(stats.inflow);
    totalEl.className = "archive-total-value positive";
  }
  if (outflowEl) {
    outflowEl.textContent = formatArchiveLAK(stats.outflow);
    outflowEl.className = "archive-total-value negative";
  }
  if (daysLabel) daysLabel.textContent = `${stats.travelDays} / ${stats.daysInYear} ມື້ (${percent.toFixed(1)}%)`;
  if (progress) progress.style.width = `${percent}%`;
  if (costEl) costEl.textContent = `${formatPotUSD(stats.portfolio.depositUSD)} USD`;
  if (profitEl) {
    profitEl.textContent = `${formatNum(stats.portfolio.withdrawalLAK)} ກີບ`;
    profitEl.className = stats.portfolio.withdrawalLAK > 0 ? "positive" : "";
  }
  const profitHintEl = document.getElementById("archiveYearProfitHint");
  if (profitHintEl) {
    profitHintEl.textContent = `ຮັບຈິງ · ຖອນ ${formatPotUSD(stats.portfolio.withdrawalUSD)} USD`;
  }
  if (ratioEl) {
    ratioEl.textContent = stats.portfolio.growthPct === null
      ? "—"
      : `${stats.portfolio.growthPct >= 0 ? "+" : ""}${stats.portfolio.growthPct.toFixed(1)}%`;
  }
  const withdrawDataEl = document.getElementById("archiveYearWithdrawData");
  const withdrawDataLakEl = document.getElementById("archiveYearWithdrawDataLak");
  if (withdrawDataEl) {
    withdrawDataEl.textContent = `${formatPotUSD(stats.portfolio.withdrawalUSD)} USD`;
  }
  if (withdrawDataLakEl) {
    withdrawDataLakEl.textContent = `${formatNum(stats.portfolio.withdrawalQuoteLAK)} ກີບ`;
  }
}

function renderMonthlyArchive() {
  const label = document.getElementById("archiveYearLabel");
  const container = document.getElementById("archiveMonthCards");
  if (!container) return;
  if (label) label.textContent = archiveYear;
  renderArchiveYearRail();
  renderArchiveYearSummary();
  container.innerHTML = "";

  for (let month = 0; month < 12; month++) {
    const stats = getArchiveMonthStats(archiveYear, month);
    const hasData = stats.cashInEntries.length > 0 ||
      stats.cashOutEntries.length > 0 ||
      Object.values(stats.portEntries).some(entries => entries.length) ||
      stats.travelDays > 0 || stats.herbDays > 0;
    const card = document.createElement("div");
    card.className = "archive-card" + (hasData ? " has-data" : "") +
      (archiveExpandedMonth === month ? " expanded" : "");
    card.innerHTML = `
      <div class="archive-card-header" role="button" tabindex="0" aria-expanded="${archiveExpandedMonth === month}">
        <div class="archive-card-topline">
          <span class="archive-month-title-wrap">
            <span class="archive-card-month">${LAO_MONTHS[month]}</span>
            <span class="archive-month-period">${String(month + 1).padStart(2, "0")} · ${archiveYear}</span>
          </span>
          <span class="archive-net-value ${stats.balance >= 0 ? "positive" : "negative"}">
            <small>ຄົງເຫຼືອ</small>
            <strong>${formatArchiveSignedLAK(stats.balance)}</strong>
          </span>
          <span class="archive-card-chevron" aria-hidden="true">⌄</span>
        </div>
        <div class="archive-cashflow-grid">
          <div class="archive-month-metric inflow">
            <span>ເງິນເຂົ້າເດືອນ</span>
            <strong>+${formatArchiveLAK(stats.inflow)}</strong>
          </div>
          <div class="archive-month-metric outflow">
            <span>ເງິນອອກເດືອນ</span>
            <strong>-${formatArchiveLAK(stats.outflow)}</strong>
          </div>
        </div>
        <div class="archive-portfolio-heading">ສະຫຼຸບພອດ</div>
        <div class="archive-portfolio-grid">
          <div class="archive-month-metric capital">
            <span>ຕົ້ນທຶນພອດ</span>
            <strong>${formatPotUSD(stats.portfolio.depositUSD)} USD</strong>
          </div>
          <div class="archive-month-metric pnl ${stats.portfolio.tradePnLUSD >= 0 ? "positive" : "negative"}">
            <span>ກຳໄລ-ຂາດທຶນ</span>
            <strong>${signedUSD(stats.portfolio.tradePnLUSD)}</strong>
          </div>
          <div class="archive-month-metric withdraw-usd">
            <span>ຍອດຖອນ USD</span>
            <strong>${formatPotUSD(stats.portfolio.withdrawalUSD)} USD</strong>
          </div>
          <div class="archive-month-metric received-lak">
            <span>ກີບເຂົ້າບັນຊີຈິງ</span>
            <strong>${formatArchiveLAK(stats.portfolio.withdrawalLAK)}</strong>
          </div>
        </div>
      </div>
      <div class="archive-card-body"></div>`;

    const body = card.querySelector(".archive-card-body");
    if (body) {
      body.innerHTML = `
        <div class="archive-month-detail-grid">
          <span>ວັນທ່ຽວ <b>${stats.travelDays}</b></span>
          <span>ຄ່າທ່ຽວ <b>${formatNum(stats.travelCost)} ກີບ</b></span>
          <span>ວັນສະໝຸນໄພ <b>${stats.herbDays}</b></span>
          <span>ຄ່າກັນຊາ <b>${formatNum(stats.herbCost)} ກີບ</b></span>
           <span>ຜົນຖອນ <b>${formatPotUSD(stats.portfolio.withdrawalUSD)} USD</b></span>
           <span>ກີບລາຍການຖອນ <b>${formatNum(stats.portfolio.withdrawalQuoteLAK)} ກີບ</b></span>
        </div>`;
      const detailTabs = document.createElement("div");
      detailTabs.className = "archive-detail-tabs";
      detailTabs.setAttribute("role", "tablist");
      detailTabs.innerHTML = `
        <button type="button" class="archive-detail-tab active" data-detail-tab="cash-in" role="tab" aria-selected="true">ເງິນເຂົ້າ</button>
        <button type="button" class="archive-detail-tab" data-detail-tab="cash-out" role="tab" aria-selected="false">ເງິນອອກ</button>
        <button type="button" class="archive-detail-tab" data-detail-tab="portfolio" role="tab" aria-selected="false">ເງິນເພີ່ມ-ຖອນພອດ</button>`;
      body.appendChild(detailTabs);

      const panels = document.createElement("div");
      panels.className = "archive-detail-panels";
      const panelDefinitions = [
        {
          id: "cash-in",
          groups: [
            createArchiveEntryGroup("ເງິນເຂົ້າ", stats.cashInEntries, "cash-in", `+${formatArchiveLAK(stats.inflow)}`)
          ]
        },
        {
          id: "cash-out",
          groups: [
            createArchiveEntryGroup("ເງິນອອກ", stats.cashOutEntries, "cash-out", `-${formatArchiveLAK(stats.outflow)}`),
            createArchiveEntryGroup("ອື່ນໆ", stats.cashOtherEntries, "cash-other")
          ]
        },
        {
          id: "portfolio",
          groups: [
            createArchiveEntryGroup("ພອດເພີ່ມເຂົ້າ", stats.portEntries.deposit, "port-deposit", `+${formatPotUSD(stats.portfolio.depositUSD)} USD`),
            createArchiveEntryGroup("ພອດຖອນອອກ", stats.portEntries.withdraw, "port-withdraw", `${formatPotUSD(stats.portfolio.withdrawalUSD)} USD`),
            createArchiveEntryGroup("ຜົນການເທຣດ", stats.portEntries.trade, "port-trade", `${formatPotUSD(stats.portfolio.tradePnLUSD)} USD`),
            createArchiveEntryGroup("ອື່ນໆ", stats.portEntries.other, "port-other")
          ]
        }
      ];
      panelDefinitions.forEach((definition, index) => {
        const panel = document.createElement("div");
        panel.className = "archive-detail-panel" + (index === 0 ? " active" : "");
        panel.dataset.detailPanel = definition.id;
        panel.setAttribute("role", "tabpanel");
        definition.groups.filter(Boolean).forEach(group => panel.appendChild(group));
        if (!panel.children.length) panel.innerHTML = '<p class="archive-empty">ບໍ່ມີລາຍການ</p>';
        panels.appendChild(panel);
      });
      body.appendChild(panels);
      detailTabs.querySelectorAll(".archive-detail-tab").forEach(tab => {
        tab.addEventListener("click", () => {
          const selected = tab.dataset.detailTab;
          detailTabs.querySelectorAll(".archive-detail-tab").forEach(item => {
            const active = item === tab;
            item.classList.toggle("active", active);
            item.setAttribute("aria-selected", active ? "true" : "false");
          });
          panels.querySelectorAll(".archive-detail-panel").forEach(panel => {
            panel.classList.toggle("active", panel.dataset.detailPanel === selected);
          });
        });
      });
      if (!hasData) {
        body.insertAdjacentHTML("beforeend", '<p class="archive-empty">ບໍ່ມີລາຍການໃນເດືອນນີ້</p>');
      }
    }

    const toggle = () => {
      archiveExpandedMonth = archiveExpandedMonth === month ? null : month;
      renderMonthlyArchive();
    };
    card.querySelector(".archive-card-header")?.addEventListener("click", toggle);
    card.querySelector(".archive-card-header")?.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
    container.appendChild(card);
  }
}

// ==========================================================
// Cloud (JSONBin)
// ==========================================================
function saveCloudCredentials() {
  cloudApiKey = document.getElementById("cloudApiKey").value.trim();
  cloudBinId  = document.getElementById("cloudBinId").value.trim();
  localStorage.setItem("cloudApiKey", cloudApiKey);
  localStorage.setItem("cloudBinId",  cloudBinId);
  updateCloudStatusUI();
  showCustomModal(" ບັນທຶກສຳເລັດ", "ເຊື່ອມກັບຄລາວແຫລະ");
  triggerAutoCloudBackup();
}

function updateCloudStatusUI() {
  const box = document.getElementById("cloudStatusBox");
  const ki = document.getElementById("cloudApiKey");
  const bi = document.getElementById("cloudBinId");
  if (ki) ki.value = cloudApiKey;
  if (bi) bi.value = cloudBinId;
  if (cloudApiKey && cloudBinId) {
    box.innerHTML = `<span style="color:var(--emerald);">✅ເຊື່ອມໄດ້</span>`;
    box.style.borderColor = "var(--emerald)";
  } else {
    box.innerHTML = `<span style="color:var(--coral);">⚠️ ຍັງບໍ່ທັນໄດ້ເຊື່ອມ</span>`;
    box.style.borderColor = "var(--border)";
  }
}

async function triggerAutoCloudBackup() {
  if (!cloudApiKey || !cloudBinId) return;
  const payload = getPersistedStatePayload();
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${cloudBinId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": cloudApiKey },
      body: JSON.stringify(payload)
    });
  } catch (e) { console.error("Cloud backup error:", e); }
}

async function triggerAutoCloudRestore() {
  if (!cloudApiKey || !cloudBinId) return;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${cloudBinId}/latest`, {
      headers: { "X-Master-Key": cloudApiKey }
    });
    if (!res.ok) return;
    const { record: c } = await res.json();
    if (!c) return;
    historyByDay      = c.historyByDay      || {};
    portHistoryByDay  = c.portHistoryByDay  || {};
    debtActivityByDay = c.debtActivityByDay || {};
    totals            = c.totals            || { invest:0, spend:0, save:0, fun:0, emergency:0 };
    percents          = c.percents          || { invest:30, spend:20, save:20, fun:10, emergency:20 };
    percentsLastSaved = c.percentsLastSaved || null;
    categoryLabels    = c.categoryLabels    || { invest:"ລົງທຸນ", spend:"ໃຊ້ຈ່າຍ", save:"ເກັບ", fun:"ຕາມໃຈ", emergency:"ພັດທະນາ" };
    incomeMonth   = c.incomeMonth   || 0;
    withdrawMonth = c.withdrawMonth || 0;
    lastResetMonth = c.lastResetMonth || getCurrentMonthKey();
    potUSD = c.potUSD || 0;
    currentExchangeRate = c.currentExchangeRate || 21000;
    exchangeRateMode    = c.exchangeRateMode    || "auto";
     lastPotTransactionRate = c.lastPotTransactionRate || 0;
    tradeData   = c.tradeData   || {};
    potTransactions = c.potTransactions || [];
    debtors     = c.debtors     || {};
    debtHistory = c.debtHistory || {};
    spareChange = c.spareChange !== undefined ? parseFloat(c.spareChange) : 0;
    withdrawnRealizedPnL = c.withdrawnRealizedPnL !== undefined ? parseFloat(c.withdrawnRealizedPnL) : 0;
    if (c.travelCalendar)      travelCalendar      = c.travelCalendar;
    if (c.travelExpenses)      travelExpenses      = c.travelExpenses;
     if (c.travelMonthlySummary) travelMonthlySummary = c.travelMonthlySummary;
    if (c.herbCalendar)        herbCalendar        = c.herbCalendar;
    if (c.herbExpenses)        herbExpenses        = c.herbExpenses;
    if (c.herbMonthlySummary)  herbMonthlySummary  = c.herbMonthlySummary;
    updateTravelMonthlySummary();
    loadPercentsToUI(); updateSummary(); updateDebtorsUI();
    renderTradeCalendar(); renderTradeMonthlyStats(); renderMonthlyArchive(); renderHistoryForDate(getTodayKey());
    renderCalendar(); renderRecentTrips(); renderTravelGroupedChart();
  } catch (e) { console.error("Cloud restore error:", e); }
}

async function manualCloudUpload() {
  if (!cloudApiKey || !cloudBinId) { showCustomModal("⚠️","ຕັ້ງຄ່າ Key/Bin ກ່ອນແມະ"); return; }
  await triggerAutoCloudBackup();
  showCustomModal("✅ ໂຫລດໄດ້", "Backup ໄປ JSONBin ");
}
async function manualCloudDownload() {
  if (!cloudApiKey || !cloudBinId) { showCustomModal("⚠️","ຕັ້ງຄ່າ Key/Bin ກ່ອນ"); return; }
  await triggerAutoCloudRestore();
  showCustomModal("ໂຫລດໄດ້ແລ້ວ", "ດຶງຂໍ້ມູນຈາກຄລາວລະ");
}

// ==========================================================
// รีเซ็ตรายเดือน
// ==========================================================
function resetMonthlyIfNeeded() {
  const k = getCurrentMonthKey();
  if (lastResetMonth !== k) { incomeMonth = 0; withdrawMonth = 0; lastResetMonth = k; saveData(); }
}

// ==========================================================
// ปฏิทินเที่ยว
// ==========================================================
function changeCalMonth(delta) {
  calViewMonth += delta;
  if (calViewMonth < 0)  { calViewMonth = 11; calViewYear--; }
  if (calViewMonth > 11) { calViewMonth = 0;  calViewYear++; }
  renderCalendar(); renderRecentTrips();
}

function toggleCalDay(dateKey) {
  showExpensePanel(dateKey);
}

function unmarkCalDay() {
  if (!expensePanelDateKey) return;
  const dk = expensePanelDateKey;
  delete travelCalendar[dk];
  delete travelExpenses[dk];
  delete herbCalendar[dk];
  delete herbExpenses[dk];
   updateTravelMonthlySummary();
   saveData();
  hideExpensePanel();
  renderCalendar(); renderRecentTrips(); renderTravelGroupedChart();
}

function showExpensePanel(dateKey) {
  expensePanelDateKey = dateKey;
  const panel = document.getElementById("expensePanel");
  if (!panel) return;
  document.getElementById("expensePanelDate").textContent = dateKeyToLao(dateKey);

  // Set checkboxes from stored data
  const markTravelCB = document.getElementById("markTravel");
  const markHerbCB   = document.getElementById("markHerb");
  if (markTravelCB) markTravelCB.checked = !!travelCalendar[dateKey];
  if (markHerbCB)   markHerbCB.checked   = !!herbCalendar[dateKey];

  // Show/hide expense sections
  toggleDayTypeSections();

  // Travel expense value
  const travelInput = document.getElementById("expenseInput");
   if (travelInput) setMoneyInputValue(travelInput, travelExpenses[dateKey] ? String(travelExpenses[dateKey]) : "");

  // Herb expense value
  const herbInput = document.getElementById("herbExpenseInput");
   if (herbInput) setMoneyInputValue(herbInput, herbExpenses[dateKey] ? String(herbExpenses[dateKey]) : "");

  // Reset deduct mode selectors
  const noneRadio = document.querySelector('input[name="expDeductMode"][value="none"]');
  if (noneRadio) noneRadio.checked = true;
  const catWrap = document.getElementById("expDeductCatWrap");
  if (catWrap) catWrap.style.display = 'none';

  const herbNoneRadio = document.querySelector('input[name="herbDeductMode"][value="none"]');
  if (herbNoneRadio) herbNoneRadio.checked = true;
  const herbCatWrap = document.getElementById("herbDeductCatWrap");
  if (herbCatWrap) herbCatWrap.style.display = 'none';

  populateExpDeductCategory();
  populateHerbDeductCategory();
  panel.style.display = "block";
}

function toggleDayTypeSections() {
  const markTravelCB  = document.getElementById("markTravel");
  const markHerbCB    = document.getElementById("markHerb");
  const travelSection = document.getElementById("travelExpSection");
  const herbSection   = document.getElementById("herbExpSection");
  if (travelSection) travelSection.style.display = markTravelCB && markTravelCB.checked ? 'block' : 'none';
  if (herbSection)   herbSection.style.display   = markHerbCB   && markHerbCB.checked   ? 'block' : 'none';
}

function hideExpensePanel() {
  const panel = document.getElementById("expensePanel");
  if (panel) panel.style.display = "none";
  expensePanelDateKey = null;
}

function populateExpDeductCategory() {
  const sel = document.getElementById("expDeductCategory");
  if (!sel) return;
  sel.innerHTML = "";
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = categoryLabels[cat] + "  (" + formatNum(totals[cat]) + " ກີບ)";
    sel.appendChild(opt);
  });
}

function populateHerbDeductCategory() {
  const sel = document.getElementById("herbDeductCategory");
  if (!sel) return;
  sel.innerHTML = "";
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = categoryLabels[cat] + "  (" + formatNum(totals[cat]) + " ກີບ)";
    sel.appendChild(opt);
  });
}

function saveExpenseFromPanel() {
  if (!expensePanelDateKey) return;
  const dk = expensePanelDateKey;

  const markTravel = document.getElementById("markTravel")?.checked;
  const markHerb   = document.getElementById("markHerb")?.checked;

  // Update calendar markers
  if (markTravel) {
    travelCalendar[dk] = true;
  } else {
    delete travelCalendar[dk];
    delete travelExpenses[dk];
  }
  if (markHerb) {
    herbCalendar[dk] = true;
  } else {
    delete herbCalendar[dk];
    delete herbExpenses[dk];
  }

  // Save travel expense + optional deduct
  if (markTravel) {
    const val = parseMoneyVal(document.getElementById("expenseInput"));
    const deductModeEl = document.querySelector('input[name="expDeductMode"]:checked');
    const shouldDeduct = deductModeEl && deductModeEl.value === 'deduct';

    if (shouldDeduct && val > 0) {
      const cat = document.getElementById("expDeductCategory").value;
      if (!totals[cat] || totals[cat] < val) {
        showCustomModal("⚠️ ເງິນບໍ່ພໍ", `ໝວດ "${categoryLabels[cat]}" ຍອດ ${formatNum(totals[cat])} ກີບ`);
        return;
      }
      pushToHistory();
      totals[cat] -= val;
      stripSpareChange(cat);
      logCashHistory(`✈️ ຄ່າທ່ຽວ -${formatNum(val)} ກີບ (ຫັກຈາກ ${categoryLabels[cat]})`);
      saveData(); updateSummary();
    }

    if (val > 0) { travelExpenses[dk] = val; } else { delete travelExpenses[dk]; }
  }

  // Save herb expense + optional deduct
  if (markHerb) {
    const herbVal = parseMoneyVal(document.getElementById("herbExpenseInput"));
    const herbDeductModeEl = document.querySelector('input[name="herbDeductMode"]:checked');
    const shouldHerbDeduct = herbDeductModeEl && herbDeductModeEl.value === 'deduct';

    if (shouldHerbDeduct && herbVal > 0) {
      const cat = document.getElementById("herbDeductCategory").value;
      if (!totals[cat] || totals[cat] < herbVal) {
        showCustomModal("⚠️ ເງິນບໍ່ພໍ", `ໝວດ "${categoryLabels[cat]}" ຍອດ ${formatNum(totals[cat])} ກີບ`);
        return;
      }
      pushToHistory();
      totals[cat] -= herbVal;
      stripSpareChange(cat);
      logCashHistory(`🌿 ຄ່າກັນຊາ -${formatNum(herbVal)} ກີບ (ຫັກຈາກ ${categoryLabels[cat]})`);
      saveData(); updateSummary();
    }

    if (herbVal > 0) { herbExpenses[dk] = herbVal; } else { delete herbExpenses[dk]; }
  }

   updateTravelMonthlySummary();
   saveData();
  hideExpensePanel();
  renderCalendar();
  renderRecentTrips();
  renderTravelGroupedChart();
}

function renderCalendar() {
  const monthLabelEl = document.getElementById('calMonthLabel');
  const grid = document.getElementById('calDaysGrid');
  const countEl = document.getElementById('calTripCount');
  const spendEl = document.getElementById('calTotalExpense');
  if (!grid) return;

  if (monthLabelEl) monthLabelEl.textContent = LAO_MONTHS[calViewMonth] + ' ' + calViewYear;

  const today = getTodayKey();
  const firstDayOfMonth = new Date(calViewYear, calViewMonth, 1).getDay();
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const monthKey = calViewYear + '-' + String(calViewMonth + 1).padStart(2, '0');

  grid.innerHTML = '';
  for (let i = 0; i < firstDayOfMonth; i++) {
    const e = document.createElement('div'); e.className = 'cal-day empty'; grid.appendChild(e);
  }

  let tripCount = 0, totalSpend = 0, totalHerbSpend = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dk       = monthKey + '-' + String(d).padStart(2, '0');
    const isTravel = !!travelCalendar[dk];
    const isHerb   = !!herbCalendar[dk];
    const isToday  = dk === today;
    const tExp     = travelExpenses[dk] || 0;
    const hExp     = herbExpenses[dk]   || 0;
    if (isTravel) { tripCount++; totalSpend += tExp; }
    if (isHerb)   { totalHerbSpend += hExp; }

    const cell = document.createElement('div');
    let cls = 'cal-day';
    if (isTravel && isHerb) cls += ' both';
    else if (isTravel)      cls += ' marked';
    else if (isHerb)        cls += ' herb';
    if (isToday)            cls += ' today';
    cell.className = cls;

    const totalExp = tExp + hExp;
    if ((isTravel || isHerb) && totalExp > 0) {
      const badge = totalExp >= 1000000 ? (totalExp / 1000000).toFixed(1) + "M"
                  : totalExp >= 1000    ? Math.round(totalExp / 1000) + "k"
                  : formatNum(totalExp);
      cell.innerHTML = `<span class="cal-day-num">${d}</span><span class="cal-day-expense">${badge}</span>`;
    } else {
      cell.innerHTML = `<span class="cal-day-num">${d}</span>`;
    }
    cell.addEventListener('click', () => toggleCalDay(dk));
    grid.appendChild(cell);
  }

  if (countEl) countEl.textContent = tripCount;
  if (spendEl) spendEl.textContent = formatNum(totalSpend);
  const herbSpendEl = document.getElementById('calTotalHerbSpend');
  if (herbSpendEl) herbSpendEl.textContent = formatNum(totalHerbSpend);
}

function renderRecentTrips() {
  const container = document.getElementById('recentTripsList');
  if (!container) return;
  const all = Object.keys(travelCalendar).sort().reverse();
  if (all.length === 0) {
    container.innerHTML = '<p style="color:var(--text-faint);font-style:italic;font-size:13px;">ຍັງບໍ່ມີບັນທຶກ</p>';
    return;
  }
  container.innerHTML = '';
  all.slice(0, 10).forEach(dk => {
    const d = new Date(dk + 'T00:00:00');
    const exp = travelExpenses[dk] || 0;
    const item = document.createElement('div');
    item.className = 'trip-item';
    item.innerHTML = `
      <div class="trip-dot"></div>
      <div class="trip-info">
        <span class="trip-date">${d.getDate()} ${LAO_MONTHS[d.getMonth()]} ${d.getFullYear()}</span>
        ${exp > 0 ? `<span class="trip-expense">💸 ${formatNum(exp)} ກີບ</span>` : '<span class="trip-expense-empty">-</span>'}
      </div>
      <span class="trip-day-name">${LAO_DAYS[d.getDay()]}</span>`;
    container.appendChild(item);
  });
  if (all.length > 10) {
    const m = document.createElement('p');
    m.style.cssText = 'text-align:center;font-size:12px;color:var(--text-faint);margin-top:8px;';
    m.textContent = `+ ອີກ ${all.length - 10} ລາຍການ`;
    container.appendChild(m);
  }
}

// ==========================================================
// V9 NEW: อัพเดทสถิติรายเดือนการเที่ยว
// ==========================================================
function updateTravelMonthlySummary() {
  const temp = {};
  const herbTemp = {};

  Object.keys(travelCalendar).forEach(dk => {
    const parts = dk.split('-');
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const monthKey = parts[0] + '-' + parts[1];
    const daysInMonth = new Date(y, m, 0).getDate();
    if (!temp[monthKey]) temp[monthKey] = { tripDays: 0, totalExpense: 0, daysInMonth };
    temp[monthKey].tripDays++;
    temp[monthKey].totalExpense += (travelExpenses[dk] || 0);
  });

  Object.keys(herbCalendar).forEach(dk => {
    const parts = dk.split('-');
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const monthKey = parts[0] + '-' + parts[1];
    const daysInMonth = new Date(y, m, 0).getDate();
    if (!herbTemp[monthKey]) herbTemp[monthKey] = { herbDays: 0, totalHerbSpend: 0, daysInMonth };
    herbTemp[monthKey].herbDays++;
    herbTemp[monthKey].totalHerbSpend += (herbExpenses[dk] || 0);
  });

  travelMonthlySummary = temp;
  herbMonthlySummary   = herbTemp;
  localStorage.setItem("travelMonthlySummary", JSON.stringify(travelMonthlySummary));
  localStorage.setItem("herbMonthlySummary",   JSON.stringify(herbMonthlySummary));
}

// ==========================================================
// V9 NEW: Grouped Bar Chart — สถิติการเที่ยวรายเดือน
// ==========================================================
function renderTravelGroupedChart() {
  const canvas = document.getElementById('travelGroupedChart');
  if (!canvas) return;

  const today = new Date();
  const allMonths = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(today.getFullYear(), m, 1);
    const key = d.getFullYear() + '-' + String(m + 1).padStart(2, '0');
    const daysInMonth = new Date(d.getFullYear(), m + 1, 0).getDate();
    allMonths.push({ key, d, daysInMonth });
  }

  const allData = allMonths.map(m => {
    const summary = travelMonthlySummary[m.key];
    return summary || { tripDays: 0, totalExpense: 0, daysInMonth: m.daysInMonth };
  });

  let firstActive = allData.findIndex(d => d.tripDays > 0 || d.totalExpense > 0);
  if (firstActive < 0) firstActive = today.getMonth();
  const months  = allMonths.slice(firstActive);
  const rawData = allData.slice(firstActive);

  const labels = months.map(m =>
    LAO_MONTHS_SHORT[m.d.getMonth()] + "'" + String(m.d.getFullYear()).slice(2)
  );

  const blueBars = rawData.map(d =>
    d.daysInMonth > 0 ? parseFloat(((d.tripDays / d.daysInMonth) * 100).toFixed(1)) : 0
  );

  const maxExp = Math.max(...rawData.map(d => d.totalExpense), 1);
  const orangeBars = rawData.map(d =>
    parseFloat(((d.totalExpense / maxExp) * 100).toFixed(1))
  );

  const orangeTopLabels = rawData.map((d, i) => {
    if (i === 0) return d.totalExpense > 0 ? formatNum(d.totalExpense) : '-';
    const prev = rawData[i - 1].totalExpense;
    const cur  = d.totalExpense;
    if (prev === 0 && cur === 0) return '-';
    if (prev === 0) return '+100%';
    const pct = ((cur - prev) / prev * 100).toFixed(0);
    return (pct >= 0 ? '+' : '') + pct + '%';
  });

  // Herb (green) bars
  const herbRaw = months.map(m => {
    const hd = herbMonthlySummary[m.key];
    return hd ? hd.totalHerbSpend : 0;
  });
  const maxHerb = Math.max(...herbRaw, 1);
  const greenBars = herbRaw.map(v => parseFloat(((v / maxHerb) * 100).toFixed(1)));
  const greenTopLabels = herbRaw.map((v, i) => {
    if (i === 0) return v > 0 ? formatNum(v) : '-';
    const prev = herbRaw[i - 1];
    if (prev === 0 && v === 0) return '-';
    if (prev === 0) return '+100%';
    const pct = ((v - prev) / prev * 100).toFixed(0);
    return (pct >= 0 ? '+' : '') + pct + '%';
  });

  if (travelGroupedChartInstance) travelGroupedChartInstance.destroy();

  const ctx = canvas.getContext('2d');

  travelGroupedChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '% ວັນທ່ຽວ',
          data: blueBars,
          backgroundColor: 'rgba(91,110,232,0.85)',
          borderRadius: 5,
          maxBarThickness: 28,
        },
        {
          label: 'ສັດສ່ວນຄ່າທ່ຽວ',
          data: orangeBars,
          backgroundColor: 'rgba(227,168,87,0.85)',
          borderRadius: 5,
          maxBarThickness: 28,
        },
        {
          label: 'ສັດສ່ວນຄ່າກັນຊາ',
          data: greenBars,
          backgroundColor: 'rgba(34,197,94,0.85)',
          borderRadius: 5,
          maxBarThickness: 28,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 2,
          font: { size: 9, weight: '700', family: "'JetBrains Mono', monospace" },
          formatter: function(value, context) {
            const dsIndex = context.datasetIndex;
            const idx     = context.dataIndex;
            if (value === 0) return '';
            if (dsIndex === 0) return value + '%';
            if (dsIndex === 1) return orangeTopLabels[idx];
            return greenTopLabels[idx];
          },
          color: function(context) {
            if (context.datasetIndex === 0) return '#7DD3FC';
            if (context.datasetIndex === 1) return '#E3A857';
            return '#22c55e';
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.03)' },
          ticks: { color: '#8b96a5', font: { size: 10 } }
        },
        y: {
          min: 0,
          max: 110,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#8b96a5',
            font: { size: 9 },
            callback: function(v) { return v <= 100 ? v + '%' : ''; }
          }
        }
      }
    }
  });

  renderTravelChartSubLabels();
}

// ==========================================================
// V9 NEW: Sub-labels ใต้กราฟ Travel Grouped Chart
// ==========================================================
function renderTravelChartSubLabels() {
  const container = document.getElementById('travelChartSubLabels');
  if (!container) return;
  container.innerHTML = '';

  const today = new Date();
  const months = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(today.getFullYear(), m, 1);
    const key = d.getFullYear() + '-' + String(m + 1).padStart(2, '0');
    const daysInMonth = new Date(d.getFullYear(), m + 1, 0).getDate();
    const summary = travelMonthlySummary[key];
    months.push({
      key, d, daysInMonth,
      data: summary || { tripDays: 0, totalExpense: 0, daysInMonth }
    });
  }

  months.forEach((m, i) => {
    const d = m.data;
    const prevData = i > 0 ? months[i - 1].data : null;

    let momDaysText  = '';
    let momDaysClass = '';
    if (prevData !== null) {
      if (prevData.tripDays === 0 && d.tripDays === 0) {
        momDaysText = '-';
      } else if (prevData.tripDays === 0) {
        momDaysText = '+100%'; momDaysClass = 'up';
      } else {
        const pct   = ((d.tripDays - prevData.tripDays) / prevData.tripDays * 100).toFixed(0);
        const times = (d.tripDays / prevData.tripDays).toFixed(1);
        momDaysText  = (pct >= 0 ? '+' : '') + pct + '% (' + times + '×)';
        momDaysClass = pct >= 0 ? 'up' : 'down';
      }
    }

    let momExpText  = '';
    let momExpClass = '';
    if (prevData !== null) {
      if (prevData.totalExpense === 0 && d.totalExpense === 0) {
        momExpText = '-';
      } else if (prevData.totalExpense === 0) {
        momExpText = '+100%'; momExpClass = 'up';
      } else {
        const pct   = ((d.totalExpense - prevData.totalExpense) / prevData.totalExpense * 100).toFixed(0);
        const times = (d.totalExpense / prevData.totalExpense).toFixed(1);
        momExpText  = (pct >= 0 ? '+' : '') + pct + '% (' + times + '×)';
        momExpClass = pct >= 0 ? 'up' : 'down';
      }
    }

    const col = document.createElement('div');
    col.className = 'chart-sublabel-col';

    const monthShort = LAO_MONTHS_SHORT[m.d.getMonth()];
    const yearShort  = String(m.d.getFullYear()).slice(2);

    // Herb data for this month
    const herbMonthData = herbMonthlySummary[m.key];
    const herbSpend     = herbMonthData ? herbMonthData.totalHerbSpend : 0;
    const prevHerbData  = i > 0 ? herbMonthlySummary[months[i - 1].key] : null;
    const prevHerbSpend = prevHerbData ? prevHerbData.totalHerbSpend : 0;

    let momHerbText = '', momHerbClass = '';
    if (i > 0) {
      if (prevHerbSpend === 0 && herbSpend === 0) {
        momHerbText = '-';
      } else if (prevHerbSpend === 0) {
        momHerbText = '+100%'; momHerbClass = 'up';
      } else {
        const pct   = ((herbSpend - prevHerbSpend) / prevHerbSpend * 100).toFixed(0);
        const times = (herbSpend / prevHerbSpend).toFixed(1);
        momHerbText  = (pct >= 0 ? '+' : '') + pct + '% (' + times + '×)';
        momHerbClass = pct >= 0 ? 'up' : 'down';
      }
    }

    col.innerHTML = `
      <div class="sublabel-month">${monthShort}'${yearShort}</div>
      <div class="sublabel-days">${d.tripDays} ວັນ</div>
      <div class="sublabel-exp">${d.totalExpense > 0 ? formatNum(d.totalExpense) : '-'}</div>
      <div class="sublabel-herb">${herbSpend > 0 ? '🌿' + formatNum(herbSpend) : '-'}</div>
      <div class="sublabel-divider"></div>
      <div class="sublabel-mom-days ${momDaysClass}">${momDaysText || '-'}</div>
      <div class="sublabel-mom-exp ${momExpClass}">${momExpText || '-'}</div>
      <div class="sublabel-mom-herb ${momHerbClass}">${momHerbText || '-'}</div>
    `;
    container.appendChild(col);
  });

  requestAnimationFrame(() => { container.scrollLeft = container.scrollWidth; });
}

// ==========================================================
// Money inputs
// ==========================================================
function setupMoneyInputs() {
  document.querySelectorAll("[data-money-input]").forEach(input => {
    formatMoneyInputElement(input);
  });
}

// ==========================================================
// เริ่มต้นระบบ
// ==========================================================
window.onload = async () => {
  updateCloudStatusUI();

  const hasLocalData = localStorage.getItem("totals");
  if (!hasLocalData && cloudApiKey && cloudBinId) {
    await triggerAutoCloudRestore();
  }

  resetMonthlyIfNeeded();
  pruneOldHistory();
  pruneTradeData();
  renderCategoryLabelsUI();
  loadPercentsToUI();

  if (exchangeRateMode === "auto") {
    await fetchExchangeRate(false);
  } else {
    document.getElementById("manualRateInput").value = currentExchangeRate;
    setExchangeRateMode("manual");
  }

  updateSummary();
  updateDebtorsUI();
  renderTradeCalendar();
  renderTradeMonthlyStats();
  renderMonthlyArchive();
  renderHistoryForDate(getTodayKey());
  updateUndoButtonState();
   setupMoneyInputs();
  renderCalendar();
  renderRecentTrips();

  updateTravelMonthlySummary();
  renderTravelGroupedChart();

  document.querySelectorAll('input[name="expDeductMode"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const catWrap = document.getElementById("expDeductCatWrap");
      if (catWrap) {
        catWrap.style.display = this.value === 'deduct' ? 'block' : 'none';
        if (this.value === 'deduct') populateExpDeductCategory();
      }
    });
  });

  document.querySelectorAll('input[name="herbDeductMode"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const catWrap = document.getElementById("herbDeductCatWrap");
      if (catWrap) {
        catWrap.style.display = this.value === 'deduct' ? 'block' : 'none';
        if (this.value === 'deduct') populateHerbDeductCategory();
      }
    });
  });
};

// ==========================================================
// Thousand-dot formatting
// ==========================================================
function formatThousands(str) {
  const digits = str.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function moneyInputAllowsDecimals(el) {
  return el?.dataset?.moneyDecimals === "true";
}

function formatMoneyInputValue(value, el) {
  const raw = String(value ?? "").replace(/,/g, "").trim();
  if (!raw) return "";
  const allowDecimals = moneyInputAllowsDecimals(el);
  const negative = raw.startsWith("-");
  const unsigned = raw.replace(/^[+-]/, "");
  let integerSource = unsigned;
  let decimalPart = "";
  const lastDot = unsigned.lastIndexOf(".");
  const possibleDecimal = lastDot >= 0 ? unsigned.slice(lastDot + 1).replace(/[^0-9]/g, "") : "";

  if (allowDecimals && lastDot >= 0 && possibleDecimal.length <= 2) {
    integerSource = unsigned.slice(0, lastDot);
    decimalPart = possibleDecimal;
  }

  const integerPart = formatThousands(integerSource);
  if (!integerPart && !decimalPart) return negative ? "-" : "";
  return (negative ? "-" : "") + (integerPart || "0") +
    (allowDecimals && (lastDot >= 0 || decimalPart) ? "." + decimalPart : "");
}

function formatMoneyInputElement(el) {
  if (!el) return;
  const before = el.value;
  const cursor = el.selectionStart ?? before.length;
  const digitsBefore = before.slice(0, cursor).replace(/[^0-9]/g, "").length;
  const formatted = formatMoneyInputValue(before, el);
  el.value = formatted;

  let nextCursor = formatted.length;
  if (cursor < before.length) {
    let seen = 0;
    nextCursor = 0;
    while (nextCursor < formatted.length && seen < digitsBefore) {
      if (/[0-9]/.test(formatted[nextCursor])) seen++;
      nextCursor++;
    }
  }
  try { el.setSelectionRange(nextCursor, nextCursor); } catch (_) {}
}

function setMoneyInputValue(el, value) {
  if (!el) return;
  el.value = formatMoneyInputValue(value, el);
}

function parseMoneyVal(el) {
  if (!el) return 0;
  const raw = String(el.value || '').trim().replace(/,/g, '');
  if (!raw) return 0;
  const negative = raw.startsWith("-");
  const unsigned = raw.replace(/^[+-]/, "");
  const lastDot = unsigned.lastIndexOf(".");
  const decimalPart = lastDot >= 0 ? unsigned.slice(lastDot + 1) : "";
  const hasDecimal = moneyInputAllowsDecimals(el) &&
    lastDot >= 0 && /^\d{1,2}$/.test(decimalPart);
  const normalized = hasDecimal
    ? unsigned.slice(0, lastDot).replace(/\./g, "") + "." + decimalPart
    : unsigned.replace(/\./g, "");
  const result = Number(normalized) || 0;
  return negative ? -result : result;
}

document.addEventListener('input', function(e) {
  const el = e.target;
  if (el.tagName !== 'INPUT' || !el.matches("[data-money-input]")) return;
  formatMoneyInputElement(el);
}, true);
