import { useEffect } from "react";
import { parseSentence } from "../lib/quiz.js";
import { isAnswered, isCorrect } from "../lib/exam.js";

const SLOTS = 4;
const emptySlots = () => Array(SLOTS).fill(null);

// [n] -> chỗ trống số n (Đục lỗ), __abc__ -> chữ gạch chân (giống ReadingGame)
function renderText(text, gapFor) {
  return text.split(/(\[\d+\]|__.+?__)/g).map((tok, i) => {
    const gap = tok.match(/^\[(\d+)\]$/);
    if (gap) return gapFor(Number(gap[1]), i);
    const underline = tok.match(/^__(.+)__$/);
    if (underline) return <u key={i}>{underline[1]}</u>;
    return tok;
  });
}

// Hiển thị 1 câu hỏi của đề thi. Có 2 chế độ:
//   review = false: đang làm bài (không hiện đúng/sai, bấm lại đáp án đã chọn để bỏ chọn)
//   review = true : xem lại sau khi nộp bài (hiện đáp án đúng, giải thích)
// answer: quiz/reading = chuỗi đáp án đã chọn; star = mảng 4 ô (vị trí mảnh trong q.options hoặc null)
export default function ExamQuestion({ item, items, answer, answers, onAnswer, review = false }) {
  const { type, q, game } = item;
  const star = q.starIndex ?? 2;
  const slots = type === "star" ? answer ?? emptySlots() : null;

  const setSlots = (next) => onAnswer(next.every((s) => s === null) ? undefined : next);

  // Chọn đáp án thứ i (cũng dùng cho phím tắt 1-4)
  const choose = (i) => {
    if (review || i >= q.options.length) return;
    if (type === "star") {
      const next = [...slots];
      const at = next.indexOf(i);
      if (at !== -1) next[at] = null;
      else {
        const empty = next.indexOf(null);
        if (empty === -1) return;
        next[empty] = i;
      }
      setSlots(next);
    } else {
      const opt = q.options[i];
      onAnswer(answer === opt ? undefined : opt);
    }
  };

  const removeSlot = (si) => {
    if (review) return;
    const next = [...slots];
    next[si] = null;
    setSlots(next);
  };

  // Phím tắt 1-4 (chỉ khi đang làm bài)
  useEffect(() => {
    if (review) return undefined;
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key)) choose(Number(e.key) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const answered = isAnswered(item, answer);
  const ok = isCorrect(item, answer);

  // Danh sách 4 đáp án (nút bấm)
  const renderChoices = (extraClass = "") => (
    <div className={"choices" + extraClass}>
      {q.options.map((opt, i) => {
        let cls = "choice";
        const used = type === "star" ? slots.includes(i) : answer === opt;
        if (review) {
          if (type !== "star" && opt === q.answer) cls += " right";
          else if (type !== "star" && used) cls += " wrong";
          else if (type === "star" && used) cls += " used";
        } else if (used) cls += type === "star" ? " used" : " picked";
        return (
          <button key={opt} className={cls} onClick={() => choose(i)} disabled={review} aria-pressed={used} lang="ja">
            <span className="num">{i + 1}</span>
            <span className="txt">{opt}</span>
          </button>
        );
      })}
    </div>
  );

  // Phần phản hồi khi xem lại
  const renderFeedback = () => (
    <div className="feedback">
      <b className={ok ? "ok" : "bad"}>
        {ok ? "Đúng" : answered ? "Sai" : "Chưa làm"}
        {type !== "star" && !ok && ` · Đáp án: ${q.answer}`}
      </b>
      {type === "star" && (
        <span className="solution" lang="ja">
          {q.before}
          {q.pieces.map((p, i) => (i === star ? <mark key={i}>{p}</mark> : p))}
          {q.after}
        </span>
      )}
      {(q.word || q.han_viet) && (
        <span>
          {q.word && <span lang="ja">{q.word}{q.reading ? `（${q.reading}）` : ""}</span>}
          {q.han_viet && <span className="hanviet" lang="vi">{q.han_viet}</span>}
        </span>
      )}
      {q.grammar && <span lang="ja" className="grammar">{q.grammar}</span>}
      {q.meaning && <span>{q.meaning}</span>}
      {q.explanation && <span className="explain">{q.explanation}</span>}
      {type === "reading" && item.set.translation && (
        <details className="trans">
          <summary>Xem nghĩa tiếng Việt của bài đọc</summary>
          <p>{item.set.translation}</p>
        </details>
      )}
    </div>
  );

  // ----- Hái sao -----
  if (type === "star") {
    const placed = slots.map((s) => (s === null ? null : q.options[s]));
    return (
      <div>
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
            if (review) cls += placed[i] === q.pieces[i] ? " right" : " wrong";
            return (
              <button key={i} className={cls} onClick={() => removeSlot(i)} disabled={review || s === null} lang="ja"
                aria-label={`Ô ${i === star ? "★" : i + 1}${placed[i] ? `: ${placed[i]}` : ": trống"}`}>
                <span className="slot-no">{i === star ? "★" : i + 1}</span>
                {placed[i]}
              </button>
            );
          })}
          {q.after}
        </p>
        {renderChoices()}
        {!review && (
          <div className="row">
            <button className="btn" onClick={() => onAnswer(undefined)} disabled={!answer}>Xếp lại</button>
          </div>
        )}
        {review && renderFeedback()}
      </div>
    );
  }

  // ----- Bài đọc (mondai 9-14) -----
  if (type === "reading") {
    const siblings = items.filter((x) => x.setId === item.setId); // các câu hỏi cùng bài đọc
    const gapFor = (n, key) => {
      if (!game.cloze) return `[${n}]`;
      const sib = siblings[n - 1];
      const chosen = sib ? answers[sib.key] : undefined;
      let cls = "gap";
      if (sib && sib.key === item.key) cls += " current";
      if (chosen !== undefined) cls += review ? (chosen === sib.q.answer ? " right" : " wrong") : " filled";
      return (
        <span key={key} className={cls}>
          {chosen !== undefined ? chosen : `（${n}）`}
        </span>
      );
    };
    const passages = (
      <div className="passages">
        {item.set.passages.map((p, i) => (
          <div className="passage" key={i} lang="ja">
            {p.label && <b className="passage-label">{p.label}</b>}
            {renderText(p.text, gapFor)}
          </div>
        ))}
      </div>
    );
    const prompt = q.prompt ?? (game.cloze ? `（${item.qi + 1}）に入る最もよいものを選んでください。` : "");
    return (
      <div>
        <p className="prompt">{game.prompt}</p>
        {review ? (
          <details className="trans">
            <summary>Xem lại bài đọc</summary>
            {passages}
          </details>
        ) : (
          passages
        )}
        {prompt && <p className="q-prompt" lang="ja">{prompt}</p>}
        {renderChoices(game.cloze ? "" : " long")}
        {review && renderFeedback()}
      </div>
    );
  }

  // ----- Trắc nghiệm 4 đáp án (mondai 1-7) -----
  const { before, target, after } = parseSentence(q.sentence);
  const blank = game.fillBlank;
  const shown = review ? q.answer : answer;
  return (
    <div>
      <p className="prompt">{game.prompt}</p>
      <p className="sentence" lang="ja">
        {before}
        <mark className={blank ? "blank" : undefined}>{blank ? (shown !== undefined ? shown : "　　") : target}</mark>
        {after}
      </p>
      {renderChoices(game.longChoices ? " long" : "")}
      {review && renderFeedback()}
    </div>
  );
}