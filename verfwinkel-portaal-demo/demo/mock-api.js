/* Verfwinkel Portaal – demoversie.
 * Deze file vervangt de PocketBase-server: alle verzoeken naar /api/... en /versie.json
 * worden hier in de browser beantwoord met verzonnen gegevens (opgeslagen in localStorage).
 * De app-code zelf is ongewijzigd; alleen dit script wordt als eerste geladen.
 * Er gaat niets over het netwerk. */
(function () {
  'use strict';
  var DB_KEY = 'vpdemo_db_v1';
  var DAY = 864e5;

  /* ---------- hulpjes ---------- */
  function iso(t) { return new Date(t).toISOString().replace('T', ' '); }
  function rid() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 9); }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function rec(coll, fields) {
    var now = iso(Date.now());
    return Object.assign({ id: rid(), collectionId: 'pbc_' + coll, collectionName: coll, created: now, updated: now }, fields);
  }

  /* ---------- verzonnen gegevens ---------- */
  function seedUsers() {
    var U = function (name, email, o) {
      return rec('users', Object.assign({ name: name, email: email, verified: true, emailVisibility: true, isHost: false, isAdmin: false,
        fp_access: '', mp_access: '', rt_access: '', failed_logins: 0, locked: false, locked_at: '', last_login: iso(Date.now() - DAY) }, o || {}));
    };
    return [
      U('Demo Host', 'host@verfwinkel.nl', { id: 'demohost000001', isHost: true, mp_access: 'none' }),
      U('Mehmet Kaya', 'mehmet.kaya@verfwinkel.nl', { isAdmin: true, fp_access: 'edit', rt_access: 'view' }),
      U('Lotte de Wit', 'lotte.dewit@verfwinkel.nl', { rt_access: 'edit' }),
      U('Noor El Amrani', 'noor.elamrani@verfwinkel.nl', { rt_access: 'edit' }),
      U('Bram Verhoeven', 'bram.verhoeven@verfwinkel.nl', { rt_access: 'view' }),
      U('Sanne Jansen', 'sanne.jansen@verfwinkel.nl', { fp_access: 'view', failed_logins: 3, locked: true, locked_at: iso(Date.now() - 4 * 60e3) }),
      U('Daan Peters', 'daan.peters@verfwinkel.nl', { verified: false, last_login: '' })
    ];
  }

  // Zelfde verzonnen voorbeelden als de testomgeving van het functioneringsportaal.
  function fpData() {
    var t = new Date(), d = function (n) { var x = new Date(t.getFullYear(), t.getMonth(), t.getDate() + n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    var E = function (id, name, role, department, startDate) { return { id: id, name: name, role: role, department: department, startDate: startDate, manager: 'Mehmet Kaya' }; };
    var employees = [E('e1', 'Sanne Jansen', 'Verfmenger', 'Menglab', '2021-03-01'), E('e2', 'Mehmet Kaya', 'Teamleider menglab', 'Menglab', '2019-09-15'), E('e3', 'Lotte de Wit', 'Medewerker klantenservice', 'Klantenservice', '2023-01-09'), E('e4', 'Bram Verhoeven', 'Orderpicker', 'Magazijn', '2022-06-20'), E('e5', 'Noor El Amrani', 'Medewerker klantenservice', 'Klantenservice', '2024-02-05'), E('e6', 'Daan Peters', 'Verfmenger (oproepkracht)', 'Menglab', '2025-04-14')];
    var C = function (id, employee, date, status, o) { return Object.assign({ id: id, employee: employee, date: date, status: status, positive: '', improve: '', action: '', actionStatus: 'open', review: '', notes: '', previousProgress: '', previousComment: '', development: '', actionOwner: 'medewerker', overallRating: '', nextDate: '', quality: '', qualityNote: '', productivity: '', productivityNote: '', teamwork: '', teamworkNote: '', independence: '', independenceNote: '', attitude: '', attitudeNote: '' }, o); };
    var conversations = [
      C('c1', 'e1', d(-100), 'afgerond', { positive: 'Werkt nauwkeurig en mengt kleuren consistent.', improve: 'Tempo bij drukte kan omhoog.', action: 'Training kleurmeting volgen', review: d(-20), overallRating: 'Goed', quality: 'Goed', productivity: 'Voldoende', teamwork: 'Goed', independence: 'Goed', attitude: 'Uitstekend', notes: 'Volgende keer ook werkdruk bespreken.' }),
      C('c2', 'e2', d(-40), 'afgerond', { positive: 'Sterke teamleider, collega’s voelen zich gehoord.', improve: 'Planning eerder delen.', action: 'Weekplanning op vrijdag delen', actionStatus: 'afgerond', review: d(-10), overallRating: 'Uitstekend', quality: 'Uitstekend', productivity: 'Goed', teamwork: 'Uitstekend', independence: 'Uitstekend', attitude: 'Goed' }),
      C('c3', 'e3', d(-2), 'concept', { positive: 'Klanten zijn positief over de vriendelijke toon.', improve: 'Kennis van lakken uitbreiden.', development: 'Wil graag meer weten over productadvies.' }),
      C('c4', 'e4', d(-80), 'afgerond', { positive: 'Altijd op tijd en betrouwbaar.', improve: 'Fouten bij picken verminderen.', action: 'Scannen voor het inpakken dubbelchecken', review: d(5), overallRating: 'Voldoende', quality: 'Voldoende', productivity: 'Goed', teamwork: 'Goed', independence: 'Voldoende', attitude: 'Goed' }),
      C('c5', 'e6', d(-10), 'afgerond', { positive: 'Snel ingewerkt.', improve: 'Werkplek netjes achterlaten.', action: 'Checklist einde dienst gebruiken', review: d(14), overallRating: 'Goed', quality: 'Goed', productivity: 'Goed', teamwork: 'Voldoende', independence: 'Voldoende', attitude: 'Goed' })];
    var A = function (id, employee, date, time, status, type) { return { id: id, employee: employee, date: date, time: time, duration: 45, type: type || 'functionering', source: 'leidinggevende', preparation: '', status: status || 'gepland' }; };
    var appointments = [A('a1', 'e5', d(3), '10:00'), A('a2', 'e4', d(12), '14:00'), A('a3', 'e1', d(-5), '09:30'), A('a4', 'e2', d(-40), '11:00', 'afgerond'), A('a5', 'e3', d(6), '15:30', 'gepland', 'tussentijds')];
    var requests = [{ id: 'r1', employee: 'e3', reason: 'Wil graag een tussentijds gesprek over werkdruk', status: 'open' }, { id: 'r2', employee: 'e6', reason: 'Vraag over doorgroeien naar vast contract', status: 'afgehandeld' }];
    var slots = [{ id: 's1', date: d(7), time: '09:00', end: '10:00' }, { id: 's2', date: d(7), time: '10:00', end: '11:00' }, { id: 's3', date: d(7), time: '11:00', end: '12:00' }];
    return { employees: employees, conversations: conversations, appointments: appointments, requests: requests, slots: slots };
  }
  function fpDocs(coll, data) {
    return ['employees', 'conversations', 'appointments', 'requests', 'slots'].map(function (k) {
      return rec(coll, { key: k, value: data ? data[k] : [], version: data ? 1 : 0 });
    });
  }

  // Verzonnen retouren: zelfde generator als pb_hooks/retouren_demo.js op de server.
  function seedRetouren(count, seed, demo) {
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
    var voor = ['Sanne', 'Mark', 'Lotte', 'Joris', 'Fleur', 'Bas', 'Noor', 'Tim', 'Eva', 'Ruben', 'Iris', 'Daan', 'Femke', 'Thijs', 'Maaike', 'Koen', 'Anouk', 'Stijn'];
    var achter = ['de Groot', 'Jansen', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer'];
    var straat = ['Kerkstraat', 'Dorpsstraat', 'Molenweg', 'Schoolstraat', 'Beukenlaan', 'Lindelaan', 'Stationsweg', 'Julianastraat'];
    var plaats = ['5721 AB Asten', '5611 CD Eindhoven', '5701 EF Helmond', '5401 GH Uden', '6511 JK Nijmegen', '3511 LM Utrecht', '4811 NP Breda', "5211 RS 's-Hertogenbosch"];
    var prod = [
      ['Sikkens Rubbol BL Satura 2,5 L (RAL 9010)', 'lak'], ['Flexa Strak in de Lak 750 ml zijdeglans', 'lak'],
      ['Histor Perfect Finish muurverf mat 5 L', 'muur'], ['Sigma S2U Allure Satin 1 L (gemengd, NCS S 2005-Y20R)', 'meng'],
      ['Wijzonol Dekkend 2,5 L (gemengd, RAL 7016)', 'meng'], ['Rust-Oleum Combicolor 750 ml', 'lak'],
      ['Levis Muurverf Expert mat 10 L (gemengd)', 'meng'], ['Copagro Grondverf 2,5 L', 'grond'],
      ['Rollerset 25 cm met verfbak', 'acc'], ['Afplaktape 50 m (3 stuks)', 'acc']];
    var redenen = [
      ['De kleur is anders dan ik had verwacht, veel donkerder dan het staaltje.', 'Kleur wijkt af'],
      ['Blik was gedeukt en lekte bij aankomst.', 'Beschadigd'],
      ['Verkeerd product ontvangen, ik had de zijdeglans besteld.', 'Verkeerd product'],
      ['Te veel besteld, 2 blikken over.', 'Te veel besteld'],
      ['Deksel zat los, verf over de doos.', 'Beschadigd'],
      ['Ik heb toch een andere kleur gekozen.', 'Bedacht'],
      ['Dekt niet goed, ik ben niet tevreden.', 'Niet tevreden'],
      ['Kleur klopt niet met de kleurcode die ik heb opgegeven.', 'Kleur wijkt af'],
      ['Klus gaat niet door.', 'Bedacht']];
    var flow = ['aangemeld', 'ontvangen', 'gecontroleerd', 'terugbetaald'];
    var medewerkers = ['Lotte de Wit', 'Noor El Amrani', 'Demo Host'];
    var now = Date.now(), out = [];
    for (var i = 0; i < count; i++) {
      var age = Math.floor(Math.pow(rnd(), 1.15) * 56);
      var t0 = now - age * DAY - Math.floor(rnd() * 9 * 3600e3);
      var rr = pick(redenen), txt = rr[0], cat = rr[1];
      var n = 1 + (rnd() < 0.3 ? 1 : 0), items = [];
      for (var k = 0; k < n; k++) {
        var p = pick(prod);
        if (cat === 'Kleur wijkt af' && p[1] !== 'meng' && rnd() < 0.7) p = pick(prod.filter(function (x) { return x[1] === 'meng'; }));
        items.push((1 + Math.floor(rnd() * 2)) + 'x ' + p[0]);
      }
      var steps = age < 2 ? 0 : age < 5 ? Math.floor(rnd() * 2) : age < 10 ? 1 + Math.floor(rnd() * 2) : 3;
      if (age > 14 && rnd() < 0.15) steps = Math.floor(rnd() * 2);
      var status = flow[steps];
      if (steps === 3 && cat === 'Bedacht' && rnd() < 0.3) status = 'afgekeurd';
      var hist = [{ status: 'aangemeld', at: new Date(t0).toISOString(), door: 'Chatbot' }], t = t0;
      for (var s = 1; s <= steps; s++) {
        t += (1 + Math.floor(rnd() * 3)) * DAY;
        if (t > now) t = now - 3600e3;
        hist.push({ status: s === steps ? status : flow[s], at: new Date(t).toISOString(), door: pick(medewerkers) });
      }
      var v = pick(voor), a = pick(achter);
      out.push(rec('retouren', {
        aangemeld: iso(t0), ordernummer: String(103500000 + Math.floor(rnd() * 90000)), ordernummer_cyane: 'C' + (700000 + Math.floor(rnd() * 99999)),
        naam: v + ' ' + a, adres: pick(straat) + ' ' + (1 + Math.floor(rnd() * 120)), postcode_woonplaats: pick(plaats),
        telefoon: '06-' + String(10000000 + Math.floor(rnd() * 89999999)), email: (v + '.' + a).toLowerCase().replace(/[^a-z.]/g, '') + '@voorbeeld.nl',
        producten: items.join('\n'), reden: txt, reden_cat: cat, status: status,
        notitie: status === 'afgekeurd' ? 'Gemengde verf, kan niet retour (staat in de voorwaarden).' : '',
        pdf_url: '', historie: hist, demo: demo
      }));
    }
    return out;
  }

  function freshDb() {
    return {
      users: seedUsers(),
      fp_docs: fpDocs('fp_docs', fpData()),
      fp_docs_test: fpDocs('fp_docs_test', null),
      retouren: seedRetouren(38, 13, false).concat(seedRetouren(46, 7, true)),
      me: 'demohost000001'
    };
  }

  /* ---------- opslag ---------- */
  var mem = null;
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(DB_KEY) || 'null'); } catch (_) { mem = null; }
    if (!mem || !mem.users) { mem = freshDb(); save(); }
    return mem;
  }
  function save() { try { localStorage.setItem(DB_KEY, JSON.stringify(mem)); } catch (_) {} }
  function me() { var db = load(); return db.users.find(function (u) { return u.id === db.me; }) || db.users[0]; }
  function authFor(u) { return { token: 'demo-token-' + u.id, record: clone(u) }; }

  // Geen inloggen nodig: je bent altijd ingelogd als het demo-account.
  try { localStorage.setItem('vp_auth', JSON.stringify(authFor(me()))); } catch (_) {}

  var VERSIE = {"gebouwd": "2026-10-22 16:47", "apps": {"portaal": {"versie": "2.2", "build": "bb5a47f885", "nieuw": "Heb je maar één app (en geen Toegang beheren), dan gaat die meteen open"}, "functioneringsportaal": {"versie": "1.5", "build": "04183d0a1f", "nieuw": "Klik op je naam linksonder om uit te loggen"}, "retouren": {"versie": "1.7", "build": "779653efde", "nieuw": "Klik op je naam linksonder om uit te loggen"}}};

  /* ---------- antwoorden ---------- */
  function reply(status, body) {
    var hasBody = status !== 204;
    return new Response(hasBody ? JSON.stringify(body == null ? {} : body) : null, { status: status, headers: { 'Content-Type': 'application/json' } });
  }
  function err(status, message, data) { return { status: status, body: { status: status, message: message, data: data || {} } }; }
  function list(items, url) {
    var perPage = +url.searchParams.get('perPage') || 30, page = +url.searchParams.get('page') || 1;
    var sort = url.searchParams.get('sort') || '';
    items = items.slice();
    if (sort) {
      var desc = sort[0] === '-', f = sort.replace(/^[-+]/, '');
      items.sort(function (a, b) { var x = String(a[f] || '').toLowerCase(), y = String(b[f] || '').toLowerCase(); return (x < y ? -1 : x > y ? 1 : 0) * (desc ? -1 : 1); });
    }
    var total = items.length;
    return { status: 200, body: { page: page, perPage: perPage, totalItems: total, totalPages: Math.max(1, Math.ceil(total / perPage)), items: items.slice((page - 1) * perPage, page * perPage) } };
  }

  function handle(method, path, url, body) {
    var db = load(), m;
    var user = me();

    if (path === '/versie.json') return { status: 200, body: VERSIE };
    if (path === '/api/realtime') return { status: 204 };

    // ---- accounts ----
    if (path === '/api/collections/users/auth-refresh') return { status: 200, body: authFor(user) };
    if (path === '/api/collections/users/auth-with-password' || path === '/api/collections/users/auth-with-otp') {
      var em = String((body && body.identity) || '').toLowerCase();
      var u = db.users.find(function (x) { return x.email === em; }) || db.users[0];
      db.me = u.id; save();
      try { localStorage.setItem('vp_auth', JSON.stringify(authFor(u))); } catch (_) {}
      return { status: 200, body: authFor(u) };
    }
    if (/^\/api\/collections\/users\/(request-otp)$/.test(path)) return { status: 200, body: { otpId: 'demo-otp' } };
    if (/^\/api\/collections\/users\/(request-verification|confirm-verification|request-password-reset|confirm-password-reset)$/.test(path)) return { status: 204 };
    if (path === '/api/collections/users/records') {
      if (method === 'GET') return list(db.users, url);
      if (method === 'POST') {
        var email = String(body.email || '').trim().toLowerCase();
        if (!/^[^@\s]+@verfwinkel\.nl$/.test(email)) return err(400, 'Gebruik je werkmailadres (eindigt op @verfwinkel.nl).');
        if (db.users.some(function (x) { return x.email === email; })) return err(400, 'Failed to create record.', { email: { code: 'validation_not_unique' } });
        var nu = rec('users', { name: String(body.name || '').trim(), email: email, verified: true, emailVisibility: true, isHost: false, isAdmin: false, fp_access: '', mp_access: '', rt_access: '', failed_logins: 0, locked: false, locked_at: '', last_login: '' });
        db.users.push(nu); save(); return { status: 200, body: nu };
      }
    }
    if ((m = path.match(/^\/api\/collections\/users\/records\/([^/]+)$/))) {
      var target = db.users.find(function (x) { return x.id === m[1]; });
      if (!target) return err(404, 'Account niet gevonden.');
      if (method === 'GET') return { status: 200, body: target };
      if (method === 'PATCH') {
        if (!user.isHost && !user.isAdmin && target.id !== user.id) return err(403, 'Niet toegestaan.');
        if (!user.isHost && (target.isHost || target.isAdmin)) return err(403, 'Dit account kun je niet aanpassen.');
        var patch = Object.assign({}, body); delete patch.isHost; delete patch.id;
        Object.assign(target, patch, { updated: iso(Date.now()) });
        if (target.isHost) target.isAdmin = false;
        save(); return { status: 200, body: target };
      }
      if (method === 'DELETE') {
        if (target.isHost) return err(403, 'Het host-account kan niet worden verwijderd.');
        db.users = db.users.filter(function (x) { return x.id !== target.id; }); save(); return { status: 204 };
      }
    }
    if ((m = path.match(/^\/api\/portaal\/(ontgrendelen|wachtwoord-reset)\/([^/]+)$/))) {
      var t2 = db.users.find(function (x) { return x.id === m[2]; });
      if (!t2) return err(404, 'Account niet gevonden.');
      if (t2.isHost || (!user.isHost && t2.isAdmin)) return err(403, 'Dit account kun je niet aanpassen.');
      if (m[1] === 'ontgrendelen') { t2.locked = false; t2.failed_logins = 0; t2.locked_at = ''; save(); }
      return { status: 200, body: { ok: true } };
    }

    // ---- functioneringsportaal ----
    if ((m = path.match(/^\/api\/collections\/(fp_docs|fp_docs_test)\/records$/))) return list(db[m[1]], url);
    if ((m = path.match(/^\/api\/collections\/(fp_docs|fp_docs_test)\/records\/([^/]+)$/))) {
      var doc = db[m[1]].find(function (x) { return x.id === m[2]; });
      if (!doc) return err(404, 'Niet gevonden.');
      if (method === 'GET') return { status: 200, body: doc };
      if (method === 'PATCH') {
        if ((+body.version | 0) !== (doc.version | 0) + 1) return err(409, 'Iemand anders heeft deze gegevens intussen gewijzigd.', { conflict: true, version: doc.version });
        if (!Array.isArray(body.value)) return err(400, 'Ongeldige gegevens.');
        doc.value = body.value; doc.version = body.version; doc.updated = iso(Date.now()); save();
        return { status: 200, body: doc };
      }
    }
    if (path === '/api/batch') {
      var results = (body.requests || []).map(function (r) {
        var u2 = new URL(r.url, location.href);
        var res = handle(r.method || 'GET', u2.pathname.replace(/^.*?(\/api\/)/, '/api/'), u2, r.body || {});
        return { status: res.status, body: res.body || {} };
      });
      var bad = results.find(function (r) { return r.status >= 400; });
      if (bad) return { status: 400, body: { status: 400, message: 'Batch mislukt.', data: { requests: bad.body } } };
      return { status: 200, body: results };
    }

    // ---- retouren ----
    if (path === '/api/retouren/testdata') {
      db.retouren = db.retouren.filter(function (r) { return !r.demo; }).concat(seedRetouren(46, 7, true)); save();
      return { status: 200, body: { ok: true } };
    }
    if (path === '/api/collections/retouren/records') {
      if (method === 'GET') return list(db.retouren, url);
      if (method === 'POST') {
        if (!String(body.naam || '').trim() && !String(body.ordernummer || '').trim()) return err(400, 'Vul minimaal een naam of ordernummer in.');
        var now = new Date().toISOString();
        var nr = rec('retouren', Object.assign({ ordernummer: '', ordernummer_cyane: '', naam: '', adres: '', postcode_woonplaats: '', telefoon: '', email: '', producten: '', reden: '', reden_cat: '', notitie: '', pdf_url: '' }, body, {
          aangemeld: now.replace('T', ' '), status: 'aangemeld', demo: !!(user.isHost && body.demo),
          historie: [{ status: 'aangemeld', at: now, door: (user.name || user.email) + ' (handmatig)' }]
        }));
        db.retouren.push(nr); save(); return { status: 200, body: nr };
      }
    }
    if ((m = path.match(/^\/api\/collections\/retouren\/records\/([^/]+)$/))) {
      var r = db.retouren.find(function (x) { return x.id === m[1]; });
      if (!r) return err(404, 'Niet gevonden.');
      if (method === 'GET') return { status: 200, body: r };
      if (method === 'DELETE') { db.retouren = db.retouren.filter(function (x) { return x.id !== r.id; }); save(); return { status: 204 }; }
      if (method === 'PATCH') {
        var p2 = Object.assign({}, body), old = r.status;
        if (!user.isHost) { delete p2.demo; delete p2.historie; }
        Object.assign(r, p2, { updated: iso(Date.now()) });
        if (r.status !== old) { r.historie = (Array.isArray(r.historie) ? r.historie : []).concat([{ status: r.status, at: new Date().toISOString(), door: user.name || user.email }]); }
        save(); return { status: 200, body: r };
      }
    }
    return err(404, 'Niet gevonden (demoversie).');
  }

  /* ---------- fetch en EventSource onderscheppen ---------- */
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  function apiPath(input) {
    var raw = typeof input === 'string' ? input : (input && input.url) || '';
    var u;
    try { u = new URL(raw, location.href); } catch (_) { return null; }
    var p = u.pathname, i = p.indexOf('/api/');
    if (i >= 0) return { path: p.slice(i), url: u };
    if (/\/versie\.json$/.test(p)) return { path: '/versie.json', url: u };
    return null;
  }
  window.fetch = function (input, init) {
    var hit = apiPath(input);
    if (!hit) return realFetch ? realFetch(input, init) : Promise.reject(new TypeError('fetch'));
    init = init || {};
    var method = String(init.method || 'GET').toUpperCase(), body = {};
    if (init.body) { try { body = JSON.parse(init.body); } catch (_) { body = {}; } }
    return new Promise(function (resolve) {
      setTimeout(function () {
        var res;
        try { res = handle(method, hit.path, hit.url, body); } catch (e) { console.error(e); res = err(500, 'Fout in de demoversie.'); }
        resolve(reply(res.status, res.body));
      }, 60);
    });
  };
  var RealES = window.EventSource;
  window.EventSource = function (url) {
    if (!apiPath(url)) return new RealES(url);
    var self = this, listeners = {};
    this.readyState = 1;
    this.addEventListener = function (type, fn) { (listeners[type] = listeners[type] || []).push(fn); };
    this.removeEventListener = function () {};
    this.close = function () { self.readyState = 2; };
    setTimeout(function () {
      (listeners.PB_CONNECT || []).forEach(function (fn) { fn({ data: JSON.stringify({ clientId: 'demo-client' }) }); });
      if (self.onopen) self.onopen({});
    }, 80);
  };

  /* ---------- demobalk ---------- */
  function bar() {
    if (document.getElementById('vpDemoBar')) return;
    var d = document.createElement('div');
    d.id = 'vpDemoBar';
    d.setAttribute('role', 'note');
    d.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:99999;background:#202635;color:#fff;font:13px/1.4 Arial,sans-serif;padding:9px 12px;border-radius:10px;box-shadow:0 4px 16px #0003;display:flex;gap:10px;align-items:center;max-width:calc(100vw - 28px)';
    var t = document.createElement('span');
    t.innerHTML = '<strong>Demoversie</strong> · verzonnen gegevens, alles blijft in je browser';
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = 'Opnieuw beginnen';
    b.style.cssText = 'background:#e50071;color:#fff;border:0;border-radius:7px;padding:5px 10px;font:inherit;cursor:pointer';
    b.onclick = function () {
      try { localStorage.removeItem(DB_KEY); localStorage.removeItem('vp_auth'); localStorage.removeItem('fp_mode'); localStorage.removeItem('rt_mode'); } catch (_) {}
      location.reload();
    };
    var x = document.createElement('button');
    x.type = 'button'; x.textContent = '×'; x.title = 'Verbergen'; x.setAttribute('aria-label', 'Demobalk verbergen');
    x.style.cssText = 'background:transparent;color:#fff;border:0;font:18px/1 Arial,sans-serif;cursor:pointer;padding:0 2px';
    x.onclick = function () { d.remove(); try { sessionStorage.setItem('vpdemo_bar', 'uit'); } catch (_) {} };
    d.append(t, b, x);
    try { if (sessionStorage.getItem('vpdemo_bar') === 'uit') return; } catch (_) {}
    document.body.append(d);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bar); else bar();
})();
