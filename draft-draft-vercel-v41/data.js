// 試作データ。後から同じ形で1965〜2025年を追加できます。
window.DRAFT_DATA = [
  {
    year: 1980, team: "読売ジャイアンツ", sourceNote: "1980年ドラフト",
    players: [
      {name:"原辰徳", round:"1位", draftPosition:"内野手", positions:["三塁手","外野手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"1697試合 / 1675安打 / 382本塁打 / 1093打点 / 打率.279", achievements:["MVP","新人王","打点王"], note:""},
      {name:"駒田徳広", round:"2位", draftPosition:"投手", positions:["一塁手","外野手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"2063試合 / 2006安打 / 195本塁打 / 953打点 / 打率.289", achievements:["2000安打","日本シリーズMVP"], note:"入団後に野手転向。野手として使用可能。"},
      {name:"小原正行", round:"3位", draftPosition:"投手", positions:["投手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""},
      {name:"瀬戸山満年", round:"4位", draftPosition:"捕手", positions:["捕手"], draftResult:"拒否", laterEnteredNPB:false, selectable:false, career:"NPB入団なし", achievements:[], note:"入団拒否。後年もNPB選手として入団していないため対象外。"}
    ]
  },
  {
    year: 1989, team: "福岡ダイエーホークス", sourceNote: "1989年ドラフト",
    players: [
      {name:"元木大介", round:"1位", draftPosition:"内野手", positions:["一塁手","二塁手","三塁手","遊撃手","外野手"], draftResult:"拒否", laterEnteredNPB:true, laterEntry:"1990年 巨人1位", selectable:true, career:"1205試合 / 891安打 / 66本塁打 / 378打点 / 打率.262", achievements:[], note:"1989年ダイエー指名を拒否後、1990年に巨人へ入団。"},
      {name:"金沢健一", round:"2位", draftPosition:"投手", positions:["投手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""},
      {name:"橋本武広", round:"3位", draftPosition:"投手", positions:["投手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"中継ぎとして長くプレー", achievements:[], note:""}
    ]
  },
  {
    year: 1990, team: "読売ジャイアンツ", sourceNote: "1990年ドラフト",
    players: [
      {name:"元木大介", round:"1位", draftPosition:"内野手", positions:["一塁手","二塁手","三塁手","遊撃手","外野手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"1205試合 / 891安打 / 66本塁打 / 378打点 / 打率.262", achievements:[], note:"前年のダイエー1位指名を拒否後、巨人1位で入団。"},
      {name:"吉原孝介", round:"2位", draftPosition:"捕手", positions:["捕手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""}
    ]
  },
  {
    year: 1990, team: "福岡ダイエーホークス", sourceNote: "1990年ドラフト",
    players: [
      {name:"木村恵二", round:"1位", draftPosition:"投手", positions:["投手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""},
      {name:"内之倉隆志", round:"2位", draftPosition:"内野手", positions:["内野手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""},
      {name:"下柳剛", round:"4位", draftPosition:"投手", positions:["投手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"627登板 / 129勝106敗 / 防御率3.92", achievements:["最多勝"], note:""},
      {name:"村松有人", round:"6位", draftPosition:"外野手", positions:["外野手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"1673試合 / 1380安打 / 18本塁打 / 393打点 / 270盗塁 / 打率.277", achievements:["盗塁王"], note:""}
    ]
  },
  {
    year: 2010, team: "東京ヤクルトスワローズ", sourceNote: "2010年ドラフト",
    players: [
      {name:"山田哲人", round:"1位", draftPosition:"内野手", positions:["二塁手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"現役のため通算成績は更新対象", achievements:["トリプルスリー×3","本塁打王","盗塁王","MVP"], note:"通算成績はデータ更新時点に応じて更新。"},
      {name:"七條祐樹", round:"2位", draftPosition:"投手", positions:["投手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""},
      {name:"西田明央", round:"3位", draftPosition:"捕手", positions:["捕手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""},
      {name:"又野知弥", round:"4位", draftPosition:"外野手", positions:["外野手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""},
      {name:"久古健太郎", round:"5位", draftPosition:"投手", positions:["投手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""},
      {name:"川崎成晃", round:"6位", draftPosition:"外野手", positions:["外野手"], draftResult:"入団", laterEnteredNPB:true, selectable:true, career:"試作版では詳細成績未登録", achievements:[], note:""}
    ]
  }
];
