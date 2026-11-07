import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ExamRunner from "../components/ExamRunner.jsx";
import ExamQuestion from "../components/ExamQuestion.jsx";
import { MODES, buildExam, formatTime, getAvailability, getMode, isCorrect, isAnswered, percent, scoreExam } from "../lib/exam.js";

// Trang thi thử: 3 bước = chọn chế độ (setup) -> làm bài (run) -> kết quả (result)
export default function Exam() {
  const [phase, setPhase] = useState("setup");
  const [modeId, setModeId] = useState("full");
  const [minutes, setMinutes] = useState(() => Object.fromEntries(MODES.map((m) => [m.id, m.defaultMinutes])));
  const [exam, setExam] = useState(null); // { items, minutes, modeId, attempt }
  const [result, setResult] = useState(null); // { answers, usedSeconds, timedOut }

  const start = () => {
    const items = buildExam(modeId);
    if (!items.length) return;
    setExam({ items, minutes: minutes[modeId], modeId, attempt: Date.now() });
    setResult(null);
    setPhase("run");
  };

  const onFinish = useCallback((r) => {
    setResult(r);
    setPhase("result");
    window.scrollTo?.(0, 0);
  }, []);

  if (phase === "run" && exam) {
    return <ExamRunner key={exam.attempt} items={exam.items} minutes={exam.minutes} onFinish={onFinish} />;
  }
  if (phase === "result" && exam && result) {
    return <ResultView exam={exam} result={result} onRetry={() => setPhase("setup")} />;
  }

  const mode = getMode(modeId);
  const rows = getAvailability(modeId);
  const fixedTime = mode.min === mode.max;
  const totalAvailable = rows.reduce((n, r) => n + Math.min(r.need, r.have), 0);
  const short = rows.filter((r) => r.have < r.need);

  return (
    <section className="exam-setup">
      <h2>Thi thử như đề thật</h2>
      <p className="sub">Đề được tạo ngẫu nhiên từ database, số lượng câu giống đề thi thật. Không hiện đáp án khi đang làm bài, hết giờ sẽ tự nộp.</p>

      <div className="mode-cards" role="radiogroup" aria-label="Chế độ thi">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={m.id === modeId}
            className={"mode-card" + (m.id === modeId ? " selected" : "")}
            onClick={() => setModeId(m.id)}
          >
            <b>{m.title}</b>
            <span>{m.desc}</span>
            <em>{m.min === m.max ? `${m.max} phút` : `${m.min}-${m.max} phút`}</em>
          </button>
        ))}
      </div>

      <div className="panel time-box">
        {fixedTime ? (
          <p>Thời gian làm bài: <b>{mode.max} phút</b> (cố định)</p>
        ) : (
          <>
            <label htmlFor="exam-minutes">Thời gian làm bài: <b>{minutes[modeId]} phút</b></label>
            <input
              id="exam-minutes"
              type="range"
              min={mode.min}
              max={mode.max}
              step={5}
              value={minutes[modeId]}
              onChange={(e) => setMinutes((t) => ({ ...t, [modeId]: Number(e.target.value) }))}
            />
            <div className="range-ends"><span>{mode.min} phút</span><span>{mode.max} phút</span></div>
          </>
        )}
      </div>

      <div className="panel">
        <table className="avail">
          <thead>
            <tr><th>Mondai</th><th>Số lượng</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.mondai} className={r.have < r.need ? "lack" : ""}>
                <td>{r.mondai}. {r.title}</td>
                <td>{r.need} {r.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {short.length > 0 && (
          <p className="warn-text">
            Database chưa đủ ở {short.length} mondai. Đề sẽ lấy tối đa số câu hiện có (không lặp lại câu).
          </p>
        )}
      </div>

      <div className="row center">
        <Link className="btn" to="/">← Trang chủ</Link>
        <button className="btn primary big" onClick={start} disabled={totalAvailable === 0}>Bắt đầu thi</button>
      </div>
    </section>
  );
}

// Màn hình kết quả + xem lại từng câu
function ResultView({ exam, result, onRetry }) {
  const { items } = exam;
  const { answers } = result;
  const score = useMemo(() => scoreExam(items, answers), [items, answers]);
  const [onlyWrong, setOnlyWrong] = useState(true);
  const pct = percent(score.correct, score.total);
  const shown = items.map((it, i) => ({ it, i })).filter(({ it }) => !onlyWrong || !isCorrect(it, answers[it.key]));

  return (
    <section className="exam-result">
      <div className="panel center">
        <h2>{result.timedOut ? "Hết giờ!" : "Đã nộp bài"}</h2>
        <p className="score-big">{score.correct} / {score.total}</p>
        <p>{pct}% câu đúng · Thời gian làm bài: {formatTime(result.usedSeconds)} / {formatTime(exam.minutes * 60)} · Đã làm {score.answered} / {score.total} câu</p>
        {score.sections.length > 1 && (
          <p className="sections">
            {score.sections.map((s) => (
              <span key={s.id} className="tag">{s.title}: {s.correct}/{s.total} ({percent(s.correct, s.total)}%)</span>
            ))}
          </p>
        )}
      </div>

      <div className="panel">
        <h3>Kết quả theo từng mondai</h3>
        {score.rows.map((r) => (
          <div className="res-row" key={r.mondai}>
            <span className="res-name">Mondai {r.mondai} · {r.title}</span>
            <div className="res-bar" aria-hidden="true"><div style={{ width: `${percent(r.correct, r.total)}%` }} /></div>
            <span className="res-num">{r.correct}/{r.total}</span>
          </div>
        ))}
      </div>

      <div className="row center">
        <button className="btn primary" onClick={onRetry}>Làm đề mới</button>
        <Link className="btn" to="/">Về trang chủ</Link>
      </div>

      <div className="review-head">
        <h3>Xem lại đáp án</h3>
        <label className="check">
          <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} /> Chỉ hiện câu sai / chưa làm
        </label>
      </div>
      {shown.length === 0 && <p className="empty">Tuyệt vời, bạn không sai câu nào!</p>}
      {shown.map(({ it, i }) => (
        <section className="panel review-item" key={it.key}>
          <div className="meta">
            <span>Câu {i + 1} · Mondai {it.mondai} · {it.game.title}</span>
            <span className={isCorrect(it, answers[it.key]) ? "ok" : "bad"}>
              {isCorrect(it, answers[it.key]) ? "Đúng" : isAnswered(it, answers[it.key]) ? "Sai" : "Chưa làm"}
            </span>
          </div>
          <ExamQuestion item={it} items={items} answer={answers[it.key]} answers={answers} onAnswer={() => {}} review />
        </section>
      ))}
    </section>
  );
}