/* =====================================================================
   AdLift — Spot the Lie · Win the Prize
   Behaviour: quiz interaction, entry modal + validation, prize showcase
   ===================================================================== */
(function(){
  "use strict";

  /* ---- content: the six statements (one is the lie: B) ----
     Each statement is split into segments; segments marked hot:true
     render the number/phrase in AdLift orange, matching the standee. */
  var STATEMENTS = [
    { letter:"A", segs:[ {t:"68%",hot:true}, {t:" of Google searches now end without a click."} ] },
    { letter:"B", segs:[ {t:"To get cited by ChatGPT, your page must "}, {t:"rank #1",hot:true}, {t:" on Google."} ] },
    { letter:"C", segs:[ {t:"Traffic from AI search features converts at a rate "}, {t:"4.4×",hot:true}, {t:" higher than organic search traffic."} ] },
    { letter:"D", segs:[ {t:"Over "}, {t:"80%",hot:true}, {t:" of sources cited in Google AI Overviews don’t rank in the organic top 3."} ] },
    { letter:"E", segs:[ {t:"A page can be cited in an AI Overview even if it doesn’t rank in Google’s "}, {t:"Top 100",hot:true}, {t:"."} ] },
    { letter:"F", segs:[ {t:"87%",hot:true}, {t:" of U.S. adults now read the AI-generated summaries in their search results."} ]}
  ];

  var state = { selected:null, showForm:false, done:false };

  /* ---- build the statement cards ---- */
  var wrap = document.getElementById("statements");
  STATEMENTS.forEach(function(s, i){
    var card = document.createElement("button");
    card.type = "button";
    card.className = "stmt";
    card.setAttribute("role","radio");
    card.setAttribute("aria-checked","false");
    card.dataset.idx = String(i);
    card.tabIndex = i === 0 ? 0 : -1;

    var ltr = document.createElement("div");
    ltr.className = "ltr";
    ltr.textContent = s.letter;
    card.appendChild(ltr);

    var body = document.createElement("div");
    s.segs.forEach(function(seg){
      var span = document.createElement("span");
      if (seg.hot) span.className = "hot";
      span.textContent = seg.t;
      body.appendChild(span);
    });
    card.appendChild(body);

    card.addEventListener("click", function(){ select(i); });
    wrap.appendChild(card);
  });

  var cards = Array.prototype.slice.call(wrap.querySelectorAll(".stmt"));

  /* keyboard: arrow keys move within the radiogroup */
  wrap.addEventListener("keydown", function(e){
    var idx = cards.indexOf(document.activeElement);
    if (idx === -1) return;
    var next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % cards.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + cards.length) % cards.length;
    if (next !== null){ e.preventDefault(); cards[next].focus(); select(next); }
  });

  var btnSubmit = document.getElementById("btnSubmit");
  var submitHint = document.getElementById("submitHint");

  function select(i){
    state.selected = i;
    cards.forEach(function(c, ci){
      var on = ci === i;
      c.classList.toggle("sel", on);
      c.setAttribute("aria-checked", on ? "true" : "false");
      c.tabIndex = on ? 0 : -1;
    });
    btnSubmit.disabled = false;
    btnSubmit.setAttribute("aria-disabled","false");
    btnSubmit.classList.remove("off");
    submitHint.textContent = "Locked in — you can still change it";
  }

  /* ---- submit answer -> open the entry modal (popup, no layout shift) ---- */
  var entryForm  = document.getElementById("entryForm");
  var modal      = document.getElementById("entryModal");
  var modalClose = document.getElementById("modalClose");
  var lastFocus  = null;

  function openModal(){
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    var first = document.getElementById("f-name");
    if (first && !state.done) setTimeout(function(){ first.focus(); }, 60);
    else modalClose.focus();
  }
  function closeModal(){
    modal.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  btnSubmit.addEventListener("click", function(){
    if (state.selected === null) return;
    openModal();
  });
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", function(e){
    if (e.target && e.target.getAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  /* ---- validation ---- */
  function markField(name, bad){
    var el = entryForm.querySelector('[data-field="'+name+'"]');
    if (el) el.classList.toggle("bad", bad);
  }
  function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isPhone(v){ return (v.replace(/[^\d]/g,"").length >= 7); }

  entryForm.addEventListener("submit", function(e){
    e.preventDefault();
    // spam honeypot: real users never fill this hidden field
    if (document.getElementById("f-website").value) { finish(); return; }
    var f = entryForm;
    var name = f.name.value.trim();
    var email = f.email.value.trim();
    var phone = f.phone.value.trim();
    var company = f.company.value.trim();
    var consent = document.getElementById("f-consent").checked;

    var ok = true;
    markField("name", !name); if (!name) ok = false;
    markField("email", !isEmail(email)); if (!isEmail(email)) ok = false;
    markField("phone", !isPhone(phone)); if (!isPhone(phone)) ok = false;
    markField("company", !company); if (!company) ok = false;
    document.getElementById("consentRow").classList.toggle("bad", !consent);
    if (!consent) ok = false;

    if (!ok){
      var firstBad = f.querySelector(".field.bad input");
      if (firstBad) firstBad.focus();
      return;
    }

    /* ---- entry payload ----
       No backend is wired yet. To make entries live, POST `entry` to your
       endpoint / form service (Formspree, an API route, or a sheet webhook). */
    var entry = {
      name: name, email: email, phone: phone, company: company,
      pickedLetter: STATEMENTS[state.selected].letter,
      pickedIndex: state.selected,
      consent: consent,
      ts: new Date().toISOString()
    };
    // e.g. fetch("/api/enter", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(entry)});
    console.log("Quiz entry (not sent — wire a backend):", entry);

    finish();
  });

  function finish(){
    state.done = true;
    document.getElementById("stepChip").textContent = "DONE";
    entryForm.hidden = true;
    document.getElementById("doneCard").hidden = false;
    modalClose.focus();
  }

  /* share */
  var btnShare = document.getElementById("btnShare");
  if (btnShare){
    btnShare.addEventListener("click", function(){
      var shareData = {
        title: "Spot the Lie · AdLift",
        text: "One of six AI-search stats is false. Can you spot the lie?",
        url: location.href
      };
      if (navigator.share){ navigator.share(shareData).catch(function(){}); }
      else if (navigator.clipboard){
        navigator.clipboard.writeText(location.href).then(function(){
          btnShare.textContent = "Link copied ✓";
        }).catch(function(){});
      }
    });
  }

  /* ---- prize showcase: cinematic AirPods → WHOOP sequence ----
     Each clip plays its full rotation, then a cross-fade (scale + defocus)
     hands off to the other. Timing follows the clips themselves (the 'ended'
     event) with a minimum dwell so neither product feels rushed, and a max
     dwell as a safety net if a clip can't play. */
  var slides  = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var clips   = slides.map(function(s){ return s.querySelector(".clip"); });
  var dots    = Array.prototype.slice.call(document.querySelectorAll(".cdot"));
  var capNames = Array.prototype.slice.call(document.querySelectorAll(".capname"));
  var MIN_DWELL = 3400;   // ms — each product reads as premium, not rushed
  var MAX_DWELL = 8000;   // ms — safety net if 'ended' never fires
  var active = 0, shownAt = 0, timer = null;

  function play(v){ if (v){ try { var p = v.play(); if (p && p.catch) p.catch(function(){}); } catch(e){} } }

  clips.forEach(function(v){
    if (!v) return;
    v.loop = false;
    // if the mp4 is missing/undecodable, hide the video so the photo shows
    v.addEventListener("error", function(){ v.style.display = "none"; });
    // when a clip finishes its rotation, hand off (respecting the min dwell)
    v.addEventListener("ended", function(){
      if (String(active) === v.dataset.idx) scheduleNext();
    });
  });

  function show(n){
    active = n; shownAt = Date.now();
    // slide + label share the same class-toggle and the same transition, so the
    // caption cross-fades in perfect lockstep with the product — never out of sync
    slides.forEach(function(s, i){ s.classList.toggle("is-active", i === n); });
    capNames.forEach(function(c, i){ c.classList.toggle("is-on", i === n); });
    dots.forEach(function(d, i){ d.classList.toggle("on", i === n); });
    var v = clips[n];
    if (v){ try { v.currentTime = 0; } catch(e){} play(v); }
    armSafety();
  }

  function next(){ show(active ? 0 : 1); }

  function scheduleNext(){            // called on 'ended'
    var wait = Math.max(0, MIN_DWELL - (Date.now() - shownAt));
    clearTimeout(timer);
    timer = setTimeout(next, wait);
  }

  function armSafety(){               // fires only if 'ended' never comes
    clearTimeout(timer);
    timer = setTimeout(next, MAX_DWELL);
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function startShowcase(){
    if (!clips[0]) return;
    if (reduce){
      play(clips[0]);                 // gentle: first product only, no auto-switch
    } else if (slides.length > 1){
      shownAt = Date.now();
      play(clips[0]);
      armSafety();
      // autoplay safety: resume on tab focus and on first interaction
      document.addEventListener("visibilitychange", function(){ if (!document.hidden) play(clips[active]); });
      window.addEventListener("pointerdown", function once(){ play(clips[active]); window.removeEventListener("pointerdown", once); }, { passive:true });
    }
  }
  // preload="none" + deferred start: the poster paints first (fast LCP), and the
  // clips only begin loading after the page has painted, so they never block it.
  function deferStart(){
    if ("requestIdleCallback" in window) requestIdleCallback(startShowcase, { timeout:1600 });
    else setTimeout(startShowcase, 250);
  }
  if (document.readyState === "complete") deferStart();
  else window.addEventListener("load", deferStart);
})();
