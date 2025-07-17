export default async function Page() {
  const items = [
    {
      name: "赤キャベツのマリネ",
      desc: "Marinade de chou rouge tiède",
    },
    {
      name: "アスパラガスのソテー・いちごとバジルのソース",
      desc: "Asperges sautées, sauce à la fraise et au basilic",
    },
    {
      name: "キャベツとベーコンの水煮",
      desc: "Chou et lard mijotés à l'eau",
    },
    {
      name: "とうもろこしの冷製ポタージュ",
      desc: "Potage froid de maïs doux",
    },
    {
      name: "マグロのタルタル",
      desc: "Tartare de thon",
    },
    {
      name: "プーレ・オ・ビネーグル",
      desc: "Poulet au vinaigre",
    },
    {
      name: "ブッフ・ブルギニョン",
      desc: "Bœuf bourguignon",
    },
    {
      name: "桃のコンポート",
      desc: "Compote de pêche",
    },
  ];
  return (
    <div className="french-menu">
      <h1 className="menu-heading">Menu du Jour</h1>
      <div className="menu-items">
        {items.map((item) => (
          <div key={item.name} className="menu-item">
            <h2 className="dish-name">{item.name}</h2>
            <p className="dish-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
