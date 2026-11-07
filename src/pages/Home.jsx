import { Link, useNavigate } from "react-router-dom";
import { GAMES } from "../games.js";
import { pickRandomGame } from "../lib/quiz.js";

export default function Home() {
  const navigate = useNavigate();
  const playRandom = () => navigate(pickRandomGame(GAMES).path);

  return (
    <section className="home">
      <h1>NIHONGO <span>N2</span></h1>
      <p className="sub">Tổng hợp toàn bộ đề thi JLPT N2 từ 2010-2026</p>
      <div className="random">
        <button className="btn primary big" onClick={playRandom}>🎲 Chơi ngẫu nhiên</button>
        <Link className="btn big exam-link" to="/thi-thu">📝 Thi thử như đề thật</Link>
      </div>
      <div className="cards">
        {GAMES.map((g) => (
          <Link key={g.id} to={g.path} className="card">
            <i>{g.icon}</i>
            {g.mondai && <small>Mondai {g.mondai}</small>}
            <b>{g.title}</b>
            <span>{g.desc}</span>
            <em>{g.questions.length} {g.unit ?? "câu"}</em>
          </Link>
        ))}
      </div>
    </section>
  );
}