const state = {
  tours: [
    {id:'mount-ridge',title:'Mount Ridge Hike',tags:['hike'],difficulty:'Moderate',price:2500,duration:'4 hours',group:12,thumb:'https://via.placeholder.com/640x360?text=Mount+Ridge',summary:'Half-day hike with panoramic views.'},
    {id:'birdwatch',title:'Birdwatch & Breakfast',tags:['birds'],difficulty:'Easy',price:1800,duration:'3 hours',group:10,thumb:'https://via.placeholder.com/640x360?text=Birdwatch',summary:'Early morning guided birdwatching.'},
    {id:'eco-retreat',title:'Weekend Eco-lodge Retreat',tags:['lodges'],difficulty:'Easy',price:12500,duration:'2 nights',group:6,thumb:'https://via.placeholder.com/640x360?text=Eco+Lodge',summary:'Solar-powered lodge with workshops.'},
    {id:'river-camp',title:'River Camping Experience',tags:['camp'],difficulty:'Moderate',price:4800,duration:'1 night',group:8,thumb:'https://via.placeholder.com/640x360?text=River+Camp',summary:'Riverside camp with guided night walk.'}
  ],
  gallery: [
    {id:1,category:'hike',caption:'Ridge trail at dawn',src:'https://via.placeholder.com/800x600?text=Trail+1'},
    {id:2,category:'birds',caption:'Rare sunbird sighting',src:'https://via.placeholder.com/800x600?text=Bird+1'},
    {id:3,category:'lodges',caption:'Eco-lodge veranda',src:'https://via.placeholder.com/800x600?text=Lodge+1'},
    {id:4,category:'hike',caption:'Forest canopy',src:'https://via.placeholder.com/800x600?text=Trail+2'},
    {id:5,category:'birds',caption:'Wetland waders',src:'https://via.placeholder.com/800x600?text=Bird+2'}
  ],
  posts: Array.from({length:9}).map((_,i)=>({
    id:`post-${i+1}`,
    title:`Sustainable Travel Tips #${i+1}`,
    excerpt:'Practical tips to reduce your footprint while exploring natural places. Learn about packing, water, and responsible interactions.',
    date:`2025-0${(i%9)+1}-10`,
    author:'GreenScape Team'
  }))
};

function qs(sel, parent=document){return parent.querySelector(sel)}
function qsa(sel, parent=document){return Array.from(parent.querySelectorAll(sel))}

document.addEventListener('DOMContentLoaded',()=>{
  initTheme();
  initYear();
  initNavToggle();
  initHeroControls();
  initNewsletter();
  populateToursPreview();
  initToursPage();
  initBookingPage();
  initGallery();
  initBlog();
  initContact();
  initAdmin();
});

function initTheme(){
  const toggles = qsa('#theme-toggle, #theme-toggle-2, #theme-toggle-3, #theme-toggle-4');
  const current = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  setTheme(current);
  toggles.forEach(t=>t.addEventListener('click',()=>{
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }));
}
function setTheme(name){
  document.documentElement.setAttribute('data-theme', name === 'dark' ? 'dark' : 'light');
  localStorage.setItem('theme', name);
  qsa('#theme-toggle, #theme-toggle-2, #theme-toggle-3, #theme-toggle-4').forEach(b=>{
    b.textContent = name === 'dark' ? 'Dark' : 'Light';
    b.setAttribute('aria-pressed', name === 'dark');
  });
}

function initYear(){const y = new Date().getFullYear(); const el = qs('#year'); if(el) el.textContent = y}

function initNavToggle(){
  const btn = qs('#nav-toggle'); const list = qs('#nav-list');
  if(!btn) return;
  btn.addEventListener('click',()=>{
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    list.style.display = expanded ? '' : 'flex';
  });
}

function initHeroControls(){
  const wrap = qs('#testimonials');
  if(!wrap) return;
  let idx=0; setInterval(()=>{
    const items = qsa('.testimonial', wrap);
    if(!items.length) return;
    items.forEach((it,i)=>it.style.transform=`translateY(${(i-idx)*110}%)`);
    idx = (idx+1)%items.length;
  },4500);
}

