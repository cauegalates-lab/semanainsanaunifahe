// URL /exec da implantação ativa do Google Apps Script.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXCgSQ7yrj3evtyX6U9D7B5uBVlmtBWC5vayHc3yA24MujmrSQtEgERn9oFORDzmYv/exec';
const AUTO_REFRESH_MS = 60000;

const PROFILE_PHOTOS = {
  'Beatriz Cunha':'assets/profiles/beatriz-cunha.jpg',
  'Gabriel Gorgonio':'assets/profiles/gabriel-gorgonio.jpg',
  'Letícia Vieira':'assets/profiles/leticia-vieira.jpg',
  'Cauê Galates':'assets/profiles/caue-galates.jpg',
  'Alana Santos':'assets/profiles/alana-santos.jpg',
  'Giseli de Jesus':'assets/profiles/giseli-de-jesus.jpg',
  'Nathália':'assets/profiles/nathalia.jpg'
};

const SAMPLE_DATA = [
  { name:'Beatriz Cunha', quitados:8, matriculas:18, faturamento:18420 },
  { name:'Gabriel Gorgonio', quitados:7, matriculas:16, faturamento:16780 },
  { name:'Letícia Vieira', quitados:6, matriculas:14, faturamento:14990 },
  { name:'Cauê Galates', quitados:5, matriculas:12, faturamento:12740 },
  { name:'Alana Santos', quitados:4, matriculas:10, faturamento:10680 },
  { name:'Giseli de Jesus', quitados:3, matriculas:8, faturamento:8420 },
  { name:'Nathália', quitados:2, matriculas:7, faturamento:7350 }
];

let leaders = SAMPLE_DATA;
let loading = false;
const $ = id => document.getElementById(id);
const sorted = () => [...leaders].sort((a,b) => Number(b.quitados>0)-Number(a.quitados>0) || b.matriculas-a.matriculas || b.quitados-a.quitados);
const formatMoney = value => Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2});

function render(){
  const ranking=sorted(), qualified=ranking.filter(leader=>leader.quitados>0).slice(0,3), order=[qualified[1],qualified[0],qualified[2]].filter(Boolean);
  $('podiumGrid').innerHTML=order.length?order.map(leader=>{
    const position=qualified.indexOf(leader)+1;
    return `<article class="podium-person place-${position}"><div class="medal">${position===1?'♛':position}</div><div class="podium-avatar"><img src="${PROFILE_PHOTOS[leader.name]}" alt="Foto de ${leader.name}"></div><small>${position}º LUGAR</small><h2>${leader.name}</h2><div class="podium-results"><div><b>${leader.quitados}</b><span>QUITADOS</span></div><i></i><div><b>${leader.matriculas}</b><span>MATRÍCULAS</span></div></div><div class="podium-revenue"><b>${formatMoney(leader.faturamento)}</b><span>FATURADO</span></div><div class="step"><b>${position}</b></div></article>`;
  }).join(''):`<div class="empty-podium"><span>♛</span><strong>Aguardando o primeiro Quitado</strong><small>O pódio será liberado após a classificação</small></div>`;
  $('rankingList').innerHTML=ranking.map((leader,index)=>`<article class="ranking-row ${leader.quitados>0?`row-${index+1}`:'row-unqualified'}"><span class="row-position">${String(index+1).padStart(2,'0')}</span><span class="row-avatar"><img src="${PROFILE_PHOTOS[leader.name]}" alt=""></span><div class="row-name"><strong>${leader.name}</strong><small>${leader.quitados>0?'LÍDER CLASSIFICADO':'AGUARDANDO QUITADO'}</small></div><div class="result result-quitado"><b>${leader.quitados}</b><span>QUITADOS</span></div><div class="result result-matricula"><b>${leader.matriculas}</b><span>MATRÍCULAS</span></div><div class="result result-faturamento"><b>${formatMoney(leader.faturamento)}</b><span>FATURADO</span></div></article>`).join('');
  $('totalQuitados').innerHTML=`${leaders.reduce((s,l)=>s+l.quitados,0)} <small>QUITADOS</small>`;
  $('totalMatriculas').innerHTML=`${leaders.reduce((s,l)=>s+l.matriculas,0)} <small>MATRÍCULAS</small>`;
  $('totalFaturamento').innerHTML=`${formatMoney(leaders.reduce((s,l)=>s+Number(l.faturamento||0),0))} <small>FATURADO</small>`;
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
      leaders=payload.leaders.map(leader=>({...leader,faturamento:Number(leader.faturamento)||0}));render();
      const date=payload.updatedAt?new Date(payload.updatedAt):new Date();
      $('lastUpdate').textContent=`Atualizado às ${date.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
      finish(true);
    }else finish(false);
  };
  script.onerror=()=>finish(false);
  const separator=GOOGLE_SCRIPT_URL.includes('?')?'&':'?';
  script.src=`${GOOGLE_SCRIPT_URL}${separator}rota=rankingLideres&callback=${callbackName}&t=${Date.now()}`;
  document.head.appendChild(script);
}

$('syncButton').addEventListener('click',loadSheet);
render();
loadSheet();
if(GOOGLE_SCRIPT_URL)setInterval(loadSheet,AUTO_REFRESH_MS);
