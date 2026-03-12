import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const EMPTY_ROOM_PAYLOAD = { members: [], expenses: [], payments: [] };
const state = {
  roomCode: "",
  roomSecret: "",
  roomId: "",
  activeSectionTab: "expense",
  expandedBalanceMemberId: "",
  editingExpenseId: "",
  rooms: [],
  members: [],
  expenses: [],
  payments: [],
  saveTimer: null,
  app: null,
  auth: null,
  db: null,
  authReadyPromise: null,
  unsubscribeRoom: null,
  unsubscribeRoomList: null,
  lastLoadedFingerprint: "",
};
const els = {
  roomForm: document.getElementById("room-form"),
  roomCodeInput: document.getElementById("room-code-input"),
  roomSecretInput: document.getElementById("room-secret-input"),
  leaveRoomButton: document.getElementById("leave-room-button"),
  roomPanel: document.getElementById("room-panel"),
  roomEntrySection: document.getElementById("room-entry-section"),
  roomDiscoverySection: document.getElementById("room-discovery-section"),
  sectionTabs: document.getElementById("section-tabs"),
  roomStatus: document.getElementById("room-status"),
  roomStatusDisplay: document.getElementById("room-status-display"),
  roomStatusName: document.getElementById("room-status-name"),
  syncStatus: document.getElementById("sync-status"),
  appGrid: document.getElementById("app-grid"),
  roomListPanel: document.getElementById("room-list-panel"),
  memberSection: document.getElementById("member-section"),
  expenseSection: document.getElementById("expense-section"),
  summarySection: document.getElementById("summary-section"),
  historySection: document.getElementById("history-section"),
  memberForm: document.getElementById("member-form"),
  memberNameInput: document.getElementById("member-name-input"),
  memberList: document.getElementById("member-list"),
  memberCount: document.getElementById("member-count"),
  expenseForm: document.getElementById("expense-form"),
  expenseFormTitle: document.getElementById("expense-form-title"),
  expenseSubmitButton: document.getElementById("expense-submit-button"),
  expenseCancelButton: document.getElementById("expense-cancel-button"),
  expensePayerSelect: document.getElementById("expense-payer-select"),
  participantOptions: document.getElementById("participant-options"),
  splitModeHint: document.getElementById("split-mode-hint"),
  expenseCount: document.getElementById("expense-count"),
  totalSpent: document.getElementById("total-spent"),
  settlementList: document.getElementById("settlement-list"),
  paymentHistory: document.getElementById("payment-history"),
  expenseList: document.getElementById("expense-list"),
  toast: document.getElementById("toast"),
};
const firebaseConfig = window.SPLITCASH_FIREBASE_CONFIG;

init();

function init() {
  hydrateRoomForm();
  bindEvents();
  render();
  initializeFirebase();
}

function bindEvents() {
  els.roomForm.addEventListener("submit", handleRoomSubmit);
  els.leaveRoomButton.addEventListener("click", leaveRoom);
  els.memberForm.addEventListener("submit", handleMemberSubmit);
  els.memberList.addEventListener("click", handleMemberListClick);
  els.expenseForm.addEventListener("submit", handleExpenseSubmit);
  els.expenseForm.addEventListener("change", handleExpenseFormChange);
  els.expenseCancelButton.addEventListener("click", resetExpenseForm);
  if (els.sectionTabs) {
    els.sectionTabs.addEventListener("click", handleSectionTabClick);
  }
  window.addEventListener("resize", syncResponsiveSections);
}

function hydrateRoomForm() {
  const saved = loadRoomMeta();
  const shared = new URL(window.location.href).searchParams.get("room") || "";
  els.roomCodeInput.value = shared || saved.roomCode || "";
}