function initNewsletter(){
  const form = qs('#newsletter-form'); if(!form) return;
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const email = qs('#newsletter-email').value.trim();
    if(!email) return;
    localStorage.setItem('newsletter', JSON.stringify({email,at:new Date().toISOString()}));
    qs('#newsletter-email').value='';
    const res = qs('#newsletter-form .result') || document.createElement('div');
    res.className='result'; res.textContent='Subscription saved. Thank you.';
    form.appendChild(res);
  });
}

/* Tours preview population */
function populateToursPreview(){
  const container = qs('#tour-list'); if(!container) return;
  state.tours.forEach(t=>{
    const article = document.createElement('article'); article.className='tour';
    article.innerHTML = `<img src="${t.thumb}" alt="${t.title}"><h3>${t.title}</h3><p>${t.summary}</p><div class="tour-meta"><span>Duration: ${t.duration}</span><span>Group: up to ${t.group}</span></div><a class="btn" href="booking.html?tour=${t.id}">Book</a>`;
    container.appendChild(article);
  });
}

/* Tours page controls */
function initToursPage(){
  const grid = qs('#tours-grid'); if(!grid) return;
  const search = qs('#tour-search'); const diff = qs('#difficulty-filter'); const price = qs('#price-filter'); const priceOut = qs('#price-output');
  function render(items){
    grid.innerHTML = items.map(t=>`<article class="tour"><img src="${t.thumb}" alt="${t.title}"><h3>${t.title}</h3><p>${t.summary}</p><div class="tour-meta"><span>${t.difficulty}</span><span>KES ${t.price}</span></div><a class="btn" href="booking.html?tour=${t.id}">Book</a></article>`).join('');
  }
  render(state.tours);
  search?.addEventListener('input', ()=>filter());
  diff?.addEventListener('change', ()=>filter());
  price?.addEventListener('input', ()=>{priceOut.textContent = `KES ${price.value}`; filter()});
  function filter(){
    const q = search.value.toLowerCase();
    const d = diff.value;
    const p = Number(price.value);
    const out = state.tours.filter(t=>{
      return (t.title.toLowerCase().includes(q)||t.summary.toLowerCase().includes(q)) && (!d || t.difficulty===d) && t.price<=p;
    });
    render(out);
  }
}

/* Booking page */
function initBookingPage(){
  const form = qs('#booking-form'); if(!form) return;
  const tourSelect = qs('#booking-tour');
  state.tours.forEach(t=>{
    const opt = document.createElement('option'); opt.value=t.id; opt.textContent=`${t.title} — KES ${t.price}`; tourSelect.appendChild(opt);
  });
  const params = new URLSearchParams(location.search);
  if(params.get('tour')) tourSelect.value = params.get('tour');

  form.addEventListener('input', updateSummary);
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const data = {
      tour:qs('#booking-tour').value,
      date:qs('#booking-date').value,
      count:Number(qs('#booking-count').value),
      name:qs('#guest-name').value.trim(),
      phone:qs('#guest-phone').value.trim(),
      email:qs('#guest-email').value.trim(),
      method:qs('#payment-method').value,
      notes:qs('#booking-notes').value.trim(),
      at:new Date().toISOString()
    };
    if(!data.tour||!data.date||!data.name) {qs('#booking-result').textContent='Please complete required fields.';return}
    const bookings = JSON.parse(localStorage.getItem('bookings')||'[]');
    bookings.unshift(data);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    qs('#booking-result').textContent = 'Booking received. Confirmation will be sent to your email (demo).';
    form.reset(); updateSummary();
  });
  qs('#save-draft')?.addEventListener('click', ()=>{
    const draft = {tour:qs('#booking-tour').value,date:qs('#booking-date').value,count:qs('#booking-count').value,name:qs('#guest-name').value,phone:qs('#guest-phone').value,email:qs('#guest-email').value,notes:qs('#booking-notes').value,at:new Date().toISOString()};
    localStorage.setItem('booking-draft', JSON.stringify(draft));
    qs('#booking-result').textContent='Draft saved locally.';
  });
  const draft = JSON.parse(localStorage.getItem('booking-draft')||'null');
  if(draft){
    qs('#booking-tour').value = draft.tour || '';
    qs('#booking-date').value = draft.date || '';
    qs('#booking-count').value = draft.count || 2;
    qs('#guest-name').value = draft.name || '';
    qs('#guest-phone').value = draft.phone || '';
    qs('#guest-email').value = draft.email || '';
    qs('#booking-notes').value = draft.notes || '';
  }
  function updateSummary(){
    const tour = state.tours.find(t=>t.id===qs('#booking-tour').value);
    const count = Number(qs('#booking-count').value) || 1;
    const container = qs('#summary-content');
    if(!tour){container.innerHTML = '<p>Select a tour to see summary.</p>';return}
    const total = tour.price * count;
    container.innerHTML = `<p><strong>${tour.title}</strong></p><p>Participants: ${count}</p><p>Price per person: KES ${tour.price}</p><p><strong>Total: KES ${total}</strong></p>`;
  }
  updateSummary();
}

