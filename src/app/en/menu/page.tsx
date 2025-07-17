export default async function Page() {
  const items = [
    {
      name: "Marinated Red Cabbage",
      desc: "Marinade de chou rouge tiède",
    },
    {
      name: "Sautéed Asparagus with Strawberry and Basil Sauce",
      desc: "Asperges sautées, sauce à la fraise et au basilic",
    },
    {
      name: "Simmered Cabbage and Bacon",
      desc: "Chou et lard mijotés à l'eau",
    },
    {
      name: "Chilled Corn Potage",
      desc: "Potage froid de maïs doux",
    },
    {
      name: "Tuna Tartare",
      desc: "Tartare de thon",
    },
    {
      name: "Poulet au Vinaigre",
      desc: "Poulet au vinaigre",
    },
    {
      name: "Boeuf Bourguignon",
      desc: "Bœuf bourguignon",
    },
    {
      name: "Peach Compote",
      desc: "Compote de pêche",
    },
  ];
  return (
    <div className="french-menu">
      <h1 className="menu-heading">Menu of the Day</h1>
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
