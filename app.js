/* Pointer mapping and keyboard dragging adapted from Quill-00/INDEX
 * src/components/NumberLine.tsx (MIT); see SOURCES.md and LICENSE-INDEX.txt.
 * Reflection timeline, equation feedback and page integration added here.
 */
(() => {
  'use strict';
  const { clampValue, valueToFraction, fractionToValue } = NumberLine;
  const $ = id => document.getElementById(id);
  const svg = $('numberline');
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1120, PAD = 80, SPAN = W - PAD * 2, Y = 220;
  const xFor = v => PAD + valueToFraction(v) * SPAN;
  const fmt = v => String(Number(v.toFixed(2)) + 0).replace('-', '−');
  const state = { x: 2, a: 5, p: 0, inclusive: false, playing: false, slow: true, frame: 0 };
  const presets = { positive: [2, 5], mixed: [-3, 4], negative: [-6, -2], equal: [3, 3] };
  let drag = null;

  function relation(x, a) {
    if (x === a) return '=';
    return x < a ? (state.inclusive ? '≤' : '<') : (state.inclusive ? '≥' : '>');
  }
  function el(tag, attrs, parent, text) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    parent.appendChild(node);
    return node;
  }
  for (let v = -10; v <= 10; v++) {
    const x = xFor(v);
    el('line', { x1: x, x2: x, y1: Y - (v === 0 ? 12 : 6), y2: Y + (v === 0 ? 12 : 6), class: 'tick' }, $('ticks'));
    el('text', { x, y: Y + 33, 'text-anchor': 'middle', class: 'tick-label' + (v === 0 ? ' origin' : '') }, $('ticks'), fmt(v));
  }

  function stop() {
    cancelAnimationFrame(state.frame);
    state.playing = false;
    state.frame = 0;
  }
  function setValues(x, a, preset = null) {
    stop();
    state.x = clampValue(x, -8, 8);
    state.a = clampValue(a, -8, 8);
    state.p = 0;
    document.querySelectorAll('[data-preset]').forEach(button => {
      const active = button.dataset.preset === preset;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render();
  }
  function pointPosition(value, key) {
    const p = state.p;
    const radius = (xFor(value) - xFor(0));
    const height = value === 0 ? 0 : 46 + Math.abs(value) * 9 + (key === 'a' ? 12 : 0);
    return { x: xFor(0) + radius * Math.cos(Math.PI * p), y: Y - height * Math.sin(Math.PI * p), height };
  }
  function render() {
    const p = state.p;
    const done = p >= 0.999999;
    const before = relation(state.x, state.a);
    const after = relation(-state.x, -state.a);
    $('before-sign').textContent = before;
    $('after-sign').textContent = after;
    $('before-numbers').textContent = `${fmt(state.x)} ${before} ${fmt(state.a)}`;
    $('after-numbers').textContent = `${fmt(-state.x)} ${after} ${fmt(-state.a)}`;
    $('result-block').classList.toggle('revealed', done);
    $('result-block').style.opacity = String(.4 + .6 * Math.min(1, p * 1.15));
    $('after-sign').style.transform = `scale(${1 + Math.sin(Math.PI * p) * .18})`;
    $('after-sign').style.color = done ? '#587d2a' : '';
    $('value-x').value = state.x;
    $('value-a').value = state.a;
    $('inclusive').checked = state.inclusive;
    $('progress').value = Math.round(p * 1000);
    $('progress').style.background = `linear-gradient(to right,#a7bc75 ${p * 100}%,#e7ecdf ${p * 100}%)`;
    $('progress-label').textContent = p === 0 ? '翻转进度' : done ? '翻转完成' : `${Math.round(p * 100)}%`;
    $('play-text').textContent = state.playing ? '暂停翻转' : done ? '再看一次' : p > 0 ? '继续翻转' : '两边乘 −1';
    $('play-icon').textContent = state.playing ? 'Ⅱ' : done ? '↺' : '▶';
    document.body.classList.toggle('running', state.playing);
    $('stage-label').textContent = state.playing ? '关于原点对称 · 观察左右位置' : p > 0 ? '拖动进度，可停在任意位置' : '拖动圆点，改变数值';
    svg.setAttribute('aria-label', `原来 ${fmt(state.x)} ${before} ${fmt(state.a)}，两边乘负一后 ${fmt(-state.x)} ${after} ${fmt(-state.a)}。翻转进度 ${Math.round(p * 100)}%。`);
    const xPos = pointPosition(state.x, 'x');
    const aPos = pointPosition(state.a, 'a');
    const close = Math.abs(xPos.x - aPos.x) < 96 && Math.abs(xPos.y - aPos.y) < 65;
    for (const key of ['x', 'a']) {
      const value = state[key];
      const pos = key === 'x' ? xPos : aPos;
      const point = $('point-' + key);
      point.setAttribute('transform', `translate(${pos.x},${pos.y})`);
      point.setAttribute('aria-valuenow', value);
      point.setAttribute('aria-valuetext', `${key} = ${fmt(value)}，相反数 = ${fmt(-value)}`);
      point.querySelector('text').textContent = p < .5 ? `${key} = ${fmt(value)}` : `−${key} = ${fmt(-value)}`;
      point.querySelector('.point-label').setAttribute('transform', key === 'a' && close ? 'translate(0,126)' : 'translate(0,0)');
      point.querySelector('.point-dot').setAttribute('r', state.x === state.a ? (key === 'a' ? 6 : 12) : 11);
      const ghost = $('ghost-' + key);
      ghost.setAttribute('transform', `translate(${xFor(value)},${Y})`);
      ghost.style.opacity = p === 0 ? '0' : String(.55 * Math.min(1, p * 6));
      ghost.querySelector('text').textContent = `原 ${key} = ${fmt(value)}`;
      const radius = Math.abs(xFor(value) - xFor(0));
      const path = $('trail-' + key);
      path.setAttribute('d', value === 0 ? '' : `M ${xFor(value)} ${Y} A ${radius} ${pos.height} 0 0 ${value > 0 ? 0 : 1} ${xFor(-value)} ${Y}`);
      path.style.opacity = p === 0 ? '0' : '.38';
    }
    let observation = '在数轴上，越靠右，数越大。';
    if (p > 0 && !done) observation = '两点关于原点翻转，到原点的距离不变。';
    if (done) observation = state.x === state.a ? '两点仍然重合，等号保持不变。' : `左右顺序反转，不等号 ${before} 变为 ${after}。`;
    if (done && state.x < 0) observation += ` −x = ${fmt(-state.x)}，是正数。`;
    $('observation-text').textContent = observation;
    $('observation').classList.toggle('done', done);
    const footer = document.querySelector('footer p');
    footer.innerHTML = state.x === state.a
      ? '<span class="footer-symbol">=</span> 关于原点对称 <span class="footer-arrow">→</span> 两点仍然重合 <span class="footer-arrow">→</span> <strong>等号保持不变</strong>'
      : '<span class="footer-symbol">↔</span> 关于原点对称 <span class="footer-arrow">→</span> 左右顺序反转 <span class="footer-arrow">→</span> <strong>不等号方向改变</strong>';
  }
  function play() {
    if (state.playing) { stop(); render(); return; }
    if (state.p >= .999999) state.p = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { state.p = 1; render(); return; }
    state.playing = true;
    let previous = null;
    function tick(now) {
      if (!state.playing) return;
      if (previous !== null) state.p = Math.min(1, state.p + Math.min(100, now - previous) / (state.slow ? 2600 : 1300));
      previous = now;
      if (state.p >= 1) state.playing = false;
      render();
      if (state.playing) state.frame = requestAnimationFrame(tick);
    }
    state.frame = requestAnimationFrame(tick);
    render();
  }

  // SVG screen-to-user mapping also accounts for letterboxing on narrow screens.
  function valueFromClient(clientX, clientY) {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const local = point.matrixTransform(svg.getScreenCTM().inverse());
    return clampValue(fractionToValue((local.x - PAD) / SPAN, .5), -8, 8);
  }
  for (const key of ['x', 'a']) {
    const point = $('point-' + key);
    point.addEventListener('pointerdown', event => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      event.preventDefault();
      const wasReflected = state.p > .5;
      stop();
      drag = { key, pointerId: event.pointerId, reflected: wasReflected };
      point.setPointerCapture(event.pointerId);
      point.focus({ preventScroll: true });
      point.classList.add('dragging');
      render();
    });
    point.addEventListener('pointermove', event => {
      if (!drag || drag.key !== key || drag.pointerId !== event.pointerId) return;
      const value = valueFromClient(event.clientX, event.clientY) * (drag.reflected ? -1 : 1);
      // Keep the reflected endpoint on-screen while dragging at the end of the animation.
      const p = drag.reflected ? 1 : 0;
      setValues(key === 'x' ? value : state.x, key === 'a' ? value : state.a);
      state.p = p;
      render();
    });
    const release = () => { drag = null; point.classList.remove('dragging'); };
    point.addEventListener('pointerup', release);
    point.addEventListener('pointercancel', release);
    point.addEventListener('lostpointercapture', release);
    point.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      const reflected = state.p > .5;
      const delta = (event.key === 'ArrowLeft' ? -.5 : .5) * (reflected ? -1 : 1);
      const value = event.key === 'Home' ? (reflected ? 8 : -8) : event.key === 'End' ? (reflected ? -8 : 8) : clampValue(state[key] + delta, -8, 8);
      setValues(key === 'x' ? value : state.x, key === 'a' ? value : state.a);
      if (reflected) { state.p = 1; render(); }
    });
    $('value-' + key).addEventListener('focus', () => { stop(); render(); });
    $('value-' + key).addEventListener('change', event => {
      const raw = event.target.value;
      const value = raw.trim() === '' ? NaN : Number(raw);
      if (!Number.isFinite(value)) { render(); return; }
      const snapped = clampValue(Math.round(value * 2) / 2, -8, 8) + 0;
      setValues(key === 'x' ? snapped : state.x, key === 'a' ? snapped : state.a);
    });
  }
  $('play').addEventListener('click', play);
  $('progress').addEventListener('input', event => { stop(); state.p = Number(event.target.value) / 1000; render(); });
  $('speed').addEventListener('click', () => {
    state.slow = !state.slow;
    $('speed').innerHTML = state.slow ? '慢速 <span>1×</span>' : '快速 <span>2×</span>';
  });
  $('inclusive').addEventListener('change', event => { state.inclusive = event.target.checked; render(); });
  $('swap').addEventListener('click', () => setValues(state.a, state.x));
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => setValues(...presets[button.dataset.preset], button.dataset.preset)));
  $('reset').addEventListener('click', () => { state.inclusive = false; state.slow = true; $('speed').innerHTML = '慢速 <span>1×</span>'; setValues(2, 5, 'positive'); });
  $('fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { $('stage-label').textContent = '可按浏览器的 F11 进入全屏'; }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement ? '退出全屏' : '全屏演示';
    $('fullscreen').setAttribute('aria-label', label);
    $('fullscreen').title = label;
  });
  document.addEventListener('keydown', event => {
    if (event.target.closest('input,button,a,[role="slider"]') || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code === 'Space') { event.preventDefault(); play(); }
    if (event.key.toLowerCase() === 'r') $('reset').click();
  });
  window.addEventListener('pagehide', stop);
  setValues(2, 5, 'positive');
})();