/* Gallery */
function initGallery(){
  const grid = qs('#gallery-grid'); if(!grid) return;
  const filter = qs('#gallery-filter'); const search = qs('#gallery-search');
  function render(items){
    grid.innerHTML = items.map(g=>`<figure class="gallery-tile"><img loading="lazy" src="${g.src}" alt="${g.caption}"><figcaption class="gallery-caption">${g.caption}</figcaption></figure>`).join('');
  }
  render(state.gallery);
  filter?.addEventListener('change', ()=>apply());
  search?.addEventListener('input', ()=>apply());
  function apply(){
    const f = filter.value;
    const q = search.value.toLowerCase();
    const out = state.gallery.filter(g=> (f==='all' || g.category===f) && g.caption.toLowerCase().includes(q));
    render(out);
  }
}

/* Blog */
function initBlog(){
  const list = qs('#blog-list'); if(!list) return;
  const per = 3; let page = 1;
  function renderPage(p){
    page = p;
    const start = (p-1)*per;
    const slice = state.posts.slice(start,start+per);
    list.innerHTML = slice.map(post=>`<article class="post"><h3>${post.title}</h3><p class="muted">${post.date} • ${post.author}</p><p>${post.excerpt}</p><a class="btn" href="#">Read more</a></article>`).join('');
    renderPagination();
  }
  function renderPagination(){
    const total = Math.ceil(state.posts.length/per);
    const nav = qs('#blog-pagination');
    nav.innerHTML = Array.from({length:total}).map((_,i)=>`<button class="btn ${i+1===page?'active':''}" data-p="${i+1}">${i+1}</button>`).join(' ');
    qsa('#blog-pagination button').forEach(b=>b.addEventListener('click',()=>renderPage(Number(b.dataset.p))));
  }
  renderPage(1);
}

/* Contact */
function initContact(){
  const form = qs('#contact-form'); if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const data = {name:qs('#contact-name').value,email:qs('#contact-email').value,phone:qs('#contact-phone').value,message:qs('#contact-message').value,at:new Date().toISOString()};
    const messages = JSON.parse(localStorage.getItem('messages')||'[]');
    messages.unshift(data);
    localStorage.setItem('messages',JSON.stringify(messages));
    qs('#contact-result').textContent = 'Message sent (demo). We will respond shortly.';
    form.reset();
  });
}

/* Admin */
function initAdmin(){
  const bookingsEl = qs('#admin-bookings'); const toursEl = qs('#admin-tours'); const addBtn = qs('#add-tour');
  if(!bookingsEl && !toursEl) return;
  function renderBookings(){
    const bookings = JSON.parse(localStorage.getItem('bookings')||'[]');
    bookingsEl.innerHTML = bookings.length ? bookings.map(b=>`<div><strong>${b.name}</strong> — ${b.tour} • ${b.date} • ${b.phone}</div>`).join('') : '<p>No bookings yet.</p>';
  }
  function renderTours(){
    toursEl.innerHTML = state.tours.map(t=>`<div><strong>${t.title}</strong><div class="muted">KES ${t.price} • ${t.duration}</div></div>`).join('');
  }
  addBtn?.addEventListener('click', ()=>{
    const newTour = {id:`sample-${Date.now()}`,title:'New Sample Tour',tags:['sample'],difficulty:'Easy',price:999,duration:'3 hours',group:10,thumb:'https://via.placeholder.com/640x360?text=New',summary:'Sample.'};
    state.tours.push(newTour);
    renderTours();
  });
  renderBookings();
  renderTours();
}

/* Utility */
(function simpleSearch(){
  const searchInputs = qsa('input[type="search"]');
  searchInputs.forEach(inp=>{
    inp.addEventListener('keydown', e=>{
      if(e.key==='Enter') e.preventDefault();
    });
  });
})();
