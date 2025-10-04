
let TERMS = [];
const el = (sel, root=document)=>root.querySelector(sel);
const els = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

async function loadTerms(){
  const res = await fetch('data/terms.json');
  TERMS = await res.json();
  render();
  updateCount();
}

const state = {
  q: '',
  category: 'All',
  bookmarks: new Set(JSON.parse(localStorage.getItem('bookmarks')||'[]'))
};

const categories = ['All','Evaluation','Theory','Technique','Practice','Optimization','Data','Dimensionality','Model','Clustering','RL','DL','NLP','CV','MLOps','Experimentation','Explainability','Ethics','Privacy','Compression','Deployment','Hardware','Automation','Research','Multimodal','Domain','Time Series','Ensemble','Recsys','Pitfall','Math'];

function render(){
  const grid = el('#grid');
  grid.innerHTML='';
  const q = state.q.trim().toLowerCase();
  const cat = state.category;
  let filtered = TERMS.filter(t => (cat==='All' || t.category===cat) && (t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)));
  // Sort alphabetically
  filtered.sort((a,b)=>a.term.localeCompare(b.term));
  for (const t of filtered){
    const card = document.createElement('article');
    card.className='card';
    const icon = '📘';
    card.innerHTML = `
      <div class="top">
        <span class="badge">${t.category}</span>
        <button class="bookmark" data-id="${t.id}" title="Bookmark">${state.bookmarks.has(t.id) ? '★' : '☆'}</button>
      </div>
      <h4><a href="pages/term-${t.id.toString().padStart(3, "0")}-${t.term.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"term"}.html">${t.term}</a></h4>
      <p class="small">${t.definition}</p>
      <div class="example"><strong>Example:</strong> ${t.example}</div>
    `;
    grid.appendChild(card);
  }
  // Bind bookmark buttons
  els('.bookmark', grid).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = Number(btn.dataset.id);
      if (state.bookmarks.has(id)){ state.bookmarks.delete(id); btn.textContent='☆'; }
      else { state.bookmarks.add(id); btn.textContent='★'; }
      localStorage.setItem('bookmarks', JSON.stringify(Array.from(state.bookmarks)));
      updateCount();
    });
  });
}

function updateCount(){
  el('#count').textContent = TERMS.length;
  el('#bmCount').textContent = state.bookmarks.size;
}

function setup(){
  // Build category chips
  const chips = el('#chips');
  for (const c of categories){
    const chip = document.createElement('button');
    chip.className='chip'+(c==='All'?' active':'');
    chip.textContent=c;
    chip.addEventListener('click', ()=>{
      els('.chip', chips).forEach(ch=>ch.classList.remove('active'));
      chip.classList.add('active');
      state.category=c; render();
    });
    chips.appendChild(chip);
  }
  el('#search').addEventListener('input', (e)=>{ state.q=e.target.value; render(); });
  el('#clear').addEventListener('click', ()=>{ el('#search').value=''; state.q=''; render(); });
  el('#showBookmarks').addEventListener('click', ()=>{
    const ids = new Set(state.bookmarks);
    const grid = el('#grid');
    grid.innerHTML='';
    const filtered = TERMS.filter(t=>ids.has(t.id)).sort((a,b)=>a.term.localeCompare(b.term));
    for (const t of filtered){
      const card = document.createElement('article'); card.className='card';
      card.innerHTML = `
        <div class="top">
          <span class="badge">${t.category}</span>
          <button class="bookmark" data-id="${t.id}" title="Bookmark">${state.bookmarks.has(t.id) ? '★' : '☆'}</button>
        </div>
        <h4><a href="pages/term-${t.id.toString().padStart(3, "0")}-${t.term.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"term"}.html">${t.term}</a></h4>
        <p class="small">${t.definition}</p>
        <div class="example"><strong>Example:</strong> ${t.example}</div>
      `;
      grid.appendChild(card);
    }
    els('.chip').forEach(c=>c.classList.remove('active'));
    updateCount();
  });
  el('#quiz').addEventListener('click', openQuiz);
  el('#closeQuiz').addEventListener('click', closeQuiz);
  loadTerms();
}

function openQuiz(){
  // Build a simple 1-question MCQ from random term
  const panel = el('#quizPanel');
  const qTerm = TERMS[Math.floor(Math.random()*TERMS.length)];
  const correct = qTerm.definition;
  let choices = [correct];
  while(choices.length<4){
    const r = TERMS[Math.floor(Math.random()*TERMS.length)].definition;
    if (!choices.includes(r)) choices.push(r);
  }
  // Shuffle
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

document.addEventListener('DOMContentLoaded', setup);

function copyCode(btn){
  const pre = btn.closest('pre.code');
  if(!pre) return;
  const text = pre.innerText;
  navigator.clipboard.writeText(text).then(()=>{
    btn.classList.add('copied'); btn.textContent='Copied';
    setTimeout(()=>{ btn.classList.remove('copied'); btn.textContent='Copy'; }, 1200);
  });
}
