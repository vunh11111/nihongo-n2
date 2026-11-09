// Các hàm dùng chung cho mọi trò chơi dạng trắc nghiệm

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Tách câu có đánh dấu [phần cần hỏi] thành 3 phần: trước, mục tiêu, sau
// Chấp nhận cả dấu half-width [ ] lẫn full-width ［ ］
const SENTENCE_MARK = /^(.*?)[\[［](.+?)[\]］](.*)$/s;

export function parseSentence(sentence) {
  const m = sentence.match(SENTENCE_MARK);
  return m ? { before: m[1], target: m[2], after: m[3] } : { before: sentence, target: "", after: "" };
}

// Khóa để nhận biết 2 mục trùng nội dung (khác id nhưng giống hệt nhau)
//   kind = "star"   -> Hái sao: so theo before + các mảnh + after
//   kind = "reading"-> bài đọc (mondai 9-14): so theo nội dung các đoạn văn
//   còn lại         -> trắc nghiệm: so theo câu + đáp án đúng
// (cùng 1 câu nhưng khác đáp án, ví dụ mondai 6 hỏi cùng 1 từ, vẫn được coi là 2 câu khác nhau)
export function dedupeKey(kind, q) {
  if (kind === "reading") return (q.passages ?? []).map((p) => p.text).join("|");
  if (kind === "star") return `${q.before}|${(q.pieces ?? []).join("|")}|${q.after}`;
  return `${q.sentence}|${q.answer}`;
}

// Loại các mục trùng nội dung, giữ lại mục xuất hiện đầu tiên và giữ nguyên thứ tự
export function uniqueQuestions(questions, kind) {
  const seen = new Set();
  return questions.filter((q) => {
    const k = dedupeKey(kind, q);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Tạo bộ đề cho 1 lượt chơi: xáo thứ tự câu, lấy tối đa `size` câu.
// Thứ tự 4 đáp án: mặc định xáo ngẫu nhiên; nếu keepOrder = true thì giữ đúng thứ tự trong `choices`
export function buildDeck(questions, size = questions.length, keepOrder = false) {
  return shuffle(questions)
    .slice(0, size)
    .map((q) => ({ ...q, options: keepOrder ? [...q.choices] : shuffle(q.choices) }));
}

// Xáo 4 mảnh câu của trò Hái sao, đảm bảo thứ tự hiển thị khác thứ tự đúng
function shuffleDifferent(list) {
  for (let i = 0; i < 10; i++) {
    const s = shuffle(list);
    if (s.some((x, k) => x !== list[k])) return s;
  }
  return [...list].reverse();
}

// Tạo bộ đề cho trò Hái sao: `pieces` lưu theo thứ tự đúng, `options` là các mảnh đã xáo
export function buildStarDeck(questions, size = questions.length) {
  return shuffle(questions)
    .slice(0, size)
    .map((q) => ({ ...q, options: shuffleDifferent(q.pieces) }));
}

// Chọn ngẫu nhiên 1 trò chơi. Nếu có `excludeId` thì cố gắng chọn trò khác trò đó
export function pickRandomGame(games, excludeId) {
  const playable = games.filter((g) => g.questions.length > 0);
  const others = playable.filter((g) => g.id !== excludeId);
  const pool = others.length ? others : playable;
  return pool[Math.floor(Math.random() * pool.length)];
}