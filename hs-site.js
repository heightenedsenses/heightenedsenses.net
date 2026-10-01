/* Heightened Senses shared site script */
(function(){
  // Navigation background on scroll
  var nav = document.getElementById('main-nav');
  window.addEventListener('scroll', function(){
    if (nav) nav.style.background = window.scrollY > 40 ? 'rgba(4,8,13,.99)' : 'rgba(5,9,14,.97)';
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
    h.addEventListener('click', function(){ h.classList.contains('active') ? close() : open(); });
    o.addEventListener('click', close);
    n.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', close); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && h.classList.contains('active')) { close(); h.focus(); } });
    window.addEventListener('resize', function(){ if (window.innerWidth > 900) close(); });
  }

  // Contact form: preselect requirement type from ?type=
  var sel = document.getElementById('f-type');
  if (sel) {
    var t = new URLSearchParams(location.search).get('type');
    if (t) { for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].text === t) sel.selectedIndex = i; } }
  }

  // Contact form: prepares an email (no server endpoint configured)
  var f = document.getElementById('cform');
  if (!f) return;
  var TO = 'contracts@heightenedsenses.net';
  var checks = [['f-name','Enter your name.'],['f-org','Enter your organization.'],['f-email','Enter a valid work email address.'],['f-type','Select a requirement type.'],['f-msg','Describe the requirement.']];
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
    var subject = 'Requirement: ' + g('f-type') + ' | ' + g('f-org');
    var body = 'Name: ' + g('f-name') + '\nOrganization: ' + g('f-org') + '\nEmail: ' + g('f-email') +
      '\nPhone: ' + (g('f-phone') || 'Not provided') + '\nTimeframe: ' + (g('f-time') || 'Not provided') +
      '\nRequirement type: ' + g('f-type') + '\n\nRequirement summary:\n' + g('f-msg') + '\n';
    window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    st.textContent = 'Your email application should open with this message drafted. It is not sent until you send it there. If nothing opened, email ' + TO + ' or call (443) 944-5958. Your entries remain on this page.';
  });
})();
