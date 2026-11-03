import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ExamQuestion from "./ExamQuestion.jsx";
import { formatTime, isAnswered } from "../lib/exam.js";

// Màn hình đang làm bài: đồng hồ đếm ngược, bảng số câu, đánh dấu xem lại, nộp bài.
// Hết giờ thì tự nộp bài. Không hiện đáp án đúng/sai khi đang làm.
export default function ExamRunner({ items, minutes, onFinish }) {
  const total = minutes * 60;
  const [startAt] = useState(() => Date.now());
  const [left, setLeft] = useState(total);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [confirming, setConfirming] = useState(false);
  const doneRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const item = items[index];

  const finish = useCallback(
    (timedOut) => {
      if (doneRef.current) return;
      doneRef.current = true;
      onFinish({
        answers: answersRef.current,
        usedSeconds: Math.min(total, Math.round((Date.now() - startAt) / 1000)),
        timedOut,
      });
    },
    [onFinish, startAt, total]
  );

  // Đồng hồ: tính theo thời điểm bắt đầu nên không bị lệch khi tab bị ẩn
  useEffect(() => {
    const t = setInterval(() => {
      setLeft(Math.max(0, Math.ceil((startAt + total * 1000 - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(t);
  }, [startAt, total]);

  useEffect(() => {
    if (left <= 0) finish(true);
  }, [left, finish]);

  // Cảnh báo khi vô tình tải lại / đóng tab lúc đang thi
  useEffect(() => {
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const setAnswer = useCallback(
    (value) => {
      setAnswers((a) => {
        const next = { ...a };
        if (value === undefined) delete next[item.key];
        else next[item.key] = value;
        return next;
      });
    },
    [item.key]
  );

  const go = useCallback((i) => setIndex(Math.min(items.length - 1, Math.max(0, i))), [items.length]);

  // Phím mũi tên trái/phải để chuyển câu
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  // Gom các câu theo mondai cho bảng số câu
  const groups = useMemo(() => {
    const g = [];
    items.forEach((it, i) => {
      let last = g[g.length - 1];
      if (!last || last.mondai !== it.mondai) {
        last = { mondai: it.mondai, title: it.game.title, list: [] };
        g.push(last);
      }
      last.list.push(i);
    });
    return g;
  }, [items]);

  const answeredCount = items.filter((it) => isAnswered(it, answers[it.key])).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const toggleFlag = () => setFlagged((f) => ({ ...f, [item.key]: !f[item.key] }));

  return (
    <div className="exam-run">
      <div className="exam-bar">
        <span className={"timer" + (left <= 300 ? " warn" : "")} aria-live="off">⏱ {formatTime(left)}</span>
        <span className="exam-count">Đã làm {answeredCount} / {items.length}</span>
        <button className="btn primary" onClick={() => setConfirming(true)}>Nộp bài</button>
      </div>

      {confirming && (
        <section className="panel confirm" role="alertdialog" aria-label="Xác nhận nộp bài">
          <p>
            Bạn đã làm <b>{answeredCount}</b> / {items.length} câu
            {items.length - answeredCount > 0 && <>, còn <b className="bad">{items.length - answeredCount}</b> câu chưa làm</>}
            {flaggedCount > 0 && <>, <b>{flaggedCount}</b> câu đang đánh dấu xem lại</>}. Nộp bài ngay?
          </p>
          <div className="row">
            <button className="btn" onClick={() => setConfirming(false)}>Tiếp tục làm bài</button>
            <button className="btn primary" onClick={() => finish(false)}>Nộp bài</button>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="meta">
          <span>Câu {index + 1} / {items.length}</span>
          <span>Mondai {item.mondai} · {item.game.title}</span>
        </div>
        <ExamQuestion
          key={item.key}
          item={item}
          items={items}
          answer={answers[item.key]}
          answers={answers}
          onAnswer={setAnswer}
        />
        <div className="row between">
          <button className="btn" onClick={() => go(index - 1)} disabled={index === 0}>← Câu trước</button>
          <button className={"btn" + (flagged[item.key] ? " flag-on" : "")} onClick={toggleFlag} aria-pressed={!!flagged[item.key]}>
            🚩 {flagged[item.key] ? "Bỏ đánh dấu" : "Đánh dấu xem lại"}
          </button>
          <button className="btn primary" onClick={() => go(index + 1)} disabled={index === items.length - 1}>Câu sau →</button>
        </div>
      </section>

      <section className="panel exam-nav" aria-label="Bảng số câu">
        {groups.map((g) => (
          <div className="nav-group" key={g.mondai}>
            <span className="nav-label">Mondai {g.mondai} · {g.title}</span>
            <div className="nav-btns">
              {g.list.map((i) => {
                const it = items[i];
                let cls = "nav-btn";
                if (isAnswered(it, answers[it.key])) cls += " done";
                if (flagged[it.key]) cls += " flagged";
                if (i === index) cls += " current";
                return (
                  <button key={it.key} className={cls} onClick={() => go(i)} aria-label={`Câu ${i + 1}`} aria-current={i === index}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <p className="nav-legend">
          <span className="nav-btn done">đã làm</span> <span className="nav-btn">chưa làm</span> <span className="nav-btn flagged">đánh dấu</span>
        </p>
      </section>
    </div>
  );
}