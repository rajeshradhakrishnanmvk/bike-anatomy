/* Chat with the bike. Vanilla JS, zero dependencies, no API key in the page.
   The bike answers in the first person from bikes/<slug>/persona.json.
   Live answers come from a rate-limited endpoint on Rajesh's VPS, which adds the
   model key on the server. When that endpoint is slow, busy or down, the bike
   answers from the same facts with a simple keyword match ("quick facts" mode).

   Use on any page:
     <link rel="stylesheet" href="css/chat.css">
     <script src="js/chat.js" defer></script>            (reads ?slug=)
   or, from a page in a subfolder:
     <script src="../../js/chat.js" data-bike="model-r" data-root="../../" defer></script>
   Links with data-chat-open="<slug>" open the panel. A #chat hash opens it on load. */
(function () {
  "use strict";

  var me = document.currentScript || document.querySelector('script[src$="chat.js"]');
  var cfg = (me && me.dataset) || {};
  var params = new URLSearchParams(window.location.search);
  var slug = cfg.bike || params.get("slug") || "";
  var root = cfg.root || "";
  var ENDPOINT = window.BIKE_CHAT_ENDPOINT || cfg.endpoint ||
    "https://chat.srv1536099.hstgr.cloud/bike/v1/chat/completions";
  var FIRST_TOKEN_MS = 20000;
  var TOTAL_MS = 75000;
  var COOLDOWN_MS = 60000;
  var KEEP = 12;
  var SEND = 6;

  if (!/^[a-z0-9-]{1,40}$/.test(slug)) return;

  var persona = null;
  var history = [];
  var busy = false;
  var offlineUntil = params.get("chat") === "offline" ? Infinity : 0;
  var ui = {};
  var store = "bike-chat:" + slug;

  try { history = JSON.parse(sessionStorage.getItem(store) || "[]") || []; } catch (e) { history = []; }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, String(attrs[k]));
    });
    (kids || []).forEach(function (kid) {
      if (kid != null) n.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    });
    return n;
  }

  function save() {
    history = history.slice(-KEEP);
    try { sessionStorage.setItem(store, JSON.stringify(history)); } catch (e) { /* private mode */ }
  }

  /* ---------- quick facts mode ---------- */
  var STOP = "a an and are as at be but by can did do does for from had has have how i in is it its me my of on or so tell that the their them then there these they this to was were what when where which who why will with you your yours about".split(" ");
  function words(text) {
    return (text.toLowerCase().match(/[a-z0-9$'-]+/g) || []).filter(function (w) {
      return STOP.indexOf(w) < 0;
    });
  }
  function quickAnswer(question) {
    var facts = (persona && persona.facts) || [];
    var q = question.toLowerCase();
    var qw = words(question);
    var scored = facts.map(function (f, i) {
      var s = 0;
      (f.k || []).forEach(function (k) {
        k = String(k).toLowerCase();
        if (k.indexOf(" ") >= 0 ? q.indexOf(k) >= 0 : qw.indexOf(k) >= 0) s += 3;
      });
      words(f.a || "").forEach(function (w) { if (w.length > 4 && qw.indexOf(w) >= 0) s += 1; });
      return { s: s, i: i };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    if (!scored.length) {
      var any = facts.length ? facts[Math.floor(Math.random() * facts.length)].a : "";
      return "I don't know that one from my notes." + (any ? " Here's something I do know: " + any : "");
    }
    var out = [facts[scored[0].i].a];
    if (scored[1] && scored[1].s >= scored[0].s && out.join(" ").length < 260) out.push(facts[scored[1].i].a);
    return out.join(" ");
  }

  /* ---------- live mode ---------- */
  function live(onToken) {
    var ctrl = new AbortController();
    var gotToken = false;
    var timer = setTimeout(function () { ctrl.abort(); }, FIRST_TOKEN_MS);
    var total = setTimeout(function () { ctrl.abort(); }, TOTAL_MS);
    var msgs = history.slice(-SEND).map(function (m) { return { role: m.role, content: m.content.slice(0, 500) }; });
    function done() { clearTimeout(timer); clearTimeout(total); }
    return fetch(ENDPOINT, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bike: slug, stream: true, max_tokens: 180, messages: msgs }),
      signal: ctrl.signal
    }).then(function (res) {
      if (res.status === 429) offlineUntil = Date.now() + COOLDOWN_MS;
      if (!res.ok || !res.body) throw new Error("status " + res.status);
      var reader = res.body.getReader();
      var dec = new TextDecoder();
      var buf = "";
      var text = "";
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return text;
          buf += dec.decode(r.value, { stream: true });
          var lines = buf.split("\n");
          buf = lines.pop();
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.indexOf("data:") !== 0) continue;
            var data = line.slice(5).trim();
            if (data === "[DONE]") return text;
            var j;
            try { j = JSON.parse(data); } catch (e) { continue; }
            if (j.error) throw new Error("stream error");
            var t = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
            if (t) {
              if (!gotToken) { gotToken = true; clearTimeout(timer); }
              text += t;
              onToken(text);
            }
          }
          return pump();
        });
      }
      return pump();
    }).then(function (text) {
      done();
      text = String(text || "").replace(/\*[^*]{1,40}\*/g, "").trim();
      if (!text) throw new Error("empty");
      return text;
    }, function (err) { done(); throw err; });
  }

  /* ---------- UI ---------- */
  function bubble(role, text, note) {
    var b = el("div", { class: "bc-msg bc-" + role }, [el("p", null, [text])]);
    if (note) b.appendChild(el("p", { class: "bc-note" }, [note]));
    ui.log.appendChild(b);
    ui.log.scrollTop = ui.log.scrollHeight;
    return b;
  }

  function setMode(mode) {
    ui.mode.textContent = mode === "live" ? "Live" : mode === "quick" ? "Quick facts" : "Thinking…";
    ui.mode.className = "bc-mode bc-mode-" + mode;
  }

  function ask(question) {
    question = String(question || "").replace(/\s+/g, " ").trim().slice(0, 400);
    if (!question || busy || !persona) return;
    busy = true;
    ui.send.disabled = true;
    ui.starters.hidden = true;
    bubble("user", question);
    history.push({ role: "user", content: question });
    save();
    var b = bubble("bike", "…");
    b.classList.add("bc-wait");
    var p = b.firstChild;

    function finish(text, quick) {
      p.textContent = text;
      b.classList.remove("bc-wait");
      if (quick) {
        b.appendChild(el("p", { class: "bc-note" }, ["Quick facts mode: the live chat is busy or resting, so I'm answering straight from my notes."]));
      }
      history.push({ role: "assistant", content: text });
      save();
      setMode(quick ? "quick" : "live");
      busy = false;
      ui.send.disabled = false;
      ui.log.scrollTop = ui.log.scrollHeight;
      ui.input.focus();
    }

    if (Date.now() < offlineUntil) { finish(quickAnswer(question), true); return; }
    setMode("wait");
    live(function (partial) {
      p.textContent = partial;
      b.classList.remove("bc-wait");
      ui.log.scrollTop = ui.log.scrollHeight;
    }).then(function (text) { finish(text, false); }, function () { finish(quickAnswer(question), true); });
  }

  function build() {
    ui.panel = el("aside", { class: "bc-panel", id: "bike-chat", role: "dialog", "aria-modal": "false", "aria-labelledby": "bc-title", hidden: "" });
    ui.mode = el("span", { class: "bc-mode bc-mode-live" }, ["Live"]);
    ui.close = el("button", { type: "button", class: "bc-close", "aria-label": "Close chat" }, ["×"]);
    ui.log = el("div", { class: "bc-log", role: "log", "aria-live": "polite" });
    ui.starters = el("div", { class: "bc-starters", "aria-label": "Starter questions" });
    ui.input = el("input", { type: "text", class: "bc-input", maxlength: "400", autocomplete: "off", "aria-label": "Your question", placeholder: "Ask me anything about myself…" });
    ui.send = el("button", { type: "submit", class: "btn btn-primary bc-send" }, ["Ask"]);
    ui.form = el("form", { class: "bc-form" }, [ui.input, ui.send]);
    ui.panel.appendChild(el("div", { class: "bc-head" }, [
      el("div", null, [
        el("p", { class: "bc-kicker" }, ["Chat with the bike"]),
        el("h2", { id: "bc-title" }, [persona.name + " · " + persona.years])
      ]),
      ui.mode, ui.close
    ]));
    ui.panel.appendChild(ui.log);
    ui.panel.appendChild(ui.starters);
    ui.panel.appendChild(ui.form);
    ui.panel.appendChild(el("p", { class: "bc-foot" }, ["Answers stay inside this bike's research notes. A small model can still slip, so check the plates."]));

    ui.launch = el("button", { type: "button", class: "bc-launch", "aria-controls": "bike-chat", "aria-expanded": "false" }, ["Chat with your bike"]);
    document.body.appendChild(ui.panel);
    document.body.appendChild(ui.launch);

    bubble("bike", persona.greeting || ("Hello, I'm the " + persona.name + ". Ask me about myself."));
    history.forEach(function (m) { bubble(m.role === "user" ? "user" : "bike", m.content); });
    (persona.starters || []).slice(0, 4).forEach(function (q) {
      var chip = el("button", { type: "button", class: "bc-chip" }, [q]);
      chip.addEventListener("click", function () { ask(q); });
      ui.starters.appendChild(chip);
    });
    if (history.length) ui.starters.hidden = true;

    ui.launch.addEventListener("click", function () { ui.panel.hidden ? open() : close(); });
    ui.close.addEventListener("click", close);
    ui.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = ui.input.value;
      ui.input.value = "";
      ask(q);
    });
    ui.panel.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-chat-open]");
      if (a && a.getAttribute("data-chat-open") === slug) { e.preventDefault(); open(); }
    });
  }

  function open() {
    ui.panel.hidden = false;
    ui.launch.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("bc-open");
    ui.log.scrollTop = ui.log.scrollHeight;
    ui.input.focus();
  }
  function close() {
    ui.panel.hidden = true;
    ui.launch.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("bc-open");
    ui.launch.focus();
  }

  fetch(root + "bikes/" + slug + "/persona.json").then(function (r) {
    if (!r.ok) throw new Error("no persona");
    return r.json();
  }).then(function (p) {
    if (!p || !p.name || !p.facts) return;
    persona = p;
    build();
    if (window.location.hash === "#chat") open();
  }).catch(function () { /* no persona yet: no chat on this page */ });
})();
