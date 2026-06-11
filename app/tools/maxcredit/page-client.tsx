'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { doc, getFirestore, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

import { app } from '@/lib/firebase';

type CardKey = 'csr' | 'amex-gold';
type Cadence = 'monthly' | 'semiannual' | 'annual';

type CreditItem = {
  id: string;
  card: CardKey;
  issuer: string;
  cardName: string;
  creditName: string;
  allowance: number;
  used: number;
  cadence: Cadence;
  resetLabel: string;
  note: string;
  custom?: boolean;
};

const storageKey = 'maxcredit.dashboard.v1';
const syncKeyStorageKey = 'maxcredit.syncKey.v1';
const firestoreCollection = 'rooms';
const firestoreDocPrefix = 'maxcredit-';

const cardLabels: Record<CardKey | 'all', string> = {
  all: 'All Cards',
  csr: 'Chase CSR',
  'amex-gold': 'Amex Gold',
};

const defaultCredits: CreditItem[] = [
  {
    id: 'csr-travel',
    card: 'csr',
    issuer: 'Chase',
    cardName: 'Sapphire Reserve',
    creditName: 'Annual travel credit',
    allowance: 300,
    used: 0,
    cadence: 'annual',
    resetLabel: 'Cardmember year',
    note: 'Flights, hotels, rideshare, transit, parking, and other travel-coded charges.',
  },
  {
    id: 'csr-hotel',
    card: 'csr',
    issuer: 'Chase',
    cardName: 'Sapphire Reserve',
    creditName: 'The Edit hotel credit',
    allowance: 250,
    used: 0,
    cadence: 'semiannual',
    resetLabel: 'Jan-Jun / Jul-Dec',
    note: 'Adjust if your account shows a different split or eligibility rule.',
  },
  {
    id: 'csr-dining',
    card: 'csr',
    issuer: 'Chase',
    cardName: 'Sapphire Reserve',
    creditName: 'Exclusive Tables dining credit',
    allowance: 150,
    used: 0,
    cadence: 'semiannual',
    resetLabel: 'Jan-Jun / Jul-Dec',
    note: 'Track reserved dining credits separately from regular dining rewards.',
  },
  {
    id: 'csr-doordash',
    card: 'csr',
    issuer: 'Chase',
    cardName: 'Sapphire Reserve',
    creditName: 'DoorDash credits',
    allowance: 25,
    used: 0,
    cadence: 'monthly',
    resetLabel: 'Monthly',
    note: 'Use this as a monthly bucket and edit the amount to match your account.',
  },
  {
    id: 'amex-dining',
    card: 'amex-gold',
    issuer: 'American Express',
    cardName: 'Gold Card',
    creditName: 'Dining credit',
    allowance: 10,
    used: 0,
    cadence: 'monthly',
    resetLabel: 'Monthly',
    note: 'Monthly statement credit bucket for eligible dining partners.',
  },
  {
    id: 'amex-uber',
    card: 'amex-gold',
    issuer: 'American Express',
    cardName: 'Gold Card',
    creditName: 'Uber Cash',
    allowance: 10,
    used: 0,
    cadence: 'monthly',
    resetLabel: 'Monthly',
    note: 'Track Uber or Uber Eats usage before the month closes.',
  },
  {
    id: 'amex-dunkin',
    card: 'amex-gold',
    issuer: 'American Express',
    cardName: 'Gold Card',
    creditName: 'Dunkin credit',
    allowance: 7,
    used: 0,
    cadence: 'monthly',
    resetLabel: 'Monthly',
    note: 'Small monthly credit, easy to forget.',
  },
  {
    id: 'amex-resy',
    card: 'amex-gold',
    issuer: 'American Express',
    cardName: 'Gold Card',
    creditName: 'Resy credit',
    allowance: 50,
    used: 0,
    cadence: 'semiannual',
    resetLabel: 'Jan-Jun / Jul-Dec',
    note: 'Semiannual dining bucket for eligible Resy restaurants.',
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function clampMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value * 100) / 100);
}

