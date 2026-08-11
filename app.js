// Cole entre as aspas a URL /exec da implantação do Google Apps Script.
const GOOGLE_SCRIPT_URL = '';
const AUTO_REFRESH_MS = 60000;

const PROFILE_PHOTOS = {
  'Beatriz Cunha':'assets/profiles/beatriz-cunha.jpg',
  'Gabriel Gorgonio':'assets/profiles/gabriel-gorgonio.jpg',
  'Letícia Vieira':'assets/profiles/leticia-vieira.jpg',
  'Cauê Galates':'assets/profiles/caue-galates.jpg',
  'Alana Santos':'assets/profiles/alana-santos.png',
  'Giseli de Jesus':'assets/profiles/giseli-de-jesus.jpg',
  'Nathália':'assets/profiles/nathalia.jpg'
};

const SAMPLE_DATA = [
  { name:'Beatriz Cunha', quitados:8, matriculas:18 },
  { name:'Gabriel Gorgonio', quitados:7, matriculas:16 },
  { name:'Letícia Vieira', quitados:6, matriculas:14 },
  { name:'Cauê Galates', quitados:5, matriculas:12 },
  { name:'Alana Santos', quitados:4, matriculas:10 },
  { name:'Giseli de Jesus', quitados:3, matriculas:8 },
  { name:'Nathália', quitados:2, matriculas:7 }
];

let leaders = SAMPLE_DATA;
let loading = false;
const $ = id => document.getElementById(id);
const sorted = () => [...leaders].sort((a,b) => b.matriculas-a.matriculas || b.quitados-a.quitados);

function render(){
  const ranking=sorted(), order=[ranking[1],ranking[0],ranking[2]], positions=[2,1,3];
  $('podiumGrid').innerHTML=order.map((leader,i)=>{
    const position=positions[i];
    return `<article class="podium-person place-${position}"><div class="medal">${position===1?'♛':position}</div><div class="podium-avatar"><img src="${PROFILE_PHOTOS[leader.name]}" alt="Foto de ${leader.name}"></div><small>${position}º LUGAR</small><h2>${leader.name}</h2><div class="podium-results"><div><b>${leader.quitados}</b><span>QUITADOS</span></div><i></i><div><b>${leader.matriculas}</b><span>MATRÍCULAS</span></div></div><div class="step"><b>${position}</b></div></article>`;
  }).join('');
  $('rankingList').innerHTML=ranking.map((leader,index)=>`<article class="ranking-row row-${index+1}"><span class="row-position">${String(index+1).padStart(2,'0')}</span><span class="row-avatar"><img src="${PROFILE_PHOTOS[leader.name]}" alt=""></span><div class="row-name"><strong>${leader.name}</strong><small>LÍDER DE BAIA</small></div><div class="result result-quitado"><b>${leader.quitados}</b><span>QUITADOS</span></div><div class="result result-matricula"><b>${leader.matriculas}</b><span>MATRÍCULAS</span></div></article>`).join('');
  $('totalQuitados').innerHTML=`${leaders.reduce((s,l)=>s+l.quitados,0)} <small>QUITADOS</small>`;
  $('totalMatriculas').innerHTML=`${leaders.reduce((s,l)=>s+l.matriculas,0)} <small>MATRÍCULAS</small>`;
}

function setState(state,text){
  $('dataState').className=`data-state ${state}`;
  $('dataState').querySelector('span').textContent=text;
  $('syncIcon').className=state==='loading'?'spin':'';
  $('syncButton').disabled=state==='loading';
  $('syncText').textContent=state==='loading'?'Atualizando':'Atualizar dados';
}

function loadSheet(){
  if(loading)return;
  if(!GOOGLE_SCRIPT_URL){ setState('demo','DADOS DE EXEMPLO'); return; }
  loading=true; setState('loading','ATUALIZANDO');
  const callbackName=`unifaheRanking_${Date.now()}`;
  const script=document.createElement('script');
  const timeout=setTimeout(()=>finish(false),12000);
  function cleanup(){clearTimeout(timeout);script.remove();delete window[callbackName];loading=false}
  function finish(ok){cleanup();setState(ok?'live':'error',ok?'PLANILHA CONECTADA':'ERRO NA CONEXÃO')}
  window[callbackName]=payload=>{
    if(payload&&payload.ok&&Array.isArray(payload.leaders)){
      leaders=payload.leaders;render();
      const date=payload.updatedAt?new Date(payload.updatedAt):new Date();
      $('lastUpdate').textContent=`Atualizado às ${date.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
      finish(true);
    }else finish(false);
  };
  script.onerror=()=>finish(false);
  script.src=`${GOOGLE_SCRIPT_URL}?callback=${callbackName}&t=${Date.now()}`;
  document.head.appendChild(script);
}

$('syncButton').addEventListener('click',loadSheet);
render();
loadSheet();
if(GOOGLE_SCRIPT_URL)setInterval(loadSheet,AUTO_REFRESH_MS);
