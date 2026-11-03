// Kiểm tra dữ liệu trước khi build: chạy bằng `npm run validate` (tự chạy khi `npm run build`)
// Lỗi  -> build thất bại. Cảnh báo (câu trùng) -> chỉ in ra, không làm build thất bại.
import { readFileSync } from "node:fs";

// Các loại dữ liệu (kind), xếp theo thứ tự mondai:
//   reading  (1)  answer = reading, vùng [ ] là chữ Hán (word)
//   kanji    (2)  answer = word, vùng [ ] là hiragana (reading)
//   affix    (3)  answer là tiền tố/hậu tố; điền answer vào [ ] thì câu phải chứa word
//   context  (4)  điền từ vào chỗ trống [ ]
//   synonym  (5)  [từ gạch chân] + 4 đáp án là từ/cụm từ đồng nghĩa; word = từ gạch chân
//   usage    (6)  sentence là "[từ]", 4 đáp án là 4 câu; word = từ cần dùng
//   grammar  (7)  điền mẫu ngữ pháp vào chỗ trống [ ]
//   star     (8)  Hái sao: before + 4 mảnh `pieces` theo thứ tự đúng + after
//   cloze    (9)  bài đọc có chỗ trống [1], [2]... + câu hỏi tương ứng
//   short (10), medium (11), ab (12), long (13), info (14): bài đọc + các câu hỏi
const FILES = [
  { file: "src/data/reading.json", kind: "reading" },
  { file: "src/data/kanji.json", kind: "kanji" },
  { file: "src/data/affix.json", kind: "affix" },
  { file: "src/data/context.json", kind: "context" },
  { file: "src/data/synonym.json", kind: "synonym" },
  { file: "src/data/usage.json", kind: "usage" },
  { file: "src/data/grammar.json", kind: "grammar" },
  { file: "src/data/star.json", kind: "star" },
  { file: "src/data/cloze.json", kind: "cloze" },
  { file: "src/data/short.json", kind: "short" },
  { file: "src/data/medium.json", kind: "medium" },
  { file: "src/data/ab.json", kind: "ab" },
  { file: "src/data/long.json", kind: "long" },
  { file: "src/data/info.json", kind: "info" },
];

const REQUIRED = {
  reading: ["id", "sentence", "word", "reading", "answer", "choices", "meaning"],
  kanji: ["id", "sentence", "word", "reading", "answer", "choices", "meaning"],
  affix: ["id", "sentence", "word", "reading", "answer", "choices", "meaning"],
  context: ["id", "sentence", "answer", "choices", "meaning"],
  synonym: ["id", "sentence", "word", "answer", "choices", "meaning"],
  usage: ["id", "sentence", "word", "answer", "choices", "meaning"],
  grammar: ["id", "sentence", "answer", "choices", "meaning", "grammar"],
  star: ["id", "pieces", "meaning"],
};
const SET_KINDS = new Set(["cloze", "short", "medium", "ab", "long", "info"]);

// Chấp nhận cả dấu half-width [ ] lẫn full-width ［ ］ để đánh dấu phần cần hỏi
const MARK_TEST = /[\[［].+[\]］]/;
const MARK_CAPTURE = /[\[［](.+?)[\]］]/;
const MARK_REPLACE = /[\[［].+?[\]］]/;

const errors = [];
const warnings = [];

// Kiểm tra 4 đáp án: đủ 4 cái, khác nhau, answer nằm trong đó
function checkChoices(q, at) {
  if (!Array.isArray(q.choices) || q.choices.length !== 4) errors.push(`${at}: cần đúng 4 đáp án trong choices`);
  else {
    if (q.choices.some((c) => typeof c !== "string" || c === "")) errors.push(`${at}: mỗi đáp án phải là chuỗi không rỗng`);
    if (new Set(q.choices).size !== 4) errors.push(`${at}: các đáp án bị trùng nhau`);
    if (!q.choices.includes(q.answer)) errors.push(`${at}: answer phải nằm trong choices`);
  }
}

