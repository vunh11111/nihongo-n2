import { Link, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import QuizGame from "./components/QuizGame.jsx";
import StarGame from "./components/StarGame.jsx";
import ReadingGame from "./components/ReadingGame.jsx";
import Exam from "./pages/Exam.jsx";
import { GAMES } from "./games.js";

// Chọn component theo loại trò (game.kind):
//   "star"    -> Hái sao
//   "reading" -> bài đọc + nhiều câu hỏi (mondai 9-14)
//   còn lại   -> trắc nghiệm 4 đáp án
function GameView({ game }) {
  if (game.kind === "star") return <StarGame game={game} />;
  if (game.kind === "reading") return <ReadingGame game={game} />;
  return <QuizGame game={game} />;
}

export default function App() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  return (
    <div className="app">
      <header className="top">
        {onHome ? (
          <span className="brand">日本語 <b>N2</b></span>
        ) : (
          <Link className="btn ghost" to="/">← Trang chủ</Link>
        )}
        {!onHome && <strong className="top-title">{pathname === "/thi-thu" ? "Thi thử" : GAMES.find((g) => g.path === pathname)?.title}</strong>}
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/thi-thu" element={<Exam />} />
          {GAMES.map((g) => (
            <Route key={g.id} path={g.path} element={<GameView key={g.id} game={g} />} />
          ))}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}