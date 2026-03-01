import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
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

const EMPTY_ROOM_PAYLOAD = {
  members: [],
  expenses: [],
  payments: [],
};

const state = {
  roomCode: "",
  roomSecret: "",
  roomId: "",
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
  copyShareLinkButton: document.getElementById("copy-share-link-button"),
  leaveRoomButton: document.getElementById("leave-room-button"),
  roomStatus: document.getElementById("room-status"),
  syncStatus: document.getElementById("sync-status"),
  roomListPanel: document.getElementById("room-list-panel"),
  memberForm: document.getElementById("member-form"),
  memberNameInput: document.getElementById("member-name-input"),
  memberList: document.getElementById("member-list"),
  memberCount: document.getElementById("member-count"),
  expenseForm: document.getElementById("expense-form"),
  expensePayerSelect: document.getElementById("expense-payer-select"),
  participantOptions: document.getElementById("participant-options"),
  expenseCount: document.getElementById("expense-count"),
  totalSpent: document.getElementById("total-spent"),
  summaryCards: document.getElementById("summary-cards"),
  settlementList: document.getElementById("settlement-list"),
  paymentHistory: document.getElementById("payment-history"),
  expenseList: document.getElementById("expense-list"),
  exportButton: document.getElementById("export-button"),
  importInput: document.getElementById("import-input"),
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
  els.copyShareLinkButton.addEventListener("click", copyShareLink);
  els.leaveRoomButton.addEventListener("click", leaveRoom);
  els.memberForm.addEventListener("submit", handleMemberSubmit);
  els.expenseForm.addEventListener("submit", handleExpenseSubmit);
  els.exportButton.addEventListener("click", exportRoomData);
  els.importInput.addEventListener("change", importRoomData);
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
  state.authReadyPromise = new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Firebase auth timeout"));
    }, 15000);

    const unsubscribe = onAuthStateChanged(state.auth, (user) => {
      if (!user) {
        return;
      }
      window.clearTimeout(timeoutId);
      unsubscribe();
      updateRoomStatus("已匿名登入", "Firebase auth ready");
      resolve(user);
      startRoomListSubscription();
    });
  });

  signInAnonymously(state.auth).catch((error) => {
    console.error(error);
    updateRoomStatus("匿名登入失敗", error.code || "Firebase auth error");
    showToast(`Firebase 匿名登入失敗: ${error.code || "unknown"}`);
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
    showToast("請填房間代碼與房間密碼");
    return;
  }

  if (roomSecret.length < 8) {
    showToast("房間密碼至少 8 碼");
    return;
  }

  state.roomCode = roomCode;
  state.roomSecret = roomSecret;
  state.roomId = await sha256Hex(roomCode.toLowerCase());
  persistRoomMeta();
  updateRoomStatus("載入房間資料中", state.roomCode);

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
    updateRoomStatus("Firebase 房間同步中", state.roomCode);
    render();
    showToast("已進入房間");
  } catch (error) {
    console.error(error);
    updateRoomStatus("房間載入失敗", error.code || state.roomCode || "Room error");
    showToast(`房間載入失敗: ${error.code || error.message || "unknown"}`);
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

  state.members.push({
    id: createId(),
    name,
    createdAt: new Date().toISOString(),
  });
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
  const payerId = String(form.get("payerId") || "");
  const note = String(form.get("note") || "").trim();
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

  state.expenses.unshift({
    id: createId(),
    title,
    amountCents: toCents(amount),
    payerId,
    participantIds,
    note,
    createdAt: new Date().toISOString(),
  });

  els.expenseForm.reset();
  render();
  queueSave();
}

