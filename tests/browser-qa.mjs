import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = await mkdtemp(path.join(tmpdir(), 'fastfix-edge-'));
const browser = spawn(edge, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=9223', `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
let sequence = 0;
const pending = new Map();
const events = new Map();
const listeners = new Map();

async function endpoint() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' });
      if (response.ok) return response.json();
    } catch {}
    await delay(100);
  }
  throw new Error('Edge DevTools endpoint unavailable');
}

function send(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function once(name) {
  return new Promise(resolve => events.set(name, resolve));
}

const target = await endpoint();
socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const task = pending.get(message.id);
    if (!task) return;
    pending.delete(message.id);
    return message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result);
  }
  const handler = events.get(message.method);
  if (handler) {
    events.delete(message.method);
    handler(message.params);
  }
  const listener = listeners.get(message.method);
  if (listener) listener(message.params);
});

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');

const pages = ['index.html', 'technology.html', 'calculator.html', 'request.html', 'account.html', 'about.html'];
const sizes = [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 1000 }];
const themes = ['light', 'dark'];
const failures = [];

for (const size of sizes) {
  await send('Emulation.setDeviceMetricsOverride', { width: size.width, height: size.height, deviceScaleFactor: 1, mobile: size.name === 'mobile' });
  for (const theme of themes) {
    for (const page of pages) {
      const errors = [];
      const networkErrors = [];
      const consoleHandler = ({ type, args }) => {
        if (type === 'error') errors.push(args.map(item => item.value || item.description || '').join(' '));
      };
      const exceptionHandler = ({ exceptionDetails }) => errors.push(exceptionDetails.text || exceptionDetails.exception?.description || 'Uncaught exception');
      listeners.set('Runtime.consoleAPICalled', consoleHandler);
      listeners.set('Runtime.exceptionThrown', exceptionHandler);
      listeners.set('Network.loadingFailed', ({ errorText, canceled }) => { if (!canceled) networkErrors.push(errorText); });
      listeners.set('Network.responseReceived', ({ response }) => { if (response.status >= 400) networkErrors.push(`${response.status} ${response.url}`); });
      await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('fastfix-theme', '${theme}')` });
      const loaded = once('Page.loadEventFired');
      await send('Page.navigate', { url: `http://127.0.0.1:4173/${page}` });
      await loaded;
      await delay(700);
      const result = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const initialTheme = document.documentElement.dataset.theme;
          document.querySelector('[data-theme-toggle]')?.click();
          const switchedTheme = document.documentElement.dataset.theme;
          document.querySelector('[data-theme-toggle]')?.click();
          return {
            theme: document.documentElement.dataset.theme,
            themeSwitchWorks: switchedTheme !== initialTheme && localStorage.getItem('fastfix-theme') === initialTheme,
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src),
            emptyLinks: [...document.querySelectorAll('a')].filter(a => !a.getAttribute('href')).length,
            libraries: {
              typed: location.pathname.endsWith('/index.html') ? typeof Typed : 'n/a',
              swiper: location.pathname.endsWith('/index.html') ? typeof Swiper : 'n/a',
              fancybox: location.pathname.endsWith('/about.html') ? typeof Fancybox : 'n/a'
            },
            swiperReady: !location.pathname.endsWith('/index.html') || document.querySelector('.service-swiper')?.classList.contains('swiper-initialized'),
            typedStable: !location.pathname.endsWith('/index.html') || document.querySelector('[data-typed-hero]')?.getBoundingClientRect().height >= 42,
            fancyboxGroup: !location.pathname.endsWith('/about.html') || document.querySelectorAll('[data-fancybox="fastfix-team"]').length >= 3
          };
        })()`
      });
      const report = result.result.value;
      if (report.theme !== theme) failures.push(`${page} ${size.name} ${theme}: theme=${report.theme}`);
      if (!report.themeSwitchWorks) failures.push(`${page} ${size.name} ${theme}: theme switch failed`);
      if (report.overflow) failures.push(`${page} ${size.name} ${theme}: horizontal overflow`);
      if (report.brokenImages.length) failures.push(`${page} ${size.name} ${theme}: broken images ${report.brokenImages.join(', ')}`);
      if (Object.values(report.libraries).includes('undefined')) failures.push(`${page} ${size.name} ${theme}: CDN library unavailable`);
      if (!report.swiperReady) failures.push(`${page} ${size.name} ${theme}: Swiper not initialized`);
      if (!report.typedStable) failures.push(`${page} ${size.name} ${theme}: Typed container collapses`);
      if (!report.fancyboxGroup) failures.push(`${page} ${size.name} ${theme}: Fancybox group incomplete`);
      if (errors.length) failures.push(`${page} ${size.name} ${theme}: console ${errors.join(' | ')}`);
      if (networkErrors.length) failures.push(`${page} ${size.name} ${theme}: network ${networkErrors.join(' | ')}`);
      listeners.clear();
    }
  }
}

socket.close();
browser.kill();
await Promise.race([new Promise(resolve => browser.once('exit', resolve)), delay(2000)]);
try { await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Browser QA passed: ${pages.length * sizes.length * themes.length} page/theme/viewport combinations`);
}
