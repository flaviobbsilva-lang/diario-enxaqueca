(() => {
  "use strict";
  const ROOT_ID = "patientEvolution";
  const STORAGE_KEY = "diario_cefaleia_v1";

  const css = `
  .evo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0 18px}
  .evo-kpi{background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:12px 6px;text-align:center;min-width:0}
  .evo-kpi strong{display:block;font-size:1.35rem;line-height:1.1;color:var(--purple-deep);margin-bottom:5px}
  .evo-kpi span{display:block;font-size:.68rem;line-height:1.25;color:var(--ink-soft)}
  .evo-chart-title{font-size:.78rem;font-weight:650;color:var(--ink-soft);margin:0 0 8px}
  .evo-chart{height:154px;display:flex;align-items:flex-end;gap:5px;border-bottom:1px solid var(--line);padding:8px 2px 0}
  .evo-day{height:100%;flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px}
  .evo-value{font-size:.68rem;color:var(--ink-soft);min-height:17px}
  .evo-barbox{height:105px;width:100%;display:flex;align-items:flex-end;justify-content:center}
  .evo-bar{width:min(28px,72%);min-height:4px;border-radius:7px 7px 2px 2px;background:var(--line)}
  .evo-bar.pain{background:var(--purple)}
  .evo-date{font-size:.62rem;color:var(--ink-soft);white-space:nowrap}
  .evo-med{width:6px;height:6px;border-radius:50%;background:var(--gold);margin-top:-1px}
  .evo-legend{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0 2px;font-size:.68rem;color:var(--ink-soft)}
  .evo-legend span{display:flex;align-items:center;gap:5px}
  .evo-dot{width:7px;height:7px;border-radius:50%;background:var(--gold)}
  .evo-history{margin-top:17px;border-top:1px solid var(--line);padding-top:12px}
  .evo-history h3{font-size:.82rem;margin:0 0 5px;color:var(--purple-deep)}
  .evo-row{padding:9px 0;border-bottom:1px solid var(--line)}
  .evo-row:last-child{border-bottom:0;padding-bottom:0}
  .evo-row strong{font-size:.78rem;font-weight:650;display:block}
  .evo-row span{font-size:.72rem;color:var(--ink-soft);display:block;margin-top:2px}
  .evo-empty{font-size:.8rem;color:var(--ink-soft);padding:8px 0 2px}
  .evo-note{font-size:.68rem;color:var(--ink-soft);line-height:1.4;margin:14px 0 0}
  @media(max-width:350px){.evo-grid{grid-template-columns:1fr}.evo-kpi{padding:10px}.evo-date{font-size:.57rem}}
  `;

  function readData(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {dias:{}}; }
    catch (_) { return {dias:{}}; }
  }
  function esc(s){
    return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function shortDate(ds){ const p=ds.split("-"); return p.length===3 ? `${p[2]}/${p[1]}` : ds; }
  function longDate(ds){ const p=ds.split("-"); return p.length===3 ? `${p[2]}/${p[1]}/${p[0]}` : ds; }
  function medsText(r){
    if(!r || !r.dor || !(r.meds||[]).length) return "Sem medicação";
    return (r.meds||[]).map(m => m === "Outro" && r.medOutro ? r.medOutro : m).join(" + ");
  }
  function lastSevenCalendarDays(entries){
    if(!entries.length) return [];
    const latest = entries[entries.length-1][0].split("-").map(Number);
    const end = new Date(latest[0], latest[1]-1, latest[2]);
    const map = new Map(entries);
    const out=[];
    for(let i=6;i>=0;i--){
      const d=new Date(end); d.setDate(end.getDate()-i);
      const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      out.push([ds,map.get(ds)||null]);
    }
    return out;
  }
  function render(){
    const host=document.getElementById(ROOT_ID); if(!host) return;
    const d=readData();
    const entries=Object.entries(d.dias||{}).sort((a,b)=>a[0].localeCompare(b[0]));
    if(!entries.length){
      host.innerHTML='<h2>Sua evolução</h2><p class="sub">Acompanhe seus últimos dias.</p><div class="evo-empty">Depois do primeiro registro, sua evolução aparecerá aqui.</div>';
      return;
    }
    const recent=lastSevenCalendarDays(entries);
    const recorded=recent.filter(([,r])=>r);
    const pain=recorded.filter(([,r])=>r.dor);
    const ints=pain.map(([,r])=>Number(r.intensidade)).filter(Number.isFinite);
    const avg=ints.length ? (ints.reduce((a,b)=>a+b,0)/ints.length).toFixed(1).replace(".",",") : "–";
    const medDays=pain.filter(([,r])=>(r.meds||[]).length).length;

    const bars=recent.map(([ds,r])=>{
      const val=r&&r.dor ? Math.max(0,Math.min(10,Number(r.intensidade)||0)) : 0;
      const height=Math.max(4,Math.round(val*10));
      const med=!!(r&&r.dor&&(r.meds||[]).length);
      const label=!r ? "–" : String(val);
      const aria=!r ? `${shortDate(ds)} sem registro` : r.dor ? `${shortDate(ds)}, dor ${val} de 10${med?', com medicação':''}` : `${shortDate(ds)}, sem dor`;
      return `<div class="evo-day" aria-label="${esc(aria)}"><div class="evo-value">${label}</div><div class="evo-barbox"><div class="evo-bar${val>0?' pain':''}" style="height:${height}%"></div></div>${med?'<span class="evo-med" title="Uso de medicação"></span>':'<span style="height:6px"></span>'}<div class="evo-date">${shortDate(ds)}</div></div>`;
    }).join("");

    const history=entries.slice(-3).reverse().map(([ds,r])=>{
      if(!r.dor) return `<div class="evo-row"><strong>${longDate(ds)} — Sem dor</strong><span>Dia registrado</span></div>`;
      const duration=r.duracao ? esc(r.duracao) : "Duração não informada";
      return `<div class="evo-row"><strong>${longDate(ds)} — Dor ${esc(r.intensidade ?? '–')}/10</strong><span>${duration} · ${esc(medsText(r))}</span></div>`;
    }).join("");

    host.innerHTML=`
      <h2>Sua evolução</h2>
      <p class="sub">Uma visão simples dos últimos 7 dias.</p>
      <div class="evo-grid">
        <div class="evo-kpi"><strong>${pain.length}</strong><span>dias com dor</span></div>
        <div class="evo-kpi"><strong>${avg}</strong><span>intensidade média</span></div>
        <div class="evo-kpi"><strong>${medDays}</strong><span>dias com medicação</span></div>
      </div>
      <p class="evo-chart-title">Intensidade da dor · 0 a 10</p>
      <div class="evo-chart" role="img" aria-label="Gráfico da intensidade da dor nos últimos sete dias">${bars}</div>
      <div class="evo-legend"><span><i class="evo-dot"></i> medicação usada</span><span>– sem registro</span></div>
      <div class="evo-history"><h3>Últimos registros</h3>${history}</div>
      <p class="evo-note">O diário ajuda a acompanhar padrões ao longo do tempo e não substitui a avaliação médica.</p>`;
  }
  function install(){
    if(document.getElementById(ROOT_ID)) return;
    const style=document.createElement("style"); style.textContent=css; document.head.appendChild(style);
    const card=document.createElement("div"); card.id=ROOT_ID; card.className="card";
    const monthCard=[...document.querySelectorAll(".card")].find(el=>el.querySelector("#calGrid"));
    if(monthCard) monthCard.parentNode.insertBefore(card,monthCard); else document.querySelector(".wrap")?.appendChild(card);
    render();
    document.getElementById("btnSave")?.addEventListener("click",()=>setTimeout(render,0));
    window.addEventListener("storage",e=>{ if(e.key===STORAGE_KEY) render(); });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install,{once:true}); else install();
})();