function getCreditStatus(item: CreditItem) {
  const remaining = Math.max(item.allowance - item.used, 0);
  const ratio = item.allowance > 0 ? Math.min(item.used / item.allowance, 1) : 0;

  if (remaining === 0) {
    return { label: 'Complete', tone: 'border-emerald-100 bg-emerald-50 text-emerald-700' };
  }

  if (ratio >= 0.7) {
    return { label: 'Almost done', tone: 'border-sky-100 bg-sky-50 text-sky-700' };
  }

  if (item.cadence === 'monthly') {
    return { label: 'Use soon', tone: 'border-amber-100 bg-amber-50 text-amber-700' };
  }

  return { label: 'Open', tone: 'border-slate-100 bg-slate-50 text-slate-600' };
}

function getCadenceLabel(cadence: Cadence) {
  if (cadence === 'monthly') {
    return 'Monthly';
  }

  if (cadence === 'semiannual') {
    return 'Semiannual';
  }

  return 'Annual';
}

function normalizeCredits(candidate: unknown) {
  if (!Array.isArray(candidate)) {
    return defaultCredits;
  }

  const validItems = candidate.filter((item): item is CreditItem => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const credit = item as Partial<CreditItem>;
    return (
      typeof credit.id === 'string' &&
      (credit.card === 'csr' || credit.card === 'amex-gold') &&
      typeof credit.issuer === 'string' &&
      typeof credit.cardName === 'string' &&
      typeof credit.creditName === 'string' &&
      typeof credit.allowance === 'number' &&
      typeof credit.used === 'number' &&
      (credit.cadence === 'monthly' ||
        credit.cadence === 'semiannual' ||
        credit.cadence === 'annual') &&
      typeof credit.resetLabel === 'string' &&
      typeof credit.note === 'string'
    );
  });

  if (validItems.length === 0) {
    return defaultCredits;
  }

  const savedIds = new Set(validItems.map((item) => item.id));
  const missingDefaults = defaultCredits.filter((item) => !savedIds.has(item.id));
  return [...validItems, ...missingDefaults];
}

function getInitialCredits() {
  if (typeof window === 'undefined') {
    return defaultCredits;
  }

  const saved = window.localStorage.getItem(storageKey);
  if (!saved) {
    return defaultCredits;
  }

  try {
    return normalizeCredits(JSON.parse(saved));
  } catch {
    return defaultCredits;
  }
}

function getInitialSyncKey() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(syncKeyStorageKey) ?? '';
}

function normalizeSyncKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function getDashboardDocId(syncKey: string) {
  return `${firestoreDocPrefix}${syncKey}`;
}

function getFirebaseErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as { code?: unknown; message?: unknown };
  if (typeof candidate.code === 'string') {
    return candidate.code.replace('auth/', '').replace('firestore/', '');
  }

  if (typeof candidate.message === 'string') {
    return candidate.message;
  }

  return fallback;
}

