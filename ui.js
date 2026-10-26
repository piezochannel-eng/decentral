(function () {
    'use strict';
    const E = window.Engine;
    const { CARD, CHAR, ABILITIES } = E;
    const $ = s => document.querySelector(s);
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fmt = n => bigFmt(n);
    const DIFF = { '易しい': 0.7, '標準': 0.85, '厳しい': 1.0 };
    let meta = E.loadMeta();
    let S = null;
    const ui = { view: 'title', names: meta.lastNames || E.randomNames(), diff: '標準', pick: 'mediator', sel: [], draftSel: [], modal: null, last: null,
        prevHand: [], prevPhase: null, fx: {}, fxNow: {}, lastPlay: null, resultDelay: false, anim: null };
    const RCOL = ['#7a4b8c', '#2f6f8f', '#3f7d4e', '#a0612a', '#8c2f3c', '#5b6b2a', '#3b4f8f', '#8a6d2c', '#2f7f7a', '#7a3f6a', '#5e5e5e', '#6a4a2a', '#4a6a8a', '#8a4a4a'];
    const rcol = id => regionColor(id);
    const MOTIF = {
        mountain: '<path d="M30 36 L44 14 L52 26 L58 18 L72 36 Z"/>',
        tree: '<path d="M50 8 L62 26 H56 L66 36 H34 L44 26 H38 Z M50 36 V40"/>',
        snow: '<path d="M50 8 V40 M36 16 L64 32 M36 32 L64 16"/><circle cx="50" cy="24" r="4"/>',
        flame: '<path d="M50 40 C38 36 38 24 46 16 C46 24 52 24 50 10 C62 18 64 32 56 38 C54 40 52 40 50 40 Z"/>',
        house: '<path d="M34 22 L50 10 L66 22 V38 H34 Z M46 38 V28 H54 V38"/>',
        shield: '<path d="M50 8 L64 14 V24 C64 32 58 38 50 40 C42 38 36 32 36 24 V14 Z"/>',
        lantern: '<path d="M44 12 H56 M42 16 H58 V32 H42 Z M44 36 H56 M50 8 V12"/>',
        wall: '<path d="M30 38 V22 H70 V38 Z M30 30 H70 M40 22 V30 M50 30 V38 M60 22 V30"/>',
        coin: '<circle cx="50" cy="24" r="13"/><circle cx="50" cy="24" r="9"/><path d="M47 20 H53 M50 18 V30"/>',
        ship: '<path d="M30 30 H70 L64 38 H36 Z M50 30 V10 L62 26 H50"/>',
        gear: '<circle cx="50" cy="24" r="8"/><path d="M50 8 V13 M50 35 V40 M34 24 H39 M61 24 H66 M39 13 L42 16 M58 32 L61 35 M61 13 L58 16 M42 32 L39 35"/>',
        dice: '<rect x="38" y="12" width="24" height="24" rx="3"/><circle cx="45" cy="19" r="1.6"/><circle cx="55" cy="29" r="1.6"/><circle cx="50" cy="24" r="1.6"/>',
        flag: '<path d="M38 40 V8 M38 10 H62 L56 17 L62 24 H38"/>',
        tower: '<path d="M44 40 V14 H56 V40 M42 14 H58 L50 6 Z M47 20 H53 M47 27 H53"/>',
        scales: '<path d="M50 8 V38 M40 38 H60 M34 14 H66 M34 14 L30 26 H38 Z M66 14 L62 26 H70 Z"/>',
        heart: '<path d="M50 38 C30 26 34 12 44 14 C48 15 50 18 50 20 C50 18 52 15 56 14 C66 12 70 26 50 38 Z"/>',
        wave: '<path d="M26 26 C32 18 38 18 44 26 C50 34 56 34 62 26 C68 18 74 18 76 22 M26 34 C32 28 38 28 44 34 C50 40 56 40 62 34 C68 28 74 28 76 30"/>',
        hands: '<path d="M30 30 L44 20 L52 24 L58 20 L70 28 M44 20 L40 32 M58 20 L62 32 M40 32 H62"/>',
        people: '<circle cx="40" cy="16" r="4"/><circle cx="60" cy="16" r="4"/><circle cx="50" cy="13" r="4.5"/><path d="M32 36 C32 26 48 26 48 36 M52 36 C52 26 68 26 68 36 M42 34 C42 22 58 22 58 34"/>',
        bell: '<path d="M38 34 C40 24 40 14 50 12 C60 14 60 24 62 34 Z M36 34 H64"/><circle cx="50" cy="38" r="2"/>',
        drop: '<path d="M50 8 C58 20 62 26 62 30 A12 12 0 0 1 38 30 C38 26 42 20 50 8 Z"/>',
        wheat: '<path d="M50 40 V10 M50 14 L44 10 M50 14 L56 10 M50 20 L43 16 M50 20 L57 16 M50 26 L43 22 M50 26 L57 22 M50 32 L44 28 M50 32 L56 28"/>',
        sun: '<circle cx="50" cy="24" r="8"/><path d="M50 8 V12 M50 36 V40 M34 24 H38 M62 24 H66 M39 13 L42 16 M58 32 L61 35 M61 13 L58 16 M42 32 L39 35"/>',
        bolt: '<path d="M54 6 L40 26 H50 L46 42 L62 20 H52 Z"/>',
        eye: '<path d="M30 24 C38 12 62 12 70 24 C62 36 38 36 30 24 Z"/><circle cx="50" cy="24" r="5"/>',
        megaphone: '<path d="M34 20 V28 H40 L60 38 V10 L40 20 Z M40 28 L44 38"/>',
        scroll: '<path d="M36 12 H62 C66 12 66 18 62 18 H40 V34 C40 38 34 38 34 34 V14 C34 12 36 12 36 12 M40 34 H64 V18"/>',
        clock: '<circle cx="50" cy="24" r="14"/><path d="M50 14 V24 L58 28"/>',
        train: '<rect x="36" y="10" width="28" height="24" rx="4"/><path d="M36 22 H64 M42 34 L38 40 M58 34 L62 40"/><circle cx="43" cy="28" r="1.6"/><circle cx="57" cy="28" r="1.6"/>',
        book: '<path d="M50 14 C44 10 36 10 32 12 V36 C36 34 44 34 50 38 C56 34 64 34 68 36 V12 C64 10 56 10 50 14 Z M50 14 V38"/>',
        star: '<path d="M50 8 L54 20 L67 20 L57 28 L61 40 L50 32 L39 40 L43 28 L33 20 L46 20 Z"/>',
        stone: '<path d="M34 36 C30 28 36 16 48 14 C60 12 70 22 66 32 C64 38 40 40 34 36 Z"/>',
        crack: '<path d="M26 22 H40 L44 14 L50 30 L56 18 L60 26 H74 M44 14 L42 8 M50 30 L48 40"/>',
        cross: '<path d="M44 10 H56 V18 H64 V30 H56 V38 H44 V30 H36 V18 H44 Z"/>',
        chain: '<rect x="30" y="18" width="20" height="12" rx="6"/><rect x="50" y="18" width="20" height="12" rx="6"/>',
        key: '<circle cx="38" cy="24" r="7"/><path d="M45 24 H70 M62 24 V30 M68 24 V29"/>',
        crown: '<path d="M34 34 L32 14 L42 24 L50 10 L58 24 L68 14 L66 34 Z"/>',
        fist: '<path d="M40 40 V24 C40 18 44 14 48 14 H58 C62 14 62 22 58 22 H60 C64 22 64 30 60 30 V40"/>',
        tent: '<path d="M30 38 L50 10 L70 38 Z M50 10 V38 M44 38 L50 28 L56 38"/>'
    };
    function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    } return h >>> 0; }
    function regionColor(id) {
        const r = S && E.regionById(S, id);
        const rg = r && E.RG.find(x => x.key === r.key);
        return rg ? rg.color : RCOL[id % RCOL.length];
    }
    function cardArt(def, regionId) {
        const h = hashStr(def.id);
        const col = regionId != null ? regionColor(regionId) : (E.RG.find(x => x.key === def.region) || {}).color || '#6a6a6a';
        const kind = h % 4, rot = (h >> 3) % 60 - 30;
        let pat = '';
        if (kind === 0)
            for (let i = -60; i < 160; i += 7)
                pat += `<line x1="${i}" y1="0" x2="${i + 30}" y2="44"/>`;
        else if (kind === 1)
            for (let y = 4; y < 44; y += 8)
                for (let x = (y % 16 ? 4 : 8); x < 100; x += 8)
                    pat += `<circle cx="${x}" cy="${y}" r="0.9"/>`;
        else if (kind === 2)
            for (let r = 6; r < 70; r += 7)
                pat += `<circle cx="${20 + (h % 60)}" cy="${(h >> 5) % 44}" r="${r}" fill="none"/>`;
        else
            for (let i = 0; i < 100; i += 10)
                pat += `<line x1="${i}" y1="0" x2="${i}" y2="44"/><line x1="0" y1="${i % 44}" x2="100" y2="${i % 44}"/>`;
        const m = MOTIF[def.art] || MOTIF.house;
        const sx = 0.9 + ((h >> 7) % 20) / 100;
        return `<svg class="c-art" viewBox="0 0 100 44" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="100" height="44" fill="${col}"/><rect width="100" height="44" fill="url(#none)" class="art-shade"/>
    <g class="art-pat" transform="rotate(${rot} 50 22)">${pat}</g>
    <g class="art-m" transform="translate(${50 - 50 * sx} ${24 - 24 * sx}) scale(${sx})">${m}</g></svg>`;
    }
    const BIG = [[1e48, '極'], [1e44, '載'], [1e40, '正'], [1e36, '澗'], [1e32, '溝'], [1e28, '穣'], [1e24, '秭'], [1e20, '垓'], [1e16, '京'], [1e12, '兆'], [1e8, '億'], [1e4, '万']];
    function bigFmt(n) {
        if (!isFinite(n))
            return '∞';
        const a = Math.abs(n);
        if (a < 1e4)
            return Math.round(n).toLocaleString('ja-JP');
        if (a >= 1e52) {
            const e = Math.floor(Math.log10(a));
            return `${(n / Math.pow(10, e)).toFixed(2)}×10^${e}`;
        }
        for (const [u, s] of BIG)
            if (a >= u) {
                const v = n / u;
                return (v >= 1000 ? Math.round(v).toLocaleString('ja-JP') : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + s;
            }
        return String(n);
    }
    function disTheme(d) {
        if (!d)
            return 'neutral';
        if (d.winter)
            return 'winter';
        const k = d.keys || [];
        const m = [['衝突', 'asteroid'], ['地震', 'quake'], ['津波', 'tsunami'], ['洪水', 'flood'], ['干ばつ', 'drought'], ['疫病', 'plague'], ['噴火', 'eruption'], ['火災', 'fire'], ['原発', 'nuclear'], ['金融', 'finance'], ['停電', 'blackout'], ['インフラ', 'blackout'], ['化学', 'chemical'], ['内戦', 'riot'], ['暴動', 'riot'], ['分離', 'schism'], ['対立', 'schism'], ['陰謀', 'conspiracy'], ['ゼネスト', 'strike']];
        for (const [a, b] of m)
            if (k.includes(a))
                return b;
        return 'neutral';
    }
    function setBackground() {
        if (!document.body)
            return;
        let t = 'title';
        if (ui.view === 'game' && S) {
            if (S.phase === 'parliament')
                t = 'parl';
            else if (S.phase === 'reward')
                t = 'reward';
            else if (S.phase === 'draft')
                t = 'draft';
            else if (S.R)
                t = 'dis-' + disTheme(S.R.d);
        }
        document.body.className = 'bg-' + t + (meta.crt === false ? '' : ' crt');
        setBgTheme(t.replace(/^dis-/, ''));
    }
    function transitionHTML() {
        const tr = ui.fxNow.trans;
        if (!tr)
            return '';
        return `<div class="trans ${tr.cls}"><div class="tr-band"><div class="tr-sub">${esc(tr.sub)}</div><div class="tr-main">${esc(tr.main)}</div>${tr.note ? `<div class="tr-note">${esc(tr.note)}</div>` : ''}</div></div>`;
    }
    function regionChip(id) {
        const r = S && E.regionById(S, id);
        if (!r)
            return '';
        return `<span class="c-reg ${r.dead ? 'dead' : ''}" style="--rc:${rcol(id)}">${esc(r.name)}</span>`;
    }
    function effectAt(id, lv) { return E.effectAtLv(id, lv); }
    const WSHORT = { buy: '承認', buyFac: '建設', reroll: '差し替え', sell: '廃止', stamp: '調印', returnPower: '返還', declare: '宣言', discardCard: '捨て札', pass: '見送り', play: '手番', fire: '発動', win: '乗り切り', fail: '失敗', bossWin: 'ボス', damage: '被害', regionDead: '壊滅', relRise: '関係', trustDrop: '信頼低下', fundsSpent: '支出', fundsGain: '収入', event: '出来事', upgrade: '強化', consume: '消失', retrig: '再発動', maxPlay: '全力', singlePlay: '単独', facFire: '施設', leaveParl: '議会', omen: '前触れ', round: 'ラウンド' };
    function watchText(w, g) { return w ? `${WSHORT[w.ev] || ''} ${g.wc || 0}/${w.n}` : ''; }
    function statusHTML(o) {
        const pills = [];
        if (o.counter)
            pills.push(o.counter);
        if (o.held)
            pills.push({ short: `溜${o.held}`, full: `手札で過ごしたラウンド ${o.held}` });
        if (!pills.length)
            return '';
        return `<div class="c-status">${pills.map(p => {
            const sp = typeof p === 'string' ? { short: p, full: p, frac: null } : p;
            const ring = sp.frac != null ? `<i class="ring" style="--f:${Math.round(sp.frac * 100)}"></i>` : '';
            return `<span class="pill" title="${esc(sp.full)}">${ring}<b>${esc(sp.short)}</b><em>${esc(sp.full)}</em></span>`;
        }).join('')}</div>`;
    }
    function counterText(inst) {
        if (!inst)
            return '';
        const d = CARD[inst.id];
        if (!d.fx)
            return '';
        const wt = d.fx.find(t => t.watch);
        if (wt) {
            const w = wt.watch, wc = inst.g.wc || 0;
            let full = `${WSHORT[w.ev] || ''} ${wc}/${w.n}`;
            if (inst.g.accA)
                full += ` ・ 倍率+${Math.round(inst.g.accA * 100) / 100}`;
            if (inst.g.accX && inst.g.accX !== 1)
                full += ` ・ 倍率×${Math.round(inst.g.accX * 100) / 100}`;
            if (inst.g.accP)
                full += ` ・ 対応力+${Math.round(inst.g.accP)}`;
            if (inst.g.accLuck)
                full += ' ・ 目が肥えている';
            return { short: `${wc}/${w.n}`, full, frac: wc / w.n };
        }
        const lim = d.fx.find(t => t.limited);
        if (lim) {
            const left = inst.g.left == null ? lim.limited : inst.g.left;
            return { short: `残${left}`, full: `あと${left}回使える`, frac: left / lim.limited };
        }
        const cd = d.fx.find(t => t.countdown);
        if (!cd)
            return '';
        if (inst.g.armed)
            return { short: '目覚', full: '目覚めた', frac: 1 };
        const n = cd.countdown.n, left = inst.g.cd == null ? n : inst.g.cd;
        const unit = { play: '回', round: 'ラウンド', win: 'ラウンド', boss: 'ボス', era: '時代' }[cd.countdown.on] || '';
        return { short: `あと${left}`, full: cd.countdown.on === 'boss' ? `ボスをあと${left}回` : `あと${left}${unit}`, frac: (n - left) / n };
    }
    function cardHTML(id, o) {
        o = o || {};
        const d = CARD[id];
        const cat = E.catOf(d);
        const attrs = ` data-cid="${id}" data-lv="${o.lv || 0}"` + (o.iuid != null || o.uid != null ? ` data-iuid="${o.iuid != null ? o.iuid : o.uid}"` : '') + (o.act ? ` data-act="${o.act}"` : '') + (o.uid != null ? ` data-uid="${o.uid}"` : '') + (o.i != null ? ` data-i="${o.i}"` : '') + (o.region != null ? ` data-region="${o.region}"` : '') + (o.domId ? ` id="${o.domId}"` : '');
        const lv = o.lv || 0;
        const plain = /追加の効果はない/.test(d.effect);
        const rkey = o.region != null && S ? (E.regionById(S, o.region) || {}).key : d.region;
        const plainUp = plain || d.upKind === 'base3';
        const base = Math.round((d.base || 0) + (o.bb || 0));
        const lvTag = lv ? (d.upRepeat ? `<span class="c-lv rep">◇${lv}</span>` : '<span class="c-lv">◆</span>') : (d.evolve ? '<span class="c-lv evo">◇</span>' : '');
        return `<div class="card cat-${cat} r-${d.rarity} ${o.cls || ''}"${attrs}${o.style ? ` style="${o.style}"` : ''}>
    ${o.badge ? `<div class="c-badge">${o.badge}</div>` : ''}${statusHTML(o)}${/\bsel\b/.test(o.cls || '') ? '<div class="c-selmark">出す</div>' : ''}${o.stamp ? `<div class="c-seal">${sealHTML(o.stamp)}</div>` : ''}
    ${o.noArt ? '' : cardArt(d, o.region)}
    <div class="c-head"><div class="c-base"><b>${base}</b><span>基礎</span></div><div class="c-title"><span class="c-name">${esc(d.name)}</span>${lvTag}</div></div>
    <div class="c-tags">${o.region != null ? regionChip(o.region) : ''}${cat === 'central' ? '<span class="t-c">中央</span>' : cat === 'local' ? '<span class="t-l">地方</span>' : ''}<span>${esc(d.target)}</span>${d.exclusive ? '<span>専用</span>' : ''}</div>
    <div class="c-eff ${lv ? 'up' : ''}">${esc(effectAt(id, lv))}${o.stamp && E.STAMP[o.stamp] ? `<div class="c-stampline">${esc(E.STAMP[o.stamp].name)}:${esc(E.STAMP[o.stamp].effect)}</div>` : ''}</div>
    <div class="c-rar">${E.RARITY_NAME[d.rarity]}</div>
    ${o.foot || ''}
  </div>`;
    }
    function facHTML(f, o) {
        o = o || {};
        const d = E.FAC[f.id || f];
        return `<div class="fac r-${d.rarity} ${o.cls || ''}" ${o.domId ? `id="${o.domId}"` : ''} ${o.act ? `data-act="${o.act}"` : ''} ${o.i != null ? `data-i="${o.i}"` : ''}>
    <div class="f-name">${esc(d.name)}${d.watch && f.g ? `<span class="f-count" title="${esc(watchText(d.watch, f.g))}"><i class="ring" style="--f:${Math.round(((f.g.wc || 0) / d.watch.n) * 100)}"></i>${f.g.wc || 0}/${d.watch.n}</span>` : ''}</div><div class="f-eff">${esc(d.effect)}${f.g && f.g.v ? `(蓄積 ${Math.round(f.g.v * 100) / 100})` : ''}</div>${o.foot || ''}</div>`;
    }
    function renderFacBar() {
        const slots = [];
        for (let i = 0; i < S.facSlots; i++) {
            const f = S.facilities[i];
            slots.push(f ? facHTML(f, { domId: 'fac-' + f.uid }) : '<div class="fac empty">空き地</div>');
        }
        S.facilities.slice(S.facSlots).forEach(f => slots.push(facHTML(f, { domId: 'fac-' + f.uid })));
        return `<div class="facbar"><span class="fb-lbl">施設 ${S.facilities.length}/${S.facSlots}</span>${slots.join('')}</div>`;
    }
    function renderGraph() {
        const rs = S.regions;
        const n = rs.length, pos = {};
        rs.forEach((r, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; pos[r.id] = { x: 50 + 36 * Math.cos(a), y: 50 + 36 * Math.sin(a) }; });
        const selRegs = new Set((ui.sel || []).map(u => { const c = E.cardByUid(S, u); return c ? c.region : null; }));
        let edges = '', labels = '';
        for (let i = 0; i < n; i++)
            for (let j = i + 1; j < n; j++) {
                const a = rs[i], b = rs[j];
                if (a.dead || b.dead)
                    continue;
                const v = E.getRel(S, a.id, b.id);
                const cls = v >= E.LINK_AT ? 'strong' : v <= -1 ? 'bad' : 'mid';
                const sel = selRegs.has(a.id) && selRegs.has(b.id) ? 'sel' : '';
                const w = Math.min(2.6, v >= E.LINK_AT ? 0.55 + Math.sqrt(v - E.LINK_AT) * 0.3 : v <= -1 ? 0.3 + Math.sqrt(-v) * 0.25 : 0.15 + v * 0.07);
                edges += `<line class="e ${cls} ${sel}" data-a="${a.id}" data-b="${b.id}" x1="${pos[a.id].x}" y1="${pos[a.id].y}" x2="${pos[b.id].x}" y2="${pos[b.id].y}" style="stroke-width:${w.toFixed(2)}"/>`;
                if (v >= E.LINK_AT || v <= -1 || sel)
                    labels += `<text class="ev ${cls}" x="${((pos[a.id].x + pos[b.id].x) / 2).toFixed(1)}" y="${((pos[a.id].y + pos[b.id].y) / 2 + 1).toFixed(1)}">${v}</text>`;
            }
        const nodes = rs.map(r => {
            const p = pos[r.id];
            const enemy = S.R && !S.R.done && S.R.enemyRegion === r.id;
            const hp = r.dead ? '' : Array.from({ length: r.max }, (_, i) => `<i class="${i < r.hp ? 'on' : ''}"></i>`).join('');
            return `<div class="gnode ${r.dead ? 'dead' : ''} ${selRegs.has(r.id) ? 'sel' : ''} ${ui.fxNow.hit && ui.fxNow.hit.has(r.id) ? 'hit' : ''} ${enemy ? 'enemy' : ''}" id="rg-${r.id}" style="left:${p.x}%;top:${p.y}%;--rc:${rcol(r.id)}">
      <div class="gn-name">${esc(r.name)}${r.home ? '<span class="tag">故郷</span>' : ''}</div>${(() => { const g = E.RG.find(x => x.key === r.key); return g ? `<div class="gn-tip"><b>${esc(g.name)}「${esc(g.trait)}」</b>${esc(g.nature)}<br>${esc(g.traitText)}<br><span>得意:${esc(g.tendency)}</span></div>` : ''; })()}
      ${r.dead ? '<div class="gn-dead">壊滅</div>' : `<div class="gn-hp">${hp}</div><div class="gn-tr">信頼 ${r.trust}</div>`}</div>`;
        }).join('');
        return `<div class="graph"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${edges}${labels}</svg>${nodes}</div>
    <div class="g-legend"><span><i class="lg strong"></i>${E.LINK_AT}以上(協力関係)</span><span><i class="lg mid"></i>0〜${E.LINK_AT - 1}</span><span><i class="lg bad"></i>マイナス</span></div>`;
    }
    function renderSide() {
        const fs = S.facilities.length ? S.facilities.map(f => `<li><b>${esc(E.FAC[f.id].name)}</b><span>${esc(E.FAC[f.id].effect)}</span></li>`).join('') : '<li class="none">まだない</li>';
        return `<div class="panel"><h2>地方の関係 <span class="dim">協力関係 ${E.linksCount(S)}</span></h2>${renderGraph()}</div>
    <div class="panel"><h2>施設 <span class="dim">${S.facilities.length}/${S.facSlots}</span></h2><ul class="abilities">${fs}</ul></div>`;
    }
    function modal(html, cls) {
        const m = $('#modal');
        if (!m)
            return;
        const key = (cls || '') + '|' + html.length + '|' + html.slice(0, 200);
        const again = ui.lastModalKey === key;
        ui.lastModalKey = key;
        m.className = 'modal show ' + (cls || '') + (again ? ' still' : '');
        m.innerHTML = `<div class="modal-box">${html}</div>`;
    }
    function closeModal() { const m = $('#modal'); if (m) {
        m.className = 'modal';
        m.innerHTML = '';
    } ui.modal = null; ui.lastModalKey = null; }
    function splashMap() {
        const pts = [[20, 30], [42, 18], [70, 26], [84, 52], [66, 78], [36, 74], [14, 58], [50, 48]];
        const ls = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [7, 1], [7, 4], [7, 6], [2, 7]];
        return `<svg class="splash-map" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
    ${ls.map((l, i) => `<line x1="${pts[l[0]][0]}" y1="${pts[l[0]][1]}" x2="${pts[l[1]][0]}" y2="${pts[l[1]][1]}" style="animation-delay:${i * 0.35}s"/>`).join('')}
    ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === 7 ? 1.6 : 1.1}" class="${i === 7 ? 'cap' : ''}"/>`).join('')}</svg>`;
    }
    const GAME_TITLE = "L'État, c'est pas moi";
    const GAME_SUB = '分権国家ストラテジー';
    function titleMark(crossed) {
        return `<span class="tm-l1">L'ÉTAT,</span><span class="tm-l2">C'EST <span class="tm-pas ${crossed ? 'crossed' : ''}">PAS</span> MOI</span>`;
    }
    function renderTitle() {
        const saved = E.hasSavedRun();
        if (document.body)
            document.body.className = 'bg-title' + (meta.crt === false ? '' : ' crt');
        setBgTheme('title');
        const menu = [['c1', 'newgame', 'はじめから', ''], ['c2', 'continue', 'つづきから', saved ? '' : 'disabled'], ['c3', 'zukan', 'カード図鑑', ''], ['c4', 'records', '記録', ''], ['c5', 'help', '遊び方', ''], ['c6', 'settings', '設定', '']]
            .map((m, k) => `<button class="rbtn ${m[0]}" data-act="${m[1]}" ${m[3]} style="animation-delay:${(1.25 + k * 0.09).toFixed(2)}s">${m[2]}</button>`).join('');
        $('#app').innerHTML = `<div class="splash retro" id="splash">
    <div class="dither"></div>
    <div class="splash-inner" id="splash-inner">
      <div class="tm-kicker">分権国家ローグライト</div>
      <h1 class="titlemark" aria-label="${esc(GAME_TITLE)}">${titleMark(false)}</h1>
      <div class="tm-sub">${esc(GAME_SUB)}</div>
      <nav class="rmenu">${menu}</nav>
      <div class="splash-foot">最高到達 第${meta.best.era || 1}時代 ・ 最高スコア ${fmt(meta.best.score || 0)}${meta.sandbox ? ' ・ サンドボックス' : ''}</div>
    </div>
    <div class="crt-on"></div>
  </div><div id="modal" class="modal"></div>`;
    }
    function renderName() {
        setTimeout(() => { ui.fx.rolled = false; }, 0);
        $('#app').innerHTML = `<div class="screen">
    <div class="step">一 / 三</div><h2 class="s-title">国と指導者</h2>
    <p class="s-lead">これから預かる国と、その指導者の名を決める。</p>
    <div class="form">
      <label>国の名前<input id="in-nation" class="${ui.fx.rolled ? 'rolling' : ''}" maxlength="16" value="${esc(ui.names.nation)}"></label>
      <label>指導者の名前<input id="in-leader" class="${ui.fx.rolled ? 'rolling' : ''}" maxlength="16" value="${esc(ui.names.leader)}"></label>
      <button class="randname" data-act="randname"><span class="dice"></span>国と指導者の名前をおまかせで決め直す</button>
      <div class="hint">入力欄に、好きな名前を書いてもよい。</div>
      <div class="diff"><span>難易度</span>${Object.keys(DIFF).map(k => `<label><input type="radio" name="diff" data-act="diff" value="${k}" ${ui.diff === k ? 'checked' : ''}>${k}</label>`).join('')}</div>
    </div>
    <div class="nav"><button data-act="totitle">戻る</button><button class="primary" data-act="tochars">次へ</button></div>
  </div><div id="modal" class="modal"></div>`;
    }
    function readNames() {
        const n = $('#in-nation'), l = $('#in-leader');
        if (n && n.value.trim())
            ui.names.nation = n.value.trim().slice(0, 16);
        if (l && l.value.trim())
            ui.names.leader = l.value.trim().slice(0, 16);
    }
    function renderChars() {
        const list = E.D.characters.map(c => {
            if (!E.charUnlocked(meta, c.id)) {
                const sec = c.secrecy || 0;
                if (sec === 0)
                    return `<div class="char locked"><div class="ch-name">${esc(c.name)}</div><div class="ch-cond">${esc(c.unlock)}</div></div>`;
                if (sec === 1)
                    return `<div class="char locked"><div class="ch-name">？？？</div><div class="ch-cond">${esc(c.unlock)}</div></div>`;
                return `<div class="char locked deep"><div class="ch-name">？？？</div><div class="ch-cond">……</div></div>`;
            }
            return `<div class="char ${ui.pick === c.id ? 'on' : ''}" data-act="pick" data-id="${c.id}">
      <div class="ch-name">${esc(c.name)}${meta.clears[c.id] ? '<span class="cleared">踏破</span>' : ''}</div>
      <div class="ch-flavor">${esc(E.FLAVOR[c.id])}</div></div>`;
        }).join('');
        const html = `<div class="chars">${list}</div>`;
        $('#app').innerHTML = `<div class="screen wide">
    <div class="step">二 / 三</div><h2 class="s-title">${esc(ui.names.leader)}は、どんな人物か</h2>
    ${html}
    <div class="nav"><button data-act="toname">戻る</button><button class="primary" data-act="start">${esc(CHAR[ui.pick].name)}として就任する</button></div>
  </div><div id="modal" class="modal"></div>`;
    }
    function render() {
        try {
            bgmUpdate();
        }
        catch (e) { }
        if (ui.view === 'review' && S)
            return renderReview();
        if (ui.view === 'title')
            return renderTitle();
        if (ui.view === 'name')
            return renderName();
        if (ui.view === 'chars')
            return renderChars();
        ui.fxNow = ui.fx;
        ui.fx = {};
        if (S.phase !== ui.prevPhase || (S.phase === 'round' && S.roundNo !== ui.prevRound)) {
            if (S.phase === 'parliament') {
                ui.fxNow.shopDeal = true;
                ui.fxNow.trans = { cls: 'parl', sub: E.roundLabel(S) + 'に向けて', main: '議会' };
            }
            if (S.phase === 'round') {
                ui.fxNow.newRound = true;
                ui.prevHand = [];
                ui.lastPlay = null;
                const d = S.R.d;
                ui.fxNow.trans = { cls: (d.boss ? 'boss ' : 'dis ') + 'th-' + disTheme(d), sub: E.roundLabel(S), main: d.name, note: d.boss ? d.restriction : d.type + 'の災害' };
            }
            if (S.phase === 'reward')
                ui.fxNow.trans = { cls: 'reward', sub: '報酬', main: 'ボスを越えた' };
        }
        ui.prevRound = S.roundNo;
        const stage = E.windowStage(S);
        const C = Math.round(S.C);
        let center = '';
        if (S.phase === 'draft')
            center = renderDraft();
        else if (S.phase === 'parliament')
            center = renderParliament();
        else if (S.phase === 'reward')
            center = renderReward();
        else
            center = renderRound();
        $('#app').innerHTML = `
  <header class="top">
    <div class="t-nation"><b>${esc(S.nation)}</b><span>${esc(S.leader)}</span></div>
    <div class="t-era">${S.phase === 'draft' ? '就任' : esc(E.roundLabel(S))}${S.endless ? ' ・ エンドレス' : ''}</div>
    <div class="t-stat">議会資金 <b>${S.funds}</b></div>
    <div class="t-stat t-c">集権度 <b>${C}</b><div class="cbar"><div style="width:${C}%"></div></div></div>
    <div class="t-stat">協力関係 <b>${E.linksCount(S)}</b></div>
    ${S.sandbox ? `<div class="t-dev">不穏度 ${Math.round(S.U)}${S.critical ? ` ・ 臨界 残り${S.countdown}` : ''}${S.flags.devInvincible ? ' ・ 無敵' : ''}</div>` : ''}
    <div class="t-btns">${S.sandbox ? '<button data-act="dev">道具</button>' : ''}<button data-act="deck">手持ち ${S.deck.length}</button><button data-act="zukan">図鑑</button><button data-act="chron">年表</button><button data-act="help">遊び方</button><button data-act="quit">タイトルへ</button></div>
  </header>
  <main class="grid ${S.phase !== ui.prevPhaseForEnter ? 'enter' : ''}">
    <aside class="side">${renderSide()}</aside>
    <section class="center">${center}</section>
    <section class="logcol"><div id="log" class="log stage${stage}">${S.log.slice(-90).map(l => `<p class="${l.cls}">${esc(l.text)}</p>`).join('')}</div></section>
  </main><div id="modal" class="modal"></div>${transitionHTML()}${(S.phase === 'over' || S.phase === 'clear') && ui.endPeek ? '<div class="peekbar"><button class="primary" data-act="unpeek">結末に戻る</button></div>' : ''}`;
        setBackground();
        const lg = $('#log');
        if (lg)
            lg.scrollTop = lg.scrollHeight;
        ui.prevPhase = S.phase;
        ui.prevPhaseForEnter = S.phase;
        afterRender();
        toastNewLogs();
        if (ui.fxNow.tally)
            animateNumbers();
        if (ui.anim && !ui.anim.started) {
            try {
                runAnim();
            }
            catch (e) {
                reportError(e);
                ui.anim = null;
            }
        }
        settleDeal();
    }
    function settleDeal() {
        if (!document.querySelectorAll)
            return;
        setTimeout(() => { document.querySelectorAll('.card.deal, .fac.deal, .stampoffer.deal').forEach(el => { el.classList.remove('deal'); el.style.animationDelay = ''; }); }, 1200);
    }
    function renderDraft() {
        const need = S.draft.need, n = ui.draftSel.length;
        const cards = S.draft.offer.map((id, i) => cardHTML(id, { act: 'draftpick', i, cls: (ui.draftSel.includes(i) ? 'sel ' : '') + (S.phase !== ui.prevPhase ? 'deal' : ''), style: S.phase !== ui.prevPhase ? `animation-delay:${i * 50}ms` : '' })).join('');
        return `<div class="phase-head"><div class="step">三 / 三</div><h2 class="s-title">最初の制度</h2>
    <p>${esc(S.nation)}が最初に備える対策を${need}つ選ぶ。ほかに、各地に古くからある制度が寄せ集めで引き継がれる。</p></div>
    <div class="cards">${cards}</div>
    <div class="actions"><span class="count">${n} / ${need}</span><button class="primary" data-act="draftgo" ${n === need ? '' : 'disabled'}>この${need}つで始める</button></div>`;
    }
    function renderRound() {
        const R = S.R, d = R.d;
        const fx = ui.fxNow;
        const A = ui.anim;
        const pct = Math.min(100, R.total / R.req * 100);
        const shownTotal = A ? A.before : fx.tally ? fx.tally.from : R.total;
        const pctFrom = Math.min(100, shownTotal / R.req * 100);
        const mp = E.maxPlay(S);
        const canAct = S.phase === 'round' && !R.done && !R.backerPending && !A;
        ui.sel = ui.sel.filter(u => S.hand.includes(u));
        const n = S.hand.length;
        const ov = n > 8 ? 42 : n > 6 ? 30 : n > 4 ? 18 : 6;
        let dealt = 0;
        const hand = S.hand.map((u, i) => {
            const inst = E.cardByUid(S, u);
            const k = ui.sel.indexOf(u);
            const off = i - (n - 1) / 2;
            const isNew = !ui.prevHand.includes(u);
            const cls = (k >= 0 ? 'sel ' : '') + (isNew ? 'deal' : '');
            const style = `--r:${(off * 3.2).toFixed(1)}deg;--y:${(Math.abs(off) * Math.abs(off) * 2.2).toFixed(1)}px;--ov:${ov}px;--z:${i + 1}${isNew ? `;animation-delay:${(dealt++) * 70}ms` : `;animation-delay:${-((Date.now() + i * 1100) % 3200)}ms`}`;
            return cardHTML(inst.id, { act: 'hand', uid: u, region: inst.region, stamp: inst.stamp, bb: inst.g.bb, held: inst.g.held, counter: counterText(inst), cls, badge: k >= 0 ? String(k + 1) : '', lv: inst.lv, style });
        }).join('');
        ui.prevHand = S.hand.slice();
        const pv = canAct && ui.sel.length ? E.scoreHand(S, ui.sel, true) : null;
        let table = '<div class="table-empty">手札からカードを選んで出す</div>';
        const last = A ? A.play : ui.lastPlay;
        const done = !A && (S.phase === 'result' || S.phase === 'winter');
        const banner = done ? `<div class="result-banner ${R.success ? 'ok' : 'ng'}"><div class="rb-t">${R.success ? '乗り切った' : '抑えきれなかった'}</div>
    <div class="rb-n">${esc(d.name)} ・ 対策値 ${fmt(R.total)} / ${fmt(R.req)}${R.coin ? ` ・ コインは${R.coin}` : ''}${R.dmg ? ` ・ <span class="bad">被害 ${R.dmg}</span>` : ''} ・ 議会資金 +${R.income || 0}</div>
    <div class="rb-b"><button data-act="roundlog">このラウンドの手を見る</button>${E.canRevise(S) ? '<button data-act="revise">修正する</button>' : ''}<button class="primary" data-act="next">${S.phase === 'winter' ? '冬は続く' : S.pendingReward ? '報酬へ' : '議会へ'}</button></div></div>` : '';
        if (last) {
            const cards = last.ids.map((id, i) => `<div class="tcard ${A ? 'fly' : ''}" id="tc-${last.uids[i]}" style="animation-delay:${i * 90}ms">${cardHTML(id, { lv: last.lvs[i], region: last.regions[i] })}</div>`).join('');
            const r = last.res;
            table = `<div class="tcards">${cards || '<div class="table-empty">何も出さなかった</div>'}</div>
      <div class="tally" id="tally"><span class="t-p" id="t-p">${A ? 0 : fmt(r.P)}</span><span class="t-x">×</span><span class="t-m" id="t-m">${A ? 1 : r.M}</span><span class="t-eq">=</span><span class="t-s" id="t-s">${A ? '' : fmt(r.score)}</span></div>
      <div class="tdetail" id="tdetail">${A ? '' : stepsSummary(r.steps)}</div>${A ? '<div class="combo" id="combo"></div>' : ''}`;
        }
        return `
  <div class="disaster ${d.boss ? 'boss' : ''} ${d.winter ? 'winter' : ''} ${fx.shake ? 'shake' : ''} ${fx.cleared ? 'cleared' : ''} ${fx.newRound ? 'arrive' : ''}">
    <div class="d-head"><span class="d-name">${esc(d.name)}</span><span class="d-type">${esc(d.type)}${d.boss ? ' ・ ボス' : ''}</span></div>
    ${d.boss && d.restriction ? `<div class="d-rule">${esc(d.restriction)}</div>` : ''}
    <div class="d-bar"><div id="dbar" style="width:${pctFrom}%" ${fx.tally ? `data-to="${pct}"` : ''}></div></div>
    <div class="d-nums"><span>対策値 <b id="dtotal" ${fx.tally ? `data-to="${Math.round(R.total)}"` : ''}>${fmt(shownTotal)}</b> / ${fmt(R.req)}</span><span class="pips">手番 ${pips(R.playsLeft, R.playsLeft + R.playsUsed)}<span class="sep"></span>引き直し ${pips(R.discardsLeft, R.discardsLeft + R.discardsUsed)}</span></div>
  </div>
  ${renderFacBar()}
  ${banner}
  <div class="table" id="table">${table}</div>
  <div class="actions">
    <div class="pv">${pv && ui.sel.length <= mp ? `見込み <b>${fmt(pv.P)}</b> × <b>${pv.M}</b> = <b class="big">${fmt(pv.score)}</b>` : `<span class="dim">出すのは${mp}枚まで、引き直しは${E.maxDiscard(S)}枚まで。選んだ順に発動する</span>`}</div>
    <button class="primary" data-act="exec" ${canAct && ui.sel.length <= mp ? '' : 'disabled'}>${ui.sel.length > mp ? `出せるのは${mp}枚まで` : ui.sel.length ? `${ui.sel.length}枚を出す` : '何もせず手番を終える'}</button>
    <button data-act="discard" ${canAct && R.discardsLeft > 0 && ui.sel.length && ui.sel.length <= E.maxDiscard(S) ? '' : 'disabled'}>${ui.sel.length > E.maxDiscard(S) ? `引き直せるのは${E.maxDiscard(S)}枚まで` : '引き直す'}</button>
    ${S.charId === 'puppet' ? '' : `<button class="decl" data-act="declare" ${E.canDeclare(S) && canAct ? '' : 'disabled'}>緊急事態宣言を発令する</button>`}
    ${S.charId === 'twins' && E.owned(S, 'swap') ? '<button data-act="swap">片割れを入れ替える</button>' : ''}
  </div>
  <div class="hand-fan ${A ? 'busy' : ''} ${ui.sel.length ? 'has-sel' : ''}">${hand || '<div class="empty">手札がない</div>'}</div>
  <div class="deckinfo">山札 ${S.drawPile.length}</div>
  ${fx.stamp ? '<div class="stamp"><span>緊急事態宣言</span></div>' : ''}`;
    }
    function pips(left, total) { return Array.from({ length: Math.max(total, left) }, (_, i) => `<i class="${i < left ? 'on' : ''}"></i>`).join(''); }
    function stepText(st) {
        const bits = [];
        if (st.p)
            bits.push((st.p > 0 ? '+' : '') + fmt(st.p));
        if (st.a)
            bits.push('倍率' + (st.a > 0 ? '+' : '') + (Math.round(st.a * 100) / 100));
        if (st.x && st.x !== 1)
            bits.push('倍率×' + (Math.round(st.x * 100) / 100));
        if (st.px && st.px !== 1)
            bits.push('対応力×' + (Math.round(st.px * 100) / 100));
        if (st.note)
            bits.push(st.note);
        return bits.join(' ');
    }
    function stepsSummary(steps) {
        return steps.map(st => `<span class="k-${st.kind}${st.retrig ? ' re' : ''}">${st.retrig ? 'もう一度 ' : ''}${esc(st.name)} ${esc(stepText(st))}</span>`).join('');
    }
    const gid = id => (document.getElementById ? document.getElementById(id) : null);
    function flash(el, cls) {
        if (!el || !el.classList)
            return;
        const list = String(cls).split(/\s+/).filter(Boolean);
        el.classList.remove('fire', 're', 'bump', 'slam');
        void el.offsetWidth;
        list.forEach(c => el.classList.add(c));
    }
    function floater(el, text, kind) {
        if (!el || !document.createElement || !text)
            return;
        const f = document.createElement('span');
        f.className = 'floater ' + kind;
        f.textContent = text;
        el.appendChild(f);
        setTimeout(() => { if (f.parentNode)
            f.parentNode.removeChild(f); }, 1000);
    }
    function runAnim() {
        const A = ui.anim;
        if (!A || A.started)
            return;
        A.started = true;
        let k = 0;
        const pEl = gid('t-p'), mEl = gid('t-m'), sEl = gid('t-s'), tbl = gid('table'), det = gid('tdetail');
        const step = () => {
            if (ui.anim !== A)
                return;
            if (k >= A.steps.length)
                return finish();
            const st = A.steps[k];
            const dur = A.fast ? 35 : Math.max(55, 440 * Math.pow(0.86, k));
            let el = st.uid != null ? gid('tc-' + st.uid) : st.fuid != null ? gid('fac-' + st.fuid) : gid('tally');
            flash(el, st.retrig ? 'fire re' : 'fire');
            const txt = (st.retrig ? 'もう一度 ' : '') + (st.kind === 'glob' || st.kind === 'rel' || st.kind === 'pre' ? st.name + ' ' : '') + stepText(st);
            const kind = st.x && st.x !== 1 ? 'mul' : st.a ? 'add' : st.kind === 'off' ? 'off' : 'pow';
            popout(el, txt, kind, k % 2 ? 'l' : 'r');
            if (st.x >= 2 || (st.kind === 'glob' && /乗/.test(st.note || ''))) {
                screenFlash(st.x >= 5 || /乗/.test(st.note || '') ? 'big' : '');
                shake(tbl, Math.min(3, 1 + Math.log10(Math.max(1, st.x || 10))));
            }
            const cmb = gid('combo');
            if (cmb) {
                cmb.textContent = `連鎖 ${k + 1}`;
                flash(cmb, 'bump');
                if (k + 1 >= 10)
                    cmb.classList.add('hot');
            }
            if (pEl) {
                pEl.textContent = fmt(st.P);
                flash(pEl, 'bump');
            }
            if (mEl) {
                mEl.textContent = st.M;
                if (st.a || (st.x && st.x !== 1))
                    flash(mEl, 'bump');
            }
            if (det && det.insertAdjacentHTML)
                det.insertAdjacentHTML('beforeend', stepsSummary([st]));
            k++;
            if (tbl && tbl.classList) {
                if (k >= 6)
                    tbl.classList.add('hot');
                if (k >= 12)
                    tbl.classList.add('hotter');
                if (k >= 20)
                    tbl.classList.add('hottest');
            }
            setTimeout(step, dur);
        };
        const finish = () => {
            if (sEl) {
                sEl.textContent = fmt(A.res.score);
                flash(sEl, 'slam');
                burst(sEl, A.steps.length > 8 ? 30 : 16);
                if (A.res.score >= (S.R ? S.R.req : 1e9))
                    screenFlash('gold');
            }
            setTimeout(() => {
                if (ui.anim !== A)
                    return;
                ui.anim = null;
                ui.fx.tally = { from: A.before };
                if (A.done) {
                    if (A.success)
                        ui.fx.cleared = true;
                    else
                        ui.fx.shake = true;
                    ui.fx.hit = A.hit;
                    ui.resultDelay = true;
                }
                render();
            }, A.fast ? 200 : 700);
        };
        setTimeout(step, A.fast ? 50 : 520);
    }
    function animateNumbers() {
        const els = Array.from(document.querySelectorAll ? document.querySelectorAll('[data-to]') : []);
        if (!els.length)
            return;
        const start = Date.now(), dur = 650;
        const from = els.map(el => el.id === 'dbar' ? parseFloat(el.style.width) || 0 : (parseFloat(String(el.textContent).replace(/,/g, '')) || 0));
        const tick = () => {
            const t = Math.min(1, (Date.now() - start) / dur), e = 1 - Math.pow(1 - t, 3);
            els.forEach((el, i) => { const to = parseFloat(el.dataset.to); const v = from[i] + (to - from[i]) * e; if (el.id === 'dbar')
                el.style.width = v + '%';
            else
                el.textContent = fmt(v); });
            if (t < 1)
                (window.requestAnimationFrame || (f => setTimeout(f, 16)))(tick);
        };
        tick();
    }
    function renderReward() {
        const opts = S.reward.options.map((o, i) => {
            if (o.kind === 'fac')
                return `<div class="reward fc" style="animation-delay:${i * 120}ms" data-act="reward" data-i="${i}"><div class="rw-kind">施設${S.facilities.length >= S.facSlots ? '(用地も一つ広がる)' : ''}</div>${facHTML(o.id, {})}</div>`;
            if (o.stamp)
                return `<div class="reward cd" style="animation-delay:${i * 120}ms" data-act="reward" data-i="${i}"><div class="rw-kind">${E.STAMP[o.stamp].name}付きの${E.RARITY_NAME[CARD[o.id].rarity]}</div>${cardHTML(o.id, { stamp: o.stamp })}</div>`;
            if (o.kind === 'ability')
                return `<div class="reward ab" style="animation-delay:${i * 120}ms" data-act="reward" data-i="${i}"><div class="rw-kind">能力</div><div class="rw-name">${esc(ABILITIES[o.id].name)}</div><div class="rw-text">${esc(ABILITIES[o.id].text)}</div></div>`;
            return `<div class="reward cd" style="animation-delay:${i * 120}ms" data-act="reward" data-i="${i}"><div class="rw-kind">${E.RARITY_NAME[CARD[o.id].rarity]}のカード</div>${cardHTML(o.id)}</div>`;
        }).join('');
        return `<div class="phase-head"><h2 class="s-title">${esc(S.prevDisaster ? S.prevDisaster.name : 'ボス')}を越えた</h2><p>ひとつを選ぶ。</p></div>
    <div class="rewards">${opts}</div>
    <div class="actions"><button data-act="rewardreroll" ${S.funds >= E.rerollRewardCost(S) ? '' : 'disabled'}>候補を差し替える ${E.rerollRewardCost(S)}</button><button data-act="rewardskip">どれも選ばない</button></div>`;
    }
    function renderParliament() {
        const P = S.P;
        const next = S.nextD;
        let nextTxt = '次に何が来るかは、まだ分からない。';
        if (next && next.winter)
            nextTxt = '次は最終災害「長い冬」。三つの局面が続けて来る。';
        const reveal = P.reveal.map(t => `<p class="reveal">${esc(t)}</p>`).join('');
        const deal = ui.fxNow.shopDeal || ui.fxNow.cardDeal, fdeal = ui.fxNow.facDeal || ui.fxNow.shopDeal, sdeal = ui.fxNow.stampDeal || ui.fxNow.shopDeal;
        if ((ui.fxNow.shopDeal || ui.fxNow.cardDeal) && S.shop.some(o => /[LX]/.test(CARD[o.id].rarity)))
            setTimeout(() => toast(S.shop.some(o => CARD[o.id].rarity === 'X') ? '議会に、伝説の案が届いている。' : '議会に、珍しい案が届いている。', 'unlock'), 400);
        const tab = ui.ptab || 'cards';
        const full = S.facilities.length >= S.facSlots;
        const pend = P.pendingStamp != null ? S.stampShop[P.pendingStamp] : null;
        let body = '';
        if (tab === 'cards') {
            body = `<div class="sec-head"><span>提出された対策案</span><span class="sh-r"><span class="dim">持っているカードを承認すると、新しく増えずに強化される(1枚につき1回)</span><button data-act="reroll" ${S.funds >= P.rerollCost ? '' : 'disabled'}>差し替える ${P.rerollCost}</button></span></div>
      <div class="cards">${S.shop.map((o, i) => {
                const t = E.mergeTarget(S, o.id);
                return cardHTML(o.id, { cls: (o.sold ? 'sold ' : '') + (deal ? 'deal' : ''), style: deal ? `animation-delay:${i * 80}ms` : '', region: E.RG.findIndex(r => r.key === CARD[o.id].region),
                    foot: o.sold ? '<div class="c-foot">承認済み</div>' : `<button class="c-foot ${t ? 'merge' : ''}" data-act="buy" data-i="${i}" ${S.funds >= o.price ? '' : 'disabled'}>${t ? `重ねて強化 ${o.price}` : `承認する ${o.price}`}</button>` });
            }).join('')}</div>`;
        }
        else if (tab === 'fac') {
            body = `<div class="sec-head"><span>施設の誘致</span><span class="sh-r"><button data-act="rerollfac" ${S.funds >= P.facReroll ? '' : 'disabled'}>差し替える ${P.facReroll}</button></span></div>
      <div class="facs">${S.facShop.map((o, i) => facHTML(o.id, { cls: (o.sold ? 'sold ' : '') + (fdeal ? 'deal' : ''), foot: o.sold ? '<div class="f-foot">建設済み</div>' : `<button class="f-foot" data-act="buyfac" data-i="${i}" ${S.funds >= o.price && !full ? '' : 'disabled'}>${full ? '空き地がない' : `建てる ${o.price}`}</button>` })).join('') || '<div class="dim">候補がない</div>'}</div>
      <div class="sec-sub">建っている施設 ${S.facilities.length}/${S.facSlots}</div>
      <div class="facs mine">${S.facilities.map(f => facHTML(f, { foot: `<button class="f-foot" data-act="sellfac" data-i="${f.uid}">取り壊す +${Math.floor(E.FAC[f.id].price / 2)}</button>` })).join('') || '<div class="dim">まだ何も建っていない</div>'}</div>`;
        }
        else if (tab === 'stamp') {
            body = `<div class="sec-head"><span>調印</span><span class="sh-r"><span class="dim">${P.stamped ? 'この議会ではもう押した' : '1回の議会で1枚だけ押せる。押し直すと前の印は消える'}</span><button data-act="rerollstamp" ${!P.stamped && S.funds >= P.stampReroll ? '' : 'disabled'}>差し替える ${P.stampReroll}</button>${pend ? '<button data-act="stampcancel">やめる</button>' : ''}</span></div>
      <div class="stamps">${S.stampShop.map((o, i) => `<div class="stampoffer ${o.sold ? 'sold' : ''} ${P.pendingStamp === i ? 'on' : ''} ${sdeal ? 'deal' : ''}">${sealHTML(o.id, true)}<div class="so-body"><div class="so-name">${esc(E.STAMP[o.id].name)}</div><div class="so-eff">${esc(E.STAMP[o.id].effect)}</div>
        ${o.sold ? '<div class="so-foot">押した</div>' : `<button data-act="stamp" data-i="${i}" ${!P.stamped && S.funds >= o.price ? '' : 'disabled'}>${P.pendingStamp === i ? '押すカードを「手持ち」で選ぶ' : `選ぶ ${o.price}`}</button>`}</div></div>`).join('')}</div>`;
        }
        else {
            body = `<div class="sec-head"><span>手持ちの制度 ${S.deck.length}枚</span>${pend ? `<span class="pend">${esc(E.STAMP[pend.id].name)}を押すカードを選ぶ</span>` : `<span class="dim">廃止にかかる資金は、廃止するたびに上がっていく</span>`}</div>
      <div class="cards small">${S.deck.map(inst => cardHTML(inst.id, { lv: inst.lv, uid: pend ? inst.uid : null, iuid: inst.uid, region: inst.region, stamp: inst.stamp, bb: inst.g.bb, counter: counterText(inst), cls: pend ? 'stamp-target' : '', act: pend ? 'applystamp' : null,
                foot: pend ? `<div class="c-foot seal-here">ここに${esc(E.STAMP[pend.id].name)}を押す</div>` : `<div class="c-btns"><button data-act="sell" data-uid="${inst.uid}" ${S.deck.length > 5 && S.funds >= E.sellValue(S, inst) ? '' : 'disabled'}>廃止する ${E.sellValue(S, inst)}</button></div>` })).join('')}</div>`;
        }
        const tabs = [['cards', `対策案 ${S.shop.filter(o => !o.sold).length}`], ['fac', `施設 ${S.facilities.length}/${S.facSlots}`], ['stamp', P.stamped ? '調印 済' : '調印'], ['deck', `手持ち ${S.deck.length}`]]
            .map(([k, l]) => `<button class="ptab ${tab === k ? 'on' : ''}" data-act="ptab" data-k="${k}">${esc(l)}</button>`).join('');
        return `
  <div class="parl">
    <div class="p-head"><div class="ornament"></div><h2 class="s-title">議会</h2><p>${esc(E.roundLabel(S))}に向けて。${esc(nextTxt)}</p>${reveal}</div>
    <div class="ptabs">${tabs}</div>
    <section class="shopsec pbody">${body}</section>
    <div class="actions pbar">
      <button data-act="return" ${S.funds >= E.returnCost(S) && E.Ceff(S) > 0 ? '' : 'disabled'}>権限を地方に返す ${E.returnCost(S)}</button>
      <button data-act="buyoffer" ${(S.offerPlus || 0) < E.OFFER_CAP && S.funds >= E.offerCost(S) ? '' : 'disabled'}>${(S.offerPlus || 0) < E.OFFER_CAP ? `対策案の枠を増やす ${E.offerCost(S)}` : '対策案の枠は最大'}</button>
      <button data-act="buyslot" ${S.facSlots < E.SLOT_CAP && S.funds >= E.slotCost(S) ? '' : 'disabled'}>${S.facSlots < E.SLOT_CAP ? `用地を広げる ${E.slotCost(S)}` : '用地は最大'}</button>
      <button class="primary" data-act="leave" ${S.event && !S.event.resolved ? 'disabled' : ''}>議会を閉じる</button>
    </div>
  </div>`;
    }
    const SEAL_ICON = {
        gold: '<path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13zM6.3 6.3h3.4v3.4H6.3z"/>',
        red: '<path d="M6.5 2h3v4.5H14v3H9.5V14h-3V9.5H2v-3h4.5z"/>',
        blue: '<path d="M8 1.5l5 5h-3V9H6V6.5H3zM3 11h10v3H3z"/>',
        foundation: '<path d="M2 11h12v3H2zM3 7h10v3H3zM4.5 3h7v3h-7z"/>',
        iron: '<path d="M3.2 1.5L8 6.3l4.8-4.8 1.7 1.7L9.7 8l4.8 4.8-1.7 1.7L8 9.7l-4.8 4.8-1.7-1.7L6.3 8 1.5 3.2z"/>',
        twin: '<path fill-rule="evenodd" d="M6 3a5 5 0 1 1 0 10A5 5 0 0 1 6 3zm0 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM10 3a5 5 0 1 1 0 10a5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6z"/>',
        bond: '<path fill-rule="evenodd" d="M1.5 8a3.5 3.5 0 0 1 3.5-3.5h3v2H5a1.5 1.5 0 0 0 0 3h3v2H5A3.5 3.5 0 0 1 1.5 8zM8 4.5h3a3.5 3.5 0 0 1 0 7H8v-2h3a1.5 1.5 0 0 0 0-3H8zM5.5 7h5v2h-5z"/>',
        people: '<path d="M8 1.5a3 3 0 1 1 0 6a3 3 0 0 1 0-6zM2.5 14.5c0-3.5 2.5-5.5 5.5-5.5s5.5 2 5.5 5.5z"/>',
        far: '<path d="M1 8l4-4v2.5h6V4l4 4-4 4V9.5H5V12z"/>',
        old: '<path d="M3 1.5h10v2l-3.5 4.5 3.5 4.5v2H3v-2l3.5-4.5L3 3.5zM5.5 3.5L8 6.5l2.5-3zM5 13h6l-3-3.5z"/>',
        shadow: '<path fill-rule="evenodd" d="M2 2.5h7v11H2zM3.5 4v8h4V4zM10.5 6.5h2V4l3 4-3 4V9.5h-2z"/>',
        glass: '<path fill-rule="evenodd" d="M8 1l5.5 7L8 15 2.5 8zM8 4l-1.2 3 2.2 1.5-1.5 3.5L10 8.3 7.9 7z"/>',
        lucky: '<path d="M8 1l1.9 4.6 4.9.4-3.7 3.2 1.1 4.8L8 11.5 3.8 14l1.1-4.8L1.2 6l4.9-.4z"/>',
    };
    function sealHTML(id, big) {
        const t = E.STAMP[id];
        if (!t)
            return '';
        const ic = SEAL_ICON[id] ? `<svg viewBox="0 0 16 16" aria-hidden="true">${SEAL_ICON[id]}</svg>` : esc(t.name.charAt(0));
        return `<span class="seal seal-${id} ${big ? 'big' : ''}" title="${esc(t.name + ':' + t.effect)}">${ic}</span>`;
    }
    function zukanList() {
        const f = ui.zukan || (ui.zukan = { region: '', rarity: '', q: '' });
        const list = E.D.cards.filter(c => (!f.region || c.region === f.region) && (!f.rarity || c.rarity === f.rarity) && (!f.q || ((meta.sandbox || (meta.seen || {})[c.id]) && (c.name + c.effect).includes(f.q))));
        const seen = meta.seen || {};
        const cards = list.map(c => {
            if (!meta.sandbox && !seen[c.id])
                return `<div class="zitem unseen"><div class="card zback"><div class="zq">？</div></div></div>`;
            const locked = !E.cardUnlocked(meta, c.id);
            const rgn = E.RG.find(r => r.key === c.region);
            return `<div class="zitem ${locked ? 'locked' : ''}">${cardHTML(c.id, { region: null, foot: `<div class="ztags">${rgn ? `<span class="ztag r" style="--rc:${rgn.color}">${esc(rgn.name)}</span>` : ''}${locked && c.unlock ? `<span class="ztag u">${esc(c.unlock.condition)}</span>` : ''}</div>` })}</div>`;
        }).join('');
        return { n: list.length, seen: list.filter(c => meta.sandbox || seen[c.id]).length, html: cards || '<p class="dim">該当するカードがない。</p>' };
    }
    function zukanHTML() {
        const f = ui.zukan || (ui.zukan = { region: '', rarity: '', q: '' });
        const L = zukanList();
        const opt = (arr, cur) => arr.map(([v, l]) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`).join('');
        return `<h3>カード図鑑 <span class="dim" id="zcount">出会った制度 ${L.seen} / ${L.n}枚</span></h3>
    <div class="zfilter">
      <select data-act="zf" data-k="region">${opt([['', 'すべての地方']].concat(E.RG.map(r => [r.key, r.name])), f.region)}</select>
      <select data-act="zf" data-k="rarity">${opt([['', 'すべてのレア'], ['C', 'コモン'], ['U', 'アンコモン'], ['R', 'レア'], ['L', 'エピック'], ['X', 'レジェンド']], f.rarity)}</select>
      <input data-act="zq" placeholder="名前や効果で探す" value="${esc(f.q)}">
    </div>
    <div class="zgrid" id="zgrid">${L.html}</div>
    <div class="m-btns"><button data-act="close">閉じる</button></div>`;
    }
    function showZukan() { modal(zukanHTML(), 'wide zukan'); }
    function showDev() {
        const I = E.devInfo(S);
        const dis = ['長い冬'].concat(E.D.disasters.normal.map(d => d.name), E.D.disasters.boss.map(d => d.name), E.D.disasters.endless.map(d => d.name));
        const opt = (arr, f) => arr.map(x => `<option value="${esc(f ? f(x)[0] : x)}">${esc(f ? f(x)[1] : x)}</option>`).join('');
        modal(`<h3>開発モード</h3>
    <p class="dim">不穏度 ${I.U} ・ 臨界 ${I.critical ? 'あり(残り' + I.countdown + ')' : 'なし'} ・ 宣言 ${I.declCount}回 ・ 抵抗 ${I.resist} ・ 加速 ${I.accel} ・ 無敵 ${I.invincible ? 'オン' : 'オフ'}</p>
    <div class="dev">
      <div class="dv-row"><label>集権度<input id="dv-C" value="${Math.round(S.C)}"></label><label>不穏度<input id="dv-U" value="${I.U}"></label><label>議会資金<input id="dv-funds" value="${S.funds}"></label><label>必要対策値の倍率<input id="dv-reqMul" value="${S.reqMul}"></label><label>臨界の残り<input id="dv-countdown" value="${I.countdown || ''}"></label><button data-act="devapply">反映</button></div>
      <div class="dv-row"><label>災害<select id="dv-dis">${opt(dis)}</select></label><button data-act="devdis">今の(または次の)災害にする</button></div>
      <div class="dv-row"><label>時代<input id="dv-era" value="${S.era}"></label><label>位置(0,1,2=ボス)<input id="dv-rie" value="${S.rie}"></label><button data-act="devjump">移動して議会へ</button></div>
      <div class="dv-row"><label>カード<select id="dv-card">${opt(E.D.cards, c => [c.id, c.name + '(' + c.rarity + ')'])}</select></label><label>強化<input id="dv-lv" value="0"></label><button data-act="devcard">加える</button></div>
      <div class="dv-row"><label>施設<select id="dv-fac">${opt(E.D.facilities, f => [f.id, f.name])}</select></label><button data-act="devfac">建てる</button></div>
      <div class="dv-row btns">${[['heal', '地方を全回復'], ['trustUp', '信頼+2'], ['trustDown', '信頼-2'], ['relUp', '関係値すべて+1'], ['relDown', '関係値すべて-1'], ['critical', '臨界にする'], ['invincible', '無敵を切り替え'], ['refill', '手番と引き直し+1'], ['redraw', '手札を配り直す'], ['upgradeAll', '全カードを最大強化'], ['win', 'このラウンドを勝ちにする'], ['lose', 'このラウンドを負けにする']].map(b => `<button data-act="devact" data-c="${b[0]}">${b[1]}</button>`).join('')}</div>
    </div>
    <div class="m-btns"><button data-act="close">閉じる</button></div>`, 'wide');
    }
    function afterRender() {
        if (S.phase === 'round' && S.R.backerPending) {
            const cut = E.owned(S, 'cut_strings');
            modal(`<h3>背後の部屋から</h3><p>背後の勢力が、緊急事態宣言を出すよう求めている。</p>
      <div class="m-btns"><button data-act="backer" data-c="ride">乗る</button><button data-act="backer" data-c="stop">止める</button>${cut ? '<button data-act="backer" data-c="cut">糸を切る</button>' : ''}</div>`);
        }
        else if (S.phase === 'parliament' && S.event && !S.event.resolved) {
            const e = S.event;
            modal(`<h3>${esc(e.title)}</h3><p>${esc(e.text)}</p>${e.detail ? `<p class="detail">${esc(e.detail)}</p>` : ''}${e.truth ? `<p class="truth">査読:${esc(e.truth)}</p>` : ''}
      <div class="m-btns">${e.choices.map((c, i) => `<button data-act="event" data-i="${i}">${esc(c)}</button>`).join('')}</div>`);
        }
        else if ((S.phase === 'result' || S.phase === 'winter' || S.phase === 'over' || S.phase === 'clear') && ui.resultDelay) {
            ui.resultDelay = false;
            const ph = S.phase, keep = S, rn = S.roundNo;
            ui.resultWait = rn;
            setTimeout(() => { if (S === keep && S.phase === ph && ui.resultWait === rn) {
                ui.resultWait = null;
                ui.fx = {};
                render();
            } }, 900);
        }
        else if (false) {
            const R = S.R;
            modal(`<h3>${R.success ? '乗り切った' : '抑えきれなかった'}</h3>
      <p>${esc(R.d.name)} ・ 対策値 ${fmt(R.total)} / ${fmt(R.req)}${R.coin ? ` ・ コインは${R.coin}` : ''}</p>
      ${R.dmg ? `<p class="bad">被害 ${R.dmg}</p>` : ''}
      <p>議会資金 +${R.income || 0}</p>
      <div class="m-btns">${E.canRevise(S) ? '<button data-act="revise">修正する</button>' : ''}<button class="primary" data-act="next">${S.phase === 'winter' ? '冬は続く' : S.pendingReward ? '報酬へ' : '議会へ'}</button></div>`, R.success ? 'ok' : 'ng');
        }
        else if ((S.phase === 'over' || S.phase === 'clear') && !ui.endPeek)
            renderEnding();
        else if ((S.phase === 'over' || S.phase === 'clear') && ui.endPeek) {
            const b = document.getElementById && document.getElementById('peekbar');
            if (!b && document.createElement) { }
        }
        else if (ui.modal === 'chron')
            showChron();
        else if (ui.modal === 'deck')
            showDeck();
        else if (ui.modal === 'help')
            showHelp();
        else if (ui.modal === 'dev')
            showDev();
        else if (ui.modal === 'zukan')
            showZukan();
    }
    function showRoundLog() {
        const R = S.R;
        if (!R)
            return;
        const rows = (R.results || []).map((res, i) => `<div class="rl-play"><div class="rl-h">${i + 1}手目 ・ ${fmt(res.P)} × ${res.M} = <b>${fmt(res.score)}</b></div><div class="rl-steps">${stepsSummary(res.steps)}</div></div>`).join('') || '<p class="dim">このラウンドはまだ手を出していない。</p>';
        modal(`<h3>${esc(R.d.name)} の手</h3><div class="roundlog">${rows}</div><div class="m-btns"><button data-act="close">閉じる</button></div>`, 'wide');
    }
    function chronHTML(hideSecret) {
        return `<ol class="chron">${S.chron.filter(c => !hideSecret || (c.kind !== 'critical' && !c.text.includes('報告は上がらなかった'))).map(c => {
            if (c.kind === 'critical')
                return `<li class="critical"><span class="cl">${esc(c.label)}</span><span>この時点で、もう引き返せなかった</span></li>`;
            const tag = c.kind === 'omen1' ? '<span class="ctag">最初の前兆</span>' : c.kind === 'omen' ? '<span class="ctag light">前兆</span>' : c.kind === 'decl' ? '<span class="ctag decl">宣言</span>' : '';
            return `<li class="k-${c.kind}"><span class="cl">${esc(c.label)}</span>${tag}<span>${esc(c.text)}</span></li>`;
        }).join('')}</ol>`;
    }
    function reviewChart() {
        const H = S.hist || [];
        if (!H.length)
            return '<p class="dim">記録されたラウンドがない。</p>';
        const W = 760, Ht = 200, pad = 28, n = H.length, xs = i => pad + (W - pad * 2) * (n === 1 ? .5 : i / (n - 1));
        const y = v => Ht - pad - (Ht - pad * 2) * Math.max(0, Math.min(100, v)) / 100;
        const line = k => H.map((h, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${y(h[k]).toFixed(1)}`).join(' ');
        const bw = Math.max(3, (W - pad * 2) / Math.max(n, 1) * .55);
        const bars = H.map((h, i) => {
            const r = Math.log10(Math.max(1e-3, h.total / Math.max(1, h.req)));
            const hh = Math.min(60, Math.abs(r) * 40 + 4);
            return `<rect x="${(xs(i) - bw / 2).toFixed(1)}" y="${(h.ok ? Ht - pad - hh : Ht - pad).toFixed(1)}" width="${bw.toFixed(1)}" height="${hh.toFixed(1)}" class="${h.ok ? 'ok' : 'ng'}${h.boss ? ' boss' : ''}"><title>${esc(h.label)} ${esc(h.d)}:${fmt(h.total)} / ${fmt(h.req)}</title></rect>`;
        }).join('');
        const eras = H.map((h, i) => i && h.era !== H[i - 1].era ? `<line x1="${xs(i) - 4}" x2="${xs(i) - 4}" y1="${pad - 6}" y2="${Ht - pad}" class="era"/><text x="${xs(i)}" y="${pad - 10}" class="et">第${h.era}時代</text>` : '').join('');
        return `<svg class="rv-chart" viewBox="0 0 ${W} ${Ht}" preserveAspectRatio="none">
    <line x1="${pad}" x2="${W - pad}" y1="${Ht - pad}" y2="${Ht - pad}" class="axis"/>${eras}${bars}
    <path d="${line('C')}" class="lc"/><path d="${line('U')}" class="lu"/></svg>
    <div class="rv-legend"><span class="k c">集権度</span><span class="k u">不穏度</span><span class="k b">乗り切った手の余裕</span><span class="k n">届かなかった</span></div>`;
    }
    function renderReview() {
        if (document.body)
            document.body.className = 'bg-review' + (meta.crt === false ? '' : ' crt');
        setBgTheme('parl');
        const st = S.stats || {}, H = S.hist || [];
        const won = H.filter(h => h.ok).length, e = S.ending || { title: '' };
        const tiles = [
            ['乗り切った災害', `${won} / ${H.length}`], ['到達', `第${S.era}時代${S.endless ? '(エンドレス)' : ''}`], ['スコア', fmt(S.score || 0)],
            ['緊急事態宣言', `${S.declCount}回`], ['最長の連鎖', `${st.maxChain || 0}`], ['もう一度の発動', `${st.retrigTotal || 0}回`],
            ['削った信頼', `${st.trustTaken || 0}`], ['受けた被害', `${st.damageTaken || 0}`], ['使った資金', `${fmt(S.spentTotal || 0)}`],
            ['廃止した制度', `${st.removals || 0}枚`], ['強化した制度', `${S.deck.filter(c => c.lv).length}枚`], ['権限の返還', `${st.returns || 0}回`],
        ].map(([k, v], i) => `<div class="rv-tile" style="animation-delay:${.3 + i * .06}s"><div class="rv-k">${esc(k)}</div><div class="rv-v">${esc(v)}</div></div>`).join('');
        const bh = st.bestHand;
        const best = bh ? `<div class="rv-best"><div class="rv-bh">${esc(bh.label)} ・ ${esc(bh.dname)} ・ <b>${fmt(bh.score)}</b></div><div class="cards small">${bh.cards.map(id => CARD[id] ? cardHTML(id, {}) : '').join('')}</div></div>` : '<p class="dim">手を出す前に終わった。</p>';
        const used = Object.entries(st.playCount || {}).sort((a, b) => b[1] - a[1]).slice(0, 6)
            .map(([id, n], i) => `<div class="rv-used" style="animation-delay:${.5 + i * .07}s">${CARD[id] ? cardHTML(id, {}) : ''}<div class="rv-n">${n}回</div></div>`).join('') || '<p class="dim">なし</p>';
        const facs = (S.facilities || []).map(f => E.FAC[f.id] ? esc(E.FAC[f.id].name) : '').filter(Boolean).join('、') || 'なし';
        const abs = (S.abilities || []).map(a => ABILITIES[a] ? esc(ABILITIES[a].name) : '').filter(Boolean).join('、') || 'なし';
        $('#app').innerHTML = `<div class="review">
    <div class="rv-head"><div class="rv-kicker">振り返り</div><h1>${esc(S.nation)}</h1><div class="rv-sub">${esc(S.leader)} ・ ${esc(CHAR[S.charId] ? CHAR[S.charId].name : '')} ・ ${esc(e.title || '')}</div></div>
    <section class="rv-sec"><h2>国の歩み</h2>${reviewChart()}</section>
    <section class="rv-sec"><h2>数字</h2><div class="rv-tiles">${tiles}</div></section>
    <section class="rv-sec rv-two"><div><h2>最高の一手</h2>${best}</div><div><h2>よく使った制度</h2><div class="rv-useds">${used}</div></div></section>
    <section class="rv-sec"><h2>年表</h2>${chronHTML(false)}</section>
    <section class="rv-sec"><h2>最後の持ち札 ${S.deck.length}枚</h2><p class="rv-line">施設:${facs}</p>
      <div class="cards small">${S.deck.map(inst => cardHTML(inst.id, { lv: inst.lv, iuid: inst.uid, region: inst.region, stamp: inst.stamp, bb: inst.g.bb })).join('')}</div></section>
    <div class="actions rv-bar">${S.phase === 'clear' ? '<button class="primary" data-act="endless">エンドレスへ進む</button>' : ''}<button ${S.phase === 'clear' ? '' : 'class="primary"'} data-act="totitle-end">タイトルへ</button></div>
  </div><div id="modal" class="modal"></div>`;
    }
    function renderEnding() {
        const e = S.ending;
        const coupEnd = S.over === 'coup';
        modal(`<div class="ending"><div class="e-mark">${titleMark(coupEnd)}</div><div class="e-nation">${esc(S.nation)} ・ ${esc(S.leader)}</div><h2>${esc(e.title)}</h2>${e.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}
    <div class="e-stats">到達 第${S.era}時代 ・ スコア ${fmt(S.score)} ・ 集権度 ${Math.round(S.C)} ・ 宣言 ${S.declCount}回</div>
    <h3>年表</h3>${chronHTML(false)}
    <div class="m-btns"><button data-act="peek">盤面を見る</button><button data-act="roundlog">最後のラウンドの手を見る</button><button class="primary" data-act="review">このランを振り返る</button></div></div>`, 'wide end');
    }
    function showChron() { modal(`<h3>年表</h3>${S.chron.length ? chronHTML(true) : '<p>まだ何も記されていない。</p>'}<div class="m-btns"><button data-act="close">閉じる</button></div>`, 'wide'); }
    function showDeck() {
        const cards = S.deck.map(inst => cardHTML(inst.id, { lv: inst.lv, region: inst.region, stamp: inst.stamp, bb: inst.g.bb, held: inst.g.held, counter: counterText(inst) })).join('');
        modal(`<h3>手持ちの制度 ${S.deck.length}枚</h3><div class="cards small">${cards}</div><div class="m-btns"><button data-act="close">閉じる</button></div>`, 'wide');
    }
    const HELP = `<h3>遊び方</h3><div class="help">
  <p>一つの時代は通常ラウンド2回とボス1回。ラウンドごとに災害が来るので、必要対策値まで対策値を積めば乗り切り。届かなければ地方が傷つき、地方の半数が壊滅すると国が終わる。</p>
  <p>手札(画面下に扇形に並ぶ。カーソルを当てると大きく見える)からカードを選んで「出す」。対策値は 対応力 × 倍率。どのカードにも丸印の基礎対応力があり、効果欄の条件が揃うとそこに対応力や倍率が上乗せされる。出したカードは選んだ順に一枚ずつ発動し、対応力と倍率が積み上がっていく(発動中にクリックすると早送り)。1ラウンドの手番は4回、引き直しは3回。1手に出せる枚数は集権度で増える。</p>
  <p>カードはそれぞれ出身の地方を持つ。地方には性格と特性があり、地図の地方にカーソルを当てると分かる。左の図は地方どうしの関係値で、関係の良い地方のカードを一緒に出すと倍率が上がり、悪いと下がる。同じ地方のカード同士も少し上がる。関係値5以上の組の数が「協力関係」。関係値に上限はない。二地方が近づくと、ほかの地方は面白く思わず関係が冷える。関係は放っておくと、離れているほど強く元の距離感へ戻る。山札が尽きたら捨て札を切り直して戻す。</p>
  <p>議会では施設を建てられる。施設は持っているだけで働き、カードが発動するたび、または手の終わりに効果を足す。持てる数は最初3つで、用地を広げると増える。</p>
  <p>「中央」のカードは集権度が高いほど、「地方」のカードは地方の信頼が高いほど強い。</p>
  <p>緊急事態宣言は、そのラウンドの倍率を大きく上げる。</p>
  <p>ラウンドのあとは議会。資金でカードを承認する。持っているカードをもう一度承認すると、そのカードが強化される。権限を地方に返すこともできる。ボスを越えると、能力かエピックのカードを一つ得る。</p>
  <p>第8時代のボスは最終災害「長い冬」。越えれば本編クリアで、その先はエンドレス。</p>
  <p>進行は自動で保存され、タイトルの「つづきから」で再開できる。</p></div>`;
    function showHelp() { modal(HELP + '<div class="m-btns"><button data-act="close">閉じる</button></div>', 'wide'); }
    function showRecords() {
        const h = (meta.history || []).slice().reverse().map(r => `<tr><td>${esc(r.nation)}</td><td>${esc(r.leader)}</td><td>${esc(CHAR[r.char] ? CHAR[r.char].name : '')}</td><td>第${r.era}時代${r.endless ? '(エンドレス)' : ''}</td><td>${{ coup: 'クーデター', collapse: '壊滅', clear: '本編クリア', clearCritical: '冬の後の政変' }[r.end] || ''}</td><td class="num">${fmt(r.score)}</td></tr>`).join('');
        const nc = E.D.characters.filter(c => E.charUnlocked(meta, c.id)).length;
        const nk = E.D.cards.filter(c => c.unlock && E.cardUnlocked(meta, c.id)).length;
        modal(`<h3>記録</h3><p>最高到達 第${meta.best.era || 1}時代 ・ 最高スコア ${fmt(meta.best.score || 0)} ・ 就任 ${meta.runs || 0}回</p>
    <p>解放した人物 ${nc} / ${E.D.characters.length} ・ 解放したカード ${nk} / ${E.D.cards.filter(c => c.unlock).length}</p>
    ${h ? `<table class="rec"><tr><th>国</th><th>指導者</th><th>人物</th><th>到達</th><th>結末</th><th>スコア</th></tr>${h}</table>` : '<p class="dim">まだ記録がない。</p>'}
    <div class="m-btns"><button data-act="close">閉じる</button></div>`, 'wide');
    }
    function showSettings() {
        modal(`<h3>設定</h3>
    <p><label><input type="checkbox" data-act="sandbox" ${meta.sandbox ? 'checked' : ''}> サンドボックス(すべての人物とカードが使え、ゲーム中に数値の変更や災害の指定ができる。記録と解放は進まない。次に始めるランから)</label></p>
    <p><label><input type="checkbox" data-act="crt" ${meta.crt === false ? '' : 'checked'}> ブラウン管の効果(走査線と画面のにじみ)</label></p>
    <p><label><input type="checkbox" data-act="bgmoff" ${meta.bgmOff ? '' : 'checked'}> 曲を流す</label></p>
    <p><label>曲の音量 <input type="range" data-act="bgmvol" min="0" max="100" value="${Math.round(bgmVol() * 100)}"></label></p>
    <p><button data-act="resetmeta">記録と解放状況を消す</button></p>
    <div class="m-btns"><button data-act="close">閉じる</button></div>`);
    }
    const BGM = { ctx: null, gain: null, buf: {}, cur: null, src: null, g: null, want: null, loading: {} };
    function bgmVol() { return meta.bgmVol == null ? 0.7 : meta.bgmVol; }
    function bgmInit() {
        if (BGM.ctx || !window.MUSIC || !(window.AudioContext || window.webkitAudioContext))
            return;
        try {
            BGM.ctx = new (window.AudioContext || window.webkitAudioContext)();
            BGM.gain = BGM.ctx.createGain();
            BGM.gain.gain.value = bgmVol();
            BGM.gain.connect(BGM.ctx.destination);
        }
        catch (e) {
            BGM.ctx = null;
        }
    }
    function bgmLoad(name) {
        if (BGM.buf[name] || BGM.loading[name] || !window.MUSIC || !MUSIC[name])
            return Promise.resolve(BGM.buf[name]);
        const bin = atob(MUSIC[name].data), arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++)
            arr[i] = bin.charCodeAt(i);
        BGM.loading[name] = new Promise(res => BGM.ctx.decodeAudioData(arr.buffer, b => { BGM.buf[name] = b; res(b); }, () => res(null)));
        return BGM.loading[name];
    }
    function bgmPlay(name) {
        BGM.want = name;
        if (!BGM.ctx || BGM.cur === name)
            return;
        bgmLoad(name).then(b => {
            if (!b || BGM.want !== name || BGM.cur === name)
                return;
            const t = BGM.ctx.currentTime, m = MUSIC[name];
            if (BGM.src) {
                const old = BGM.src, og = BGM.g;
                og.gain.setValueAtTime(og.gain.value, t);
                og.gain.linearRampToValueAtTime(0, t + 0.8);
                old.stop(t + 0.85);
            }
            const src = BGM.ctx.createBufferSource(), g = BGM.ctx.createGain();
            src.buffer = b;
            src.loop = true;
            src.loopStart = m.loopStart;
            src.loopEnd = Math.min(m.loopEnd, b.duration);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(1, t + 0.6);
            src.connect(g);
            g.connect(BGM.gain);
            src.start(t);
            BGM.src = src;
            BGM.g = g;
            BGM.cur = name;
        });
    }
    function bgmScene() {
        if (ui.view === 'review')
            return 'review';
        if (ui.view !== 'game' || !S)
            return 'title';
        if (S.phase === 'over' || S.phase === 'clear')
            return 'ending';
        if (S.phase === 'parliament' || S.phase === 'reward' || S.phase === 'draft')
            return 'parliament';
        const d = S.R && S.R.d;
        if (d && (d.winter || (S.endless && d.boss)))
            return 'winter';
        if (d && d.boss)
            return 'boss';
        return 'round';
    }
    function bgmUpdate() { if (meta.bgmOff)
        return; bgmInit(); if (BGM.ctx && BGM.ctx.state === 'suspended')
        BGM.ctx.resume(); bgmPlay(bgmScene()); }
    function bgmSetVol(v) { meta.bgmVol = v; E.saveMeta(meta); if (BGM.gain)
        BGM.gain.gain.setTargetAtTime(meta.bgmOff ? 0 : v, BGM.ctx.currentTime, 0.05); }
    const BG_PAL = {
        title: [[29, 25, 21], [77, 23, 18], [28, 68, 68], [122, 42, 36], [47, 107, 107], [201, 154, 58]],
        parl: [[36, 28, 20], [70, 52, 32], [106, 78, 46], [138, 104, 60], [172, 134, 78], [205, 170, 110]],
        reward: [[40, 30, 12], [90, 66, 20], [140, 104, 34], [180, 140, 52], [214, 178, 84], [240, 214, 140]],
        draft: [[30, 28, 26], [52, 48, 42], [76, 70, 60], [102, 94, 80], [130, 120, 100], [160, 148, 124]],
        neutral: [[26, 30, 34], [40, 48, 54], [56, 68, 74], [76, 90, 96], [98, 112, 116], [124, 136, 138]],
        quake: [[34, 26, 18], [62, 46, 30], [92, 68, 44], [120, 92, 60], [150, 118, 80], [176, 146, 104]],
        flood: [[12, 24, 40], [20, 42, 66], [32, 64, 94], [48, 88, 120], [72, 114, 146], [104, 146, 170]],
        tsunami: [[8, 30, 34], [14, 52, 58], [22, 78, 84], [36, 104, 108], [60, 132, 132], [100, 164, 160]],
        drought: [[50, 26, 10], [92, 48, 16], [132, 72, 24], [170, 102, 38], [204, 138, 58], [230, 176, 96]],
        plague: [[22, 28, 18], [38, 50, 30], [56, 72, 42], [76, 94, 56], [100, 116, 72], [128, 140, 94]],
        eruption: [[30, 10, 8], [64, 18, 12], [104, 30, 16], [148, 50, 22], [190, 84, 30], [226, 132, 48]],
        fire: [[34, 12, 6], [76, 22, 10], [120, 40, 14], [164, 68, 20], [206, 108, 32], [238, 160, 60]],
        nuclear: [[20, 26, 10], [40, 52, 16], [62, 80, 22], [90, 110, 28], [124, 144, 40], [168, 184, 64]],
        finance: [[22, 22, 24], [40, 40, 44], [60, 60, 64], [84, 84, 88], [112, 112, 114], [146, 146, 146]],
        blackout: [[6, 6, 8], [14, 14, 18], [24, 24, 30], [36, 36, 44], [52, 52, 62], [80, 80, 92]],
        chemical: [[26, 14, 34], [48, 24, 62], [72, 36, 92], [98, 52, 120], [128, 76, 148], [164, 110, 176]],
        riot: [[34, 10, 8], [70, 18, 12], [112, 30, 18], [158, 50, 24], [200, 82, 32], [232, 126, 52]],
        schism: [[28, 22, 30], [50, 36, 50], [76, 52, 70], [104, 70, 88], [134, 92, 106], [168, 122, 130]],
        conspiracy: [[8, 8, 10], [18, 16, 22], [30, 26, 36], [44, 38, 52], [62, 52, 70], [86, 72, 92]],
        strike: [[30, 28, 24], [52, 48, 40], [76, 70, 58], [100, 92, 76], [128, 118, 96], [156, 146, 120]],
        winter: [[18, 28, 42], [34, 52, 74], [56, 80, 108], [86, 112, 140], [124, 150, 176], [170, 194, 214]],
        asteroid: [[6, 4, 12], [16, 10, 30], [32, 18, 52], [56, 30, 76], [90, 46, 96], [140, 70, 110]]
    };
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const BGS = { pal: BG_PAL.title, t: 0, last: 0, speed: 1 };
    function bgLoop(ts) {
        const cv = document.getElementById && document.getElementById('bgcv');
        if (!cv || !cv.getContext)
            return;
        if (ts - BGS.last > 66) {
            BGS.last = ts;
            BGS.t += 0.05 * BGS.speed;
            const W = cv.width, H = cv.height, g = BGS.ctx || (BGS.ctx = cv.getContext('2d')), img = BGS.img || (BGS.img = g.createImageData(W, H)), d = img.data, pal = BGS.pal, n = pal.length, t = BGS.t;
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    const dx = (x - W / 2) / H, dy = (y - H / 2) / H, r = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx);
                    let v = Math.sin(r * 9 - t * 1.3 + a * 3 + Math.sin(r * 4 + t * 0.7) * 2) * 0.5 + Math.sin(dx * 5 + t * 0.6) * 0.25 + Math.cos(dy * 6 - t * 0.4) * 0.25;
                    v = (v + 1) / 2 * (n - 1) + (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5);
                    const c = pal[Math.max(0, Math.min(n - 1, Math.round(v)))], i = (y * W + x) * 4;
                    d[i] = c[0];
                    d[i + 1] = c[1];
                    d[i + 2] = c[2];
                    d[i + 3] = 255;
                }
            g.putImageData(img, 0, 0);
        }
        (window.requestAnimationFrame || (f => setTimeout(() => f(Date.now()), 66)))(bgLoop);
    }
    function setBgTheme(k) { BGS.pal = BG_PAL[k] || BG_PAL.neutral; BGS.speed = /riot|eruption|fire|asteroid/.test(k) ? 2.2 : /blackout|conspiracy/.test(k) ? 0.5 : 1; }
    function toast(text, kind) {
        const box = document.getElementById && document.getElementById('toasts');
        if (!box || !document.createElement)
            return;
        const t = document.createElement('div');
        t.className = 'toast ' + (kind || '');
        t.textContent = text;
        box.appendChild(t);
        while (box.children.length > 5)
            box.removeChild(box.firstChild);
        setTimeout(() => { t.classList.add('out'); setTimeout(() => { if (t.parentNode)
            t.parentNode.removeChild(t); }, 400); }, 2600);
    }
    function toastNewLogs() {
        if (!S || !S.log)
            return;
        const fresh = S.log.filter(l => l.n > (ui.lastToastN == null ? Infinity : ui.lastToastN));
        ui.lastToastN = S.log.length ? S.log[S.log.length - 1].n : 0;
        fresh.filter(l => /unlock|good|bad|decl|boss/.test(l.cls)).slice(-4).forEach((l, i) => setTimeout(() => toast(l.text, l.cls), i * 160));
    }
    function screenFlash(kind) {
        const f = document.getElementById && document.getElementById('flash');
        if (!f || !f.classList)
            return;
        f.className = '';
        void f.offsetWidth;
        f.className = 'on ' + (kind || '');
    }
    function shake(el, power) { if (!el || !el.classList)
        return; el.style.setProperty('--sh', (power || 1) + ''); flash(el, 'shk'); }
    function burst(el, n) {
        if (!el || !document.createElement || !el.getBoundingClientRect)
            return;
        const r = el.getBoundingClientRect(), box = document.body;
        for (let i = 0; i < (n || 18); i++) {
            const p = document.createElement('i');
            p.className = 'spark';
            const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 140;
            p.style.left = (r.left + r.width / 2) + 'px';
            p.style.top = (r.top + r.height / 2) + 'px';
            p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
            p.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
            p.style.background = ['#f1e6c8', '#c99a3a', '#e05a3a', '#7fd0c0'][i % 4];
            box.appendChild(p);
            setTimeout(() => { if (p.parentNode)
                p.parentNode.removeChild(p); }, 900);
        }
    }
    function popout(el, text, kind, side) {
        if (!el || !document.createElement || !text)
            return;
        const f = document.createElement('span');
        f.className = 'popout ' + kind + ' ' + (side || 'r');
        f.textContent = text;
        el.appendChild(f);
        setTimeout(() => { if (f.parentNode)
            f.parentNode.removeChild(f); }, 1100);
    }
    function onClick(ev) {
        try {
            bgmUpdate();
        }
        catch (e) { }
        try {
            onClickInner(ev);
        }
        catch (e) {
            reportError(e);
            ui.anim = null;
            try {
                render();
            }
            catch (e2) {
                reportError(e2);
            }
        }
    }
    function reportError(e) {
        const msg = (e && e.message) || String(e);
        if (S && S.log)
            S.log.push({ text: `問題が起きた:${msg}`, cls: 'bad', n: (S.logN = (S.logN || 0) + 1) });
        if (window.console)
            console.error(e);
        const box = document.getElementById ? document.getElementById('errbox') : null;
        if (box) {
            box.textContent = '問題が起きた:' + msg;
            box.className = 'show';
        }
    }
    function onClickInner(ev) {
        const t = ev.target.closest('[data-act]');
        if (!t)
            return;
        const act = t.dataset.act;
        if (t.tagName === 'INPUT' && act !== 'sandbox' && act !== 'diff' && act !== 'crt' && act !== 'bgmoff')
            return;
        if (ui.anim && t.closest && t.closest('#modal') && S && (S.phase === 'over' || S.phase === 'clear'))
            ui.anim = null;
        if (ui.anim) {
            if (!ui.anim.started || Date.now() - (ui.anim.t0 || 0) > 15000) {
                ui.anim = null;
                render();
                return;
            }
            ui.anim.fast = true;
            return;
        }
        switch (act) {
            case 'newgame':
                if (E.hasSavedRun() && !confirm('中断中の国がある。新しく始めると、その記録は消える。よいか。'))
                    return;
                ui.view = 'name';
                break;
            case 'continue': {
                const loaded = E.loadRun(meta);
                if (!loaded) {
                    E.clearRun();
                    break;
                }
                S = loaded;
                ui.view = 'game';
                ui.sel = [];
                ui.last = null;
                ui.modal = null;
                break;
            }
            case 'records':
                showRecords();
                return;
            case 'settings':
                showSettings();
                return;
            case 'unlockall':
                meta.unlockAll = t.checked;
                E.saveMeta(meta);
                return;
            case 'sandbox':
                meta.sandbox = t.checked;
                E.saveMeta(meta);
                return;
            case 'bgmoff':
                meta.bgmOff = !t.checked;
                E.saveMeta(meta);
                if (meta.bgmOff) {
                    if (BGM.src) {
                        BGM.src.stop();
                        BGM.src = null;
                        BGM.cur = null;
                    }
                }
                else
                    bgmUpdate();
                return;
            case 'bgmvol': return;
            case 'crt':
                meta.crt = !!t.checked;
                E.saveMeta(meta);
                setBackground();
                if (ui.view === 'title' && document.body)
                    document.body.classList.toggle('crt', meta.crt);
                return;
            case 'resetmeta':
                if (confirm('記録と解放状況をすべて消す。よいか。')) {
                    meta = E.defaultMeta();
                    E.saveMeta(meta);
                    E.clearRun();
                    closeModal();
                }
                break;
            case 'totitle':
                ui.view = 'title';
                break;
            case 'randname':
                readNames();
                ui.names = E.randomNames();
                ui.fx.rolled = true;
                break;
            case 'diff':
                ui.diff = t.value;
                return;
            case 'tochars':
                readNames();
                if (!E.charUnlocked(meta, ui.pick))
                    ui.pick = 'mediator';
                ui.view = 'chars';
                break;
            case 'toname':
                ui.view = 'name';
                break;
            case 'pick':
                ui.pick = t.dataset.id;
                break;
            case 'start':
                if (!E.charUnlocked(meta, ui.pick))
                    return;
                E.clearRun();
                S = E.newRun(ui.pick, meta, { reqMul: DIFF[ui.diff], difficulty: ui.diff, leader: ui.names.leader, nation: ui.names.nation });
                ui.view = 'game';
                ui.sel = [];
                ui.draftSel = [];
                ui.last = null;
                break;
            case 'help':
                ui.modal = 'help';
                if (ui.view !== 'game') {
                    showHelp();
                    return;
                }
                break;
            case 'close':
                closeModal();
                if (ui.view !== 'game')
                    return;
                break;
            case 'deck':
                ui.modal = 'deck';
                break;
            case 'chron':
                ui.modal = 'chron';
                break;
            case 'quit':
                if (S.phase !== 'over')
                    E.saveRun(S);
                ui.view = 'title';
                S = null;
                ui.modal = null;
                break;
            case 'totitle-end':
                ui.view = 'title';
                S = null;
                ui.modal = null;
                meta = E.loadMeta();
                break;
            case 'draftpick': {
                const i = +t.dataset.i;
                if (ui.draftSel.includes(i))
                    ui.draftSel = ui.draftSel.filter(x => x !== i);
                else if (ui.draftSel.length < S.draft.need)
                    ui.draftSel.push(i);
                break;
            }
            case 'draftgo':
                if (E.confirmDraft(S, ui.draftSel))
                    ui.draftSel = [];
                break;
            case 'hand': {
                const u = +t.dataset.uid;
                if (ui.sel.includes(u))
                    ui.sel = ui.sel.filter(x => x !== u);
                else if (ui.sel.length < Math.max(E.maxPlay(S), E.maxDiscard(S)))
                    ui.sel.push(u);
                break;
            }
            case 'exec': {
                const before = S.R.total, hp = S.regions.map(r => r.hp);
                const insts = ui.sel.map(u => E.cardByUid(S, u)).filter(Boolean);
                const res = E.execute(S, ui.sel);
                if (res) {
                    const play = { uids: insts.map(c => c.uid), ids: insts.map(c => c.id), lvs: insts.map(c => c.lv || 0), regions: insts.map(c => c.region), res };
                    ui.lastPlay = play;
                    ui.anim = { t0: Date.now(), steps: res.steps, play, res, before, done: S.R.done, success: S.R.success, hit: new Set(S.regions.filter((r, i) => r.hp < hp[i]).map(r => r.id)), started: false, fast: false };
                }
                ui.sel = [];
                break;
            }
            case 'discard':
                E.discard(S, ui.sel);
                ui.sel = [];
                break;
            case 'declare':
                if (E.declare(S))
                    ui.fx.stamp = true;
                break;
            case 'swap':
                E.twinSwap(S);
                break;
            case 'backer':
                E.backerChoice(S, t.dataset.c);
                closeModal();
                break;
            case 'next':
                closeModal();
                ui.sel = [];
                ui.lastPlay = null;
                E.nextFromResult(S);
                break;
            case 'revise':
                closeModal();
                E.useRevision(S);
                ui.last = null;
                ui.sel = [];
                break;
            case 'reward':
                E.pickReward(S, +t.dataset.i);
                break;
            case 'rewardskip':
                E.skipReward(S);
                break;
            case 'rewardreroll':
                if (E.rerollReward(S))
                    ui.fx.rewardDeal = true;
                break;
            case 'event':
                E.resolveEvent(S, +t.dataset.i);
                closeModal();
                break;
            case 'buy':
                E.buy(S, +t.dataset.i);
                break;
            case 'sell':
                E.sell(S, +t.dataset.uid);
                break;
            case 'upgrade':
                E.upgrade(S, +t.dataset.uid);
                break;
            case 'reroll':
                if (E.reroll(S))
                    ui.fx.cardDeal = true;
                break;
            case 'rerollfac':
                if (E.rerollFacilities(S))
                    ui.fx.facDeal = true;
                break;
            case 'rerollstamp':
                if (E.rerollStamps(S))
                    ui.fx.stampDeal = true;
                break;
            case 'stamp':
                if (E.buyStamp(S, +t.dataset.i))
                    ui.ptab = 'deck';
                break;
            case 'stampcancel':
                E.cancelStamp(S);
                break;
            case 'applystamp':
                if (E.applyStamp(S, +t.dataset.uid))
                    ui.fx.stamped = +t.dataset.uid;
                break;
            case 'zukan':
                ui.modal = 'zukan';
                if (ui.view !== 'game') {
                    showZukan();
                    return;
                }
                break;
            case 'zf':
            case 'zq': return;
            case 'ptab':
                ui.ptab = t.dataset.k;
                break;
            case 'buyoffer':
                if (E.buyOffer(S))
                    ui.fx.cardDeal = true;
                break;
            case 'roundlog':
                showRoundLog();
                return;
            case 'peek':
                ui.endPeek = true;
                closeModal();
                break;
            case 'review':
                closeModal();
                ui.view = 'review';
                ui.endPeek = false;
                ui.fx.trans = { cls: 'reward', sub: S.nation, main: '振り返り' };
                break;
            case 'unpeek':
                ui.endPeek = false;
                break;
            case 'buyfac':
                E.buyFacility(S, +t.dataset.i);
                break;
            case 'sellfac':
                E.sellFacility(S, +t.dataset.i);
                break;
            case 'buyslot':
                E.buySlot(S);
                break;
            case 'dev':
                ui.modal = 'dev';
                break;
            case 'devapply':
                ['C', 'U', 'funds', 'reqMul', 'countdown'].forEach(k => { const el = $('#dv-' + k); if (el && el.value !== '')
                    E.devSet(S, k, el.value); });
                break;
            case 'devdis': {
                const el = $('#dv-dis');
                if (el)
                    E.devDisaster(S, el.value);
                break;
            }
            case 'devjump': {
                const a = $('#dv-era'), b = $('#dv-rie');
                if (a && b) {
                    E.devJump(S, +a.value, +b.value);
                    ui.lastPlay = null;
                }
                break;
            }
            case 'devcard': {
                const a = $('#dv-card'), b = $('#dv-lv');
                if (a)
                    E.devAddCard(S, a.value, b ? +b.value : 0);
                break;
            }
            case 'devfac': {
                const a = $('#dv-fac');
                if (a)
                    E.devAddFacility(S, a.value);
                break;
            }
            case 'devab': {
                const a = $('#dv-ab');
                if (a)
                    E.devAddAbility(S, a.value);
                break;
            }
            case 'devact':
                E.devAction(S, t.dataset.c);
                break;
            case 'return':
                E.returnPower(S);
                break;
            case 'leave':
                ui.modal = null;
                if (E.leaveParliament(S)) {
                    ui.sel = [];
                    ui.last = null;
                }
                break;
            case 'endless':
                closeModal();
                ui.view = 'game';
                E.continueEndless(S);
                break;
            default: return;
        }
        render();
    }
    document.addEventListener('click', onClick);
    document.addEventListener('mousemove', ev => {
        const sp = document.getElementById && document.getElementById('splash');
        if (sp) {
            const mx = ev.clientX / window.innerWidth * 2 - 1, my = ev.clientY / window.innerHeight * 2 - 1;
            sp.style.setProperty('--mx', mx.toFixed(3));
            sp.style.setProperty('--my', my.toFixed(3));
        }
        const t = ev.target.closest && ev.target.closest('.card, .char:not(.locked), .reward, .mbtn, .stampoffer, .fac');
        if (!t)
            return;
        const r = t.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
        t.style.setProperty('--ty', ((px - 0.5) * 16).toFixed(1) + 'deg');
        t.style.setProperty('--tx', ((0.5 - py) * 16).toFixed(1) + 'deg');
        t.style.setProperty('--gx', (px * 100).toFixed(0) + '%');
        t.style.setProperty('--gy', (py * 100).toFixed(0) + '%');
    });
    document.addEventListener('mouseover', ev => {
        const box = document.getElementById && document.getElementById('inspect');
        if (!box)
            return;
        const c = ev.target.closest && ev.target.closest('.card[data-cid]');
        if (!c) {
            box.className = '';
            return;
        }
        const id = c.dataset.cid, lv = +c.dataset.lv || 0, d = CARD[id];
        if (!d)
            return;
        const iuid = c.dataset.iuid != null ? +c.dataset.iuid : null;
        const inst = iuid != null && S ? E.cardByUid(S, iuid) : null;
        const rg = E.RG.find(r => r.key === (inst && S ? (E.regionById(S, inst.region) || {}).key : d.region));
        const lines = inst && S && S.R ? E.insight(S, iuid) : [];
        const st = inst && inst.stamp && E.STAMP[inst.stamp] ? `<div class="ins-stamp">${esc(E.STAMP[inst.stamp].name)}:${esc(E.STAMP[inst.stamp].effect)}</div>` : '';
        box.innerHTML = `<div class="ins-h"><b>${esc(d.name)}</b><span>${E.RARITY_NAME[d.rarity]}${rg ? ' ・ ' + esc(rg.name) : ''}</span></div>
    <div class="ins-eff">${esc(effectAt(id, lv))}</div>${st}
    ${lines.length ? `<div class="ins-now">${lines.map(l => `<div>${esc(l)}</div>`).join('')}</div>` : ''}
    <div class="ins-up">${esc(E.upgradeNote(id, lv))}</div>`;
        box.className = 'show';
    });
    document.addEventListener('mouseout', ev => {
        const t = ev.target.closest && ev.target.closest('.card, .char, .reward, .mbtn, .stampoffer, .fac');
        if (t && !t.contains(ev.relatedTarget)) {
            t.style.removeProperty('--tx');
            t.style.removeProperty('--ty');
        }
    });
    document.addEventListener('change', ev => {
        const t = ev.target;
        if (!t || !t.dataset)
            return;
        if (t.dataset.act === 'zf') {
            ui.zukan[t.dataset.k] = t.value;
            zukanFilter(ui.zukan.q);
        }
    });
    document.addEventListener('input', ev => {
        if (ev.target && ev.target.dataset && ev.target.dataset.act === 'bgmvol') {
            bgmSetVol(+ev.target.value / 100);
            return;
        }
        const t = ev.target;
        if (!t || !t.dataset || t.dataset.act !== 'zq')
            return;
        if (ev.isComposing)
            return;
        zukanFilter(t.value);
    });
    document.addEventListener('compositionend', ev => { const t = ev.target; if (t && t.dataset && t.dataset.act === 'zq')
        zukanFilter(t.value); });
    function zukanFilter(q) {
        ui.zukan.q = q;
        const L = zukanList();
        const g = document.getElementById('zgrid'), c = document.getElementById('zcount');
        if (g)
            g.innerHTML = L.html;
        if (c)
            c.textContent = `出会った制度 ${L.seen} / ${L.n}枚`;
    }
    window.addEventListener && window.addEventListener('error', ev => reportError(ev.error || ev.message));
    document.addEventListener('mouseover', ev => {
        const c = ev.target.closest && ev.target.closest('[data-region]');
        document.querySelectorAll('.gnode.hov').forEach(n => n.classList.remove('hov'));
        document.querySelectorAll('line.e.hov').forEach(n => n.classList.remove('hov'));
        if (!c)
            return;
        const id = c.dataset.region;
        const node = document.getElementById('rg-' + id);
        if (node)
            node.classList.add('hov');
        document.querySelectorAll(`line.e[data-a="${id}"], line.e[data-b="${id}"]`).forEach(n => n.classList.add('hov'));
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && ui.modal) {
            closeModal();
            if (ui.view === 'game')
                render();
        }
        if (e.key === 'Enter' && ui.view === 'name' && e.target && e.target.tagName === 'INPUT') {
            readNames();
            ui.view = 'chars';
            render();
        }
    });
    if (document.getElementById)
        (window.requestAnimationFrame || (f => setTimeout(() => f(Date.now()), 66)))(bgLoop);
    render();
})();
