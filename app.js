/* =========================================================
   НАСТРОЙКИ — правьте здесь
   ========================================================= */
const CONFIG = {
  // онлайн-бронь ресторана через Яндекс (их собственная система бронирования)
  bookingUrl: 'https://yandex.ru/web-maps/webview?booking%5Bpermalink%5D=160429076914&booking%5Bstandalone%5D=true&mode=booking&source=partner-cta',
  showDemoBadge: false,              // плашка «Демо-версия» — убрать после согласования
  devName: 'Разработчик: Иван',
  devLink: '',                      // например 'https://t.me/your_nick'
  // 0 = воскресенье … 6 = суббота
  hours: [
    ['12:00', '00:00'], // Вс
    ['12:00', '00:00'], // Пн
    ['12:00', '00:00'], // Вт
    ['12:00', '00:00'], // Ср
    ['12:00', '00:00'], // Чт
    ['12:00', '01:00'], // Пт
    ['12:00', '01:00'], // Сб
  ],
};

/* блюда и цены — по данным ресторана на Яндекс Картах */
const MENU = [
  ['Горячие блюда', 'Сахалинский гребешок в трюфельном соусе', 1250],
  ['Горячие блюда', 'Ризотто с аргентинской креветкой и Камчатским крабом', 1100],
  ['Закуски', 'Торнетто из лосося с Камчатским крабом', 1160],
  ['Тар-тары', 'Трио тартар из 3-х видов рыбы', 1360],
  ['Тар-тары', 'Тартар из тунца с соусом маракуйя', 690],
  ['Салаты', 'Большой салат с морепродуктами', 1590],
  ['Салаты', 'Хрустящие баклажаны с томатами', 650],
  ['Суши & роллы', 'Ролл с креветкой и тайским манго', 690],
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rub = n => n.toLocaleString('ru-RU') + ' ₽';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderMenu() {
  $('#menuList').innerHTML = MENU.map(([cat, name, price]) => `
    <div class="mi"><span class="mi__cat">${esc(cat)}</span><span class="mi__name">${esc(name)}</span><span class="mi__price">${rub(price)}</span></div>`).join('');
}

function renderHours() {
  const names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const rows = [];
  [0, 1, 2, 3, 4, 5, 6].forEach(d => {
    const h = CONFIG.hours[d];
    const key = h ? h.join('–') : 'выходной';
    const last = rows[rows.length - 1];
    if (last && last.key === key) last.to = d; else rows.push({ from: d, to: d, key });
  });
  $('#hoursList').innerHTML = rows.map(r => `${names[r.from]}${r.from !== r.to ? '–' + names[r.to] : ''}: ${r.key}`).join('<br>');

  const perm = new Date(Date.now() + (5 * 60 + new Date().getTimezoneOffset()) * 60000);
  const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const now = perm.getHours() * 60 + perm.getMinutes();
  const today = CONFIG.hours[perm.getDay()];
  const yest = CONFIG.hours[(perm.getDay() + 6) % 7];
  let big = 'Закрыто', small = 'откроемся в 12:00', open = false;
  if (yest && toMin(yest[1]) <= toMin(yest[0]) && now < toMin(yest[1])) { open = true; big = 'Открыто'; small = `до ${yest[1]}`; }
  else if (today) {
    const o = toMin(today[0]); let c = toMin(today[1]); if (c <= o) c += 1440;
    if (now >= o && now < c) { open = true; big = 'Открыто'; small = `сегодня до ${today[1]}`; }
  }
  const el = $('#openNow');
  el.textContent = big; el.classList.toggle('is-open', open);
  $('#openNowText').textContent = small;
}

function initBooking() {
  $$('[data-booking]').forEach(a => { a.href = CONFIG.bookingUrl; });
}

function initHeader() {
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-solid', scrollY > innerHeight * 0.75);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  });
}

function initSlides() {
  const imgs = $$('#slides img');
  if (imgs.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove('is-active');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('is-active');
  }, 5500);
}

function initLightbox() {
  const lb = $('#lightbox'), img = $('img', lb);
  ['#rail', '.cocktails__rail', '#spaceGrid'].forEach(sel => $(sel).addEventListener('click', e => {
    if (e.target.tagName !== 'IMG') return;
    img.src = e.target.src; img.alt = e.target.alt; lb.hidden = false;
  }));
  lb.addEventListener('click', () => { lb.hidden = true; });
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });
}

function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  const els = $$('.intro__grid > *, .raw__head, .menu__head, .mi, .menu__visual, .cat, .wine__grid > *, .space__head, .space__grid img, .services, .reviews blockquote, .book__inner, .contacts__grid > *');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
}

function initDemoBadge() {
  const badge = $('#demoBadge');
  if (!CONFIG.showDemoBadge) { badge.remove(); return; }
  const a = $('#devLink');
  a.textContent = CONFIG.devName;
  if (CONFIG.devLink) a.href = CONFIG.devLink;
  $('#demoClose').addEventListener('click', () => { badge.hidden = true; });
}

renderMenu();
renderHours();
initBooking();
initHeader();
initSlides();
initLightbox();
initReveal();
initDemoBadge();
