(function () {
  const state = {
    roomCode: "",
    roomSecret: "",
    roomId: "",
    displayName: "",
    storageMode: "local",
    members: [],
    expenses: [],
    saveTimer: null,
    syncInFlight: false,
    lastLoadedFingerprint: "",
  };

  const els = {
    roomForm: document.getElementById("room-form"),
    roomCodeInput: document.getElementById("room-code-input"),
    roomSecretInput: document.getElementById("room-secret-input"),
    displayNameInput: document.getElementById("display-name-input"),
    copyShareLinkButton: document.getElementById("copy-share-link-button"),
    leaveRoomButton: document.getElementById("leave-room-button"),
    roomStatus: document.getElementById("room-status"),
    syncStatus: document.getElementById("sync-status"),
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
    els.displayNameInput.value = saved.displayName || "";
  }

  async function handleRoomSubmit(event) {
    event.preventDefault();
    const roomCode = els.roomCodeInput.value.trim();
    const roomSecret = els.roomSecretInput.value.trim();
    const displayName = els.displayNameInput.value.trim();
    if (!roomCode || !roomSecret) return showToast("請輸入房間代碼與密碼");
    if (roomSecret.length < 8) return showToast("房間密碼至少 8 碼");

    state.roomCode = roomCode;
    state.roomSecret = roomSecret;
    state.roomId = await sha256Hex(roomCode.toLowerCase());
    state.displayName = displayName;
    state.storageMode = firebaseConfig ? "firebase" : "local";
    persistRoomMeta();
    updateRoomStatus("載入房間資料中", state.roomCode);

    try {
      const payload = await loadRoomPayload();
      state.members = Array.isArray(payload.members) ? payload.members : [];
      state.expenses = Array.isArray(payload.expenses) ? payload.expenses : [];
      state.lastLoadedFingerprint = stableFingerprint(payload);
      updateRoomStatus(
        state.storageMode === "firebase" ? "Firebase 已同步" : "使用本機儲存",
        state.roomCode
      );
      render();
      showToast("已進入房間");
    } catch (error) {
      console.error(error);
      updateRoomStatus("房間載入失敗", state.roomCode);
      showToast("無法解密房間資料，請確認代碼與密碼");
    }
  }

  function handleMemberSubmit(event) {
    event.preventDefault();
    if (!ensureActiveRoom()) return;
    const name = els.memberNameInput.value.trim();
    if (!name) return;
    if (state.members.some((member) => member.name.toLowerCase() === name.toLowerCase())) {
      return showToast("成員名稱重複");
    }
    state.members.push({ id: createId(), name, createdAt: new Date().toISOString() });
    els.memberNameInput.value = "";
    render();
    queueSave();
  }

  function handleExpenseSubmit(event) {
    event.preventDefault();
    if (!ensureActiveRoom()) return;
    if (state.members.length === 0) return showToast("請先新增成員");

    const form = new FormData(els.expenseForm);
    const title = String(form.get("title") || "").trim();
    const amount = Number(form.get("amount"));
    const payerId = String(form.get("payerId") || "");
    const note = String(form.get("note") || "").trim();
    const participantIds = getSelectedParticipants();

    if (!title || !Number.isFinite(amount) || amount <= 0) return showToast("請輸入有效的品項與金額");
    if (!payerId) return showToast("請選擇付款人");
    if (participantIds.length === 0) return showToast("至少要選 1 位均分成員");

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
    const used = state.expenses.some(
      (expense) => expense.payerId === memberId || expense.participantIds.includes(memberId)
    );
    if (used) return showToast("這位成員已出現在支出紀錄內，不能直接刪除");
    state.members = state.members.filter((member) => member.id !== memberId);
    render();
    queueSave();
  }

  function removeExpense(expenseId) {
    state.expenses = state.expenses.filter((expense) => expense.id !== expenseId);
    render();
    queueSave();
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
    return state.members.map((member) => ({
      ...member,
      balanceCents: normalizeCents(balances.get(member.id) || 0),
    }));
  }

  function computeSettlements(balanceRows) {
    const creditors = balanceRows
      .filter((row) => row.balanceCents > 0)
      .map((row) => ({ name: row.name, amountCents: row.balanceCents }))
      .sort((a, b) => b.amountCents - a.amountCents);
    const debtors = balanceRows
      .filter((row) => row.balanceCents < 0)
      .map((row) => ({ name: row.name, amountCents: Math.abs(row.balanceCents) }))
      .sort((a, b) => b.amountCents - a.amountCents);
    const settlements = [];
    let creditorIndex = 0;
    let debtorIndex = 0;
    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      const transfer = Math.min(creditor.amountCents, debtor.amountCents);
      settlements.push({
        from: debtor.name,
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
    renderMembers();
    renderParticipantOptions();
    renderPayerOptions();
    renderExpenses();
    renderSummary();
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
        (member) =>
          `<article class="member-chip"><strong>${escapeHtml(member.name)}</strong><button type="button" data-remove-member="${member.id}">刪除</button></article>`
      )
      .join("");
    Array.from(els.memberList.querySelectorAll("[data-remove-member]")).forEach((button) =>
      button.addEventListener("click", () => removeMember(button.dataset.removeMember))
    );
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
        (member) =>
          `<label class="participant-option"><input type="checkbox" value="${member.id}" checked /><span>${escapeHtml(member.name)}</span></label>`
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
      els.expenseList.textContent = "尚未登記任何支出";
      return;
    }
    els.expenseList.className = "expense-list";
    els.expenseList.innerHTML = state.expenses
      .map((expense) => {
        const payer = findMemberName(expense.payerId);
        const participants = expense.participantIds.map(findMemberName).join("、");
        const perHead = normalizeCents(expense.amountCents / expense.participantIds.length);
        return `<article class="expense-item"><strong>${escapeHtml(expense.title)} <span>${formatCurrency(expense.amountCents)}</span></strong>${expense.note ? `<div>${escapeHtml(expense.note)}</div>` : ""}<div class="expense-meta"><span>付款人：${escapeHtml(payer)}</span><span>均分：${escapeHtml(participants)}</span><span>每人：${formatCurrency(perHead)}</span></div><footer><small>${formatDate(expense.createdAt)}</small><button type="button" data-remove-expense="${expense.id}">刪除</button></footer></article>`;
      })
      .join("");
    Array.from(els.expenseList.querySelectorAll("[data-remove-expense]")).forEach((button) =>
      button.addEventListener("click", () => removeExpense(button.dataset.removeExpense))
    );
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
          const className =
            row.balanceCents > 0 ? "positive" : row.balanceCents < 0 ? "negative" : "";
          const label = row.balanceCents > 0 ? "應收" : row.balanceCents < 0 ? "應付" : "已平衡";
          return `<article class="summary-card"><strong>${escapeHtml(row.name)}</strong><div>${label}</div><div class="${className}">${formatSignedCurrency(row.balanceCents)}</div></article>`;
        })
        .join("");
    }
    if (settlements.length === 0) {
      els.settlementList.className = "settlement-list empty-state";
      els.settlementList.textContent = "還沒有可計算的結算結果";
      return;
    }
    els.settlementList.className = "settlement-list";
    els.settlementList.innerHTML = settlements
      .map(
        (item) =>
          `<article class="settlement-item"><strong>${escapeHtml(item.from)} -> ${escapeHtml(item.to)}</strong><div>${formatCurrency(item.amountCents)}</div></article>`
      )
      .join("");
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
    state.roomCode = "";
    state.roomSecret = "";
    state.roomId = "";
    state.displayName = "";
    state.members = [];
    state.expenses = [];
    state.lastLoadedFingerprint = "";
    sessionStorage.removeItem("splitcash-meta");
    els.roomSecretInput.value = "";
    updateRoomStatus("尚未進入房間", "Local only");
    render();
  }

  function ensureActiveRoom() {
    if (!state.roomCode || !state.roomSecret) {
      showToast("請先進入房間");
      return false;
    }
    return true;
  }

  function getSelectedParticipants() {
    return Array.from(
      els.participantOptions.querySelectorAll('input[type="checkbox"]:checked')
    ).map((input) => input.value);
  }

  function persistRoomMeta() {
    sessionStorage.setItem(
      "splitcash-meta",
      JSON.stringify({ roomCode: state.roomCode, displayName: state.displayName })
    );
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
      saveRoomPayload({ members: state.members, expenses: state.expenses }).catch((error) => {
        console.error(error);
        updateRoomStatus("同步失敗", state.roomCode);
        showToast("資料儲存失敗");
      });
    if (immediate) {
      persist();
      return;
    }
    state.saveTimer = window.setTimeout(persist, 450);
  }

  async function loadRoomPayload() {
    if (state.storageMode === "firebase") {
      const encrypted = await loadRemotePayload();
      if (!encrypted) return { members: [], expenses: [] };
      return decryptPayload(encrypted);
    }
    const encrypted = localStorage.getItem(localStorageKey());
    if (!encrypted) return { members: [], expenses: [] };
    return decryptPayload(JSON.parse(encrypted));
  }

  async function saveRoomPayload(payload) {
    const fingerprint = stableFingerprint(payload);
    if (fingerprint === state.lastLoadedFingerprint && state.storageMode !== "firebase") return;
    const encrypted = await encryptPayload(payload);
    if (state.storageMode === "firebase") {
      updateRoomStatus("同步中", state.roomCode);
      await saveRemotePayload(encrypted);
      updateRoomStatus("Firebase 已同步", state.roomCode);
    } else {
      localStorage.setItem(localStorageKey(), JSON.stringify(encrypted));
      updateRoomStatus("使用本機儲存", state.roomCode);
    }
    state.lastLoadedFingerprint = fingerprint;
  }

  function localStorageKey() {
    return `splitcash-room-${state.roomId}`;
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

  async function loadRemotePayload() {
    const response = await fetch(firestoreDocumentUrl(), { method: "GET" });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Firestore load failed: ${response.status}`);
    const json = await response.json();
    if (!json.fields?.payload?.stringValue || !json.fields?.iv?.stringValue) return null;
    return { payload: json.fields.payload.stringValue, iv: json.fields.iv.stringValue };
  }

  async function saveRemotePayload(encrypted) {
    if (state.syncInFlight) return;
    state.syncInFlight = true;
    try {
      const response = await fetch(firestoreDocumentUrl(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            payload: { stringValue: encrypted.payload },
            iv: { stringValue: encrypted.iv },
            updatedAt: { timestampValue: new Date().toISOString() },
          },
        }),
      });
      if (!response.ok) throw new Error(`Firestore save failed: ${response.status}`);
    } finally {
      state.syncInFlight = false;
    }
  }

  function firestoreDocumentUrl() {
    const base = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/rooms/${state.roomId}`;
    return `${base}?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
  }

  async function sha256Hex(value) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function copyShareLink() {
    const roomCode = els.roomCodeInput.value.trim();
    if (!roomCode) return showToast("請先輸入房間代碼");
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomCode);
    navigator.clipboard
      .writeText(url.toString())
      .then(() => showToast("分享連結已複製"))
      .catch(() => showToast("無法複製連結"));
  }

  function updateRoomStatus(syncStatus, roomStatus) {
    els.syncStatus.textContent = syncStatus;
    els.roomStatus.textContent = roomStatus;
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
    return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value)
    );
  }

  function stableFingerprint(payload) {
    return JSON.stringify({ members: payload.members || [], expenses: payload.expenses || [] });
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
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }
})();
