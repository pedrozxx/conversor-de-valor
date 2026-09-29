const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const apiRates = { USDBRL: { bid: '5' }, EURBRL: { bid: '6' }, GBPBRL: { bid: '8' } };

async function open(t, options = {}) {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url: 'https://converter.example.test', runScripts: 'outside-only'
  });
  const w = dom.window;
  t.after(() => w.close());
  const alerts = [];
  let requests = 0;
  w.alert = message => alerts.push(message);
  w.console.log = () => {};
  w.fetch = async () => {
    requests++;
    if (options.networkError) throw new Error('rede indisponível');
    return { ok: true, json: async () => options.api ?? apiRates };
  };
  if (options.cache !== undefined) {
    w.localStorage.setItem('currency_rates_cache', options.cache);
    w.localStorage.setItem('currency_rates_cache_time', String(options.time ?? Date.now()));
  }
  if (options.blockRead) {
    Object.defineProperty(w, 'localStorage', { get() { throw new Error('bloqueado'); } });
  }
  if (options.blockWrite) w.Storage.prototype.setItem = () => { throw new Error('quota'); };
  // Capture the startup promise so an initialization failure fails the test.
  const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8')
    .replace(/\nloadRates\(\)\s*$/, '\nwindow.ready = loadRates()');
  w.eval(source);
  await w.ready;
  function submit(amount, currency) {
    const input = w.document.getElementById('amount');
    input.value = amount;
    input.dispatchEvent(new w.Event('input', { bubbles: true }));
    w.document.getElementById('currency').value = currency;
    w.document.querySelector('form').dispatchEvent(new w.Event('submit', { cancelable: true }));
  }
  return { w, alerts, submit, requests: () => requests,
    result: () => w.document.getElementById('result').textContent.replace(/\s/g, ' '),
    description: () => w.document.getElementById('description').textContent };
}

for (const value of ['12,50', '12.50']) {
  test(`preserva centavos na entrada ${value}`, async t => {
    const app = await open(t);
    app.submit(value, 'USD');
    assert.equal(app.result(), 'R$ 62,50');
  });
}

test('mostra o inverso da cotação ao converter reais para dólar', async t => {
  const app = await open(t);
  app.submit('10', 'BRL-USD');
  assert.equal(app.result(), 'US$ 2.00');
  assert.equal(app.description(), 'R$ 1 = US$ 0.20');
});

for (const [label, options] of [
  ['JSON inválido', { cache: '{' }],
  ['estrutura inválida', { cache: JSON.stringify({ USD: -1, EUR: 6, GBP: 8 }) }],
  ['cache expirado', { cache: JSON.stringify({ USD: 99, EUR: 6, GBP: 8 }), time: Date.now() - 86400001 }],
  ['data futura', { cache: JSON.stringify({ USD: 99, EUR: 6, GBP: 8 }), time: Date.now() + 3600000 }],
  ['leitura bloqueada', { blockRead: true }],
  ['gravação bloqueada', { blockWrite: true }],
]) {
  test(`converte com cotação da API mesmo com ${label}`, async t => {
    const app = await open(t, options);
    app.submit('2', 'USD');
    assert.equal(app.result(), 'R$ 10,00');
    assert.equal(app.requests(), 1);
    assert.deepEqual(app.alerts, []);
  });
}

test('cache válido evita consulta externa', async t => {
  const app = await open(t, { cache: JSON.stringify({ USD: 5, EUR: 6, GBP: 8 }), networkError: true });
  app.submit('2', 'EUR');
  assert.equal(app.result(), 'R$ 12,00');
  assert.equal(app.requests(), 0);
});

for (const bid of ['-5', 'Infinity', 'abc', '0', true, [5], {}, '', null]) {
  test(`recusa cotação inválida da API: ${bid}`, async t => {
    const app = await open(t, { api: { ...apiRates, USDBRL: { bid } } });
    assert.equal(app.w.document.querySelector('button').disabled, true);
    assert.equal(app.alerts.length, 1);
    assert.equal(app.w.document.querySelector('footer').classList.contains('show-result'), false);
  });
}

for (const value of ['1e3', '12,345', '-5', '1.234,56', '0']) {
  test(`recusa valor ambíguo ou inválido: ${value}`, async t => {
    const app = await open(t);
    app.submit('10', 'USD');
    app.submit(value, 'USD');
    assert.equal(app.alerts.length, 1);
    assert.equal(app.w.document.querySelector('footer').classList.contains('show-result'), false);
  });
}

test('falha de rede mantém conversão bloqueada e informa o erro', async t => {
  const app = await open(t, { networkError: true });
  assert.equal(app.alerts.length, 1);
  assert.equal(app.w.document.querySelector('button').disabled, true);
});