function initializeFirebase() {
  if (!hasFirebaseConfig()) {
    updateRoomStatus("缺少 Firebase 設定", "Firebase not configured");
    return;
  }

  state.app = initializeApp(firebaseConfig);
  state.auth = getAuth(state.app);
  state.db = getFirestore(state.app);
  updateRoomStatus("連接中", "Initializing Firebase...");
  
  let authUnsubscribe;
  const timeoutId = window.setTimeout(() => {
    if (authUnsubscribe) authUnsubscribe();
    updateRoomStatus("連接失敗", "Firebase auth timeout");
    showToast("Firebase 連接逾時，請檢查網路連接後重新整理頁面");
  }, 15000);
  
  state.authReadyPromise = new Promise((resolve, reject) => {
    authUnsubscribe = onAuthStateChanged(
      state.auth,
      (user) => {
        if (!user) return; // 等待 signInAnonymously 完成
        window.clearTimeout(timeoutId);
        updateRoomStatus("已匿名登入", "Firebase auth ready");
        resolve(user);
        startRoomListSubscription();
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  }).catch((error) => {
    console.error("Firebase auth listener error:", error);
    updateRoomStatus("連接失敗", error.code || error.message || "unknown");
    showToast(`Firebase 連接失敗: ${error.message || error.code || "unknown"}`);
  });

  signInAnonymously(state.auth).catch((error) => {
    window.clearTimeout(timeoutId);
    console.error("Anonymous signin error:", error);
    updateRoomStatus("連接失敗", error.code || "Firebase auth error");
    showToast(`Firebase 匿名登入失敗: ${error.message || error.code || "unknown"}`);
  });
}

async function handleRoomSubmit(event) {
  event.preventDefault();
  if (!hasFirebaseConfig()) {
    showToast("請先設定 Firebase");
    return;
  }

  const roomCode = els.roomCodeInput.value.trim();
  const roomSecret = els.roomSecretInput.value.trim();
  if (!roomCode || !roomSecret) {
    showToast("請輸入房間代碼與密碼");
    return;
  }
  if (!/^\d{4}$/.test(roomSecret)) {
    showToast("房間 PIN 需要 4 碼數字");
    return;
  }

  state.roomCode = roomCode;
  state.roomSecret = roomSecret;
  state.roomId = await sha256Hex(roomCode.toLowerCase());
  persistRoomMeta();
  updateRoomStatus("登入房間中", state.roomCode);

  try {
    await ensureFirebaseSession();
    const { exists, payload } = await loadRoomRecord();
    applyPayload(payload);
    if (!exists) {
      await saveRoomPayload(payload);
    } else {
      await ensureRoomMetadata();
    }
    startRoomSubscription();
    updateRoomStatus("同步完成", state.roomCode);
    render();
    showToast("已進入房間");
  } catch (error) {
    console.error(error);
    updateRoomStatus("房間登入失敗", error.code || state.roomCode || "Room error");
    showToast(`房間登入失敗: ${error.code || error.message || "unknown"}`);
  }
}

function handleMemberSubmit(event) {
  event.preventDefault();
  if (!ensureActiveRoom()) return;
  const name = els.memberNameInput.value.trim();
  if (!name) return;
  if (state.members.some((member) => member.name.toLowerCase() === name.toLowerCase())) {
    showToast("成員名稱已存在");
    return;
  }
  state.members.push({ id: createId(), name, createdAt: new Date().toISOString() });
  els.memberNameInput.value = "";
  render();
  queueSave();
}
function handleExpenseSubmit(event) {
  event.preventDefault();
  if (!ensureActiveRoom()) return;
  if (state.members.length === 0) {
    showToast("請先建立成員");
    return;
  }

  const form = new FormData(els.expenseForm);
  const title = String(form.get("title") || "").trim();
  const amount = Number(form.get("amount"));
  const amountCents = toCents(amount);
  const payerId = String(form.get("payerId") || "");
  const note = String(form.get("note") || "").trim();
  const splitMode = getSelectedSplitMode();
  const participantIds = getSelectedParticipants();

  if (!title || !Number.isFinite(amount) || amount <= 0) {
    showToast("請填正確的品項與金額");
    return;
  }
  if (!payerId) {
    showToast("請選擇付款人");
    return;
  }
  if (participantIds.length === 0) {
    showToast("至少要選 1 位分攤成員");
    return;
  }

  const customShares = splitMode === "custom" ? getCustomShareAllocations(amountCents) : null;
  if (splitMode === "custom" && !customShares) return;

  const expenseRecord = {
    id: state.editingExpenseId || createId(),
    title,
    amountCents,
    payerId,
    participantIds,
    splitMode,
    customShares,
    note,
    createdAt: new Date().toISOString(),
  };

  if (state.editingExpenseId) {
    const original = state.expenses.find((expense) => expense.id === state.editingExpenseId);
    if (original?.createdAt) {
      expenseRecord.createdAt = original.createdAt;
    }
    state.expenses = state.expenses.map((expense) =>
      expense.id === state.editingExpenseId ? expenseRecord : expense
    );
  } else {
    state.expenses.unshift(expenseRecord);
  }

  resetExpenseForm();
  render();
  queueSave();
}

function handleExpenseFormChange(event) {
  if (
    event.target instanceof HTMLInputElement &&
    (event.target.name === "splitMode" || event.target.type === "checkbox")
  ) {
    syncSplitModeUI();
  }
}

function removeMember(memberId) {
  const usedByExpense = state.expenses.some(
    (expense) => expense.payerId === memberId || getExpenseShares(expense).some((share) => share.memberId === memberId)
  );
  const usedByPayment = state.payments.some(
    (payment) => payment.fromId === memberId || payment.toId === memberId
  );
  if (usedByExpense || usedByPayment) {
    showToast("成員已出現在支出或結算紀錄中，無法直接刪除");
    return;
  }
  state.members = state.members.filter((member) => member.id !== memberId);
  render();
  queueSave();
}

function removeExpense(expenseId) {
  state.expenses = state.expenses.filter((expense) => expense.id !== expenseId);
  if (state.editingExpenseId === expenseId) {
    resetExpenseForm();
  }
  render();
  queueSave();
}

function startEditingExpense(expenseId) {
  const expense = state.expenses.find((item) => item.id === expenseId);
  if (!expense) return;

  state.editingExpenseId = expenseId;
  state.activeSectionTab = "expense";
  updateExpenseFormModeUI();
  syncResponsiveSections();

  els.expenseForm.querySelector('[name="title"]').value = expense.title;
  els.expenseForm.querySelector('[name="amount"]').value = (expense.amountCents / 100).toFixed(2);
  els.expensePayerSelect.value = expense.payerId;
  els.expenseForm.querySelector('[name="note"]').value = expense.note || "";

  const splitModeInput = els.expenseForm.querySelector(`input[name="splitMode"][value="${expense.splitMode || "equal"}"]`);
  if (splitModeInput) {
    splitModeInput.checked = true;
  }

  const selectedParticipantIds = new Set(expense.participantIds || []);
  const customShareMap = new Map(
    (expense.customShares || []).map((share) => [share.memberId, (share.amountCents / 100).toFixed(2)])
  );

  Array.from(els.participantOptions.querySelectorAll('input[type="checkbox"]')).forEach((checkbox) => {
    checkbox.checked = selectedParticipantIds.has(checkbox.value);
    const shareInput = els.participantOptions.querySelector(`[data-share-input="${checkbox.value}"]`);
    if (shareInput instanceof HTMLInputElement) {
      shareInput.value = customShareMap.get(checkbox.value) || "";
    }
  });

  syncSplitModeUI();
  requestAnimationFrame(() => {
    els.expenseSection.scrollIntoView({ behavior: "smooth", block: "start" });
    els.expenseForm.querySelector('[name="title"]').focus();
  });
}

function resetExpenseForm() {
  state.editingExpenseId = "";
  els.expenseForm.reset();
  updateExpenseFormModeUI();
  renderPayerOptions();
  renderParticipantOptions();
}

function updateExpenseFormModeUI() {
  const isEditing = Boolean(state.editingExpenseId);
  els.expenseFormTitle.textContent = isEditing ? "編輯支出" : "新增支出";
  els.expenseSubmitButton.textContent = isEditing ? "儲存修改" : "新增支出";
  els.expenseCancelButton.hidden = !isEditing;
}

function recordSettlement(fromId, toId, amountCents) {
  if (!ensureActiveRoom()) return;
  state.payments.unshift({ id: createId(), fromId, toId, amountCents, createdAt: new Date().toISOString() });
  render();
  queueSave();
  showToast("已記錄結算");
}

function removePayment(paymentId) {
  state.payments = state.payments.filter((payment) => payment.id !== paymentId);
  render();
  queueSave();
  showToast("已取消結算紀錄");
}

function getSelectedParticipants() {
  return Array.from(els.participantOptions.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
}

function getSelectedSplitMode() {
  return els.expenseForm.querySelector('input[name="splitMode"]:checked')?.value || "equal";
}

function getCustomShareAllocations(totalAmountCents) {
  const selectedIds = getSelectedParticipants();
  const shares = selectedIds.map((memberId) => {
    const input = els.participantOptions.querySelector(`[data-share-input="${memberId}"]`);
    const amount = Number(input?.value || 0);
    return { memberId, amountCents: toCents(amount) };
  });

  if (shares.some((share) => !Number.isFinite(share.amountCents) || share.amountCents <= 0)) {
    showToast("自訂分攤時，每位勾選成員都要填大於 0 的金額");
    return null;
  }

  const totalShares = shares.reduce((sum, share) => sum + share.amountCents, 0);
  if (totalShares !== totalAmountCents) {
    showToast("自訂分攤總和必須等於支出金額");
    return null;
  }

  return shares;
}

function buildEqualShares(totalAmountCents, participantIds) {
  if (!participantIds.length) return [];
  const base = Math.floor(totalAmountCents / participantIds.length);
  let remainder = totalAmountCents - base * participantIds.length;
  return participantIds.map((memberId) => {
    const amountCents = base + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return { memberId, amountCents };
  });
}

function getExpenseShares(expense) {
  if (expense.splitMode === "custom" && Array.isArray(expense.customShares) && expense.customShares.length > 0) {
    return expense.customShares
      .filter((share) => share && share.memberId)
      .map((share) => ({ memberId: share.memberId, amountCents: normalizeCents(share.amountCents || 0) }));
  }
  return buildEqualShares(expense.amountCents, Array.isArray(expense.participantIds) ? expense.participantIds : []);
}

function computeBalances() {
  const balances = new Map(state.members.map((member) => [member.id, 0]));
  for (const expense of state.expenses) {
    const shares = getExpenseShares(expense);
    if (!balances.has(expense.payerId) || shares.length === 0) continue;
    for (const share of shares) {
      balances.set(share.memberId, (balances.get(share.memberId) || 0) - share.amountCents);
    }
    balances.set(expense.payerId, (balances.get(expense.payerId) || 0) + expense.amountCents);
  }
  for (const payment of state.payments) {
    if (!balances.has(payment.fromId) || !balances.has(payment.toId)) continue;
    balances.set(payment.fromId, (balances.get(payment.fromId) || 0) + payment.amountCents);
    balances.set(payment.toId, (balances.get(payment.toId) || 0) - payment.amountCents);
  }
  return state.members.map((member) => ({ ...member, balanceCents: normalizeCents(balances.get(member.id) || 0) }));
}

function getBalanceBreakdown(memberId) {
  const lines = [];

  for (const expense of state.expenses) {
    if (expense.payerId === memberId) {
      lines.push({
        key: `payer-${expense.id}`,
        label: `代墊 ${expense.title}`,
        amountCents: expense.amountCents,
      });
    }

    for (const share of getExpenseShares(expense)) {
      if (share.memberId !== memberId) continue;
      lines.push({
        key: `share-${expense.id}-${memberId}`,
        label: `分攤 ${expense.title}`,
        amountCents: -share.amountCents,
      });
    }
  }

  for (const payment of state.payments) {
    if (payment.fromId === memberId) {
      lines.push({
        key: `payment-out-${payment.id}`,
        label: `已支付給 ${findMemberName(payment.toId)}`,
        amountCents: payment.amountCents,
      });
    }

    if (payment.toId === memberId) {
      lines.push({
        key: `payment-in-${payment.id}`,
        label: `已收到 ${findMemberName(payment.fromId)}`,
        amountCents: -payment.amountCents,
      });
    }
  }

  return lines;
}

function computeSettlements(balanceRows) {
  const creditors = balanceRows.filter((row) => row.balanceCents > 0).map((row) => ({ id: row.id, name: row.name, amountCents: row.balanceCents })).sort((a, b) => b.amountCents - a.amountCents);
  const debtors = balanceRows.filter((row) => row.balanceCents < 0).map((row) => ({ id: row.id, name: row.name, amountCents: Math.abs(row.balanceCents) })).sort((a, b) => b.amountCents - a.amountCents);
  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const transfer = Math.min(creditor.amountCents, debtor.amountCents);
    settlements.push({ fromId: debtor.id, from: debtor.name, toId: creditor.id, to: creditor.name, amountCents: normalizeCents(transfer) });
    creditor.amountCents = normalizeCents(creditor.amountCents - transfer);
    debtor.amountCents = normalizeCents(debtor.amountCents - transfer);
    if (creditor.amountCents === 0) creditorIndex += 1;
    if (debtor.amountCents === 0) debtorIndex += 1;
  }
  return settlements;
}
function render() {
  updateAppVisibility();
  syncResponsiveSections();
  updateExpenseFormModeUI();
  renderRoomList();
  renderMembers();
  renderParticipantOptions();
  renderPayerOptions();
  renderExpenses();
  renderSummary();
}

function updateAppVisibility() {
  const hasActiveRoom = Boolean(state.roomCode && state.roomSecret && state.roomId);
  document.body.classList.toggle("has-active-room", hasActiveRoom);
  [els.memberSection, els.expenseSection, els.summarySection, els.historySection].forEach((section) => {
    if (section) section.classList.toggle("is-hidden", !hasActiveRoom);
  });
  els.leaveRoomButton.hidden = !hasActiveRoom;
  if (els.roomStatusDisplay) {
    els.roomStatusDisplay.hidden = !hasActiveRoom;
  }
  if (els.roomPanel) {
    els.roomPanel.hidden = hasActiveRoom;
  }
  els.roomEntrySection.hidden = hasActiveRoom;
  els.roomDiscoverySection.hidden = hasActiveRoom;
  if (els.sectionTabs) {
    els.sectionTabs.hidden = !hasActiveRoom;
  }
  els.appGrid.classList.toggle("room-only", !hasActiveRoom);
}

function handleSectionTabClick(event) {
  const button = event.target.closest("[data-section-tab]");
  if (!button) return;
  state.activeSectionTab = button.dataset.sectionTab;
  syncResponsiveSections();
}

function handleMemberListClick(event) {
  const detailButton = event.target.closest("[data-balance-detail]");
  if (detailButton) {
    toggleBalanceDetail(detailButton.dataset.balanceDetail);
    return;
  }

  const removeButton = event.target.closest("[data-remove-member]");
  if (removeButton) {
    removeMember(removeButton.dataset.removeMember);
  }
}

function toggleBalanceDetail(memberId) {
  state.expandedBalanceMemberId = state.expandedBalanceMemberId === memberId ? "" : memberId;
  renderMembers();
  renderSummary();
}

function syncResponsiveSections() {
  const hasActiveRoom = Boolean(state.roomCode && state.roomSecret && state.roomId);
  const isMobile = window.matchMedia("(max-width: 960px)").matches;
  const sections = {
    member: els.memberSection,
    expense: els.expenseSection,
    summary: els.summarySection,
    history: els.historySection,
  };

  Object.entries(sections).forEach(([key, section]) => {
    if (!section) return;
    const shouldHideForTab = hasActiveRoom && isMobile && key !== state.activeSectionTab;
    section.classList.toggle("mobile-tab-hidden", shouldHideForTab);
  });

  if (!els.sectionTabs) return;
  Array.from(els.sectionTabs.querySelectorAll("[data-section-tab]")).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.sectionTab === state.activeSectionTab);
    button.setAttribute("aria-pressed", button.dataset.sectionTab === state.activeSectionTab ? "true" : "false");
  });
}

