(function (root) {
    'use strict';
    const D = root.GAME_DATA;
    const RETIRED = new Set(['coastal_forest', 'joint_stock', 'parity_pact', 'all_local', 'empty_throne', 'radio_net', 'sister_cities', 'immigration', 'election', 'total_mobil', 'mirror_hall', 'basin_union']);
    const CARD = {};
    D.cards.forEach(c => { CARD[c.id] = c; });
    const CHAR = {};
    D.characters.forEach(c => { CHAR[c.id] = c; });
    const CARD_OWNER = {};
    D.characters.forEach(ch => ch.cards.forEach(id => { CARD_OWNER[id] = ch.id; }));
    const rnd = n => Math.floor(Math.random() * n);
    const pick = a => a[rnd(a.length)];
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) {
        const j = rnd(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    } return a; }
    const RG = (D.regions && D.regions.regions) || [];
    const REL_MIN = D.regions && D.regions.range ? D.regions.range[0] : -Infinity, REL_MAX = D.regions && D.regions.range ? D.regions.range[1] : Infinity, LINK_AT = D.regions ? D.regions.linkThreshold : 5;
    const RG_INDEX = {};
    RG.forEach((r, i) => { RG_INDEX[r.key] = i; });
    const REGION_NAMES = ['北嶺', '東浦', '南湊', '西原', '川中', '山背', '霧ヶ丘', '白砂', '鷹ノ巣', '古市', '月見野', '藍瀬', '石動', '浅茅'];
    const NATION_NAMES = ['ハルヴァ連邦', '七州共和国', 'ミレット同盟', 'オルセン自治連合', '湊州連合', 'ヴェルダ共同体', '北洋諸州', 'カリム連邦共和国'];
    const LEADER_NAMES = ['イオ・ハルト', '真柴 透', 'レナ・ヴォルク', '久遠 静', 'アドリアン・メイ', '朝霧 碧', 'ノア・クレスト', '榊 灯'];
    const DKEY = {
        '地震': ['地震'], '洪水': ['洪水'], '干ばつ': ['干ばつ'], '疫病': ['疫病'], '噴火': ['噴火'], '津波': ['津波'], '大火': ['火災'],
        '原発事故': ['原発'], '金融危機': ['金融'], 'インフラ崩壊': ['インフラ'], '化学工場の爆発': ['化学'], '大規模停電': ['停電', 'インフラ'],
        '暴動': ['暴動'], '分離運動': ['分離'], '地方間対立': ['対立'], '陰謀': ['陰謀'], 'ゼネスト': ['ゼネスト'],
        '大震災': ['地震', '火災'], '百年洪水': ['洪水'], '大飢饉': ['干ばつ'], '新型疫病': ['疫病'], '巨大噴火': ['噴火'], '連鎖原発事故': ['原発'],
        '恐慌': ['金融'], '全国停電': ['停電', 'インフラ'], '内戦': ['内戦', '暴動'], '同時多発分離運動': ['分離'], '宮廷陰謀': ['陰謀'], '大ゼネスト': ['ゼネスト'],
        '小惑星衝突': ['衝突', '火災'], '超巨大太陽フレア': ['停電', 'インフラ'], '破局噴火': ['噴火'], '致死性パンデミック': ['疫病'], '世界恐慌': ['金融'], '全土の蜂起': ['暴動', '内戦']
    };
    const ENDLESS_TYPE = { '小惑星衝突': '自然', '超巨大太陽フレア': '人災', '破局噴火': '自然', '致死性パンデミック': '自然', '世界恐慌': '人災', '全土の蜂起': '社会' };
    const BOSS_RULE = {
        '大震災': 'centralDelay', '百年洪水': 'isolation', '大飢饉': 'famine', '新型疫病': 'centralSpread', '巨大噴火': 'regionLost',
        '連鎖原発事故': 'noUpgrade', '恐慌': 'noFunds', '全国停電': 'blackout', '内戦': 'civilWar', '同時多発分離運動': 'localHalf',
        '宮廷陰謀': 'intrigue', '大ゼネスト': 'centralHalf'
    };
    const RESTRICTION_OVERRIDE = {
        '大震災': '中央のカードの効果が、次の手まで遅れて届く',
        '大飢饉': '手札の上限が2枚減る',
        '巨大噴火': '一つの地方が灰に埋もれる。地方のカードの対応力が半分',
        '連鎖原発事故': '強化したカードも、強化していないものとして働く',
        '全国停電': '引き直しができない。前兆の報告も届かない',
        '内戦': '最も信頼の低い地方が離反する。地方のカードの対応力が2割減る',
        '同時多発分離運動': '地方のカードの対応力が半分',
        '大ゼネスト': '中央のカードの対応力が半分'
    };
    const RULE_TEXT = {};
    D.disasters.boss.forEach(b => { RULE_TEXT[BOSS_RULE[b.name]] = RESTRICTION_OVERRIDE[b.name] || b.restriction; });
    const WINTER_STAGES = [
        { name: '長い冬 一 凍土', type: '自然', keys: ['干ばつ', '寒波'] },
        { name: '長い冬 二 途絶', type: '人災', keys: ['停電', 'インフラ', '金融'] },
        { name: '長い冬 三 飢えた春', type: '社会', keys: ['暴動', '分離'] }
    ];
    const INFO_CARDS = new Set(['state_broadcast', 'expert_panel', 'local_press', 'peer_review', 'oracle', 'censorship', 'transparency']);
    const RESEARCH_CARDS = new Set(['research_lab', 'expert_panel', 'weather_bureau', 'citizen_science', 'vaccine', 'literature_review', 'peer_review', 'lecture_notes', 'disaster_edu', 'chronicle', 'knowledge_share']);
    const PRICE = { C: 3, U: 5, R: 7, L: 12, X: 20 };
    const RARITY_W = { C: 55, U: 30, R: 12, L: 3, X: 0 };
    const RARITY_NAME = { C: 'コモン', U: 'アンコモン', R: 'レア', L: 'エピック', X: 'レジェンド' };
    const BASIC = ['mediator', 'veteran', 'technocrat', 'regional', 'scholar'];
    const TYPES = ['自然', '人災', '社会'];
    function effectText(id) { return CARD[id].effect; }
    function catOf(def) { return def.alignment === '分権' ? 'local' : def.alignment === '中立' ? 'neutral' : 'central'; }
    const FLAVOR = {
        mediator: '対立する者同士を、何度も同じ卓につかせてきた。話はいつも長い。',
        veteran: '長く軍にいた。命令の重さも、命令が届かない場所があることも知っている。',
        technocrat: '数字と手順で国は動くと信じている。少なくとも、そう信じていたい。',
        regional: '首都の生まれではない。故郷の訛りは、まだ抜けていない。',
        scholar: '書斎から政治の場へ呼ばれた。書類の端の小さな文字を読む癖がある。',
        puppet: '玉座に座っているのはあなただ。決めているのが誰かは、別の話だ。',
        exile: '首都はもうない。各地に散った仲間だけが、国のかたちを覚えている。',
        heir: '父の遺した椅子は、座るには大きすぎる。',
        citizen: '誰でもない。だから、何にでもなれる。',
        prophet: '明日のことが少しだけ見える。外れることもある。',
        idle: '急いで良かった試しがない、というのが口癖だ。',
        anarchist: '国家をなくすために、国家の頂点に立った。',
        mirror: '鏡の向こうの国から来たような男。右と左が、いつも逆だ。',
        revolutionary: '制度は壊すためにある。壊したあとのことは、壊してから考える。',
        gambler: '国の命運を、硬貨一枚に預けることを恐れない。',
        twins: '二人で一人。どちらが今日の当番かは、本人たちにも曖昧だ。',
        timetraveler: 'この国の結末を、一度見てきたらしい。',
        calamity: '災いを退けるのではない。呑み込むのだ。'
    };
    const ABILITIES = {
        compound: { name: '倍率の累乗', text: '手の終わりに、倍率を1.15乗する' },
        powerup: { name: '対応力の累乗', text: '手の終わりに、対応力を1.1乗する' },
        balance: { name: '均衡の術', text: '手の終わりに、対応力と倍率を足して半分ずつにならす' },
        momentum: { name: '余勢', text: '手の終わりの倍率の2割を、そのラウンドの次の手の倍率に足して始める' },
        perpetual: { name: '永久機関', text: 'ラウンドを乗り切るたびに、すべての手に掛かる倍率×1.08が積み上がる' },
        encore_all: { name: '名演', text: '強化したカードはもう一度発動する' },
        reserve: { name: '控えの力', text: '出さずに手札に残ったカードも、基礎の半分を対応力に加える' },
        discard_voice: { name: '捨て札の声', text: '引き直しで捨てたカードも、次に出す手でもう一度発動する' },
        aftermath: { name: '余波', text: '乗り切ったときの余りを、次のラウンドの必要対策値から差し引く(最大8割)' },
        gold_weight: { name: '金貨の重み', text: '手の終わりに、議会資金が倍になるごとに倍率×1.25' },
        ring_of_unity: { name: '連帯の環', text: '手の終わりに、協力関係1本につき倍率×1.2' },
        terror: { name: '恐怖政治', text: '手の終わりに、削った信頼の累計1につき倍率×1.02' },
        silver_lining: { name: '災い転じて', text: '被害を受けるたびに、すべての手に掛かる倍率×1.15が積み上がる' },
        double_order: { name: '二重発注', text: '持っているカードを重ねて承認すると、強化に加えて写しも一枚得る' },
        fixer: { name: '根回し上手', text: '議会のそれぞれの差し替えが、毎回1度だけ無料' },
        open_table: { name: '開かれた卓', text: '1手に出せるカード+2' },
        vanguard: { name: '先陣', text: '最初に出したカードの効果が3倍になる' },
        finisher: { name: '締めの一手', text: '最後に出したカードの倍率の効果を2乗する' },
        double_seal: { name: '重ね印', text: '1回の議会で調印を2回押せる' },
        limitless: { name: '名工の手', text: '強化したカードの恩恵が、さらに大きくなる' },
        self_growth: { name: '自ずから育つ', text: '出すたびに伸びるカードは、出さなかったラウンドにも伸びる' },
        national_interest: { name: '複利の国庫', text: '利子が議会資金の1割になる(最大30)' },
        emergency_norm: { name: '非常の常態', text: '緊急事態宣言の効き目が落ちなくなる' },
        contrarian: { name: '逆張り', text: '倍率を下げる効果が、逆に同じだけ倍率を上げる' },
        home_ground: { name: '地元びいき', text: '同じ地方のカードだけで2枚以上出すと、すべてのカードがもう一度発動する' },
        gearing: { name: '連動', text: '施設の効果が2回発動する' },
        acceleration: { name: '時代の加速', text: '時代が変わるたびに、すべての手に掛かる倍率×1.5が積み上がる' },
        inheritance: { name: '余力の継承', text: '乗り切ったときの余りの半分を、次のラウンドへ持ち越す' },
        creative_destruction: { name: '破壊と創造', text: 'カードを廃止するたびに、すべての手に掛かる倍率×1.1が積み上がる' },
        giant_slayer: { name: '大物喰い', text: 'ボスのとき、倍率×(今の時代の数)' }
    };
    const META_KEY = 'decentral-state-meta-v1';
    const RUN_KEY = 'decentral-state-run-v17';
    function defaultMeta() {
        return { unlockAll: false, chars: {}, cards: {}, coups: 0, clears: {}, bossesSeen: [], exactRounds: 0, bossNoType: 0,
            idleClear: false, anarchyEra: false, lastCard: null, lastDisaster: null, best: { era: 0, score: 0 }, runs: 0, lastNames: null, history: [] };
    }
    function loadMeta() {
        try {
            return Object.assign(defaultMeta(), JSON.parse(root.localStorage.getItem(META_KEY) || '{}'));
        }
        catch (e) {
            return defaultMeta();
        }
    }
    function saveMeta(m) { try {
        root.localStorage.setItem(META_KEY, JSON.stringify(m));
    }
    catch (e) { } }
    function saveRun(S) {
        if (!S || S.phase === 'over')
            return;
        try {
            const meta = S.meta;
            S.meta = null;
            root.localStorage.setItem(RUN_KEY, JSON.stringify(S));
            S.meta = meta;
        }
        catch (e) { }
    }
    function hasSavedRun() { try {
        return !!root.localStorage.getItem(RUN_KEY);
    }
    catch (e) {
        return false;
    } }
    function loadRun(meta) {
        try {
            const S = JSON.parse(root.localStorage.getItem(RUN_KEY));
            if (!S || S.v !== 17)
                return null;
            S.meta = meta;
            return S;
        }
        catch (e) {
            return null;
        }
    }
    function clearRun() { try {
        root.localStorage.removeItem(RUN_KEY);
    }
    catch (e) { } }
    function charUnlocked(meta, id) { return CHAR[id].group === '基本' || meta.sandbox || !!meta.chars[id]; }
    function cardUnlocked(meta, id) { const c = CARD[id]; return !c.unlock || !!meta.cards[id]; }
    const NF_U = [[1e48, '極'], [1e44, '載'], [1e40, '正'], [1e36, '澗'], [1e32, '溝'], [1e28, '穣'], [1e24, '秭'], [1e20, '垓'], [1e16, '京'], [1e12, '兆'], [1e8, '億'], [1e4, '万']];
    function nf(n) {
        const a = Math.abs(n);
        if (a < 1e4)
            return String(Math.round(n));
        if (a >= 1e52) {
            const e = Math.floor(Math.log10(a));
            return `${(n / Math.pow(10, e)).toFixed(2)}×10^${e}`;
        }
        for (const [u, s] of NF_U)
            if (a >= u) {
                const v = n / u;
                return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + s;
            }
        return String(n);
    }
    function log(S, text, cls) { S.log.push({ text, cls: cls || '', n: S.logN++ }); if (S.log.length > 160)
        S.log.shift(); }
    function roundLabel(S) {
        if (S.R && S.R.d && S.R.d.winter && (S.phase === 'round' || S.phase === 'winter' || S.phase === 'result'))
            return `第${S.era}時代 長い冬(${S.R.d.winter})`;
        return `第${S.era}時代 ${['第一ラウンド', '第二ラウンド', 'ボス'][S.rie]}`;
    }
    function chron(S, text, kind) { S.chron.push({ label: roundLabel(S), text, kind: kind || '', roundNo: S.roundNo }); }
    function owned(S, id) { return S.deck.some(c => c.id === id); }
    function ownedList(S, id) { return S.deck.filter(c => c.id === id); }
    function maxEras(S, id) { return ownedList(S, id).reduce((m, c) => Math.max(m, c.eras), 0); }
    function hasAb(S, id) { return false; }
    function hasTrait(S, id) {
        if (S.charId === 'twins')
            return S.twins[S.twinIdx] === id;
        return S.charId === id;
    }
    function Ceff(S) { return S.charId === 'mirror' ? 100 - S.C : S.C; }
    function alive(S) { return S.regions.filter(r => !r.dead); }
    function regionById(S, id) { return S.regions.find(r => r.id === id); }
    function linkPower(S) { return 1 + (S.flags.mycelium || 0); }
    function trackTrust(S) {
        const sum = alive(S).reduce((a, r) => a + r.trust, 0);
        if (S.stats.lastTrust != null && sum < S.stats.lastTrust) {
            const dd = S.stats.lastTrust - sum;
            S.stats.trustTaken = (S.stats.trustTaken || 0) + dd;
            S.stats.lastTrust = sum;
            emit(S, 'trustDrop', dd);
        }
        S.stats.lastTrust = sum;
    }
    function allTrust(S, d) { alive(S).forEach(r => { r.trust = Math.max(0, r.trust + d); }); }
    function avgTrust(S) { const a = alive(S); return a.length ? a.reduce((s, r) => s + r.trust, 0) / a.length : 0; }
    function changeC(S, d) {
        if (S.charId === 'exile' && !owned(S, 'temp_capital'))
            return;
        if (d > 0 && S.flags.ccReady && owned(S, 'const_court')) {
            S.flags.ccReady = false;
            log(S, '憲法裁判所が権限の移動を差し止めた。');
            return;
        }
        const beforeEff = Ceff(S);
        S.C = clamp(S.C + d, 0, 100);
        if (S.R && !S.R.done && Ceff(S) > beforeEff + 0.001)
            S.R.cIncrease = true;
        S.maxC = Math.max(S.maxC, S.C);
        S.eraMaxC = Math.max(S.eraMaxC, S.C);
    }
    function addU(S, d) { S.U = clamp(S.U + d, 0, 100); }
    function see(S, ids) { if (S.sandbox || !S.meta)
        return; const m = S.meta; m.seen = m.seen || {}; ids.forEach(id => { if (id)
        m.seen[id] = 1; }); }
    function mkCard(S, id, extra) {
        see(S, [id]);
        const def = CARD[id], al = S.regions.filter(r => !r.dead);
        const home = def && def.region != null ? S.regions.find(r => r.key === def.region) : null;
        return Object.assign({ uid: S.uid++, id, rounds: 0, eras: 0, g: {}, lv: 0, region: home ? home.id : (al.length ? pick(al).id : 0) }, extra || {});
    }
    function cardByUid(S, uid) { return S.deck.find(c => c.uid === uid); }
    function removeCard(S, inst) {
        if (!inst)
            return;
        S.deck = S.deck.filter(x => x !== inst);
        S.drawPile = S.drawPile.filter(u => u !== inst.uid);
        S.hand = S.hand.filter(u => u !== inst.uid);
        S.discard = S.discard.filter(u => u !== inst.uid);
    }
    function randomNames() { return { nation: pick(NATION_NAMES), leader: pick(LEADER_NAMES) }; }
    function rk(a, b) { return a < b ? a + '-' + b : b + '-' + a; }
    function getRel(S, a, b) { return a === b ? 0 : (S.rel[rk(a, b)] || 0); }
    function setRel(S, a, b, v) {
        if (a === b)
            return;
        const k = rk(a, b), before = S.rel[k] || 0;
        S.rel[k] = clamp(Math.round(v), REL_MIN, REL_MAX);
        if (before < LINK_AT && S.rel[k] >= LINK_AT) {
            const my = ownedList(S, 'mycelium').length;
            if (my)
                S.flags.mycelium = (S.flags.mycelium || 0) + 0.1 * my;
        }
    }
    function addRel(S, a, b, d, calm) {
        const before = getRel(S, a, b);
        setRel(S, a, b, before + d);
        const after = getRel(S, a, b);
        if (after > before)
            emit(S, 'relRise', after - before);
        const deep = Math.max(0, after - Math.max(before, 5));
        if (!calm && deep >= 2) {
            const j = Math.ceil(deep / 3);
            const others = alive(S).filter(r => r.id !== a && r.id !== b);
            if (others.length) {
                const o = pick(others);
                setRel(S, a, o.id, getRel(S, a, o.id) - j);
                setRel(S, b, o.id, getRel(S, b, o.id) - j);
                if (S.R && !S.R.jealousLogged) {
                    S.R.jealousLogged = true;
                    log(S, `${o.name}は、${regionById(S, a).name}と${regionById(S, b).name}の接近を面白く思っていない。`, 'react');
                }
            }
        }
    }
    function alivePairs(S) { const al = alive(S), out = []; for (let i = 0; i < al.length; i++)
        for (let j = i + 1; j < al.length; j++)
            out.push([al[i].id, al[j].id]); return out; }
    function linksCount(S) { if (S.R && !S.R.done && S.R.isolated)
        return 0; return alivePairs(S).filter(([a, b]) => getRel(S, a, b) >= LINK_AT).length; }
    function initRelFromData(S, off) {
        const rel = (D.regions && D.regions.relations) || {};
        S.regions.forEach(a => S.regions.forEach(b => { if (a.id < b.id) {
            const v = rel[a.key + '-' + b.key] != null ? rel[a.key + '-' + b.key] : rel[b.key + '-' + a.key];
            S.rel[rk(a.id, b.id)] = clamp((v || 0) + off, REL_MIN, REL_MAX);
        } }));
    }
    function initRel(S, v) { S.rel = {}; S.regions.forEach(a => S.regions.forEach(b => { if (a.id < b.id)
        S.rel[rk(a.id, b.id)] = v; })); }
    function worstPair(S) { const ps = alivePairs(S); if (!ps.length)
        return null; const mn = Math.min(...ps.map(([a, b]) => getRel(S, a, b))); return pick(ps.filter(([a, b]) => getRel(S, a, b) === mn)); }
    function regionRelSum(S, id) { return alive(S).filter(r => r.id !== id).reduce((s, r) => s + getRel(S, id, r.id), 0); }
    function addLinks(S, n, why) {
        for (let i = 0; i < n; i++) {
            const c = alivePairs(S).filter(([a, b]) => getRel(S, a, b) < LINK_AT);
            if (!c.length)
                break;
            const mx = Math.max(...c.map(([a, b]) => getRel(S, a, b)));
            const [a, b] = pick(c.filter(([x, y]) => getRel(S, x, y) === mx));
            addRel(S, a, b, 2);
        }
        if (why && n > 0)
            log(S, `地方どうしの関係が深まった(${why})。`);
    }
    const FAC = {};
    (D.facilities || []).forEach(f => { FAC[f.id] = f; });
    const STAMP = {};
    (D.stamps || []).forEach(t => { STAMP[t.id] = t; });
    const STAMP_NAME = id => STAMP[id] ? STAMP[id].name : '';
    function genStampOffers(S) {
        const pool = (D.stamps || []).slice(), out = [];
        while (out.length < 3 && pool.length) {
            const tot = pool.reduce((a, t) => a + (t.weight || 8), 0);
            let r = Math.random() * tot, k = 0;
            while (k < pool.length - 1 && r > (pool[k].weight || 8)) {
                r -= pool[k].weight || 8;
                k++;
            }
            out.push(pool.splice(k, 1)[0].id);
        }
        return out.map(id => ({ id, price: stampPrice(S, id), sold: false }));
    }
    function stampPrice(S, id) { const n = S.deck.filter(c => c.stamp).length; return Math.max(1, Math.round(STAMP[id].price * priceMul(S) * Math.pow(1.6, n))); }
    function buyStamp(S, i) {
        const o = S.stampShop[i];
        if (!o || o.sold || S.P.stamped || S.funds < o.price)
            return false;
        S.P.pendingStamp = i;
        return true;
    }
    function cancelStamp(S) { if (S.P)
        S.P.pendingStamp = null; }
    function applyStamp(S, uid) {
        const i = S.P.pendingStamp;
        const o = S.stampShop[i];
        const c = cardByUid(S, uid);
        if (o == null || !o || !c || S.P.stamped)
            return false;
        if (S.funds < o.price) {
            S.P.pendingStamp = null;
            log(S, '調印の費用が足りなくなった。', 'sys');
            return false;
        }
        S.funds -= o.price;
        spendNote(S, o.price);
        o.sold = true;
        const before = c.stamp;
        c.stamp = o.id;
        c.stampedAt = S.roundNo;
        emit(S, 'stamp', 1, { inst: c });
        S.P.stampsUsed = (S.P.stampsUsed || 0) + 1;
        S.P.buys = (S.P.buys || 0) + 1;
        refreshPrices(S);
        S.P.stamped = S.P.stampsUsed >= (hasAb(S, 'double_seal') ? 2 : 1);
        S.P.pendingStamp = null;
        if (!S.P.stamped)
            S.stampShop = genStampOffers(S);
        log(S, `「${CARD[c.id].name}」に${STAMP[o.id].name}を押した${before ? `(${STAMP_NAME(before)}は消えた)` : ''}。`, 'act');
        return true;
    }
    function rerollStamps(S) { if (S.P.stamped)
        return false; if (freeRoll(S, 'stamp')) {
        S.stampShop = genStampOffers(S);
        S.P.pendingStamp = null;
        emit(S, 'reroll');
        return true;
    } if (S.funds < S.P.stampReroll)
        return false; S.funds -= S.P.stampReroll; spendNote(S, S.P.stampReroll); S.P.rr.s++; S.P.stampReroll = 2 * fib(S.P.rr.s); S.stampShop = genStampOffers(S); S.P.pendingStamp = null; return true; }
    function rerollFacilities(S) { if (freeRoll(S, 'fac')) {
        S.facShop = genFacOffers(S);
        emit(S, 'reroll');
        return true;
    } if (S.funds < S.P.facReroll)
        return false; S.funds -= S.P.facReroll; spendNote(S, S.P.facReroll); S.P.rr.f++; S.P.facReroll = 2 * fib(S.P.rr.f); S.facShop = genFacOffers(S); return true; }
    function hasFac(S, id) { return (S.facilities || []).some(f => f.id === id); }
    function facCount(S, id) { return (S.facilities || []).filter(f => f.id === id).length; }
    const FACFX = {
        clinic: { onCard: (f, c) => c.cat === 'local' ? { p: 40 } : null },
        ministries: { onCard: (f, c) => c.cat === 'central' ? { a: 1 } : null },
        artisan_hall: { onCard: (f, c) => (c.inst.lv || 0) > 0 ? { x: 1.25 } : null },
        research_city: { onCard: (f, c) => RESEARCH_CARDS.has(c.def.id) ? { x: 1.4 } : null },
        disaster_center: { onCard: (f, c, x) => c.def.target.split(':')[0] === x.d.type ? { p: 60 } : null },
        warehouse: { onCard: (f, c) => (c.def.base || 0) >= 30 ? { p: 50 } : null },
        cogwheel: { onCard: (f, c, x) => { x.cogN = (x.cogN || 0) + 1; return { a: Math.round(x.cogN * 2) / 10 }; } },
        sweatshop: { onCard: () => ({ p: 60 }) },
        coin_press: { onCard: () => ({ side: S => { S.funds += 1; }, note: '議会資金+1' }) },
        archive_vault: { onCard: (f, c) => ({ side: () => { c.inst.g.bb = (c.inst.g.bb || 0) + 1; }, note: '基礎+1' }) },
        monument: { onEnd: () => ({ a: 5 }) },
        cathedral: { onEnd: () => ({ x: 2 }) },
        hotline: { onEnd: (f, x) => x.L ? { a: x.L } : null },
        forum: { onEnd: (f, x) => x.cards.length && x.cards.every(c => c.cat === 'local') ? { x: 3 } : null },
        tower: { onEnd: (f, x) => x.cards.length && x.cards.every(c => c.cat === 'central') ? { x: 3 } : null },
        lottery: { onEnd: (f, x) => x.cards.length && !x.preview && Math.random() < 1 / 3 ? { x: 5, note: '当たり' } : null },
        snowball: { onEnd: f => f.g.v ? { x: 1 + f.g.v } : null },
        old_tree: { onEnd: f => f.g.v ? { a: f.g.v } : null },
        meeting_hall: { onEnd: (f, x) => { const m = {}; x.cards.forEach(c => { m[c.inst.region] = (m[c.inst.region] || 0) + 1; }); return Object.values(m).some(v => v >= 2) ? { x: 2 } : null; } },
        railway: { onEnd: (f, x) => x.cards.length >= 2 && new Set(x.cards.map(c => c.inst.region)).size === x.cards.length ? { x: 2.5 } : null },
        watchtower: { onEnd: (f, x) => x.d.boss ? { x: 3 } : null },
        old_library: { onEnd: (f, x) => { const k = Math.floor(x.S.chron.length / 5); return k ? { a: k } : null; } },
        mint: { onEnd: (f, x) => { const k = Math.log2(1 + Math.max(0, x.S.funds) / 10); return k > 0.01 ? { a: 2 * k } : null; } },
        stalls: { onEnd: (f, x) => x.cards.length >= 4 ? { side: S => { S.funds += 5; }, note: '議会資金+5' } : null },
        academy: { onCard: (f, c, x) => RESEARCH_CARDS.has(c.def.id) && !x.R.academyUsed ? { side: S => { if (!S.R.academyUsed) {
                    S.R.academyUsed = true;
                    lvUp(S, c.inst, 1);
                } }, note: '強化' } : null },
        hourglass: { onEnd: (f, x) => x.R.playsLeft === 1 && x.cards.length ? { x: x.R.playsUsed + 1 } : null },
        gendarmerie: { onEnd: (f, x) => { const k = x.alive.filter(r => r.trust <= 3).length; return k ? { x: Math.pow(1.3, k) } : null; } }
    };
    const FAC_W = { C: 50, U: 32, R: 14 };
    function priceMul(S) { return Math.pow(1.18, Math.max(0, Math.min(S.era, 12) - 1)) * (1 + 0.2 * ((S.P && S.P.buys) || 0)) * discountMul(S); }
    function refreshPrices(S) {
        (S.shop || []).forEach(o => { if (!o.sold)
            o.price = priceOf(S, o.id); });
        (S.facShop || []).forEach(o => { if (!o.sold)
            o.price = facPrice(S, o.id); });
        (S.stampShop || []).forEach(o => { if (!o.sold)
            o.price = stampPrice(S, o.id); });
    }
    function discountMul(S) { return (hasAb(S, 'thrift') ? 0.7 : 1) * Math.pow(0.7, facCount(S, 'thrift_office')); }
    function facPrice(S, id) { return Math.max(1, Math.round(FAC[id].price * priceMul(S))); }
    function genFacOffers(S) {
        const pool = D.facilities.filter(f => !hasFac(S, f.id));
        const out = [];
        for (let i = 0; i < 3 && pool.length; i++) {
            const ws = pool.map(f => FAC_W[f.rarity] * (out.includes(f.id) ? 0 : 1));
            if (!ws.some(w => w > 0))
                break;
            let t = Math.random() * ws.reduce((a, b) => a + b, 0), k = 0;
            while (k < ws.length - 1 && t > ws[k]) {
                t -= ws[k];
                k++;
            }
            out.push(pool[k].id);
        }
        return out.map(id => ({ id, price: facPrice(S, id), sold: false }));
    }
    function buyFacility(S, i) {
        const o = S.facShop[i];
        if (!o || o.sold || S.funds < o.price || S.facilities.length >= S.facSlots)
            return false;
        S.funds -= o.price;
        spendNote(S, o.price);
        o.sold = true;
        S.facilities.push({ uid: S.uid++, id: o.id, g: {} });
        S.P.buys = (S.P.buys || 0) + 1;
        refreshPrices(S);
        emit(S, 'buyFac');
        log(S, `施設「${FAC[o.id].name}」が建った。`);
        return true;
    }
    function sellFacility(S, uid) {
        const f = S.facilities.find(x => x.uid === uid);
        if (!f)
            return false;
        S.facilities = S.facilities.filter(x => x !== f);
        S.funds += Math.floor(FAC[f.id].price / 2);
        log(S, `施設「${FAC[f.id].name}」を取り壊した。`);
        return true;
    }
    const MAX_SLOTS = 6, SLOT_CAP = 8;
    const FIB = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765];
    const fib = n => FIB[Math.min(n, FIB.length - 1)] * (n >= FIB.length ? Math.pow(1.618, n - FIB.length + 1) : 1);
    function slotCost(S) { return Math.round(8 * fib(S.facSlots - 2)); }
    const OFFER_CAP = 3;
    function offerCost(S) { return 15 * fib((S.offerPlus || 0) + 1); }
    function buyOffer(S) {
        if ((S.offerPlus || 0) >= OFFER_CAP || S.funds < offerCost(S))
            return false;
        const c = offerCost(S);
        S.funds -= c;
        spendNote(S, c);
        S.offerPlus = (S.offerPlus || 0) + 1;
        S.shop = S.shop.concat(genOffers(S).slice(0, 1));
        log(S, '議会に届く対策案が増えた。');
        return true;
    }
    function buySlot(S) {
        if (S.facSlots >= SLOT_CAP || S.funds < slotCost(S))
            return false;
        S.funds -= slotCost(S);
        spendNote(S, slotCost(S));
        S.facSlots++;
        log(S, `施設の用地が広がった(${S.facSlots}枠)。`);
        return true;
    }
    function newRun(charId, meta, opts) {
        opts = opts || {};
        const S = {
            v: 17, sandbox: !!meta.sandbox, charId, meta, leader: opts.leader || '名もなき指導者', nation: opts.nation || '名もなき国',
            era: 1, rie: 0, roundNo: 0, phase: 'draft', C: 20, U: 5, critical: false, criticalRound: null, countdown: null,
            declCount: 0, declEra: 0, regions: [], rel: {}, funds: 6, deck: [], drawPile: [], hand: [], discard: [], uid: 1,
            log: [], logN: 0, chron: [], omenCount: 0, flags: { ccReady: true }, permMult: 1, idleStack: 1, betMult: 1,
            revolutions: 0, resist: 0, accel: 0, spentTotal: 0, experienced: {}, experiencedType: {}, survived: {}, survivedType: {},
            absorbed: [], bossesUsed: [], prevDisaster: null, failNames: [], endless: false, score: 0, maxC: 20, eraMaxC: 20,
            returnPenalty: 0, carry: 0, drillStore: 0, lowerPlay: 0, streakNoC: 0, prophecy: null, propStreak: 0, propMiss: 0,
            twins: null, twinIdx: 0, handSize: 8, plays: 4, discards: 3, litTypes: {}, nextD: null, shop: [], event: null, R: null, P: null,
            stats: { returns: 0, idleStreak: 0, backerRides: 0, winStreak: 0, suppressBurned: 0, maxRegions: 6, omensSeen: 0 },
            over: null, ending: null, homeId: null, snapshot: null, nextRegionName: 6, reqMul: opts.reqMul || 1, difficulty: opts.difficulty || '標準',
            abilities: [], reward: null, pendingReward: false, draft: null, extraStart: [], facilities: [], facSlots: 3, facShop: [], stampShop: []
        };
        for (let i = 0; i < 6; i++)
            S.regions.push({ id: i, key: RG[i] ? RG[i].key : 'r' + i, name: RG[i] ? RG[i].name : REGION_NAMES[i], hp: 6, max: 6, trust: 5, river: [1, 2, 4].includes(i), dead: false, home: false });
        initRel(S, 0);
        initRelFromData(S, 0);
        let need = 8;
        const traitSetup = t => {
            if (t === 'mediator') {
                S.C = 15;
                initRelFromData(S, 3);
            }
            if (t === 'veteran') {
                S.C = 30;
                allTrust(S, -2);
            }
            if (t === 'technocrat') {
                S.C = 30;
            }
            if (t === 'regional') {
                S.C = 15;
                const h = S.regions[rnd(6)];
                h.home = true;
                S.homeId = h.id;
                h.trust = 9;
                h.hp = h.max = 8;
                S.regions.forEach(r => { if (!r.home) {
                    r.trust = 4;
                    addRel(S, h.id, r.id, -4);
                } });
            }
            if (t === 'scholar') {
                S.funds = 3;
                need = 6;
            }
        };
        if (charId === 'twins') {
            const a = shuffle(BASIC.slice());
            S.twins = [a[0], a[1]];
            traitSetup(a[0]);
            traitSetup(a[1]);
        }
        else
            traitSetup(charId);
        if (charId === 'puppet')
            S.C = 25;
        if (charId === 'exile') {
            S.C = 0;
            S.regions.forEach(r => { r.trust = 8; });
            initRelFromData(S, 5);
        }
        if (charId === 'heir') {
            S.C = 100;
            S.U = 40;
            S.extraStart = ['praetorian', 'mobilization'];
        }
        if (charId === 'citizen') {
            S.funds = 2;
            need = 6;
        }
        if (charId === 'anarchist') {
            S.C = 5;
            S.regions.forEach(r => { r.trust = 4; });
        }
        if (charId === 'mirror')
            S.C = 80;
        if (charId === 'timetraveler') {
            need = 0;
            S.funds = 20;
            S.carried = (meta.lastCard && CARD[meta.lastCard.id]) ? meta.lastCard : { id: 'granary' };
        }
        S.relBase = Object.assign({}, S.rel);
        S.stats.lastTrust = S.regions.reduce((a, r) => a + r.trust, 0);
        S.maxC = S.C;
        S.eraMaxC = S.C;
        meta.runs = (meta.runs || 0) + 1;
        meta.lastNames = { leader: S.leader, nation: S.nation };
        saveMeta(meta);
        log(S, `${S.leader}が${S.nation}の指導者に就いた。`, 'sys');
        if (S.homeId !== null)
            log(S, `出身地方は${regionById(S, S.homeId).name}。`, 'sys');
        chron(S, `${S.leader}(${CHAR[charId].name})が就任`, 'start');
        if (need > 0) {
            S.draft = { offer: genDraft(S), need };
            see(S, S.draft.offer);
            S.phase = 'draft';
        }
        else {
            const k = S.carried;
            S.deck.push(mkCard(S, k.id, k.keepGrowth ? { rounds: k.rounds || 0, eras: k.eras || 0, g: k.g || {}, lv: k.lv || 0, carried: true } : { carried: true }));
            log(S, `前の時間から「${CARD[k.id].name}」を持ち越した。`, 'sys');
            S.nextD = makeDisaster(S);
            enterParliament(S, true);
        }
        saveRun(S);
        return S;
    }
    function genDraft(S) {
        const base = D.cards.filter(c => !c.unlock && (c.rarity === 'C' || c.rarity === 'U') && c.alignment !== '抑圧');
        const engine = shuffle(['donation', 'tax_revenue', 'local_industry', 'windfall', 'rally', 'amplifier', 'solidarity', 'envoy_card', 'mediation_card', 'tu_market', 'kw_command', 'trust_fund', 'dividend']).filter(id => CARD[id]);
        const out = engine.slice(0, 3);
        RG.forEach(r => {
            const pool = shuffle(base.filter(c => c.region === r.key && !out.includes(c.id)).map(c => c.id));
            const gen = pool.filter(id => !CARD[id].target.includes(':'));
            out.push(...(gen.length >= 2 ? gen.slice(0, 2) : pool.slice(0, 2)));
        });
        return shuffle(out.slice(0, 15));
    }
    function confirmDraft(S, idxs) {
        if (S.phase !== 'draft')
            return false;
        const uniq = [...new Set(idxs)].filter(i => i >= 0 && i < S.draft.offer.length);
        if (uniq.length !== S.draft.need)
            return false;
        S.deck = uniq.map(i => mkCard(S, S.draft.offer[i])).concat(S.extraStart.map(id => mkCard(S, id)));
        const fill = D.cards.filter(c => !c.unlock && ['C', 'U', 'R'].includes(c.rarity) && c.alignment !== '抑圧');
        const W = { C: 70, U: 25, R: 5 };
        for (let n = 0; n < FILLER; n++) {
            let t = Math.random() * fill.reduce((a, c) => a + W[c.rarity], 0), q = 0;
            while (q < fill.length - 1 && t > W[fill[q].rarity]) {
                t -= W[fill[q].rarity];
                q++;
            }
            S.deck.push(mkCard(S, fill[q].id));
        }
        log(S, `最初の対策として${uniq.length}つの制度を整えた。`, 'sys');
        S.draft = null;
        S.nextD = makeDisaster(S);
        startRound(S);
        return true;
    }
    function makeDisaster(S, winterStage) {
        let d;
        if (winterStage) {
            const w = WINTER_STAGES[winterStage - 1];
            d = { name: w.name, type: w.type, keys: w.keys.slice(), boss: true, winter: winterStage, rule: 'winter', restriction: '中央のカードが効きにくく、地方のカードと協力関係が力になる' };
        }
        else if (S.rie === 2) {
            if (S.era === 8 && !S.endless)
                return makeDisaster(S, 1);
            if (S.era > 8) {
                const name = pick(D.disasters.endless).name;
                const rule = BOSS_RULE[pick(D.disasters.boss).name];
                d = { name, type: ENDLESS_TYPE[name], boss: true, catastrophe: true, rule, restriction: '破滅級。' + RULE_TEXT[rule] };
            }
            else {
                let pool = D.disasters.boss.filter(b => !S.bossesUsed.includes(b.name));
                if (!pool.length)
                    pool = D.disasters.boss;
                const b = pick(pool);
                d = { name: b.name, type: b.type, boss: true, rule: BOSS_RULE[b.name], restriction: RULE_TEXT[BOSS_RULE[b.name]] };
            }
        }
        else {
            const ws = D.disasters.normal.map(n => {
                let w = 1;
                if (n.type === '社会')
                    w += S.U / 30;
                if (n.name === '陰謀')
                    w += S.U / 15 + (S.flags.secretLeak ? 6 : 0);
                if (n.name === '分離運動' || n.name === '地方間対立')
                    w += alive(S).filter(r => r.trust <= 3).length * 0.4 + alivePairs(S).filter(([a, b]) => getRel(S, a, b) <= -15).length * 0.5;
                return w;
            });
            let t = Math.random() * ws.reduce((a, b) => a + b, 0), i = 0;
            while (i < ws.length - 1 && t > ws[i]) {
                t -= ws[i];
                i++;
            }
            const n = D.disasters.normal[i];
            d = { name: n.name, type: n.type, boss: false };
        }
        if (!d.keys)
            d.keys = (DKEY[d.name] || []).slice();
        return d;
    }
    function reqFor(S, d) {
        const e = S.era;
        let base = 1150 * Math.pow(1.55, Math.min(e, 8) - 1);
        if (e > 8) {
            const k = e - 8;
            let lg = 6;
            for (let i = 2; i <= k; i++)
                lg += Math.min(3, 1 + (i - 2) * 0.25);
            const boss = Math.pow(10, lg) * (S.reqMul || 1);
            return Math.round((d.boss ? boss : boss / (S.rie === 0 ? 4 : 2.5)) / 10) * 10;
        }
        let m = d.boss ? 1.5 : (S.rie === 0 ? 1 : 1.15);
        if (d.winter)
            m = 1.3;
        if (d.catastrophe)
            m = 2.4;
        let r = base * m * (S.reqMul || 1);
        if (hasTrait(S, 'technocrat') && d.boss && d.type === '自然')
            r *= 1.3;
        if (d.rule === 'centralSpread')
            r *= 1 + Ceff(S) / 80;
        if (d.rule === 'intrigue')
            r *= 1 + S.U / 60;
        if (S.flags.afterRevolution && owned(S, 'perm_revolution'))
            r *= 0.5;
        if (S.endless && owned(S, 'apocalypse') && new Set(S.absorbed.map(n => n.type)).size >= 3)
            r *= 0.5;
        return Math.max(10, Math.round(r / 10) * 10);
    }
    function maxPlay(S) {
        let n;
        if (S.charId === 'exile')
            n = 4 + (owned(S, 'temp_capital') ? 1 : 0);
        else if (S.charId === 'anarchist')
            n = 5;
        else
            n = 4 + Math.floor(Ceff(S) / 30);
        if (hasAb(S, 'iron'))
            n += 2;
        n -= S.lowerPlay || 0;
        if (hasAb(S, 'open_table'))
            n += 2;
        return Math.max(1, n);
    }
    function maxDiscard(S) { return 5 + (hasAb(S, 'extradiscard') ? 2 : 0); }
    function handLimit(S) {
        let n = S.handSize + (hasAb(S, 'bighand') ? 2 : 0) + 2 * facCount(S, 'big_desk');
        if (S.R && S.R.d && S.R.d.rule === 'famine' && !S.R.done)
            n -= 2;
        return n;
    }
    function snapshot(S) {
        const meta = S.meta;
        S.meta = null;
        S.snapshot = null;
        const snap = JSON.stringify(S);
        S.meta = meta;
        return snap;
    }
    function startRound(S, winterStage) {
        S.phase = 'round';
        S.roundNo++;
        const d = winterStage ? makeDisaster(S, winterStage) : (S.nextD || makeDisaster(S));
        S.nextD = null;
        S.event = null;
        const R = S.R = {
            d, req: 0, total: S.carry || 0, playsLeft: S.plays + (hasAb(S, 'extraplay') ? 2 : 0) + 2 * facCount(S, 'express'),
            discardsLeft: d.rule === 'blackout' ? 0 : S.discards + (hasAb(S, 'extradiscard') ? 3 : 0) + 2 * facCount(S, 'archives'),
            decl: false, declBonus: 0, backerDecl: false, noDelay: false, deferred: 0, isolated: d.rule === 'isolation',
            cIncrease: false, results: [], played: 0, firstPlay: true, playsUsed: 0, discardsUsed: 0, allGeneral: true, done: false, success: null, backerPending: false, enemyRegion: null, lostRegion: null
        };
        if (S.carry)
            log(S, `前のラウンドから${nf(S.carry)}の対策値が持ち越された。`);
        S.carry = 0;
        R.req = reqFor(S, d);
        if (hasAb(S, 'intel'))
            R.req = Math.max(10, Math.round(R.req * 0.85));
        if (S.flags.reqDebt) {
            const cut = Math.min(S.flags.reqDebt, R.req * 0.8);
            R.req = Math.max(10, Math.round(R.req - cut));
            log(S, `前のラウンドの余波で、必要対策値が${nf(cut)}下がった。`, 'good');
            S.flags.reqDebt = 0;
        }
        if (d.boss && !d.winter && !d.catastrophe) {
            if (!S.bossesUsed.includes(d.name))
                S.bossesUsed.push(d.name);
            if (!S.meta.bossesSeen.includes(d.name))
                S.meta.bossesSeen.push(d.name);
        }
        S.experiencedType[d.type] = (S.experiencedType[d.type] || 0) + 1;
        S.experienced[d.name] = (S.experienced[d.name] || 0) + 1;
        d.keys.forEach(k => { if (k !== d.name)
            S.experienced[k] = (S.experienced[k] || 0) + 1; });
        const Ce = Ceff(S);
        const pairs = alivePairs(S);
        if (pairs.length) {
            pairs.forEach(([a, b]) => { const base = (S.relBase || {})[rk(a, b)] || 0, v = getRel(S, a, b); if (v !== base && Math.random() < 0.5) {
                const step = Math.max(1, Math.round(Math.abs(v - base) * 0.12));
                setRel(S, a, b, v + (v > base ? -step : step));
            } });
            if (Ce <= 30) {
                const [a, b] = pick(pairs);
                addRel(S, a, b, 1, true);
            }
            if (hasTrait(S, 'mediator')) {
                const [a, b] = pick(pairs);
                addRel(S, a, b, 1, true);
            }
            if (Ce >= 60) {
                const [a, b] = pick(pairs);
                addRel(S, a, b, -1, true);
            }
        }
        for (let i = 0; i < facCount(S, 'treaty_hall'); i++) {
            const w = worstPair(S);
            if (w)
                addRel(S, w[0], w[1], 4, true);
        }
        if (hasAb(S, 'network')) {
            const w = worstPair(S);
            if (w)
                addRel(S, w[0], w[1], 3, true);
        }
        ownedList(S, 'round_table').forEach(() => addLinks(S, 1));
        log(S, `${roundLabel(S)}:${d.name}(${d.type})。必要対策値 ${nf(R.req)}。`, d.boss ? 'boss' : 'dis');
        if (d.boss && d.restriction)
            log(S, d.restriction, 'rule');
        if (d.boss)
            changeC(S, S.charId === 'mirror' ? -1 : 1);
        {
            const shook = shuffle(alive(S).slice()).slice(0, d.boss ? 2 : 1);
            shook.forEach(q => { q.trust = Math.max(0, q.trust - 1); });
            if (shook.length)
                log(S, `${d.name}の知らせに、${shook.map(q => q.name).join('と')}が動揺している。`, 'react');
        }
        if (d.rule === 'noFunds') {
            S.funds = 0;
            log(S, '恐慌で議会の金庫が空になった。');
        }
        if (d.rule === 'regionLost') {
            const r = pick(alive(S));
            R.lostRegion = r.id;
            log(S, `${r.name}は灰に覆われ、連絡がつかない。`);
        }
        if (d.rule === 'isolation')
            log(S, '川が溢れ、地方どうしの道が切れた。');
        if (d.rule === 'civilWar') {
            const lo = alive(S).slice().sort((a, b) => a.trust - b.trust)[0];
            R.enemyRegion = lo.id;
            log(S, `${lo.name}は首都の命令に従わない。`);
        }
        if (S.charId === 'twins' && S.roundNo > 1 && !S.flags.twinLock)
            S.twinIdx = 1 - S.twinIdx;
        if (S.prophecy) {
            if (S.prophecy === d.type) {
                S.propStreak++;
                log(S, '予言は当たった。人々はあなたの言葉を信じた。');
            }
            else {
                S.propStreak = 0;
                S.propMiss++;
                if (!owned(S, 'false_prophecy')) {
                    allTrust(S, -2);
                    log(S, '予言は外れた。広場であなたの名前が笑われている。');
                }
                else
                    log(S, '予言は外れたが、誰もそれを覚えていないようだった。');
            }
            S.prophecy = null;
        }
        if (owned(S, 'martial_law'))
            declare(S, { auto: true, fixed: true });
        if (S.charId === 'puppet' && !R.decl && Math.random() < (d.boss ? 0.8 : 0.45))
            R.backerPending = true;
        S.drawPile = shuffle(S.deck.map(c => c.uid));
        S.hand = [];
        S.discard = [];
        drawTo(S);
        S.snapshot = owned(S, 'revision') && !S.flags.revisionUsed ? snapshot(S) : null;
        saveRun(S);
    }
    function drawTo(S) {
        const lim = handLimit(S);
        while (S.hand.length < lim) {
            if (!S.drawPile.length) {
                if (!S.discard.length)
                    break;
                S.drawPile = shuffle(S.discard.filter(u => cardByUid(S, u)));
                S.discard = [];
                log(S, '捨て札を切り直して山札に戻した。', 'sys');
                if (!S.drawPile.length)
                    break;
            }
            S.hand.push(S.drawPile.shift());
        }
    }
    function backerChoice(S, choice) {
        const R = S.R;
        if (!R || !R.backerPending)
            return;
        R.backerPending = false;
        if (choice === 'ride') {
            declare(S, { backer: true });
            S.stats.backerRides++;
            if (S.stats.backerRides >= 5)
                unlockCard(S, 'reverse_puppet');
        }
        else if (choice === 'cut' && owned(S, 'cut_strings')) {
            removeCard(S, S.deck.find(x => x.id === 'cut_strings'));
            drawTo(S);
            addU(S, -20);
            log(S, '糸は切られた。背後の部屋から、しばらく物音がしなかった。');
            chron(S, '背後の勢力の宣言を拒否した', 'resist');
        }
        else {
            addU(S, 5);
            log(S, '宣言は見送られた。背後の部屋の扉が、少し強く閉められた。', 'react');
        }
    }
    function canDeclare(S) { return S.phase === 'round' && S.R && !S.R.decl && S.charId !== 'puppet' && !S.R.done; }
    const DECL_REACT = [
        '各地から歓迎の声が届いた。迅速な決断だと評されている。',
        '宣言は滞りなく受け入れられた。',
        '地方代表の何人かは、拍手のあいだ手元の書類を見ていた。',
        '閣議室は静かだった。',
        '署名のあと、側近の一人がしばらく窓の外を見ていた。'
    ];
    const DECL_REACT_LATE = ['反応はなかった。', '放送は予定どおり流れた。', '地方からの返信は、いつもより短かった。', '誰も異を唱えなかった。', '会見場の椅子に、空席が目立った。'];
    function declare(S, opt) {
        opt = opt || {};
        const R = S.R;
        if (!R || R.decl || R.done)
            return false;
        if (S.charId === 'puppet' && !opt.backer && !opt.auto)
            return false;
        const n = S.declCount;
        let bonus = (owned(S, 'perm_emergency') || hasAb(S, 'emergency_norm')) ? 2.5 : 2.5 * Math.pow(0.72, n);
        S.stats.noCRounds = Math.floor((S.stats.noCRounds || 0) / 2);
        if (opt.fixed)
            bonus = 1.0;
        if (hasTrait(S, 'mediator'))
            bonus *= 0.5;
        R.decl = true;
        R.declBonus = bonus;
        R.backerDecl = !!opt.backer;
        S.declCount++;
        S.declEra++;
        let dc = 1 + 1.8 * n;
        if (opt.backer && owned(S, 'ventriloquism'))
            dc = 0;
        if (S.charId === 'mirror')
            dc = -dc;
        if (dc)
            changeC(S, dc);
        let du = 4 * Math.pow(1.4, n);
        if (owned(S, 'perm_emergency'))
            du *= 2;
        if (owned(S, 'censorship'))
            du *= 0.5;
        addU(S, du);
        S.streakNoC = 0;
        emit(S, 'declare');
        if (S.charId === 'mirror' && S.declCount >= 10)
            unlockCard(S, 'reflection');
        chron(S, opt.backer ? '背後の勢力が緊急事態宣言を発令' : opt.auto ? '戒厳令により緊急事態宣言が自動発令' : '緊急事態宣言を発令', 'decl');
        log(S, opt.backer ? '背後の勢力の名で、緊急事態宣言が読み上げられた。' : '緊急事態宣言を発令した。', 'decl');
        log(S, n < DECL_REACT.length ? DECL_REACT[n] : pick(DECL_REACT_LATE), 'react');
        return true;
    }
    function discard(S, uids) {
        const R = S.R;
        if (!R || R.done || R.discardsLeft <= 0)
            return false;
        const sel = uids.filter(u => S.hand.includes(u)).slice(0, maxDiscard(S));
        if (!sel.length)
            return false;
        sel.forEach(u => { S.hand.splice(S.hand.indexOf(u), 1); S.discard.push(u); });
        S.stats.discardsTotal = (S.stats.discardsTotal || 0) + sel.length;
        R.discardedUids = (R.discardedUids || []).concat(sel);
        emit(S, 'discardCard', sel.length);
        drawTo(S);
        R.discardsLeft--;
        R.discardsUsed++;
        return true;
    }
    const on = (b, v) => b ? v : 0;
    const FX = {
        granary: () => ({}),
        central_reserve: (c, x) => ({ p: on(x.Ce >= 40, 40) }),
        fire_brigade: (c, x) => ({ p: on(x.has('火災') || x.has('地震'), 50) }),
        levee: (c, x) => ({ p: on(x.has('洪水'), 120) }),
        quake_code: (c, x) => ({ a: on(x.has('地震'), 2) }),
        quarantine: (c, x) => ({ p: on(x.has('疫病'), 80) }),
        backup_power: (c, x) => ({ p: on(x.d.type === '人災', 40) }),
        state_broadcast: (c, x) => ({ p: on(x.d.type === '社会', 20), a: on(x.has('暴動'), 1) }),
        mobilization: () => ({ side: S => changeC(S, S.charId === 'mirror' ? -3 : 3) }),
        emergency_tax: () => ({ side: S => allTrust(S, -1) }),
        rationing: (c, x) => ({ p: on(x.has('干ばつ'), 100) }),
        cb_intervention: (c, x) => ({ p: on(x.has('金融'), 150) }),
        dam: (c, x) => ({ p: on(x.has('洪水') || x.has('干ばつ'), 60) }),
        foreign_aid: () => ({ consume: true }),
        nuclear_reg: (c, x) => ({ p: on(x.has('原発'), 200) }),
        ceasefire: (c, x) => ({ p: on(x.has('内戦') || x.has('分離'), 90) }),
        volcano_obs: (c, x) => ({ p: on(x.has('噴火'), 80) }),
        fin_supervision: (c, x) => ({ p: on(x.has('金融'), 60) }),
        disaster_edu: (c, x) => { let v = 10 * c.inst.eras; if (owned(x.S, 'edu_chain'))
            v *= Math.pow(1.5, maxEras(x.S, 'edu_chain') + 1); return { p: v, a: on(x.d.type === '自然', 0.5) }; },
        training: c => ({ p: 5 * c.inst.rounds }),
        volunteer_fire: (c, x) => ({ p: 6 * x.n + 4 * c.inst.eras }),
        public_health: (c, x) => ({ a: 0.5 * (x.S.survived['疫病'] || 0) }),
        research_lab: (c, x) => ({ p: 15 * (x.S.survivedType['人災'] || 0) }),
        infra_maint: (c, x) => ({ p: 2 * x.S.spentTotal }),
        local_assembly: (c, x) => ({ p: 2 * x.sumTrust }),
        transparency: c => ({ p: c.inst.g.v || 0 }),
        bureaucracy: (c, x) => ({ p: x.Ce }),
        local_press: (c, x) => ({ p: 5 * x.n }),
        weather_bureau: (c, x) => ({ p: 10 * (x.S.experiencedType['自然'] || 0) }),
        insurance: (c, x) => ({ p: x.S.flags.insurance ? 40 : 0 }),
        vocational: (c, x) => ({ p: 4 * x.n, a: on(x.d.type === '人災', 1) }),
        rotation_stock: (c, x) => ({ p: 6 * x.L * x.lp }),
        drill: (c, x) => x.d.boss ? ({ p: x.S.drillStore, side: S => { S.drillStore = 0; }, note: '蓄えを放出' }) : ({}),
        rescue_corps: c => ({ p: 5 * c.inst.eras }),
        cyber_def: (c, x) => ({ a: 0.5 * (x.S.experienced['インフラ'] || 0) }),
        food_mutual: (c, x) => ({ p: on(x.has('干ばつ'), 15 * x.L * x.lp) }),
        chronicle: (c, x) => ({ p: 2 * x.S.chron.length }),
        silent_year: (c, x) => ({ x: x.cards.length === 1 ? 8 : 1 }),
        odd_alliance: (c, x) => ({ a: on(x.L % 2 === 1, 3) }),
        last_stand: (c, x) => ({ x: x.alive.some(r => r.hp <= 2) ? 4 : 1 }),
        festival: (c, x) => ({ auto: x.S.U < 1 && x.d.type === '社会' && !x.d.boss }),
        council_rule: (c, x) => ({ x: x.Ce <= 10 ? 3 : 1 }),
        blank_check: (c, x) => ({ x: Math.round(x.S.C) === 50 ? 4 : 1 }),
        triad: (c, x) => { const t = new Set(x.cards.map(k => k.def.target.split(':')[0])); return { x: TYPES.every(y => t.has(y)) ? 3 : 1 }; },
        chain_reaction: (c, x) => { const m = {}; x.cards.forEach(k => { const t = k.def.target.split(':')[0]; m[t] = (m[t] || 0) + 1; }); const mx = Math.max(...Object.values(m)); return { x: mx >= 3 ? mx : 1 }; },
        rain_prayer: (c, x) => ({ auto: x.has('干ばつ') && !x.d.boss && !!x.S.prevDisaster && x.S.prevDisaster.keys.includes('洪水') }),
        before_storm: (c, x) => ({ px: x.S.omenCount >= 3 ? 3 : 1 }),
        arbitration: (c, x) => ({ auto: x.has('対立') && !x.d.boss }),
        mutual_aid: (c, x) => ({ a: Math.pow(x.L, 1.5) * x.lp / 3 }),
        local_currency: c => ({ x: Math.min(20, Math.pow(1.1, c.inst.rounds)) }),
        grassroots: (c, x) => ({ p: x.sumTrust * x.sumTrust / 10 }),
        knowledge_share: (c, x) => { const n = x.S.deck.filter(k => RESEARCH_CARDS.has(k.id)).length; return { x: Math.pow(2, clamp(n - 1, 0, 5)) }; },
        reforestation: c => ({ x: Math.pow(1.3, c.inst.eras) }),
        self_rule: (c, x) => ({ x: Math.min(50, Math.pow(1.15, x.S.streakNoC)) }),
        citizen_science: (c, x) => ({ px: x.d.type === '自然' ? Math.pow(1.2, x.S.survivedType['自然'] || 0) : 1 }),
        consensus: (c, x) => {
            const g = c.inst.g;
            if (g.first == null)
                return { side: () => { g.first = x.S.roundNo; }, note: '合意を待っている' };
            const k = x.S.roundNo - g.first;
            if (k < 3)
                return { note: '合意を待っている' };
            return { x: Math.pow(1.4, k - 2) };
        },
        vaccine: (c, x) => ({ x: x.has('疫病') ? Math.pow(1.5, x.S.experienced['疫病'] || 0) : 1 }),
        grid_link: (c, x) => ({ a: on(x.d.type === '人災', Math.pow(x.L, 1.3) * x.lp / 2) }),
        standing_police: (c, x) => ({ auto: x.has('陰謀') && !x.d.boss }),
        praetorian: (c, x) => ({ p: on(x.Ce >= 70, 2 * x.Ce) }),
        purge: () => ({ side: S => { addU(S, -25); allTrust(S, -3); chron(S, '粛清を実行', 'decl'); log(S, '名簿の何人かが、翌朝から出勤しなくなった。', 'react'); } }),
        state_exception: (c, x) => ({ x: x.Ce >= 100 ? 10 : 1 }),
        handshake: (c, x) => { const hit = x.has('対立') && !x.d.boss; return { auto: hit, side: hit ? S => addLinks(S, 1, '握手の儀') : null }; },
        veterans_assoc: (c, x) => ({ p: on(x.d.type === '社会', 15 * x.n) }),
        cost_benefit: () => ({ a: 2 }),
        home_banner: (c, x) => { const h = x.S.homeId != null ? regionById(x.S, x.S.homeId) : null; return { x: h && !h.dead ? 2 : 1 }; },
        regional_league: (c, x) => { const h = x.S.homeId != null ? regionById(x.S, x.S.homeId) : null; return { p: h && !h.dead ? 20 * x.L * x.lp : 0 }; },
        literature_review: (c, x) => {
            const g = c.inst.g;
            if (g.done || !x.S.prevDisaster)
                return {};
            const t = x.S.prevDisaster.type;
            return { side: S => { g.done = true; S.litTypes[t] = (S.litTypes[t] || 0) + 2; log(S, `文献調査:${t}系の災害への理解が深まった。`); } };
        },
        return_promise: (c, x) => ({ x: x.alive.every(r => r.trust >= 7) ? 4 : 1 }),
        scattered_envoys: (c, x) => { const k = x.localCount; return { side: S => addLinks(S, k, '散らばる大使') }; },
        dissolution: () => ({ side: S => { changeC(S, -10); S.flags.dissolutionEra = S.era; chron(S, '解体令を発布', 'resist'); } }),
        burn_legacy: () => ({ consume: true, side: S => burnLegacy(S) }),
        last_speech: () => ({ consume: true, side: S => { changeC(S, -30); addU(S, 30); chron(S, '最後の演説', 'resist'); log(S, '演説は長かった。最後まで聞いていた者は、多くなかった。', 'react'); } }),
        neighbor: (c, x) => ({ p: 10 * x.S.hand.filter(u => u !== c.inst.uid && (cardByUid(x.S, u) || {}).id === 'neighbor').length }),
        accidental_hero: () => { const hit = Math.random() < 0.05; return { x: hit ? 10 : 1, note: hit ? '誰かが現れた' : '' }; },
        nameless_crowd: (c, x) => ({ p: 3 * Math.pow(x.S.hand.length, 2) }),
        eschatology: (c, x) => ({ a: x.S.propStreak }),
        awakening: (c, x) => ({ x: Math.max(1, x.S.idleStack * 2), consume: true, side: S => { S.idleStack = 1; } }),
        schism: () => ({ consume: true, side: S => splitRegion(S, pick(alive(S)).id) }),
        union_without: (c, x) => ({ a: x.n * x.n / 4 }),
        inverted_chronicle: (c, x) => ({ x: x.S.critical ? 5 : 1 }),
        uprising: () => ({ consume: true, side: S => { S.flags.pendingRevolution = true; } }),
        double_down: (c, x) => ({ x: x.S.betMult }),
        twin_will: () => ({ a: 1 }),
        deja_vu: (c, x) => ({ px: x.S.meta.lastDisaster === x.d.name ? 3 : 1 }),
        devour: (c, x) => ({ p: 50 * x.S.absorbed.filter(a => a.type === x.d.type).length }),
        resonance: (c, x) => ({ x: Math.max(1, new Set(x.S.absorbed.map(a => a.type)).size) }),
        donation: () => ({ side: S => { S.funds += 2; }, note: '議会資金+2' }),
        tax_revenue: (c, x) => ({ side: S => { S.funds += Math.floor(S.C / 20); }, note: `議会資金+${Math.floor(x.S.C / 20)}` }),
        local_industry: (c, x) => { const r = c.region; const v = r ? Math.floor(r.trust / 3) : 0; return { side: S => { S.funds += v; }, note: `議会資金+${v}` }; },
        windfall: (c, x) => x.R.playsLeft === 1 ? { side: S => { S.funds += 4; }, note: '議会資金+4' } : {},
        encore: () => ({ retrig: 'prev' }),
        echo: () => ({ retrig: 'sameRegion' }),
        chorus: () => ({ retrig: 'allBefore' }),
        reflection: () => ({ retrig: 'prev' }),
        double_sign: () => ({ retrig: 'best' }),
        rally: () => ({ rally: 1.5, note: '以後の対応力×1.5' }),
        amplifier: () => ({ x: 1.5 }),
        bell: (c, x) => ({ x: Math.pow(1.15, x.firedCount) }),
        jackpot: (c, x) => ({ x: x.M >= 10 ? 2 : 1 }),
        solidarity: (c, x) => { let s = 0; for (let i = 0; i < x.cards.length; i++)
            for (let j = i + 1; j < x.cards.length; j++) {
                const a = x.cards[i].inst.region, b = x.cards[j].inst.region;
                if (a !== b)
                    s += getRel(x.S, a, b);
            } return { a: 0.05 * s }; },
        bridge_builder: (c, x) => ({ a: 0.05 * regionRelSum(x.S, c.inst.region) }),
        envoy_card: c => ({ side: S => { const me = c.inst.region; const os = alive(S).filter(r => r.id !== me); if (!os.length)
                return; const mn = Math.min(...os.map(r => getRel(S, me, r.id))); const t = pick(os.filter(r => getRel(S, me, r.id) === mn)); addRel(S, me, t.id, 3); } }),
        mediation_card: () => ({ side: S => { const w = worstPair(S); if (w)
                addRel(S, w[0], w[1], 5); } }),
        field_hq: (c, x) => ({ p: 10 * (x.cards.length - 1) }),
        handover: (c, x) => ({ a: x.R.playsUsed }),
        reorg: (c, x) => ({ a: 1.5 * x.R.discardsUsed }),
        tour: (c, x) => ({ p: 15 * x.cards.filter(k => k !== c && k.cat === 'local').length }),
        consolidation: (c, x) => ({ p: 15 * x.cards.filter(k => k !== c && k.cat === 'central').length }),
        contingency: (c, x) => ({ p: Math.min(80, Math.floor(x.S.funds / 5) * 10) }),
        public_works: (c, x) => ({ p: on(x.d.type === '人災', 50), side: S => { S.funds += 1; } }),
        shelters: (c, x) => ({ a: on(x.d.type === '自然', 1) }),
        dialogue: (c, x) => ({ a: on(x.d.type === '社会', 1), side: S => { const r = alive(S).slice().sort((a, b) => a.trust - b.trust)[0]; if (r)
                r.trust = Math.max(0, r.trust + 1); } }),
        ambulance: (c, x) => ({ a: 0.5 * x.alive.filter(r => r.hp < r.max).length }),
        recovery_fund: () => ({ side: S => { const r = alive(S).filter(q => q.hp < q.max).sort((a, b) => a.hp / a.max - b.hp / b.max)[0]; if (r) {
                r.hp++;
                log(S, `${r.name}の復旧が進んだ。`);
            } } }),
        joint_drill: (c, x) => ({ a: 0.3 * x.L * x.lp }),
        pre_empt: (c, x) => ({ x: x.R.firstPlay ? 2 : 1 }),
        last_bastion: (c, x) => ({ x: x.R.playsLeft === 1 ? 2.5 : 1 }),
        hone: (c, x) => ({ a: 0.5 * x.cards.reduce((s, k) => s + (k.inst.lv || 0), 0) }),
        craft: (c, x) => ({ x: x.S.deck.filter(k => (k.lv || 0) > 0).length >= 3 ? 2 : 1 }),
        elite: (c, x) => ({ x: x.cards.length <= 2 ? 3 : 1 }),
        all_hands: (c, x) => ({ x: x.cards.length >= maxPlay(x.S) ? 2.5 : 1 }),
        deep_bench: (c, x) => ({ p: 8 * Math.max(0, x.S.hand.length - x.cards.length) }),
        reserve_line: (c, x) => ({ p: 6 * x.S.drawPile.length }),
        trust_token: (c, x) => ({ p: 8 * avgTrust(x.S) }),
        priming: (c, x) => ({ p: 0.15 * x.R.total }),
        return_memorial: (c, x) => ({ a: 0.5 * (x.S.stats.returns || 0) }),
        neighbor_aid: (c, x) => ({ a: on(x.L >= 5, 1) })
    };
    function qty(name, c, x) {
        const S = x.S, R = x.R, me = c.inst.region;
        const others = x.cards.filter(k => k !== c);
        switch (name) {
            case 'sameRegion': return others.filter(k => k.inst.region === me).length;
            case 'otherRegion': return others.filter(k => k.inst.region !== me).length;
            case 'playsLeft': return Math.max(0, R.playsLeft - 1);
            case 'playsUsed': return R.playsUsed;
            case 'damaged': return x.alive.filter(r => r.hp < r.max).length;
            case 'funds5': return Math.floor(S.funds / 5);
            case 'funds10': return Math.floor(S.funds / 10);
            case 'C10': return Math.floor(x.Ce / 10);
            case 'C20': return Math.floor(x.Ce / 20);
            case 'handLeft': return Math.max(0, S.hand.length - x.cards.length);
            case 'links': return x.L;
            case 'fired': return x.firedCount || 0;
            case 'eras': return c.inst.eras;
            case 'rounds': return Math.floor(c.inst.rounds);
            case 'deck5': return Math.floor(S.deck.length / 5);
            case 'heavyPlayed': return others.filter(k => (k.def.base || 0) >= 30).length;
            case 'localOthers': return others.filter(k => k.cat === 'local').length;
            case 'centralOthers': return others.filter(k => k.cat === 'central').length;
            case 'playedOthers': return others.length;
            case 'researchOthers': return others.filter(k => RESEARCH_CARDS.has(k.def.id)).length;
            case 'researchDeck': return S.deck.filter(k => RESEARCH_CARDS.has(k.id)).length;
            case 'upgraded': return S.deck.filter(k => (k.lv || 0) > 0).length;
            case 'lv': return c.inst.lv || 0;
            case 'lvTotal': return S.deck.reduce((a, q) => a + (q.lv || 0), 0);
            case 'chron3': return Math.floor(S.chron.length / 3);
            case 'omens': return S.omenCount;
            case 'relSelf10': return Math.floor(Math.max(0, regionRelSum(S, me)) / 10);
            case 'expNatural': return S.experiencedType['自然'] || 0;
            case 'survNatural': return S.survivedType['自然'] || 0;
            case 'trust': return c.region ? c.region.trust : 0;
            case 'baseSum100': return Math.floor(x.cards.reduce((s, k) => s + (k.def.base || 0), 0) / 100);
            case 'trustDeficit': return x.alive.reduce((s, r) => s + Math.max(0, 10 - r.trust), 0);
            case 'trustDeficit5': return Math.floor(x.alive.reduce((s, r) => s + Math.max(0, 10 - r.trust), 0) / 5);
            case 'fundsLog': return Math.log2(1 + Math.max(0, S.funds) / 10);
            case 'missingHp5': return Math.floor((x.alive.reduce((s, r) => s + (r.max - r.hp), 0) + 6 * S.regions.filter(r => r.dead).length) / 5);
            case 'played': return x.cards.length;
            case 'playsLeft': return Math.max(0, R.playsLeft - 1);
            case 'spentTotal': return S.spentTotal;
            case 'spentLastParl': return S.stats.spentLastParl || 0;
            case 'spentLastParl10': return Math.floor((S.stats.spentLastParl || 0) / 10);
            case 'spent100': return Math.floor(S.spentTotal / 100);
            case 'regionsPlayed': return new Set(x.cards.map(q => q.inst.region)).size;
            case 'spent20': return Math.floor(S.spentTotal / 20);
            case 'firedSameRegion': return (x.firedRegions || []).filter(r0 => r0 === me).length;
            case 'discardsLeft': return R.discardsLeft;
            case 'damageTaken2': return Math.floor((S.stats.damageTaken || 0) / 2);
            case 'baseSum50': return Math.floor(x.cards.reduce((s2, k2) => s2 + (k2.def.base || 0), 0) / 50);
            case 'decls': return S.declCount;
            case 'bossWins': return S.stats.bossWins || 0;
            case 'chronCount': return S.chron.length;
            case 'deckUnique': return new Set(S.deck.map(k2 => k2.id)).size;
            case 'deckBase100': return Math.floor(S.deck.reduce((s2, k2) => s2 + (CARD[k2.id].base || 0) + (k2.g.bb || 0), 0) / 100);
            case 'sumTrust10': return Math.floor(x.sumTrust / 10);
            case 'funds': return S.funds;
            case 'posRel': return alivePairs(S).reduce((s2, [a, b]) => s2 + Math.max(0, getRel(S, a, b)), 0);
            case 'playsUsedPlus1': return R.playsUsed + 1;
            case 'uses': return c.inst.g.uses || 0;
            case 'statSum': return (S.stats.trustTaken || 0) + (S.stats.damageTaken || 0) + (S.stats.fails || 0);
            case 'noCRounds': return S.stats.noCRounds || 0;
            case 'Cval': return x.Ce;
            case 'trustTaken': return S.stats.trustTaken || 0;
            case 'trustTaken5': return Math.floor((S.stats.trustTaken || 0) / 5);
            case 'trustTaken10': return Math.floor((S.stats.trustTaken || 0) / 10);
            case 'damageTaken': return S.stats.damageTaken || 0;
            case 'damageTaken10': return Math.floor((S.stats.damageTaken || 0) / 10);
            case 'fails': return S.stats.fails || 0;
            case 'discardsTotal': return S.stats.discardsTotal || 0;
            case 'spent50': return Math.floor(S.spentTotal / 50);
            case 'held': return c.inst.g.held || 0;
            case 'prevBaseSum': return x.cards.filter(q => q.i < c.i).reduce((s2, q) => s2 + (q.def.base || 0) + (q.inst.g.bb || 0), 0);
            case 'facilitiesCount': return (S.facilities || []).length;
            case 'emptySlots': return Math.max(0, S.facSlots - (S.facilities || []).length);
            case 'deckSize': return S.deck.length;
            case 'retrigCount': return x.retrigCount || 0;
            case 'posRel20': return Math.floor(alivePairs(S).reduce((s, [a, b]) => s + Math.max(0, getRel(S, a, b)), 0) / 20);
            case 'deckSameRegion': return S.deck.filter(k => k.region === me).length;
            case 'strongPairsPlayed': {
                let n = 0;
                for (let i = 0; i < x.cards.length; i++)
                    for (let j = i + 1; j < x.cards.length; j++) {
                        const a = x.cards[i].inst.region, b = x.cards[j].inst.region;
                        if (a !== b && getRel(S, a, b) >= LINK_AT)
                            n++;
                    }
                return n;
            }
            case 'missingHp': return x.alive.reduce((s, r) => s + (r.max - r.hp), 0);
            case 'deadRegions': return S.regions.filter(r => r.dead).length;
            case 'trustGap5': return Math.floor(x.alive.reduce((s, r) => s + (10 - r.trust), 0) / 5);
            case 'negPairs': return alivePairs(S).filter(([a, b]) => getRel(S, a, b) < 0).length;
            case 'worstAbs': {
                const w = worstPair(S);
                return w ? Math.max(0, -getRel(S, w[0], w[1])) : 0;
            }
            case 'lowTrust': return x.alive.filter(r => r.trust <= (x._lowT || 3)).length;
        }
        return 1;
    }
    function condOk(cond, c, x) {
        const S = x.S, R = x.R, me = c.inst.region;
        for (const k of Object.keys(cond)) {
            const v = cond[k];
            let ok = true;
            if (k === 'type')
                ok = x.d.type === v;
            else if (k === 'key')
                ok = x.has(v);
            else if (k === 'keyAny')
                ok = v.some(q => x.has(q));
            else if (k === 'boss')
                ok = !!x.d.boss === v;
            else if (k === 'first')
                ok = !!R.firstPlay === v;
            else if (k === 'last')
                ok = (R.playsLeft === 1) === v;
            else if (k === 'playedLte')
                ok = x.cards.length <= v;
            else if (k === 'playedGte')
                ok = x.cards.length >= v;
            else if (k === 'sameGte')
                ok = x.cards.filter(q => q.inst.region === me).length >= v;
            else if (k === 'sameAll')
                ok = x.cards.every(q => q.inst.region === me) === v;
            else if (k === 'allDiff')
                ok = (new Set(x.cards.map(q => q.inst.region)).size === x.cards.length) === v;
            else if (k === 'relPlayedGte')
                ok = x.cards.some(q => q !== c && q.inst.region !== me && getRel(S, me, q.inst.region) >= v);
            else if (k === 'cGte')
                ok = x.Ce >= v;
            else if (k === 'fundsGte')
                ok = S.funds >= v;
            else if (k === 'declared')
                ok = !!R.decl === v;
            else if (k === 'critRegion')
                ok = x.alive.some(r => r.hp <= 2) === v;
            else if (k === 'prevWin')
                ok = !!S.flags.prevWin === v;
            else if (k === 'avgTrustLte')
                ok = avgTrust(S) <= v;
            else if (k === 'isRetrig')
                ok = !!x.curRetrig === v;
            else if (k === 'playedEq')
                ok = x.cards.length === v;
            else if (k === 'regionsPlayedGte')
                ok = new Set(x.cards.map(q => q.inst.region)).size >= v;
            else if (k === 'lateGame')
                ok = !!(x.d.winter || S.endless) === v;
            else if (k === 'armed')
                ok = !!c.inst.g.armed === v;
            else if (k === 'spentLastParl0')
                ok = ((S.stats.spentLastParl || 0) === 0 && S.roundNo > 1) === v;
            else if (k === 'allTrustLte')
                ok = x.alive.length > 0 && x.alive.every(r => r.trust <= v);
            else if (k === 'pos')
                ok = c.i === v - 1;
            else if (k === 'deckLte')
                ok = S.deck.length <= v;
            else if (k === 'allPairsGte') {
                const rs = [...new Set(x.cards.map(q => q.inst.region))];
                ok = rs.length >= 2;
                for (let i = 0; i < rs.length && ok; i++)
                    for (let j = i + 1; j < rs.length; j++)
                        if (getRel(S, rs[i], rs[j]) < v) {
                            ok = false;
                            break;
                        }
            }
            else if (k === 'lowTrustPlayed')
                ok = x.cards.some(q => q.region && q.region.trust <= (x._lowT || 3)) === v;
            else if (k === 'allTrustLte')
                ok = x.alive.every(r => r.trust <= v);
            if (!ok)
                return false;
        }
        return true;
    }
    function relEffect(S, c, o) {
        const me = c.inst.region;
        const os = alive(S).filter(r => r.id !== me);
        if (o.to === 'worst') {
            const w = worstPair(S);
            if (w)
                addRel(S, w[0], w[1], o.d);
            return;
        }
        if (o.to === 'best') {
            const ps = alivePairs(S);
            if (!ps.length)
                return;
            const mx = Math.max(...ps.map(([a, b]) => getRel(S, a, b)));
            const [a, b] = pick(ps.filter(([a2, b2]) => getRel(S, a2, b2) === mx));
            addRel(S, a, b, o.d);
            return;
        }
        if (o.to === 'selfAll') {
            os.forEach(r => addRel(S, me, r.id, o.d));
            return;
        }
        if (o.to === 'selfWorst') {
            if (!os.length)
                return;
            const mn = Math.min(...os.map(r => getRel(S, me, r.id)));
            addRel(S, me, pick(os.filter(r => getRel(S, me, r.id) === mn)).id, o.d);
            return;
        }
        if (o.to === 'played') {
            const ids = new Set((S.R && S.R.lastPlayRegions) || []);
            ids.delete(me);
            ids.forEach(id => addRel(S, me, id, o.d));
        }
    }
    function trustEffect(S, c, o) {
        if (o.to === 'all') {
            allTrust(S, o.d);
            return;
        }
        if (o.to === 'self') {
            const me = regionById(S, c.inst.region);
            if (me && !me.dead)
                me.trust = Math.max(0, me.trust + o.d);
            return;
        }
        const srt = alive(S).slice().sort((a, b) => a.trust - b.trust);
        const r = o.to === 'highest' ? srt[srt.length - 1] : srt[0];
        if (r)
            r.trust = Math.max(0, r.trust + o.d);
    }
    function upgradable(S) { return S.deck.filter(q => (q.lv || 0) < maxLvOf(S, q)); }
    function fresh(S) { const f = S.deck.filter(q => !(q.lv || 0)); return f.length ? f : upgradable(S); }
    function upRandom(S, n) { shuffle(fresh(S).slice()).slice(0, n).forEach(q => lvUp(S, q, 1)); }
    function upBest(S, n) { fresh(S).slice().sort((a, b) => ((CARD[b.id].base || 0) + (b.g.bb || 0)) - ((CARD[a.id].base || 0) + (a.g.bb || 0))).slice(0, n).forEach(q => lvUp(S, q, 1)); }
    function lvUp(S, inst, n) {
        if (!inst || !CARD[inst.id])
            return;
        const def = CARD[inst.id];
        if (def.evolve && CARD[def.evolve]) {
            const old = def.name;
            inst.id = def.evolve;
            inst.lv = 0;
            inst.g = {};
            log(S, `「${old}」が「${CARD[inst.id].name}」に化けた。`, 'unlock');
            emit(S, 'upgrade', 1, { inst });
            return;
        }
        const b = inst.lv || 0;
        inst.lv = Math.min(maxLvOf(S, inst), b + n);
        if (inst.lv > b)
            emit(S, 'upgrade', inst.lv - b, { inst });
    }
    function levelTargets(S, c, x, to) {
        const others = x.cards.filter(q => q !== c);
        const byBase = arr => arr.slice().sort((a, b) => ((CARD[b.inst ? b.inst.id : b.id].base || 0) - (CARD[a.inst ? a.inst.id : a.id].base || 0)));
        if (to === 'self')
            return [c.inst];
        if (to === 'bestPlayed') {
            const b = byBase(others)[0];
            return b ? [b.inst] : [];
        }
        if (to === 'playedCentral')
            return others.filter(q => q.cat === 'central').map(q => q.inst);
        if (to === 'playedSame')
            return others.filter(q => q.inst.region === c.inst.region).map(q => q.inst);
        if (to === 'allPlayed')
            return others.map(q => q.inst);
        if (to === 'nextPlayed') {
            const q = x.cards.find(q2 => q2.i === c.i + 1);
            return q ? [q.inst] : [];
        }
        if (to === 'hand') {
            const played = x.cards.map(q => q.inst.uid);
            const h = S.hand.filter(u => !played.includes(u)).map(u => cardByUid(S, u)).filter(q => q && (q.lv || 0) < maxLvOf(S, q));
            return h.length ? [pick(h)] : [];
        }
        if (to === 'highestDeck') {
            const t = fresh(S).slice().sort((a, b) => (CARD[b.id].base || 0) - (CARD[a.id].base || 0))[0];
            return t ? [t] : [];
        }
        if (to === 'allDeck')
            return S.deck.slice();
        return [];
    }
    function spendNote(S, v) {
        v = +v || 0;
        if (v <= 0)
            return;
        S.spentTotal += v;
        S.stats.spentThisParl = (S.stats.spentThisParl || 0) + v;
        emit(S, 'fundsSpent', v);
    }
    function watchMatch(w, info) {
        const f = w.f;
        if (!f)
            return true;
        if (!info)
            return false;
        if (f.cat && info.cat !== f.cat)
            return false;
        if (f.region && info.rk !== f.region)
            return false;
        if (f.type && info.typ !== f.type)
            return false;
        if (f.rarity) {
            const ord = 'CURLX';
            if (ord.indexOf(info.rar) < ord.indexOf(f.rarity))
                return false;
        }
        return true;
    }
    function fxOf(S, inst) { const def = CARD[inst.id]; if (!def || !def.fx)
        return null; return (inst.lv || 0) > 0 && upMode(def) === 'num' ? upTerms(def, inst.lv) : def.fx; }
    function emit(S, ev, n, info) {
        n = n || 1;
        S._emitDepth = (S._emitDepth || 0) + 1;
        if (S._emitDepth > 4) {
            S._emitDepth--;
            return;
        }
        try {
            S.deck.slice().forEach(inst => {
                const def = CARD[inst.id];
                const terms = fxOf(S, inst);
                if (!terms)
                    return;
                terms.forEach(t => {
                    const w = t.watch;
                    if (!w || w.ev !== ev || !watchMatch(w, info))
                        return;
                    if (!S.deck.includes(inst))
                        return;
                    inst.g.wc = Math.min((inst.g.wc || 0), w.n) + n;
                    while (inst.g.wc >= w.n && S.deck.includes(inst)) {
                        inst.g.wc -= w.n;
                        watchAction(S, inst, w.do, info, def.name);
                        if (!w.repeat) {
                            removeCard(S, inst);
                            emit(S, 'consume');
                            break;
                        }
                    }
                });
            });
            (S.facilities || []).forEach(f => {
                const w = FAC[f.id] && FAC[f.id].watch;
                if (!w || w.ev !== ev || !watchMatch(w, info))
                    return;
                f.g.wc = (f.g.wc || 0) + n;
                while (f.g.wc >= w.n) {
                    f.g.wc -= w.n;
                    watchAction(S, null, w.do, info, FAC[f.id].name);
                }
            });
        }
        finally {
            S._emitDepth--;
        }
    }
    function watchAction(S, inst, d, info, who) {
        const k = Object.keys(d)[0], v = d[k];
        const region = inst ? inst.region : null;
        if (k === 'levelUpHighest' || k === 'levelUpBest')
            upBest(S, v);
        else if (k === 'levelUpRegion')
            S.deck.forEach(q => { if (region != null && q.region === region)
                lvUp(S, q, v); });
        else if (k === 'levelUpTarget') {
            if (info && info.inst)
                lvUp(S, info.inst, v);
        }
        else if (k === 'bankSelf') {
            if (inst)
                inst.g.bb = (inst.g.bb || 0) + v;
        }
        else if (k === 'bankAll')
            S.deck.forEach(q => { q.g.bb = (q.g.bb || 0) + v; });
        else if (k === 'bankRegion')
            S.deck.forEach(q => { if (region != null && q.region === region)
                q.g.bb = (q.g.bb || 0) + v; });
        else if (k === 'accA') {
            if (inst)
                inst.g.accA = (inst.g.accA || 0) + v;
        }
        else if (k === 'accX') {
            if (inst)
                inst.g.accX = (inst.g.accX || 1) * v;
        }
        else if (k === 'accP') {
            if (inst)
                inst.g.accP = (inst.g.accP || 0) + v;
        }
        else if (k === 'xNext') {
            if (inst)
                inst.g.xNext = (inst.g.xNext || 1) * v;
        }
        else if (k === 'gainRare') {
            const pool = D.cards.filter(q => q.rarity === v && isAvailable(S, q.id));
            if (pool.length) {
                const c = pick(pool);
                gainCard(S, c.id, '');
                log(S, `「${c.name}」が手に入った(${who})。`, 'unlock');
            }
        }
        else if (k === 'gainAbility') {
            const ab = shuffle(abilityPool(S))[0];
            if (ab) {
                S.abilities.push(ab);
                log(S, `能力「${ABILITIES[ab].name}」を得た(${who})。`, 'unlock');
            }
        }
        else if (k === 'copySelf') {
            if (inst) {
                const c = mkCard(S, inst.id);
                c.lv = inst.lv || 0;
                S.deck.push(c);
            }
        }
        else if (k === 'healAll')
            alive(S).forEach(q => { q.hp = q.max; });
        else if (k === 'accLuck') {
            if (inst)
                inst.g.accLuck = (inst.g.accLuck || 0) + v;
        }
        else if (k === 'reviveOne') {
            const q = S.regions.find(r => r.dead);
            if (q) {
                q.dead = false;
                q.hp = 2;
                q.trust = 3;
            }
        }
        else
            cdAction(S, inst, d, true);
        if (!/^acc|^bankSelf/.test(k))
            log(S, `${who}:数えが満ちた。`, 'good');
        else if (k === 'accLuck')
            log(S, `${who}:目が肥えてきた。`, 'good');
    }
    function cdAction(S, inst, d, quiet) {
        if (!d)
            return;
        if (d.funds)
            S.funds += d.funds;
        if (d.levelUpAll)
            S.deck.forEach(q => lvUp(S, q, d.levelUpAll));
        if (d.levelUpSelf)
            lvUp(S, inst, d.levelUpSelf);
        if (d.levelUpRandom)
            upRandom(S, d.levelUpRandom);
        if (d.levelUpLowest)
            upRandom(S, 1);
        if (d.levelUpBest)
            upBest(S, d.levelUpBest);
        if (d.trustAll)
            allTrust(S, d.trustAll);
        if (d.relAll)
            alivePairs(S).forEach(([a, b]) => addRel(S, a, b, d.relAll, true));
        if (d.slot)
            S.facSlots = Math.min(SLOT_CAP, S.facSlots + d.slot);
        if (d.fundsPerUnique)
            S.funds += d.fundsPerUnique * new Set(S.deck.map(q => q.id)).size;
        if (d.permMul)
            S.flags.perp = (S.flags.perp || 1) * d.permMul;
        if (d.arm)
            inst.g.armed = true;
        if (d.transform) {
            const pool = D.cards.filter(q => q.rarity === d.transform && isAvailable(S, q.id));
            if (pool.length) {
                const nx = pick(pool);
                log(S, `「${CARD[inst.id].name}」が「${nx.name}」に変わった。`, 'unlock');
                inst.id = nx.id;
                inst.g = {};
                inst.lv = 0;
            }
        }
        if (!quiet && inst)
            log(S, `「${CARD[inst.id].name}」の数えが満ちた。`, 'good');
    }
    function tickCountdowns(S, on) {
        S.deck.slice().forEach(inst => {
            const terms = fxOf(S, inst);
            const t = terms && terms.find(q => q.countdown && q.countdown.on === on);
            if (!t)
                return;
            const cd = t.countdown, g = inst.g;
            if (g.armed && cd.do.arm)
                return;
            g.cd = (g.cd == null ? cd.n : g.cd) - 1;
            if (g.cd <= 0) {
                cdAction(S, inst, cd.do);
                if (cd.repeat)
                    g.cd = cd.n;
                else if (cd.consume)
                    removeCard(S, inst);
            }
        });
    }
    const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
    const rnd2 = v => Math.round(v * 100) / 100;
    function upMul(x, lv, rep) {
        if (!(x > 1))
            return x;
        const e = x - 1;
        const f = rep ? 1 + 0.12 * lv : x <= 1.2 ? 1.6 : x <= 2 ? 1.5 : x <= 5 ? 1.4 : 1.3;
        return rnd2(1 + e * f);
    }
    function upAdd(v, lv, rep) {
        if (!(v > 0))
            return v;
        const f = rep ? 1 + 0.12 * lv : v <= 1 ? 2 : v <= 5 ? 1.7 : v <= 50 ? 1.6 : 1.5;
        const r = v * f;
        return isInt(v) ? Math.max(v + 1, Math.round(r)) : rnd2(r);
    }
    function upFunds(v, lv, rep) { if (!(v > 0))
        return v; return rep ? Math.round(v * (1 + 0.12 * lv)) : Math.max(v + 1, Math.ceil(v * 1.5)); }
    function upCount(n, lv, rep) { if (!(n > 1))
        return n; return rep ? Math.max(1, n - Math.floor(lv / 2)) : Math.max(1, Math.round(n * 0.65)); }
    function upLimited(n, lv, rep) { return rep ? n + Math.floor(lv / 2) : n + Math.max(1, Math.round(n * 0.5)); }
    function upPow(v, lv, rep) { return rnd2(1 + (v - 1) * (rep ? 1 + 0.12 * lv : 1.5)); }
    function upPct(v, lv, rep) { return rnd2(v * (rep ? 1 + 0.12 * lv : 1.5)); }
    function upOdds(n) { return n >= 3 ? n - 1 : n; }
    function upText(text, lv, rep, legacy) {
        if (!lv)
            return text;
        if (legacy) {
            return text.replace(/(倍率|対応力)(\+|×)(\d+(?:\.\d+)?)/g, (m, w, op, n) => w + op + (op === '×' ? rnd2(1 + (+n - 1) * 1.45) : (isInt(+n) ? Math.max(+n + 1, Math.round(+n * 1.6)) : rnd2(+n * 1.6))));
        }
        const L = legacy ? { m: x => rnd2(1 + (x - 1) * 1.45), a: v => (isInt(v) ? Math.max(v + 1, Math.round(v * 1.6)) : rnd2(v * 1.6)) } : null;
        const re = /(資金\+)(\d+(?:\.\d+)?)|(\d+)(回ごとに|回目)|(使えるのは)(\d+)(回)|(信頼が?|平均が)(\d+)(以下)|(\d+)(枚以上)|1\/(\d+)|(\d+(?:\.\d+)?)(乗)|(\d+(?:\.\d+)?)(%)|×(\d+(?:\.\d+)?)|\+(\d+(?:\.\d+)?)/g;
        return text.replace(re, (m, f1, f2, c1, c2, l1, l2, l3, t1, t2, t3, g1, g2, o1, p1, p2, q1, q2, x1, a1) => {
            if (f1)
                return f1 + (legacy ? L.a(+f2) : upFunds(+f2, lv, rep));
            if (c1)
                return upCount(+c1, lv, rep) + c2;
            if (l1)
                return l1 + upLimited(+l2, lv, rep) + l3;
            if (t1)
                return t1 + (+t2 + 1) + t3;
            if (g1)
                return Math.max(1, +g1 - 1) + g2;
            if (o1)
                return '1/' + upOdds(+o1);
            if (p1)
                return upPow(+p1, lv, rep) + p2;
            if (q1)
                return upPct(+q1, lv, rep) + q2;
            if (x1)
                return '×' + (legacy ? L.m(+x1) : upMul(+x1, lv, rep));
            if (a1)
                return '+' + (legacy ? L.a(+a1) : upAdd(+a1, lv, rep));
            return m;
        });
    }
    function upDo(d, lv, rep) {
        const o = Object.assign({}, d);
        if (o.funds)
            o.funds = upFunds(o.funds, lv, rep);
        if (o.burstX)
            o.burstX = upMul(o.burstX, lv, rep);
        if (o.accA)
            o.accA = upAdd(o.accA, lv, rep);
        if (o.accX)
            o.accX = upMul(o.accX, lv, rep);
        if (o.accP)
            o.accP = upAdd(o.accP, lv, rep);
        if (o.accLuck)
            o.accLuck = upAdd(o.accLuck, lv, rep);
        if (o.bankSelf)
            o.bankSelf = upAdd(o.bankSelf, lv, rep);
        if (o.bankAll)
            o.bankAll = upAdd(o.bankAll, lv, rep);
        if (o.bankRegion)
            o.bankRegion = upAdd(o.bankRegion, lv, rep);
        if (o.permMul)
            o.permMul = upMul(o.permMul, lv, rep);
        if (o.trustAll)
            o.trustAll = upAdd(o.trustAll, lv, rep);
        if (o.relAll)
            o.relAll = upAdd(o.relAll, lv, rep);
        if (o.fundsPerUnique)
            o.fundsPerUnique = upAdd(o.fundsPerUnique, lv, rep);
        return o;
    }
    function scaleTerm(t0, m) {
        const t = JSON.parse(JSON.stringify(t0)), X = v => 1 + (v - 1) * m;
        ['x', 'px', 'rally', 'mRally'].forEach(k => { if (t[k] > 1)
            t[k] = X(t[k]); });
        ['p', 'a', 'funds', 'growFunds', 'fundsEvery', 'onWinFunds', 'bankAll', 'bankRegion', 'shield', 'draw'].forEach(k => { if (t[k] > 0)
            t[k] = Math.round(t[k] * m * 100) / 100; });
        if (t.fundsPct)
            t.fundsPct *= m;
        if (t.reqCut)
            t.reqCut = Math.min(0.5, t.reqCut * m);
        if (t.trust && t.trust.d > 0)
            t.trust.d = Math.round(t.trust.d * m);
        if (t.rel && t.rel.d > 0)
            t.rel.d = Math.round(t.rel.d * m);
        if (t.grow) {
            if (t.grow.p)
                t.grow.p *= m;
            if (t.grow.a)
                t.grow.a *= m;
            if (t.grow.xm)
                t.grow.xm = X(t.grow.xm);
            if (t.grow.pm)
                t.grow.pm = X(t.grow.pm);
        }
        if (t.endPowM)
            t.endPowM = X(t.endPowM);
        if (t.endPowP)
            t.endPowP = X(t.endPowP);
        if (t.levelUp && t.levelUp.n)
            t.levelUp.n = Math.round(t.levelUp.n * m);
        return t;
    }
    function upTerm(t0, lv, rep) {
        const t = JSON.parse(JSON.stringify(t0));
        const M = k => { if (t[k])
            t[k] = upMul(t[k], lv, rep); }, A = k => { if (t[k] > 0)
            t[k] = upAdd(t[k], lv, rep); };
        M('x');
        M('px');
        M('rally');
        M('mRally');
        M('ampNext');
        A('p');
        A('a');
        A('listen');
        A('luck');
        A('legendLuck');
        A('spendAll');
        A('discardsPlus');
        A('playsPlus');
        if (t.funds > 0)
            t.funds = upFunds(t.funds, lv, rep);
        if (t.growFunds)
            t.growFunds = upFunds(t.growFunds, lv, rep);
        if (t.fundsEvery)
            t.fundsEvery = upFunds(t.fundsEvery, lv, rep);
        if (t.onWinFunds)
            t.onWinFunds = upFunds(t.onWinFunds, lv, rep);
        if (t.fundsPct)
            t.fundsPct = upPct(t.fundsPct, lv, rep);
        if (t.reqCut)
            t.reqCut = Math.min(0.5, upPct(t.reqCut, lv, rep));
        if (t.bankAll)
            t.bankAll = upAdd(t.bankAll, lv, rep);
        if (t.bankRegion)
            t.bankRegion = upAdd(t.bankRegion, lv, rep);
        if (t.endPowM)
            t.endPowM = upPow(t.endPowM, lv, rep);
        if (t.endPowP)
            t.endPowP = upPow(t.endPowP, lv, rep);
        if (t.reviveAll)
            t.reviveAll = upMul(t.reviveAll, lv, rep);
        if (t.nextRoundX)
            t.nextRoundX = upMul(t.nextRoundX, lv, rep);
        if (t.coin)
            t.coin = [1 / upOdds(Math.round(1 / t.coin[0])), upMul(t.coin[1], lv, rep), t.coin[2]];
        if (t.limited)
            t.limited = upLimited(t.limited, lv, rep);
        if (t.grow) {
            if (t.grow.p)
                t.grow.p = upAdd(t.grow.p, lv, rep);
            if (t.grow.a)
                t.grow.a = upAdd(t.grow.a, lv, rep);
            if (t.grow.xm)
                t.grow.xm = upMul(t.grow.xm, lv, rep);
            if (t.grow.pm)
                t.grow.pm = upMul(t.grow.pm, lv, rep);
        }
        if (t.accum && t.accum.a)
            t.accum.a = upAdd(t.accum.a, lv, rep);
        if (t.trust && t.trust.d > 0)
            t.trust.d = upAdd(t.trust.d, lv, rep);
        if (t.rel && t.rel.d > 0)
            t.rel.d = upAdd(t.rel.d, lv, rep);
        if (t.watch) {
            t.watch.n = upCount(t.watch.n, lv, rep);
            t.watch.do = upDo(t.watch.do, lv, rep);
        }
        if (t.countdown) {
            t.countdown.n = upCount(t.countdown.n, lv, rep);
            t.countdown.do = upDo(t.countdown.do, lv, rep);
        }
        if (t.if) {
            if (t.if.allTrustLte != null)
                t.if.allTrustLte += 1;
            if (t.if.avgTrustLte != null)
                t.if.avgTrustLte += 1;
            if (t.if.playedGte != null)
                t.if.playedGte = Math.max(1, t.if.playedGte - 1);
        }
        if (t.per === 'lowTrust' || (t.if && t.if.lowTrustPlayed))
            t.lowT = 4;
        return t;
    }
    const UPCACHE = {};
    function upTerms(def, lv) {
        const key = def.id + ':' + lv;
        if (UPCACHE[key])
            return UPCACHE[key];
        return (UPCACHE[key] = def.fx.map(t => upTerm(t, lv, !!def.upRepeat)));
    }
    function upMode(def) {
        if (def._up)
            return def._up;
        if (def.evolve)
            return (def._up = 'evolve');
        if (/もう一度発動/.test(def.effect) && !/もう一度発動したとき/.test(def.effect))
            return (def._up = 'retrig2');
        if (upText(def.effect, 1, false, !def.fx) !== def.effect)
            return (def._up = 'num');
        return (def._up = 'self2');
    }
    function runTerms(terms, c, x, k) {
        k = k || 1;
        const kx = v => 1 + (v - 1) * k;
        const r = { p: 0, a: 0, x: 1, px: 1 };
        const sides = [], notes = [];
        const g = c.inst.g;
        terms.forEach(t => {
            x._lowT = t.lowT || 3;
            if (t.if && !condOk(t.if, c, x))
                return;
            let n = t.per ? qty(t.per, c, x) : 1;
            if (t.cap != null)
                n = Math.min(n, t.cap);
            if (t.p)
                r.p += t.p * n * k;
            if (t.a)
                r.a += t.a * n * k;
            if (t.x)
                r.x *= Math.pow(kx(t.x), n);
            if (t.px)
                r.px *= Math.pow(kx(t.px), n);
            if (t.grow) {
                const u = g.uses || 0;
                if (t.grow.p)
                    r.p += t.grow.p * u * k;
                if (t.grow.a)
                    r.a += t.grow.a * u * k;
                if (t.grow.xm)
                    r.x *= Math.pow(kx(t.grow.xm), Math.pow(u, 0.8));
                if (t.grow.pm)
                    r.pm = (r.pm || 1) * Math.pow(kx(t.grow.pm), Math.pow(u, 0.8));
            }
            if (t.xPerRel || t.aPerRel) {
                let s = 0;
                x.cards.forEach(k => { if (k !== c && k.inst.region !== c.inst.region)
                    s += getRel(x.S, c.inst.region, k.inst.region); });
                if (t.xPerRel)
                    r.x *= Math.max(0.1, 1 + t.xPerRel * s);
                if (t.aPerRel)
                    r.a += t.aPerRel * s;
            }
            if (t.funds) {
                const v = t.funds > 0 ? Math.round(t.funds * n * k) : t.funds * n;
                if (v) {
                    sides.push(S => { S.funds = Math.max(0, S.funds + v); });
                    notes.push(`議会資金${v > 0 ? '+' : ''}${v}`);
                }
            }
            if (t.fundsFrac) {
                sides.push(S => { S.funds = Math.max(0, Math.round(S.funds * (1 + t.fundsFrac))); });
                notes.push('議会資金の2割を失う');
            }
            if (t.debt) {
                sides.push(S => { S.debt = (S.debt || 0) + t.debt; });
            }
            if (t.c)
                sides.push(S => changeC(S, S.charId === 'mirror' ? -t.c : t.c));
            if (t.u)
                sides.push(S => addU(S, t.u));
            if (t.damage)
                sides.push(S => { const al = alive(S).sort((a, b) => b.hp / b.max - a.hp / a.max); const q = t.damage.to === 'self' ? regionById(S, c.inst.region) : al[0]; if (q && q.dead)
                    return; if (!q)
                    return; q.hp = Math.max(0, q.hp - t.damage.n); q.trust = Math.max(0, q.trust - 1); log(S, `${q.name}が犠牲になった。`, 'bad'); if (q.hp <= 0) {
                    q.dead = true;
                    chron(S, `${q.name}が壊滅`, 'bad');
                } });
            if (t.discardHand)
                sides.push(S => { const played = (S.R && S.R.lastPlayUids) || []; const cand = S.hand.filter(u => !played.includes(u)); for (let i = 0; i < t.discardHand && cand.length; i++) {
                    const u = cand.splice(rnd(cand.length), 1)[0];
                    S.hand = S.hand.filter(v => v !== u);
                    S.discard.push(u);
                } });
            if (t.rel)
                sides.push(S => relEffect(S, c, t.rel));
            if (t.trust)
                sides.push(S => trustEffect(S, c, t.trust));
            if (t.heal)
                sides.push(S => { const q = alive(S).filter(z => z.hp < z.max).sort((a, b) => a.hp / a.max - b.hp / b.max)[0]; if (q)
                    q.hp = Math.min(q.max, q.hp + t.heal); });
            if (t.hurt)
                sides.push(S => { const q = alive(S).slice().sort((a, b) => b.hp / b.max - a.hp / a.max)[0]; if (q) {
                    q.hp = Math.max(0, q.hp - t.hurt);
                    if (q.hp === 0) {
                        q.dead = true;
                        log(S, `${q.name}は機能を失った。`, 'bad');
                    }
                } });
            if (t.retrig)
                r.retrig = t.retrig;
            if (t.growFunds) {
                const v = Math.round(t.growFunds * ((g.uses || 0) + 1) * k);
                notes.push(`議会資金+${v}`);
                sides.push(S => { S.funds += v; });
            }
            if (t.fundsEvery) {
                const v = Math.round(t.fundsEvery * n * k);
                if (v) {
                    notes.push(`議会資金+${v}`);
                    r.always = (r.always || []).concat([S => { S.funds += v; }]);
                }
            }
            if (t.fundsPct) {
                const v = Math.floor(x.S.funds * t.fundsPct * k);
                notes.push(`議会資金+${v}`);
                sides.push(S => { S.funds += v; });
            }
            if (t.accum) {
                const q = qty(t.accum.per, c, x);
                if (t.accum.a) {
                    r.a += (g.accA || 0) * k;
                    sides.push(() => { g.accA = (g.accA || 0) + t.accum.a * q; });
                }
            }
            if (t.spendAll) {
                const f0 = x.S.funds;
                r.a += t.spendAll * f0 * k;
                notes.push(`議会資金${f0}を使う`);
                sides.push(S => { S.funds = 0; });
            }
            if (t.endPowM)
                r.endPowM = t.endPowM;
            if (t.endPowP)
                r.endPowP = t.endPowP;
            if (t.xCurrentM)
                r.xCurM = true;
            if (t.fundsMul) {
                notes.push(`議会資金×${t.fundsMul}`);
                sides.push(S => { S.funds = Math.round(S.funds * t.fundsMul); });
            }
            if (t.reviveAll) {
                const dead = x.S.regions.filter(q => q.dead).length;
                if (dead) {
                    r.x *= Math.pow(t.reviveAll, dead);
                    notes.push(`${dead}地方を立て直す`);
                    sides.push(S => S.regions.forEach(q => { if (q.dead) {
                        q.dead = false;
                        q.hp = 3;
                        q.trust = 4;
                    } }));
                }
            }
            if (t.nextRoundX)
                sides.push(S => { S.flags.nextFirstX = (S.flags.nextFirstX || 1) * t.nextRoundX; });
            if (t.onWinFunds)
                sides.push(S => { S.R.onWin = (S.R.onWin || 0) + t.onWinFunds; });
            if (t.xq)
                r.x *= Math.max(1, qty(t.xq, c, x));
            if (t.xUses)
                r.x *= 1 + 0.1 * (g.uses || 0);
            if (t.useAcc) {
                if (g.accA)
                    r.a += g.accA * k;
                if (g.accX && g.accX !== 1)
                    r.x *= kx(g.accX);
                if (g.accP)
                    r.p += g.accP * k;
                if (g.xNext && g.xNext !== 1) {
                    r.x *= g.xNext;
                    notes.push(`仕込み×${r2(g.xNext)}`);
                    sides.push(() => { g.xNext = 1; });
                }
            }
            if (t.levelUp) {
                if (t.levelUp.to === 'equalize') {
                    const any = x.cards.some(q => (q.inst.lv || 0) > 0);
                    if (any) {
                        notes.push('強化をそろえる');
                        sides.push(S => x.cards.forEach(q => { if (!(q.inst.lv || 0))
                            lvUp(S, q.inst, 1); }));
                    }
                }
                else {
                    const tg = levelTargets(x.S, c, x, t.levelUp.to);
                    if (tg.length) {
                        notes.push(`${tg.length > 1 ? tg.length + '枚を' : '「' + CARD[tg[0].id].name + '」を'}${t.levelUp.n}段階強化`);
                        sides.push(S => tg.forEach(q => lvUp(S, q, t.levelUp.n)));
                    }
                }
            }
            if (t.limited) {
                const left = g.left == null ? t.limited : g.left;
                notes.push(`残り${left - 1}回`);
                if (left <= 1)
                    r.consume = true;
                sides.push(S => { g.left = (g.left == null ? t.limited : g.left) - 1; if (g.left <= 0 && S.deck.includes(c.inst) && !r.consume) {
                    removeCard(S, c.inst);
                    emit(S, 'consume');
                } });
            }
            if (t.countdown && t.countdown.on === 'play') {
                const cd = t.countdown, cur = g.cd == null ? cd.n : g.cd;
                if (cur <= 1) {
                    if (cd.do.burstX) {
                        r.x *= cd.do.burstX;
                        notes.push(`数えが満ちた ×${cd.do.burstX}`);
                    }
                    else
                        notes.push('数えが満ちた');
                    if (cd.consume)
                        r.consume = true;
                }
                else
                    notes.push(`あと${cur - 1}回`);
                sides.push(S => {
                    g.cd = (g.cd == null ? cd.n : g.cd) - 1;
                    if (g.cd <= 0) {
                        cdAction(S, c.inst, cd.do);
                        if (cd.repeat || (!cd.consume && !cd.do.transform))
                            g.cd = cd.n;
                        else if (cd.consume && S.deck.includes(c.inst))
                            removeCard(S, c.inst);
                    }
                });
            }
            if (t.healAll) {
                notes.push('全地方を回復');
                sides.push(S => alive(S).forEach(q => { q.hp = q.max; }));
            }
            if (t.rally) {
                r.rally = t.rally;
                notes.push(`以後の対応力×${t.rally}`);
            }
            if (t.reqCut) {
                const used = t.once && x.R.cutOnce && x.R.cutOnce[c.def.id];
                if (!used) {
                    notes.push(`必要対策値-${Math.round(t.reqCut * 100)}%`);
                    sides.push(S => { const R = S.R; if (t.once) {
                        R.cutOnce = R.cutOnce || {};
                        R.cutOnce[c.def.id] = true;
                    } const room = Math.max(0, 0.5 - (R.cutTotal || 0)); const cut = Math.min(room, t.reqCut); if (cut > 0) {
                        R.cutTotal = (R.cutTotal || 0) + cut;
                        R.req = Math.max(10, Math.round(R.req * (1 - cut)));
                        log(S, `必要対策値が${nf(R.req)}に下がった。`, 'good');
                    } });
                }
            }
            if (t.shield) {
                notes.push(`被害-${t.shield}`);
                sides.push(S => { S.R.shield = (S.R.shield || 0) + t.shield; });
            }
            if (t.halfDamage) {
                notes.push('被害半減');
                sides.push(S => { S.R.halfDamage = true; });
            }
            if (t.revive)
                sides.push(S => { const d0 = S.regions.find(q => q.dead); if (d0) {
                    d0.dead = false;
                    d0.hp = 2;
                    d0.trust = 3;
                    log(S, `${d0.name}が立て直された。`, 'good');
                    chron(S, `${d0.name}を再建`, 'good');
                } });
            if (t.draw) {
                notes.push(`${t.draw}枚引く`);
                sides.push(S => { S.R.extraDraw = (S.R.extraDraw || 0) + t.draw; });
            }
            if (t.releaseHeld)
                sides.push(() => { g.held = 0; });
            if (t.ampNext)
                r.ampNext = t.ampNext;
            if (t.retrigNext)
                r.retrigNext = true;
            if (t.sacHand) {
                const played = x.cards.map(q => q.inst.uid);
                const cand = x.S.hand.filter(u => !played.includes(u)).map(u => cardByUid(x.S, u)).filter(Boolean).sort((a, b) => (CARD[b.id].base || 0) - (CARD[a.id].base || 0));
                if (cand[0]) {
                    const tgt = cand[0];
                    r.p += ((CARD[tgt.id].base || 0) + (tgt.g.bb || 0)) * t.sacHand;
                    notes.push(`「${CARD[tgt.id].name}」を壊す`);
                    sides.push(S => { removeCard(S, tgt); S.stats.destroyed = (S.stats.destroyed || 0) + 1; });
                }
            }
            if (t.coin) {
                if (x.preview)
                    notes.push('賭け');
                else {
                    const hit = Math.random() < t.coin[0];
                    r.x *= hit ? t.coin[1] : t.coin[2];
                    notes.push(hit ? '当たり' : '外れ');
                }
            }
            if (t.bankAll) {
                notes.push(`持ち札の基礎+${t.bankAll}`);
                sides.push(S => S.deck.forEach(k => { k.g.bb = (k.g.bb || 0) + t.bankAll; }));
            }
            if (t.bankRegion) {
                notes.push(`同じ地方の基礎+${t.bankRegion}`);
                sides.push(S => S.deck.forEach(k => { if (k.region === c.inst.region)
                    k.g.bb = (k.g.bb || 0) + t.bankRegion; }));
            }
            if (t.carryPct)
                sides.push(S => { S.R.carryPct = (S.R.carryPct || 0) + t.carryPct; });
            if (t.overFunds)
                sides.push(S => { S.R.overFunds = (S.R.overFunds || 0) + t.overFunds; });
            if (t.mRally) {
                r.mRally = t.mRally;
                notes.push(`以後の発動ごとに倍率×${t.mRally}`);
            }
            if (t.wearPlayed)
                sides.push(S => { for (let i = 0; i < x.cards.length; i++)
                    for (let j = i + 1; j < x.cards.length; j++) {
                        const a = x.cards[i].inst.region, b = x.cards[j].inst.region;
                        if (a !== b && getRel(S, a, b) >= LINK_AT)
                            addRel(S, a, b, -t.wearPlayed, true);
                    } });
            if (t.wearLinks)
                sides.push(S => { alivePairs(S).forEach(([a, b]) => { if (getRel(S, a, b) >= LINK_AT)
                    addRel(S, a, b, -t.wearLinks, true); }); });
            if (t.consume)
                r.consume = true;
        });
        const step = hasAb(x.S, 'growth_ab') ? 2 : 1;
        const growOnce = S2 => { const R2 = (S2 || x.S).R; if (!R2)
            return; R2.grew = R2.grew || {}; const ku = c.inst.uid; const lim = terms.some(t => t.growOnRetrig) ? 2 : 1; if ((R2.grew[ku] || 0) >= lim)
            return; R2.grew[ku] = (R2.grew[ku] || 0) + 1; g.uses = (g.uses || 0) + step; };
        if (terms.some(t => t.growOnRetrig))
            r.always = (r.always || []).concat([growOnce]);
        else if (terms.some(t => t.grow || t.growFunds))
            sides.push(growOnce);
        if (sides.length)
            r.side = S => sides.forEach(f => f(S));
        if (notes.length)
            r.note = notes.join(' ');
        return r;
    }
    function burnLegacy(S) {
        const sup = S.deck.find(c => CARD[c.id].alignment === '抑圧');
        if (!sup) {
            log(S, '焼くべき遺産は残っていなかった。');
            return;
        }
        removeCard(S, sup);
        const pool = D.cards.filter(c => c.alignment === '分権' && isAvailable(S, c.id));
        for (let i = 0; i < 2; i++)
            S.deck.push(mkCard(S, pick(pool).id));
        S.stats.suppressBurned++;
        if (S.stats.suppressBurned >= 3)
            unlockCard(S, 'burn_legacy');
        log(S, `${CARD[sup.id].name}の書類が焼かれ、灰の中から二つの制度が生まれた。`);
        chron(S, `遺産の焼却(${CARD[sup.id].name}を破棄)`, 'resist');
    }
    function splitRegion(S, id) {
        const r = regionById(S, id);
        if (!r || r.dead)
            return;
        const base = REGION_NAMES[S.nextRegionName % REGION_NAMES.length];
        const name = S.nextRegionName >= REGION_NAMES.length ? base + '新' : base;
        S.nextRegionName++;
        const nid = Math.max(...S.regions.map(x => x.id)) + 1;
        const half = Math.max(2, Math.ceil(r.hp / 2));
        const mx = Math.max(3, Math.ceil(r.max / 2) + 1);
        S.regions.splice(S.regions.indexOf(r) + 1, 0, { id: nid, name, hp: half, max: mx, trust: r.trust, river: r.river, dead: false, home: false });
        r.hp = half;
        r.max = mx;
        S.regions.forEach(o => { if (o.id !== nid && o.id !== r.id)
            setRel(S, nid, o.id, getRel(S, r.id, o.id)); });
        setRel(S, r.id, nid, LINK_AT + 3);
        if (S.relBase)
            S.regions.forEach(o => { if (o.id !== nid)
                S.relBase[rk(nid, o.id)] = getRel(S, nid, o.id); });
        S.stats.maxRegions = Math.max(S.stats.maxRegions, alive(S).length);
        if (alive(S).length >= 12)
            unlockCard(S, 'union_without');
        log(S, `${r.name}から${name}が分かれた。`);
        chron(S, `${r.name}が分裂し${name}が生まれる`, '');
    }
    function centralFactor(S) { return 0.8 + Ceff(S) * 0.008; }
    function localFactor(S) {
        const t = owned(S, 'propaganda') ? Math.max(5, avgTrust(S)) : avgTrust(S);
        let f = 0.6 + t * 0.08;
        if (S.charId === 'anarchist' && !owned(S, 'free_city'))
            f *= 0.7;
        return f;
    }
    function disabledReason(S, c, ctx) {
        const d = ctx.d, def = c.def;
        if (d.rule === 'noLocal' && c.cat === 'local')
            return '地方のカードは無効';
        if (d.rule === 'noCentral' && c.cat === 'central')
            return '中央のカードは無効';
        if (S.charId === 'anarchist' && c.cat === 'central')
            return '中央がない';
        if (d.rule === 'blackout' && INFO_CARDS.has(def.id))
            return '停電で届かない';
        if (def.id === 'local_assembly' && owned(S, 'loyalty_oath'))
            return '忠誠宣誓で無効';
        return null;
    }
    const lvMul = (v, k) => v * k;
    const lvX = (v, k) => 1 + (v - 1) * k;
    function trustFactor(t) { return 0.6 + 0.08 * Math.min(t, 10) + 0.07 * Math.sqrt(Math.max(0, t - 10)); }
    function regionCardFactor(S, r) {
        let t = r ? r.trust : avgTrust(S);
        if (owned(S, 'propaganda'))
            t = Math.max(5, t);
        let f = trustFactor(t);
        if (S.charId === 'anarchist' && !owned(S, 'free_city'))
            f *= 0.7;
        return f;
    }
    const r2 = v => Math.round(v * 100) / 100;
    function scoreHand(S, uids, preview) {
        const R = S.R, d = R.d;
        const al = alive(S);
        const sumTrust = al.reduce((a, r) => a + r.trust, 0);
        const ctx = { S, R, d, preview: !!preview, Ce: Ceff(S), L: linksCount(S), lp: linkPower(S), alive: al, n: al.length, sumTrust, has: k => d.keys.includes(k), pMul: 1, M: 1, P: 0 };
        ctx.cards = uids.map((u, i) => { const inst = cardByUid(S, u); const def = CARD[inst.id]; return { inst, def, cat: catOf(def), region: regionById(S, inst.region), i }; });
        ctx.centralCount = ctx.cards.filter(c => c.cat === 'central').length;
        ctx.localCount = ctx.cards.filter(c => c.cat === 'local').length;
        const placed = id => ctx.cards.some(c => c.def.id === id);
        const swap = placed('mirror_parliament');
        let P = 0, M = 1, auto = false, deferredOut = 0;
        const steps = [], side = [], consume = [], fired = [], endRetrig = [];
        const push = o => { steps.push(Object.assign(o, { P: r2(P), M: r2(M) })); };
        const applyFac = (f, e, extra) => {
            if (!e)
                return;
            P += e.p || 0;
            M += e.a || 0;
            if (e.x && e.x !== 1)
                M *= e.x;
            if (e.side && !preview)
                side.push(e.side);
            push(Object.assign({ kind: 'fac', fuid: f.uid, name: FAC[f.id].name, p: e.p || 0, a: e.a || 0, x: e.x || 1, note: e.note || '' }, extra || {}));
        };
        if (R.deferred && !preview) {
            P += R.deferred;
            push({ kind: 'pre', name: '遅れて届いた中央の対策', p: R.deferred });
        }
        if (R.firstPlay && hasAb(S, 'stockpile') && uids.length) {
            const v = 80 * Math.min(S.era, 30);
            P += v;
            push({ kind: 'pre', name: '備蓄の知恵', p: v });
        }
        const fc = centralFactor(S);
        const listeners = S.deck.map(k0 => { const d0 = CARD[k0.id]; const t0 = d0.fx && d0.fx.find(t => t.listen); return t0 ? { g: k0.g, v: t0.listen } : null; }).filter(Boolean);
        if (R.momentum) {
            M += R.momentum;
            push({ kind: 'pre', name: '余勢', a: R.momentum });
        }
        if (R.firstPlay && S.flags.nextFirstX && uids.length) {
            M *= S.flags.nextFirstX;
            push({ kind: 'pre', name: '先物の仕込み', x: S.flags.nextFirstX });
            if (!preview)
                side.push(S2 => { S2.flags.nextFirstX = 0; });
        }
        if (hasAb(S, 'vanguard') && uids.length)
            ctx.ampNext = 3;
        const resolve = (c, retrig) => {
            const def = c.def;
            if (retrig) {
                ctx.rtBudget = (ctx.rtBudget == null ? 40 : ctx.rtBudget) - 1;
                if (ctx.rtBudget < 0)
                    return;
                ctx.rtCount = ctx.rtCount || {};
                const ku = c.inst.uid;
                ctx.rtCount[ku] = (ctx.rtCount[ku] || 0) + 1;
                if (ctx.rtCount[ku] > 2)
                    return;
            }
            ctx.depth = (ctx.depth || 0) + (retrig ? 1 : 0);
            try {
                resolveInner(c, retrig, def);
            }
            finally {
                ctx.depth -= retrig ? 1 : 0;
            }
        };
        const resolveInner = (c, retrig, def) => {
            const dis = disabledReason(S, c, ctx);
            if (dis) {
                push({ kind: 'off', uid: c.inst.uid, name: def.name, note: dis });
                return;
            }
            ctx.M = M;
            ctx.P = P;
            ctx.firedCount = fired.length;
            ctx.self = c;
            ctx.curRetrig = !!retrig;
            const fx = FX[def.id];
            const rk2 = c.region ? c.region.key : '';
            const k = d.rule === 'noUpgrade' ? 1 : upK(S, c.inst, rk2);
            const plain = /追加の効果はない|ほかに何もしない/.test(def.effect) || def.upKind === 'base3';
            const lvOn = (c.inst.lv || 0) > 0 && d.rule !== 'noUpgrade' && upMode(def) === 'num';
            const amp = ctx.ampNext && !(def.fx || []).some(t => t.ampNext) ? ctx.ampNext : 0;
            if (amp)
                ctx.ampNext = 0;
            let terms0 = def.fx ? (lvOn ? upTerms(def, c.inst.lv) : def.fx) : null;
            if (terms0 && amp)
                terms0 = terms0.map(t => scaleTerm(t, amp));
            const r = Object.assign({}, terms0 ? runTerms(terms0, c, ctx, 1) : fx ? (fx(c, ctx) || {}) : {});
            if (amp) {
                if (!terms0) {
                    if (r.p)
                        r.p *= amp;
                    if (r.a)
                        r.a *= amp;
                    if (r.x && r.x > 1)
                        r.x = 1 + (r.x - 1) * amp;
                    if (r.side) {
                        const sd = r.side, k2 = Math.max(1, Math.round(amp));
                        r.side = S2 => { for (let q = 0; q < k2; q++)
                            sd(S2); };
                    }
                }
                r.note = (r.note ? r.note + ' ' : '') + `数字×${r2(amp)}`;
                if (!terms0 || !terms0.some(t => t.p))
                    r.ampBase = amp;
            }
            if (!def.fx && fx && lvOn) {
                const f = def.upRepeat ? 1 + 0.12 * c.inst.lv : 1.6;
                if (r.p)
                    r.p *= f;
                if (r.a)
                    r.a *= f;
                if (r.x && r.x > 1)
                    r.x = 1 + (r.x - 1) * (def.upRepeat ? f : 1.45);
                if (r.px && r.px > 1)
                    r.px = 1 + (r.px - 1) * (def.upRepeat ? f : 1.45);
            }
            const st = c.inst.stamp;
            let p = (def.base || 0) + (c.inst.g.bb || 0) + (r.p || 0) + (rk2 === 'nishihara' ? 10 : 0) + (st === 'foundation' ? 30 : 0);
            if (r.pm)
                p *= r.pm;
            if (st === 'blue')
                p *= 1.5;
            if (st === 'red')
                r.a = (r.a || 0) + 1;
            if (st === 'iron')
                r.x = (r.x || 1) * 1.2;
            if (st === 'glass')
                r.x = (r.x || 1) * 2;
            if (st === 'far')
                r.a = (r.a || 0) + 0.5 * ctx.cards.filter(q => q !== c && q.inst.region !== c.inst.region).length;
            if (st === 'old')
                r.a = (r.a || 0) + 0.1 * Math.max(0, S.roundNo - (c.inst.stampedAt || S.roundNo));
            if (rk2 === 'hokurei' && d.type === '自然')
                p *= 1.3;
            if (rk2 === 'kawanaka')
                r.a = (r.a || 0) + 0.2;
            if (def.growth === '固定値' && hasTrait(S, 'technocrat'))
                p *= 1.25;
            if (owned(S, 'standardize'))
                p += 15 * ownedList(S, 'standardize').length;
            if (d.type === '人災' && placed('redundancy') && def.id !== 'redundancy')
                p *= 1.5;
            if (RESEARCH_CARDS.has(def.id) && owned(S, 'lecture_notes'))
                p *= 2;
            if (def.id === 'bureaucracy' && owned(S, 'loyalty_oath'))
                p *= 3;
            let cat = c.cat;
            if (swap && cat !== 'neutral')
                cat = cat === 'central' ? 'local' : 'central';
            let f = 1;
            if (cat === 'central') {
                f = fc;
                if (d.winter)
                    f *= 0.4;
                if (d.rule === 'centralHalf')
                    f *= 0.5;
            }
            else if (cat === 'local') {
                f = regionCardFactor(S, c.region);
                if (d.winter)
                    f *= 1.3;
                if (hasAb(S, 'localpride'))
                    f *= 2;
                if (d.rule === 'civilWar')
                    f *= 0.8;
                if (d.rule === 'localHalf')
                    f *= 0.5;
                if (d.rule === 'regionLost')
                    f *= 0.5;
            }
            if (c.region && c.region.dead)
                f *= 0.5;
            p *= f * ctx.pMul;
            if (r.ampBase)
                p *= r.ampBase;
            let note = r.note || (c.region && c.region.dead ? '被災地' : '');
            if (d.rule === 'centralDelay' && cat === 'central' && !retrig) {
                deferredOut += p;
                p = 0;
                note = '次の手へ遅れる';
            }
            P += p;
            if (r.px && r.px !== 1)
                P *= r.px;
            M += r.a || 0;
            if (r.xCurM) {
                if (ctx.xCurDone)
                    r.x = r.x || 1;
                else {
                    ctx.xCurDone = true;
                    r.x = (r.x || 1) * Math.max(1, M);
                }
            }
            if (hasAb(S, 'contrarian') && r.x && r.x < 1)
                r.x = 1 / r.x;
            if (hasAb(S, 'finisher') && !retrig && c.i === ctx.cards.length - 1 && r.x > 1)
                r.x = r.x * r.x;
            if (r.x && r.x !== 1)
                M *= r.x;
            if (ctx.mRallyMul && ctx.mRallyMul !== 1) {
                M *= ctx.mRallyMul;
                note = (note ? note + ' ' : '') + `連鎖指令×${r2(ctx.mRallyMul)}`;
            }
            if (retrig)
                ctx.retrigCount = (ctx.retrigCount || 0) + 1;
            if (st === 'gold' && !preview)
                side.push(S2 => { S2.funds += 1; });
            if (r.always && !preview)
                r.always.forEach(f2 => side.push(f2));
            if (hasAb(S, 'mint_ab') && !preview)
                side.push(S2 => { S2.funds += 1; });
            if (!preview) {
                if (st === 'bond') {
                    const me = c.inst.region, os = [...new Set(ctx.cards.map(q => q.inst.region))].filter(x2 => x2 !== me);
                    side.push(S2 => os.forEach(o => addRel(S2, me, o, 1, true)));
                }
                if (st === 'people')
                    side.push(S2 => { const q = regionById(S2, c.inst.region); if (q && !q.dead)
                        q.trust = Math.max(0, q.trust + 1); });
                if (st === 'shadow')
                    side.push(S2 => { if (S2.R)
                        S2.R.extraDraw = (S2.R.extraDraw || 0) + 1; });
                if (st === 'glass' && !consume.includes(c.inst.uid) && Math.random() < 0.25) {
                    consume.push(c.inst.uid);
                    side.push(S2 => log(S2, `「${def.name}」の玻璃印が割れ、カードも砕けた。`, 'bad'));
                }
            }
            {
                if (r.auto)
                    auto = true;
                if (r.side && !preview)
                    side.push(r.side);
                if (r.consume && !consume.includes(c.inst.uid))
                    consume.push(c.inst.uid);
                if (r.rally)
                    ctx.pMul *= r.rally;
                if (r.mRally)
                    ctx.mRallyMul = (ctx.mRallyMul || 1) * r.mRally;
                if (r.ampNext)
                    ctx.ampNext = r.ampNext;
                if (r.retrigNext)
                    ctx.retrigNext = true;
            }
            fired.push({ c, p });
            ctx.firedRegions = (ctx.firedRegions || []).concat([c.inst.region]);
            if (r.endPowM)
                ctx.endPowM = Math.max(ctx.endPowM || 1, r.endPowM);
            if (r.endPowP)
                ctx.endPowP = Math.max(ctx.endPowP || 1, r.endPowP);
            if (!preview)
                listeners.forEach(L0 => side.push(() => { L0.g.bb = (L0.g.bb || 0) + L0.v; }));
            push({ kind: 'card', cat: c.cat, rk: c.region ? c.region.key : '', rar: def.rarity, typ: def.target.split(':')[0], uid: c.inst.uid, name: def.name, p, a: r.a || 0, x: r.x || 1, px: r.px || 1, note: note + (st ? (note ? ' ' : '') + STAMP_NAME(st) : ''), retrig: !!retrig });
            (S.facilities || []).forEach(fc2 => { const h = FACFX[fc2.id]; if (h && h.onCard) {
                applyFac(fc2, h.onCard(fc2, c, ctx));
                if (hasAb(S, 'gearing'))
                    applyFac(fc2, h.onCard(fc2, c, ctx));
            } });
            if (!retrig && hasAb(S, 'encore_all') && (c.inst.lv || 0) > 0)
                resolve(c, true);
            if (!retrig && ctx.retrigNext && !r.retrigNext) {
                ctx.retrigNext = false;
                resolve(c, true);
            }
            if (!retrig && st === 'twin')
                resolve(c, true);
            if (!retrig && upMode(def) === 'self2' && (c.inst.lv || 0) > 0 && d.rule !== 'noUpgrade')
                resolve(c, true);
            const reps = upMode(def) === 'retrig2' && (c.inst.lv || 0) > 0 && d.rule !== 'noUpgrade' ? 2 : 1;
            for (let rp = 0; rp < reps; rp++)
                if (r.retrig && (ctx.depth || 0) < 3) {
                    if (r.retrig === 'prev') {
                        const pv = fired[fired.length - 2];
                        if (pv)
                            resolve(pv.c, true);
                    }
                    else if (r.retrig === 'sameRegion') {
                        const o = ctx.cards.find(q => q !== c && q.inst.region === c.inst.region);
                        if (o)
                            resolve(o, true);
                    }
                    else if (r.retrig === 'allBefore')
                        ctx.cards.filter(q => q.i < c.i).forEach(q => resolve(q, true));
                    else if (r.retrig === 'best')
                        endRetrig.push('best');
                    else if (r.retrig === 'prev2') {
                        const pv = fired[fired.length - 2];
                        if (pv) {
                            resolve(pv.c, true);
                            resolve(pv.c, true);
                        }
                    }
                    else if (r.retrig === 'allBefore2') {
                        const bf = ctx.cards.filter(q => q.i < c.i);
                        bf.forEach(q => resolve(q, true));
                        bf.forEach(q => resolve(q, true));
                    }
                    else if (r.retrig === 'all')
                        endRetrig.push('all');
                    else if (r.retrig === 'hand')
                        endRetrig.push('hand');
                }
        };
        if (hasAb(S, 'discard_voice') && (R.discardedUids || []).length && uids.length) {
            R.discardedUids.forEach((u, i) => { const inst = cardByUid(S, u); if (!inst)
                return; const def = CARD[inst.id]; resolve({ inst, def, cat: catOf(def), region: regionById(S, inst.region), i: -1 - i }, true); });
            if (!preview)
                side.push(S2 => { S2.R.discardedUids = []; });
        }
        ctx.cards.forEach(c => resolve(c, false));
        if (ctx.cards.length) {
            (S.facilities || []).forEach(f => {
                if (f.id === 'echo_chamber') {
                    push({ kind: 'fac', fuid: f.uid, name: FAC[f.id].name, note: 'もう一度', p: 0, a: 0, x: 1 });
                    resolve(ctx.cards[0], true);
                }
                if (f.id === 'double_bell' || false) {
                    push({ kind: 'fac', fuid: f.uid, name: FAC[f.id].name, note: 'もう一度', p: 0, a: 0, x: 1 });
                    resolve(ctx.cards[ctx.cards.length - 1], true);
                }
            });
            if (hasAb(S, 'echo_ab')) {
                push({ kind: 'glob', name: '反復', note: 'もう一度' });
                resolve(ctx.cards[ctx.cards.length - 1], true);
            }
            if (hasFac(S, 'relay_station') && (R.playsUsed + 1) % 3 === 0) {
                push({ kind: 'glob', name: '中継所', note: 'すべてもう一度' });
                ctx.cards.forEach(q => resolve(q, true));
            }
            if (endRetrig.includes('best')) {
                const best = fired.slice().sort((a, b) => b.p - a.p)[0];
                if (best)
                    resolve(best.c, true);
            }
            if (endRetrig.includes('all') || (hasAb(S, 'home_ground') && ctx.cards.length >= 2 && ctx.cards.every(q => q.inst.region === ctx.cards[0].inst.region))) {
                push({ kind: 'glob', name: 'すべてもう一度', note: '' });
                ctx.cards.forEach(q => resolve(q, true));
            }
            if (endRetrig.includes('hand')) {
                const played = uids;
                S.hand.filter(u => !played.includes(u)).forEach((u, i) => { const inst = cardByUid(S, u); if (!inst)
                    return; const def = CARD[inst.id]; resolve({ inst, def, cat: catOf(def), region: regionById(S, inst.region), i: 100 + i }, true); });
            }
            if (hasAb(S, 'reserve')) {
                const rest = S.hand.filter(u => !uids.includes(u)).map(u => cardByUid(S, u)).filter(Boolean);
                const v = rest.reduce((a, q) => a + ((CARD[q.id].base || 0) + (q.g.bb || 0)) / 2, 0);
                if (v) {
                    P += v;
                    push({ kind: 'glob', name: '控えの力', p: v });
                }
            }
        }
        let syn = 0;
        for (let i = 0; i < ctx.cards.length; i++)
            for (let j = i + 1; j < ctx.cards.length; j++) {
                const a = ctx.cards[i].inst.region, b = ctx.cards[j].inst.region;
                let v = a === b ? 0.3 : getRel(S, a, b) * 0.04;
                if (ctx.cards[i].region && ctx.cards[i].region.key === 'minami' || ctx.cards[j].region && ctx.cards[j].region.key === 'minami')
                    v *= 2;
                syn += v;
            }
        if (hasFac(S, 'friendship_bridge'))
            syn *= 3;
        if (Math.abs(syn) > 0.001) {
            M = Math.max(0.1, M + syn);
            push({ kind: 'rel', name: '地方どうしの関係', a: syn });
        }
        if (!preview && ctx.cards.some(c => c.region && c.region.key === 'touura')) {
            side.push(S2 => { S2.funds += 1; });
            push({ kind: 'pre', name: '東浦の商才', note: '議会資金+1' });
        }
        (S.facilities || []).forEach(f => { const h = FACFX[f.id]; if (h && h.onEnd) {
            applyFac(f, h.onEnd(f, ctx));
            if (hasAb(S, 'gearing'))
                applyFac(f, h.onEnd(f, ctx));
        } });
        const gA = [];
        if (S.flags.silentA)
            gA.push(['静かな多数派', S.flags.silentA]);
        if (S.litTypes[d.type])
            gA.push(['文献調査', S.litTypes[d.type]]);
        if (owned(S, 'rev_calendar') && S.revolutions)
            gA.push(['革命暦', 2 * S.revolutions * ownedList(S, 'rev_calendar').length]);
        if (S.flags.propA)
            gA.push(['プロパガンダ', S.flags.propA]);
        if (d.winter && ctx.L)
            gA.push(['協力関係', ctx.L * 0.15 * ctx.lp]);
        if (hasAb(S, 'network') && ctx.L)
            gA.push(['広域連携', 0.3 * ctx.L]);
        if (S.flags.rings)
            gA.push(['年輪', S.flags.rings]);
        gA.forEach(g => { M += g[1]; push({ kind: 'glob', name: g[0], a: g[1] }); });
        const G = [];
        if (R.decl)
            G.push(['緊急事態宣言', 1 + R.declBonus]);
        if (R.decl && R.backerDecl && owned(S, 'reverse_puppet'))
            G.push(['操り返し', 1 + R.declBonus]);
        if (S.permMult !== 1)
            G.push(['革命', S.permMult]);
        if (S.idleStack > 1 && uids.length)
            G.push(['怠惰の累積', S.idleStack]);
        if (hasTrait(S, 'veteran') && d.type === '社会')
            G.push(['古い勘', 1.3]);
        if (hasTrait(S, 'technocrat') && d.type === '人災')
            G.push(['手順書', 1.3]);
        if (S.returnPenalty > 0)
            G.push(['返還直後の混乱', 0.85]);
        if (S.flags.dissolutionEra === S.era)
            G.push(['解体令', 0.5]);
        if (S.charId === 'calamity') {
            if (!S.absorbed.length)
                G.push(['まだ何も取り込んでいない', 0.6]);
            else {
                const k = S.absorbed.filter(a => a.type === d.type).length;
                G.push(['取り込んだ災い', k ? 1 + 0.25 * k : 0.7]);
            }
        }
        if (S.charId === 'anarchist')
            G.push(['地方の数', ctx.n / 4]);
        if (hasAb(S, 'calm'))
            G.push(['冷静な判断', 1.5]);
        if (hasAb(S, 'natural') && d.type === '自然')
            G.push(['防災の型', 2.5]);
        if (hasAb(S, 'manmade') && d.type === '人災')
            G.push(['技術の型', 2.5]);
        if (hasAb(S, 'social') && d.type === '社会')
            G.push(['対話の型', 2.5]);
        G.forEach(g => { M *= g[1]; push({ kind: 'glob', name: g[0], x: g[1] }); });
        const glob = (name, nx) => { if (nx && nx !== 1) {
            M *= nx;
            push({ kind: 'glob', name, x: nx });
        } };
        if (uids.length) {
            glob('永久機関', S.flags.perp || 1);
            glob('災い転じて', S.flags.silver || 1);
            glob('時代の加速', S.flags.accelMul || 1);
            glob('破壊と創造', S.flags.destroyMul || 1);
            if (hasAb(S, 'gold_weight'))
                glob('金貨の重み', Math.pow(1.25, Math.log2(1 + Math.max(0, S.funds) / 10)));
            if (hasAb(S, 'ring_of_unity'))
                glob('連帯の環', Math.pow(1.2, ctx.L));
            if (hasAb(S, 'terror'))
                glob('恐怖政治', Math.pow(1.02, S.stats.trustTaken || 0));
            if (hasAb(S, 'giant_slayer') && d.boss)
                glob('大物喰い', S.era);
            if (ctx.endPowP && P > 1) {
                P = Math.pow(P, ctx.endPowP);
                push({ kind: 'glob', name: '対応力の累乗', note: `${r2(ctx.endPowP)}乗` });
            }
            if (hasAb(S, 'powerup') && P > 1) {
                P = Math.pow(P, 1.1);
                push({ kind: 'glob', name: '対応力の累乗', note: '1.1乗' });
            }
            if (ctx.endPowM && M > 1) {
                M = Math.pow(M, ctx.endPowM);
                push({ kind: 'glob', name: '倍率の累乗', note: `${r2(ctx.endPowM)}乗` });
            }
            if (hasAb(S, 'compound') && M > 1) {
                M = Math.pow(M, 1.15);
                push({ kind: 'glob', name: '倍率の累乗', note: '1.15乗' });
            }
            if (hasAb(S, 'balance')) {
                const av = (P + M) / 2;
                P = av;
                M = av;
                push({ kind: 'glob', name: '均衡の術', note: 'ならす' });
            }
        }
        const score = Math.max(0, Math.round(P * M));
        if (!preview && hasAb(S, 'momentum'))
            side.push(S2 => { S2.R.momentum = 0.2 * M; });
        return { score, P: Math.round(P), M: r2(M), steps, auto, side, consume, deferredOut };
    }
    function execute(S, uids) {
        const R = S.R;
        if (!R || R.done || R.backerPending || S.phase !== 'round')
            return null;
        const seen = new Set();
        uids = uids.filter(u => S.hand.includes(u) && !seen.has(u) && seen.add(u)).slice(0, maxPlay(S));
        R.lastPlayRegions = uids.map(u => (cardByUid(S, u) || {}).region);
        R.lastPlayUids = uids.slice();
        R.playedAll = (R.playedAll || []).concat(uids);
        {
            const before = S.stats.cardsPlayed || 0;
            S.stats.cardsPlayed = before + uids.length;
            const k20 = Math.floor(S.stats.cardsPlayed / 20) - Math.floor(before / 20);
            if (k20 > 0)
                for (let i = 0; i < facCount(S, 'grain_tower') * k20; i++)
                    S.deck.forEach(q => { q.g.bb = (q.g.bb || 0) + 5; });
        }
        const fundsPre = S.funds;
        const res = scoreHand(S, uids);
        R.deferred = 0;
        trackTrust(S);
        res.side.forEach(f => f(S));
        trackTrust(S);
        uids.forEach(u => {
            const inst = cardByUid(S, u);
            if (!inst)
                return;
            const def = CARD[inst.id];
            const sgn = S.charId === 'mirror' ? -1 : 1;
            const c = { cat: catOf(def), region: regionById(S, inst.region) };
            if (c.cat === 'local' && c.region && !c.region.dead) {
                S.fatigue = S.fatigue || {};
                const kf = c.region.id;
                S.fatigue[kf] = (S.fatigue[kf] || 0) + 1;
                R.usedRegions = R.usedRegions || {};
                R.usedRegions[kf] = true;
                if (S.fatigue[kf] >= 3) {
                    S.fatigue[kf] -= 3;
                    c.region.trust = Math.max(0, c.region.trust - 1);
                    log(S, `${c.region.name}は頼られすぎて、少し疲れている。`, 'react');
                }
            }
            if (c.cat === 'central') {
                S.fatigue = S.fatigue || {};
                S.fatigue.central = (S.fatigue.central || 0) + 1;
                if (S.fatigue.central >= 4) {
                    S.fatigue.central -= 4;
                    const q = pick(alive(S));
                    if (q) {
                        q.trust = Math.max(0, q.trust - 1);
                        log(S, `首都のやり方に、${q.name}の信頼が少し削れた。`, 'react');
                    }
                }
            }
            if (def.alignment === '集権')
                changeC(S, 0.5 * sgn);
            if (def.alignment === '抑圧') {
                changeC(S, 1.5 * sgn);
                addU(S, 1.5);
            }
            if (S.charId === 'mirror' && def.alignment === '分権')
                changeC(S, 0.25);
            if (def.target.split(':')[0] !== '全般')
                R.allGeneral = false;
        });
        if (S.funds > fundsPre)
            emit(S, 'fundsGain', S.funds - fundsPre);
        R.deferred = res.deferredOut;
        R.total += res.score;
        {
            const st = S.stats;
            st.playCount = st.playCount || {};
            uids.forEach(u => { const q = cardByUid(S, u); if (q)
                st.playCount[q.id] = (st.playCount[q.id] || 0) + 1; });
            const chain = res.steps.filter(x => x.kind === 'card').length;
            if (chain > (st.maxChain || 0))
                st.maxChain = chain;
            st.retrigTotal = (st.retrigTotal || 0) + res.steps.filter(x => x.kind === 'card' && x.retrig).length;
            if (!st.bestHand || res.score > st.bestHand.score)
                st.bestHand = { score: res.score, P: res.P, M: res.M, label: roundLabel(S), dname: R.d.name, cards: uids.map(u => { const q = cardByUid(S, u); return q ? q.id : null; }).filter(Boolean) };
        }
        R.results.push(res);
        R.playsLeft--;
        R.playsUsed++;
        R.firstPlay = false;
        R.played += uids.length;
        const idleish = S.charId === 'idle' || owned(S, 'nap');
        if (!uids.length) {
            if (idleish) {
                S.idleStack *= 1.5;
                log(S, '何もしなかった。玉座の上に時間が積もっていく。');
            }
            S.stats.idleStreak++;
            if (S.charId === 'idle' && S.stats.idleStreak >= 5)
                unlockCard(S, 'throne_dust');
        }
        else {
            S.stats.idleStreak = 0;
            if (idleish && S.idleStack > 1 && !owned(S, 'throne_dust'))
                S.idleStack = 1;
        }
        S.hand = S.hand.filter(u => !uids.includes(u));
        S.stats.destroyed = (S.stats.destroyed || 0) + res.consume.length;
        uids.forEach(u => { if (res.consume.includes(u))
            S.deck = S.deck.filter(c => c.uid !== u);
        else
            S.discard.push(u); });
        if (S.flags.pendingRevolution) {
            S.flags.pendingRevolution = false;
            revolution(S, 3, '自ら起こした蜂起');
            if (S.over)
                return res;
        }
        if (res.auto)
            log(S, 'この災いは、出された手によって形を失った。', 'good');
        const fundsBefore = R._fundsMark == null ? S.funds : R._fundsMark;
        if (!uids.length)
            emit(S, 'pass');
        else {
            emit(S, 'play');
            if (uids.length === 1)
                emit(S, 'singlePlay');
            if (uids.length >= maxPlay(S))
                emit(S, 'maxPlay');
        }
        res.steps.forEach(st => {
            if (st.kind === 'card') {
                emit(S, 'fire', 1, { cat: st.cat, rk: st.rk, rar: st.rar, typ: st.typ });
                if (st.retrig)
                    emit(S, 'retrig');
            }
            if (st.kind === 'fac')
                emit(S, 'facFire');
        });
        if (res.consume.length)
            emit(S, 'consume', res.consume.length);
        if (res.auto || R.total >= R.req)
            endRound(S, true);
        else if (R.playsLeft <= 0)
            endRound(S, false);
        else {
            drawTo(S);
            for (let i = 0; i < (R.extraDraw || 0); i++) {
                if (!S.drawPile.length && S.discard.length) {
                    S.drawPile = shuffle(S.discard.filter(u => cardByUid(S, u)));
                    S.discard = [];
                }
                if (S.drawPile.length)
                    S.hand.push(S.drawPile.shift());
            }
            R.extraDraw = 0;
        }
        return res;
    }
    function collapseCheck(S) {
        const rs = S.regions;
        const dead = rs.filter(r => r.dead).length;
        const hp = rs.reduce((a, r) => a + (r.dead ? 0 : r.hp), 0), mx = rs.reduce((a, r) => a + r.max, 0);
        return dead >= Math.ceil(rs.length / 2) || hp <= mx * 0.3;
    }
    function applyDamage(S, dmg) {
        const before = S.regions.map(r => [r.hp, r.dead]);
        const hit = new Set();
        for (let i = 0; i < dmg; i++) {
            const al = alive(S);
            if (!al.length)
                break;
            const r = pick(al);
            r.hp--;
            hit.add(r);
            if (r.hp <= 0) {
                r.hp = 0;
                r.dead = true;
                log(S, `${r.name}は機能を失った。`, 'bad');
                chron(S, `${r.name}が壊滅`, 'bad');
            }
        }
        hit.forEach(r => { if (!r.dead)
            r.trust = Math.max(0, r.trust - 2); });
        if (collapseCheck(S)) {
            const pg = S.deck.find(c => c.id === 'provisional_gov');
            if (pg) {
                S.regions.forEach((r, i) => { if (before[i]) {
                    r.hp = before[i][0];
                    r.dead = before[i][1];
                } });
                removeCard(S, pg);
                log(S, '臨時政府が被害を引き受け、そして解散した。', 'good');
                chron(S, '臨時政府が壊滅を肩代わり', '');
                return;
            }
            const hc = S.deck.find(c => c.id === 'homecoming');
            if (hc && S.homeId != null) {
                removeCard(S, hc);
                S.regions.forEach(r => { if (r.id === S.homeId) {
                    r.dead = false;
                    r.hp = r.max;
                }
                else {
                    r.dead = false;
                    r.hp = 2;
                    r.trust = 3;
                } });
                initRel(S, 0);
                log(S, '国は崩れた。それでも故郷だけは立っていた。人々はそこから戻ってきた。', 'good');
                chron(S, '帰郷:出身地方から再起', 'resist');
            }
        }
    }
    function endRound(S, success) {
        S.hist = S.hist || [];
        if (S.R && !S.R.histDone) {
            S.R.histDone = true;
            S.hist.push({ label: roundLabel(S), era: S.era, d: S.R.d.name, boss: !!S.R.d.boss, ok: !!success, total: S.R.total, req: S.R.req, C: Math.round(S.C), U: Math.round(S.U), trust: Math.round(avgTrust(S) * 10) / 10, funds: S.funds });
        }
        const R = S.R, d = R.d;
        if (R.done)
            return;
        R.done = true;
        const ratio = R.total / R.req;
        let dmg = 0, rewardMul = 1;
        if (S.charId === 'gambler') {
            const p = clamp(0.5 * ratio, 0.05, 0.95);
            let win = Math.random() < p;
            if (!win && owned(S, 'loaded_dice') && !S.flags.diceUsed) {
                S.flags.diceUsed = true;
                win = Math.random() < p;
                log(S, 'いかさまの賽が振り直された。');
            }
            R.coin = win ? '表' : '裏';
            log(S, `コインは${R.coin}を向いた。`, win ? 'good' : 'bad');
            if (win) {
                success = true;
                rewardMul = 3;
                S.stats.winStreak++;
                if (owned(S, 'double_down'))
                    S.betMult *= 2;
                if (S.stats.winStreak >= 5)
                    unlockCard(S, 'double_down');
            }
            else {
                success = false;
                S.stats.winStreak = 0;
                S.betMult = 1;
                dmg = Math.ceil((d.boss ? 9 : 5) * 2 * (1 - Math.min(ratio, 1) * 0.5));
                if (owned(S, 'house')) {
                    dmg = Math.ceil(dmg / 2);
                    S.funds += 3;
                    log(S, '胴元は負けの一部を回収した。');
                }
            }
        }
        else if (!success) {
            const s = 1 - clamp(ratio, 0, 1);
            dmg = Math.ceil(s * (d.boss ? 12 : 7));
            if (d.winter)
                dmg = Math.ceil(s * 9);
        }
        R.success = success;
        S.flags.prevWin = !!success;
        if (success && d.boss)
            S.stats.bossWins = (S.stats.bossWins || 0) + 1;
        if (!success)
            S.stats.fails = (S.stats.fails || 0) + 1;
        if (dmg > 0 && R.shield)
            dmg = Math.max(0, dmg - R.shield);
        if (dmg > 0 && R.halfDamage)
            dmg = Math.ceil(dmg / 2);
        S.hand.forEach(u => { const k = cardByUid(S, u); if (k)
            k.g.held = (k.g.held || 0) + 1; });
        if (dmg > 0) {
            if (S.idleStack > 1 && S.charId === 'idle')
                dmg = Math.ceil(dmg * 1.5);
            if (owned(S, 'orderly_retreat')) {
                dmg = Math.ceil(dmg / 2);
                changeC(S, S.charId === 'mirror' ? -2 : 2);
            }
            log(S, `${d.name}を抑えきれなかった。被害 ${dmg}。`, 'bad');
            chron(S, `${d.name}で被害(${dmg})`, 'bad');
            if (S.flags.devInvincible)
                dmg = 0;
            else {
                S.stats.damageTaken = (S.stats.damageTaken || 0) + dmg;
                const deadBefore = S.regions.filter(q => q.dead).length;
                applyDamage(S, dmg);
                emit(S, 'damage', dmg);
                const nd = S.regions.filter(q => q.dead).length - deadBefore;
                if (nd > 0)
                    emit(S, 'regionDead', nd);
            }
            if (d.keys.some(k => k === '対立' || k === '分離' || k === '内戦')) {
                const ps = alivePairs(S);
                if (ps.length) {
                    const [a, b] = pick(ps);
                    addRel(S, a, b, -3);
                    log(S, `${regionById(S, a).name}と${regionById(S, b).name}の関係が冷え込んだ。`, 'react');
                }
            }
            S.flags.insurance = 20 * ownedList(S, 'insurance').length;
            S.failNames.push({ name: d.name, roundNo: S.roundNo });
        }
        else
            S.flags.insurance = 0;
        R.dmg = dmg;
        S.score += Math.round(R.total);
        if (success) {
            const surplus = Math.max(0, R.total - R.req);
            log(S, `${d.name}を乗り切った。`, 'good');
            if (R.carryPct) {
                S.carry += surplus * R.carryPct;
            }
            if (R.overFunds) {
                const k = Math.min(8, Math.floor(surplus / R.req * 10)) * R.overFunds;
                if (k > 0) {
                    S.funds += k;
                    log(S, `余った対策値を換金した(議会資金+${k})。`, 'good');
                }
            }
            if (d.boss)
                chron(S, `${d.name}を乗り切る`, 'good');
            S.survived[d.name] = (S.survived[d.name] || 0) + 1;
            S.survivedType[d.type] = (S.survivedType[d.type] || 0) + 1;
            d.keys.forEach(k => { if (k !== d.name)
                S.survived[k] = (S.survived[k] || 0) + 1; });
            if (S.charId === 'calamity' && !d.winter) {
                S.absorbed.push({ name: d.name, type: d.type });
                log(S, `${d.name}を取り込んだ。`);
                if (new Set(S.absorbed.map(a => a.name)).size >= 5)
                    unlockCard(S, 'resonance');
            }
            if (d.keys.includes('分離'))
                ownedList(S, 'reconciliation').forEach(() => allTrust(S, 1));
            if (owned(S, 'compound'))
                S.carry += surplus * 1.15 * Math.min(2, ownedList(S, 'compound').length) * 0.5;
            if (owned(S, 'razor_edge') && surplus <= R.req * 0.05) {
                S.carry += surplus * 10;
                log(S, '紙一重で乗り切った。その余韻が次へ持ち越される。');
            }
            if (!d.boss && owned(S, 'drill'))
                S.drillStore += surplus * 0.1 * ownedList(S, 'drill').length;
            if (!d.boss && surplus <= R.req * 0.01 && !R.results.some(x => x.auto))
                S.meta.exactRounds = (S.meta.exactRounds || 0) + 1;
            if (d.boss && R.allGeneral && R.played > 0)
                S.meta.bossNoType = (S.meta.bossNoType || 0) + 1;
            if (R.played === 0)
                S.meta.idleClear = true;
            if (hasTrait(S, 'technocrat') && d.boss && d.type === '人災' && dmg === 0)
                unlockCard(S, 'cost_benefit');
            if (d.boss && !d.winter)
                S.pendingReward = true;
            const inc = Math.round((3 + Math.floor(S.era / 2) + R.playsLeft + (surplus > R.req * 0.5 ? 1 : 0)) * rewardMul);
            S.funds += inc;
            R.income = inc;
            S.facilities.filter(f => f.id === 'trading_post').forEach(f => { const v = 5 + (f.g.v || 0); S.funds += v; R.income += v; f.g.v = (f.g.v || 0) + 1; });
            S.facilities.filter(f => f.id === 'snowball').forEach(f => { f.g.v = (f.g.v || 0) + 0.25; });
            S.facilities.filter(f => f.id === 'old_tree').forEach(f => { f.g.v = (f.g.v || 0) + 0.4; });
            if (hasAb(S, 'rings'))
                S.flags.rings = (S.flags.rings || 0) + 0.15;
            if (hasAb(S, 'perpetual'))
                S.flags.perp = (S.flags.perp || 1) * 1.08;
            if (hasAb(S, 'aftermath') && surplus > 0)
                S.flags.reqDebt = (S.flags.reqDebt || 0) + surplus;
            if (hasAb(S, 'inheritance'))
                S.carry += surplus * 0.5;
            if (R.onWin) {
                S.funds += R.onWin;
                log(S, `国債が償還された(議会資金+${R.onWin})。`, 'good');
            }
        }
        else {
            S.funds += 2;
            R.income = 2;
        }
        {
            const sv = 4 * R.playsLeft * facCount(S, 'savings');
            S.funds += sv;
            R.income += sv;
        }
        if (hasAb(S, 'budget')) {
            const v = 2 * S.era;
            S.funds += v;
            R.income += v;
        }
        for (let i = 0; i < facCount(S, 'investment_bank'); i++) {
            const v = Math.min(20, Math.floor(S.funds * 0.08));
            S.funds += v;
            R.income += v;
        }
        const cap = 5 + (facCount(S, 'coop_bank') ? 10 : 0) + (hasAb(S, 'interest') ? 10 : 0);
        const interest = hasAb(S, 'national_interest') ? Math.min(30, Math.floor(S.funds * 0.1)) : Math.min(cap, Math.floor(S.funds / 5));
        S.funds += interest;
        R.income += interest;
        if (R.income > 0)
            emit(S, 'fundsGain', R.income);
        emit(S, success ? 'win' : 'fail');
        if (success && d.boss)
            emit(S, 'bossWin');
        emit(S, 'round');
        for (let i = 0; i < facCount(S, 'sweatshop'); i++) {
            const r = alive(S).slice().sort((a, b) => b.trust - a.trust)[0];
            if (r)
                r.trust = Math.max(0, r.trust - 1);
        }
        if (hasAb(S, 'repair'))
            alive(S).forEach(r => { if (r.hp < r.max)
                r.hp++; });
        S.deck.forEach(c => { c.rounds += (hasTrait(S, 'mediator') && CARD[c.id].growth === '指数') ? 1.5 : 1; });
        if (!R.decl)
            ownedList(S, 'transparency').forEach(c => { c.g.v = (c.g.v || 0) + 5; addU(S, -1); });
        S.streakNoC = R.cIncrease ? 0 : S.streakNoC + 1;
        if (!R.cIncrease)
            S.stats.noCRounds = (S.stats.noCRounds || 0) + 1;
        if (dmg > 0 && hasAb(S, 'silver_lining'))
            S.flags.silver = (S.flags.silver || 1) * 1.15;
        tickCountdowns(S, 'round');
        if (success)
            tickCountdowns(S, 'win');
        if (success && d.boss)
            tickCountdowns(S, 'boss');
        S.facilities.forEach(f => {
            if (f.id === 'training_ground' && success && S.deck.length)
                upRandom(S, 1);
            if (f.id === 'masters_atelier' && success && d.boss)
                upBest(S, 2);
            if (f.id === 'clock_tower') {
                f.g.cd = (f.g.cd || 0) + 1;
                if (f.g.cd >= 5) {
                    f.g.cd = 0;
                    S.funds += 25;
                    log(S, '時計塔の鐘が鳴った(議会資金+25)。', 'good');
                }
            }
            if (f.id === 'star_gauge' && success && d.boss) {
                f.g.cd = (f.g.cd || 0) + 1;
                if (f.g.cd >= 3) {
                    f.g.cd = 0;
                    S.facSlots = Math.min(SLOT_CAP, S.facSlots + 1);
                    log(S, '天測所の観測で、新しい用地が見つかった。', 'good');
                }
            }
        });
        if (hasAb(S, 'self_growth')) {
            const used = new Set(R.results.length ? (R.playedAll || []) : []);
            S.deck.forEach(k0 => { const d0 = CARD[k0.id]; if (!used.has(k0.uid) && d0.fx && d0.fx.some(t => t.grow || t.growFunds))
                k0.g.uses = (k0.g.uses || 0) + 1; });
        }
        if (S.endless && owned(S, 'propaganda'))
            S.flags.propA = (S.flags.propA || 0) + 0.2;
        S.returnPenalty = 0;
        S.lowerPlay = 0;
        S.prevDisaster = d;
        if (d.rule === 'blackout')
            S.flags.blackoutAfter = true;
        trackTrust(S);
        if (collapseCheck(S))
            return gameOver(S, 'collapse');
        hiddenUpdate(S);
        if (S.over)
            return;
        if (d.winter && d.winter < 3) {
            S.phase = 'winter';
            return;
        }
        if (d.winter === 3)
            return clearGame(S);
        if (S.rie === 2)
            eraEnd(S);
        else
            S.rie++;
        if (S.over)
            return;
        S.phase = 'result';
    }
    function hiddenUpdate(S) {
        const R = S.R, Ce = Ceff(S);
        alive(S).forEach(r => { if (r.trust > 5)
            r.trust = Math.max(5, r.trust - Math.ceil((r.trust - 5) * 0.15));
        else if (r.trust < 5 && !(R.usedRegions || {})[r.id] && Math.random() < 0.5)
            r.trust += 1; });
        if (!R.success) {
            allTrust(S, -1);
            changeC(S, S.charId === 'mirror' ? -2 : 2);
            log(S, '失敗のあと、首都に権限を集めろという声が強まった。', 'react');
        }
        if (Ce > 50)
            addU(S, (Ce - 50) / 10);
        {
            const bad = alivePairs(S).filter(([a, b]) => getRel(S, a, b) <= -15).length;
            if (bad)
                addU(S, 0.4 * bad);
        }
        addU(S, alive(S).filter(r => r.trust <= 2).length * 0.5);
        if (!R.decl)
            addU(S, Ce < 25 ? -2 : (Ce < 50 ? -1 : 0));
        ownedList(S, 'surveillance').forEach(() => addU(S, -5));
        if (!S.critical && ((S.U >= 70 && Ce >= 55) || S.U >= 92)) {
            S.critical = true;
            S.criticalRound = S.roundNo;
            S.countdown = 10;
            chron(S, '', 'critical');
        }
        if (S.critical) {
            if (S.criticalRound !== S.roundNo) {
                S.countdown -= 1;
                if (R.decl) {
                    S.countdown -= 2;
                    S.accel += 2;
                }
                if (R.cIncrease) {
                    S.countdown -= 1;
                    S.accel += 1;
                }
            }
            if (S.countdown <= 0)
                return coup(S);
        }
        else if (S.U >= 50) {
            let p = Math.pow((S.U - 50) / 50, 2) * (Ce / 100) * 0.5;
            if (hasTrait(S, 'veteran'))
                p *= 0.5;
            if (owned(S, 'old_comrades'))
                p *= 0.5;
            if (Math.random() < p) {
                if (owned(S, 'secret_police') && !S.flags.secretUsed) {
                    S.flags.secretUsed = true;
                    S.flags.secretLeak = true;
                    log(S, '夜のうちに、何人かが連行された。理由は公表されていない。', 'react');
                    chron(S, '秘密警察が未遂の陰謀を摘発', 'decl');
                }
                else
                    return coup(S);
            }
        }
    }
    function eraEnd(S) {
        S.deck.forEach(c => { c.eras += 1; });
        ownedList(S, 'muni_bond').forEach(() => { S.funds += alive(S).length; });
        ownedList(S, 'standing_police').forEach(() => allTrust(S, -1));
        ownedList(S, 'surveillance').forEach(() => allTrust(S, -1));
        if (S.declEra === 0)
            ownedList(S, 'silent_majority').forEach(() => { S.flags.silentA = (S.flags.silentA || 0) + 1; });
        if (hasAb(S, 'trust'))
            allTrust(S, 2);
        if (Ceff(S) > 60) {
            allTrust(S, -1);
            log(S, '首都からの通達が増えた。地方の役場では、読まれずに積まれる書類もある。', 'react');
        }
        if (S.eraMaxC <= 0)
            S.meta.anarchyEra = true;
        S.flags.ccReady = true;
        S.flags.secretUsed = false;
        S.flags.diceUsed = false;
        S.flags.pressUsed = false;
        S.flags.secretLeak = false;
        S.declEra = 0;
        S.era++;
        S.rie = 0;
        S.eraMaxC = S.C;
        if (hasAb(S, 'acceleration'))
            S.flags.accelMul = (S.flags.accelMul || 1) * 1.5;
        tickCountdowns(S, 'era');
        if (!S.sandbox && S.era > (S.meta.best.era || 0))
            S.meta.best.era = S.era;
        log(S, `第${S.era}時代が始まる。`, 'sys');
        D.cards.forEach(c => {
            if (!c.unlock)
                return;
            const m = c.unlock.condition.match(/第(\d+)時代に到達/);
            if (m && !c.unlock.condition.includes('エンドレス') && S.era >= +m[1] && S.charId === c.unlock.character)
                unlockCard(S, c.id);
        });
        if (S.charId === 'citizen' && S.endless && S.era >= 10)
            unlockCard(S, 'nameless_crowd');
        if (S.charId === 'heir' && S.C < 50)
            unlockCard(S, 'dissolution');
        saveMeta(S.meta);
    }
    function unlockCard(S, id) {
        if (S.sandbox || S.meta.cards[id])
            return;
        S.meta.cards[id] = true;
        log(S, `カード「${CARD[id].name}」が解放された。`, 'unlock');
        saveMeta(S.meta);
    }
    function coup(S) {
        if (S.charId === 'revolutionary')
            return revolution(S, 2, 'クーデターが起きた');
        return gameOver(S, 'coup');
    }
    function revolution(S, mult, why) {
        const al = shuffle(alive(S).slice());
        const lose = Math.min(al.length - 1, 1 + rnd(2));
        const lost = al.slice(0, lose);
        lost.forEach(r => { r.dead = true; r.hp = 0; });
        const keep = S.deck.filter(c => CARD_OWNER[c.id] === 'revolutionary' && c.id !== 'uprising');
        S.deck = genDraft(S).slice(0, 8).map(id => mkCard(S, id)).concat(keep);
        S.permMult *= mult;
        S.C = 20;
        S.U = 10;
        S.critical = false;
        S.countdown = null;
        S.criticalRound = null;
        S.revolutions++;
        S.flags.afterRevolution = true;
        if (S.revolutions >= 2)
            unlockCard(S, 'rev_calendar');
        log(S, `${why}。${S.leader}は自ら首都の放送局に立った。旧い制度は一夜で消えた。`, 'boss');
        chron(S, `革命。${lost.map(r => r.name).join('、')}を失う`, 'decl');
        S.drawPile = shuffle(S.deck.map(c => c.uid));
        S.hand = [];
        S.discard = [];
        if (S.R && !S.R.done)
            drawTo(S);
        if (collapseCheck(S))
            return gameOver(S, 'collapse');
    }
    function lastCardRecord(S) {
        const c = S.deck[S.deck.length - 1];
        if (!c)
            return null;
        return { id: c.id, rounds: c.rounds, eras: c.eras, g: c.g, lv: c.lv, keepGrowth: owned(S, 'future_memory') };
    }
    function finalizeMeta(S, kind) {
        const m = S.meta;
        if (S.sandbox) {
            m.history = (m.history || []).concat([{ leader: S.leader, nation: S.nation, char: S.charId, era: S.era, score: S.score, end: kind, endless: S.endless, sandbox: true }]).slice(-20);
            saveMeta(m);
            return;
        }
        m.lastCard = lastCardRecord(S);
        m.lastDisaster = S.R ? S.R.d.name : null;
        if (S.score > (m.best.score || 0))
            m.best.score = S.score;
        m.history = (m.history || []).concat([{ leader: S.leader, nation: S.nation, char: S.charId, era: S.era, score: S.score, end: kind, endless: S.endless }]).slice(-20);
        if (kind === 'coup' || kind === 'clearCritical') {
            m.coups = (m.coups || 0) + 1;
            if (m.coups >= 1)
                m.chars.puppet = true;
            if (m.coups >= 3)
                m.chars.revolutionary = true;
        }
        if (kind === 'clear' || kind === 'clearCritical') {
            m.clears[S.charId] = true;
            if (S.maxC <= 15)
                m.chars.exile = true;
            if (Math.round(S.C) === 50)
                m.chars.mirror = true;
            if (BASIC.every(b => m.clears[b]))
                m.chars.citizen = true;
            if (Object.keys(m.clears).length >= 5)
                m.chars.twins = true;
            D.cards.forEach(c => { if (c.unlock && c.unlock.character === S.charId && c.unlock.condition === `${CHAR[S.charId].name}で本編クリア`)
                m.cards[c.id] = true; });
            if (S.charId === 'mediator' && S.declCount === 0)
                m.cards.silent_majority = true;
            if (S.charId === 'mirror' && kind === 'clearCritical')
                m.cards.inverted_chronicle = true;
        }
        if (kind === 'collapse') {
            const f = S.failNames;
            if (f.length >= 2 && f[f.length - 1].name === f[f.length - 2].name && f[f.length - 1].roundNo - f[f.length - 2].roundNo === 1)
                m.chars.timetraveler = true;
        }
        if (S.endless && S.era >= 10 && S.declCount >= 8)
            m.chars.heir = true;
        if ((m.bossNoType || 0) >= 3)
            m.chars.prophet = true;
        if (m.idleClear)
            m.chars.idle = true;
        if (m.anarchyEra)
            m.chars.anarchist = true;
        if ((m.exactRounds || 0) >= 3)
            m.chars.gambler = true;
        if (D.disasters.boss.every(b => m.bossesSeen.includes(b.name)))
            m.chars.calamity = true;
        if (S.charId === 'scholar' && S.stats.omensSeen >= 10)
            m.cards.peer_review = true;
        if (S.charId === 'prophet' && S.propMiss >= 3)
            m.cards.false_prophecy = true;
        if (S.charId === 'prophet' && S.propStreak >= 10)
            m.cards.eschatology = true;
        if (S.charId === 'exile' && alive(S).every(r => r.trust >= 10))
            m.cards.return_promise = true;
        saveMeta(m);
    }
    function gameOver(S, kind) {
        S.phase = 'over';
        S.over = kind;
        chron(S, kind === 'coup' ? 'クーデター' : '国家の壊滅', 'bad');
        S.ending = makeEnding(S, kind);
        finalizeMeta(S, kind);
        clearRun();
    }
    function clearGame(S) {
        if (S.critical) {
            chron(S, '長い冬を越える', 'good');
            chron(S, 'クーデター', 'bad');
            S.phase = 'over';
            S.over = 'coup';
            S.ending = makeEnding(S, 'clearCritical');
            finalizeMeta(S, 'clearCritical');
            clearRun();
            return;
        }
        S.phase = 'clear';
        S.over = null;
        chron(S, '長い冬を越える(本編クリア)', 'good');
        S.ending = makeEnding(S, 'clear');
        finalizeMeta(S, 'clear');
        saveRun(S);
    }
    function continueEndless(S) {
        S.endless = true;
        S.era = 9;
        S.rie = 0;
        S.eraMaxC = S.C;
        log(S, '春は来た。だが、空の向こうから別のものが近づいている。', 'boss');
        chron(S, 'エンドレスへ', 'start');
        S.nextD = null;
        enterParliament(S);
    }
    function makeEnding(S, kind) {
        const keep = alive(S).filter(r => r.trust >= 7).map(r => r.name);
        const N = S.nation, L = S.leader;
        const P = [];
        let title;
        if (kind === 'coup' || kind === 'clearCritical') {
            title = '夜明けの放送';
            if (kind === 'clearCritical')
                P.push('長い冬は越えた。雪解けの式典の翌朝、首都の通りに見慣れない車両が並んだ。');
            P.push(`ある朝、${N}の国営放送はいつもの番組を流さなかった。画面には軍服の男が座り、国家の秩序を回復すると読み上げた。`);
            if (!S.critical)
                P.push(`前触れは少なかった。少なくとも、${L}にはそう見えていた。`);
            const harsh = S.accel - S.resist;
            if (harsh >= 3)
                P.push('新しい体制は、最初の週に地方議会を停止し、夜間の外出を禁じた。抗議した市長たちの名前は、翌月の新聞から消えた。');
            else if (S.resist >= 4)
                P.push('新しい体制は、地方の抵抗を前に慎重だった。いくつかの地方では議会が開かれ続け、首都はそれを黙認した。');
            else
                P.push('新しい体制は地方議会を一時停止とした。一時がどれほどの長さかは、誰も尋ねなかった。');
            if (S.resist >= 4)
                P.push(`後の歴史家は、${L}を最後まで権限を返そうとした指導者として記した。それが遅すぎたことも、併せて。`);
            else if (S.declCount >= 6)
                P.push(`後の歴史家は、${L}の宣言の数を数え、それが新しい体制の準備を整えたと書いた。`);
            else
                P.push(`後の歴史家は、${L}について多くを書かなかった。`);
            P.push(keep.length ? `${keep.join('、')}では、自治が残った。首都の命令は、そこまでは届かなかった。` : '自治を守り抜いた地方は、残らなかった。');
        }
        else if (kind === 'collapse') {
            title = 'ばらばらの国';
            P.push(`災いは続き、${N}の首都の電話は鳴らなくなった。各地は自分たちの手で瓦礫を片付け始め、やがて首都の存在を思い出さなくなった。`);
            if (Ceff(S) >= 60)
                P.push('権限は中央に集まっていた。だから中央が倒れたとき、代わりに立つものがなかった。');
            else if (Ceff(S) <= 20)
                P.push('地方には力があった。ただ、それをつなぐ糸が間に合わなかった。');
            else
                P.push('どこで何を間違えたのか、誰にも一言では言えなかった。');
            P.push(keep.length ? `${keep.join('、')}は、小さな共同体として残った。` : '残った地方も、やがて名前を変えた。');
        }
        else {
            title = '春の名前';
            if (Ceff(S) <= 20)
                P.push(`長い冬が明けたとき、${N}の首都の役所はほとんど何もしていなかった。それぞれの地方が、それぞれのやり方で春を迎えた。`);
            else if (Ceff(S) <= 55)
                P.push(`長い冬が明けた。${N}の首都と地方は互いに文句を言い合いながら、同じ畑を耕し直した。`);
            else
                P.push(`冬は越えた。ただ、${N}の春の式典で拍手が起きる場所は、あらかじめ決められていた。`);
            if (S.declCount === 0)
                P.push('この国は一度も緊急事態を宣言しなかった。そのことを誇る者も、怪しむ者もいた。');
            else if (S.declCount >= 6)
                P.push(`宣言は${S.declCount}回出された。人々はその回数を、少しずつ数えなくなっていった。`);
            P.push(keep.length ? `${keep.join('、')}は、自分たちのやり方を手放さなかった。` : '地方の自治は、冬のあいだに少しずつ痩せていた。');
        }
        return { title, paragraphs: P, kind };
    }
    const AB_TIER = {
        momentum: 1, fixer: 1, vanguard: 1, double_seal: 1, inheritance: 1, giant_slayer: 1, contrarian: 1, terror: 1, silver_lining: 1, double_order: 1, reserve: 1,
        ring_of_unity: 2, gold_weight: 2, aftermath: 2, self_growth: 2, home_ground: 2, encore_all: 2, creative_destruction: 2, perpetual: 2, emergency_norm: 2, limitless: 2, national_interest: 2,
        compound: 3, powerup: 3, balance: 3, open_table: 3, gearing: 3, acceleration: 3, discard_voice: 3, finisher: 3,
    };
    function abilityPool(S) { const tier = S.era <= 2 ? 1 : S.era <= 5 ? 2 : 3; return Object.keys(ABILITIES).filter(k => !hasAb(S, k) && (AB_TIER[k] || 1) <= tier); }
    function makeReward(S) {
        const opts = [];
        const rr = pick(['C', 'C', 'U', 'U', 'U', 'R', 'R', 'L']);
        const p1 = D.cards.filter(c => c.rarity === rr && isAvailable(S, c.id) && !maxedOwned(S, c.id));
        if (p1.length)
            opts.push({ kind: 'card', id: pick(p1).id, stamp: pick((D.stamps || []).map(x => x.id)) });
        const legend = S.era >= 4 && Math.random() < 0.12 + 0.04 * (S.era - 4);
        let p2 = D.cards.filter(c => c.rarity === (legend ? 'X' : 'L') && isAvailable(S, c.id) && !owned(S, c.id));
        if (!p2.length)
            p2 = D.cards.filter(c => c.rarity === 'L' && isAvailable(S, c.id) && !owned(S, c.id));
        if (p2.length)
            opts.push({ kind: 'card', id: pick(p2).id });
        const p3 = (D.facilities || []).filter(f => !S.facilities.some(x => x.id === f.id));
        if (p3.length) {
            const w = p3.map(f => ({ C: 2, U: 3, R: 4 }[f.rarity] || 2));
            let t = Math.random() * w.reduce((a, b) => a + b, 0), k = 0;
            while (k < p3.length - 1 && t > w[k]) {
                t -= w[k];
                k++;
            }
            opts.push({ kind: 'fac', id: p3[k].id });
        }
        see(S, opts.filter(o => o.kind === 'card').map(o => o.id));
        S.reward = { options: opts };
        S.phase = 'reward';
        saveRun(S);
    }
    function rerollRewardCost(S) { return 10 * Math.pow(2, (S.reward && S.reward.rerolls) || 0); }
    function rerollReward(S) {
        if (S.phase !== 'reward' || S.funds < rerollRewardCost(S))
            return false;
        S.funds -= rerollRewardCost(S);
        spendNote(S, rerollRewardCost(S));
        const n = (S.reward.rerolls || 0) + 1;
        makeReward(S);
        S.reward.rerolls = n;
        return true;
    }
    function pickReward(S, i) {
        if (S.phase !== 'reward')
            return false;
        const o = S.reward.options[i];
        if (!o)
            return false;
        if (o.kind === 'fac') {
            if (S.facilities.length >= S.facSlots)
                S.facSlots = Math.min(SLOT_CAP, S.facSlots + 1);
            if (S.facilities.length < S.facSlots) {
                S.facilities.push({ uid: S.uid++, id: o.id, g: {} });
                emit(S, 'buyFac');
            }
            log(S, `「${FAC[o.id].name}」が建った。`, 'unlock');
            chron(S, `施設「${FAC[o.id].name}」を得る`, '');
        }
        else {
            const got = gainCard(S, o.id, '');
            if (o.stamp && got) {
                got.stamp = o.stamp;
                got.stampedAt = S.roundNo;
            }
            chron(S, `「${CARD[o.id].name}」を得る`, '');
        }
        S.reward = null;
        S.pendingReward = false;
        enterParliament(S);
        return true;
    }
    function skipReward(S) { if (S.phase !== 'reward')
        return; S.reward = null; S.pendingReward = false; enterParliament(S); }
    function isAvailable(S, id) {
        const c = CARD[id];
        if (!c.unlock)
            return true;
        if (S.sandbox)
            return true;
        return c.unlock.character === S.charId && cardUnlocked(S.meta, id);
    }
    function priceOf(S, id) { return Math.max(1, Math.round(PRICE[CARD[id].rarity] * priceMul(S))); }
    function luckOf(S) {
        let l = 0, ll = 0;
        S.deck.forEach(c => {
            const d = CARD[c.id], k = 1 + 0.5 * (c.lv || 0);
            if (d.fx)
                d.fx.forEach(t => { if (t.luck)
                    l += t.luck * k; if (t.legendLuck)
                    ll += t.legendLuck * k; if (t.luckAcc && c.g.accLuck)
                    l += c.g.accLuck * k; });
            if (c.stamp === 'lucky')
                l += 1;
        });
        (S.facilities || []).forEach(f => { const d = FAC[f.id]; if (d) {
            l += d.luck || 0;
            ll += d.legendLuck || 0;
        } });
        return { l, ll };
    }
    const GROUP_W = { C: 50, U: 32, R: 16 };
    function pickRarity(S, bonus) {
        const { l, ll } = luckOf(S);
        const L = l + (bonus || 0);
        const w = { C: GROUP_W.C, U: GROUP_W.U, R: GROUP_W.R * (1 + 0.04 * L), L: 0.6 * (1 + L), X: 0.06 * Math.pow(1 + L + 2 * ll, 1.3) };
        const tot = Object.values(w).reduce((a, b) => a + b, 0);
        let t = Math.random() * tot;
        for (const r of ['C', 'U', 'R', 'L', 'X']) {
            if (t < w[r])
                return r;
            t -= w[r];
        }
        return 'C';
    }
    function genOffers(S) {
        let n = 3 + (Ceff(S) >= 30 ? 1 : 0) + (Ceff(S) >= 60 ? 1 : 0) + (S.offerPlus || 0);
        const extra = facCount(S, 'auction_house');
        const out = [];
        for (let i = 0; i < n + extra; i++) {
            const rar = pickRarity(S, i >= n ? 3 : 0);
            let pool = D.cards.filter(c => c.rarity === rar && isAvailable(S, c.id) && !out.includes(c.id) && !maxedOwned(S, c.id));
            if (!pool.length)
                pool = D.cards.filter(c => c.rarity === 'C' && isAvailable(S, c.id));
            const ws = pool.map(c => c.unlock ? 1.6 : 1);
            let t = Math.random() * ws.reduce((a, b) => a + b, 0), k = 0;
            while (k < ws.length - 1 && t > ws[k]) {
                t -= ws[k];
                k++;
            }
            out.push(pool[k].id);
        }
        see(S, out);
        return out.map(id => ({ id, price: priceOf(S, id), sold: false }));
    }
    function enterParliament(S, first) {
        if (!S.sandbox)
            saveMeta(S.meta);
        S.phase = 'parliament';
        S.P = { returns: 0, rerollCost: 2, facReroll: 2, stampReroll: 2, rr: { c: 0, f: 0, s: 0 }, stamped: false, pendingStamp: null, reveal: [] };
        if (!S.nextD)
            S.nextD = makeDisaster(S);
        if (S.debt) {
            const pay = Math.min(S.funds, S.debt);
            S.funds -= pay;
            if (pay < S.debt) {
                allTrust(S, -1);
                log(S, '借款を返しきれなかった。各地の信頼が落ちた。', 'bad');
            }
            else
                log(S, `借款${pay}を返した。`, 'sys');
            S.debt = 0;
        }
        S.shop = genOffers(S);
        S.facShop = genFacOffers(S);
        S.stampShop = genStampOffers(S);
        if (hasAb(S, 'intel'))
            S.P.reveal.push(`情報網の報告:次は${S.nextD.name}(${S.nextD.type})。`);
        else if (owned(S, 'expert_panel'))
            S.P.reveal.push(`専門家委員会の見立て:次は${S.nextD.type}系の災害が来る。`);
        if (owned(S, 'oracle') && S.nextD.boss)
            S.P.reveal.push(`神託:次に来るのは${S.nextD.name}。`);
        if (S.charId === 'prophet') {
            const t = Math.random() < 0.72 ? S.nextD.type : pick(TYPES.filter(x => x !== S.nextD.type));
            S.prophecy = t;
            S.P.reveal.push(`${S.leader}は次に来るものを口にした。「${t}の災いが来る」`);
        }
        trackTrust(S);
        S.event = first ? null : rollEvent(S);
        S.flags.blackoutAfter = false;
        saveRun(S);
    }
    function buy(S, i) {
        const o = S.shop[i];
        if (!o || o.sold || S.funds < o.price)
            return false;
        S.funds -= o.price;
        spendNote(S, o.price);
        o.sold = true;
        gainCard(S, o.id, '議会は');
        S.P.buys = (S.P.buys || 0) + 1;
        refreshPrices(S);
        emit(S, 'buy');
        return true;
    }
    function maxLvOf(S, inst) { return CARD[inst.id] && CARD[inst.id].upRepeat ? 999 : 1; }
    function maxLv(S) { return 1; }
    function upK(S, inst, regionKey) {
        const lv = inst.lv || 0;
        if (!lv)
            return 1;
        if (CARD[inst.id].upRepeat)
            return 1 + 0.15 * lv;
        return 2 + (regionKey === 'yamashiro' ? 0.5 : 0) + 0.5 * facCount(S, 'forge') + (hasAb(S, 'limitless') ? 0.5 : 0);
    }
    function mergeTarget(S, id) { if (id === 'neighbor')
        return null; return S.deck.filter(c => c.id === id && (c.lv || 0) < maxLvOf(S, c)).sort((a, b) => (b.lv || 0) - (a.lv || 0))[0] || null; }
    function maxedOwned(S, id) { return id !== 'neighbor' && S.deck.some(c => c.id === id) && !mergeTarget(S, id); }
    function gainCard(S, id, who) {
        if (maxedOwned(S, id)) {
            const tg = pick(S.deck.filter(c => c.id === id));
            const sid = pick((D.stamps || []).map(x => x.id));
            tg.stamp = sid;
            tg.stampedAt = S.roundNo;
            log(S, `「${CARD[id].name}」はもう強化しきっている。かわりに${STAMP[sid].name}が押された。`, 'unlock');
            return tg;
        }
        const t = mergeTarget(S, id);
        if (t) {
            lvUp(S, t, 1);
            log(S, `${who || ''}「${CARD[id].name}」を重ねて承認し、強化した。`);
            if (hasAb(S, 'double_order')) {
                const c2 = mkCard(S, id);
                S.deck.push(c2);
            }
            return t;
        }
        const c = mkCard(S, id);
        S.deck.push(c);
        log(S, `${who || ''}「${CARD[id].name}」を承認した。`);
        return c;
    }
    function sellValue(S, inst) { return fib(S.stats.removals || 0); }
    function sell(S, uid) {
        if (S.deck.length <= 5)
            return false;
        const c = cardByUid(S, uid);
        if (!c)
            return false;
        const cost = sellValue(S, c);
        if (S.funds < cost)
            return false;
        removeCard(S, c);
        S.funds -= cost;
        spendNote(S, cost);
        S.stats.removals = (S.stats.removals || 0) + 1;
        if (S.charId === 'heir' && CARD[c.id].alignment === '抑圧') {
            S.stats.suppressBurned++;
            if (S.stats.suppressBurned >= 3)
                unlockCard(S, 'burn_legacy');
        }
        emit(S, 'sell');
        if (hasAb(S, 'creative_destruction'))
            S.flags.destroyMul = (S.flags.destroyMul || 1) * 1.1;
        log(S, `「${CARD[c.id].name}」を廃止した。`);
        return true;
    }
    function freeRoll(S, k) { if (!hasAb(S, 'fixer') || (S.P.free || {})[k])
        return false; S.P.free = S.P.free || {}; S.P.free[k] = true; return true; }
    function reroll(S) {
        if (freeRoll(S, 'card')) {
            S.shop = genOffers(S);
            emit(S, 'reroll');
            return true;
        }
        if (S.funds < S.P.rerollCost)
            return false;
        S.funds -= S.P.rerollCost;
        spendNote(S, S.P.rerollCost);
        S.P.rr.c++;
        S.P.rerollCost = 2 * fib(S.P.rr.c);
        S.shop = genOffers(S);
        return true;
    }
    const MAX_LV = 5;
    const FILLER = 12;
    function upgradeCost(S, inst) { return Math.max(1, 4 + 3 * (inst.lv || 0) - (hasAb(S, 'workshop') ? 2 : 0) - 2 * facCount(S, 'forge')); }
    function upgrade(S, uid) {
        const c = cardByUid(S, uid);
        if (!c || (c.lv || 0) >= MAX_LV)
            return false;
        const cost = upgradeCost(S, c);
        if (S.funds < cost)
            return false;
        S.funds -= cost;
        spendNote(S, cost);
        c.lv = (c.lv || 0) + 1;
        log(S, `「${CARD[c.id].name}」を強化した。`);
        return true;
    }
    function returnCost(S) { return 2 * fib(S.stats.returns || 0); }
    const RET_REACT = ['地方は静かに受け入れた。', '{r}の代表から、短い礼状が届いた。', '返還の知らせは、地方紙の片隅に載った。', '{r}の役場で、古い印章が引き出しから出された。'];
    const RET_REACT_LATE = ['返還の知らせは、あまり読まれなかったようだ。', '{r}の代表は、遅すぎると言った。', '首都の役人の何人かが、書類の移管を渋った。'];
    function returnPower(S) {
        const cost = returnCost(S);
        if (S.phase !== 'parliament' || S.funds < cost || Ceff(S) <= 0)
            return false;
        S.funds -= cost;
        spendNote(S, cost);
        S.P.returns++;
        S.stats.returns = (S.stats.returns || 0) + 1;
        changeC(S, S.charId === 'mirror' ? 4 : -4);
        const r = alive(S).slice().sort((a, b) => a.trust - b.trust)[0];
        if (r)
            r.trust = Math.max(0, r.trust + 1);
        addU(S, -2);
        S.returnPenalty = 1;
        if (S.critical)
            S.resist += 1;
        log(S, '権限の一部を地方へ返した。', 'act');
        log(S, pick(S.critical ? RET_REACT_LATE : RET_REACT).replace('{r}', r ? r.name : '地方'), 'react');
        chron(S, '権限を返還', 'resist');
        emit(S, 'returnPower');
        if (S.charId === 'heir' && S.C < 50)
            unlockCard(S, 'dissolution');
        return true;
    }
    function leaveParliament(S) {
        if (S.phase !== 'parliament')
            return false;
        if (S.event && !S.event.resolved)
            return false;
        S.stats.spentLastParl = S.stats.spentThisParl || 0;
        S.stats.spentThisParl = 0;
        emit(S, 'leaveParl');
        if (S.P)
            S.P.pendingStamp = null;
        if (S.event && !S.event.resolved)
            return false;
        startRound(S);
        return true;
    }
    function nextFromResult(S) {
        if (S.phase === 'winter') {
            startRound(S, S.R.d.winter + 1);
            return;
        }
        if (S.phase === 'result') {
            if (S.pendingReward)
                makeReward(S);
            else
                enterParliament(S);
        }
    }
    const tr = (r, d) => { r.trust = Math.max(0, r.trust + d); };
    const pay = (S, n) => { S.funds = Math.max(0, S.funds - n); };
    const EVENTS = [
        { id: 'harvest', tier: 0, title: '収穫祭の招待', text: '{r}から収穫祭への招待状が届いた。',
            choices: [{ label: '出席する', fx: (S, r) => { pay(S, 1); tr(r, 1); }, react: '{r}の人々は、指導者が来たことを喜んだ。' },
                { label: '祝電を送る', fx: () => { }, react: '祝電は式典の最後に読み上げられた。' }] },
        { id: 'petition', tier: 0, title: '橋の補修の陳情', text: '{r}から、古い橋の補修を求める陳情が届いた。',
            choices: [{ label: '予算をつける', fx: (S, r) => { pay(S, 2); if (r.hp < r.max)
                        r.hp++; }, react: '翌月、橋に足場が組まれた。' },
                { label: '次の議会に回す', fx: (S, r) => { tr(r, -1); }, react: '陳情書は棚に戻された。' }] },
        { id: 'envoy', tier: 0, title: '視察団', text: '外国の視察団が、この国の地方制度を学びに来た。',
            choices: [{ label: '地方を案内する', fx: S => { S.funds += 2; }, react: '視察団は帰国後、少額の支援を申し出た。' },
                { label: '資料だけ渡す', fx: S => { S.funds += 1; }, react: '資料は丁寧に受け取られた。' }] },
        { id: 'fair', tier: 0, title: '合同の市', text: '{r}と隣の地方が、合同で市を開きたいと言っている。',
            choices: [{ label: '後援する', fx: S => { pay(S, 2); addLinks(S, 1); }, react: '市は賑わった。帰り道、二つの地方の役人が同じ車に乗っていた。' },
                { label: '見守る', fx: () => { }, react: '市は小さく開かれ、小さく終わった。' }] },
        { id: 'report', tier: 0, title: '大学の報告書', text: '首都の大学が、災害対応についての報告書を送ってきた。',
            choices: [{ label: '地方に配る', fx: (S, r) => { pay(S, 1); tr(r, 1); }, react: '報告書は各地の役場に届いた。' },
                { label: '書庫に収める', fx: () => { }, react: '報告書は書庫の三段目に収められた。' }] },
        { id: 'officers', tier: 1, omen: true, title: '将校の不満', text: '首都の連隊で、昇進の遅れについての苦情が続いている。',
            detail: '苦情は二つの連隊に集中している。どちらも同じ士官学校の同期が率いている。', truth: '軍の一部が、中央の権限を当てにし始めている。',
            choices: [{ label: '予算を回して宥める', fx: S => { pay(S, 3); addU(S, -4); }, react: '苦情はしばらく止んだ。' },
                { label: '連隊長を入れ替える', fx: S => { changeC(S, 2); addU(S, -1); }, react: '新しい連隊長は、着任の挨拶で多くを語らなかった。' },
                { label: '聞き置く', fx: S => { addU(S, 3); }, react: '苦情の書面は、次の週も届いた。' }] },
        { id: 'protest', tier: 1, omen: true, title: '広場の集会', text: '{r}の広場に人が集まり、首都の決定に抗議している。',
            detail: '掲げられた紙には、指導者の名前ではなく「中央」とだけ書かれている。', truth: '地方は、権限が上へ吸い上げられていると感じている。',
            choices: [{ label: '代表と会う', fx: (S, r) => { pay(S, 1); addU(S, -3); tr(r, 1); }, react: '代表は握手のあと、写真を撮らせなかった。' },
                { label: '治安部隊に任せる', fx: (S, r) => { changeC(S, 1); addU(S, 4); tr(r, -2); }, react: '広場は夕方までに空になった。' }] },
        { id: 'press', tier: 1, omen: true, title: '短い質問', text: '定例会見で、記者たちの質問が短くなった。',
            detail: '先月まで最前列にいた記者が、今日は後ろの席にいた。', truth: '報道が自主規制を始めている。',
            choices: [{ label: '時間を長めに取る', fx: S => { addU(S, -3); }, react: '一人の記者が、遠慮がちに手を挙げた。' },
                { label: '予定どおり切り上げる', fx: S => { addU(S, 2); }, react: '会見は十二分で終わった。' }] },
        { id: 'absence', tier: 1, omen: true, title: '地方代表の欠席', text: '{r}の代表が議会を欠席した。理由は体調不良とされている。',
            detail: '欠席届の日付は、議題の通知より前だった。', truth: '地方が議会を形だけのものと見なし始めている。',
            choices: [{ label: '自ら訪ねる', fx: (S, r) => { pay(S, 2); tr(r, 1); addU(S, -3); }, react: '代表は玄関先で出迎えた。顔色は悪くなかった。' },
                { label: '欠席のまま採決する', fx: (S, r) => { changeC(S, 1); addU(S, 3); tr(r, -1); }, react: '採決は全会一致だった。' }] },
        { id: 'aide', tier: 2, omen: true, title: '深夜の会食', text: '側近の一人が、深夜に将校たちと食事をしていたと報告があった。',
            detail: '同席者の名簿には、先月表彰したばかりの大佐の名前がある。', truth: '側近の一部が、指導者抜きの将来を相談している。',
            choices: [{ label: '本人に問いただす', fx: S => { addU(S, -2); }, react: '側近は笑って、ただの同窓会だと言った。' },
                { label: '監視をつける', fx: S => { changeC(S, 2); addU(S, -4); }, react: '報告書は毎朝届くようになった。中身は毎朝ほとんど同じだった。' },
                { label: '何もしない', fx: S => { addU(S, 4); }, react: '翌週、同じ店の名前がもう一度報告に上がった。' }] },
        { id: 'barracks', tier: 2, omen: true, title: '兵舎の灯り', text: '首都の兵舎で、夜遅くまで灯りがついている日が続いている。',
            detail: '燃料の消費量が、演習計画と合わない。', truth: '部隊が非公式に動員の準備をしている。',
            choices: [{ label: '視察に行く', fx: S => { pay(S, 1); addU(S, -3); }, react: '兵舎は整然としていた。整然としすぎていた。' },
                { label: '見なかったことにする', fx: S => { addU(S, 5); }, react: '灯りは、その週も消えなかった。' }] },
        { id: 'resign', tier: 2, omen: true, title: '辞任届', text: '長く仕えた側近が、家族の事情を理由に辞任を申し出た。',
            detail: '彼は辞任の前日、私物の書類をすべて持ち帰っている。', truth: '沈む船から降りる者が出始めている。',
            choices: [{ label: '慰留する', fx: S => { addU(S, -1); }, react: '彼は一晩考えさせてほしいと言い、翌朝もう一度辞任届を出した。' },
                { label: '受理する', fx: S => { addU(S, 2); }, react: '送別会には、思ったより人が集まらなかった。' }] },
        { id: 'letter', tier: 3, omen: true, title: '差出人のない手紙', text: '執務室の机に、差出人のない手紙が置かれていた。「春までに決めてください」とだけある。',
            detail: '便箋は、軍の官給品と同じ紙だ。', truth: '計画は最終段階にある。',
            choices: [{ label: '警備を増やす', fx: S => { changeC(S, 2); addU(S, -2); }, react: '新しい警備兵は、目を合わせなかった。' },
                { label: '破り捨てる', fx: S => { addU(S, 3); }, react: '屑籠は翌朝、いつもより早く片付けられていた。' }] },
        { id: 'guard', tier: 3, omen: true, title: '衛兵の交代', text: '宮殿の衛兵が、予定にない時間に交代した。新しい顔ぶればかりだ。',
            detail: '交代を命じた署名は、見たことのない書式だった。', truth: '宮殿の警備は、すでに指導者の手を離れつつある。',
            choices: [{ label: '理由を尋ねる', fx: S => { addU(S, -1); }, react: '衛兵長は、規則が変わったのだと答えた。' },
                { label: '黙って通り過ぎる', fx: S => { addU(S, 3); }, react: '廊下の足音が、背後でしばらく続いた。' }] }
    ];
    function rollEvent(S) {
        const U = S.U;
        const tier = U >= 75 ? 3 : U >= 50 ? 2 : U >= 22 ? 1 : 0;
        const pOmen = S.charId === 'citizen' ? 0.15 + Math.random() * 0.5 : U / 110;
        let ev = null;
        if ((tier > 0 || S.charId === 'citizen') && Math.random() < pOmen) {
            const pool = EVENTS.filter(e => e.omen && (S.charId === 'citizen' || (e.tier <= tier && e.tier >= Math.max(1, tier - 1))));
            ev = pick(pool);
        }
        else if (Math.random() < 0.3)
            ev = pick(EVENTS.filter(e => e.tier === 0));
        if (!ev)
            return null;
        const r = pick(alive(S));
        if (ev.omen) {
            if (owned(S, 'local_press') && !S.flags.pressUsed) {
                S.flags.pressUsed = true;
                addU(S, -2);
                log(S, '地方紙の小さな記事が、騒ぎになる前の何かを鎮めた。');
                return null;
            }
            S.omenCount++;
            S.stats.omensSeen++;
            emit(S, 'omen');
            const kind = S.chron.some(c => c.kind === 'omen1') ? 'omen' : 'omen1';
            if (owned(S, 'censorship') || S.flags.blackoutAfter) {
                ev.choices[ev.choices.length - 1].fx(S, r);
                chron(S, `${ev.title}(報告は上がらなかった)`, kind);
                return null;
            }
            chron(S, ev.title, kind);
        }
        return { id: ev.id, rid: r.id, resolved: false, omen: !!ev.omen, title: ev.title, text: ev.text.replace('{r}', r.name),
            detail: (hasTrait(S, 'scholar') && ev.detail) ? ev.detail : null,
            truth: (owned(S, 'peer_review') && ev.truth) ? ev.truth : null,
            choices: ev.choices.map(c => c.label) };
    }
    function resolveEvent(S, idx) {
        const e = S.event;
        if (!e || e.resolved)
            return;
        const def = EVENTS.find(x => x.id === e.id);
        const r = regionById(S, e.rid);
        const ch = def.choices[idx];
        if (!ch)
            return;
        ch.fx(S, r && !r.dead ? r : pick(alive(S)));
        trackTrust(S);
        e.resolved = true;
        e.chosen = idx;
        log(S, `${e.title}:${ch.label}。`, 'act');
        log(S, ch.react.replace('{r}', r ? r.name : '地方'), 'react');
        emit(S, 'event');
        saveRun(S);
    }
    function windowStage(S) {
        if (!S.critical || S.countdown == null)
            return 0;
        if (S.countdown >= 7)
            return 1;
        if (S.countdown >= 4)
            return 2;
        return 3;
    }
    function useRevision(S) {
        if (!S.snapshot || S.flags.revisionUsed)
            return false;
        const meta = S.meta;
        const restored = JSON.parse(S.snapshot);
        Object.keys(S).forEach(k => { delete S[k]; });
        Object.assign(S, restored);
        S.meta = meta;
        S.flags.revisionUsed = true;
        const rv = S.deck.find(c => c.id === 'revision');
        if (rv) {
            removeCard(S, rv);
            drawTo(S);
        }
        S.snapshot = null;
        log(S, 'このラウンドの始まりに立ち戻っていた。', 'sys');
        chron(S, '修正:ラウンドをやり直す', '');
        return true;
    }
    function canRevise(S) { return !!S.snapshot && !S.flags.revisionUsed && S.R && S.R.done && !S.R.success; }
    function twinSwap(S) {
        if (S.charId !== 'twins' || !owned(S, 'swap'))
            return false;
        S.twinIdx = 1 - S.twinIdx;
        S.flags.twinLock = !S.flags.twinLock;
        log(S, '片割れが入れ替わった。', 'sys');
        return true;
    }
    const QLABEL = { trustTaken: '削った信頼の累計', trustTaken5: '削った信頼の累計(5ごと)', trustTaken10: '削った信頼の累計(10ごと)', damageTaken: '受けた被害の累計', damageTaken10: '受けた被害の累計(10ごと)', damageTaken2: '受けた被害の累計(2ごと)',
        fails: '乗り切れなかったラウンド', discardsTotal: '引き直しで捨てた枚数', spent50: '使った資金(50ごと)', spent20: '使った資金(20ごと)', spent100: '使った資金(100ごと)', spentTotal: '使った資金の累計', spentLastParl: '直前の議会で使った資金',
        held: '手札で過ごしたラウンド', uses: '出した回数', eras: '持ってから過ぎた時代', rounds: '持ってから過ぎたラウンド', bossWins: 'ボスを越えた回数', chronCount: '年表の出来事', decls: '宣言の回数', noCRounds: '集権が進まなかったラウンド',
        links: '協力関係', funds: '議会資金', fundsLog: '議会資金が倍になった回数', funds5: '議会資金(5ごと)', funds10: '議会資金(10ごと)', posRel: 'プラスの関係値の合計', posRel20: 'プラスの関係値の合計(20ごと)', statSum: '削った信頼・被害・失敗の合計',
        lowTrust: '信頼3以下の地方', trustDeficit: '信頼の不足の合計', sumTrust10: '信頼の合計(10ごと)', deckSize: '持ち札の枚数', deckUnique: '持ち札の種類', deckBase100: '持ち札の基礎の合計(100ごと)', lvTotal: '持ち札の強化の合計',
        facilitiesCount: '建っている施設', researchDeck: '研究系の持ち札', omens: '前兆の回数', Cval: '集権度', C10: '集権度(10ごと)', C20: '集権度(20ごと)', damaged: '傷ついた地方', deadRegions: '壊滅した地方', missingHp: '国じゅうの被害' };
    function insight(S, uid) {
        const inst = cardByUid(S, uid);
        if (!inst || !S.R)
            return [];
        const def = CARD[inst.id];
        const out = [];
        const al = alive(S);
        const x = { S, R: S.R, d: S.R.d, preview: true, Ce: Ceff(S), L: linksCount(S), alive: al, n: al.length, sumTrust: al.reduce((a, r) => a + r.trust, 0), has: k => S.R.d.keys.includes(k), cards: [{ inst, def, cat: catOf(def), region: regionById(S, inst.region), i: 0 }], firedCount: 0 };
        const c = x.cards[0];
        (def.fx || []).forEach(t => {
            if (t.per && QLABEL[t.per]) {
                const q = qty(t.per, c, x);
                let eff = '';
                if (t.x)
                    eff = `倍率×${r2(Math.pow(t.x, q))}`;
                else if (t.a)
                    eff = `倍率+${r2(t.a * q)}`;
                else if (t.p)
                    eff = `対応力+${Math.round(t.p * q)}`;
                else if (t.px)
                    eff = `対応力×${r2(Math.pow(t.px, q))}`;
                else if (t.funds)
                    eff = `議会資金+${Math.round(t.funds * q)}`;
                out.push(`${QLABEL[t.per]} ${r2(q)}${eff ? ' → ' + eff : ''}`);
            }
            if (t.grow) {
                const u = inst.g.uses || 0;
                let eff = '';
                if (t.grow.xm)
                    eff = `倍率×${r2(Math.pow(t.grow.xm, u))}`;
                else if (t.grow.a)
                    eff = `倍率+${r2(t.grow.a * u)}`;
                else if (t.grow.p)
                    eff = `対応力+${Math.round(t.grow.p * u)}`;
                else if (t.grow.pm)
                    eff = `対応力×${r2(Math.pow(t.grow.pm, u))}`;
                out.push(`伸びた回数 ${u}${eff ? ' → ' + eff : ''}`);
            }
            if (t.growFunds)
                out.push(`次に得る議会資金 ${t.growFunds * ((inst.g.uses || 0) + 1)}`);
            if (t.watch) {
                const w = t.watch;
                out.push(`数え ${inst.g.wc || 0} / ${w.n}`);
            }
            if (t.accum)
                out.push(`積み上がった倍率 +${r2(inst.g.accA || 0)}`);
        });
        if (inst.g.accA)
            out.push(`積み上がった倍率 +${r2(inst.g.accA)}`);
        if (inst.g.accX && inst.g.accX !== 1)
            out.push(`積み上がった倍率 ×${r2(inst.g.accX)}`);
        if (inst.g.accP)
            out.push(`積み上がった対応力 +${Math.round(inst.g.accP)}`);
        if (inst.g.bb)
            out.push(`永続で上がった基礎 +${Math.round(inst.g.bb)}`);
        return [...new Set(out)];
    }
    function upgradeNote(id, lv) {
        const d = CARD[id];
        if (d.evolve && CARD[d.evolve])
            return `強化すると「${CARD[d.evolve].name}」に化ける`;
        const m = upMode(d);
        if (d.upRepeat)
            return `何度でも重ねて強化でき、そのたびに少しずつ伸びる${lv ? `(いま${lv}回)` : ''}。次は:${upText(d.effect, lv + 1, true, !d.fx)}`;
        if (lv)
            return '強化済み';
        if (m === 'retrig2')
            return '強化すると、もう一度発動させる回数が2回になる';
        if (m === 'self2')
            return '強化すると、このカードは出すたびにもう一度発動する';
        return '強化すると:' + upText(d.effect, 1, false, !d.fx);
    }
    function effectAtLv(id, lv) { const d = CARD[id]; if (!lv || upMode(d) !== 'num')
        return effectText(id); return upText(effectText(id), lv, !!d.upRepeat, !d.fx); }
    function devSet(S, key, v) {
        v = Number(v);
        if (!isFinite(v))
            return;
        if (key === 'C')
            S.C = clamp(v, 0, 100);
        if (key === 'U')
            S.U = clamp(v, 0, 100);
        if (key === 'funds')
            S.funds = Math.max(0, Math.round(v));
        if (key === 'reqMul') {
            S.reqMul = Math.max(0.01, v);
            if (S.R && !S.R.done)
                S.R.req = reqFor(S, S.R.d);
        }
        if (key === 'countdown' && S.critical)
            S.countdown = Math.max(1, Math.round(v));
        log(S, `[開発] ${key} = ${v}`, 'sys');
    }
    function devDisaster(S, name) {
        let d;
        if (name === '長い冬')
            d = makeDisaster(S, 1);
        else {
            const all = D.disasters.normal.concat(D.disasters.boss).concat(D.disasters.endless);
            const b = all.find(x => x.name === name);
            if (!b)
                return false;
            const boss = D.disasters.boss.includes(b), cat = D.disasters.endless.includes(b);
            const rule = cat ? BOSS_RULE[pick(D.disasters.boss).name] : BOSS_RULE[b.name];
            d = { name: b.name, type: cat ? ENDLESS_TYPE[b.name] : b.type, boss: boss || cat, catastrophe: cat, rule: boss || cat ? rule : undefined, restriction: boss ? RULE_TEXT[rule] : cat ? '破滅級。' + RULE_TEXT[rule] : '', keys: (DKEY[b.name] || []).slice() };
        }
        if (S.phase === 'round' && S.R && !S.R.done) {
            S.R.d = d;
            S.R.req = reqFor(S, d);
            S.R.isolated = d.rule === 'isolation';
            log(S, `[開発] 災害を${d.name}に差し替えた。必要対策値 ${nf(S.R.req)}。`, 'sys');
        }
        else {
            S.nextD = d;
            log(S, `[開発] 次の災害を${d.name}にした。`, 'sys');
        }
        return true;
    }
    function devJump(S, era, rie) {
        S.era = clamp(Math.round(era), 1, 30);
        S.rie = clamp(Math.round(rie), 0, 2);
        if (S.era > 8)
            S.endless = true;
        S.nextD = makeDisaster(S);
        log(S, `[開発] 第${S.era}時代へ移った。`, 'sys');
        if (S.phase === 'round' && S.R && !S.R.done) {
            S.R.done = true;
            enterParliament(S, true);
        }
    }
    function devAddCard(S, id, lv) { if (!CARD[id])
        return; const c = mkCard(S, id); c.lv = clamp(+lv || 0, 0, maxLvOf(S, c) > 1 ? 99 : 1); S.deck.push(c); if (S.phase === 'round')
        S.hand.push(c.uid); log(S, `[開発] カード「${CARD[id].name}」を加えた。`, 'sys'); }
    function devAddFacility(S, id) { if (!FAC[id])
        return; S.facilities.push({ uid: S.uid++, id, g: {} }); S.facSlots = Math.max(S.facSlots, S.facilities.length); log(S, `[開発] 施設「${FAC[id].name}」を加えた。`, 'sys'); }
    function devAddAbility(S, id) { if (!ABILITIES[id] || hasAb(S, id))
        return; S.abilities.push(id); log(S, `[開発] 能力「${ABILITIES[id].name}」を加えた。`, 'sys'); }
    function devAction(S, a) {
        if (a === 'heal') {
            S.regions.forEach(r => { r.dead = false; r.hp = r.max; });
        }
        if (a === 'relUp')
            Object.keys(S.rel).forEach(k => { S.rel[k] = clamp(S.rel[k] + 1, -3, 5); });
        if (a === 'relDown')
            Object.keys(S.rel).forEach(k => { S.rel[k] = clamp(S.rel[k] - 1, -3, 5); });
        if (a === 'trustUp')
            allTrust(S, 2);
        if (a === 'trustDown')
            allTrust(S, -2);
        if (a === 'critical' && !S.critical) {
            S.U = Math.max(S.U, 70);
            S.critical = true;
            S.criticalRound = S.roundNo;
            S.countdown = 10;
            chron(S, '', 'critical');
        }
        if (a === 'invincible')
            S.flags.devInvincible = !S.flags.devInvincible;
        if (a === 'refill' && S.R && !S.R.done) {
            S.R.playsLeft += 1;
            S.R.discardsLeft += 1;
        }
        if (a === 'redraw' && S.phase === 'round') {
            S.discard.push(...S.hand);
            S.hand = [];
            if (S.drawPile.length < handLimit(S)) {
                S.drawPile = S.drawPile.concat(shuffle(S.discard));
                S.discard = [];
            }
            drawTo(S);
        }
        if (a === 'upgradeAll')
            S.deck.forEach(c => { c.lv = maxLvOf(S, c) > 1 ? 5 : 1; });
        if (a === 'win' && S.phase === 'round' && S.R && !S.R.done) {
            S.R.total = S.R.req;
            endRound(S, true);
        }
        if (a === 'lose' && S.phase === 'round' && S.R && !S.R.done)
            endRound(S, false);
        log(S, `[開発] ${a}`, 'sys');
    }
    function devInfo(S) {
        return { U: Math.round(S.U), critical: S.critical, countdown: S.countdown, declCount: S.declCount, reqMul: S.reqMul, resist: S.resist, accel: S.accel, invincible: !!S.flags.devInvincible };
    }
    root.Engine = {
        D, CARD, CHAR, CARD_OWNER, PRICE, RARITY_NAME, TYPES, BASIC, ABILITIES, FLAVOR, MAX_LV,
        effectText, catOf, randomNames,
        loadMeta, saveMeta, defaultMeta, charUnlocked, cardUnlocked, saveRun, loadRun, hasSavedRun, clearRun,
        newRun, confirmDraft, startRound, declare, canDeclare, discard, execute, scoreHand, backerChoice, maxPlay, handLimit,
        enterParliament, buy, sell, sellValue, reroll, upgrade, upgradeCost, returnCost, returnPower, leaveParliament, nextFromResult,
        pickReward, skipReward, rerollReward, rerollRewardCost, resolveEvent, continueEndless, alive, cardByUid, regionById,
        windowStage, useRevision, canRevise, twinSwap, roundLabel, Ceff, owned, hasAb,
        FAC, STAMP, luckOf, maxedOwned, stampPrice, effectAtLv, upMode, insight, upgradeNote, upK, maxDiscard, buyOffer, offerCost, OFFER_CAP, SLOT_CAP, maxLvOf, buyStamp, cancelStamp, applyStamp, rerollStamps, rerollFacilities, mergeTarget, RG, LINK_AT, REL_MIN, REL_MAX, getRel, linksCount, alivePairs, buyFacility, sellFacility, buySlot, slotCost, MAX_SLOTS, facPrice, SLOT_CAP_: 8,
        devSet, devDisaster, devJump, devAddCard, devAddFacility, devAddAbility, devAction, devInfo, reqFor
    };
})(typeof window !== 'undefined' ? window : globalThis);
