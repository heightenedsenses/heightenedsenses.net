/* Heightened Senses shared site script */
(function(){
  // Navigation background on scroll
  var nav = document.getElementById('main-nav');
  window.addEventListener('scroll', function(){
    if (nav) nav.style.background = window.scrollY > 40 ? 'rgba(7,13,20,.99)' : 'rgba(7,13,20,.97)';
  }, {passive:true});

  // Mobile menu
  var h = document.querySelector('.nav-hamburger'), n = document.querySelector('.nav-links');
  if (h && n) {
    var o = document.createElement('div'); o.className = 'nav-overlay'; document.body.appendChild(o);
    var close = function(){
      h.classList.remove('active'); n.classList.remove('active'); o.classList.remove('active');
      h.setAttribute('aria-expanded','false'); h.setAttribute('aria-label','Open navigation menu');
      document.body.style.overflow = '';
      setTimeout(function(){ o.style.display = 'none'; }, 300);
    };
    var open = function(){
      h.classList.add('active'); n.classList.add('active');
      h.setAttribute('aria-expanded','true'); h.setAttribute('aria-label','Close navigation menu');
      o.style.display = 'block'; void o.offsetHeight; o.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    h.addEventListener('click', function(){
      if (h.classList.contains('active')) { close(); }
      else { open(); var first = n.querySelector('a'); if (first) first.focus(); }
    });
    o.addEventListener('click', close);
    n.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', close); });
    document.addEventListener('keydown', function(e){
      if (!h.classList.contains('active')) return;
      if (e.key === 'Escape') { close(); h.focus(); return; }
      if (e.key === 'Tab') {
        // keep focus inside the open menu (toggle button plus menu links)
        var items = [h].concat([].slice.call(n.querySelectorAll('a')));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    // close when tapping outside the menu panel
    document.addEventListener('click', function(e){
      if (h.classList.contains('active') && !n.contains(e.target) && !h.contains(e.target)) close();
    });
    window.addEventListener('resize', function(){ if (window.innerWidth >= 1180) close(); });
  }

  // Counter-UAS section tabs: keep the current tab in view and drop the edge fade at the end of the row
  var sw = document.querySelector('.subnav .wrap');
  if (sw) {
    var cur = sw.querySelector('[aria-current="page"]');
    if (cur && sw.scrollWidth > sw.clientWidth) sw.scrollLeft = Math.max(0, cur.offsetLeft - 16);
    var edge = function(){ sw.classList.toggle('at-end', sw.scrollLeft + sw.clientWidth >= sw.scrollWidth - 4); };
    sw.addEventListener('scroll', edge, {passive:true}); window.addEventListener('resize', edge); edge();
  }

  // Contact form: preselect requirement type from ?type=
  var sel = document.getElementById('f-type');
  if (sel) {
    var t = new URLSearchParams(location.search).get('type');
    if (t) { for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].text === t) sel.selectedIndex = i; } }
  }

  // Copy buttons (vendor identifiers)
  document.querySelectorAll('button.copy[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      var v = b.getAttribute('data-copy'), done = function(){ var t = b.textContent; b.textContent = 'Copied'; setTimeout(function(){ b.textContent = t; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function(){}); });
  });

  // Contact form: prepares an email (no server endpoint configured)
  var f = document.getElementById('cform');
  if (!f) return;
  var TO = 'contracts@heightenedsenses.net';
  var checks = [['f-name','Enter your name.'],['f-org','Enter your organization.'],['f-email','Enter a valid work email address.'],['f-type','Select a requirement type.'],['f-msg','Describe the mission or requirement.']];
  f.addEventListener('submit', function(e){
    e.preventDefault();
    var first = null;
    checks.forEach(function(c){
      var el = document.getElementById(c[0]), err = document.getElementById(c[0] + '-err'), v = el.value.trim();
      var bad = !v || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      err.textContent = bad ? c[1] : '';
      if (bad && !first) first = el;
    });
    var st = document.getElementById('fstat');
    if (first) { st.textContent = 'Please correct the highlighted fields.'; first.focus(); return; }
    var g = function(id){ return document.getElementById(id).value.trim(); };
    var opt = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    var subject = 'Requirement: ' + g('f-type') + ' | ' + g('f-org') + (opt('f-sol') ? ' | ' + opt('f-sol') : '');
    var body = 'Name: ' + g('f-name') + '\nOrganization: ' + g('f-org') + '\nEmail: ' + g('f-email') +
      '\nPhone: ' + (g('f-phone') || 'Not provided') +
      '\n\nRequirement type: ' + g('f-type') + '\nSolicitation / RFI / RFQ: ' + (opt('f-sol') || 'None') +
      '\nTimeframe: ' + (g('f-time') || 'Not provided') + '\nOperating environment: ' + (opt('f-env') || 'Not provided') +
      '\nKnown constraints: ' + (opt('f-con') || 'Not provided') + '\n\nMission or requirement:\n' + g('f-msg') + '\n';
    window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    st.textContent = 'Your email application should open with this message drafted. It is not sent until you send it there. If nothing opened, email ' + TO + ' or call (910) 240-2901. Your entries remain on this page.';
  });
})();
