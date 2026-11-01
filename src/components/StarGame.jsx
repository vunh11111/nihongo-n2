import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GAMES } from "../games.js";
import { buildStarDeck, pickRandomGame } from "../lib/quiz.js";

const SLOTS = 4;
const emptySlots = () => Array(SLOTS).fill(null);

// Trò Hái sao (mondai 8): xếp 4 mảnh vào 4 ô trống thành câu đúng.
// Giống đề thi thật, điểm chỉ tính theo mảnh nằm ở ô ★; phần phản hồi hiện cả thứ tự đúng đầy đủ.
export default function StarGame({ game }) {
  const navigate = useNavigate();
  const [round, setRound] = useState(0);
  const deck = useMemo(() => buildStarDeck(game.questions, game.roundSize), [game, round]);
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState(emptySlots); // slots[i] = vị trí của mảnh trong q.options, hoặc null
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = deck[index];
  const star = q?.starIndex ?? 2;
  const full = slots.every((s) => s !== null);

  // Bấm mảnh: chưa xếp thì đặt vào ô trống đầu tiên, đã xếp rồi thì bỏ ra
  const place = useCallback(
    (optIndex) => {
      if (checked || !q || optIndex >= q.options.length) return;
      setSlots((prev) => {
        const next = [...prev];
        const at = next.indexOf(optIndex);
        if (at !== -1) {
          next[at] = null;
          return next;
        }
        const empty = next.indexOf(null);
        if (empty === -1) return prev;
        next[empty] = optIndex;
        return next;
      });
    },
    [checked, q]
  );

  const removeSlot = useCallback(
    (slotIndex) => {
      if (checked) return;
      setSlots((prev) => prev.map((s, i) => (i === slotIndex ? null : s)));
    },
    [checked]
  );

  const removeLast = useCallback(() => {
    if (checked) return;
    setSlots((prev) => {
      let last = -1;
      prev.forEach((s, i) => {
        if (s !== null) last = i;
      });
      return last === -1 ? prev : prev.map((s, i) => (i === last ? null : s));
    });
  }, [checked]);

  const check = useCallback(() => {
    if (checked || !full || !q) return;
    setChecked(true);
    if (q.options[slots[star]] === q.pieces[star]) setScore((s) => s + 1);
  }, [checked, full, q, slots, star]);

  const next = useCallback(() => {
    if (index + 1 >= deck.length) setFinished(true);
    else {
      setIndex((i) => i + 1);
      setSlots(emptySlots());
      setChecked(false);
    }
  }, [index, deck.length]);

  const restart = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setSlots(emptySlots());
    setChecked(false);
    setScore(0);
    setFinished(false);
  };

  const playRandomOther = () => navigate(pickRandomGame(GAMES, game.id).path);

  // Phím tắt: 1-4 xếp/bỏ mảnh, Backspace bỏ mảnh vừa xếp, Enter / Space / mũi tên phải để kiểm tra rồi sang câu tiếp
  useEffect(() => {
    const onKey = (e) => {
      if (finished || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key)) place(Number(e.key) - 1);
      else if (e.key === "Backspace") {
        e.preventDefault();
        removeLast();
      } else if (["Enter", " ", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        if (checked) next();
        else check();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, checked, place, removeLast, check, next]);

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

  const placed = slots.map((s) => (s === null ? null : q.options[s]));
  const slotOk = placed.map((p, i) => p === q.pieces[i]);
  const starOk = slotOk[star];
  const fullOk = slotOk.every(Boolean);
  const anyPlaced = slots.some((s) => s !== null);

  return (
    <section className="panel">
      <div className="meta">
        <span>Câu {index + 1} / {deck.length}</span>
        <span>Điểm: {score}</span>
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={deck.length} aria-valuenow={index + (checked ? 1 : 0)}>
        <div style={{ width: `${((index + (checked ? 1 : 0)) / deck.length) * 100}%` }} />
      </div>

      <p className="prompt">
        {game.prompt}
        <span className="tag">Đáp án là mảnh ở ô ★</span>
      </p>
      <p className="sentence" lang="ja">
        {q.before}
        {slots.map((s, i) => {
          let cls = "slot";
          if (i === star) cls += " star";
          if (s !== null) cls += " filled";
          if (checked) cls += slotOk[i] ? " right" : " wrong";
          return (
            <button
              key={i}
              className={cls}
              onClick={() => removeSlot(i)}
              disabled={checked || s === null}
              aria-label={`Ô ${i === star ? "★" : i + 1}${placed[i] ? `: ${placed[i]}` : ": trống"}`}
              lang="ja"
            >
              <span className="slot-no">{i === star ? "★" : i + 1}</span>
              {placed[i]}
            </button>
          );
        })}
        {q.after}
      </p>

      <div className="choices">
        {q.options.map((opt, i) => {
          const used = slots.includes(i);
          return (
            <button
              key={opt}
              className={"choice" + (used ? " used" : "")}
              onClick={() => place(i)}
              disabled={checked}
              aria-pressed={used}
              lang="ja"
            >
              <span className="num">{i + 1}</span>
              <span className="txt">{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="feedback" aria-live="polite">
        {!checked && <span className="hint">Bấm mảnh (hoặc phím 1-4) để xếp vào ô trống. Bấm ô đã xếp hoặc Backspace để bỏ ra.</span>}
        {checked && (
          <>
            <b className={starOk ? "ok" : "bad"}>
              {fullOk
                ? "Chính xác!"
                : starOk
                ? "Đúng ô ★ (được điểm), nhưng thứ tự các ô còn lại chưa đúng hết."
                : `Chưa đúng. Mảnh ở ô ★ là: ${q.pieces[star]}`}
            </b>
            <span className="solution" lang="ja">
              {q.before}
              {q.pieces.map((p, i) => (i === star ? <mark key={i}>{p}</mark> : p))}
              {q.after}
            </span>
            <span>{q.meaning}</span>
            {q.grammar && <span lang="ja" className="grammar">{q.grammar}</span>}
            {q.explanation && <span className="explain">{q.explanation}</span>}
          </>
        )}
      </div>

      <div className="row">
        {!checked && (
          <button className="btn" onClick={() => setSlots(emptySlots())} disabled={!anyPlaced}>
            Xếp lại
          </button>
        )}
        {checked ? (
          <button className="btn primary" onClick={next}>
            {index + 1 >= deck.length ? "Xem kết quả" : "Câu tiếp"}
          </button>
        ) : (
          <button className="btn primary" onClick={check} disabled={!full}>
            Kiểm tra
          </button>
        )}
      </div>
    </section>
  );
}