function renderRoomList() {
  if (!els.roomListPanel) return;
  if (state.rooms.length === 0) {
    els.roomListPanel.className = "room-list empty-state";
    els.roomListPanel.textContent = "房間列表載入中";
    return;
  }

  els.roomListPanel.className = "room-list";
  els.roomListPanel.innerHTML = state.rooms.map((room) => `
    <article class="room-item">
      <div class="room-item-main">
        <strong>${escapeHtml(room.label)}</strong>
        <div class="room-meta">${escapeHtml(room.updatedAtLabel)}</div>
      </div>
      <div class="room-item-actions">
        <button type="button" class="ghost-button" data-room-login="${escapeHtml(room.loginCode)}">登入</button>
        <button type="button" class="danger-button" data-room-delete="${room.id}|${escapeHtml(room.label)}">刪除</button>
      </div>
    </article>
  `).join("");

  Array.from(els.roomListPanel.querySelectorAll("[data-room-login]")).forEach((button) => {
    button.addEventListener("click", () => selectRoom(button.dataset.roomLogin));
  });
  Array.from(els.roomListPanel.querySelectorAll("[data-room-delete]")).forEach((button) => {
    button.addEventListener("click", () => {
      const [roomId, roomLabel] = button.dataset.roomDelete.split("|");
      confirmDeleteRoom(roomId, roomLabel);
    });
  });
}

