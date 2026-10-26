import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearStaffSession } from '../services/authSession';
import { getKitchenHistory, getKitchenOrder, getKitchenOrders, kitchenErrorMessage,
  updateKitchenItemStatus, updateKitchenOrderStatus } from '../services/kitchenService';

// Shared kitchen state backed by the /kitchen API.
// `orders` holds active tickets (Received, Preparing, Ready); `history` holds served
// orders. Local state only changes after the backend confirms a status change, and
// an order served on the queue moves into history straight away.

const KitchenContext = createContext(null);
const SETTINGS_KEY = 'scander.kitchen.settings';
// Plain polling until Realtime is wired up, so new tickets still appear.
const POLL_MS = 20 * 1000;
const HISTORY_PAGE_SIZE = 100;
const HISTORY_MAX_PAGES = 5;
const ORDER_FLOW = ['RECEIVED', 'PREPARING', 'READY', 'SERVED'];

export const defaultSettings = {
  profile: { name: 'Kitchen Staff', email: 'kitchen@gathergrounds.com', role: 'Kitchen Staff · Supervisor' },
  newOrderAlerts: true,
  sound: true,
  tone: 'double-gong',
  volume: 'standard',
  rushAlerts: true,
  theme: 'light',
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (saved) return { settings: { ...defaultSettings, ...saved.settings, profile: { ...defaultSettings.profile, ...saved.settings?.profile } }, savedAt: saved.savedAt };
  } catch { /* storage unavailable — fall back to defaults */ }
  return { settings: defaultSettings, savedAt: null };
}

const tones = { 'double-gong': [[392, 0], [294, 0.35]], 'soft-chime': [[660, 0], [880, 0.18]], 'bright-bell': [[988, 0], [1319, 0.12], [988, 0.24]] };
const volumes = { soft: 0.08, standard: 0.18, loud: 0.35 };

export function playChime(tone, volume) {
  try {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    (tones[tone] || tones['double-gong']).forEach(([frequency, offset]) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + offset;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volumes[volume] || volumes.standard, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.9);
    });
    setTimeout(() => audio.close(), 2000);
  } catch { /* audio blocked until the user interacts with the page */ }
}

const maxId = list => list.reduce((max, order) => Math.max(max, order.id), 0);

