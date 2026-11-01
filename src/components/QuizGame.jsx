import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GAMES } from "../games.js";
import { buildDeck, parseSentence, pickRandomGame } from "../lib/quiz.js";

const TYPE_LABEL = { prefix: "Tiền tố 接頭語", suffix: "Hậu tố 接尾語" };

// Trò chơi trắc nghiệm 4 đáp án dùng chung cho mọi bộ câu hỏi (cách đọc, chữ Hán, tiền tố/hậu tố, ...)
export default function QuizGame({ game }) {
  const navigate = useNavigate();
  const [round, setRound] = useState(0);
  const deck = useMemo(() => buildDeck(game.questions, game.roundSize), [game, round]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = deck[index];
  const answered = picked !== null;

  const pick = useCallback(
    (choice) => {
      if (picked !== null || !q) return;
      setPicked(choice);
      if (choice === q.answer) setScore((s) => s + 1);
    },
    [picked, q]
  );

  const next = useCallback(() => {
    if (index + 1 >= deck.length) setFinished(true);
    else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }, [index, deck.length]);

  const restart = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  const playRandomOther = () => navigate(pickRandomGame(GAMES, game.id).path);

  // Phím tắt: 1-4 để chọn đáp án, Enter / Space / mũi tên phải để sang câu tiếp
  useEffect(() => {
    const onKey = (e) => {
      if (finished || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key)) pick(q?.options[Number(e.key) - 1]);
      else if (answered && ["Enter", " ", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, answered, pick, next, q]);

  if (!deck.length) return <p className="empty">Chưa có câu hỏi nào trong database.</p>;

  if (finished) {
    return (
      <section className="panel center">
        <h2>Hoàn thành!</h2>
        <p className="score-big">{score} / {deck.length}</p>
        <p>{score === deck.length ? "Tuyệt vời, bạn trả lời đúng tất cả." : "Hãy luyện lại để nhớ chắc hơn nhé."}</p>
        <div className="row">
          <button className="btn primary" onClick={restart}>Chơi lại</button>
          {GAMES.length > 1 && (
            <button className="btn" onClick={playRandomOther}>🎲 Trò ngẫu nhiên khác</button>
          )}
        </div>
      </section>
    );
  }

  const { before, target, after } = parseSentence(q.sentence);
  const correct = picked === q.answer;
  const blank = game.fillBlank;

  return (
    <section className="panel">
      <div className="meta">
        <span>Câu {index + 1} / {deck.length}</span>
        <span>Điểm: {score}</span>
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={deck.length} aria-valuenow={index + (answered ? 1 : 0)}>
        <div style={{ width: `${((index + (answered ? 1 : 0)) / deck.length) * 100}%` }} />
      </div>

      <p className="prompt">
        {game.prompt}
        {q.type && TYPE_LABEL[q.type] && <span className="tag">{TYPE_LABEL[q.type]}</span>}
      </p>
      <p className="sentence" lang="ja">
        {before}
        <mark className={blank ? "blank" : undefined}>{blank ? (answered ? q.answer : "　　") : target}</mark>
        {after}
      </p>

      <div className="choices">
        {q.options.map((opt, i) => {
          let cls = "choice";
          if (answered && opt === q.answer) cls += " right";
          else if (answered && opt === picked) cls += " wrong";
          return (
            <button key={opt} className={cls} onClick={() => pick(opt)} disabled={answered} lang="ja">
              <span className="num">{i + 1}</span>
              <span className="txt">{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="feedback" aria-live="polite">
        {answered && (
          <>
            <b className={correct ? "ok" : "bad"}>{correct ? "Chính xác!" : `Chưa đúng. Đáp án: ${q.answer}`}</b>
            <span lang="ja">{q.word}（{q.reading}）</span>
            <span>{q.meaning}</span>
          </>
        )}
      </div>

      <div className="row">
        <button className="btn primary" onClick={next} disabled={!answered}>
          {index + 1 >= deck.length ? "Xem kết quả" : "Câu tiếp"}
        </button>
      </div>
    </section>
  );
}