function renderMembers() {
  els.memberCount.textContent = `${state.members.length} 人`;
  if (state.members.length === 0) {
    els.memberList.className = "chip-list empty-state";
    els.memberList.textContent = "還沒有成員";
    return;
  }
  const balances = computeBalances();
  const balanceMap = new Map(balances.map((row) => [row.id, row]));

  els.memberList.className = "member-balance-list";
  els.memberList.innerHTML = state.members.map((member) => {
    const row = balanceMap.get(member.id) || { id: member.id, name: member.name, balanceCents: 0 };
    return getBalanceCardMarkup(row, { removable: true });
  }).join("");
}

function renderParticipantOptions() {
  if (state.members.length === 0) {
    els.participantOptions.className = "checkbox-grid empty-state";
    els.participantOptions.textContent = "請先建立成員";
    syncSplitModeUI();
    return;
  }

  els.participantOptions.className = "checkbox-grid";
  els.participantOptions.innerHTML = state.members.map((member) => `
    <label class="participant-option">
      <span class="participant-main">
        <input type="checkbox" value="${member.id}" checked />
        <span>${escapeHtml(member.name)}</span>
      </span>
      <input class="share-amount-input" data-share-input="${member.id}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" disabled />
    </label>
  `).join("");
  syncSplitModeUI();
}

