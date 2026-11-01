// Kiểm tra dữ liệu trước khi build: chạy bằng `npm run validate` (tự chạy khi `npm run build`)
import { readFileSync } from "node:fs";

// kind: "reading" -> answer = reading, vùng [ ] là chữ Hán (word)
//       "kanji"   -> answer = word, vùng [ ] là hiragana (reading)
//       "affix"   -> answer là tiền tố/hậu tố, vùng [ ] là chỗ trống; điền answer vào thì câu phải chứa word
const FILES = [
  { file: "src/data/reading.json", kind: "reading" },
  { file: "src/data/kanji.json", kind: "kanji" },
  { file: "src/data/affix.json", kind: "affix" },
];

// Chấp nhận cả dấu half-width [ ] lẫn full-width ［ ］ để đánh dấu phần cần hỏi
const MARK_TEST = /[\[［].+[\]］]/;
const MARK_CAPTURE = /[\[［](.+?)[\]］]/;
const MARK_REPLACE = /[\[［].+?[\]］]/;
const errors = [];

for (const { file, kind } of FILES) {
  const list = JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
  const ids = new Set();
  list.forEach((q, i) => {
    const at = `${file} #${i + 1} (${q.id ?? "không có id"})`;
    for (const f of ["id", "sentence", "word", "reading", "answer", "choices", "meaning"])
      if (q[f] === undefined || q[f] === "") errors.push(`${at}: thiếu trường "${f}"`);
    if (ids.has(q.id)) errors.push(`${at}: id bị trùng`);
    ids.add(q.id);
    if (!MARK_TEST.test(q.sentence ?? "")) errors.push(`${at}: sentence cần đánh dấu phần cần hỏi bằng [ ] hoặc ［ ］`);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) errors.push(`${at}: cần đúng 4 đáp án trong choices`);
    else {
      if (new Set(q.choices).size !== 4) errors.push(`${at}: các đáp án bị trùng nhau`);
      if (!q.choices.includes(q.answer)) errors.push(`${at}: answer phải nằm trong choices`);
    }

    const m = (q.sentence ?? "").match(MARK_CAPTURE);
    if (kind === "reading" || kind === "kanji") {
      const answerField = kind === "reading" ? "reading" : "word";
      const expectedTarget = kind === "reading" ? q.word : q.reading;
      if (q.answer !== q[answerField]) errors.push(`${at}: answer phải trùng với "${answerField}"`);
      if (m && m[1] !== expectedTarget) errors.push(`${at}: phần trong dấu ngoặc ("${m[1]}") phải là "${expectedTarget}"`);
    } else {
      if (!["prefix", "suffix"].includes(q.type)) errors.push(`${at}: type phải là "prefix" hoặc "suffix"`);
      const filled = (q.sentence ?? "").replace(MARK_REPLACE, q.answer ?? "");
      if (q.word && !filled.includes(q.word)) errors.push(`${at}: điền answer vào chỗ trống thì câu phải chứa từ "${q.word}"`);
    }
  });
  console.log(`${file}: ${list.length} câu`);
}

if (errors.length) {
  console.error("\nDữ liệu có lỗi:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("Dữ liệu hợp lệ.");