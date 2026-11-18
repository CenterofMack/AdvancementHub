/* =====================================================================
   Advancement Hub: Demo view
   ---------------------------------------------------------------------
   Adds a "Demo view" button to the Hub's top bar. Click it and every tab
   switches to made-up households, fundraisers, places and amounts, so the
   Hub can be shown in a meeting without showing real donor data. Click
   "Exit demo view" to go back. Leaving or refreshing the Hub also turns it off.

   While demo view is on:
     • No request goes to the Power Automate flows. A reply that was already
       on its way when you switched is thrown away, so real and made-up
       numbers never mix on screen.
     • The Strategic Plan shows made-up targets, with job titles instead of names.
     • PDF footers say "DEMO DATA" and downloaded files start with "DEMO - ".
     • People still only see the tabs their HubAccess row allows.

   Loaded from index.html with one line in the <head>:
     <script src="demo-mode.js"></script>
   ===================================================================== */
(function () {
  "use strict";
  const DEMO = { on: false, gen: 0, data: null, real: null, wrapped: false };

  /* ---------- The made-up data (built the first time demo view is turned on) ---------- */
  function build() {
    const Y = 2026, THRU = "2026-11-16", THRU_M = 11, THRU_D = 16;

    /* ---------- Random helpers (seeded) ---------- */
    let s = 20261116;
    const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const pick = a => a[Math.floor(rnd() * a.length)];
    const chance = p => rnd() < p;
    const between = (lo, hi) => lo + rnd() * (hi - lo);
    const logu = (lo, hi) => Math.exp(between(Math.log(lo), Math.log(hi)));
    const roundTo = (v, st) => Math.round(v / st) * st;
    const nice = v => { const st = v >= 1e6 ? 25000 : v >= 1e5 ? 5000 : v >= 1e4 ? 500 : v >= 1000 ? 50 : 5; return Math.max(st, roundTo(v, st)); };
    const pad = n => String(n).padStart(2, "0");
    const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
    const toMs = x => Date.UTC(+x.slice(0, 4), +x.slice(5, 7) - 1, +x.slice(8, 10));
    const addDays = (x, n) => new Date(toMs(x) + n * 864e5).toISOString().slice(0, 10);
    const minIso = (a, b) => a < b ? a : b;
    const serial = x => Math.round(toMs(x) / 864e5) + 25569;   // Excel date number
    const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
    const sum = (list, f) => list.reduce((t, x) => t + (f(x) || 0), 0);

    /* ---------- Made-up names and places ---------- */
    const FIRST = ["James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Margaret","Thomas","Sarah","Charles","Karen","Daniel","Nancy","Matthew","Lisa","Mark","Ellen","Steven","Sandra","Paul","Anne","Andrew","Emily","Kenneth","Donna","George","Carol","Edward","Ruth","Brian","Sharon","Ronald","Laura","Timothy","Helen","Gary","Anna","Frank","Julie","Scott","Joyce","Eric","Grace","Gregory","Alice","Peter","Claire","Henry","Martha","Walter","Irene"];
    const LAST = ["Ashcombe","Bellweather","Carrow","Dunleavy","Ellery","Fennimore","Galbraith","Harrowgate","Ingleby","Jessop","Kittredge","Lindqvist","Merriam","Northrup","Oakhurst","Penhallow","Quarles","Rookwood","Stirling","Thackery","Upshaw","Vandermolen","Whitlock","Yarborough","Ainslie","Brackett","Crandall","Delacroix","Eastwick","Farrington","Gilmartin","Hollister","Iverly","Jardine","Kellerman","Lockwood","Marchetti","Nettleton","Overbeck","Pruett","Ravenscroft","Sedgwick","Tolliver","Ulrich","Vreeland","Winterbourne","Aldridge","Blakemore","Corwin","Dillard","Everhart","Fairweather","Hathaway","Kingsley","Langstrom","Mayhew","Pemberton","Rowntree","Sorensen","Westerly"];
    const FRS = ["Alex Morgan", "Jordan Reyes", "Taylor Brooks", "Casey Whitaker", "Riley Donovan", "Sam Okafor"];
    const NOFR = "No Assigned Fundraiser";
    const MI = ["Oakland","Oakland","Oakland","Kent","Kent","Wayne","Wayne","Macomb","Washtenaw","Washtenaw","Ottawa","Ottawa","Midland","Midland","Ingham","Kalamazoo","Grand Traverse","Grand Traverse","Bay","Saginaw","Livingston","Genesee","Allegan","Emmet","Muskegon","Berrien","Isabella","Leelanau","Monroe","St. Clair","Jackson","Marquette","Charlevoix","Clinton","Eaton","Barry","Lapeer","Houghton","Antrim","Van Buren"];
    const OUT = [["TX","Harris"],["TX","Dallas"],["FL","Palm Beach"],["FL","Collier"],["FL","Sarasota"],["CA","Los Angeles"],["CA","Orange"],["IL","Cook"],["IL","DuPage"],["NY","New York"],["OH","Franklin"],["OH","Hamilton"],["OH","Lucas"],["VA","Fairfax"],["AZ","Maricopa"],["CO","Denver"],["IN","Hamilton"],["WI","Waukesha"],["MN","Hennepin"],["NC","Mecklenburg"],["GA","Fulton"],["PA","Allegheny"],["TN","Davidson"],["SC","Charleston"]];
    const place = miShare => { const r = rnd(); if (r < 0.015) return ["", ""]; if (r < 0.025) return ["MI", ""]; if (r < miShare) return ["MI", pick(MI)]; return pick(OUT).slice(); };
    const used = new Set();
    function hhName(org) {
      for (let i = 0; i < 60; i++) {
        const L = pick(LAST), F1 = pick(FIRST), F2 = pick(FIRST);
        const n = org ? pick([`The ${L} Family Foundation`, `${L} Charitable Trust`, `${L} Manufacturing`, `${L} & ${pick(LAST)} LLC`, `${L} Family Fund`])
          : chance(0.6) && F1 !== F2 ? `${F1} & ${F2} ${L}` : `${F1} ${L}`;
        if (!used.has(n)) { used.add(n); return n; }
      }
      return "Household " + (used.size + 1);
    }
    const CLS = ["Major Gift Donor","Major Gift Donor","Mid-Level Donor","Mid-Level Donor","Leadership Annual Fund","Planned Giving Prospect"];
    const CLS_PROSPECT = ["Major Gift Prospect","Major Gift Prospect","Foundation / Corporate","Planned Giving Prospect","Personal / Professional Relationships","Pipeline Parking Lot",""];
    const STATUS = ["Cultivation","Cultivation","Solicitation","Stewardship","Stewardship","Qualification","Identification"];
    const ACT_CAT = ["Meeting","Phone Call","Email","Event","Letter"];
    const ACT_TYPE = ["Visit","Discovery Call","Thank You","Proposal Follow-up","Event Invite","Update"];
    const NOTES = ["Prefers a phone call over email.","Interested in education policy work.","Attended the fall luncheon.","Asked about a multi-year pledge.","Wants to tour the office in the spring.","Gives through a donor-advised fund.","Likes the Impact newsletter; send extra copies.","Year-end gift usually comes in December."];
    const MONTH_W = [5,4,5,6,6,5,5,5,6,7,10,26], MONTH_WT = MONTH_W.reduce((a, b) => a + b, 0);
    const pickMonth = () => { let r = rnd() * MONTH_WT; for (let i = 0; i < 12; i++) { r -= MONTH_W[i]; if (r < 0) return i + 1; } return 12; };
    const SMALL_CATS = ["BMM","BMM","Impact","Impact","Capitol Confidential","House File","National House File","Michigan Prospect Letter","National Prospect Letter","Online Giving","Online Giving","Event"];
    const MAJOR_CATS = ["Personal Solicitation","Personal Solicitation","Personal Solicitation","Event","Online Giving","BMM","Impact"];
    const MAIL = ["BMM","Impact","Capitol Confidential"];

    /* ---------- Households ---------- */
    const HH = [];
    let nextId = 10001;
    function newHH(name, B, st, co, fr) {
      const h = { id: String(nextId++), name, B, st, co, fr, gifts: [], m: { 2024: 0, 2025: 0, 2026: 0 }, out: 0, orig: 0,
        spec: 0, qa: 0, qia: 0, dec: false, active: true, src: {}, fe: null };
      HH.push(h); return h;
    }
    // Gives a year's giving as 1–3 gifts. In the current year, gifts dated after the
    // data-through date haven't come in yet: they're left out and their total is returned.
    function addGifts(h, y, amt) {
      if (!(amt > 0)) return 0;
      const n = amt >= 5000 && chance(0.35) ? 2 + (chance(0.4) ? 1 : 0) : 1;
      let left = amt, later = 0;
      for (let i = 0; i < n; i++) {
        const v = i === n - 1 ? left : roundTo(amt / n, 5); left -= v;
        const m = pickMonth(), d = 1 + Math.floor(rnd() * 28);
        if (y === Y && (m > THRU_M || (m === THRU_M && d > THRU_D))) { later += v; continue; }
        h.gifts.push({ y, m, d, amt: v, date: iso(y, m, d) });
        h.m[y] += v;
      }
      return later;
    }
    function relationship(h, prospect) {
      h.pc = prospect ? pick(CLS_PROSPECT) : chance(0.05) ? "Personal / Professional Relationships" : chance(0.05) ? "Pipeline Parking Lot" : /Foundation|Trust|Fund|LLC|Manufacturing/.test(h.name) ? "Foundation / Corporate" : pick(CLS);
      h.ps = pick(STATUS);
      h.la = addDays(THRU, -Math.floor(logu(1, 700)));
      h.lac = pick(ACT_CAT); h.lat = pick(ACT_TYPE);
      if (chance(0.25)) h.notes = pick(NOTES);
      if (chance(0.04)) { h.con = "Northpoint Advancement Group"; h.conCr = nice(h.B * between(0.3, 1)); }
    }
    function level() { return 0.7 * level0(); }   // scaled so the demo's totals don't line up with the real ones
    function level0() {
      const r = rnd();
      if (r < 0.006) return logu(1.1e6, 2.4e6);
      if (r < 0.045) return logu(1e5, 6e5);
      if (r < 0.10) return logu(5e4, 1e5);
      if (r < 0.36) return logu(1e4, 5e4);
      return logu(1000, 1e4);
    }
    // Donors $1K and up: on the Projections data by name
    for (let i = 0; i < 520; i++) {
      const B = level(), org = chance(B >= 1e5 ? 0.4 : 0.12), [st, co] = place(0.72);
      const h = newHH(hhName(org), B, st, co, B >= 1e4 || chance(0.55) ? pick(FRS) : NOFR);
      h.major = true;
      const fy = chance(0.12) ? pick([2024, 2025, 2026]) : Math.floor(between(1995, 2024));
      let prev = fy < 2024 && chance(0.85);
      for (const y of [2024, 2025]) {
        if (y < fy) { prev = false; continue; }
        const gave = y === fy || chance(prev ? 0.86 : 0.3);
        if (gave) { addGifts(h, y, nice(B * between(0.65, 1.35))); h.src[y] = pick(MAJOR_CATS); }
        prev = gave;
      }
      if (fy === Y || chance(prev ? 0.86 : 0.28)) {
        const total = nice(B * between(0.7, 1.4));
        h.out = addGifts(h, Y, total); if (h.m[Y]) h.src[Y] = pick(MAJOR_CATS);
        h.orig = chance(0.82) ? nice(total * between(0.85, 1.15)) : 0;
      }
      const firstGift = h.gifts.map(g => g.date).sort()[0];
      h.fe = fy >= 2024 && firstGift ? firstGift : iso(fy, 1 + Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 28));
      if (chance(0.25)) h.spec = nice(B * between(1.2, 4));
      if (chance(0.18)) h.qa = nice(B * between(1, 3));
      if (chance(0.08)) h.qia = nice(B * between(1, 2.5));
      h.dec = chance(0.02);
      h.active = !(h.m[Y] + h.out === 0 && chance(0.15));
      relationship(h, false);
    }
    // Two made-up headliners at the top of the pyramid (rename freely; keep them fictional)
    [["Rex & Lola Thunderhart", 1.6e6, "Oakland", "Alex Morgan"], ["Vincent Gravesend", 1.2e6, "Wayne", "Jordan Reyes"]].forEach(([name, B, co, fr]) => {
      used.add(name);
      const h = newHH(name, B, "MI", co, fr);
      h.major = true;
      addGifts(h, 2024, nice(B * 0.95)); h.src[2024] = "Personal Solicitation";
      addGifts(h, 2025, nice(B * 1.05)); h.src[2025] = "Personal Solicitation";
      h.out = addGifts(h, Y, nice(B * 1.1)); if (h.m[Y]) h.src[Y] = "Personal Solicitation";
      h.orig = nice(B * 1.1); h.spec = nice(B * 2); h.qa = nice(B * 1.5);
      h.fe = "2009-12-14";
      relationship(h, false); h.pc = "Major Gift Donor"; h.notes = "Prefers the back row at events. Always brings the band.";
    });
    // Prospects: assigned, never given (in the years the Hub has)
    for (let i = 0; i < 130; i++) {
      const B = logu(3500, 2e5), [st, co] = place(0.7);
      const h = newHH(hhName(chance(0.2)), B, st, co, pick(FRS));
      h.major = true; h.prospect = true;
      if (chance(0.6)) h.spec = nice(B * between(1, 3));
      if (chance(0.35)) h.qa = nice(B * between(1, 2.5));
      if (chance(0.15)) h.qia = nice(B * between(1, 2));
      h.active = !chance(0.1);
      relationship(h, true);
    }
    // Donors under $1K: on Donor Retention one by one, rolled into "Gifts Under $1k" on the Projections data
    for (let i = 0; i < 2600; i++) {
      const B = logu(15, 700), [st, co] = place(0.8);
      const h = newHH(hhName(false), B, st, co, NOFR);
      const fy = chance(0.35) ? pick([2024, 2025, 2026]) : Math.floor(between(2008, 2024));
      let prev = fy < 2024 && chance(0.5);
      for (const y of [2024, 2025, 2026]) {
        if (y < fy) { prev = false; continue; }
        let gave = y === fy || chance(prev ? 0.5 : 0.13);
        if (gave) { addGifts(h, y, Math.min(990, Math.max(10, roundTo(B * between(0.6, 1.4), 5)))); if (h.m[y]) h.src[y] = chance(0.05) ? "No Appeal" : pick(SMALL_CATS); }
        prev = gave;
      }
      const firstGift = h.gifts.map(g => g.date).sort()[0];
      h.fe = fy >= 2024 && firstGift ? firstGift : iso(fy, 1 + Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 28));
      h.dec = chance(0.005);
    }
    const MAJORS = HH.filter(h => h.major), SMALL = HH.filter(h => !h.major);
    const ytdTo = (h, y, m, d) => sum(h.gifts, g => g.y === y && (g.m < m || (g.m === m && g.d <= d)) ? g.amt : 0);

    /* ---------- Overview ---------- */
    const UNDER = { 2024: sum(SMALL, h => h.m[2024]), 2025: sum(SMALL, h => h.m[2025]), 2026: sum(SMALL, h => h.m[2026]) };
    UNDER.out = roundTo(UNDER[2026] * 0.14, 100);
    const moneyIn = sum(HH, h => h.m[Y]), projected = sum(HH, h => h.out) + UNDER.out, ye = moneyIn + projected;
    const GOAL = Math.ceil(ye / 0.965 / 1e5) * 1e5;
    const daf = roundTo(ye * 0.035, 1000), inkind = roundTo(ye * 0.006, 1000), opsInc = roundTo(ye * 0.02, 1000), dafGr = roundTo(ye * 0.012, 1000);
    const c4Tot = roundTo(ye * 0.05, 1000), c4In = roundTo(c4Tot * 0.78, 1000);
    const c3Tot = ye - c4Tot - (daf + inkind) + (opsInc + dafGr), c3In = roundTo(c3Tot * moneyIn / ye, 1000);
    const c3Exp = roundTo(c3Tot * 1.01, 1e4), c4Exp = roundTo(c4Tot * 0.9, 1000);
    const ov = (Section, Label, Value, Format) => ({ Section, Label, Value, Format: Format || "money" });
    const OVERVIEW = [
      ov("Header", "Projections — Overview", THRU, "text"),
      ov("Fundraising", `Original ${Y} Projection`, roundTo(GOAL * 0.98, 1e5)),
      ov("Fundraising", `${Y} Fundraising Goal`, GOAL),
      ov("Fundraising", "Money In", moneyIn),
      ov("Fundraising", "Projected (Not Yet In)", projected),
      ov("Fundraising", "Total YE Projections (All Entities)", ye),
      ov("Fundraising", "Projected vs. Goal", ye - GOAL),
      ov("Fundraising", "% of Goal", ye / GOAL, "pct"),
      ov("Non-MCPP C3 Revenue", "DAF Gifts", daf), ov("Non-MCPP C3 Revenue", "In-Kind Gifts", inkind), ov("Non-MCPP C3 Revenue", "Total Non-MCPP C3 Revenue", daf + inkind),
      ov("Other MCPP C3 Revenue", "Operations Income", opsInc), ov("Other MCPP C3 Revenue", "DAF Grants", dafGr), ov("Other MCPP C3 Revenue", "Total Other MCPP C3 Revenue", opsInc + dafGr),
      ov("Operations", "Total Revenue", c3Tot + c4Tot), ov("Operations", "Total Expenses", c3Exp + c4Exp), ov("Operations", "Surplus / (Deficit)", c3Tot + c4Tot - c3Exp - c4Exp),
      ov("C3 Operations", "Money In", c3In), ov("C3 Operations", "Projected", c3Tot - c3In), ov("C3 Operations", "Total C3 Revenue", c3Tot), ov("C3 Operations", "C3 Expenses", c3Exp), ov("C3 Operations", "C3 Surplus / (Deficit)", c3Tot - c3Exp),
      ov("C4 Operations", "Money In", c4In), ov("C4 Operations", "Projected", c4Tot - c4In), ov("C4 Operations", "Total C4 Revenue", c4Tot), ov("C4 Operations", "C4 Expenses", c4Exp), ov("C4 Operations", "C4 Surplus / (Deficit)", c4Tot - c4Exp),
      ov("Estimated Balances", "Operating Reserve", roundTo(ye * 0.42, 1e4)), ov("Estimated Balances", "Board-Designated Funds", roundTo(ye * 0.18, 1e4)), ov("Estimated Balances", "Total", roundTo(ye * 0.42, 1e4) + roundTo(ye * 0.18, 1e4))
    ];

    /* ---------- Projections Data rows ---------- */
    const TOTAL_KEY = `Total Money In & Projected ${Y}`;
    function projRow(h) {
      const q = [0, 0, 0, 0];
      h.gifts.forEach(g => { if (g.y === Y) q[Math.floor((g.m - 1) / 3)] += g.amt; }); q[3] += h.out;
      return { "Name": h.name, "ID": h.id, "Solicitor": h.fr, "Q1": q[0], "Q2": q[1], "Q3": q[2], "Q4": q[3],
        [TOTAL_KEY]: h.m[Y] + h.out, "Money In 2026": h.m[2026], "Money In 2025": h.m[2025], "Money In 2024": h.m[2024],
        "Outstanding Projected": h.out, [`Original ${Y} Projection`]: h.orig, "Speculative": h.spec, "Qualified Active": h.qa, "Qualified Inactive": h.qia,
        "Last Action Date": h.la || "", "Last Action Category": h.lac || "", "Last Action Type": h.lat || "",
        "Prospect Status": h.ps || "", "Prospect Classification": h.pc || "", "Active": h.active ? "Yes" : "No", "Deceased": h.dec ? "Yes" : "No",
        "Preferred State": h.st, "Preferred County": h.co, "Contractor": h.con || "", "Contractor Credit": h.conCr || "", "Notes": h.notes || "", "System Record ID": "" };
    }
    const underRow = () => {
      const q = [0, 0, 0, 0];
      SMALL.forEach(h => h.gifts.forEach(g => { if (g.y === Y) q[Math.floor((g.m - 1) / 3)] += g.amt; })); q[3] += UNDER.out;
      return Object.assign(projRow({ name: "Gifts Under $1k", id: "", fr: NOFR, gifts: [], m: UNDER, out: UNDER.out, orig: roundTo((UNDER[Y] + UNDER.out) * 1.02, 100),
        spec: 0, qa: 0, qia: 0, active: true, dec: false, st: "", co: "" }), { Q1: q[0], Q2: q[1], Q3: q[2], Q4: q[3] });
    };

    /* ---------- Donor Retention ---------- */
    function retention() {
      const columns = ["ID","Name","Solicitor","Money In 2024","Money In 2025","Money In 2026","Total Projected 2026","YTD 2025","YTD 2026","YTD Through","Deceased","Prospect Classification","System Record ID","Preferred County","Preferred State"];
      const rows = HH.map(h => [h.id, h.name, h.fr, h.m[2024], h.m[2025], h.m[2026], h.out, ytdTo(h, 2025, THRU_M, THRU_D), h.m[2026], THRU, h.dec ? "Yes" : "No", h.pc || "", "", h.co, h.st]);
      const gifts = []; HH.forEach(h => h.gifts.forEach(g => gifts.push([h.id, g.y, g.m, g.amt])));
      const sourceColumns = ["Household","Year","First Gift Of Year","Category","Appeal","From Mailing Program","First Gift Ever"];
      const source = [];
      HH.forEach(h => [2024, 2025, 2026].forEach(y => {
        if (!(h.m[y] > 0)) return;
        const first = h.gifts.filter(g => g.y === y).map(g => g.date).sort()[0], cat = h.src[y] || "No Appeal";
        const app = cat === "No Appeal" ? "No Appeal" : /Online|Personal|Event/.test(cat) ? cat : `${cat} ${first.slice(0, 7)}`;
        source.push([h.id, y, first, cat, app, MAIL.includes(cat), h.fe]);
      }));
      return { columns, rows, gifts, sourceColumns, source };
    }

    /* ---------- Advancement Reports (monthly snapshots) ---------- */
    const SOC = [["President's", 1e3, 1e4], ["1851", 1e4, 5e4], ["Liberty", 5e4, 1e5], ["Patriot", 1e5, 1e6], ["Lifetime", 1e6, Infinity]];
    const socCounts = vals => { const o = {}; SOC.forEach(([k, lo, hi]) => o[k] = vals.filter(v => v >= lo && v < hi).length); return o; };
    const soc2024 = socCounts(MAJORS.map(h => h.m[2024])), soc2025 = socCounts(MAJORS.map(h => h.m[2025]));
    const D = { 2024: sum(HH, h => h.m[2024]), 2025: sum(HH, h => h.m[2025]) };
    const N = { 2024: HH.filter(h => h.m[2024] > 0).length, 2025: HH.filter(h => h.m[2025] > 0).length };
    const volumeAnnual = [], societyAnnual = [];
    for (let y = 2008; y <= 2025; y++) {
      const f = y >= 2024 ? 1 : (0.45 + 0.55 * (y - 2008) / 16) * between(0.94, 1.06), g = y >= 2024 ? 1 : (0.75 + 0.25 * (y - 2008) / 16) * between(0.95, 1.05);
      volumeAnnual.push({ Year: y, "Total Dollars": y >= 2024 ? D[y] : roundTo(D[2024] * f, 1000), Donors: y >= 2024 ? N[y] : Math.round(N[2024] * g) });
      const base = y === 2024 ? soc2024 : y === 2025 ? soc2025 : null, row = { Year: y };
      SOC.forEach(([k]) => row[k] = base ? base[k] : Math.max(0, Math.round(soc2024[k] * f * between(0.9, 1.1))));
      row.Legacy = 4 + Math.floor(rnd() * 5);
      societyAnnual.push(row);
    }
    const socGoals = { presidents: Math.round(soc2025["President's"] * 1.08), 1851: Math.round(soc2025["1851"] * 1.08), liberty: Math.round(soc2025.Liberty * 1.1),
      patriot: Math.round(soc2025.Patriot * 1.1) + 1, lifetime: Math.max(2, soc2025.Lifetime + 1), legacy: 8 };
    const MONTHS = []; for (let m = THRU_M - 1; m >= 1; m--) MONTHS.push(`${Y}-${pad(m)}`);
    function snapshot(month) {
      const M = +month.slice(5, 7), end = iso(Y, M, daysIn(Y, M));
      let ytdC = 0, ytdP = 0, dC = 0, dP = 0, proj = UNDER.out, future = 0;
      const households = [];
      HH.forEach(h => {
        const c = ytdTo(h, Y, M, 31), p = ytdTo(h, Y - 1, M, 31), pr = Math.max(0, h.m[Y] + h.out - c);
        ytdC += c; ytdP += p; if (c > 0) dC++; if (p > 0) dP++; proj += c + pr; future += h.m[Y] + h.out > 0 ? 1 : 0;
        if (h.major && (c || p || pr || h.m[2024] || h.m[2025] || h.spec)) households.push({ id: h.id, fundraiser: h.fr, mi2024: h.m[2024], mi2025: h.m[2025], ytdPrior: p, ytdCurrent: c, projected: pr, speculative: h.spec });
      });
      const quarter = y => { const q = [0, 0, 0, 0]; HH.forEach(h => h.gifts.forEach(g => { if (g.y === y && (y < Y || g.m <= M)) q[Math.floor((g.m - 1) / 3)] += g.amt; })); return q; };
      const cur = quarter(Y); cur[3] += proj - ytdC;
      return { throughDate: end, year: Y,
        revenue: { ytd: ytdC, projections: proj, budget: roundTo(c3Exp + c4Exp, 1e5), goal: GOAL },
        volume: { ytdPrior: ytdP, ytdCurrent: ytdC, donorsPrior: dP, donorsCurrent: dC, projectedTotal: proj, projectedDonors: Math.round(future * 1.06), goal: GOAL },
        societies: { legacyYtdPrior: 3 + Math.floor(M / 3), legacyYtdCurrent: 2 + Math.floor(M / 3), goals: socGoals },
        quarterly: { prior: quarter(Y - 1), current: cur },
        households, societyExcludeIds: [] };
    }

    /* ---------- Mailing Program ---------- */
    function mailing() {
      const P = { Impact: { base: 170, avg: 135, issues: [2, 4, 6, 8, 10, 12], cost: 31000, n: 6 }, BMM: { base: 120, avg: 110, issues: [1, 3, 5, 7, 9, 11], cost: 21000, n: 6 }, CC: { base: 65, avg: 78, issues: [3, 6, 9, 12], cost: 19500, n: 4 } };
      const yrs = [2022, 2023, 2024, 2025, 2026], gross = {}, monthly = [];
      Object.entries(P).forEach(([program, p]) => {
        const years = [2024, 2025, 2026].map(y => {
          const gifts = [], amount = [];
          for (let m = 1; m <= 12; m++) {
            const lift = p.issues.includes(m) ? 1.8 : p.issues.includes(m - 1) ? 1.1 : 0.55;
            let n = Math.round(p.base * lift * (y === 2024 ? 0.95 : y === 2025 ? 1 : 1.04) * between(0.85, 1.15) * (m === 12 ? 1.6 : 1));
            if (y === Y && m > THRU_M) n = 0; if (y === Y && m === THRU_M) n = Math.round(n * 0.5);
            gifts.push(n); amount.push(roundTo(n * p.avg * between(0.85, 1.2), 10));
          }
          return { year: y, gifts, amount };
        });
        monthly.push({ program, years });
        const g = {}; years.forEach(x => g[x.year] = x.amount.reduce((a, b) => a + b, 0));
        g[2023] = roundTo(g[2024] * between(0.9, 0.97), 100); g[2022] = roundTo(g[2023] * between(0.9, 0.97), 100);
        gross[program] = g;
      });
      const block = (program, gr, ex, prog, miss) => ({ program, columns: yrs.map(String), metrics: [
        { name: "Gross income", values: gr }, { name: "Expenses", values: ex }, { name: "Net income", values: gr.map((v, i) => v - ex[i]) },
        { name: "Cost to raise $1", values: gr.map((v, i) => v ? Math.round(ex[i] / v * 100) / 100 : 0) },
        { name: "Issues still in progress", values: prog }, { name: "Issues missing expenses", values: miss }] });
      const byIssue = [], tg = yrs.map(() => 0), te = yrs.map(() => 0);
      Object.entries(P).forEach(([k, p]) => {
        const gr = yrs.map(y => gross[k][y]);
        const ex = yrs.map(y => roundTo(p.cost * (y === Y ? p.n - 1 : p.n) * (1 + (y - 2022) * 0.03) * between(0.95, 1.05), 100));
        const prog = yrs.map(y => y === Y ? 1 : 0), miss = yrs.map(y => y === Y && k === "BMM" ? 1 : 0);
        gr.forEach((v, i) => { tg[i] += v; te[i] += ex[i]; });
        byIssue.push(block(k, gr, ex, prog, miss));
      });
      byIssue.unshift(block("Total", tg, te, yrs.map(y => y === Y ? 3 : 0), yrs.map(y => y === Y ? 1 : 0)));
      return { settings: { dataThrough: THRU, reportYear: Y, lastCompleteMonth: THRU_M - 1, view: "All issues" }, monthly, byIssue, issues: [] };
    }

    /* ---------- Opportunities (asks / proposals) ---------- */
    const OPPS = [];
    const oppPool = MAJORS.filter(h => (h.B >= 5000 && h.fr !== NOFR) || h.prospect);
    const lapsedPool = MAJORS.filter(h => !h.prospect && h.fr !== NOFR && h.m[2024] + h.m[2025] === 0);
    const prospects = MAJORS.filter(h => h.prospect);
    function addOpp(y, h, opts) {
      opts = opts || {};
      const c4 = !!opts.c4, ident = !!opts.ident;
      let ask = opts.ask || (c4 ? nice(logu(10000, 250000)) : nice(Math.min(2.5e6, Math.max(5000, h.B * between(1, 2.6)))));
      const askDate = ident ? "" : iso(y, 1 + Math.floor(rnd() * (y === Y ? THRU_M - 1 : 12)), 1 + Math.floor(rnd() * 28));
      const added = ident ? iso(Y, 1 + Math.floor(rnd() * (THRU_M - 1)), 1 + Math.floor(rnd() * 28)) : addDays(askDate, -Math.floor(between(10, 90)));
      const prior = h.prospect ? 0 : y >= 2026 ? h.m[y - 1] + h.m[y - 2] : y === 2025 ? h.m[2024] + 1 : 1;   // assume 2023 giving for earlier years
      const neverGave = h.prospect || !h.gifts.some(g => g.date < (askDate || added));
      let instrument = c4 ? "N/A - C4 Ask" : prior > 0 ? "" : neverGave ? "Yes" : "Re-Engaged";
      if (!c4 && instrument === "" && chance(0.08)) instrument = "Re-Engaged";
      const lastYear = h.m[y - 1] || 0;
      const giftType = !c4 && lastYear > 0 && ask >= lastYear + 5000 && chance(0.6) ? "Increased Ask / Previous Giving" : pick(["Renewal", "New Gift", "Special Project", ""]);
      const purpose = c4 ? "C4 - MCA Unrestricted" : pick(["General Operating", "Education Policy", "Labor Policy", "Fiscal Policy", "Property Rights", "Capitol Confidential"]);
      const reason = c4 ? (chance(0.3) ? "C4 Gift" : "MCA Unrestricted") : pick(["General Operating", "Program Support", "Project Grant", "Event Sponsorship"]);
      let status;
      if (ident) status = "Identification";
      else if (opts.status) status = opts.status;
      else {
        const r = rnd(), t = y === 2024 ? [0.55, 0.65, 0.8, 0.95] : y === 2025 ? [0.45, 0.55, 0.7, 0.82] : [0.3, 0.4, 0.48, 0.5];
        status = r < t[0] ? "Funded" : r < t[1] ? "Committed - Pledge" : r < t[2] ? "Declined" : r < t[3] ? "Closed - No Response" : "Asked";
      }
      let funded = 0, fundedDate = "", linked = 0;
      if (status === "Funded" || status === "Committed - Pledge" || (status === "Asked" && chance(0.05))) {
        funded = nice(ask * between(0.5, 1)); fundedDate = minIso(addDays(askDate, Math.floor(between(15, 150))), THRU); linked = 1;
        if (status === "Funded" && chance(0.05)) { funded = 0; fundedDate = ""; linked = 0; }
      }
      const since = askDate || added, gaveSince = sum(h.gifts, g => g.date >= since ? g.amt : 0);
      const frs = [h.fr];
      if (chance(0.2)) { const o = pick(FRS); if (!frs.includes(o)) frs.push(o); }
      if (chance(0.07)) frs[0] = pick(FRS.filter(f => f !== h.fr));
      const surname = h.name.split(" ").pop();
      OPPS.push({ name: c4 ? `MCA - ${surname} ${y}` : `${surname} ${y} ${purpose}`, householdName: h.name, status, askDate, added, ask, funded, fundedDate, linked, gaveSince,
        fundraisers: [...new Set(frs)], assigned: h.fr, purpose, instrument, reason, giftType, matched: true, firstMarked: false, firstTime: prior === 0, constituentSys: "" });
    }
    [[2024, 70], [2025, 85], [2026, 105]].forEach(([y, n]) => {
      for (let i = 0; i < n; i++) {
        const r = rnd(), h = r < 0.12 ? pick(prospects) : r < 0.3 && lapsedPool.length ? pick(lapsedPool) : pick(oppPool);
        addOpp(y, h, { c4: chance(0.12), ident: y === Y && chance(0.1) });
      }
    });
    const top = MAJORS.filter(h => !h.prospect).sort((a, b) => b.B - a.B);
    addOpp(2025, top[0], { ask: 12e6, status: "Declined" });
    addOpp(2026, top[1], { ask: 10e6, status: "Asked" });
    addOpp(2026, top[2], { ask: 15e6, status: "Asked" });

    /* ---------- 2027 EWMC sponsorships ---------- */
    const TIERS = [["Presenting Sponsor ($200k)", 2e5, 20], ["Sacred Honor ($100k)", 1e5, 16], ["Patriot ($50k)", 5e4, 10], ["Liberty ($25k)", 25000, 8], ["Freedom ($10k)", 1e4, 4], ["Justice ($5k)", 5000, 2]];
    const tierFor = B => B >= 4e5 ? TIERS[0] : B >= 1.5e5 ? TIERS[1] : B >= 6e4 ? TIERS[2] : B >= 2.5e4 ? TIERS[3] : B >= 1e4 ? TIERS[4] : TIERS[5];
    const ewPool = MAJORS.filter(h => !h.prospect && h.B >= 3000 && h.fr !== NOFR).sort(() => rnd() - 0.5).slice(0, 48).sort((a, b) => b.B - a.B);
    const LK = [].concat(Array(13).fill("Confirmed"), Array(4).fill("Confirmed - Need Names"), Array(12).fill("Speculative"), Array(6).fill("Unlikely"), Array(4).fill("Declined"), Array(4).fill("ADD"), Array(5).fill(""));
    const lkOrder = LK.sort(() => rnd() - 0.5);
    let presenting = false, attention = false, EW_ROWS = [];
    ewPool.forEach((h, i) => {
      const lkRaw = lkOrder[i] || "", addl = lkRaw === "ADD", lk = addl ? "Confirmed" : lkRaw, conf = lk.startsWith("Confirmed");
      let t = tierFor(h.B); if (t === TIERS[0] && (presenting || !conf)) t = TIERS[1]; if (t === TIERS[0]) presenting = true;
      const lvl = addl ? "Additional Donation" : conf || (lk === "Speculative" && chance(0.5)) ? t[0] : "";
      let door = 0;
      if (addl) door = nice(logu(500, 7500));
      else if (conf) { const r = rnd(); door = r < 0.55 ? t[1] : r < 0.7 ? t[1] / 2 : 0; }
      else if (lk === "Speculative" && !attention) { door = 5000; attention = true; }
      const parts = h.name.split(" "), org = /Foundation|Trust|Fund|LLC|Manufacturing/.test(h.name);
      const fa = addDays(THRU, -Math.floor(between(60, 160))), ra = addDays(THRU, -Math.floor(between(1, 45)));
      const proposal = conf || lk === "Speculative" || lk === "Declined";
      const custom = conf && !addl && chance(0.08) ? t[1] + 5000 : "";
      EW_ROWS.push({
        "Constituent ID": h.id, "Constituent Name": h.name,
        "Primary Contact": org ? `${pick(FIRST)} ${pick(LAST)}` : `${parts[0]} ${parts[parts.length - 1]}`,
        "Assigned Fundraiser": h.fr, "First Action Date": serial(fa), "Most Recent Action Date": serial(ra),
        "Proposal Date": proposal ? serial(addDays(fa, 20)) : "", "Proposal Amount": proposal && !addl ? t[1] : "",
        "Proposal Status": !proposal ? "" : conf ? (door >= t[1] ? "Funded" : "Committed - Pledge") : lk === "Declined" ? "Declined" : "Asked",
        "Who Made Ask": proposal ? h.fr : "", "Pledge Amount": conf && !addl ? (custom || t[1]) : "", "Amount in Door": door || "",
        "Target Sponsorship Level": addl ? "" : t[0], "Sponsorship Likelihood": lk, "Sponsorship Level": lvl, "Sponsorship Amount": custom,
        "Sponsoring Name": !org && conf && chance(0.3) ? `The ${parts[parts.length - 1]} Family` : "",
        "Invoice Created": conf && !addl ? (door ? "Yes" : pick(["Yes", "No"])) : "", "Projected # of Guests": conf && !addl ? t[2] : "",
        "Additional Notes": chance(0.3) ? pick(["Wants a table near the stage.", "Send the invoice to their assistant.", "Guest names coming in April.", "Considering moving up a level.", "Prefers to be listed as anonymous in the program."]) : ""
      });
    });
    const TICKETS = 64350;
    const ewAll = TICKETS + sum(EW_ROWS, r => r["Sponsorship Likelihood"].startsWith("Confirmed") ? (r["Sponsorship Level"] === "Additional Donation" ? +r["Amount in Door"] : (+r["Sponsorship Amount"] || +r["Pledge Amount"] || 0)) : 0)
      + sum(EW_ROWS, r => r["Sponsorship Likelihood"] === "Speculative" ? (TIERS.find(t => t[0] === (r["Sponsorship Level"] || r["Target Sponsorship Level"])) || [0, 0])[1] : 0);
    const EW_GOAL = Math.ceil(ewAll * 1.1 / 50000) * 50000;

    /* ---------- Strategic Plan targets (made up, set so progress looks like November) ---------- */
    const asks26 = OPPS.filter(o => o.askDate.startsWith(String(Y)) && o.status !== "Identification");
    const isC4 = o => /c4/i.test(o.instrument) || /c4 gift/i.test(o.reason);
    const up = (v, st) => Math.max(st, Math.ceil(v / st) * st);
    const targets = {
      g1A: GOAL, g1A1: up(c4In / 0.62, 1e5), g1B: up(GOAL * 1.5, 1e6),
      g2A: up(sum(asks26.filter(o => !/c4 gift/i.test(o.reason) && o.ask < 1e7), o => o.ask) / 0.72, 1e6),
      g2A1: up(asks26.filter(o => !isC4(o) && /increase/i.test(o.giftType)).length / 0.6, 5),
      g2A2: asks26.filter(o => !isC4(o) && o.ask >= 1e7).length + 3,
      g2B: up(asks26.filter(o => !isC4(o) && /^yes$|re-?engaged/i.test(o.instrument)).length / 0.7, 5),
      g2D: up(sum(asks26.filter(isC4), o => o.ask) / 0.55, 1e5)
    };


    // Recent gifts for Recent Activity › Gifts (the last 35 days before the data-through date)
    const giftFrom = addDays(THRU, -35);
    const RECENT = [];
    HH.forEach(h => h.gifts.forEach(g => {
      if (g.date < giftFrom || g.date > THRU) return;
      const cat = h.src[g.y] || "No Appeal";
      RECENT.push({ date: g.date, amount: g.amt, household: h.id, householdName: h.name, sys: "", fundraiser: h.fr === NOFR ? "" : h.fr,
        fund: /Capitol/.test(cat) ? "CapCon" : chance(0.85) ? "General Operating" : pick(["Education Policy", "Labor Policy", "Fiscal Policy"]),
        appeal: cat === "No Appeal" ? "" : /Online|Personal|Event/.test(cat) ? cat : `${cat} ${g.date.slice(0, 7)}`, giftType: "", subtype: "", giftId: "", dafPledge: false });
    }));
    RECENT.sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount);

    // Each request returns { status, body }, like the real flows
    const ALL_YES = { "Projections": "Yes", "Board Slides": "Yes", "Strategic Plan": "Yes", "Retention": "Yes", "EWMC": "Yes", "Mailing Program": "Yes", "Edit Permissions (Projections)": "Yes" };
    const access = () => { try { return ACCESS && Object.keys(ACCESS).length ? ACCESS : ALL_YES; } catch (_) { return ALL_YES; } };
    const ok = body => ({ status: 200, body });
    const can = key => String(access()[key] || "").trim().toLowerCase() === "yes";
    const SERVICES = {
      projections: () => can("Projections")
        ? ok({ user: "Demo User", access: access(), overview: OVERVIEW, projections: MAJORS.map(projRow).concat([underRow()]) })
        : { status: 403, body: { user: "Demo User", access: access() } },
      board: url => {
        const m = (url.match(/[?&]month=([^&]+)/) || [])[1], month = MONTHS.includes(decodeURIComponent(m || "")) ? decodeURIComponent(m) : MONTHS[0];
        return ok({ month, months: MONTHS.map(x => ({ month: x })), history: { volumeAnnual, volumePeriods: [], societyAnnual, societyPeriods: [] }, snapshot: snapshot(month) });
      },
      edit: () => ok({ ok: true }),
      mailing: () => ok({ mailing: mailing() }),
      retention: () => ok({ retention: retention() }),
      opps: () => ok({ opportunities: { updated: THRU + "T06:00:00Z", opportunities: OPPS, giftsFrom: giftFrom, recentGifts: RECENT } }),
      ewmc: () => ok({ rows: EW_ROWS, tickets: TICKETS, goal: EW_GOAL }),
      ewmcsave: () => ok({ ok: true })
    };
    return { SERVICES, targets };
  }

  /* ---------- Which flow a request is for (matched against the Hub's own settings) ---------- */
  const ROUTES = [[() => FLOW_URL, "projections"], [() => BOARD_URL, "board"], [() => EDIT_URL, "edit"], [() => MAILING_URL, "mailing"],
    [() => RETENTION_URL, "retention"], [() => OPPS_URL, "opps"], [() => EWMC_READ_URL, "ewmc"], [() => EWMC_WRITE_URL, "ewmcsave"]];
  function routeOf(url) {
    for (const [get, key] of ROUTES) { try { const u = get(); if (u && url.startsWith(u)) return key; } catch (_) {} }
    return null;
  }

  /* ---------- Requests: made-up answers in demo view, and no mixing when switching ---------- */
  const realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = String(input && input.url ? input.url : input), gen = DEMO.gen;
    const isFlow = /powerplatform\.com/i.test(url);
    if (!isFlow) return realFetch(input, init);
    let p;
    if (DEMO.on) {
      const key = routeOf(url), svc = key && DEMO.data.SERVICES[key];
      const out = svc ? svc(url) : { status: 404, body: { error: "This part of the Hub isn't in demo view." } };
      p = new Promise(res => setTimeout(() => res(new Response(JSON.stringify(out.body), { status: out.status, headers: { "Content-Type": "application/json" } })), 250));
    } else p = realFetch(input, init);
    // A reply that arrives after switching views is dropped (it never finishes)
    return p.then(r => gen === DEMO.gen ? r : new Promise(() => {}), e => gen === DEMO.gen ? Promise.reject(e) : new Promise(() => {}));
  };

  /* ---------- Strategic Plan: made-up targets and job titles in demo view ---------- */
  function demoPlan(DT) {
    return {
      goals: [
        { id: "2A", text: `Ask for ${short(DT.g2A)}+ in grants and proposals, individual asks below $10M (MCA asks included)`, target: DT.g2A, kind: "money", calc: l => l.filter(o => !opC4Gift(o) && o.ask < 1e7).reduce((t, o) => t + o.ask, 0) },
        { id: "2A-1", text: `Growth from existing donors: ${DT.g2A1} increased asks over the previous year's giving`, target: DT.g2A1, kind: "count", calc: l => l.filter(o => !opIsC4(o) && /increase/i.test(o.giftType || "")).length },
        { id: "2A-2", text: `High-impact: ${DT.g2A2} more grants or proposals of $10M or more`, target: DT.g2A2, kind: "count", calc: l => l.filter(o => !opIsC4(o) && o.ask >= 1e7).length },
        { id: "2B", text: `First-time or reengaged donors (nothing given in at least two years): ${DT.g2B} grants or proposals`, target: DT.g2B, kind: "count", calc: l => l.filter(o => !opIsC4(o) && opFirstOrReengaged(o)).length },
        { id: "2D", text: `Unrestricted funds for MCA: ask for ${short(DT.g2D)}`, target: DT.g2D, kind: "money", calc: l => l.filter(opIsC4).reduce((t, o) => t + o.ask, 0) }
      ],
      plan: { updated: "2026-11-12", due: "2026-12-31", sections: [
        { n: "1", title: "Raise sufficient funds to fully carry out MCPP mission", goals: [
          { id: "1A", pri: "A", who: "VP of Advancement", live: "in", target: DT.g1A, text: `Raise ${short(DT.g1A)} to meet 2026 MCPP budget`, plan: `Raise ${short(DT.g1A)} to meet 2026 MCPP budget`, prog: 0 },
          { id: "1A-1", pri: "A", who: "MCA Director", live: "c4", target: DT.g1A1, text: `Of that total, ${short(DT.g1A1)} be unrestricted funds for Mackinac Center Action`, plan: `Of that total, ${short(DT.g1A1)} be unrestricted funds for Mackinac Center Action`, prog: 0 },
          { id: "1B", pri: "B", who: "VP of Advancement", live: "in", target: DT.g1B, text: `Raise ${short(DT.g1B)} to meet 2026 vision (stretch goal)`, plan: `Raise ${short(DT.g1B)} to meet 2026 vision (stretch goal)`, prog: 0 }] },
        { n: "2", title: "Increase Major Gift Opportunities", goals: [
          { id: "2A", pri: "A", who: "Team", live: "op:2A", text: `Ask for a total of ${short(DT.g2A)}+ in grants and proposals, with individual asks below $10M`, plan: "Grants and proposals", prog: 0 },
          { id: "2A-1", pri: "A", who: "Team", live: "op:2A-1", text: `Growth from Existing Donors: Of these proposals, ${DT.g2A1} should represent increased asks compared to the previous year’s giving`, plan: "Growth from existing donors", prog: 0, note: "At least $5k increase" },
          { id: "2A-2", pri: "B", who: "Major Gifts Director", live: "op:2A-2", text: `High-Impact Opportunities: Ask for an additional ${DT.g2A2} grants or proposals of $10M or more, not included in the total above`, plan: "High-impact opportunities", prog: 0 },
          { id: "2B", pri: "A", who: "Fundraisers", live: "op:2B", text: `First-Time or Reengaged Donors: Ask for ${DT.g2B} grants or proposals from first-time donors or those who have not given in at least two years`, plan: "First-time or reengaged donors", prog: 0 },
          { id: "2D", pri: "A", who: "MCA Director", live: "op:2D", text: `Unrestricted Funds for MCA: Ask for ${short(DT.g2D)} to support MCA funding priorities`, plan: "Unrestricted funds for MCA", prog: 0 }] }
      ] }
    };
  }
  function applyPlan(on) {
    try {
      if (!DEMO.real) DEMO.real = { plan: SP_PLAN["2026"], goals: OP_GOALS["2026"] };
      if (on) { const d = demoPlan(DEMO.data.targets); SP_PLAN["2026"] = d.plan; OP_GOALS["2026"] = d.goals; }
      else { SP_PLAN["2026"] = DEMO.real.plan; OP_GOALS["2026"] = DEMO.real.goals; }
    } catch (e) { console.error("Demo view: couldn't swap the Strategic Plan", e); }
  }

  /* ---------- Downloads: "DEMO DATA" in PDF footers, "DEMO - " at the start of file names ---------- */
  function wrapExports() {
    if (DEMO.wrapped) return; DEMO.wrapped = true;
    const realFooter = window.footer, realDeliver = window.deliver;
    if (typeof realFooter === "function") window.footer = function (doc, p, total) {
      if (!DEMO.on) return realFooter.apply(this, arguments);
      const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(94, 104, 120);
      doc.text(pdfText(`Printed: ${today()}` + (dataThrough() ? `  |  ${dataThrough()}` : "")), 18, H - 14);
      doc.text("DEMO DATA - made-up names and amounts", W / 2, H - 14, { align: "center" });
      doc.text(`Page ${p} of ${total}`, W - 18, H - 14, { align: "right" });
    };
    if (typeof realDeliver === "function") window.deliver = function (blob, filename, fbId) {
      return realDeliver.call(this, blob, DEMO.on ? "DEMO - " + filename : filename, fbId);
    };
  }

  /* ---------- Clearing what's on screen before switching ---------- */
  function resetHub() {
    const $ = id => document.getElementById(id);
    try { closeDrawer(); closeMenu(); } catch (_) {}
    try { BS.cache = {}; BS.months = []; BS.month = null; BS.history = {}; BS.loading = false; BS.ui.fr = ""; } catch (_) {}
    try { RT.loaded = false; RT.loading = false; RT.fr = ""; RT.open = null; RT.rows = []; } catch (_) {}
    try { MP.loaded = false; MP.loading = false; MP.data = null; } catch (_) {}
    try { OP.loaded = false; OP.loading = false; OP.rows = []; OP.err = ""; OP.frs = new Set(); OP.lastPF = null; OP.dr = null; } catch (_) {}
    try { EW.loaded = false; EW.loading = false; EW.rows = []; EW.openId = null; EW.filter = { search: "", fund: "", lk: "" }; EW.shown = EWMC_PAGE_SIZE; } catch (_) {}
    try { PF.fr = ""; PF.tdSel = null; PF.plSel = null; PF.cbSel = null; PF.plClass = ""; } catch (_) {}
    ["f-search", "f-fundraiser", "rt-fr", "ew-f-search", "ew-f-fund", "ew-f-lk"].forEach(id => { const el = $(id); if (el) el.value = ""; });
    if ($("op-drawer")) $("op-drawer").hidden = true;
    if ($("op-chartwrap")) $("op-chartwrap").classList.remove("dr");
    document.querySelectorAll(".panel").forEach(p => p.hidden = true);
    if ($("status")) $("status").innerHTML = "";
    if ($("loading")) $("loading").hidden = false;
  }

  /* ---------- Turning it on and off ---------- */
  function setDemo(on) {
    let ready = false; try { ready = !!client; } catch (_) {}
    if (!ready || on === DEMO.on) return;
    if (on && !DEMO.data) DEMO.data = build();
    wrapExports();
    const cur = document.querySelector('[data-tab][aria-selected="true"]'), tab = cur && cur.dataset.tab;
    DEMO.on = on; DEMO.gen++;
    applyPlan(on); paint();
    resetHub();
    load();
    // Come back to the tab that was open, once the Hub has loaded
    const g = DEMO.gen, t0 = Date.now();
    const wait = setInterval(() => {
      if (g !== DEMO.gen || Date.now() - t0 > 30000) return clearInterval(wait);
      if (!document.getElementById("loading").hidden) return;
      clearInterval(wait);
      const el = tab && document.querySelector(`[data-tab="${tab}"]`);
      if (el && !el.hidden && tab !== "Overview") selectTab(tab);
    }, 150);
  }

  /* ---------- The button and the gold bar ---------- */
  function paint() {
    const btn = document.getElementById("demo-btn"), bar = document.getElementById("demo-bar");
    if (btn) { btn.textContent = DEMO.on ? "Exit demo view" : "Demo view"; btn.setAttribute("aria-pressed", String(DEMO.on)); }
    if (bar) bar.hidden = !DEMO.on;
    document.title = DEMO.on ? "Advancement Hub (Demo view)" : "Advancement Hub";
  }
  document.addEventListener("DOMContentLoaded", () => {
    if (window.parent === window) return;   // only inside Raiser's Edge, where the Hub runs
    const css = document.createElement("style");
    css.textContent = `.demo-btn{background:none;border:1px solid rgba(255,255,255,.5);color:#fff;border-radius:6px;padding:5px 11px;margin-bottom:12px;font:500 12.5px var(--sans);cursor:pointer;white-space:nowrap}
      .demo-btn:hover{border-color:#fff}.demo-btn[aria-pressed="true"]{background:var(--gold);border-color:var(--gold);color:var(--navy-deep);font-weight:600}
      #demo-bar{display:flex;justify-content:center;align-items:center;gap:14px;flex-wrap:wrap;background:var(--gold);color:var(--ink);padding:7px 14px;font:600 13px var(--sans)}
      #demo-bar button{background:var(--navy-deep);color:#fff;border:0;border-radius:5px;padding:4px 10px;font:600 12.5px var(--sans);cursor:pointer}`;
    document.head.appendChild(css);
    const bar = document.createElement("div");
    bar.id = "demo-bar"; bar.setAttribute("role", "status"); bar.hidden = true;
    bar.innerHTML = `<span>Demo view: every name, place and dollar amount on this page is made up.</span><button type="button">Exit demo view</button>`;
    bar.querySelector("button").onclick = () => setDemo(false);
    document.body.insertBefore(bar, document.body.firstChild);
    const btn = document.createElement("button");
    btn.id = "demo-btn"; btn.type = "button"; btn.className = "demo-btn";
    btn.title = "Show the Hub with made-up data, for presenting";
    btn.onclick = () => setDemo(!DEMO.on);
    const who = document.getElementById("who");
    if (who && who.parentNode) who.parentNode.insertBefore(btn, who);
    paint();
  });
})();
