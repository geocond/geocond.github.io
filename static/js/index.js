(function () {
  'use strict';

  function ordinal(n) {
    var s = (n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
    return n + s;
  }

  // ------------------------------------------------------------ opening demo
  var demo = window.DEMO || [];
  var demoIndex = 0;
  var demoSwitch = document.getElementById('demo-switch');

  function setImage(id, spec, alt) {
    var el = document.getElementById(id);
    if (!el) { return; }
    el.src = spec.src;
    el.width = spec.w;
    el.height = spec.h;
    el.alt = alt;
  }

  function renderDemo() {
    var d = demo[demoIndex];
    if (!d) { return; }
    var where = d.scene + ' (' + d.dataset + ')';
    setImage('demo-view1', d.views[0], 'View 1, ' + where);
    setImage('demo-view2', d.views[1], 'View 2, ' + where);
    setImage('demo-map', d.map, 'Bird’s-eye map of ' + where + ': VGGT places the camera of view 2 ' +
      d.rot + '° away from its true orientation');
    document.getElementById('demo-err').textContent = d.err + '°';
    document.getElementById('demo-native-value').textContent = ordinal(d.native_pct);
    document.getElementById('demo-geocond-value').textContent = ordinal(d.geocond_pct);
    document.getElementById('demo-native-bar').style.width = d.native_pct + '%';
    document.getElementById('demo-geocond-bar').style.width = d.geocond_pct + '%';
    document.getElementById('demo-scale').textContent = 'Among the ' + d.n_pairs + ' held-out ' + d.dataset +
      ' pairs; higher means less trustworthy. Both scores come from the same VGGT forward pass.';
    var shared = d.overlap < 0.01 ? 'share almost no visible surface' : 'overlap only partly';
    document.getElementById('demo-caption').innerHTML = '<b>' + where + '</b>, a scene not used to train GeoCond. ' +
      'The two photos ' + shared + ' (ground-truth overlap ' + d.overlap.toFixed(2) + '). VGGT rotates the camera of ' +
      'view 2 by ' + d.rot + '&deg; from its true orientation, yet its own confidence places the pair at the ' +
      ordinal(d.native_pct) + ' uncertainty percentile. GeoCond places it at the ' + ordinal(d.geocond_pct) + '.';
    if (demoSwitch) {
      Array.prototype.forEach.call(demoSwitch.children, function (b, k) {
        b.classList.toggle('is-selected', k === demoIndex);
        b.setAttribute('aria-pressed', k === demoIndex ? 'true' : 'false');
      });
    }
  }

  if (demo.length && demoSwitch) {
    demo.forEach(function (d, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'button is-small';
      b.textContent = d.scene.split(',')[0];
      b.addEventListener('click', function () { demoIndex = k; renderDemo(); });
      demoSwitch.appendChild(b);
      [d.views[0], d.views[1], d.map].forEach(function (s) { var p = new Image(); p.src = s.src; });
    });
    renderDemo();
  }

  // ------------------------------------------------------------ qualitative gallery
  var items = window.GALLERY || [];
  var state = { story: 'silent_failure', dataset: 'megaunscene', index: 0 };

  var img = document.getElementById('gallery-image');
  var link = document.getElementById('gallery-link');
  var cap = document.getElementById('gallery-caption');
  var dots = document.getElementById('gallery-dots');
  var counter = document.getElementById('gallery-counter');

  function current() {
    return items.filter(function (it) {
      return it.story === state.story && it.dataset === state.dataset;
    });
  }

  function preload(list, i) {
    [i - 1, i + 1].forEach(function (k) {
      var it = list[(k + list.length) % list.length];
      if (it) { var p = new Image(); p.src = it.src; }
    });
  }

  function render() {
    var list = current();
    if (!list.length || !img) { return; }
    state.index = (state.index + list.length) % list.length;
    var it = list[state.index];
    img.src = it.src;
    if (link) { link.href = it.src; }
    img.width = it.w;
    img.height = it.h;
    img.alt = (state.dataset === 'megaunscene' ? 'MegaUnScene' : '7-Scenes') + ' example ' + (state.index + 1);
    cap.innerHTML = it.caption;
    counter.textContent = (state.index + 1) + ' / ' + list.length;
    dots.innerHTML = '';
    list.forEach(function (_, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Example ' + (k + 1));
      if (k === state.index) { b.className = 'is-active'; }
      b.addEventListener('click', function () { state.index = k; render(); });
      dots.appendChild(b);
    });
    preload(list, state.index);
  }

  document.querySelectorAll('[data-story]').forEach(function (li) {
    li.addEventListener('click', function (ev) {
      ev.preventDefault();
      document.querySelectorAll('[data-story]').forEach(function (x) { x.classList.remove('is-active'); });
      li.classList.add('is-active');
      state.story = li.getAttribute('data-story');
      state.index = 0;
      render();
    });
  });

  document.querySelectorAll('[data-dataset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-dataset]').forEach(function (x) { x.classList.remove('is-selected'); });
      btn.classList.add('is-selected');
      state.dataset = btn.getAttribute('data-dataset');
      state.index = 0;
      render();
    });
  });

  var prev = document.getElementById('gallery-prev');
  var next = document.getElementById('gallery-next');
  if (prev) { prev.addEventListener('click', function () { state.index -= 1; render(); }); }
  if (next) { next.addEventListener('click', function () { state.index += 1; render(); }); }

  var stage = document.getElementById('gallery-stage');
  if (stage) {
    stage.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') { state.index -= 1; render(); ev.preventDefault(); }
      if (ev.key === 'ArrowRight') { state.index += 1; render(); ev.preventDefault(); }
    });
  }

  render();

  // ------------------------------------------------------------ image credits
  var credits = window.CREDITS;
  var creditsList = document.getElementById('credits-list');
  if (credits && creditsList) {
    var link = function (href, text) {
      var a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = text;
      return a;
    };
    credits.photos.forEach(function (c) {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(c.scene + ': '));
      li.appendChild(link(c.url, c.file.replace(/_/g, ' ')));
      li.appendChild(document.createTextNode(' by ' + c.author + ', '));
      li.appendChild(c.licence_url ? link(c.licence_url, c.licence) : document.createTextNode(c.licence));
      li.appendChild(document.createTextNode(' (' + c.used.join(', ') + ')'));
      creditsList.appendChild(li);
    });
    credits.datasets.forEach(function (d) {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode('Indoor frames: '));
      li.appendChild(link(d.url, d.name));
      li.appendChild(document.createTextNode(' dataset, ' + d.by + ' (' + d.used.join(', ') + ')'));
      creditsList.appendChild(li);
    });
  }
  // the footer link opens the credits before the browser scrolls to them
  document.querySelectorAll('a[href="#credits"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var d = document.getElementById('credits');
      if (d) { d.open = true; }
    });
  });

  // ------------------------------------------------------------ BibTeX copy
  var copyBtn = document.getElementById('copy-bibtex');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = document.getElementById('bibtex-text').textContent;
      var done = function () {
        copyBtn.classList.add('is-copied');
        copyBtn.querySelector('.copy-label').textContent = 'Copied!';
        setTimeout(function () {
          copyBtn.classList.remove('is-copied');
          copyBtn.querySelector('.copy-label').textContent = 'Copy';
        }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
      } else {
        fallback(text);
        done();
      }
    });
  }

  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }
})();
