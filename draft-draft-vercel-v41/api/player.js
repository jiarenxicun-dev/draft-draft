const cheerio = require('cheerio');

function compactName(s){return (s||'').replace(/[\s　]/g,'').trim();}
function n(s){const x=Number(String(s||'').replace(/,/g,'')); return Number.isFinite(x)?x:0;}
function avg(h,ab){return ab? (h/ab).toFixed(3).replace(/^0/,'') : '.000';}

module.exports = async function handler(req,res){
  const name = String(req.query.name||'').trim();
  if(!name) return res.status(400).json({error:'name required'});
  try{
    const searchUrl=`https://npb.jp/bis/players/search/result?search_keyword=${encodeURIComponent(compactName(name))}`;
    const sr=await fetch(searchUrl,{headers:{'user-agent':'Mozilla/5.0 DraftDraft/1.0'}});
    if(!sr.ok) throw new Error(`search ${sr.status}`);
    const sh=await sr.text(); const $s=cheerio.load(sh);
    let playerUrl='';
    $s('a[href*="/bis/players/"]').each((_,a)=>{
      if(playerUrl) return;
      const t=compactName($s(a).text());
      if(!t || t.includes(compactName(name)) || compactName(name).includes(t)){
        const href=$s(a).attr('href');
        if(href) playerUrl = href.startsWith('http')?href:`https://npb.jp${href}`;
      }
    });
    if(!playerUrl) return res.status(200).json({found:false,name});
    const pr=await fetch(playerUrl,{headers:{'user-agent':'Mozilla/5.0 DraftDraft/1.0'}});
    if(!pr.ok) throw new Error(`player ${pr.status}`);
    const html=await pr.text(); const $=cheerio.load(html);
    const bodyText=$('body').text().replace(/\s+/g,' ');
    let position='';
    const pm=bodyText.match(/ポジション\s*([^投打]{1,12})\s*投打/); if(pm) position=pm[1].trim();

    const tables=[];
    $('table').each((_,tbl)=>{
      const headers=$(tbl).find('tr').first().find('th,td').map((__,c)=>$(c).text().replace(/\s+/g,'').trim()).get();
      if(headers.includes('試合') && (headers.includes('打率') || headers.includes('防御率'))) tables.push({tbl,headers});
    });
    let career='';
    const batting=tables.find(x=>x.headers.includes('打率'));
    if(batting){
      const idx=Object.fromEntries(batting.headers.map((h,i)=>[h,i]));
      let G=0,AB=0,H=0,HR=0,RBI=0,SB=0;
      $(batting.tbl).find('tr').slice(1).each((_,tr)=>{
        const c=$(tr).find('td').map((__,td)=>$(td).text().replace(/\s+/g,'').trim()).get();
        if(c.length < batting.headers.length-2) return;
        const y=c[0]; if(!/^\d{4}$/.test(y)) return;
        G+=n(c[idx['試合']]); AB+=n(c[idx['打数']]); H+=n(c[idx['安打']]); HR+=n(c[idx['本塁打']]); RBI+=n(c[idx['打点']]); SB+=n(c[idx['盗塁']]);
      });
      if(G) career=`${G}試合 / ${H}安打 / ${HR}本塁打 / ${RBI}打点 / ${SB}盗塁 / 打率${avg(H,AB)}`;
    }
    const pitching=tables.find(x=>x.headers.includes('防御率'));
    if(pitching){
      const idx=Object.fromEntries(pitching.headers.map((h,i)=>[h,i]));
      let G=0,W=0,L=0,SV=0,HLD=0,SO=0,ER=0,IP=0;
      $(pitching.tbl).find('tr').slice(1).each((_,tr)=>{
        const c=$(tr).find('td').map((__,td)=>$(td).text().replace(/\s+/g,'').trim()).get();
        if(c.length < pitching.headers.length-2) return;
        if(!/^\d{4}$/.test(c[0])) return;
        G+=n(c[idx['登板']??idx['試合']]); W+=n(c[idx['勝利']]); L+=n(c[idx['敗戦']]); SV+=n(c[idx['セーブ']]); HLD+=n(c[idx['ホールド']]); SO+=n(c[idx['奪三振']]);
        const ipraw=c[idx['投球回']]; if(ipraw){ const m=String(ipraw).match(/^(\d+)(?:\s*(\d)\/3)?$/); if(m) IP+=n(m[1])+(m[2]?n(m[2])/3:0); }
        ER+=n(c[idx['自責点']]);
      });
      if(G){ const era=IP? (ER*9/IP).toFixed(2):'0.00'; const ptxt=`${G}登板 / ${W}勝${L}敗 / ${SV}S / ${HLD}H / ${SO}奪三振 / 防御率${era}`; career = career ? `${career} ｜ 投手: ${ptxt}` : ptxt; }
    }
    const positions=[];
    if(position){ if(position.includes('投手')) positions.push('投手'); if(position.includes('捕手')) positions.push('捕手'); if(position.includes('内野')) positions.push('一塁手','二塁手','三塁手','遊撃手'); if(position.includes('外野')) positions.push('左翼手','中堅手','右翼手'); }
    res.setHeader('Cache-Control','s-maxage=604800, stale-while-revalidate=2592000');
    res.status(200).json({found:true,name,career:career||'通算成績を取得できませんでした',positions:[...new Set(positions)],achievements:[],sourceUrl:playerUrl});
  }catch(e){res.status(500).json({error:String(e.message||e),found:false,name});}
};