for (const { file, kind } of FILES) {
  const list = JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
  const ids = new Set();
  const seen = new Map(); // để cảnh báo dữ liệu trùng nội dung

  list.forEach((q, i) => {
    const at = `${file} #${i + 1} (${q.id ?? "không có id"})`;
    if (q.id === undefined || q.id === "") errors.push(`${at}: thiếu trường "id"`);
    if (ids.has(q.id)) errors.push(`${at}: id bị trùng`);
    ids.add(q.id);

    let key;
    if (SET_KINDS.has(kind)) {
      validateSet(q, at, kind);
      key = (q.passages ?? []).map((p) => p?.text).join("|");
    } else if (kind === "star") {
      for (const f of REQUIRED.star) if (q[f] === undefined || q[f] === "") errors.push(`${at}: thiếu trường "${f}"`);
      validateStar(q, at);
      key = `${q.before ?? ""}|${(q.pieces ?? []).join("|")}|${q.after ?? ""}`;
    } else {
      for (const f of REQUIRED[kind]) if (q[f] === undefined || q[f] === "") errors.push(`${at}: thiếu trường "${f}"`);
      validateQuiz(q, at, kind);
      key = q.sentence ?? "";
    }
    seen.set(key, [...(seen.get(key) ?? []), q.id]);
  });

  const dup = [...seen.values()].filter((v) => v.length > 1);
  if (dup.length)
    warnings.push(`${file}: ${dup.length} nhóm dữ liệu trùng nội dung (vd: ${dup.slice(0, 3).map((v) => v.join(" = ")).join("; ")}${dup.length > 3 ? "; ..." : ""})`);

  console.log(`${file}: ${list.length} ${SET_KINDS.has(kind) ? "bài" : "câu"}`);
}

// Trò trắc nghiệm 4 đáp án cho từng câu (mondai 1-7)
function validateQuiz(q, at, kind) {
  if (!MARK_TEST.test(q.sentence ?? "")) errors.push(`${at}: sentence cần đánh dấu phần cần hỏi bằng [ ] hoặc ［ ］`);
  checkChoices(q, at);
  const m = (q.sentence ?? "").match(MARK_CAPTURE);

  if (kind === "reading" || kind === "kanji") {
    const answerField = kind === "reading" ? "reading" : "word";
    const expectedTarget = kind === "reading" ? q.word : q.reading;
    if (q.answer !== q[answerField]) errors.push(`${at}: answer phải trùng với "${answerField}"`);
    if (m && m[1] !== expectedTarget) errors.push(`${at}: phần trong dấu ngoặc ("${m[1]}") phải là "${expectedTarget}"`);
  } else if (kind === "affix") {
    if (!["prefix", "suffix"].includes(q.type)) errors.push(`${at}: type phải là "prefix" hoặc "suffix"`);
    const filled = (q.sentence ?? "").replace(MARK_REPLACE, q.answer ?? "");
    if (q.word && !filled.includes(q.word)) errors.push(`${at}: điền answer vào chỗ trống thì câu phải chứa từ "${q.word}"`);
    // tiền tố thì đứng đầu từ, hậu tố thì đứng cuối từ
    if (q.type === "prefix" && q.word && !q.word.startsWith(q.answer)) errors.push(`${at}: type là "prefix" nhưng từ "${q.word}" không bắt đầu bằng "${q.answer}" (có phải là "suffix"?)`);
    if (q.type === "suffix" && q.word && !q.word.endsWith(q.answer)) errors.push(`${at}: type là "suffix" nhưng từ "${q.word}" không kết thúc bằng "${q.answer}" (có phải là "prefix"?)`);
  } else if (kind === "synonym" || kind === "usage") {
    // phần trong dấu ngoặc phải đúng là từ được hỏi (word)
    if (m && m[1] !== q.word) errors.push(`${at}: phần trong dấu ngoặc ("${m[1]}") phải trùng với "word" ("${q.word}")`);
  }
  // context, grammar: chỉ cần các kiểm tra chung ở trên
}