function removeMember(memberId) {
  const usedByExpense = state.expenses.some(
    (expense) => expense.payerId === memberId || expense.participantIds.includes(memberId)
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
  render();
  queueSave();
}

function recordSettlement(fromId, toId, amountCents) {
  if (!ensureActiveRoom()) return;

  state.payments.unshift({
    id: createId(),
    fromId,
    toId,
    amountCents,
    createdAt: new Date().toISOString(),
  });

  render();
  queueSave();
  showToast("已標記為已結算");
}

function removePayment(paymentId) {
  state.payments = state.payments.filter((payment) => payment.id !== paymentId);
  render();
  queueSave();
  showToast("已取消結算紀錄");
}

function getSelectedParticipants() {
  return Array.from(
    els.participantOptions.querySelectorAll('input[type="checkbox"]:checked')
  ).map((input) => input.value);
}

function computeBalances() {
  const balances = new Map(state.members.map((member) => [member.id, 0]));

  for (const expense of state.expenses) {
    if (!balances.has(expense.payerId) || expense.participantIds.length === 0) continue;
    const split = expense.amountCents / expense.participantIds.length;
    for (const participantId of expense.participantIds) {
      balances.set(participantId, (balances.get(participantId) || 0) - split);
    }
    balances.set(expense.payerId, (balances.get(expense.payerId) || 0) + expense.amountCents);
  }

  for (const payment of state.payments) {
    if (!balances.has(payment.fromId) || !balances.has(payment.toId)) continue;
    balances.set(payment.fromId, (balances.get(payment.fromId) || 0) + payment.amountCents);
    balances.set(payment.toId, (balances.get(payment.toId) || 0) - payment.amountCents);
  }

  return state.members.map((member) => ({
    ...member,
    balanceCents: normalizeCents(balances.get(member.id) || 0),
  }));
}

function computeSettlements(balanceRows) {
  const creditors = balanceRows
    .filter((row) => row.balanceCents > 0)
    .map((row) => ({ id: row.id, name: row.name, amountCents: row.balanceCents }))
    .sort((a, b) => b.amountCents - a.amountCents);
  const debtors = balanceRows
    .filter((row) => row.balanceCents < 0)
    .map((row) => ({ id: row.id, name: row.name, amountCents: Math.abs(row.balanceCents) }))
    .sort((a, b) => b.amountCents - a.amountCents);

  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const transfer = Math.min(creditor.amountCents, debtor.amountCents);

    settlements.push({
      fromId: debtor.id,
      from: debtor.name,
      toId: creditor.id,
      to: creditor.name,
      amountCents: normalizeCents(transfer),
    });

    creditor.amountCents = normalizeCents(creditor.amountCents - transfer);
    debtor.amountCents = normalizeCents(debtor.amountCents - transfer);
    if (creditor.amountCents === 0) creditorIndex += 1;
    if (debtor.amountCents === 0) debtorIndex += 1;
  }

  return settlements;
}

function render() {
  renderRoomList();
  renderMembers();
  renderParticipantOptions();
  renderPayerOptions();
  renderExpenses();
  renderSummary();
}

function renderRoomList() {
  if (!els.roomListPanel) {
    return;
  }

  if (state.rooms.length === 0) {
    els.roomListPanel.className = "room-list empty-state";
    els.roomListPanel.textContent = "目前還沒有房間";
    return;
  }

  els.roomListPanel.className = "room-list";
  els.roomListPanel.innerHTML = state.rooms
    .map(
      (room) => `
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
      `
    )
    .join("");

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

  els.memberList.className = "chip-list";
  els.memberList.innerHTML = state.members
    .map(
      (member) => `
        <article class="member-chip">
          <strong>${escapeHtml(member.name)}</strong>
          <button type="button" data-remove-member="${member.id}">刪除</button>
        </article>
      `
    )
    .join("");

  Array.from(els.memberList.querySelectorAll("[data-remove-member]")).forEach((button) => {
    button.addEventListener("click", () => removeMember(button.dataset.removeMember));
  });
}

function renderParticipantOptions() {
  if (state.members.length === 0) {
    els.participantOptions.className = "checkbox-grid empty-state";
    els.participantOptions.textContent = "請先建立成員";
    return;
  }

  els.participantOptions.className = "checkbox-grid";
  els.participantOptions.innerHTML = state.members
    .map(
      (member) => `
        <label class="participant-option">
          <input type="checkbox" value="${member.id}" checked />
          <span>${escapeHtml(member.name)}</span>
        </label>
      `
    )
    .join("");
}

function renderPayerOptions() {
  if (state.members.length === 0) {
    els.expensePayerSelect.innerHTML = '<option value="">請先建立成員</option>';
    return;
  }

  els.expensePayerSelect.innerHTML = [
    '<option value="">選擇付款人</option>',
    ...state.members.map(
      (member) => `<option value="${member.id}">${escapeHtml(member.name)}</option>`
    ),
  ].join("");
}

