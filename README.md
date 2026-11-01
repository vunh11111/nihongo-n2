# Nihongo N2 - Luyện thi JLPT N2

Web luyện thi JLPT N2 với 5 trò chơi:

1. **Chọn cách đọc**: cho câu có chữ Hán, chọn phiên âm hiragana đúng.
2. **Chọn chữ Hán**: cho phiên âm hiragana trong câu, chọn chữ Hán đúng.
3. **Tiền tố / Hậu tố** (mondai 3): chọn tiền tố hoặc hậu tố điền vào chỗ trống.
4. **Ngữ pháp** (mondai 7): chọn mẫu ngữ pháp thích hợp điền vào chỗ trống.
5. **Hái sao** (mondai 8): xếp 4 mảnh vào 4 ô trống thành câu đúng; điểm tính theo mảnh nằm ở ô ★ như đề thi thật.

Công nghệ: **Vite + React + React Router** (web tĩnh, không cần server). Dữ liệu nằm trong các file JSON.

## Chạy trên máy

Cần Node.js 18 trở lên.

```
npm install
npm run dev        # mở http://localhost:5173
```

## Deploy lên Vercel

Cách 1 (khuyên dùng): đẩy thư mục này lên GitHub, vào vercel.com, chọn **Add New → Project**, chọn repo. Vercel tự nhận diện Vite, không cần chỉnh gì thêm (Build Command `npm run build`, Output Directory `dist`).

Cách 2: dùng dòng lệnh.

```
npm i -g vercel
vercel            # lần đầu để liên kết dự án
vercel --prod     # deploy bản chính thức
```

File `vercel.json` đã có sẵn để các đường dẫn như `/chon-cach-doc` hoạt động khi tải lại trang.

## Bổ sung database

Mỗi trò có 1 file JSON:

| Trò               | File                    |
|-------------------|-------------------------|
| Chọn cách đọc     | `src/data/reading.json` |
| Chọn chữ Hán      | `src/data/kanji.json`   |
| Tiền tố / Hậu tố  | `src/data/affix.json`   |
| Ngữ pháp          | `src/data/grammar.json` |
| Hái sao           | `src/data/star.json`    |

### Trò trắc nghiệm (cách đọc, chữ Hán, tiền tố/hậu tố)

```
{
  "id": "r006",
  "sentence": "日本は多くの国と[貿易]をしている。",
  "word": "貿易",
  "reading": "ぼうえき",
  "answer": "ぼうえき",
  "choices": ["ぼうえき", "ぼうやく", "ぼえき", "もうえき"],
  "meaning": "thương mại, mậu dịch",
  "level": "N2"
}
```

- `sentence`: đánh dấu phần cần hỏi bằng `[ ]`. Trò **Chọn cách đọc** để chữ Hán trong `[ ]`, trò **Chọn chữ Hán** để hiragana trong `[ ]`.
- `answer`: trò **Chọn cách đọc** thì bằng `reading`, trò **Chọn chữ Hán** thì bằng `word`.
- `choices`: đúng 4 đáp án khác nhau và phải chứa `answer` (thứ tự được xáo ngẫu nhiên khi chơi).
- **Tiền tố / Hậu tố**: thêm `type` là `prefix` (từ bắt đầu bằng `answer`) hoặc `suffix` (từ kết thúc bằng `answer`); `[ ]` là chỗ trống.

### Ngữ pháp (mondai 7)

```
{
  "id": "g006",
  "sentence": "留学[ ]、彼は日本語に興味を持つようになった。",
  "answer": "をきっかけに",
  "choices": ["をきっかけに", "を問わず", "をめぐって", "をはじめ"],
  "grammar": "～をきっかけに",
  "meaning": "Nhân dịp đi du học, anh ấy bắt đầu hứng thú với tiếng Nhật.",
  "explanation": "Giải thích mẫu ngữ pháp (không bắt buộc).",
  "level": "N2"
}
```

- `[ ]` là chỗ trống; trả lời xong thì đáp án được điền vào câu.
- Bắt buộc có `grammar` (tên mẫu ngữ pháp) và `meaning` (nghĩa/dịch câu). `explanation` là tùy chọn.

### Hái sao (mondai 8)

```
{
  "id": "s006",
  "before": "山田さんは",
  "pieces": ["先輩から", "言われた", "とおりに", "資料を作った"],
  "starIndex": 2,
  "after": "。",
  "meaning": "Yamada đã làm tài liệu đúng như lời tiền bối nói.",
  "grammar": "～とおりに",
  "explanation": "Giải thích (không bắt buộc).",
  "level": "N2"
}
```

- Câu hoàn chỉnh = `before` + 4 mảnh `pieces` nối theo thứ tự + `after`.
- `pieces`: đúng 4 mảnh khác nhau, **viết theo thứ tự đúng**; khi chơi sẽ được xáo ngẫu nhiên.
- `starIndex`: vị trí ô ★ từ 0 đến 3 (đề thi thật thường là `2`, tức ô thứ 3).
- `before` / `after` có thể là chuỗi rỗng `""`.
- Nên chọn mảnh sao cho chỉ có **một** cách xếp đúng.

### Quy tắc chung

- `id` không được trùng trong cùng một file.

Chạy `npm run validate` để kiểm tra dữ liệu. Lệnh này cũng tự chạy trước `npm run build`, nên dữ liệu sai sẽ làm build thất bại và Vercel sẽ báo lỗi rõ ràng thay vì đưa lỗi lên web. Câu trùng nội dung chỉ bị cảnh báo, không làm build thất bại.

## Thêm trò chơi mới

1. Tạo file dữ liệu mới trong `src/data/`.
2. Thêm một mục vào danh sách `GAMES` trong `src/games.js` (trang chủ và đường dẫn tự cập nhật). Trường `kind`: `"quiz"` cho trắc nghiệm 4 đáp án, `"star"` cho Hái sao.
3. Nếu trò mới cũng là trắc nghiệm 4 đáp án, component `QuizGame` dùng lại được ngay. Trò có cách chơi khác thì tạo component riêng (như `StarGame`) và rẽ nhánh trong `GameView` ở `src/App.jsx`.
4. Thêm quy tắc kiểm tra cho file dữ liệu mới vào `scripts/validate-data.mjs`.

## Khi database lớn hơn

Với vài trăm đến vài nghìn câu, để JSON như hiện tại vẫn chạy tốt. Nếu sau này cần quản lý hàng chục nghìn câu hoặc lưu tiến độ người dùng, có thể chuyển sang Supabase hoặc Vercel Postgres, tải dữ liệu qua API thay cho file JSON. Phần giao diện không cần viết lại.

## Cấu trúc thư mục

```
src/
  data/        reading.json, kanji.json, affix.json, grammar.json, star.json (database)
  components/  QuizGame.jsx (trắc nghiệm dùng chung), StarGame.jsx (Hái sao)
  pages/       Home.jsx (trang chủ)
  lib/         quiz.js (xáo trộn, tách câu, tạo bộ đề)
  games.js     danh sách trò chơi
  styles.css   giao diện (nền tối, chữ trắng, như bộ Football Hub)
scripts/       validate-data.mjs (kiểm tra dữ liệu)
```