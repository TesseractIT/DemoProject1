// BEFORE: simplistic fetch with no timeout handling
// const res = await fetch(AUTH_URL, { method: 'POST', body: JSON.stringify(payload) });

/* AFTER: add timeout + retry */
const fetch = require('node-fetch');

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function login(req, res) {
  try {
    const response = await fetchWithTimeout(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    }, 7000); // 7s timeout

    if (!response.ok) throw new Error('Auth service error');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    // simple retry once for transient timeouts
    if (err.name === 'AbortError') {
      try {
        const retry = await fetchWithTimeout(AUTH_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) }, 7000);
        const data = await retry.json();
        return res.json(data);
      } catch (retryErr) {
        return res.status(504).json({ error: 'Authentication timeout. Please try again.' });
      }
    }
    res.status(500).json({ error: err.message });
  }
}
