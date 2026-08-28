const TEAM_SLOTS = [
  ...Array.from({length:9},(_,i)=>({id:`bat${i+1}`, label:`${i+1}番`, type:'bat'})),
  ...Array.from({length:3},(_,i)=>({id:`bench${i+1}`, label:`控え野手${i+1}`, type:'bench'})),
  ...Array.from({length:3},(_,i)=>({id:`starter${i+1}`, label:`先発${i+1}`, type:'pitch'})),
  ...Array.from({length:3},(_,i)=>({id:`relief${i+1}`, label:`中継ぎ${i+1}`, type:'pitch'})),
  {id:'closer1', label:'抑え', type:'pitch'}
];
const FIELD_POSITIONS=['捕手','一塁手','二塁手','三塁手','遊撃手','左翼手','中堅手','右翼手','DH'];
const YEARS = Array.from({length:61},(_,i)=>1965+i);
const state = { passes:3, roster:[], current:[], usedTeamYears:new Set(), assignments:{}, fieldPositions:{}, yearCache:new Map(), playerCache:new Map() };
const $ = s => document.querySelector(s);
const API_BASE = location.protocol === 'file:' ? null : location.origin;
async function apiFetch(path){
  if(!API_BASE) throw new Error('この版は index.html の直接起動ではデータ取得できません。Vercel に公開してURLから開いてください。');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
    const r=await fetch(`${API_BASE}${path}`,{signal:controller.signal,headers:{'accept':'application/json'}});
    const text=await r.text();
    let data={};
    try{ data=text?JSON.parse(text):{}; }catch{ throw new Error(`API応答がJSONではありません (${r.status})`); }
    if(!r.ok) throw new Error(data.error||`APIエラー ${r.status}`);
    return data;
  }catch(e){
    if(e.name==='AbortError') throw new Error('データ取得が15秒でタイムアウトしました。');
    throw e;
  }finally{clearTimeout(timer);}
}
const slotsEl = $('#slots');
function key(x){ return `${x.year}-${x.team}`; }
function eligiblePlayers(group){
  const allowRejected=$('#allowRejected').checked;
  return group.players.filter(p=>p.selectable && (p.draftResult!=='拒否'||(allowRejected&&p.laterEnteredNPB)) && !state.roster.some(r=>r.name===p.name));
}
async function loadYear(year){
  if(state.yearCache.has(year)) return state.yearCache.get(year);
  const j=await apiFetch(`/api/draft?year=${year}`);
  state.yearCache.set(year,j.groups||[]);
  return j.groups||[];
}
async function drawTwo(){
  if(state.roster.length>=19){alert('19人の獲得枠が埋まっています。');return;}
  $('#drawBtn').disabled=true; $('#drawBtn').textContent='読込中…';
  try{
    const groups=[]; let guard=0;
    while(groups.length<2 && guard<30){
      guard++;
      const year=YEARS[Math.floor(Math.random()*YEARS.length)];
      const list=await loadYear(year);
      const candidates=list.filter(g=>!state.usedTeamYears.has(key(g)) && eligiblePlayers(g).length);
      if(candidates.length){
        const g=candidates[Math.floor(Math.random()*candidates.length)];
        if(!groups.some(x=>key(x)===key(g))) groups.push(g);
      }
    }
    if(groups.length<2) throw new Error('2枠を用意できませんでした。もう一度引いてください。');
    state.current=groups;
    groups.forEach(g=>state.usedTeamYears.add(key(g)));
    renderSlots(); $('#passBtn').disabled=state.passes<=0;
  }catch(e){alert(e.message||e);}
  finally{updateStatus();$('#drawBtn').textContent='🎰 2枠引く';}
}
function renderSlots(){
  slotsEl.innerHTML='';
  state.current.forEach(group=>{
    const frag=$('#slotTemplate').content.cloneNode(true);
    frag.querySelector('.eyebrow').textContent=`${group.year}年 ドラフト`;
    frag.querySelector('.slot-title').textContent=group.team;
    const players=eligiblePlayers(group);
    frag.querySelector('.count').textContent=`${players.length}人 選択可`;
    const list=frag.querySelector('.players');
    players.forEach(p=>list.appendChild(playerCard(p,group)));
    slotsEl.appendChild(frag);
  });
}
async function enrichPlayer(p,frag){
  const careerEl=frag.querySelector('.career');
  careerEl.textContent='通算: 自動照合中…';
  try{
    let info=state.playerCache.get(p.name);
    if(!info){info=await apiFetch(`/api/player?name=${encodeURIComponent(p.name)}`);state.playerCache.set(p.name,info);}
    if(info && info.found){p.career=info.career||p.career;p.positions=(info.positions&&info.positions.length)?info.positions:p.positions;p.achievements=info.achievements||p.achievements||[];p.statsSource=info.sourceUrl||'';careerEl.textContent=`通算: ${p.career}`;}
    else careerEl.textContent='通算: 自動照合できませんでした';
  }catch(e){careerEl.textContent='通算: 自動照合できませんでした';}
}
function playerCard(p,group){
  const frag=$('#playerTemplate').content.cloneNode(true), btn=frag.querySelector('.player-card');
  frag.querySelector('.name').textContent=p.name; frag.querySelector('.round').textContent=p.round;
  frag.querySelector('.meta').textContent=`指名時: ${p.draftPosition} / 所属: ${p.school||'不明'}`;
  const badges=frag.querySelector('.badges');
  if(p.draftResult==='拒否') badges.appendChild(badge('拒否→後年入団','rejected'));
  (p.achievements||[]).forEach(a=>badges.appendChild(badge(a,'special')));
  frag.querySelector('.note').textContent=p.note||'';
  btn.addEventListener('click',()=>pickPlayer(p,group));
  enrichPlayer(p,frag);
  return frag;
}
function badge(text,cls){const s=document.createElement('span');s.className=`badge ${cls||''}`;s.textContent=text;return s;}
function pickPlayer(p,group){
  if(state.roster.length>=19)return;
  state.roster.push({...p,pickedFrom:`${group.year} ${group.team}`}); state.current=[];
  updateStatus();renderRoster();renderTeamBoard();
  slotsEl.innerHTML='<div class="slot empty">次の抽選へ</div><div class="slot empty">次の抽選へ</div>'; $('#passBtn').disabled=true;
}
function pass(){if(state.passes<=0||!state.current.length)return;state.passes--;state.current=[];updateStatus();slotsEl.innerHTML='<div class="slot empty">パスしました</div><div class="slot empty">次の抽選へ</div>';$('#passBtn').disabled=true;}
function renderRoster(){
  const el=$('#roster'); if(!state.roster.length){el.className='roster empty-note';el.textContent='まだ獲得していません。';return;}
  el.className='roster';el.innerHTML='';
  state.roster.forEach(p=>{const d=document.createElement('div');d.className='roster-card';const assigned=Object.entries(state.assignments).find(([,n])=>n===p.name)?.[0]||'';d.innerHTML=`<strong>${p.name}</strong><div class="small">${p.positions.join('・')}</div><div class="small">獲得元: ${p.pickedFrom}</div>`;const select=document.createElement('select');select.className='assign-select';select.innerHTML='<option value="">未配置</option>'+TEAM_SLOTS.map(s=>`<option value="${s.id}" ${assigned===s.id?'selected':''}>${s.label}</option>`).join('');select.addEventListener('change',()=>assignPlayer(p.name,select.value));d.appendChild(select);el.appendChild(d);});
}
function assignPlayer(name,slotId){for(const[id,n]of Object.entries(state.assignments)){if(n===name)delete state.assignments[id];}if(slotId)state.assignments[slotId]=name;renderRoster();renderTeamBoard();updateStatus();}
function makeTeamRow(s){
  const row=document.createElement('div');row.className=`team-slot ${s.type}`;const name=state.assignments[s.id],p=state.roster.find(x=>x.name===name);const left=document.createElement('div');left.className='team-slot-label';left.textContent=s.label;const mid=document.createElement('div');mid.className='team-slot-player';mid.textContent=p?p.name:'—';row.append(left,mid);if(s.type==='bat'){const pos=document.createElement('select');pos.className='position-select';pos.innerHTML='<option value="">守備位置</option>'+FIELD_POSITIONS.map(x=>`<option value="${x}" ${state.fieldPositions[s.id]===x?'selected':''}>${x}</option>`).join('');pos.disabled=!p;pos.addEventListener('change',()=>state.fieldPositions[s.id]=pos.value);row.appendChild(pos);}else if(p){const meta=document.createElement('span');meta.className='slot-meta';meta.textContent=p.positions.join('・');row.appendChild(meta);}return row;
}
function renderTeamBoard(){
  const el=$('#teamBoard');el.innerHTML='';
  const left=document.createElement('div');left.className='team-column';left.innerHTML='<h3>打順</h3><div class="column-note">DHあり・1〜9番</div>';
  const right=document.createElement('div');right.className='team-column';right.innerHTML='<h3>控え・投手</h3><div class="column-note">控え3・先発3・中継ぎ3・抑え1</div>';
  TEAM_SLOTS.filter(s=>s.type==='bat').forEach(s=>left.appendChild(makeTeamRow(s)));
  TEAM_SLOTS.filter(s=>s.type!=='bat').forEach(s=>right.appendChild(makeTeamRow(s)));
  el.append(left,right);
}
function updateStatus(){$('#passes').textContent=state.passes;$('#pickCount').textContent=state.roster.length;$('#assignedCount').textContent=Object.keys(state.assignments).length;$('#drawBtn').disabled=state.roster.length>=19;}
function reset(){state.passes=3;state.roster=[];state.current=[];state.usedTeamYears.clear();state.assignments={};state.fieldPositions={};updateStatus();renderRoster();renderTeamBoard();slotsEl.innerHTML='<div class="slot empty">左枠</div><div class="slot empty">右枠</div>';$('#passBtn').disabled=true;}
$('#drawBtn').addEventListener('click',drawTwo);$('#passBtn').addEventListener('click',pass);$('#resetBtn').addEventListener('click',reset);$('#allowRejected').addEventListener('change',()=>{if(state.current.length)renderSlots();});renderTeamBoard();updateStatus();
