import { Link, useNavigate } from "react-router-dom";
import { GAMES } from "../games.js";
import { pickRandomGame } from "../lib/quiz.js";

export default function Home() {
  const navigate = useNavigate();
  const playRandom = () => navigate(pickRandomGame(GAMES).path);

  return (
    <section className="home">
      <h1>NIHONGO <span>N2</span></h1>
      <p className="sub">Luyện từ vựng JLPT N2 - chọn một trò chơi để bắt đầu</p>
      <div className="random">
        <button className="btn primary big" onClick={playRandom}>🎲 Chơi ngẫu nhiên</button>
      </div>
      <div className="cards">
        {GAMES.map((g) => (
          <Link key={g.id} to={g.path} className="card">
            <i>{g.icon}</i>
            <b>{g.title}</b>
            <span>{g.desc}</span>
            <em>{g.questions.length} câu trong database</em>
          </Link>
        ))}
      </div>
    </section>
  );
}