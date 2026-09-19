(() => {
  'use strict';

  const API_BASE = 'https://api.frankfurter.dev/v2';
  const FALLBACK_CURRENCIES = [
    { iso_code: 'AUD', name: 'Australian Dollar', symbol: '$' },
    { iso_code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { iso_code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
    { iso_code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { iso_code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { iso_code: 'EUR', name: 'Euro', symbol: '€' },
    { iso_code: 'GBP', name: 'British Pound', symbol: '£' },
    { iso_code: 'HKD', name: 'Hong Kong Dollar', symbol: '$' },
    { iso_code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { iso_code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { iso_code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { iso_code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { iso_code: 'NZD', name: 'New Zealand Dollar', symbol: '$' },
    { iso_code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { iso_code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
    { iso_code: 'USD', name: 'US Dollar', symbol: '$' },
    { iso_code: 'ZAR', name: 'South African Rand', symbol: 'R' }
  ];

  const form = document.querySelector('#converter-form');
  const amountInput = document.querySelector('#amount');
  const sourceSelect = document.querySelector('#source-currency');
  const targetSelect = document.querySelector('#target-currency');
  const sourceSymbol = document.querySelector('#source-symbol');
  const swapButton = document.querySelector('#swap-button');
  const convertButton = document.querySelector('#convert-button');
  const statusLine = document.querySelector('#status-line');
  const statusText = statusLine.querySelector('b');
  const stage = document.querySelector('.vault-stage');
  const wallet = document.querySelector('#wallet-wrap');
  const badge = document.querySelector('#vault-badge');
  const badgeAmount = badge.querySelector('span');
  const badgeCurrency = badge.querySelector('small');
  const resultCard = document.querySelector('#rate-preview');
  const resultAmount = document.querySelector('#result-amount');
  const resultPair = document.querySelector('#result-pair');
  const resultLabel = resultCard.querySelector('.rate-label');
  const particleField = document.querySelector('#particle-field');
  const rateDate = document.querySelector('#rate-date');

  let currencies = FALLBACK_CURRENCIES;
  let activeController = null;
  let running = false;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function currency(code) {
    return currencies.find((item) => item.iso_code === code) || { iso_code: code, name: code, symbol: code };
  }

  function readableNumber(value, code, includeSymbol = true) {
    try {
      return new Intl.NumberFormat(navigator.language, {
        style: includeSymbol ? 'currency' : 'decimal',
        currency: code,
        maximumFractionDigits: code === 'JPY' || code === 'KRW' ? 0 : 2
      }).format(value);
    } catch {
      return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${code}`;
    }
  }

  function setStatus(message, state = '') {
    statusLine.className = `status-line${state ? ` is-${state}` : ''}`;
    statusText.textContent = message;
  }

  function setLoading(isLoading) {
    convertButton.disabled = isLoading;
    sourceSelect.disabled = isLoading;
    targetSelect.disabled = isLoading;
    swapButton.disabled = isLoading;
    convertButton.classList.toggle('is-loading', isLoading);
    convertButton.querySelector('.button-label').textContent = isLoading ? 'Exchanging' : 'Convert now';
  }

  function syncInputDisplay() {
    const chosen = currency(sourceSelect.value);
    sourceSymbol.textContent = chosen.symbol || chosen.iso_code;
    const amount = Number.parseFloat(amountInput.value);
    badgeAmount.textContent = Number.isFinite(amount) ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—';
    badgeCurrency.textContent = sourceSelect.value;
  }

  function fillCurrencyMenus(items) {
    const source = sourceSelect.value || 'CNY';
    const target = targetSelect.value || 'JPY';
    const options = items
      .slice()
      .sort((a, b) => a.iso_code.localeCompare(b.iso_code))
      .map(({ iso_code: code, name }) => `<option value="${code}">${code} · ${name}</option>`)
      .join('');
    sourceSelect.innerHTML = options;
    targetSelect.innerHTML = options;
    sourceSelect.value = items.some((item) => item.iso_code === source) ? source : 'CNY';
    targetSelect.value = items.some((item) => item.iso_code === target) ? target : 'JPY';
    syncInputDisplay();
  }

  async function loadCurrencies() {
    try {
      const response = await fetch(`${API_BASE}/currencies`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Currency list unavailable');
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) throw new Error('Currency list is empty');
      currencies = data;
      fillCurrencyMenus(currencies);
      setStatus(`${currencies.length} currencies available`);
    } catch {
      fillCurrencyMenus(FALLBACK_CURRENCIES);
      setStatus('Popular currencies loaded · reconnect for full list', 'error');
    }
  }

  async function fetchRate(from, to, signal) {
    if (from === to) return { rate: 1, date: new Date().toISOString().slice(0, 10) };
    const response = await fetch(`${API_BASE}/rate/${encodeURIComponent(from)}/${encodeURIComponent(to)}`, {
      signal,
      headers: { Accept: 'application/json' }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.rate !== 'number') {
      throw new Error(data.message || `No rate is available for ${from} to ${to}.`);
    }
    return data;
  }

  async function animateDeposit(amount, code) {
    if (prefersReducedMotion()) return;
    const start = amountInput.getBoundingClientRect();
    const end = wallet.getBoundingClientRect();
    const token = document.createElement('div');
    token.className = 'money-token';
    token.innerHTML = `<span>${readableNumber(amount, code, false)}</span><small>${code}</small>`;
    token.style.left = `${start.left + start.width * 0.44}px`;
    token.style.top = `${start.top + start.height * 0.35}px`;
    document.body.appendChild(token);
    const targetX = end.left + end.width * 0.5 - (start.left + start.width * 0.44);
    const targetY = end.top + end.height * 0.08 - (start.top + start.height * 0.35);
    const animation = token.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0 },
      { transform: `translate(calc(-50% + ${targetX * .55}px), calc(-50% + ${targetY * .25}px)) scale(1.1) rotate(-4deg)`, opacity: 1, offset: .55 },
      { transform: `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(.28) rotate(7deg)`, opacity: 0, offset: 1 }
    ], { duration: 760, easing: 'cubic-bezier(.22,.75,.16,1)', fill: 'forwards' });
    await animation.finished.catch(() => {});
    token.remove();
  }

  async function animateTransform() {
    resultCard.classList.add('is-waiting');
    wallet.classList.add('is-receiving');
    await wait(prefersReducedMotion() ? 20 : 340);
    wallet.classList.remove('is-receiving');
    wallet.classList.add('is-transforming');
    badge.classList.add('is-dissolving');
    stage.classList.add('is-transforming');
    await wait(prefersReducedMotion() ? 20 : 720);
    wallet.classList.remove('is-transforming');
    stage.classList.remove('is-transforming');
  }

  function burstParticles(multiplier) {
    if (prefersReducedMotion()) return;
    const count = Math.max(14, Math.min(34, Math.round(16 + Math.log10(Math.max(multiplier, 1)) * 9)));
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const dot = document.createElement('i');
      dot.className = 'particle';
      const angle = (Math.PI * 2 * index) / count + Math.random() * .25;
      const distance = 70 + Math.random() * 155;
      dot.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      dot.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      dot.style.setProperty('--size', `${2 + Math.random() * 5}px`);
      fragment.appendChild(dot);
      setTimeout(() => dot.remove(), 950);
    }
    particleField.appendChild(fragment);
  }

  function countUp(finalValue, code) {
    if (prefersReducedMotion()) {
      resultAmount.textContent = readableNumber(finalValue, code);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const started = performance.now();
      const duration = 900;
      const tick = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        resultAmount.textContent = readableNumber(finalValue * eased, code);
        if (progress < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  async function revealResult({ amount, from, to, converted, rate, date }) {
    badgeAmount.textContent = readableNumber(converted, to, false);
    badgeCurrency.textContent = to;
    badge.classList.remove('is-dissolving');
    wallet.classList.add('is-complete');
    resultLabel.textContent = 'Exchange complete';
    resultPair.textContent = `${amount.toLocaleString()} ${from} × ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
    resultCard.classList.remove('is-waiting');
    resultCard.classList.remove('is-emerging');
    void resultCard.offsetWidth;
    resultCard.classList.add('is-emerging');
    burstParticles(converted / amount);
    rateDate.textContent = `Rate date · ${date}`;
    await countUp(converted, to);
    await wait(prefersReducedMotion() ? 20 : 680);
    wallet.classList.remove('is-complete');
  }

  async function convert({ amount, from, to, announce = true }) {
    if (running) return null;
    if (!Number.isFinite(amount) || amount <= 0) {
      amountInput.focus();
      setStatus('Enter an amount greater than zero', 'error');
      throw new Error('Amount must be greater than zero.');
    }

    running = true;
    activeController?.abort();
    activeController = new AbortController();
    setLoading(true);
    setStatus(`Fetching ${from} → ${to}`, 'loading');

    try {
      const ratePromise = fetchRate(from, to, activeController.signal);
      await animateDeposit(amount, from);
      const rateData = await ratePromise;
      await animateTransform();
      const converted = amount * rateData.rate;
      await revealResult({ amount, from, to, converted, rate: rateData.rate, date: rateData.date });
      setStatus(announce ? 'Exchange complete · latest rate applied' : 'Rate updated', 'success');
      return { amount, from, to, rate: rateData.rate, converted, date: rateData.date };
    } catch (error) {
      badge.classList.remove('is-dissolving');
      resultCard.classList.remove('is-waiting');
      wallet.className = 'wallet-wrap';
      stage.classList.remove('is-transforming');
      if (error.name !== 'AbortError') {
        setStatus(error.message || 'The exchange service could not be reached. Try again.', 'error');
      }
      throw error;
    } finally {
      setLoading(false);
      running = false;
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await convert({
        amount: Number.parseFloat(amountInput.value),
        from: sourceSelect.value,
        to: targetSelect.value
      });
    } catch {
      // The styled status region already explains expected API and validation failures.
    }
  });

  swapButton.addEventListener('click', () => {
    const previous = sourceSelect.value;
    sourceSelect.value = targetSelect.value;
    targetSelect.value = previous;
    syncInputDisplay();
    resultLabel.textContent = 'Ready to convert';
    resultAmount.textContent = '—';
    resultPair.textContent = `${sourceSelect.value} → ${targetSelect.value}`;
    setStatus('Currencies swapped');
  });

  sourceSelect.addEventListener('change', syncInputDisplay);
  targetSelect.addEventListener('change', () => {
    resultPair.textContent = `${sourceSelect.value} → ${targetSelect.value}`;
  });
  amountInput.addEventListener('input', syncInputDisplay);

  // Expose the primary conversion journey to browsers that support WebMCP.
  function registerWebMCP() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name: 'convert_currency',
        title: 'Convert currency',
        description: 'Fetch the latest Frankfurter reference rate, run the visible wallet exchange, and return the converted amount.',
        inputSchema: {
          type: 'object',
          properties: {
            amount: { type: 'number', exclusiveMinimum: 0 },
            from: { type: 'string', pattern: '^[A-Za-z]{3}$' },
            to: { type: 'string', pattern: '^[A-Za-z]{3}$' }
          },
          required: ['amount', 'from', 'to'],
          additionalProperties: false
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        async execute(input) {
          const amount = Number(input?.amount);
          const from = String(input?.from || '').toUpperCase();
          const to = String(input?.to || '').toUpperCase();
          if (!Number.isFinite(amount) || amount <= 0 || !/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
            throw new Error('Provide a positive amount and valid three-letter currency codes.');
          }
          amountInput.value = String(amount);
          sourceSelect.value = from;
          targetSelect.value = to;
          if (!sourceSelect.value || !targetSelect.value) throw new Error('One or both currencies are not supported.');
          syncInputDisplay();
          return convert({ amount, from, to, announce: false });
        }
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch {
      // WebMCP is progressive enhancement; the visible converter remains fully functional.
    }
  }

  fillCurrencyMenus(FALLBACK_CURRENCIES);
  loadCurrencies();
  registerWebMCP();
})();
