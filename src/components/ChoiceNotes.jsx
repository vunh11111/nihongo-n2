// Giải nghĩa từng đáp án sau khi trả lời (hiện dùng cho Mondai 4):
//   Đáp án đúng: 比例 — tỷ lệ thuận
//   対応 (đáp án sai): ứng phó; tương ứng
//   比較 (đáp án sai): sự so sánh
//   応答 (đáp án sai): sự hồi đáp, trả lời
//
// Dữ liệu: q.choice_meanings = { "đáp án": "nghĩa tiếng Việt", ... } cho cả 4 đáp án (q.base_form: chữ gốc, nếu có).
// Mỗi dòng là 1 <span> nằm trong .feedback (cột flex) nên tự xuống dòng, không cần thêm CSS.
// Các đáp án sai được liệt kê theo đúng thứ tự đang hiện trên màn hình (q.options).
export default function ChoiceNotes({ q }) {
  const notes = q.choice_meanings;
  if (!notes) return null;
  const order = q.options ?? q.choices ?? Object.keys(notes);
  const baseForm = q.base_form ? `（${q.base_form}）` : "";
  return (
    <>
      <span className="explain">
        Đáp án đúng: <span lang="ja">{q.answer}{baseForm}</span> — {notes[q.answer]}
      </span>
      {order
        .filter((c) => c !== q.answer)
        .map((c) => (
          <span key={c} className="explain">
            <span lang="ja">{c}</span> (đáp án sai): {notes[c]}
          </span>
        ))}
    </>
  );
}