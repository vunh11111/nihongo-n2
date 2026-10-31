// Kiểm tra dữ liệu trước khi build: chạy bằng `npm run validate` (tự chạy khi `npm run build`)
import { readFileSync } from "node:fs";

const FILES = [
  { file: "src/data/reading.json", answerField: "reading" },
  { file: "src/data/kanji.json", answerField: "word" },
];
const errors = [];

for (const { file, answerField } of FILES) {
  const list = JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
  const ids = new Set();
  list.forEach((q, i) => {
    const at = `${file} #${i + 1} (${q.id ?? "không có id"})`;
    for (const f of ["id", "sentence", "word", "reading", "answer", "choices", "meaning"])
      if (q[f] === undefined || q[f] === "") errors.push(`${at}: thiếu trường "${f}"`);
    if (ids.has(q.id)) errors.push(`${at}: id bị trùng`);
    ids.add(q.id);
    if (!/\[.+\]/.test(q.sentence ?? "")) errors.push(`${at}: sentence cần đánh dấu phần cần hỏi bằng [ ]`);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) errors.push(`${at}: cần đúng 4 đáp án trong choices`);
    else {
      if (new Set(q.choices).size !== 4) errors.push(`${at}: các đáp án bị trùng nhau`);
      if (!q.choices.includes(q.answer)) errors.push(`${at}: answer phải nằm trong choices`);
    }
    if (q.answer !== q[answerField]) errors.push(`${at}: answer phải trùng với "${answerField}"`);
    const m = (q.sentence ?? "").match(/\[(.+?)\]/);
    const expectedTarget = answerField === "reading" ? q.word : q.reading;
    if (m && m[1] !== expectedTarget) errors.push(`${at}: phần trong [ ] ("${m[1]}") phải là "${expectedTarget}"`);
  });
  console.log(`${file}: ${list.length} câu`);
}

if (errors.length) {
  console.error("\nDữ liệu có lỗi:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("Dữ liệu hợp lệ.");
