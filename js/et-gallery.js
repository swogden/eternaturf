/* =====================================================================
   EternaTurf photo components. Requires js/projects-data.js first.
   Markup hooks:
     <div data-et-gallery data-layout="masonry|bento|rail" data-region="louisville,toledo"
          data-cat="putting" data-ids="a,b,c" data-limit="9" data-filters="cat|region|both"
          data-url-filters="1"></div>
     <div data-et-ba data-layout="feature|grid" data-region="..." data-ids="..." data-limit="6"></div>
     <div data-et-film data-ids="..." data-speed="90"></div>
     <div data-et-regions></div>
   ===================================================================== */
(function(){
  const S = document.currentScript && document.currentScript.src;
  const ROOT = S ? new URL('..', S).href : './';
  const IMG = ROOT + 'images/projects/';
  const P = window.ET_PROJECTS || [], BA = window.ET_BA || [];
  const REG = window.ET_REGIONS || {}, CAT = window.ET_CATS || {};
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const REGION_PAGES = {
    louisville: 'national-locations/louisville-artificial-turf.html',
    toledo: 'national-locations/toledo-ohio-artificial-turf.html',
    sarasota: 'national-locations/sarasota-fl.html',
    tampa: 'national-locations/tampa-florida-artificial-turf.html',
    sindiana: 'national-locations/jeffersonville.html'
  };
  const REGION_ORDER = ['louisville','sindiana','toledo','sarasota','tampa'];
  const REGION_STATE = {louisville:'KY',sindiana:'IN',toledo:'OH',sarasota:'FL',tampa:'FL',florida:'FL'};
  const list = v => (v||'').split(',').map(s=>s.trim()).filter(Boolean);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function pick(el){
    let items = P.slice();
    const ids = list(el.dataset.ids);
    if (ids.length) items = ids.map(i => byId[i]).filter(Boolean);
    else if (el.dataset.mix !== '0') { // interleave areas so the default view shows variety
      const g = {}; items.forEach(p => (g[p.region] = g[p.region] || []).push(p));
      const ks = Object.keys(g); const out = [];
      while (out.length < items.length) ks.forEach(k => { const q = g[k].shift(); if (q) out.push(q); });
      items = out;
    }
    const regs = list(el.dataset.region); if (regs.length) items = items.filter(p => regs.includes(p.region));
    const cats = list(el.dataset.cat); if (cats.length) items = items.filter(p => p.cats.some(c => cats.includes(c)));
    const ex = list(el.dataset.exclude); if (ex.length) items = items.filter(p => !ex.includes(p.id));
    const lim = parseInt(el.dataset.limit||'0',10); if (lim) items = items.slice(0, lim);
    return items;
  }

  function tile(p, i, opts={}){
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'etg-tile'; b.dataset.id = p.id;
    b.dataset.cats = p.cats.join(' '); b.dataset.region = p.region;
    b.setAttribute('aria-label', 'View photo: ' + p.title + ', ' + p.place);
    const src = IMG + 'thumb/' + p.id + '.jpg', big = IMG + p.id + '.jpg';
    const tw = p.w >= p.h ? 720 : Math.round(720*p.w/p.h), th = p.w >= p.h ? Math.round(720*p.h/p.w) : 720;
    b.innerHTML =
      '<img src="'+src+'" srcset="'+src+' 720w, '+big+' 1600w" sizes="'+(opts.sizes||'(max-width:700px) 50vw, 33vw')+'" width="'+tw+'" height="'+th+'" loading="'+(opts.eager?'eager':'lazy')+'" decoding="async" alt="'+esc(p.alt)+'">' +
      '<span class="br tl"></span><span class="br bl"></span>' +
      '<span class="etg-cap"><span><span class="t">'+esc(p.title)+'</span><span class="p" style="display:block">'+esc(p.place)+'</span></span><span class="z">+</span></span>';
    return b;
  }

  /* ---------------- lightbox ---------------- */
  let lb, lbItems = [], lbI = 0;
  function buildLB(){
    lb = document.createElement('div'); lb.className = 'etg-lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-label','Project photo viewer');
    lb.innerHTML =
      '<div class="etg-lb-top"><span class="ct"></span><button class="etg-lb-btn etg-lb-x" aria-label="Close">&times;</button></div>' +
      '<div class="etg-lb-stage"><img alt=""><button class="etg-lb-btn etg-lb-prev" aria-label="Previous photo">&larr;</button><button class="etg-lb-btn etg-lb-next" aria-label="Next photo">&rarr;</button></div>' +
      '<div class="etg-lb-bottom"><div><div class="t"></div><div class="p"></div></div><div class="tags"></div><a class="btn btn-acid cta" href="'+ROOT+'contact.html">Get a Free Quote</a></div>';
    document.body.appendChild(lb);
    lb.querySelector('.etg-lb-x').onclick = closeLB;
    lb.querySelector('.etg-lb-prev').onclick = () => showLB(lbI-1);
    lb.querySelector('.etg-lb-next').onclick = () => showLB(lbI+1);
    lb.addEventListener('click', e => { if (e.target.classList.contains('etg-lb-stage')) closeLB(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowLeft') showLB(lbI-1); if (e.key === 'ArrowRight') showLB(lbI+1);
    });
    let x0 = null;
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, {passive:true});
    lb.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) showLB(lbI + (dx < 0 ? 1 : -1)); x0 = null; });
  }
  let lastFocus = null;
  function openLB(items, i){
    if (!lb) buildLB(); lbItems = items; lastFocus = document.activeElement;
    lb.classList.add('open'); document.body.classList.add('etg-lock'); showLB(i);
    lb.querySelector('.etg-lb-x').focus();
  }
  function closeLB(){ lb.classList.remove('open'); document.body.classList.remove('etg-lock'); if (lastFocus) lastFocus.focus(); }
  function showLB(i){
    lbI = (i + lbItems.length) % lbItems.length; const p = lbItems[lbI];
    const img = lb.querySelector('.etg-lb-stage img');
    img.style.animation = 'none'; img.offsetHeight; img.style.animation = '';
    img.src = IMG + p.id + '.jpg'; img.alt = p.alt;
    lb.querySelector('.ct').innerHTML = 'PROJECT <b>' + String(lbI+1).padStart(2,'0') + '</b> / ' + String(lbItems.length).padStart(2,'0');
    lb.querySelector('.t').textContent = p.title;
    lb.querySelector('.p').textContent = p.place;
    lb.querySelector('.tags').innerHTML = p.cats.map(c => '<span>'+esc(CAT[c]||c)+'</span>').join('');
    [lbI+1, lbI-1].forEach(j => { const q = lbItems[(j+lbItems.length)%lbItems.length]; if (q) { const im = new Image(); im.src = IMG + q.id + '.jpg'; } });
  }

  /* ---------------- galleries ---------------- */
  function initGallery(el){
    const layout = el.dataset.layout || 'masonry';
    let items = pick(el);
    const grid = document.createElement('div'); grid.className = 'etg-' + layout;
    const sizes = layout === 'rail' ? '(max-width:700px) 78vw, 30vw' : layout === 'bento' ? '(max-width:900px) 50vw, 45vw' : '(max-width:700px) 50vw, 33vw';
    items.forEach((p,i) => { const t = tile(p, i, {sizes, eager: layout==='bento' && i < 3}); t.style.setProperty('--ar', p.w + '/' + p.h); grid.appendChild(t); });
    if (layout === 'masonry') {
      const lay = () => {
        const cs = getComputedStyle(grid), unit = parseFloat(cs.gridAutoRows) || 6, gap = 14;
        grid.querySelectorAll('.etg-tile:not(.etg-hide)').forEach(t => {
          const p = byId[t.dataset.id], w = t.getBoundingClientRect().width || 300;
          const m = parseFloat(getComputedStyle(t).marginBottom) || gap;
          t.style.gridRowEnd = 'span ' + Math.ceil((w * p.h / p.w + m) / unit);
        });
      };
      grid._lay = lay; requestAnimationFrame(lay);
      let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(lay, 120); });
    }
    const visible = () => [...grid.querySelectorAll('.etg-tile:not(.etg-hide)')].map(t => byId[t.dataset.id]);
    grid.addEventListener('click', e => {
      const t = e.target.closest('.etg-tile'); if (!t) return;
      const v = visible(); openLB(v, v.findIndex(p => p.id === t.dataset.id));
    });

    const f = el.dataset.filters;
    if (f) {
      const state = {cat:'all', region:'all'};
      if (el.dataset.urlFilters) { const q = new URLSearchParams(location.search); if (q.get('cat')) state.cat = q.get('cat'); if (q.get('region')) state.region = q.get('region'); }
      const apply = () => {
        grid.querySelectorAll('.etg-tile').forEach(t => {
          const ok = (state.cat === 'all' || t.dataset.cats.split(' ').includes(state.cat)) && (state.region === 'all' || t.dataset.region === state.region);
          t.classList.toggle('etg-hide', !ok); if (ok) { t.classList.remove('etg-in'); void t.offsetWidth; t.classList.add('etg-in'); }
        });
        el.querySelectorAll('.etg-chip').forEach(c => c.classList.toggle('on', state[c.dataset.k] === c.dataset.v));
        if (grid._lay) grid._lay();
        const n = grid.querySelectorAll('.etg-tile:not(.etg-hide)').length;
        const cnt = el.querySelector('.etg-count'); if (cnt) cnt.textContent = n + (n === 1 ? ' PROJECT PHOTO' : ' PROJECT PHOTOS');
      };
      const row = (k, label, opts) => {
        const r = document.createElement('div'); r.className = 'etg-filters'; r.setAttribute('role','group'); r.setAttribute('aria-label','Filter by ' + label);
        r.innerHTML = '<span class="etg-flabel">' + label + '</span>' + opts.map(([v,t]) => {
          const n = v === 'all' ? items.length : items.filter(p => k === 'cat' ? p.cats.includes(v) : p.region === v).length;
          return n ? '<button type="button" class="etg-chip" data-k="'+k+'" data-v="'+v+'">'+esc(t)+'<span class="n">'+n+'</span></button>' : '';
        }).join('');
        r.addEventListener('click', e => { const c = e.target.closest('.etg-chip'); if (!c) return; state[k] = c.dataset.v; apply(); });
        return r;
      };
      if (f === 'cat' || f === 'both') el.appendChild(row('cat', 'Type', [['all','All']].concat(Object.entries(CAT))));
      if (f === 'region' || f === 'both') el.appendChild(row('region', 'Area', [['all','All Areas']].concat(Object.entries(REG))));
      const bar = el.querySelector('.gal-bar'); if (bar) el.appendChild(bar);
      el.appendChild(grid);
      apply();
    } else el.appendChild(grid);
  }

  /* ---------------- before / after ---------------- */
  function slider(b){
    const w = document.createElement('div'); w.className = 'etg-ba ' + b.o;
    const src = IMG + 'ba/' + b.id;
    w.innerHTML =
      '<img src="'+src+'-after.jpg" width="'+b.w+'" height="'+b.h+'" loading="lazy" alt="'+esc(b.title)+' after EternaTurf installation">' +
      '<div class="b"><img src="'+src+'-before.jpg" width="'+b.w+'" height="'+b.h+'" loading="lazy" alt="'+esc(b.title)+' before installation"></div>' +
      '<span class="lbl l">BEFORE</span><span class="lbl r">AFTER</span><div class="h"></div>' +
      '<input type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after: '+esc(b.title)+'"><div class="k"><svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true"><path d="M6 1 1 6l5 5M16 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg></div>';
    const r = w.querySelector('input');
    const set = v => { w.style.setProperty('--pos', v + '%'); w.querySelector('.lbl.l').style.opacity = v < 12 ? 0 : 1; w.querySelector('.lbl.r').style.opacity = v > 88 ? 0 : 1; };
    r.addEventListener('input', () => set(r.value));
    // hint animation once visible
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.disconnect();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let t0 = null; const run = t => { if (!t0) t0 = t; const k = (t - t0) / 1400; if (k >= 1) { set(50); r.value = 50; return; }
        const v = 50 + Math.sin(k * Math.PI * 2) * 22; set(v); requestAnimationFrame(run); };
      requestAnimationFrame(run);
    }), {threshold:.5});
    io.observe(w);
    return w;
  }
  function meta(b){ const m = document.createElement('div'); m.className = 'etg-ba-meta'; m.innerHTML = '<span class="t">'+esc(b.title)+'</span><span class="p">'+esc(b.place)+'</span>'; return m; }
  function initBA(el){
    let items = BA.slice();
    const ids = list(el.dataset.ids); if (ids.length) items = ids.map(i => BA.find(b => b.id === i)).filter(Boolean);
    const regs = list(el.dataset.region); if (regs.length) items = items.filter(b => regs.includes(b.region));
    const lim = parseInt(el.dataset.limit||'0',10); if (lim) items = items.slice(0, lim);
    if (!items.length) { el.remove(); return; }
    if ((el.dataset.layout || 'feature') === 'grid') {
      const g = document.createElement('div'); g.className = 'etg-bag';
      items.forEach(b => { const c = document.createElement('div'); c.appendChild(slider(b)); c.appendChild(meta(b)); g.appendChild(c); });
      el.appendChild(g); return;
    }
    const f = document.createElement('div'); f.className = 'etg-baf';
    const main = document.createElement('div'); main.className = 'main';
    const lst = document.createElement('div'); lst.className = 'list';
    const show = i => { main.innerHTML = ''; const b = items[i]; const s = slider(b); main.appendChild(s); main.appendChild(meta(b));
      lst.querySelectorAll('.th').forEach((t,j) => t.classList.toggle('on', j === i)); };
    items.forEach((b,i) => { const t = document.createElement('button'); t.type = 'button'; t.className = 'th';
      t.innerHTML = '<img src="'+IMG+'ba/'+b.id+'-after.jpg" loading="lazy" alt=""><span>'+esc(b.title)+'</span>';
      t.setAttribute('aria-label','Show before and after: ' + b.title); t.onclick = () => show(i); lst.appendChild(t); });
    f.appendChild(main); if (items.length > 1) f.appendChild(lst); else { f.style.gridTemplateColumns = '1fr'; f.classList.add('single'); }
    el.appendChild(f); show(0);
  }

  /* ---------------- filmstrip ---------------- */
  function initFilm(el){
    let items = pick(el);
    const tr = document.createElement('div'); tr.className = 'etg-film-track';
    tr.style.setProperty('--dur', (parseInt(el.dataset.speed||'0',10) || items.length * 5) + 's');
    [...items, ...items].forEach((p,i) => { const t = tile(p, i, {sizes:'360px'}); if (i >= items.length) { t.setAttribute('aria-hidden','true'); t.tabIndex = -1; } tr.appendChild(t); });
    el.classList.add('etg-film'); el.appendChild(tr);
    tr.addEventListener('click', e => { const t = e.target.closest('.etg-tile'); if (!t) return; openLB(items, items.findIndex(p => p.id === t.dataset.id)); });
  }

  /* ---------------- region cards ---------------- */
  function initRegions(el){
    const covers = {louisville:'pavilion-lawn', sindiana:'striped-pool-lawn', toledo:'pond-putting-green', sarasota:'tropical-putting-course', tampa:'palm-bed-lawn'};
    const g = document.createElement('div'); g.className = 'etg-regions';
    REGION_ORDER.forEach(r => {
      const n = P.filter(p => p.region === r).length + BA.filter(b => b.region === r).length; if (!n) return;
      const c = byId[covers[r]] || P.find(p => p.region === r);
      const a = document.createElement('a'); a.className = 'etg-region'; a.href = ROOT + 'projects.html?region=' + r + '#portfolio';
      a.innerHTML = '<img src="'+IMG+'thumb/'+c.id+'.jpg" loading="lazy" alt="'+esc(c.alt)+'"><div class="in"><div class="st">'+REGION_STATE[r]+' · PROJECTS</div><div class="nm">'+esc(REG[r].replace(/, [A-Z]{2}$/,''))+'</div><div class="ct"><span>'+n+' PHOTOS</span><b>&rarr;</b></div></div>';
      g.appendChild(a);
    });
    el.appendChild(g);
  }

  function init(){
    document.querySelectorAll('[data-et-gallery]').forEach(initGallery);
    document.querySelectorAll('[data-et-ba]').forEach(initBA);
    document.querySelectorAll('[data-et-film]').forEach(initFilm);
    document.querySelectorAll('[data-et-regions]').forEach(initRegions);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
