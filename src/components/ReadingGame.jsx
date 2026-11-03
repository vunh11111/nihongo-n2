import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GAMES } from "../games.js";
import { pickRandomGame, shuffle } from "../lib/quiz.js";

// Tạo bộ đề: xáo thứ tự các bài, lấy tối đa `size` bài, xáo 4 đáp án của từng câu (giữ nguyên thứ tự câu hỏi)
function buildSetDeck(sets, size = sets.length) {
  return shuffle(sets)
    .slice(0, size)
    .map((set) => ({
      ...set,
      questions: set.questions.map((q) => ({ ...q, options: shuffle(q.choices) })),
    }));
}

// Chuyển văn bản bài đọc thành các phần tử:
//   [n]      -> chỗ trống số n (trò Đục lỗ), do `gapFor` quyết định cách hiển thị
//   __abc__  -> chữ được gạch chân
// Xuống dòng "\n" được giữ nguyên nhờ CSS white-space: pre-line
function renderText(text, gapFor) {
  return text.split(/(\[\d+\]|__.+?__)/g).map((tok, i) => {
    const gap = tok.match(/^\[(\d+)\]$/);
    if (gap) return gapFor(Number(gap[1]), i);
    const underline = tok.match(/^__(.+)__$/);
    if (underline) return <u key={i}>{underline[1]}</u>;
    return tok;
  });
}

// Trò đọc hiểu (mondai 9-14): hiện bài đọc, lần lượt trả lời từng câu hỏi của bài đó.
export default function ReadingGame({ game }) {
  const navigate = useNavigate();
  const [round, setRound] = useState(0);
  const deck = useMemo(() => buildSetDeck(game.questions, game.roundSize), [game, round]);
  // Trải phẳng thành danh sách các câu hỏi: mỗi phần tử biết mình thuộc bài đọc nào
  const steps = useMemo(
    () => deck.flatMap((set, si) => set.questions.map((q, qi) => ({ set, si, q, qi }))),
    [deck]
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // answers[chỉ số câu] = đáp án đã chọn
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const cur = steps[index];
  const picked = answers[index] ?? null;
  const answered = picked !== null;

  const pick = useCallback(
    (choice) => {
      if (answers[index] !== undefined || !cur || choice === undefined) return;
      setAnswers((a) => ({ ...a, [index]: choice }));
      if (choice === cur.q.answer) setScore((s) => s + 1);
    },
    [answers, index, cur]
  );

  const next = useCallback(() => {
    if (index + 1 >= steps.length) setFinished(true);
    else setIndex((i) => i + 1);
  }, [index, steps.length]);

  const restart = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setAnswers({});
    setScore(0);
    setFinished(false);
  };

  const playRandomOther = () => navigate(pickRandomGame(GAMES, game.id).path);

  // Phím tắt: 1-4 để chọn đáp án, Enter / Space / mũi tên phải để sang câu tiếp
  useEffect(() => {
    const onKey = (e) => {
      if (finished || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key)) pick(cur?.q.options[Number(e.key) - 1]);
      else if (answered && ["Enter", " ", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, answered, pick, next, cur]);

  if (!steps.length) return <p className="empty">Chưa có bài đọc nào trong database.</p>;

  if (finished) {
    return (
      <section className="panel center">
        <h2>Hoàn thành!</h2>
        <p className="score-big">{score} / {steps.length}</p>
        <p>{score === steps.length ? "Tuyệt vời, bạn trả lời đúng tất cả." : "Hãy đọc lại bài và luyện thêm nhé."}</p>
        <div className="row">
          <button className="btn primary" onClick={restart}>Chơi lại</button>
          {GAMES.length > 1 && (
            <button className="btn" onClick={playRandomOther}>🎲 Trò ngẫu nhiên khác</button>
          )}
        </div>
      </section>
    );
  }

  const { set, q, qi } = cur;
  const correct = picked === q.answer;
  const setStart = steps.findIndex((s) => s.si === cur.si); // chỉ số câu đầu tiên của bài hiện tại

  // Hiển thị chỗ trống [n] (chỉ dùng cho trò Đục lỗ): đã trả lời thì điền đáp án đã chọn vào
  const gapFor = (n, key) => {
    if (!game.cloze) return `[${n}]`;
    const stepIndex = setStart + n - 1;
    const chosen = answers[stepIndex];
    let cls = "gap";
    if (stepIndex === index) cls += " current";
    if (chosen !== undefined) cls += chosen === steps[stepIndex]?.q.answer ? " right" : " wrong";
    return (
      <span key={key} className={cls}>
        {chosen !== undefined ? chosen : `（${n}）`}
      </span>
    );
  };

  const prompt = q.prompt ?? (game.cloze ? `（${qi + 1}）に入る最もよいものを選んでください。` : "");

  return (
    <section className="panel">
      <div className="meta">
        <span>Câu {index + 1} / {steps.length}</span>
        <span>Điểm: {score}</span>
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={index + (answered ? 1 : 0)}>
        <div style={{ width: `${((index + (answered ? 1 : 0)) / steps.length) * 100}%` }} />
      </div>

      <p className="prompt">{game.prompt}</p>

      <div className="passages">
        {set.passages.map((p, i) => (
          <div className="passage" key={i} lang="ja">
            {p.label && <b className="passage-label">{p.label}</b>}
            {renderText(p.text, gapFor)}
          </div>
        ))}
      </div>

      {prompt && <p className="q-prompt" lang="ja">{prompt}</p>}

      <div className={"choices" + (game.cloze ? "" : " long")}>
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
            {q.explanation && <span className="explain">{q.explanation}</span>}
            {set.translation && (
              <details className="trans" key={cur.si}>
                <summary>Xem nghĩa tiếng Việt của bài đọc</summary>
                <p>{set.translation}</p>
              </details>
            )}
          </>
        )}
      </div>

      <div className="row">
        <button className="btn primary" onClick={next} disabled={!answered}>
          {index + 1 >= steps.length ? "Xem kết quả" : "Câu tiếp"}
        </button>
      </div>
    </section>
  );
}