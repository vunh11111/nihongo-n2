import { Link, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import QuizGame from "./components/QuizGame.jsx";
import StarGame from "./components/StarGame.jsx";
import { GAMES } from "./games.js";

// Chọn component theo loại trò: "star" = Hái sao, còn lại là trắc nghiệm 4 đáp án
function GameView({ game }) {
  return game.kind === "star" ? <StarGame game={game} /> : <QuizGame game={game} />;
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
        {!onHome && <strong className="top-title">{GAMES.find((g) => g.path === pathname)?.title}</strong>}
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          {GAMES.map((g) => (
            <Route key={g.id} path={g.path} element={<GameView key={g.id} game={g} />} />
          ))}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}