function renderExpenses() {
  els.expenseCount.textContent = `${state.expenses.length} 筆`;
  if (state.expenses.length === 0) {
    els.expenseList.className = "expense-list empty-state";
    els.expenseList.textContent = "新增後就會顯示支出紀錄";
    return;
  }

  els.expenseList.className = "expense-list";
  els.expenseList.innerHTML = state.expenses
    .map((expense) => {
      const payer = findMemberName(expense.payerId);
      const participants = expense.participantIds.map(findMemberName).join("、");
      const perHead = normalizeCents(expense.amountCents / expense.participantIds.length);
      return `
        <article class="expense-item">
          <strong>${escapeHtml(expense.title)} <span>${formatCurrency(expense.amountCents)}</span></strong>
          ${expense.note ? `<div>${escapeHtml(expense.note)}</div>` : ""}
          <div class="expense-meta">
            <span>付款人：${escapeHtml(payer)}</span>
            <span>均分成員：${escapeHtml(participants)}</span>
            <span>每人：${formatCurrency(perHead)}</span>
          </div>
          <footer>
            <small>${formatDate(expense.createdAt)}</small>
            <button type="button" data-remove-expense="${expense.id}">刪除</button>
          </footer>
        </article>
      `;
    })
    .join("");

  Array.from(els.expenseList.querySelectorAll("[data-remove-expense]")).forEach((button) => {
    button.addEventListener("click", () => removeExpense(button.dataset.removeExpense));
  });
}

function renderSummary() {
  const balances = computeBalances();
  const settlements = computeSettlements(balances);
  const total = state.expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

  els.totalSpent.textContent = formatCurrency(total);

  if (balances.length === 0) {
    els.summaryCards.className = "summary-cards empty-state";
    els.summaryCards.textContent = "新增成員後會在這裡顯示每個人的淨額";
  } else {
    els.summaryCards.className = "summary-cards";
    els.summaryCards.innerHTML = balances
      .map((row) => {
        const className = row.balanceCents > 0 ? "positive" : row.balanceCents < 0 ? "negative" : "";
        const label = row.balanceCents > 0 ? "應收" : row.balanceCents < 0 ? "應付" : "已平衡";
        return `
          <article class="summary-card">
            <strong>${escapeHtml(row.name)}</strong>
            <div>${label}</div>
            <div class="${className}">${formatSignedCurrency(row.balanceCents)}</div>
          </article>
        `;
      })
      .join("");
  }

  if (settlements.length === 0) {
    els.settlementList.className = "settlement-list empty-state";
    els.settlementList.textContent = "目前沒有待結算款項";
  } else {
    els.settlementList.className = "settlement-list";
    els.settlementList.innerHTML = settlements
      .map(
        (item) => `
          <article class="settlement-item">
            <div class="settlement-row">
              <div>
                <strong>${escapeHtml(item.from)} -> ${escapeHtml(item.to)}</strong>
                <div>${formatCurrency(item.amountCents)}</div>
              </div>
              <button
                type="button"
                class="settlement-action"
                data-record-settlement="${item.fromId}|${item.toId}|${item.amountCents}"
              >
                標記已結算
              </button>
            </div>
          </article>
        `
      )
      .join("");

    Array.from(els.settlementList.querySelectorAll("[data-record-settlement]")).forEach(
      (button) => {
        button.addEventListener("click", () => {
          const [fromId, toId, amountCents] = button.dataset.recordSettlement.split("|");
          recordSettlement(fromId, toId, Number(amountCents));
        });
      }
    );
  }

  renderPaymentHistory();
}

function renderPaymentHistory() {
  if (state.payments.length === 0) {
    els.paymentHistory.className = "payment-history empty-state";
    els.paymentHistory.textContent = "還沒有已結算紀錄";
    return;
  }

  els.paymentHistory.className = "payment-history";
  els.paymentHistory.innerHTML = state.payments
    .map(
      (payment) => `
        <article class="expense-item">
          <strong>${escapeHtml(findMemberName(payment.fromId))} -> ${escapeHtml(findMemberName(payment.toId))}</strong>
          <div class="expense-meta">
            <span>已結算：${formatCurrency(payment.amountCents)}</span>
            <span>${formatDate(payment.createdAt)}</span>
          </div>
          <footer>
            <small>如果按錯，可以取消這筆結算</small>
            <button type="button" data-remove-payment="${payment.id}">取消結算</button>
          </footer>
        </article>
      `
    )
    .join("");

  Array.from(els.paymentHistory.querySelectorAll("[data-remove-payment]")).forEach((button) => {
    button.addEventListener("click", () => removePayment(button.dataset.removePayment));
  });
}