function renderPayerOptions() {
  if (state.members.length === 0) {
    els.expensePayerSelect.innerHTML = '<option value="">請先建立成員</option>';
    return;
  }
  els.expensePayerSelect.innerHTML = ['<option value="">選擇付款人</option>', ...state.members.map((member) => `<option value="${member.id}">${escapeHtml(member.name)}</option>`)].join("");
}

function renderExpenses() {
  els.expenseCount.textContent = `${state.expenses.length} 筆`;
  if (state.expenses.length === 0) {
    els.expenseList.className = "expense-list empty-state";
    els.expenseList.textContent = "新增後就會顯示支出紀錄";
    return;
  }

  els.expenseList.className = "expense-list";
  els.expenseList.innerHTML = state.expenses.map((expense) => {
    const payer = findMemberName(expense.payerId);
    const shares = getExpenseShares(expense);
    const isCustomSplit = expense.splitMode === "custom" && shares.length > 0;
    const participants = (expense.participantIds || []).map(findMemberName).join("、");
    const splitSummary = isCustomSplit ? shares.map((share) => `${findMemberName(share.memberId)} ${formatCurrency(share.amountCents)}`).join("、") : participants;
    const firstShare = shares[0]?.amountCents || 0;
    return `
      <article class="expense-item">
        <strong>${escapeHtml(expense.title)} <span>${formatCurrency(expense.amountCents)}</span></strong>
        ${expense.note ? `<div>${escapeHtml(expense.note)}</div>` : ""}
        <div class="expense-meta">
          <span>付款人：${escapeHtml(payer)}</span>
          <span>${isCustomSplit ? "自訂分攤：" : "平均分攤："}${escapeHtml(splitSummary)}</span>
          <span>${isCustomSplit ? "分攤方式：自訂金額" : `每人：${formatCurrency(firstShare)}`}</span>
        </div>
        <footer>
          <small>${formatDate(expense.createdAt)}</small>
          <div class="expense-item-actions">
            <button type="button" class="ghost-button expense-edit-button" data-edit-expense="${expense.id}">編輯</button>
            <button type="button" data-remove-expense="${expense.id}">刪除</button>
          </div>
        </footer>
      </article>
    `;
  }).join("");

  Array.from(els.expenseList.querySelectorAll("[data-edit-expense]")).forEach((button) => {
    button.addEventListener("click", () => startEditingExpense(button.dataset.editExpense));
  });
  Array.from(els.expenseList.querySelectorAll("[data-remove-expense]")).forEach((button) => {
    button.addEventListener("click", () => removeExpense(button.dataset.removeExpense));
  });
}

