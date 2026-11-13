/* GA4 + Consent Mode v2 con banner propio (ES/EN).
   Cambia GA_ID por tu ID de medición. Sin consentimiento: solo pings sin cookies. */
(function () {
  var GA_ID = 'G-XXXXXXXXXX';
  var KEY = 'jc_consent'; // 'granted' | 'denied'
  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX') return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}

  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: saved === 'granted' ? 'granted' : 'denied',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('js', new Date());
  gtag('config', GA_ID);

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  var en = (document.documentElement.lang || '').slice(0, 2) === 'en';
  var T = en
    ? { msg: 'I use Google Analytics cookies to see how the site is used. Nothing for ads.', ok: 'Accept', no: 'Reject', link: 'Cookies' }
    : { msg: 'Uso cookies de Google Analytics para saber cómo se usa la web. Nada de publicidad.', ok: 'Aceptar', no: 'Rechazar', link: 'Cookies' };

  function set(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    gtag('consent', 'update', { analytics_storage: v });
    var b = document.getElementById('jc-cookies');
    if (b) b.remove();
  }

  function banner() {
    if (document.getElementById('jc-cookies')) return;
    var b = document.createElement('div');
    b.id = 'jc-cookies';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookies');
    b.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;z-index:9999;background:#fff;color:#111;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.12);padding:14px 16px;font:14px/1.45 Inter,system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:10px;align-items:center';
    var p = document.createElement('span');
    p.style.cssText = 'flex:1 1 260px';
    p.textContent = T.msg;
    function btn(label, primary, v) {
      var x = document.createElement('button');
      x.type = 'button';
      x.textContent = label;
      x.style.cssText = 'cursor:pointer;font:inherit;font-weight:600;padding:8px 14px;border-radius:8px;border:1px solid ' + (primary ? '#111;background:#111;color:#fff' : '#d1d5db;background:#fff;color:#111');
      x.onclick = function () { set(v); };
      return x;
    }
    b.appendChild(p);
    b.appendChild(btn(T.no, false, 'denied'));
    b.appendChild(btn(T.ok, true, 'granted'));
    document.body.appendChild(b);
  }

  function init() {
    if (saved !== 'granted' && saved !== 'denied') banner();
    var f = document.querySelector('footer .wrap') || document.querySelector('footer');
    if (f) {
      var a = document.createElement('a');
      a.href = '#';
      a.textContent = T.link;
      a.onclick = function (e) { e.preventDefault(); banner(); };
      f.appendChild(a);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