export function MaxCreditPageClient() {
  const [credits, setCredits] = useState<CreditItem[]>(getInitialCredits);
  const [activeCard, setActiveCard] = useState<CardKey | 'all'>('all');
  const [syncKeyInput, setSyncKeyInput] = useState(getInitialSyncKey);
  const [syncKey, setSyncKey] = useState(() => normalizeSyncKey(getInitialSyncKey()));
  const [syncStatus, setSyncStatus] = useState(() =>
    normalizeSyncKey(getInitialSyncKey()) ? 'Connecting...' : 'Local only'
  );
  const [user, setUser] = useState<User | null>(null);
  const [newItem, setNewItem] = useState({
    card: 'csr' as CardKey,
    creditName: '',
    allowance: '10',
    cadence: 'monthly' as Cadence,
  });
  const applyingRemoteRef = useRef(false);
  const remoteReadyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestCreditsRef = useRef(credits);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
      },
      (error) => {
        console.error(error);
        setSyncStatus(`Auth failed: ${getFirebaseErrorMessage(error, 'unknown')}`);
      }
    );

    signInAnonymously(auth)
      .then((credential) => {
        setUser(credential.user);
      })
      .catch((error) => {
        console.error(error);
        setSyncStatus(`Sign-in failed: ${getFirebaseErrorMessage(error, 'unknown')}`);
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    latestCreditsRef.current = credits;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(credits));
    }
  }, [credits]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(syncKeyStorageKey, syncKeyInput);
    }
  }, [syncKeyInput]);

  useEffect(() => {
    if (!syncKey || !user) {
      remoteReadyRef.current = false;
      return;
    }

    const db = getFirestore(app);
    const dashboardRef = doc(db, firestoreCollection, getDashboardDocId(syncKey));
    let hasSnapshotResponse = false;
    const timeoutId = window.setTimeout(() => {
      if (!hasSnapshotResponse) {
        setSyncStatus('Still connecting: check Firebase rules/network');
      }
    }, 12000);

    const unsubscribe = onSnapshot(
      dashboardRef,
      (snapshot) => {
        hasSnapshotResponse = true;
        window.clearTimeout(timeoutId);

        if (!snapshot.exists()) {
          setDoc(dashboardRef, {
            tool: 'maxcredit',
            syncKey,
            credits: latestCreditsRef.current,
            ownerUid: user.uid,
            updatedAt: serverTimestamp(),
          })
            .then(() => {
              remoteReadyRef.current = true;
              setSyncStatus('Synced');
            })
            .catch((error) => {
              console.error(error);
              setSyncStatus(`Sync failed: ${getFirebaseErrorMessage(error, 'unknown')}`);
            });
          return;
        }

        const data = snapshot.data();
        applyingRemoteRef.current = true;
        setCredits(normalizeCredits(data.credits));
        remoteReadyRef.current = true;
        setSyncStatus('Synced');
        window.setTimeout(() => {
          applyingRemoteRef.current = false;
        }, 0);
      },
      (error) => {
        hasSnapshotResponse = true;
        window.clearTimeout(timeoutId);
        console.error(error);
        remoteReadyRef.current = false;
        setSyncStatus(`Sync failed: ${getFirebaseErrorMessage(error, 'unknown')}`);
      }
    );

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
      remoteReadyRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [syncKey, user]);

  useEffect(() => {
    if (!syncKey || !user || !remoteReadyRef.current || applyingRemoteRef.current) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const db = getFirestore(app);
      setSyncStatus('Saving...');
      setDoc(
        doc(db, firestoreCollection, getDashboardDocId(syncKey)),
        {
          tool: 'maxcredit',
          syncKey,
          credits,
          ownerUid: user.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
        .then(() => setSyncStatus('Synced'))
        .catch((error) => {
          console.error(error);
          setSyncStatus(`Sync failed: ${getFirebaseErrorMessage(error, 'unknown')}`);
        });
    }, 450);
  }, [credits, syncKey, user]);

  const visibleCredits = useMemo(
    () => credits.filter((item) => activeCard === 'all' || item.card === activeCard),
    [activeCard, credits]
  );

  const summary = useMemo(() => {
    const allowance = visibleCredits.reduce((total, item) => total + item.allowance, 0);
    const used = visibleCredits.reduce((total, item) => total + Math.min(item.used, item.allowance), 0);
    const monthlyRemaining = visibleCredits
      .filter((item) => item.cadence === 'monthly')
      .reduce((total, item) => total + Math.max(item.allowance - item.used, 0), 0);

    return {
      allowance,
      used,
      remaining: Math.max(allowance - used, 0),
      monthlyRemaining,
      utilization: allowance > 0 ? Math.round((used / allowance) * 100) : 0,
    };
  }, [visibleCredits]);

  const groupedCredits = useMemo(() => {
    return visibleCredits.reduce<Record<CardKey, CreditItem[]>>(
      (groups, item) => {
        groups[item.card].push(item);
        return groups;
      },
      { csr: [], 'amex-gold': [] }
    );
  }, [visibleCredits]);

  const updateCredit = (id: string, patch: Partial<CreditItem>) => {
    setCredits((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const resetVisibleUsage = () => {
    setCredits((current) =>
      current.map((item) =>
        activeCard === 'all' || item.card === activeCard ? { ...item, used: 0 } : item
      )
    );
  };

  const resetDefaults = () => {
    setCredits(defaultCredits);
    setActiveCard('all');
  };

  const addCredit = () => {
    const allowance = clampMoney(Number(newItem.allowance));
    const creditName = newItem.creditName.trim();
    if (!creditName || allowance <= 0) {
      return;
    }

    const template = defaultCredits.find((item) => item.card === newItem.card) ?? defaultCredits[0];
    setCredits((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        card: newItem.card,
        issuer: template.issuer,
        cardName: template.cardName,
        creditName,
        allowance,
        used: 0,
        cadence: newItem.cadence,
        resetLabel: getCadenceLabel(newItem.cadence),
        note: 'Custom credit bucket.',
        custom: true,
      },
    ]);
    setNewItem((current) => ({ ...current, creditName: '' }));
  };

  const deleteCredit = (id: string) => {
    setCredits((current) => current.filter((item) => item.id !== id));
  };

  const connectSyncKey = () => {
    const normalized = normalizeSyncKey(syncKeyInput);
    setSyncKeyInput(normalized);
    setSyncKey(normalized);
    remoteReadyRef.current = false;
    setSyncStatus(normalized ? (user ? 'Connecting...' : 'Signing in...') : 'Local only');
  };

  return (
    <main className="min-h-[100dvh] bg-[#dfe6f3] p-3 text-[#111739] sm:p-6">
      <div className="mx-auto grid min-h-[calc(100dvh-24px)] w-full max-w-7xl overflow-hidden rounded-2xl bg-[#fbfcff] shadow-[0_24px_80px_rgba(30,45,84,0.14)] lg:grid-cols-[180px_1fr]">
        <aside className="border-b border-slate-100 bg-white px-4 py-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5d74d8] text-sm font-bold text-white">
              MC
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">MaxCredit</p>
              <p className="text-[11px] text-slate-400">Card credits</p>
            </div>
          </div>

          <nav className="mt-8 grid gap-2 text-sm">
            {(['all', 'csr', 'amex-gold'] as const).map((card) => (
              <button
                key={card}
                type="button"
                onClick={() => setActiveCard(card)}
                className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-left font-medium transition ${
                  activeCard === card
                    ? 'bg-[#eef2ff] text-[#4d63c7]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs shadow-sm">
                  {card === 'all' ? 'A' : card === 'csr' ? 'C' : 'G'}
                </span>
                {cardLabels[card]}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-lg bg-[#eeeaff] p-4 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#b9adff] text-sm font-bold text-white">
              S
            </div>
            <p className="mt-3 text-sm font-bold">Cloud sync</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use one Sync Key to share this dashboard across devices.
            </p>
          </div>
        </aside>

        <div className="min-w-0 bg-[#f8faff]">
          <header className="grid gap-4 border-b border-slate-100 bg-white px-5 py-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] xl:items-center">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[#111739]">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-400">
                Track Chase CSR and Amex Gold credits before they expire.
              </p>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="flex min-h-11 items-center gap-3 rounded-lg bg-[#f7f9fd] px-3 shadow-sm ring-1 ring-slate-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#5d74d8] shadow-sm">
                  S
                </span>
                <input
                  value={syncKeyInput}
                  onChange={(event) => setSyncKeyInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      connectSyncKey();
                    }
                  }}
                  placeholder="Sync key, e.g. yungting-wallet"
                  className="min-h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="button"
                onClick={connectSyncKey}
                className="min-h-11 rounded-lg bg-[#eef2ff] px-5 text-sm font-semibold text-[#4d63c7] shadow-sm transition hover:bg-[#e2e8ff]"
              >
                Sync
              </button>
            </div>
          </header>

          <div className="grid min-w-0 gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <section className="grid min-w-0 gap-5">
              <div className="min-w-0 rounded-lg bg-white p-5 shadow-[0_12px_40px_rgba(31,45,90,0.05)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#111739]">Credit Report</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {summary.utilization}% used across {visibleCredits.length} buckets.
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-2">
                    <span className="max-w-full truncate rounded-md bg-[#f7f9fd] px-3 py-2 text-xs font-medium text-slate-500">
                      Status: {syncStatus}
                      {syncKey ? ` / ${syncKey}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={resetVisibleUsage}
                      className="min-h-9 rounded-md bg-[#eef2ff] px-3 text-xs font-semibold text-[#4d63c7] transition hover:bg-[#e2e8ff]"
                    >
                      Reset Visible
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid items-end gap-2 overflow-hidden border-b border-dashed border-slate-200 pb-6 sm:grid-cols-4 lg:grid-cols-8">
                  {visibleCredits.slice(0, 8).map((item) => {
                    const ratio =
                      item.allowance > 0 ? Math.min((item.used / item.allowance) * 100, 100) : 0;
                    return (
                      <div key={`bar-${item.id}`} className="grid gap-2 text-center">
                        <div className="flex h-40 items-end justify-center gap-1 rounded-md bg-[#fbfcff] px-2 py-2">
                          <div
                            className="w-3 rounded-t-full bg-[#8987df]"
                            style={{ height: `${Math.max(ratio, 4)}%` }}
                          />
                          <div
                            className="w-3 rounded-t-full bg-[#86b9df]"
                            style={{ height: `${Math.max(100 - ratio, 8)}%` }}
                          />
                        </div>
                        <p className="truncate text-[11px] font-medium text-slate-500">
                          {item.creditName}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 max-w-full overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400">
                        <th className="py-3 font-semibold">Name</th>
                        <th className="py-3 font-semibold">Card</th>
                        <th className="py-3 font-semibold">Allowance</th>
                        <th className="py-3 font-semibold">Used</th>
                        <th className="py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCredits.map((item) => {
                        const status = getCreditStatus(item);
                        const remaining = Math.max(item.allowance - item.used, 0);
                        return (
                          <tr key={`row-${item.id}`} className="border-b border-slate-50">
                            <td className="max-w-[220px] py-3 pr-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff4dc] text-xs font-bold text-[#dd9a25]">
                                  {item.creditName.slice(0, 1)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-[#111739]">{item.creditName}</p>
                                  <p className="text-xs text-slate-400">{item.resetLabel}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-slate-500">{cardLabels[item.card]}</td>
                            <td className="py-3">
                              <input
                                type="number"
                                min="0"
                                value={item.allowance}
                                onChange={(event) =>
                                  updateCredit(item.id, {
                                    allowance: clampMoney(Number(event.target.value)),
                                  })
                                }
                                className="h-9 w-20 rounded-md border border-slate-100 bg-[#fbfcff] px-2 text-sm text-slate-700 outline-none focus:border-[#aeb9ff]"
                              />
                            </td>
                            <td className="py-3">
                              <input
                                type="number"
                                min="0"
                                value={item.used}
                                onChange={(event) =>
                                  updateCredit(item.id, {
                                    used: clampMoney(Number(event.target.value)),
                                  })
                                }
                                className="h-9 w-20 rounded-md border border-slate-100 bg-[#fbfcff] px-2 text-sm text-slate-700 outline-none focus:border-[#aeb9ff]"
                              />
                              <p className="mt-1 text-xs text-slate-400">
                                {formatCurrency(remaining)} left
                              </p>
                            </td>
                            <td className="py-3">
                              <span className={`rounded-full border px-3 py-1 text-xs ${status.tone}`}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid min-w-0 gap-5 2xl:grid-cols-2">
                {(['csr', 'amex-gold'] as const).map((card) => {
                  const items = groupedCredits[card];
                  if (items.length === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={card}
                      className="min-w-0 rounded-lg bg-white p-5 shadow-[0_12px_40px_rgba(31,45,90,0.05)]"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {items[0].issuer}
                          </p>
                          <h2 className="mt-1 text-base font-bold text-[#111739]">
                            {items[0].cardName}
                          </h2>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#f7f9fd] px-3 py-1 text-xs font-semibold text-slate-500">
                          {formatCurrency(
                            items.reduce(
                              (total, item) => total + Math.max(item.allowance - item.used, 0),
                              0
                            )
                          )}{' '}
                          left
                        </span>
                      </div>

                      <div className="grid gap-3">
                        {items.map((item) => {
                          const ratio =
                            item.allowance > 0
                              ? Math.min((item.used / item.allowance) * 100, 100)
                              : 0;
                          return (
                            <article key={item.id} className="min-w-0 rounded-lg bg-[#fbfcff] p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-[#111739]">{item.creditName}</h3>
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.note}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => updateCredit(item.id, { used: 0 })}
                                  className="min-h-8 rounded-md bg-white px-3 text-xs font-semibold text-[#4d63c7] shadow-sm"
                                >
                                  Reset
                                </button>
                              </div>

                              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-[#8987df]"
                                  style={{ width: `${ratio}%` }}
                                />
                              </div>

                              <div className="mt-3 grid gap-2 xl:grid-cols-3 2xl:grid-cols-[1fr_1fr_1fr_auto]">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.allowance}
                                  onChange={(event) =>
                                    updateCredit(item.id, {
                                      allowance: clampMoney(Number(event.target.value)),
                                    })
                                  }
                                  className="h-9 min-w-0 rounded-md border border-slate-100 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#aeb9ff]"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  value={item.used}
                                  onChange={(event) =>
                                    updateCredit(item.id, {
                                      used: clampMoney(Number(event.target.value)),
                                    })
                                  }
                                  className="h-9 min-w-0 rounded-md border border-slate-100 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#aeb9ff]"
                                />
                                <select
                                  value={item.cadence}
                                  onChange={(event) =>
                                    updateCredit(item.id, {
                                      cadence: event.target.value as Cadence,
                                      resetLabel: getCadenceLabel(event.target.value as Cadence),
                                    })
                                  }
                                  className="h-9 min-w-0 rounded-md border border-slate-100 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#aeb9ff]"
                                >
                                  <option value="monthly">Monthly</option>
                                  <option value="semiannual">Semiannual</option>
                                  <option value="annual">Annual</option>
                                </select>
                                {item.custom ? (
                                  <button
                                    type="button"
                                    onClick={() => deleteCredit(item.id)}
                                    className="min-h-9 rounded-md bg-rose-50 px-3 text-xs font-semibold text-rose-600"
                                  >
                                    Delete
                                  </button>
                                ) : null}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="grid min-w-0 content-start gap-5">
              <section className="grid grid-cols-2 gap-3">
                {[
                  ['Allowance', formatCurrency(summary.allowance), '+ total bucket'],
                  ['Used', formatCurrency(summary.used), `${summary.utilization}% utilized`],
                  ['Remaining', formatCurrency(summary.remaining), 'available value'],
                  ['Monthly left', formatCurrency(summary.monthlyRemaining), 'expires soon'],
                ].map(([label, value, detail], index) => (
                  <div
                    key={label}
                    className="rounded-lg bg-white p-4 shadow-[0_12px_40px_rgba(31,45,90,0.05)]"
                  >
                    <div
                      className={`mb-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-[#f0e9ff] text-[#8f69df]'
                          : index === 1
                            ? 'bg-[#e8f7ff] text-[#45a5d9]'
                            : index === 2
                              ? 'bg-[#ffecef] text-[#e06b7c]'
                              : 'bg-[#fff3df] text-[#e1a13b]'
                      }`}
                    >
                      {label.slice(0, 1)}
                    </div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-2 text-xl font-bold text-[#111739]">{value}</p>
                    <p className="mt-1 text-[11px] text-emerald-500">{detail}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-lg bg-white p-5 shadow-[0_12px_40px_rgba(31,45,90,0.05)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#111739]">Add Credit</h2>
                  <button
                    type="button"
                    onClick={resetDefaults}
                    className="text-xs font-semibold text-[#4d63c7]"
                  >
                    Restore
                  </button>
                </div>
                <div className="grid gap-3">
                  <select
                    value={newItem.card}
                    onChange={(event) =>
                      setNewItem((current) => ({ ...current, card: event.target.value as CardKey }))
                    }
                    className="min-h-10 rounded-md border border-slate-100 bg-[#fbfcff] px-3 text-sm text-slate-700 outline-none focus:border-[#aeb9ff]"
                  >
                    <option value="csr">Chase CSR</option>
                    <option value="amex-gold">Amex Gold</option>
                  </select>
                  <input
                    value={newItem.creditName}
                    onChange={(event) =>
                      setNewItem((current) => ({ ...current, creditName: event.target.value }))
                    }
                    placeholder="Credit name"
                    className="min-h-10 rounded-md border border-slate-100 bg-[#fbfcff] px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#aeb9ff]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      value={newItem.allowance}
                      onChange={(event) =>
                        setNewItem((current) => ({ ...current, allowance: event.target.value }))
                      }
                      className="min-h-10 rounded-md border border-slate-100 bg-[#fbfcff] px-3 text-sm text-slate-700 outline-none focus:border-[#aeb9ff]"
                    />
                    <select
                      value={newItem.cadence}
                      onChange={(event) =>
                        setNewItem((current) => ({
                          ...current,
                          cadence: event.target.value as Cadence,
                        }))
                      }
                      className="min-h-10 rounded-md border border-slate-100 bg-[#fbfcff] px-3 text-sm text-slate-700 outline-none focus:border-[#aeb9ff]"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="semiannual">Semiannual</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={addCredit}
                    className="min-h-10 rounded-md bg-[#5d74d8] px-4 text-sm font-semibold text-white transition hover:bg-[#4d63c7]"
                  >
                    Add
                  </button>
                </div>
              </section>

              <p className="px-1 text-xs leading-5 text-slate-400">
                Saved locally and synced through Firebase when a Sync Key is connected. Verify final
                benefit terms in Chase and Amex portals.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