function renderSummary() {
  const settlements = computeSettlements(computeBalances());
  const total = state.expenses.reduce((sum, expense) => sum + expense.amountCents, 0);
  els.totalSpent.textContent = formatCurrency(total);

  renderSettlementList(els.settlementList, settlements);

  renderPaymentHistory();
}

function getBalanceCardMarkup(row, options = {}) {
  const className = row.balanceCents > 0 ? "positive" : row.balanceCents < 0 ? "negative" : "";
  const label = row.balanceCents > 0 ? "應收" : row.balanceCents < 0 ? "應付" : "已平衡";
  const details = getBalanceBreakdown(row.id);
  const isExpanded = state.expandedBalanceMemberId === row.id;
  const removeButton = options.removable
    ? `<button type="button" class="member-remove-button" data-remove-member="${row.id}">刪除</button>`
    : "";
  const detailMarkup = isExpanded
    ? `
      <div class="summary-detail">
        ${details.length > 0
          ? details
              .map(
                (item) => `
                  <div class="summary-detail-row">
                    <span>${escapeHtml(item.label)}</span>
                    <strong class="${item.amountCents >= 0 ? "positive" : "negative"}">${formatSignedCurrency(item.amountCents)}</strong>
                  </div>
                `
              )
              .join("")
          : '<div class="summary-detail-empty">目前沒有明細</div>'}
        <div class="summary-detail-total">
          <span>合計</span>
          <strong class="${className}">${formatSignedCurrency(row.balanceCents)}</strong>
        </div>
      </div>
    `
    : "";

  return `
    <article class="summary-card member-balance-card">
      <div class="member-card-head">
        <strong>${escapeHtml(row.name)}</strong>
        ${removeButton}
      </div>
      <div class="member-balance-label">${label}</div>
      <div class="${className}">${formatSignedCurrency(row.balanceCents)}</div>
      <button type="button" class="summary-detail-toggle" data-balance-detail="${row.id}">
        ${isExpanded ? "收起說明" : "怎麼算"}
      </button>
      ${detailMarkup}
    </article>
  `;
}

function renderSettlementList(container, settlements) {
  if (!container) return;
  if (settlements.length === 0) {
    container.className = "settlement-list empty-state";
    container.textContent = "目前沒有待結算款項";
    return;
  }

  container.className = "settlement-list";
  container.innerHTML = settlements.map((item) => `
    <article class="settlement-item">
      <div class="settlement-row">
        <div><strong>${escapeHtml(item.from)} -> ${escapeHtml(item.to)}</strong><div>${formatCurrency(item.amountCents)}</div></div>
        <button type="button" class="settlement-action" data-record-settlement="${item.fromId}|${item.toId}|${item.amountCents}">記錄已結算</button>
      </div>
    </article>
  `).join("");

  Array.from(container.querySelectorAll("[data-record-settlement]")).forEach((button) => {
    button.addEventListener("click", () => {
      const [fromId, toId, amountCents] = button.dataset.recordSettlement.split("|");
      recordSettlement(fromId, toId, Number(amountCents));
    });
  });
}

function renderPaymentHistory() {
  if (state.payments.length === 0) {
    els.paymentHistory.className = "payment-history empty-state";
    els.paymentHistory.textContent = "還沒有已結算紀錄";
    return;
  }
  els.paymentHistory.className = "payment-history";
  els.paymentHistory.innerHTML = state.payments.map((payment) => `
    <article class="expense-item">
      <strong>${escapeHtml(findMemberName(payment.fromId))} -> ${escapeHtml(findMemberName(payment.toId))}</strong>
      <div class="expense-meta">
        <span>結算金額：${formatCurrency(payment.amountCents)}</span>
        <span>${formatDate(payment.createdAt)}</span>
      </div>
      <footer>
        <small>刪除後會重新回到待結算狀態</small>
        <button type="button" data-remove-payment="${payment.id}">取消結算</button>
      </footer>
    </article>
  `).join("");
  Array.from(els.paymentHistory.querySelectorAll("[data-remove-payment]")).forEach((button) => {
    button.addEventListener("click", () => removePayment(button.dataset.removePayment));
  });
}

