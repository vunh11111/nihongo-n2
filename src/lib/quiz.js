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

// Tạo bộ đề cho 1 lượt chơi: xáo thứ tự câu, lấy tối đa `size` câu, xáo thứ tự 4 đáp án
export function buildDeck(questions, size = questions.length) {
  return shuffle(questions)
    .slice(0, size)
    .map((q) => ({ ...q, options: shuffle(q.choices) }));
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