'use client';

import { useEffect, useMemo, useState } from 'react';

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
    return { label: 'Complete', tone: 'bg-emerald-400/15 text-emerald-200 border-emerald-400/30' };
  }

  if (ratio >= 0.7) {
    return { label: 'Almost done', tone: 'bg-sky-400/15 text-sky-200 border-sky-400/30' };
  }

  if (item.cadence === 'monthly') {
    return { label: 'Use soon', tone: 'bg-amber-400/15 text-amber-100 border-amber-300/30' };
  }

  return { label: 'Open', tone: 'bg-zinc-400/10 text-zinc-200 border-zinc-400/20' };
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

export function MaxCreditPageClient() {
  const [credits, setCredits] = useState<CreditItem[]>(() => {
    if (typeof window === 'undefined') {
      return defaultCredits;
    }

    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return defaultCredits;
    }

    try {
      const parsed = JSON.parse(saved) as CreditItem[];
      return Array.isArray(parsed) ? parsed : defaultCredits;
    } catch {
      return defaultCredits;
    }
  });
  const [activeCard, setActiveCard] = useState<CardKey | 'all'>('all');
  const [newItem, setNewItem] = useState({
    card: 'csr' as CardKey,
    creditName: '',
    allowance: '10',
    cadence: 'monthly' as Cadence,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(credits));
    }
  }, [credits]);

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

  return (
    <main className="min-h-[100dvh] bg-[#111111] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
              Credit tracker
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              MaxCredit
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Track premium card credits before they expire. Amounts are editable because issuers
              can change benefit terms, and your data stays in this browser.
            </p>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-1 text-sm">
            {(['all', 'csr', 'amex-gold'] as const).map((card) => (
              <button
                key={card}
                type="button"
                onClick={() => setActiveCard(card)}
                className={`min-h-10 px-3 font-medium transition ${
                  activeCard === card
                    ? 'rounded-md bg-white text-zinc-950'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {cardLabels[card]}
              </button>
            ))}
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Allowance', formatCurrency(summary.allowance)],
            ['Used', formatCurrency(summary.used)],
            ['Remaining', formatCurrency(summary.remaining)],
            ['Monthly left', formatCurrency(summary.monthlyRemaining)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-[#181818] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-white/10 bg-[#181818] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Credit Utilization</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {summary.utilization}% used across {visibleCredits.length} active buckets.
                </p>
              </div>
              <button
                type="button"
                onClick={resetVisibleUsage}
                className="min-h-10 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 transition hover:border-amber-200/50 hover:text-white"
              >
                Reset Visible
              </button>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-amber-200"
                style={{ width: `${Math.min(summary.utilization, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#181818] p-5">
            <h2 className="text-lg font-semibold text-white">Add Credit</h2>
            <div className="mt-4 grid gap-3">
              <select
                value={newItem.card}
                onChange={(event) =>
                  setNewItem((current) => ({ ...current, card: event.target.value as CardKey }))
                }
                className="min-h-10 rounded-md border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none focus:border-amber-200/60"
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
                className="min-h-10 rounded-md border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-200/60"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  value={newItem.allowance}
                  onChange={(event) =>
                    setNewItem((current) => ({ ...current, allowance: event.target.value }))
                  }
                  className="min-h-10 rounded-md border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none focus:border-amber-200/60"
                />
                <select
                  value={newItem.cadence}
                  onChange={(event) =>
                    setNewItem((current) => ({
                      ...current,
                      cadence: event.target.value as Cadence,
                    }))
                  }
                  className="min-h-10 rounded-md border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none focus:border-amber-200/60"
                >
                  <option value="monthly">Monthly</option>
                  <option value="semiannual">Semiannual</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <button
                type="button"
                onClick={addCredit}
                className="min-h-10 rounded-md bg-amber-200 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-100"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {(['csr', 'amex-gold'] as const).map((card) => {
            const items = groupedCredits[card];
            if (items.length === 0) {
              return null;
            }

            return (
              <div key={card} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {items[0].issuer}
                    </p>
                    <h2 className="text-2xl font-semibold text-white">{items[0].cardName}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300">
                    {formatCurrency(
                      items.reduce((total, item) => total + Math.max(item.allowance - item.used, 0), 0)
                    )}{' '}
                    left
                  </span>
                </div>

                {items.map((item) => {
                  const remaining = Math.max(item.allowance - item.used, 0);
                  const ratio = item.allowance > 0 ? Math.min((item.used / item.allowance) * 100, 100) : 0;
                  const status = getCreditStatus(item);

                  return (
                    <article
                      key={item.id}
                      className="rounded-lg border border-white/10 bg-[#181818] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{item.creditName}</h3>
                            <span className={`rounded-full border px-2.5 py-1 text-xs ${status.tone}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-5 text-zinc-400">{item.note}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-2xl font-semibold text-white">{formatCurrency(remaining)}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">remaining</p>
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-200"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        <label className="grid gap-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                          Allowance
                          <input
                            type="number"
                            min="0"
                            value={item.allowance}
                            onChange={(event) =>
                              updateCredit(item.id, {
                                allowance: clampMoney(Number(event.target.value)),
                              })
                            }
                            className="min-h-10 rounded-md border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none focus:border-amber-200/60"
                          />
                        </label>
                        <label className="grid gap-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                          Used
                          <input
                            type="number"
                            min="0"
                            value={item.used}
                            onChange={(event) =>
                              updateCredit(item.id, {
                                used: clampMoney(Number(event.target.value)),
                              })
                            }
                            className="min-h-10 rounded-md border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none focus:border-amber-200/60"
                          />
                        </label>
                        <label className="grid gap-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                          Cadence
                          <select
                            value={item.cadence}
                            onChange={(event) =>
                              updateCredit(item.id, {
                                cadence: event.target.value as Cadence,
                                resetLabel: getCadenceLabel(event.target.value as Cadence),
                              })
                            }
                            className="min-h-10 rounded-md border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none focus:border-amber-200/60"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="semiannual">Semiannual</option>
                            <option value="annual">Annual</option>
                          </select>
                        </label>
                        <div className="grid content-end gap-2">
                          <button
                            type="button"
                            onClick={() => updateCredit(item.id, { used: 0 })}
                            className="min-h-10 rounded-md border border-white/10 px-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-300/50 hover:text-white"
                          >
                            Reset
                          </button>
                          {item.custom ? (
                            <button
                              type="button"
                              onClick={() => deleteCredit(item.id)}
                              className="min-h-10 rounded-md border border-red-300/20 px-3 text-sm font-semibold text-red-100 transition hover:border-red-300/50"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-zinc-500">
                        Resets: {item.resetLabel}. Used {formatCurrency(Math.min(item.used, item.allowance))} of{' '}
                        {formatCurrency(item.allowance)}.
                      </p>
                    </article>
                  );
                })}
              </div>
            );
          })}
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Saved locally in this browser. Verify final benefit terms in Chase and Amex portals.</p>
          <button
            type="button"
            onClick={resetDefaults}
            className="min-h-10 rounded-md border border-white/10 px-4 font-semibold text-zinc-300 transition hover:border-white/30 hover:text-white"
          >
            Restore Defaults
          </button>
        </footer>
      </div>
    </main>
  );
}