function syncSplitModeUI() {
  const isCustomMode = getSelectedSplitMode() === "custom";
  const participantCheckboxes = els.participantOptions.querySelectorAll('input[type="checkbox"]');
  participantCheckboxes.forEach((checkbox) => {
    const shareInput = els.participantOptions.querySelector(`[data-share-input="${checkbox.value}"]`);
    if (!(shareInput instanceof HTMLInputElement)) return;
    shareInput.disabled = !isCustomMode || !checkbox.checked;
    if (!checkbox.checked) shareInput.value = "";
  });
  if (els.splitModeHint) {
    els.splitModeHint.textContent = isCustomMode
      ? "自訂金額時，勾選成員的金額總和必須等於支出總額。"
      : "平均分會把總金額平分給勾選的人。";
  }
}

function selectRoom(roomCode) {
  els.roomCodeInput.value = roomCode;
  if (!els.roomSecretInput.value.trim()) {
    els.roomSecretInput.focus();
    showToast("請先輸入房間密碼，再登入房間");
    return;
  }
  els.roomForm.requestSubmit();
}

async function confirmDeleteRoom(roomId, roomLabel) {
  if (!state.db) {
    showToast("Firebase 尚未初始化");
    return;
  }
  const confirmed = window.confirm(`確定要刪除房間「${roomLabel}」嗎？這會永久刪掉整份帳本。`);
  if (!confirmed) return;
  try {
    await deleteDoc(doc(state.db, "rooms", roomId));
    if (roomId === state.roomId) leaveRoom();
    showToast("房間已刪除");
  } catch (error) {
    console.error(error);
    showToast(`刪除房間失敗: ${error.code || error.message || "unknown"}`);
  }
}

function leaveRoom() {
  if (state.unsubscribeRoom) {
    state.unsubscribeRoom();
    state.unsubscribeRoom = null;
  }
  state.roomCode = "";
  state.roomSecret = "";
  state.roomId = "";
  state.members = [];
  state.expenses = [];
  state.payments = [];
  state.lastLoadedFingerprint = "";
  sessionStorage.removeItem("splitcash-meta");
  els.roomSecretInput.value = "";
  updateRoomStatus(hasFirebaseConfig() ? "已匿名登入" : "缺少 Firebase 設定", hasFirebaseConfig() ? "Firebase auth ready" : "Firebase not configured");
  render();
}

function ensureActiveRoom() {
  if (!state.roomCode || !state.roomSecret || !state.roomId || !state.db) {
    showToast("請先登入房間");
    return false;
  }
  return true;
}

function persistRoomMeta() {
  sessionStorage.setItem("splitcash-meta", JSON.stringify({ roomCode: state.roomCode }));
}

function loadRoomMeta() {
  try {
    return JSON.parse(sessionStorage.getItem("splitcash-meta") || "{}");
  } catch {
    return {};
  }
}

function queueSave(immediate) {
  if (!ensureActiveRoom()) return;
  if (state.saveTimer) window.clearTimeout(state.saveTimer);
  const persist = () => saveRoomPayload({ members: state.members, expenses: state.expenses, payments: state.payments }).catch((error) => {
    console.error(error);
    updateRoomStatus("同步失敗", error.code || state.roomCode);
    showToast(`同步失敗: ${error.code || error.message || "unknown"}`);
  });
  if (immediate) {
    persist();
    return;
  }
  state.saveTimer = window.setTimeout(persist, 350);
}

async function ensureFirebaseSession() {
  if (!state.authReadyPromise) throw new Error("Firebase auth is not initialized");
  await state.authReadyPromise;
}

function roomDocRef() {
  return doc(state.db, "rooms", state.roomId);
}

async function loadRoomRecord() {
  const snapshot = await getDoc(roomDocRef());
  if (!snapshot.exists()) return { exists: false, payload: { ...EMPTY_ROOM_PAYLOAD } };
  const data = snapshot.data();
  if (!data.payload || !data.iv) return { exists: true, payload: { ...EMPTY_ROOM_PAYLOAD } };
  return { exists: true, payload: await decryptPayload({ payload: data.payload, iv: data.iv }) };
}

async function saveRoomPayload(payload) {
  const encrypted = await encryptPayload(payload);
  updateRoomStatus("同步中", state.roomCode);
  await setDoc(roomDocRef(), { roomCode: state.roomCode, payload: encrypted.payload, iv: encrypted.iv, updatedAt: serverTimestamp() }, { merge: true });
  state.lastLoadedFingerprint = stableFingerprint(payload);
  updateRoomStatus("同步完成", state.roomCode);
}

