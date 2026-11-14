/* Eventos de Umami: clics en CV, LinkedIn, GitHub y email (también en enlaces creados por JS) */
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href]');
  if (!a || !window.umami) return;
  var h = a.getAttribute('href') || '';
  var ev = null;
  if (/CV-Juan.*\.pdf$/i.test(h)) ev = 'cv-descarga';
  else if (/^mailto:/i.test(a.href)) ev = 'email';
  else if (/linkedin\.com\/(feed|posts)\//i.test(h)) ev = 'linkedin-post';
  else if (/linkedin\.com\/in\//i.test(h)) ev = 'linkedin-perfil';
  else if (/github\.com\/juancortesp/i.test(h)) ev = 'github';
  if (ev) umami.track(ev, { pagina: location.pathname, destino: a.href.split('?')[0] });
});
