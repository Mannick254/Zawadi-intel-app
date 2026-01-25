
const articles = [
  {
    id: 1,
    title: "Cyrus Jirongo",
    path: "/news/cyrus-jirongo.html"
  },
  {
    id: 2,
    title: "Kenya-France Immunity",
    path: "/news/kenya-france-immunity.html"
  },
  {
    id: 3,
    title: "Uhuru Youth",
    path: "/news/uhuru-youth.html"
  },
  {
    id: 4,
    title: "Wahoho",
    path: "/news/wahoho.html"
  }
];

export default function ArticleList() {
  return (
    <div>
      <h2>Articles</h2>
      <ul>
        {articles.map(a => (
          <li key={a.id}>
            <a href={a.path} target="_blank" rel="noopener noreferrer">{a.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