async function ensureRoomMetadata() {
  if (!ensureActiveRoom()) return;
  await setDoc(roomDocRef(), { roomCode: state.roomCode, updatedAt: serverTimestamp() }, { merge: true });
}
function startRoomSubscription() {
  if (state.unsubscribeRoom) state.unsubscribeRoom();
  state.unsubscribeRoom = onSnapshot(roomDocRef(), async (snapshot) => {
    if (!snapshot.exists()) return;
    const data = snapshot.data();
    if (!data.payload || !data.iv) return;
    try {
      const payload = await decryptPayload({ payload: data.payload, iv: data.iv });
      const fingerprint = stableFingerprint(payload);
      if (fingerprint === state.lastLoadedFingerprint) return;
      applyPayload(payload);
      render();
      updateRoomStatus("同步完成", state.roomCode);
    } catch (error) {
      console.error(error);
    }
  }, (error) => {
    console.error(error);
    updateRoomStatus("同步失敗", error.code || state.roomCode);
    showToast(`即時同步失敗: ${error.code || error.message || "unknown"}`);
  });
}

function startRoomListSubscription() {
  if (!state.db) return;
  if (state.unsubscribeRoomList) state.unsubscribeRoomList();
  const roomsQuery = query(collection(state.db, "rooms"), orderBy("updatedAt", "desc"));
  state.unsubscribeRoomList = onSnapshot(roomsQuery, (snapshot) => {
    state.rooms = snapshot.docs.map((roomDoc) => {
      const data = roomDoc.data();
      const savedCode = typeof data.roomCode === "string" ? data.roomCode.trim() : "";
      const looksHashed = /^[a-f0-9]{64}$/i.test(savedCode || roomDoc.id);
      const isCurrentRoom = roomDoc.id === state.roomId && state.roomCode;
      const loginCode = savedCode || (isCurrentRoom ? state.roomCode : "");
      const label = savedCode || (isCurrentRoom ? state.roomCode : looksHashed ? "未命名房間" : roomDoc.id);
      return { id: roomDoc.id, label, loginCode, updatedAtLabel: formatTimestamp(data.updatedAt) };
    });
    renderRoomList();
  }, (error) => {
    console.error(error);
    showToast(`房間列表載入失敗: ${error.code || error.message || "unknown"}`);
  });
}

function applyPayload(payload) {
  state.members = Array.isArray(payload.members) ? payload.members : [];
  state.expenses = Array.isArray(payload.expenses)
    ? payload.expenses.map((expense) => ({
        ...expense,
        splitMode: expense.splitMode === "custom" ? "custom" : "equal",
        participantIds: Array.isArray(expense.participantIds) ? expense.participantIds : [],
        customShares: Array.isArray(expense.customShares) ? expense.customShares : null,
      }))
    : [];
  state.payments = Array.isArray(payload.payments) ? payload.payments : [];
  state.lastLoadedFingerprint = stableFingerprint(payload);
}

async function encryptPayload(payload) {
  const key = await deriveCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return { iv: bufferToBase64(iv), payload: bufferToBase64(new Uint8Array(cipherBuffer)) };
}

async function decryptPayload(encrypted) {
  const key = await deriveCryptoKey();
  const iv = base64ToUint8Array(encrypted.iv);
  const payload = base64ToUint8Array(encrypted.payload);
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, payload);
  return JSON.parse(new TextDecoder().decode(plainBuffer));
}

async function deriveCryptoKey() {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(state.roomSecret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: new TextEncoder().encode(`splitcash:${state.roomCode.toLowerCase()}`), iterations: 120000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

function hasFirebaseConfig() {
  return Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);
}

async function sha256Hex(value) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function updateRoomStatus(syncStatus, roomStatus) {
  els.syncStatus.textContent = syncStatus;
  els.roomStatus.textContent = roomStatus;
  
  // Update room status display if in active room
  const hasActiveRoom = Boolean(state.roomCode && state.roomSecret && state.roomId);
  if (hasActiveRoom && els.roomStatusName) {
    els.roomStatusName.textContent = roomStatus;
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("visible"), 2400);
}

function findMemberName(memberId) {
  return state.members.find((member) => member.id === memberId)?.name || "未知成員";
}

function createId() { return crypto.randomUUID(); }
function toCents(amount) { return Math.round(amount * 100); }
function normalizeCents(value) { return Math.round(value); }
function formatCurrency(amountCents) {
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", minimumFractionDigits: 2 }).format(amountCents / 100);
}
function formatSignedCurrency(amountCents) {
  const absolute = formatCurrency(Math.abs(amountCents));
  if (amountCents > 0) return `+${absolute}`;
  if (amountCents < 0) return `-${absolute}`;
  return absolute;
}
function formatDate(value) {
  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function formatTimestamp(value) {
  if (!value) return "尚未同步";
  if (typeof value.toDate === "function") return formatDate(value.toDate());
  return formatDate(value);
}
function stableFingerprint(payload) {
  return JSON.stringify({ members: payload.members || [], expenses: payload.expenses || [], payments: payload.payments || [] });
}
function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function bufferToBase64(uint8Array) {
  let binary = "";
  for (const byte of uint8Array) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
