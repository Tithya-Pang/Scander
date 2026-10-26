import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTable } from '../services/orders';

const storageKey = 'scander:verified-table';
function readRememberedTable() {
  try { return JSON.parse(sessionStorage.getItem(storageKey)); } catch { return null; }
}
function rememberTable(value) {
  try { sessionStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* URL still retains the QR on browsers without storage. */ }
}
function forgetTable() {
  try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
}

export default function useCustomerTable() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const qr = params.get('qr') || '';
  const tableLabel = params.get('table') || params.get('tableId') || params.get('table_id') || '';
  const [result, setResult] = useState({ qr: '', table: null, error: '', loading: false });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const remembered = readRememberedTable();
    if (!qr && remembered?.qr && (!tableLabel || tableLabel === remembered.number || tableLabel === String(remembered.id))) {
      const next = new URLSearchParams(location.search);
      next.set('qr', remembered.qr); next.set('table', remembered.number);
      navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, state: location.state });
    }
  }, [qr, tableLabel, location.pathname, location.search, location.hash, location.state, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    if (!qr) {
      setResult({ qr: '', table: null, error: '', loading: false });
      return () => controller.abort();
    }
    setResult({ qr, table: null, error: '', loading: true });
    getTable(qr, { signal: controller.signal }).then(table => {
      if (controller.signal.aborted) return;
      rememberTable({ qr, ...table });
      setResult({ qr, table, error: '', loading: false });
    }).catch(error => {
      if (controller.signal.aborted) return;
      if ([400, 404].includes(error.status)) forgetTable();
      setResult({ qr, table: null, error: error.message, loading: false });
    });
    return () => controller.abort();
  }, [qr, retry]);

  return { qr, table: result.qr === qr ? result.table : null,
    loading: Boolean(qr) && (result.qr !== qr || result.loading),
    error: result.qr === qr ? result.error : '',
    retry: () => setRetry(value => value + 1) };
}
