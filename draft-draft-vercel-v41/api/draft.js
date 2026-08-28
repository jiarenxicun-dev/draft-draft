const cheerio = require('cheerio');

function normalizePosition(pos) {
  const p = (pos || '').trim();
  if (p.includes('投手')) return ['投手'];
  if (p.includes('捕手')) return ['捕手'];
  if (p.includes('内野')) return ['一塁手','二塁手','三塁手','遊撃手'];
  if (p.includes('外野')) return ['左翼手','中堅手','右翼手'];
  return [p || '不明'];
}

function resultInfo(note) {
  const text = (note || '').trim();
  const rejected = /拒否|交渉権放棄/.test(text);
  const laterEntered = rejected && /入団/.test(text);
  const directEntered = !rejected && /入団/.test(text);
  return {
    draftResult: rejected ? '拒否' : (directEntered ? '入団' : 'その他'),
    laterEnteredNPB: laterEntered,
    selectable: directEntered || laterEntered
  };
}

module.exports = async function handler(req, res) {
  const year = Number(req.query.year);
  if (!Number.isInteger(year) || year < 1965 || year > 2025) {
    return res.status(400).json({error:'year must be 1965..2025'});
  }
  try {
    const url = `https://draft.tokyo/draft/${year}/`;
    const r = await fetch(url, {headers:{'user-agent':'Mozilla/5.0 DraftDraft/1.0'}});
    if (!r.ok) throw new Error(`source ${r.status}`);
    const html = await r.text();
    const $ = cheerio.load(html);
    const byTeam = new Map();

    $('h3').each((_, h3) => {
      const team = $(h3).text().replace(/\s+/g,' ').trim();
      if (!team || /概要|一覧|結果|育成|指名順/.test(team)) return;
      const table = $(h3).nextAll('table').first();
      if (!table.length) return;
      const players = [];
      table.find('tr').each((__, tr) => {
        const cells = $(tr).find('td').map((___,td)=>$(td).text().replace(/\s+/g,' ').trim()).get();
        if (cells.length < 4) return;
        const [round,name,draftPosition,school,note=''] = cells;
        if (!name || /選手名/.test(name) || /ドラフト外/.test(round)) return;
        const ri = resultInfo(note);
        players.push({
          name,
          round,
          draftPosition,
          school,
          positions: normalizePosition(draftPosition),
          ...ri,
          career: '通算成績は未取得',
          achievements: [],
          note
        });
      });
      if (!players.length) return;
      if (!byTeam.has(team)) byTeam.set(team, []);
      byTeam.get(team).push(...players);
    });

    const groups = [...byTeam.entries()].map(([team,players])=>({year,team,sourceNote:`${year}年ドラフト`,players}));
    res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({year, source:url, groups});
  } catch (e) {
    res.status(500).json({error:String(e.message || e)});
  }
};
