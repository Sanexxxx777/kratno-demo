(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // stagger reveal
  var batch = [];
  var flush;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      batch.push(e.target);
      io.unobserve(e.target);
    });
    if (batch.length && !flush) {
      flush = requestAnimationFrame(function () {
        batch.forEach(function (el, i) {
          el.style.transitionDelay = reduce ? '0s' : (i * 90) + 'ms';
          el.classList.add('in');
        });
        batch = [];
        flush = null;
      });
    }
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // number counters
  function tween(el) {
    var text = el.textContent;
    var m = text.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return;
    var raw = m[1];
    var comma = raw.indexOf(',') > -1;
    var target = parseFloat(raw.replace(',', '.'));
    var decimals = (raw.split(/[.,]/)[1] || '').length;
    var start = null, dur = 1000;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      if (comma) val = val.replace('.', ',');
      el.textContent = text.replace(raw, val);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) {
    var seen = new WeakSet();
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !seen.has(e.target)) {
          seen.add(e.target);
          tween(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stat b, .hero-chip b, .case-card__nums b, .nums b').forEach(function (el) { cio.observe(el); });
  }

  // header shadow
  var head = document.querySelector('.site-head');
  if (head) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (es) {
      head.classList.toggle('scrolled', !es[0].isIntersecting);
    }).observe(sentinel);
  }
})();
