
let TERMS = [];
const el = (sel, root=document)=>root.querySelector(sel);
const els = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

const state = {
  q: '',
  category: 'All',
  bookmarks: new Set(JSON.parse(localStorage.getItem('bookmarks')||'[]'))
};

const categories = ['All','Evaluation','Theory','Technique','Practice','Optimization','Data','Dimensionality','Model','Clustering','RL','DL','NLP','CV','MLOps','Experimentation','Explainability','Ethics','Privacy','Compression','Deployment','Hardware','Automation','Research','Multimodal','Domain','Time Series','Ensemble','Recsys','Pitfall','Math'];

async function loadTerms(){
  const res = await fetch('data/terms.json', {cache:'no-store'});
  TERMS = await res.json();
  buildCategoryChips();
  render();
  updateCount();
}

function slugify(s){
  return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'term';
}

function cardHTML(t){
  const href = `pages/term-${String(t.id).padStart(3,'0')}-${slugify(t.term)}.html`;
  const starred = state.bookmarks.has(t.id) ? '★' : '☆';
  // Entire card wrapped with <a>; bookmark button stops propagation
  return `
  <a class="card card-link" href="${href}" aria-label="Open ${t.term}">
    <div class="top">
      <span class="badge">${t.category}</span>
      <button class="bookmark" data-id="${t.id}" title="Bookmark" onclick="event.preventDefault(); event.stopPropagation(); toggleBookmark(${t.id}, this)">${starred}</button>
    </div>
    <h4>${t.term}</h4>
    <p class="small">${t.definition}</p>
    <div class="example"><strong>Example:</strong> ${t.example}</div>
  </a>`;
}

function toggleBookmark(id, btn){
  if (state.bookmarks.has(id)){ state.bookmarks.delete(id); if(btn) btn.textContent='☆'; }
  else { state.bookmarks.add(id); if(btn) btn.textContent='★'; }
  localStorage.setItem('bookmarks', JSON.stringify(Array.from(state.bookmarks)));
  updateCount();
}

function render(){
  const grid = el('#grid'); if (!grid) return;
  const q = state.q.trim().toLowerCase();
  const cat = state.category;
  let filtered = TERMS.filter(t => (cat==='All' || t.category===cat) && (t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)));
  filtered.sort((a,b)=>a.term.localeCompare(b.term));
  grid.innerHTML = filtered.map(cardHTML).join('');
  // Ensure any nested links work; nothing else needed since <a> handles navigation.
}

function showBookmarks(){
  const grid = el('#grid'); if (!grid) return;
  const ids = new Set(state.bookmarks);
  const filtered = TERMS.filter(t=>ids.has(t.id)).sort((a,b)=>a.term.localeCompare(b.term));
  grid.innerHTML = filtered.map(cardHTML).join('');
}

function updateCount(){
  el('#count') && (el('#count').textContent = TERMS.length);
  el('#bmCount') && (el('#bmCount').textContent = state.bookmarks.size);
}

function buildCategoryChips(){
  const chips = el('#chips'); if (!chips) return;
  if (chips.dataset.built) return;
  chips.dataset.built = '1';
  categories.forEach(c=>{
    const chip = document.createElement('button');
    chip.className='chip'+(c==='All'?' active':'');
    chip.textContent=c;
    chip.addEventListener('click', ()=>{
      els('.chip', chips).forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
      state.category=c; render();
    });
    chips.appendChild(chip);
  });
}

function setup(){
  el('#search')?.addEventListener('input', (e)=>{ state.q=e.target.value; render(); });
  el('#clear')?.addEventListener('click', ()=>{ const s=el('#search'); if(s) s.value=''; state.q=''; render(); });
  el('#showBookmarks')?.addEventListener('click', showBookmarks);
  el('#quiz')?.addEventListener('click', openQuiz);
  el('#closeQuiz')?.addEventListener('click', closeQuiz);
  loadTerms();
}

// --- Quiz (unchanged basic) ---
function openQuiz(){
  if (!TERMS.length) return;
  const panel = el('#quizPanel');
  const qTerm = TERMS[Math.floor(Math.random()*TERMS.length)];
  const correct = qTerm.definition;
  let choices = [correct];
  while(choices.length<4){
    const r = TERMS[Math.floor(Math.random()*TERMS.length)].definition;
    if (!choices.includes(r)) choices.push(r);
  }
  for (let i=choices.length-1; i>0; i--){ const j=Math.floor(Math.random()*(i+1)); [choices[i],choices[j]]=[choices[j],choices[i]]; }
  panel.querySelector('h3').textContent = `What is "${qTerm.term}"?`;
  const ctn = el('#quizChoices'); ctn.innerHTML='';
  choices.forEach(ch=>{
    const btn = document.createElement('button');
    btn.textContent = ch;
    btn.addEventListener('click', ()=>{
      btn.style.borderColor = (ch===correct)? '#10b981':'#ef4444';
      btn.style.background = (ch===correct)? '#ecfdf5':'#fef2f2';
    });
    ctn.appendChild(btn);
  });
  el('#quizModal').style.display='flex';
}
function closeQuiz(){ el('#quizModal').style.display='none'; }

// Copy button helper (used on term pages/book.html)
function copyCode(btn){
  const pre = btn.closest('pre.code');
  if(!pre) return;
  const text = pre.innerText;
  navigator.clipboard.writeText(text).then(()=>{
    btn.classList.add('copied'); btn.textContent='Copied';
    setTimeout(()=>{ btn.classList.remove('copied'); btn.textContent='Copy'; }, 1200);
  });
}

document.addEventListener('DOMContentLoaded', setup);