export function KitchenProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [ordersState, setOrdersState] = useState({ status: 'loading', error: null });
  const [history, setHistory] = useState([]);
  const [historyState, setHistoryState] = useState({ status: 'loading', error: null, truncated: false });
  const [busy, setBusy] = useState({});
  const [{ settings, savedAt }, setSaved] = useState(loadSettings);
  const [now, setNow] = useState(Date.now());
  const [toasts, setToasts] = useState([]);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const busyRef = useRef(new Set());
  const mutationSeq = useRef(0);
  const loadedOnce = useRef(false);
  const pollFailing = useRef(false);
  const historyRequest = useRef(null);
  const seenNewest = useRef(0);
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15 * 1000);
    return () => clearInterval(timer);
  }, []);

  const notify = useCallback((message, tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 5000);
  }, []);
  const dismissToast = id => setToasts(current => current.filter(toast => toast.id !== id));

  // An expired or revoked token sends staff back to sign in.
  const handleAuthError = useCallback(error => {
    if (error?.status !== 401) return false;
    clearStaffSession();
    navigate('/login', { replace: true, state: { from: locationRef.current } });
    return true;
  }, [navigate]);

  const loadOrders = useCallback(async () => {
    const seq = mutationSeq.current;
    try {
      const data = await getKitchenOrders();
      // A status change started or finished meanwhile; this snapshot may be stale.
      if (seq !== mutationSeq.current) return;
      if (!loadedOnce.current) {
        loadedOnce.current = true;
        seenNewest.current = maxId(data);
      }
      pollFailing.current = false;
      setOrders(data);
      setOrdersState({ status: 'ready', error: null });
    } catch (error) {
      if (handleAuthError(error)) return;
      const message = kitchenErrorMessage(error);
      if (loadedOnce.current && !pollFailing.current) notify(`Could not refresh orders. ${message}`, 'error');
      pollFailing.current = true;
      setOrdersState(current => ({ status: current.status === 'ready' ? 'ready' : 'error', error: message }));
    }
  }, [handleAuthError, notify]);

  const loadHistory = useCallback(() => {
    if (historyRequest.current) return historyRequest.current;
    setHistoryState(current => ({ ...current, status: 'loading', error: null }));
    historyRequest.current = (async () => {
      try {
        const collected = [];
        let page = 1;
        let totalPages = 1;
        do {
          const { orders: rows, pagination } = await getKitchenHistory(page, HISTORY_PAGE_SIZE);
          collected.push(...rows);
          totalPages = pagination?.totalPages ?? 1;
          page += 1;
        } while (page <= totalPages && page <= HISTORY_MAX_PAGES);
        setHistory(collected.filter(order => order.completedAt));
        setHistoryState({ status: 'ready', error: null, truncated: totalPages > HISTORY_MAX_PAGES });
      } catch (error) {
        if (handleAuthError(error)) return;
        setHistoryState(current => ({ ...current, status: 'error', error: kitchenErrorMessage(error) }));
      } finally {
        historyRequest.current = null;
      }
    })();
    return historyRequest.current;
  }, [handleAuthError]);

  useEffect(() => {
    loadOrders();
    loadHistory();
    const timer = setInterval(loadOrders, POLL_MS);
    return () => clearInterval(timer);
  }, [loadOrders, loadHistory]);

  const newestId = maxId(orders);
  useEffect(() => {
    if (newestId <= seenNewest.current) return;
    seenNewest.current = newestId;
    const { newOrderAlerts, sound, tone, volume } = settingsRef.current;
    if (!newOrderAlerts) return;
    const newest = ordersRef.current.find(order => order.id === newestId);
    notify(`New order #${newest?.number ?? newestId} received`, 'info');
    if (sound) playChime(tone, volume);
  }, [newestId, notify]);

  // Put a backend-confirmed order into state: active orders stay on the board,
  // served ones move to history, cancelled ones drop off.
  const applyOrder = useCallback(order => {
    const done = Boolean(order.completedAt || order.cancelled);
    setOrders(current => done
      ? current.filter(entry => entry.id !== order.id)
      : current.some(entry => entry.id === order.id)
        ? current.map(entry => entry.id === order.id ? order : entry)
        : [...current, order]);
    if (order.completedAt) setHistory(current => [order, ...current.filter(entry => entry.id !== order.id)]);
    return order;
  }, []);

  // Step the order status forward until it matches its dishes, so the order
  // record stays consistent whether or not the database rolls dish changes up.
  const syncOrderStatus = useCallback(async order => {
    const remaining = order.items.filter(item => item.apiStatus !== 'SERVED');
    const target = !remaining.length ? 'SERVED' : remaining.every(item => item.apiStatus === 'READY') ? 'READY' : null;
    let current = order;
    while (target && ORDER_FLOW.indexOf(current.status) !== -1 && ORDER_FLOW.indexOf(current.status) < ORDER_FLOW.indexOf(target)) {
      current = applyOrder(await updateKitchenOrderStatus(current.id, ORDER_FLOW[ORDER_FLOW.indexOf(current.status) + 1]));
    }
    return current;
  }, [applyOrder]);

  const runOrderAction = useCallback(async (id, action) => {
    if (busyRef.current.has(id)) return;
    busyRef.current.add(id);
    setBusy(current => ({ ...current, [id]: true }));
    mutationSeq.current += 1;
    try {
      const order = await action();
      if (order?.completedAt) notify(`Order #${order.number} fully served — moved to Order History`, 'success');
    } catch (error) {
      if (!handleAuthError(error)) {
        notify(kitchenErrorMessage(error), 'error');
        // Re-read the order so the card reflects what the backend actually holds.
        getKitchenOrder(id).then(applyOrder).catch(() => {});
      }
    } finally {
      busyRef.current.delete(id);
      setBusy(current => { const next = { ...current }; delete next[id]; return next; });
      mutationSeq.current += 1;
    }
  }, [applyOrder, handleAuthError, notify]);

  const acceptOrder = id => runOrderAction(id, async () => {
    let order = applyOrder(await updateKitchenOrderStatus(id, 'PREPARING'));
    for (const item of order.items.filter(entry => entry.apiStatus === 'RECEIVED')) {
      order = applyOrder(await updateKitchenItemStatus(item.lineId, 'PREPARING'));
    }
    return order;
  });

  const setDishStatus = (id, lineId, status) => runOrderAction(id, async () => {
    const item = ordersRef.current.find(order => order.id === id)?.items.find(entry => entry.lineId === lineId);
    if (status === 'ready' && item?.apiStatus === 'RECEIVED') applyOrder(await updateKitchenItemStatus(lineId, 'PREPARING'));
    const order = applyOrder(await updateKitchenItemStatus(lineId, status === 'ready' ? 'READY' : 'SERVED'));
    return syncOrderStatus(order);
  });

  const serveAllReady = id => runOrderAction(id, async () => {
    let order = ordersRef.current.find(entry => entry.id === id);
    for (const item of order?.items.filter(entry => entry.status === 'ready') ?? []) {
      order = applyOrder(await updateKitchenItemStatus(item.lineId, 'SERVED'));
    }
    return order ? syncOrderStatus(order) : order;
  });

  function saveSettings(next) {
    const stamp = Date.now();
    setSaved({ settings: next, savedAt: stamp });
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ settings: next, savedAt: stamp })); } catch { /* keep in memory only */ }
  }

  return <KitchenContext.Provider value={{ orders, ordersStatus: ordersState.status, ordersError: ordersState.error,
    refreshOrders: loadOrders, history, historyStatus: historyState.status, historyError: historyState.error,
    historyTruncated: historyState.truncated, refreshHistory: loadHistory, busy, now, settings, savedAt, saveSettings,
    acceptOrder, setDishStatus, serveAllReady, toasts, notify, dismissToast }}>{children}</KitchenContext.Provider>;
}

export function useKitchen() {
  const kitchen = useContext(KitchenContext);
  if (!kitchen) throw new Error('useKitchen must be used inside KitchenProvider');
  return kitchen;
}