function selectRoom(roomCode) {
  els.roomCodeInput.value = roomCode;
  if (!els.roomSecretInput.value.trim()) {
    els.roomSecretInput.focus();
    showToast("已帶入房間名稱，請輸入房間密碼再登入");
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
  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(doc(state.db, "rooms", roomId));
    if (roomId === state.roomId) {
      leaveRoom();
    }
    showToast("房間已刪除");
  } catch (error) {
    console.error(error);
    showToast(`刪除房間失敗: ${error.code || error.message || "unknown"}`);
  }
}

function exportRoomData() {
  if (!ensureActiveRoom()) return;

  const blob = new Blob(
    [
      JSON.stringify(
        {
          roomCode: state.roomCode,
          exportedAt: new Date().toISOString(),
          members: state.members,
          expenses: state.expenses,
          payments: state.payments,
        },
        null,
        2
      ),
    ],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.roomCode || "splitcash"}-backup.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importRoomData(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  if (!ensureActiveRoom()) {
    event.target.value = "";
    return;
  }

  try {
    const parsed = JSON.parse(await file.text());
    state.members = Array.isArray(parsed.members) ? parsed.members : [];
    state.expenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
    state.payments = Array.isArray(parsed.payments) ? parsed.payments : [];
    render();
    queueSave(true);
    showToast("已匯入資料");
  } catch (error) {
    console.error(error);
    showToast("匯入失敗，請確認 JSON 格式");
  } finally {
    event.target.value = "";
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
  updateRoomStatus(
    hasFirebaseConfig() ? "已匿名登入" : "缺少 Firebase 設定",
    hasFirebaseConfig() ? "Firebase auth ready" : "Firebase not configured"
  );
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

  const persist = () =>
    saveRoomPayload({
      members: state.members,
      expenses: state.expenses,
      payments: state.payments,
    }).catch((error) => {
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
  if (!state.authReadyPromise) {
    throw new Error("Firebase auth is not initialized");
  }
  await state.authReadyPromise;
}

function roomDocRef() {
  return doc(state.db, "rooms", state.roomId);
}

async function loadRoomRecord() {
  const snapshot = await getDoc(roomDocRef());
  if (!snapshot.exists()) {
    return { exists: false, payload: { ...EMPTY_ROOM_PAYLOAD } };
  }

  const data = snapshot.data();
  if (!data.payload || !data.iv) {
    return { exists: true, payload: { ...EMPTY_ROOM_PAYLOAD } };
  }

  return {
    exists: true,
    payload: await decryptPayload({ payload: data.payload, iv: data.iv }),
  };
}

async function saveRoomPayload(payload) {
  const encrypted = await encryptPayload(payload);
  updateRoomStatus("同步中", state.roomCode);
  await setDoc(
    roomDocRef(),
    {
      roomCode: state.roomCode,
      payload: encrypted.payload,
      iv: encrypted.iv,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  state.lastLoadedFingerprint = stableFingerprint(payload);
  updateRoomStatus("Firebase 房間同步中", state.roomCode);
}

async function ensureRoomMetadata() {
  if (!ensureActiveRoom()) {
    return;
  }

  await setDoc(
    roomDocRef(),
    {
      roomCode: state.roomCode,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function startRoomSubscription() {
  if (state.unsubscribeRoom) {
    state.unsubscribeRoom();
  }

  state.unsubscribeRoom = onSnapshot(
    roomDocRef(),
    async (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      if (!data.payload || !data.iv) return;

      try {
        const payload = await decryptPayload({ payload: data.payload, iv: data.iv });
        const fingerprint = stableFingerprint(payload);
        if (fingerprint === state.lastLoadedFingerprint) return;
        applyPayload(payload);
        render();
        updateRoomStatus("Firebase 房間同步中", state.roomCode);
      } catch (error) {
        console.error(error);
      }
    },
    (error) => {
      console.error(error);
      updateRoomStatus("同步失敗", error.code || state.roomCode);
      showToast(`即時同步失敗: ${error.code || error.message || "unknown"}`);
    }
  );
}

function startRoomListSubscription() {
  if (!state.db) {
    return;
  }
  if (state.unsubscribeRoomList) {
    state.unsubscribeRoomList();
  }

  const roomsQuery = query(collection(state.db, "rooms"), orderBy("updatedAt", "desc"));
  state.unsubscribeRoomList = onSnapshot(
    roomsQuery,
    (snapshot) => {
      state.rooms = snapshot.docs.map((roomDoc) => {
        const data = roomDoc.data();
        const savedCode = typeof data.roomCode === "string" ? data.roomCode.trim() : "";
        const looksHashed = /^[a-f0-9]{64}$/i.test(savedCode || roomDoc.id);
        const isCurrentRoom = roomDoc.id === state.roomId && state.roomCode;
        const loginCode = savedCode || (isCurrentRoom ? state.roomCode : "");
        const label = savedCode || (isCurrentRoom ? state.roomCode : looksHashed ? "舊版房間" : roomDoc.id);

        return {
          id: roomDoc.id,
          label,
          loginCode,
          updatedAtLabel: formatTimestamp(data.updatedAt),
        };
      });
      renderRoomList();
    },
    (error) => {
      console.error(error);
      showToast(`房間列表載入失敗: ${error.code || error.message || "unknown"}`);
    }
  );
}

function applyPayload(payload) {
  state.members = Array.isArray(payload.members) ? payload.members : [];
  state.expenses = Array.isArray(payload.expenses) ? payload.expenses : [];
  state.payments = Array.isArray(payload.payments) ? payload.payments : [];
  state.lastLoadedFingerprint = stableFingerprint(payload);
}

async function encryptPayload(payload) {
  const key = await deriveCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    iv: bufferToBase64(iv),
    payload: bufferToBase64(new Uint8Array(cipherBuffer)),
  };
}

async function decryptPayload(encrypted) {
  const key = await deriveCryptoKey();
  const iv = base64ToUint8Array(encrypted.iv);
  const payload = base64ToUint8Array(encrypted.payload);
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, payload);
  return JSON.parse(new TextDecoder().decode(plainBuffer));
}

async function deriveCryptoKey() {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(state.roomSecret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(`splitcash:${state.roomCode.toLowerCase()}`),
      iterations: 120000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function hasFirebaseConfig() {
  return Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);
}

async function sha256Hex(value) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function copyShareLink() {
  const roomCode = els.roomCodeInput.value.trim();
  if (!roomCode) {
    showToast("請先輸入房間代碼");
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("room", roomCode);
  navigator.clipboard
    .writeText(url.toString())
    .then(() => showToast("分享連結已複製"))
    .catch(() => showToast("無法複製分享連結"));
}

function updateRoomStatus(syncStatus, roomStatus) {
  els.syncStatus.textContent = syncStatus;
  els.roomStatus.textContent = roomStatus;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("visible");
  }, 2400);
}

function findMemberName(memberId) {
  return state.members.find((member) => member.id === memberId)?.name || "已刪除成員";
}

function createId() {
  return crypto.randomUUID();
}

function toCents(amount) {
  return Math.round(amount * 100);
}

function normalizeCents(value) {
  return Math.round(value);
}

function formatCurrency(amountCents) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatSignedCurrency(amountCents) {
  const absolute = formatCurrency(Math.abs(amountCents));
  if (amountCents > 0) return `+${absolute}`;
  if (amountCents < 0) return `-${absolute}`;
  return absolute;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTimestamp(value) {
  if (!value) {
    return "尚未更新";
  }
  if (typeof value.toDate === "function") {
    return formatDate(value.toDate());
  }
  return formatDate(value);
}

function stableFingerprint(payload) {
  return JSON.stringify({
    members: payload.members || [],
    expenses: payload.expenses || [],
    payments: payload.payments || [],
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function bufferToBase64(uint8Array) {
  let binary = "";
  for (const byte of uint8Array) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