// Trò Hái sao (mondai 8)
function validateStar(q, at) {
  for (const f of ["before", "after"])
    if (typeof q[f] !== "string") errors.push(`${at}: "${f}" phải là chuỗi (có thể để trống "")`);
  if (!Array.isArray(q.pieces) || q.pieces.length !== 4) errors.push(`${at}: pieces cần đúng 4 mảnh`);
  else {
    if (q.pieces.some((p) => typeof p !== "string" || p === "")) errors.push(`${at}: mỗi mảnh trong pieces phải là chuỗi không rỗng`);
    if (new Set(q.pieces).size !== 4) errors.push(`${at}: các mảnh trong pieces bị trùng nhau`);
  }
  if (!Number.isInteger(q.starIndex) || q.starIndex < 0 || q.starIndex > 3)
    errors.push(`${at}: starIndex phải là số nguyên từ 0 đến 3 (0 = ô thứ nhất)`);
}

// Các trò đọc hiểu (mondai 9-14): 1 bài đọc (passages) + nhiều câu hỏi (questions)
function validateSet(q, at, kind) {
  if (!Array.isArray(q.passages) || q.passages.length === 0) {
    errors.push(`${at}: cần mảng passages có ít nhất 1 đoạn`);
  } else {
    q.passages.forEach((p, i) => {
      if (typeof p?.text !== "string" || p.text.trim() === "") errors.push(`${at}: passages[${i}] thiếu "text"`);
    });
    if (kind === "ab") {
      const labels = q.passages.map((p) => p?.label);
      if (q.passages.length !== 2 || labels[0] !== "A" || labels[1] !== "B")
        errors.push(`${at}: trò "A và B" cần đúng 2 đoạn với label lần lượt là "A" và "B"`);
    } else if (q.passages.length !== 1) {
      errors.push(`${at}: kind "${kind}" chỉ có 1 đoạn trong passages`);
    }
  }
  if (q.translation !== undefined && typeof q.translation !== "string") errors.push(`${at}: translation phải là chuỗi`);

  if (!Array.isArray(q.questions) || q.questions.length === 0) {
    errors.push(`${at}: cần mảng questions có ít nhất 1 câu hỏi`);
    return;
  }
  const qids = new Set();
  q.questions.forEach((sub, i) => {
    const sat = `${at} › câu ${i + 1} (${sub.id ?? "không có id"})`;
    if (sub.id === undefined || sub.id === "") errors.push(`${sat}: thiếu trường "id"`);
    if (qids.has(sub.id)) errors.push(`${sat}: id bị trùng trong cùng bài`);
    qids.add(sub.id);
    if (sub.answer === undefined || sub.answer === "") errors.push(`${sat}: thiếu trường "answer"`);
    if (kind !== "cloze" && !sub.prompt) errors.push(`${sat}: thiếu trường "prompt" (nội dung câu hỏi)`);
    checkChoices(sub, sat);
  });

  // Đục lỗ: bài đọc phải có đủ các chỗ trống [1]..[n], mỗi số đúng 1 lần, n = số câu hỏi
  if (kind === "cloze") {
    const text = (q.passages ?? []).map((p) => p?.text ?? "").join("\n");
    const nums = [...text.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
    const expected = q.questions.map((_, i) => i + 1);
    if (nums.length !== expected.length || !expected.every((n) => nums.filter((x) => x === n).length === 1))
      errors.push(`${at}: chỗ trống trong bài đọc phải là [1] đến [${expected.length}], mỗi số đúng 1 lần (đang có: ${nums.join(", ") || "không có"})`);
  }
}

if (warnings.length) console.warn("\nCảnh báo (không làm build thất bại):\n- " + warnings.join("\n- "));

if (errors.length) {
  console.error("\nDữ liệu có lỗi:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("Dữ liệu hợp lệ.");