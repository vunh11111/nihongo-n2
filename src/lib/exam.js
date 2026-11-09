import { GAMES } from "../games.js";
import { buildDeck, buildStarDeck, shuffle } from "./quiz.js";

// ===== Cấu trúc đề thi thật =====
// Với mondai 1-8: count = SỐ CÂU lấy ngẫu nhiên từ database.
// Với mondai 9-14 (bài đọc): count = SỐ BÀI; số câu hỏi do dữ liệu của từng bài quyết định
//   m9 Đục lỗ: 1 bài (số chỗ trống của bài) | m10: 5 bài x 1 câu | m11: 3 bài x 3 câu
//   m12: 1 bài (2 câu) | m13: 1 bài (3 câu) | m14: 1 bài (2 câu)
// Muốn đổi cấu trúc đề thì chỉ cần sửa các con số này.
export const EXAM_SPEC = {
  1: { count: 5 },
  2: { count: 5 },
  3: { count: 3 },
  4: { count: 7 },
  5: { count: 5 },
  6: { count: 5 },
  7: { count: 12 },
  8: { count: 5 },
  9: { count: 1 },
  10: { count: 5 },
  11: { count: 3 },
  12: { count: 1 },
  13: { count: 1 },
  14: { count: 1 },
};

// Phần thi: mondai 1-9 là từ vựng + ngữ pháp, mondai 10-14 là đọc hiểu
export const SECTIONS = [
  { id: "language", title: "Từ vựng + Ngữ pháp", from: 1, to: 9 },
  { id: "reading", title: "Đọc hiểu", from: 10, to: 14 },
];
export const sectionOf = (mondai) => SECTIONS.find((s) => mondai >= s.from && mondai <= s.to);

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// Các chế độ thi: thời gian chọn trong khoảng [min, max] phút
export const MODES = [
  {
    id: "language",
    title: "Từ vựng + Ngữ pháp",
    desc: "Mondai 1 → 9",
    mondai: range(1, 9),
    min: 30,
    max: 40,
    defaultMinutes: 35,
  },
  {
    id: "reading",
    title: "Đọc hiểu",
    desc: "Mondai 10 → 14",
    mondai: range(10, 14),
    min: 65,
    max: 75,
    defaultMinutes: 70,
  },
  {
    id: "full",
    title: "Toàn bộ đề",
    desc: "Mondai 1 → 14",
    mondai: range(1, 14),
    min: 105,
    max: 105,
    defaultMinutes: 105,
  },
];
export const getMode = (id) => MODES.find((m) => m.id === id) ?? MODES[2];

// ===== Lấy ngẫu nhiên =====
// GAMES[].questions đã được loại câu trùng nội dung trong games.js nên ở đây chỉ cần xáo rồi lấy.
const randomPool = (game) => shuffle(game.questions);

// Mỗi mondai: cần bao nhiêu, database hiện có bao nhiêu (đã loại trùng)
export function getAvailability(modeId) {
  return getMode(modeId).mondai.map((m) => {
    const game = GAMES.find((g) => g.mondai === m);
    return {
      mondai: m,
      title: game?.title ?? `Mondai ${m}`,
      unit: game?.kind === "reading" ? "bài" : "câu",
      need: EXAM_SPEC[m]?.count ?? 0,
      have: game ? game.questions.length : 0,
    };
  });
}

// Tạo đề thi: danh sách câu hỏi (đã trải phẳng) theo đúng thứ tự mondai
export function buildExam(modeId) {
  const items = [];
  for (const m of getMode(modeId).mondai) {
    const game = GAMES.find((g) => g.mondai === m);
    const need = EXAM_SPEC[m]?.count ?? 0;
    if (!game || !need) continue;
    const picked = randomPool(game).slice(0, need);

    if (game.kind === "reading") {
      picked.forEach((set) => {
        set.questions.forEach((q, qi) =>
          items.push({
            key: `m${m}-${set.id}-${q.id}`,
            type: "reading",
            mondai: m,
            game,
            set,
            setId: `m${m}-${set.id}`,
            qi,
            q: { ...q, options: shuffle(q.choices) },
          })
        );
      });
    } else if (game.kind === "star") {
      buildStarDeck(picked).forEach((q) => items.push({ key: `m${m}-${q.id}`, type: "star", mondai: m, game, q }));
    } else {
        buildDeck(picked, picked.length, game.keepOrder).forEach((q) => items.push({ key: `m${m}-${q.id}`, type: "quiz", mondai: m, game, q }));
    }
  }
  return items;
}

// ===== Chấm điểm =====
// quiz / reading: answer là đáp án (chuỗi) đã chọn
// star: answer là mảng 4 phần tử (vị trí mảnh trong q.options hoặc null); như đề thật chỉ chấm ô ★
export function isAnswered(item, answer) {
  if (item.type === "star") return Array.isArray(answer) && answer[item.q.starIndex ?? 2] != null;
  return answer !== undefined;
}

export function isCorrect(item, answer) {
  if (!isAnswered(item, answer)) return false;
  if (item.type === "star") {
    const star = item.q.starIndex ?? 2;
    return item.q.options[answer[star]] === item.q.pieces[star];
  }
  return answer === item.q.answer;
}

export function scoreExam(items, answers) {
  const rows = new Map();
  let correct = 0;
  let answered = 0;
  for (const it of items) {
    const row = rows.get(it.mondai) ?? { mondai: it.mondai, title: it.game.title, total: 0, correct: 0 };
    row.total += 1;
    if (isAnswered(it, answers[it.key])) answered += 1;
    if (isCorrect(it, answers[it.key])) {
      row.correct += 1;
      correct += 1;
    }
    rows.set(it.mondai, row);
  }
  const list = [...rows.values()].sort((a, b) => a.mondai - b.mondai);
  const sections = SECTIONS.map((s) => {
    const inSection = list.filter((r) => r.mondai >= s.from && r.mondai <= s.to);
    return {
      id: s.id,
      title: s.title,
      total: inSection.reduce((n, r) => n + r.total, 0),
      correct: inSection.reduce((n, r) => n + r.correct, 0),
    };
  }).filter((s) => s.total > 0);
  return { total: items.length, correct, answered, rows: list, sections };
}

export const percent = (correct, total) => (total ? Math.round((correct / total) * 100) : 0);

// 125 -> "02:05"
export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// ===== Chặn thoát nhầm khi đang thi =====
// beforeunload chỉ bắt được tải lại / đóng tab, không bắt được điều hướng trong app (bấm "← Trang chủ",
// nút Back của trình duyệt). ExamRunner bật cờ này khi đang làm bài, App và ExamRunner dựa vào đó để hỏi lại.
export const LEAVE_EXAM_MESSAGE = "Bạn đang làm bài thi. Nếu rời khỏi trang, toàn bộ bài làm sẽ bị mất. Bạn có chắc muốn thoát?";

let examActive = false;
export const setExamActive = (value) => {
  examActive = value;
};

// true = được phép rời đi (không đang thi, hoặc người dùng đã xác nhận thoát)
export function confirmLeaveExam() {
  return !examActive || window.confirm(LEAVE_EXAM_MESSAGE);
}