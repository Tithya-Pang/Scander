import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createIncomingOrder, createSeedOrders, getOrderStage } from '../data/kitchenOrders';

// Shared kitchen state (frontend mock only — nothing here talks to a backend yet).
// Queue, history and details all read the same `orders` array, so a dish served
// on the queue shows up in history immediately.

const KitchenContext = createContext(null);
const SETTINGS_KEY = 'scander.kitchen.settings';
const DEMO_ARRIVAL_MS = 90 * 1000;
const MAX_WAITING_DEMO_ORDERS = 5;

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

function completeIfDone(order) {
  return !order.completedAt && order.acceptedAt && order.items.every(item => item.status === 'served')
    ? { ...order, completedAt: Date.now() } : order;
}

export function KitchenProvider({ children }) {
  const [orders, setOrders] = useState(() => createSeedOrders());
  const [{ settings, savedAt }, setSaved] = useState(loadSettings);
  const [now, setNow] = useState(Date.now());
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(Math.max(...orders.map(order => order.id)) + 1);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

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

  // Demo feed: simulate a new table order periodically so the Received column stays alive.
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(current => {
        if (current.filter(order => getOrderStage(order) === 'received').length >= MAX_WAITING_DEMO_ORDERS) return current;
        return [createIncomingOrder(nextId.current++), ...current];
      });
    }, DEMO_ARRIVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const newestId = orders.reduce((max, order) => Math.max(max, order.id), 0);
  const seenNewest = useRef(newestId);
  useEffect(() => {
    if (newestId <= seenNewest.current) return;
    seenNewest.current = newestId;
    const { newOrderAlerts, sound, tone, volume } = settingsRef.current;
    if (!newOrderAlerts) return;
    notify(`New order #${newestId} received`, 'info');
    if (sound) playChime(tone, volume);
  }, [newestId, notify]);

  const lastCompleted = orders.reduce((latest, order) => order.completedAt > (latest?.completedAt ?? 0) ? order : latest, null);
  const seenCompleted = useRef(lastCompleted?.completedAt);
  useEffect(() => {
    if (!lastCompleted || lastCompleted.completedAt === seenCompleted.current) return;
    seenCompleted.current = lastCompleted.completedAt;
    notify(`Order #${lastCompleted.id} fully served — moved to Order History`, 'success');
  }, [lastCompleted, notify]);

  function updateOrder(id, change) {
    setOrders(current => current.map(order => order.id === id ? completeIfDone(change(order)) : order));
  }
  const acceptOrder = id => updateOrder(id, order => ({ ...order, acceptedAt: Date.now(),
    items: order.items.map(item => item.status === 'pending' ? { ...item, status: 'preparing' } : item) }));
  const setDishStatus = (id, lineId, status) => updateOrder(id, order => ({ ...order,
    items: order.items.map(item => item.lineId === lineId ? { ...item, status } : item) }));
  const serveAllReady = id => updateOrder(id, order => ({ ...order,
    items: order.items.map(item => item.status === 'ready' ? { ...item, status: 'served' } : item) }));

  function saveSettings(next) {
    const stamp = Date.now();
    setSaved({ settings: next, savedAt: stamp });
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ settings: next, savedAt: stamp })); } catch { /* keep in memory only */ }
  }

  return <KitchenContext.Provider value={{ orders, now, settings, savedAt, saveSettings, acceptOrder, setDishStatus,
    serveAllReady, toasts, notify, dismissToast }}>{children}</KitchenContext.Provider>;
}

export function useKitchen() {
  const kitchen = useContext(KitchenContext);
  if (!kitchen) throw new Error('useKitchen must be used inside KitchenProvider');
  return kitchen;
}
