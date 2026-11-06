/* Demo Portaal – demoversie.
 * Dit script vervangt de PocketBase-server: alle verzoeken naar /api/... en /versie.json worden hier in de browser
 * beantwoord met verzonnen gegevens (opgeslagen in localStorage). De app-code zelf is dezelfde als in het echte portaal.
 * Er gaat niets over het netwerk. Regels (rechten, rollen, versiecontrole, toegangscode) volgen pb_hooks/ van de server. */
(function () {
  'use strict';
  var DB_KEY = 'vpdemo_db_v2';
  var DAY = 864e5;
  try { localStorage.removeItem('vpdemo_db_v1'); } catch (_) {}

  /* ---------- hulpjes ---------- */
  function iso(t) { return new Date(t).toISOString().replace('T', ' '); }
  function rid() { return (Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 10)).slice(0, 15); }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function rec(coll, fields) {
    var now = iso(Date.now());
    return Object.assign({ id: rid(), collectionId: 'pbc_' + coll, collectionName: coll, created: now, updated: now }, fields);
  }
  function ms(s) { var t = new Date(String(s || '').replace(' ', 'T')); return isNaN(t) ? 0 : t.getTime(); }

  /* ---------- verzonnen gegevens ---------- */
  var HOST_ID = 'demohost000001';
  function user(name, email, o) {
    return rec('users', Object.assign({
      name: name, email: email, verified: true, emailVisibility: true, isHost: false, isAdmin: false, is_test: false,
      fp_access: '', fp_codes: false, fp_afdelingen: [], mp_access: '', rt_access: '', rt_rollen: [],
      failed_logins: 0, locked: false, locked_at: '', last_login: iso(Date.now() - DAY), startpagina: {},
      fp_unlock_mode: '', fp_unlock_until: ''
    }, o || {}));
  }
  function seedUsers() {
    return [
      user('Demo Host', 'host@voorbeeld.nl', { id: HOST_ID, isHost: true }),
      user('Mehmet Kaya', 'mehmet.kaya@voorbeeld.nl', { isAdmin: true, fp_access: 'edit', fp_codes: true, rt_access: 'view' }),
      user('Lotte de Wit', 'lotte.dewit@voorbeeld.nl', { rt_access: 'rol', rt_rollen: ['klantenservice'] }),
      user('Bram Verhoeven', 'bram.verhoeven@voorbeeld.nl', { rt_access: 'rol', rt_rollen: ['magazijn'] }),
      user('Noor El Amrani', 'noor.elamrani@voorbeeld.nl', { rt_access: 'edit', fp_access: 'afd', fp_afdelingen: ['Klantenservice'] }),
      user('Sanne Jansen', 'sanne.jansen@voorbeeld.nl', { fp_access: 'view', failed_logins: 3, locked: true, locked_at: iso(Date.now() - 4 * 60e3) }),
      user('Daan Peters', 'daan.peters@voorbeeld.nl', { verified: false, last_login: '' })
    ];
  }

  // Dezelfde verzonnen voorbeelden als de testversie van Functioneringsgesprekken (uit de app overgenomen bij het bouwen).
  var fpDemoData = function(){
      const t=new Date(),d=n=>{const x=new Date(t.getFullYear(),t.getMonth(),t.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
      const E=(id,name,role,department,startDate)=>({id,name,role,department,startDate,manager:'Teamleider (demo)'});
      const employees=[E('demo-e1','Sanne Jansen','Verfmenger','Menglab','2021-03-01'),E('demo-e2','Mehmet Kaya','Teamleider menglab','Menglab','2019-09-15'),E('demo-e3','Lotte de Wit','Medewerker klantenservice','Klantenservice','2023-01-09'),E('demo-e4','Bram Verhoeven','Orderpicker','Magazijn','2022-06-20'),E('demo-e5','Noor El Amrani','Medewerker klantenservice','Klantenservice','2024-02-05'),E('demo-e6','Daan Peters','Verfmenger (oproepkracht)','Menglab','2025-04-14')];
      const C=(id,employee,date,status,o)=>Object.assign({id,employee,date,status,positive:'',improve:'',action:'',actionStatus:'open',review:'',notes:'',previousProgress:'',previousComment:'',development:'',actionOwner:'medewerker',overallRating:'',nextDate:'',quality:'',qualityNote:'',productivity:'',productivityNote:'',teamwork:'',teamworkNote:'',independence:'',independenceNote:'',attitude:'',attitudeNote:''},o);
      const conversations=[
        C('demo-c1','demo-e1',d(-100),'afgerond',{positive:'Werkt nauwkeurig en mengt kleuren consistent.',improve:'Tempo bij drukte kan omhoog.',action:'Training kleurmeting volgen',review:d(-20),overallRating:'Goed',quality:'Goed',productivity:'Voldoende',teamwork:'Goed',independence:'Goed',attitude:'Uitstekend',notes:'Volgende keer ook werkdruk bespreken.'}),
        C('demo-c2','demo-e2',d(-40),'afgerond',{positive:'Sterke teamleider, collega\u2019s voelen zich gehoord.',improve:'Planning eerder delen.',action:'Weekplanning op vrijdag delen',actionStatus:'afgerond',review:d(-10),overallRating:'Uitstekend',quality:'Uitstekend',productivity:'Goed',teamwork:'Uitstekend',independence:'Uitstekend',attitude:'Goed'}),
        C('demo-c3','demo-e3',d(-2),'concept',{positive:'Klanten zijn positief over de vriendelijke toon.',improve:'Kennis van lakken uitbreiden.',development:'Wil graag meer weten over productadvies.'}),
        C('demo-c4','demo-e4',d(-80),'afgerond',{positive:'Altijd op tijd en betrouwbaar.',improve:'Fouten bij picken verminderen.',action:'Scannen voor het inpakken dubbelchecken',review:d(5),overallRating:'Voldoende',quality:'Voldoende',productivity:'Goed',teamwork:'Goed',independence:'Voldoende',attitude:'Goed'}),
        C('demo-c5','demo-e6',d(-10),'afgerond',{positive:'Snel ingewerkt.',improve:'Werkplek netjes achterlaten.',action:'Checklist einde dienst gebruiken',review:d(14),overallRating:'Goed',quality:'Goed',productivity:'Goed',teamwork:'Voldoende',independence:'Voldoende',attitude:'Goed'})];
      const A=(id,employee,date,time,status,type)=>({id,employee,date,time,duration:45,type:type||'functionering',source:'leidinggevende',preparation:'',status:status||'gepland'});
      const appointments=[A('demo-a1','demo-e5',d(3),'10:00'),A('demo-a2','demo-e4',d(12),'14:00'),A('demo-a3','demo-e1',d(-5),'09:30'),A('demo-a4','demo-e2',d(-40),'11:00','afgerond'),A('demo-a5','demo-e3',d(6),'15:30','gepland','tussentijds')];
      const requests=[{id:'demo-r1',employee:'demo-e3',reason:'Wil graag een tussentijds gesprek over werkdruk',status:'open'},{id:'demo-r2',employee:'demo-e6',reason:'Vraag over doorgroeien naar vast contract',status:'afgehandeld'}];
      const slots=[{id:'demo-s1',date:d(7),time:'09:00',end:'10:00'},{id:'demo-s2',date:d(7),time:'10:00',end:'11:00'},{id:'demo-s3',date:d(7),time:'11:00',end:'12:00'}];
      return {employees,conversations,appointments,requests,slots,settings:[{afdelingen:['Klantenservice','Magazijn','Menglab']}]};
    };
  var FP_KEYS = ['employees', 'conversations', 'appointments', 'requests', 'slots', 'settings'];
  function fpDocs(coll, data) {
    return FP_KEYS.map(function (k) { return rec(coll, { key: k, value: data ? (data[k] || []) : [], version: data ? 1 : 0 }); });
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
    var medewerkers = ['Lotte de Wit', 'Bram Verhoeven', 'Noor El Amrani'];
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

  function seedLog() {
    var L = [
      [0.02, 'inloggen', 'Ingelogd', 'Demo Host (host@voorbeeld.nl)', ''],
      [0.3, 'toegang', 'Toegang gewijzigd voor Noor El Amrani', 'Demo Host (host@voorbeeld.nl)', 'Functioneringsgesprekken: Geen toegang → Leidinggevende: Klantenservice'],
      [1.1, 'retour', 'Retour verwijderd: #103512288 (Iris Bos)', 'Demo Host (host@voorbeeld.nl)', ''],
      [2, 'account', 'Account aangemaakt', 'Daan Peters (daan.peters@voorbeeld.nl)', 'Zonder uitnodiging: nog geen toegang'],
      [3.2, 'toegang', 'Toegang gewijzigd voor Lotte de Wit', 'Mehmet Kaya (mehmet.kaya@voorbeeld.nl)', 'Retouren: Alleen kijken → Rollen: Klantenservice'],
      [4, 'uitnodiging', 'Uitnodiging gemaakt voor Bram Verhoeven', 'Demo Host (host@voorbeeld.nl)', 'Retouren: Alles gebruiken'],
      [6, 'inloggen', 'Ingelogd', 'Mehmet Kaya (mehmet.kaya@voorbeeld.nl)', '']
    ];
    return L.map(function (x) { var r = rec('logboek', { soort: x[1], actie: x[2], wie: x[3], details: x[4] }); r.created = r.updated = iso(Date.now() - x[0] * DAY); return r; });
  }
  function seedInvites() {
    var r = rec('uitnodigingen', { naam: 'Femke Brouwer', email: 'femke.brouwer@voorbeeld.nl', rechten: { rt_access: 'rol' }, token: 'demoUitnodigingFemke2026xx',
      door: 'Demo Host (host@voorbeeld.nl)', verloopt: iso(Date.now() + 12 * DAY), gebruikt_door: '', gebruikt_op: '' });
    r.created = r.updated = iso(Date.now() - 2 * DAY);
    return [r];
  }

  function freshDb() {
    var fp = fpDemoData();
    return {
      users: seedUsers(),
      fp_docs: fpDocs('fp_docs', fp),
      fp_docs_test: fpDocs('fp_docs_test', fpDemoData()),
      retouren: seedRetouren(38, 13, false).concat(seedRetouren(46, 7, true)),
      logboek: seedLog(),
      uitnodigingen: seedInvites(),
      fpcode: null
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
  function byId(id) { return load().users.find(function (u) { return u.id === id; }); }
  function authFor(u) { return { token: 'demo-token-' + u.id, record: clone(u) }; }
  function userFromToken(tok) { var m = String(tok || '').match(/demo-token-(\w+)/); return m ? byId(m[1]) : null; }

  // Geen inloggen nodig: dit tabblad is ingelogd als Demo Host (behalve een tabblad van het testaccount).
  (function () {
    var tab = false; try { tab = sessionStorage.getItem('vp_tab_auth') === '1'; } catch (_) {}
    if (tab) return;
    var a = null; try { a = JSON.parse(localStorage.getItem('vp_auth') || 'null'); } catch (_) {}
    if (!a || !userFromToken(a.token)) { try { localStorage.setItem('vp_auth', JSON.stringify(authFor(byId(HOST_ID)))); } catch (_) {} }
  })();

  var VERSIE = {"gebouwd": "2026-11-06 08:07", "apps": {"portaal": {"versie": "3.5", "build": "9518c0fe25", "nieuw": "Melding over niet-ontvangen retouren weg van de startpagina"}, "functioneringsportaal": {"versie": "2.6", "build": "e8455c5b83", "nieuw": "Logo op het toegangscode- en inlogscherm klopt weer (ook in donker)"}, "retouren": {"versie": "3.4", "build": "2713d86e60", "nieuw": "Nieuwe stijl met roze kop en tabs; licht en donker"}}};

  function wie(u) { return u ? (u.name ? u.name + ' (' + u.email + ')' : u.email) + (u.is_test ? ' · testaccount' : '') : 'Systeem'; }
  function log(soort, actie, u, details) {
    var db = load(); db.logboek.unshift(rec('logboek', { soort: soort, actie: actie, wie: typeof u === 'string' ? u : wie(u), details: details || '' }));
    db.logboek = db.logboek.slice(0, 300);
  }

  /* ---------- regels van de server (pb_hooks) ---------- */
  var ROL_STATUS = { klantenservice: ['afgekeurd'], magazijn: ['ontvangen', 'gecontroleerd', 'afgekeurd'], financien: ['terugbetaald'] };
  var ROL_VELDEN = {
    klantenservice: ['reden_cat', 'notitie', 'naam', 'adres', 'postcode_woonplaats', 'telefoon', 'email', 'producten', 'reden', 'ordernummer', 'ordernummer_cyane', 'pdf_url'],
    magazijn: ['reden_cat', 'notitie'], financien: ['notitie']
  };
  var STAP = { aangemeld: 0, ontvangen: 1, gecontroleerd: 2, afgekeurd: 3, terugbetaald: 3 };
  function rollen(u) { return Array.isArray(u.rt_rollen) ? u.rt_rollen : []; }
  function magStatus(u, van, naar) {
    return rollen(u).some(function (r) { var s = ROL_STATUS[r] || []; return s.indexOf(van) >= 0 || (s.indexOf(naar) >= 0 && (STAP[naar] || 0) > (STAP[van] || 0)); });
  }
  function magVeld(u, v) { return rollen(u).some(function (r) { return (ROL_VELDEN[r] || []).indexOf(v) >= 0; }); }
  function klantenservice(u) { return !!u && (u.isHost || u.rt_access === 'edit' || (u.rt_access === 'rol' && rollen(u).indexOf('klantenservice') >= 0)); }
  function zietRetour(u, r) { if (u.isHost) return true; if (u.is_test) return !!r.demo; return !r.demo && !!u.rt_access; }

  // Retouren: reden-categorie en productregels (pb_hooks/retour_reden.js), voor de widget op de startpagina.
  function guessCat(t) { t = String(t || '').toLowerCase();
    if (/deuk|lek|kapot|beschadig|\blos\b|gebroken/.test(t)) return 'Beschadigd';
    if (/kleur|tint|donker|licht|staal/.test(t)) return 'Kleur wijkt af';
    if (/verkeerd|fout|ander product/.test(t)) return 'Verkeerd product';
    if (/bedacht|toch|gaat niet door/.test(t)) return 'Bedacht';
    if (/te veel|teveel|\bover\b/.test(t)) return 'Te veel besteld';
    if (/tevreden|dekt|kwaliteit/.test(t)) return 'Niet tevreden';
    return 'Anders'; }
  function productLines(txt) { var out = [];
    String(txt || '').split(/\n|;/).forEach(function (raw) { var l = raw.trim(); if (!l) return; var q = 1, m = l.match(/^(\d+)\s*[x×]\s*/i);
      if (m) { q = parseInt(m[1], 10) || 1; l = l.slice(m[0].length); }
      var name = l.split(/\s+[—–-]\s+VW-/i)[0].replace(/\s*\([^)]*\)\s*$/, '').trim(); if (name) out.push([name, q]); });
    return out; }

  // Functioneringsgesprekken: leidinggevende per afdeling (pb_hooks/fp_afdeling.js)
  function norm(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
  function afdVan(u) { return (u.fp_afdelingen || []).map(norm).filter(Boolean); }
  function fpColl(u) { return u.is_test ? 'fp_docs_test' : 'fp_docs'; }
  function fpToegestaan(emps, u) { var afd = afdVan(u), ids = {}; emps.forEach(function (e) { if (e && e.id && afd.indexOf(norm(e.department)) >= 0 && norm(e.name) !== norm(u.name)) ids[e.id] = true; }); return ids; }
  function fpInScope(key, item, ids) { if (!item || typeof item !== 'object') return false; if (key === 'settings') return true; if (key === 'employees') return !!ids[item.id]; return !item.employee || !!ids[item.employee]; }
  function fpDoc(coll, key) { return load()[coll].find(function (d) { return d.key === key; }); }
  function fpWeergave(u) {
    var coll = fpColl(u), emps = (fpDoc(coll, 'employees') || {}).value || [], ids = fpToegestaan(emps, u);
    return load()[coll].map(function (d) { return { id: d.id, key: d.key, version: d.version, value: (d.value || []).filter(function (x) { return fpInScope(d.key, x, ids); }) }; });
  }

  /* ---------- antwoorden ---------- */
  function reply(status, body) {
    return new Response(status === 204 ? null : JSON.stringify(body == null ? {} : body), { status: status, headers: { 'Content-Type': 'application/json' } });
  }
  function err(status, message, data) { return { status: status, body: { status: status, message: message, data: data || {} } }; }
  function ok(body) { return { status: 200, body: body }; }
  function list(items, url) {
    var perPage = +url.searchParams.get('perPage') || 30, page = +url.searchParams.get('page') || 1, sort = url.searchParams.get('sort') || '';
    var filter = url.searchParams.get('filter') || '';
    items = items.slice();
    var so = filter.match(/soort="([^"]+)"/), q = filter.match(/actie~"([^"]+)"/);
    if (so) items = items.filter(function (x) { return x.soort === so[1]; });
    if (q) { var t = q[1].toLowerCase(); items = items.filter(function (x) { return (x.actie + ' ' + x.wie + ' ' + x.details).toLowerCase().indexOf(t) >= 0; }); }
    if (sort) {
      var desc = sort[0] === '-', f = sort.replace(/^[-+]/, '');
      items.sort(function (a, b) { var x = String(a[f] || '').toLowerCase(), y = String(b[f] || '').toLowerCase(); return (x < y ? -1 : x > y ? 1 : 0) * (desc ? -1 : 1); });
    }
    var total = items.length;
    return ok({ page: page, perPage: perPage, totalItems: total, totalPages: Math.max(1, Math.ceil(total / perPage)), items: items.slice((page - 1) * perPage, page * perPage) });
  }
  function demoMelding(tekst) { window.dispatchEvent(new CustomEvent('vpdemo-melding', { detail: tekst })); }

  function handle(method, path, url, body, me) {
    var db = load(), m;
    if (path === '/versie.json') return ok(VERSIE);
    if (path === '/api/realtime') return { status: 204 };

    // ---- inloggen en accounts ----
    if (path === '/api/collections/users/auth-refresh') { return me ? ok(authFor(me)) : err(401, 'Log opnieuw in.'); }
    if (path === '/api/collections/users/auth-with-password' || path === '/api/collections/users/auth-with-otp') {
      var em = String((body && body.identity) || '').toLowerCase();
      var u = db.users.find(function (x) { return x.email === em && !x.is_test; }) || byId(HOST_ID);
      log('inloggen', 'Ingelogd', u, ''); save();
      return ok(authFor(u));
    }
    if (path === '/api/collections/users/request-otp') return ok({ otpId: 'demo-otp' });
    if (/^\/api\/collections\/users\/(request-verification|confirm-verification|request-password-reset|confirm-password-reset)$/.test(path)) return { status: 204 };
    if (!me) return err(401, 'Log opnieuw in.');
    var beheer = me.isHost || me.isAdmin;

    if (path === '/api/collections/users/records') {
      if (method === 'GET') return list(beheer ? db.users : [me], url);
      if (method === 'POST') {
        var email = String(body.email || '').trim().toLowerCase();
        if (!/^[^@\s]+@voorbeeld\.nl$/.test(email)) return err(400, 'Gebruik je werkmailadres (eindigt op @voorbeeld.nl).');
        if (db.users.some(function (x) { return x.email === email; })) return err(400, 'Failed to create record.', { email: { code: 'validation_not_unique' } });
        var nu = user(String(body.name || '').trim(), email, { last_login: '' });
        var inv = body.uitnodigingscode && db.uitnodigingen.find(function (i) { return i.token === body.uitnodigingscode; });
        if (inv) { Object.assign(nu, inv.rechten.fp_access === 'edit2' ? Object.assign({}, inv.rechten, { fp_access: 'edit', fp_codes: true }) : inv.rechten); inv.gebruikt_door = wie(nu); inv.gebruikt_op = iso(Date.now()); }
        db.users.push(nu); log('account', 'Account aangemaakt', nu, inv ? 'Via uitnodiging' : 'Zonder uitnodiging: nog geen toegang'); save();
        return ok(nu);
      }
    }
    if ((m = path.match(/^\/api\/collections\/users\/records\/([^/]+)$/))) {
      var target = byId(m[1]);
      if (!target) return err(404, 'Account niet gevonden.');
      if (method === 'GET') return ok(target);
      if (method === 'PATCH') {
        if (target.id !== me.id && !beheer) return err(403, 'Niet toegestaan.');
        if (!me.isHost && target.id !== me.id && (target.isHost || target.isAdmin)) return err(403, 'Dit account kun je niet aanpassen.');
        var patch = Object.assign({}, body); delete patch.isHost; delete patch.id; delete patch.email;
        if (!me.isHost) delete patch.isAdmin;
        if (target.id === me.id && !me.isHost) { ['fp_access', 'mp_access', 'rt_access', 'rt_rollen', 'fp_codes', 'fp_afdelingen', 'isAdmin', 'locked'].forEach(function (k) { delete patch[k]; }); }
        var voor = JSON.stringify([target.fp_access, target.fp_codes, target.rt_access, target.rt_rollen, target.fp_afdelingen, target.isAdmin]);
        Object.assign(target, patch, { updated: iso(Date.now()) });
        if (target.isHost) target.isAdmin = false;
        if (voor !== JSON.stringify([target.fp_access, target.fp_codes, target.rt_access, target.rt_rollen, target.fp_afdelingen, target.isAdmin]) && !target.is_test) log('toegang', 'Toegang gewijzigd voor ' + (target.name || target.email), me, '');
        save(); return ok(target);
      }
      if (method === 'DELETE') {
        if (target.isHost) return err(403, 'Het host-account kan niet worden verwijderd.');
        if (!beheer || (!me.isHost && target.isAdmin)) return err(403, 'Dit account kun je niet verwijderen.');
        db.users = db.users.filter(function (x) { return x.id !== target.id; }); log('account', 'Account verwijderd: ' + wie(target), me, ''); save(); return { status: 204 };
      }
    }
    if ((m = path.match(/^\/api\/portaal\/(ontgrendelen|wachtwoord-reset)\/([^/]+)$/))) {
      var t2 = byId(m[2]);
      if (!t2) return err(404, 'Account niet gevonden.');
      if (!beheer) return err(403, 'Alleen de host of een beheerder kan dit.');
      if (t2.id === me.id) return err(400, 'Gebruik voor je eigen account "Wachtwoord vergeten".');
      if (t2.isHost || (!me.isHost && t2.isAdmin)) return err(403, 'Dit account kun je niet aanpassen.');
      if (m[1] === 'ontgrendelen') { t2.locked = false; t2.failed_logins = 0; t2.locked_at = ''; save(); }
      else demoMelding('In het echte portaal krijgt ' + (t2.name || t2.email) + ' nu een mail om een nieuw wachtwoord te kiezen.');
      return ok({ ok: true });
    }
    if (path === '/api/portaal/wachtwoord') {
      if (me.is_test) return err(403, 'Het testaccount heeft geen eigen wachtwoord.');
      if (String(body.nieuw || '').length < 10) return err(400, 'Kies een wachtwoord van minimaal 10 tekens.');
      return ok(authFor(me));
    }
    if (path === '/api/portaal/startpagina') {
      var thema = ['licht', 'donker'].indexOf(body.thema) >= 0 ? body.thema : 'auto';
      me.startpagina = { thema: thema, volgorde: body.volgorde || [], verborgen: body.verborgen || [], grootte: body.grootte || {} }; save();
      return ok({ ok: true });
    }
    if (path === '/api/portaal/widgets') return ok(widgets(me));
    if (path === '/api/portaal/testaccount') {
      if (!me.isHost) return err(403, 'Alleen voor de host.');
      var j = db.users.find(function (x) { return x.is_test; });
      if (!j) { j = user('Johnny Test', 'johnny.test@testaccount.invalid', { is_test: true }); db.users.push(j); }
      var lvl = function (v) { return v === 'view' || v === 'edit' ? v : ''; };
      Object.assign(j, { isHost: false, isAdmin: false, fp_access: body.fp_access === 'afd' ? 'afd' : lvl(body.fp_access),
        fp_afdelingen: body.fp_access === 'afd' && Array.isArray(body.fp_afdelingen) ? body.fp_afdelingen : [], mp_access: '',
        rt_access: body.rt_access === 'rol' ? 'rol' : lvl(body.rt_access),
        rt_rollen: body.rt_access === 'rol' && Array.isArray(body.rt_rollen) ? body.rt_rollen : [], locked: false, failed_logins: 0 });
      save(); return ok(Object.assign({ ok: true }, authFor(j)));
    }
    if (path === '/api/collections/uitnodigingen/records') {
      if (!beheer) return err(403, 'Alleen de host of een beheerder kan uitnodigen.');
      if (method === 'GET') return list(db.uitnodigingen, url);
      var r0 = body.rechten || {}, okR = {};
      ['fp_access', 'mp_access', 'rt_access'].forEach(function (k) { if (r0[k]) okR[k] = r0[k]; });
      if (!Object.keys(okR).length) return err(400, 'Kies voor minstens één app welke toegang iemand krijgt.');
      var mail = String(body.email || '').trim().toLowerCase();
      if (mail && !/^[^@\s]+@voorbeeld\.nl$/.test(mail)) return err(400, 'Het e-mailadres moet een werkmail zijn (eindigt op @voorbeeld.nl).');
      var ni = rec('uitnodigingen', { naam: String(body.naam || '').trim(), email: mail, rechten: okR, token: 'demo' + rid() + rid(), door: wie(me), verloopt: iso(Date.now() + 14 * DAY), gebruikt_door: '', gebruikt_op: '' });
      db.uitnodigingen.unshift(ni); log('uitnodiging', 'Uitnodiging gemaakt voor ' + (ni.naam || ni.email || 'iemand'), me, ''); save();
      return ok(ni);
    }
    if ((m = path.match(/^\/api\/collections\/uitnodigingen\/records\/([^/]+)$/)) && method === 'DELETE') {
      db.uitnodigingen = db.uitnodigingen.filter(function (i) { return i.id !== m[1]; }); log('uitnodiging', 'Uitnodiging ingetrokken', me, ''); save(); return { status: 204 };
    }
    if ((m = path.match(/^\/api\/portaal\/uitnodiging\/([^/]+)$/))) {
      var iv = db.uitnodigingen.find(function (i) { return i.token === m[1]; });
      if (!iv) return err(404, 'Deze uitnodiging bestaat niet (meer). Vraag een nieuwe link aan.');
      return ok({ ok: true, naam: iv.naam, email: iv.email, door: String(iv.door).replace(/\s*\(.*$/, ''), rechten: '' });
    }
    if (path === '/api/collections/logboek/records') { if (!me.isHost) return err(403, 'Alleen voor de host.'); return list(db.logboek, url); }

    // ---- functioneringsgesprekken ----
    if (path === '/api/fp/afdelingen') {
      var s = function (coll) { var o = {}; ((fpDoc(coll, 'employees') || {}).value || []).forEach(function (e) { if (e.department) o[e.department] = 1; }); return Object.keys(o).sort(); };
      return ok({ echt: s('fp_docs'), test: s('fp_docs_test') });
    }
    if (path === '/api/fp/toegang') {
      if (!me.isHost) return ok({ bezoeker: false });
      var until = ms(me.fp_unlock_until), c = db.fpcode || {}, nu2 = Date.now();
      return ok({ bezoeker: true, open: until > nu2, modus: until > nu2 ? me.fp_unlock_mode : '', openTot: until > nu2 ? me.fp_unlock_until : '',
        codeAangevraagd: !!(c.code && ms(c.expires) > nu2), codeGeldigTot: c.expires || '', geblokkeerdTot: ms(c.locked_until) > nu2 ? c.locked_until : '',
        pogingenOver: 3 - (c.tries || 0), beheerders2: ontvangers().map(function (u) { return u.name; }) });
    }
    if (path === '/api/fp/code-aanvragen') {
      var lijst = ontvangers();
      if (!lijst.length) return err(400, 'Er is nog geen Beheerder 2 voor Functioneringsgesprekken. Wijs er een aan in Accounts & toegang.');
      var code = ''; while (!code || code === '0000') code = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      db.fpcode = { code: code, expires: iso(Date.now() + DAY), tries: 0, locked_until: '' }; save();
      demoMelding('In het echte portaal krijgt ' + lijst.map(function (u) { return u.name; }).join(', ') + ' deze code per mail. In de demo is de code: ' + code);
      return ok({ ok: true, ontvangers: lijst.map(function (u) { return u.name; }), geldigTot: db.fpcode.expires });
    }
    if (path === '/api/fp/code') {
      var cd = String(body.code || '').trim(), fc = db.fpcode || {};
      if (!/^\d{4}$/.test(cd)) return err(400, 'Vul de 4 cijfers van de code in.');
      var open = function (mode) { me.fp_unlock_mode = mode; me.fp_unlock_until = iso(Date.now() + DAY); save(); return ok({ ok: true, modus: mode }); };
      if (cd === '0000') return open('test');
      if (ms(fc.locked_until) > Date.now()) return err(423, 'Te veel foute codes. 0000 (testversie) werkt wel.');
      if (fc.code && fc.code === cd && ms(fc.expires) > Date.now()) { db.fpcode = null; return open('echt'); }
      fc.tries = (fc.tries || 0) + 1;
      if (fc.tries >= 3) { db.fpcode = { locked_until: iso(Date.now() + 15 * 60e3), tries: 0 }; save(); return err(423, '3 keer een foute code. De code is vervallen en invoeren is 15 minuten geblokkeerd.'); }
      db.fpcode = fc; save(); return err(400, 'Deze code klopt niet. Nog ' + (3 - fc.tries) + (3 - fc.tries === 1 ? ' poging.' : ' pogingen.'));
    }
    if (path === '/api/fp/vergrendelen') { me.fp_unlock_mode = ''; me.fp_unlock_until = ''; save(); return ok({ ok: true }); }
    if (path === '/api/fp/afd/docs') { if (me.fp_access !== 'afd') return err(403, 'Geen toegang.'); return ok({ items: fpWeergave(me) }); }
    if (path === '/api/fp/afd/opslaan') {
      if (me.fp_access !== 'afd') return err(403, 'Geen toegang.');
      var coll = fpColl(me), afd = afdVan(me), uit = [];
      if (!afd.length) return err(403, 'Er zijn (nog) geen afdelingen aan je gekoppeld.');
      var ws = (body.wijzigingen || []).slice().sort(function (a, b) { return (a.key === 'employees' ? -1 : 0) - (b.key === 'employees' ? -1 : 0); });
      for (var wi = 0; wi < ws.length; wi++) {
        var w = ws[wi], d = fpDoc(coll, w.key);
        if (!d) return err(400, 'Onbekende gegevens.');
        if (+w.version !== d.version + 1) return err(409, 'Iemand anders heeft deze gegevens intussen gewijzigd.', { conflict: true });
        if (w.key === 'settings') { uit.push({ status: 200, body: { key: w.key, version: d.version } }); continue; }
        var ids = fpToegestaan((fpDoc(coll, 'employees') || {}).value || [], me);
        var buiten = (d.value || []).filter(function (x) { return !fpInScope(w.key, x, ids); });
        for (var xi = 0; xi < w.value.length; xi++) {
          var x = w.value[xi];
          if (w.key === 'employees' && afd.indexOf(norm(x.department)) < 0) return err(403, 'Je kunt alleen medewerkers in je eigen afdeling(en) beheren: ' + me.fp_afdelingen.join(', ') + '.');
          if (w.key !== 'employees' && x.employee && !ids[x.employee] && !(w.key === 'employees')) return err(403, 'Je kunt alleen gesprekken en afspraken van je eigen afdeling(en) beheren.');
        }
        d.value = buiten.concat(w.value); d.version += 1; uit.push({ status: 200, body: { key: w.key, version: d.version } });
      }
      save(); return ok(uit);
    }
    if ((m = path.match(/^\/api\/collections\/(fp_docs|fp_docs_test)\/records$/))) return list(db[m[1]], url);
    if ((m = path.match(/^\/api\/collections\/(fp_docs|fp_docs_test)\/records\/([^/]+)$/))) {
      var doc = db[m[1]].find(function (x) { return x.id === m[2]; });
      if (!doc) return err(404, 'Niet gevonden.');
      if (method === 'GET') return ok(doc);
      if ((+body.version | 0) !== (doc.version | 0) + 1) return err(409, 'Iemand anders heeft deze gegevens intussen gewijzigd.', { conflict: true, version: doc.version });
      if (!Array.isArray(body.value)) return err(400, 'Ongeldige gegevens.');
      doc.value = body.value; doc.version = body.version; doc.updated = iso(Date.now()); save();
      return ok(doc);
    }
    if (path === '/api/batch') {
      var results = (body.requests || []).map(function (r) {
        var u2 = new URL(r.url, location.href);
        var res = handle(r.method || 'GET', u2.pathname.replace(/^.*?(\/api\/)/, '/api/'), u2, r.body || {}, me);
        return { status: res.status, body: res.body || {} };
      });
      var bad = results.find(function (r) { return r.status >= 400; });
      if (bad) return { status: 400, body: { status: 400, message: 'Batch mislukt.', data: { requests: bad.body } } };
      return ok(results);
    }

    // ---- retouren ----
    if (path === '/api/retouren/testdata') {
      if (!me.isHost) return err(403, 'Alleen voor de host.');
      db.retouren = db.retouren.filter(function (r) { return !r.demo; }).concat(seedRetouren(46, 7, true)); save();
      return ok({ ok: true });
    }
    if (path === '/api/retouren/order') {
      if (!klantenservice(me) || me.is_test) return err(403, "Alleen voor collega's met 'Alles gebruiken'.");
      return ok(fakeOrder(url.searchParams.get('nr')));
    }
    if ((m = path.match(/^\/api\/retouren\/([^/]+)\/(pdf|pdf-maken|mail)$/))) {
      return err(400, 'In de demo worden geen echte retourformulieren gemaakt of gemaild. In het echte portaal doet n8n dit via Google Drive en Gmail.');
    }
    if (path === '/api/collections/retouren/records') {
      if (method === 'GET') return list(db.retouren.filter(function (r) { return zietRetour(me, r); }), url);
      if (!(me.isHost || me.rt_access === 'edit' || (me.rt_access === 'rol' && rollen(me).indexOf('klantenservice') >= 0))) return err(403, 'Alleen de klantenservice kan een retour aanmaken.');
      if (!String(body.naam || '').trim() && !String(body.ordernummer || '').trim()) return err(400, 'Vul minimaal een naam of ordernummer in.');
      var now = new Date().toISOString();
      var nr = rec('retouren', Object.assign({ ordernummer: '', ordernummer_cyane: '', naam: '', adres: '', postcode_woonplaats: '', telefoon: '', email: '', producten: '', reden: '', reden_cat: '', notitie: '', pdf_url: '' }, body, {
        aangemeld: now.replace('T', ' '), status: 'aangemeld', demo: me.is_test ? true : !!(me.isHost && body.demo),
        historie: [{ status: 'aangemeld', at: now, door: (me.name || me.email) + ' (handmatig)' }]
      }));
      db.retouren.push(nr); save(); return ok(nr);
    }
    if ((m = path.match(/^\/api\/collections\/retouren\/records\/([^/]+)$/))) {
      var r = db.retouren.find(function (x) { return x.id === m[1]; });
      if (!r || !zietRetour(me, r)) return err(404, 'Niet gevonden.');
      if (method === 'GET') return ok(r);
      if (method === 'DELETE') {
        if (!me.isHost) return err(403, 'Alleen de host kan retouren verwijderen.');
        db.retouren = db.retouren.filter(function (x) { return x.id !== r.id; });
        if (!r.demo) log('retour', 'Retour verwijderd: #' + (r.ordernummer || '?') + (r.naam ? ' (' + r.naam + ')' : ''), me, '');
        save(); return { status: 204 };
      }
      var p2 = Object.assign({}, body), old = r.status;
      if (!me.isHost) { delete p2.demo; delete p2.historie; }
      if (!me.isHost && me.rt_access === 'view') return err(403, 'Je hebt alleen kijkrechten.');
      if (!me.isHost && me.rt_access === 'rol') {
        if (p2.status && p2.status !== old && !magStatus(me, old, p2.status)) return err(403, 'Met jouw rol kun je deze status niet zetten.');
        for (var k in p2) { if (k !== 'status' && String(p2[k]) !== String(r[k] == null ? '' : r[k]) && !magVeld(me, k)) return err(403, 'Met jouw rol kun je dit niet aanpassen (' + k + ').'); }
      }
      Object.assign(r, p2, { updated: iso(Date.now()) });
      if (r.status !== old) r.historie = (Array.isArray(r.historie) ? r.historie : []).concat([{ status: r.status, at: new Date().toISOString(), door: me.name || me.email }]);
      save(); return ok(r);
    }
    return err(404, 'Niet beschikbaar in de demoversie.');
  }

  function ontvangers() { return load().users.filter(function (u) { return u.fp_codes && u.fp_access === 'edit' && u.verified && !u.isHost && !u.is_test; }); }

  function fakeOrder(nr) {
    nr = String(nr || '').trim();
    if (!/^[0-9A-Za-z-]{3,40}$/.test(nr)) return { ok: false };
    var seed = 0; for (var i = 0; i < nr.length; i++) seed = (seed * 31 + nr.charCodeAt(i)) % 2147483647;
    var rnd = function () { seed = (seed * 16807 + 11) % 2147483647; return seed / 2147483647; };
    var dagen = 2 + Math.floor(rnd() * 40);
    var items = [
      { label: 'Sikkens Rubbol BL Satura (2,5 L, gemengd, RAL 9010) — VW-SIK-RBS-25', name: 'Sikkens Rubbol BL Satura', sku: 'SIK-RBS-25', qty: 1, maat: '2,5 L', kleurcode: '9010', kleurnaam: 'RAL 9010', mengverf: true },
      { label: 'Rollerset 25 cm met verfbak — VW-ACC-RS25', name: 'Rollerset 25 cm met verfbak', sku: 'ACC-RS25', qty: 1 + Math.floor(rnd() * 2), maat: '', kleurcode: '', kleurnaam: '', mengverf: false }
    ];
    return { ok: true, ordernummer: nr, ordernummer_cyane: 'C' + (700000 + Math.floor(rnd() * 99999)),
      klant: { naam: 'Voorbeeld Klant', adres: 'Voorbeeldstraat ' + (1 + Math.floor(rnd() * 99)), postcode_woonplaats: '5721 AB Asten', telefoon: '06-12345678', email: 'klant@voorbeeld.nl' },
      items: items, besteld_op: iso(Date.now() - dagen * DAY), dagen: dagen, termijn: 30, binnen_termijn: dagen <= 30, wms_status: 'Verzonden', eerdere_retouren: [] };
  }

  function widgets(u) {
    var db = load(), out = {}, nu = Date.now();
    if (u.isHost || u.rt_access) {
      var rs = db.retouren.filter(function (r) { return u.is_test ? r.demo : !r.demo; });
      var dag = function (t) { var d = new Date(t); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / DAY); };
      var vandaagNr = dag(nu), wd0 = (new Date(nu).getDay() + 6) % 7, week0 = vandaagNr - wd0;
      var weken = [0, 0, 0, 0, 0, 0, 0, 0], prod = {}, reden = {}, open = 0, laat = 0, vandaag = 0;
      rs.forEach(function (r) {
        var t = ms(r.aangemeld), st = r.status, dn = dag(t);
        if (st !== 'terugbetaald' && st !== 'afgekeurd') open++;
        if (st === 'aangemeld' && vandaagNr - dn > 14) laat++;
        if (dn === vandaagNr) vandaag++;
        var idx = 7 - Math.ceil((week0 - (dn - ((new Date(t).getDay() + 6) % 7))) / 7);
        if (idx >= 0 && idx <= 7) weken[idx]++;
        if (idx >= 0) { var c = r.reden_cat || guessCat(r.reden); reden[c] = (reden[c] || 0) + 1; productLines(r.producten).forEach(function (p) { prod[p[0]] = (prod[p[0]] || 0) + p[1]; }); }
      });
      var top = function (o) { var b = null; for (var k in o) if (!b || o[k] > o[b]) b = k; return b; };
      out.retouren = { open: open, laat: laat, vandaag: vandaag, weken: weken, top_product: top(prod), top_reden: top(reden) };
    }
    if (!u.isHost && u.fp_access) {
      var docs = {};
      if (u.fp_access === 'afd') fpWeergave(u).forEach(function (x) { docs[x.key] = x.value; });
      else db[fpColl(u)].forEach(function (d) { docs[d.key] = d.value; });
      var arr = function (k) { return Array.isArray(docs[k]) ? docs[k] : []; }, emp = {};
      arr('employees').forEach(function (x) { emp[x.id] = x.name; });
      var vd = new Date(nu + 3600e3).toISOString().slice(0, 10), over7 = new Date(nu + 8 * DAY).toISOString().slice(0, 10);
      var komend = arr('appointments').filter(function (a) { return (a.status || 'gepland') === 'gepland' && a.date >= vd && a.date < over7; }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
      var conv = arr('conversations'), laatste = function (e) { return conv.filter(function (c) { return c.employee === e.id; }).sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); })[0]; };
      out.functioneringsportaal = { medewerkers: arr('employees').length, nog_te_voeren: arr('employees').filter(function (e) { var l = laatste(e); return !l || l.status !== 'afgerond'; }).length,
        afgerond: conv.filter(function (c) { return c.status === 'afgerond'; }).length,
        volgende: komend.slice(0, 3).map(function (a) { return { naam: emp[a.employee] || '?', datum: a.date, tijd: a.time || '' }; }) };
    }
    if (u.isHost || u.isAdmin) {
      out.beheer = { accounts: db.users.filter(function (x) { return !x.is_test; }).length,
        zonder_toegang: db.users.filter(function (x) { return !x.is_test && !x.isHost && !x.fp_access && !x.mp_access && !x.rt_access; }).length,
        uitnodigingen: db.uitnodigingen.filter(function (i) { return !i.gebruikt_door && ms(i.verloopt) > nu; }).length };
    }
    return out;
  }

  /* ---------- fetch en EventSource onderscheppen ---------- */
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  function apiPath(input) {
    var raw = typeof input === 'string' ? input : (input && input.url) || '';
    var u; try { u = new URL(raw, location.href); } catch (_) { return null; }
    var p = u.pathname, i = p.indexOf('/api/');
    if (i >= 0) return { path: p.slice(i), url: u };
    if (/\/versie\.json$/.test(p)) return { path: '/versie.json', url: u };
    return null;
  }
  function header(init, name) {
    var h = init && init.headers; if (!h) return '';
    if (typeof h.get === 'function') return h.get(name) || '';
    for (var k in h) if (k.toLowerCase() === name.toLowerCase()) return h[k];
    return '';
  }
  window.fetch = function (input, init) {
    var hit = apiPath(input);
    if (!hit) return realFetch ? realFetch(input, init) : Promise.reject(new TypeError('fetch'));
    init = init || {};
    var method = String(init.method || 'GET').toUpperCase(), body = {};
    if (init.body) { try { body = JSON.parse(init.body); } catch (_) { body = {}; } }
    var me = userFromToken(header(init, 'Authorization'));
    return new Promise(function (resolve) {
      setTimeout(function () {
        var res;
        try { res = handle(method, hit.path, hit.url, body, me); } catch (e) { console.error(e); res = err(500, 'Fout in de demoversie.'); }
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
    d.id = 'vpDemoBar'; d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:99999;background:#202635;color:#fff;font:13px/1.4 Arial,sans-serif;padding:9px 12px;border-radius:10px;box-shadow:0 4px 16px #0003;display:flex;gap:10px;align-items:center;max-width:min(560px,calc(100vw - 28px))';
    var t = document.createElement('span');
    var basis = '<strong>Demoversie</strong> · verzonnen gegevens, alles blijft in je browser';
    t.innerHTML = basis;
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = 'Opnieuw beginnen';
    b.style.cssText = 'background:#e50071;color:#fff;border:0;border-radius:7px;padding:5px 10px;font:inherit;cursor:pointer;flex:none';
    b.onclick = function () {
      try { localStorage.removeItem(DB_KEY); localStorage.removeItem('vp_auth'); ['fp_mode', 'rt_mode'].forEach(function (k) { localStorage.removeItem(k); }); sessionStorage.clear(); } catch (_) {}
      location.reload();
    };
    var x = document.createElement('button');
    x.type = 'button'; x.textContent = '×'; x.title = 'Verbergen'; x.setAttribute('aria-label', 'Demobalk verbergen');
    x.style.cssText = 'background:transparent;color:#fff;border:0;font:18px/1 Arial,sans-serif;cursor:pointer;padding:0 2px;flex:none';
    x.onclick = function () { d.remove(); try { sessionStorage.setItem('vpdemo_bar', 'uit'); } catch (_) {} };
    d.append(t, b, x);
    window.addEventListener('vpdemo-melding', function (ev) {
      t.innerHTML = '<strong>Demo:</strong> ' + String(ev.detail).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
      d.style.background = '#e50071'; b.style.background = '#202635';
      if (!d.isConnected) document.body.append(d);
      clearTimeout(bar.t); bar.t = setTimeout(function () { t.innerHTML = basis; d.style.background = '#202635'; b.style.background = '#e50071'; }, 20000);
    });
    var verborgen = false; try { verborgen = sessionStorage.getItem('vpdemo_bar') === 'uit'; } catch (_) {}
    if (!verborgen) document.body.append(d);
    // Functioneringsgesprekken: uitleg bij het scherm met de toegangscode
    var tries = 0, iv = setInterval(function () {
      if (++tries > 20) return clearInterval(iv);
      var ov = document.getElementById('loginOverlay');
      if (ov && !ov.classList.contains('hidden') && /Toegangscode/.test(ov.textContent)) {
        clearInterval(iv);
        window.dispatchEvent(new CustomEvent('vpdemo-melding', { detail: 'Vul 0000 in voor de testversie. Of klik op Code aanvragen: in het echte portaal gaat de code per mail naar een Beheerder 2, in de demo zie je hem hier.' }));
      }
    }, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bar); else bar();
})();
