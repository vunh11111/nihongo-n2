# Nihongo N2 - Luyện thi JLPT N2

Web luyện thi JLPT N2 với 14 trò chơi, xếp đúng thứ tự các mondai trong đề thi:

| Mondai | Trò chơi | Nội dung |
|---|---|---|
| 1 | Chọn cách đọc | Chọn phiên âm hiragana đúng của từ được gạch chân |
| 2 | Chọn chữ Hán | Chọn chữ Hán đúng của từ được gạch chân |
| 3 | Tiền tố / Hậu tố | Chọn tiền tố hoặc hậu tố điền vào chỗ trống |
| 4 | Điền từ | Chọn từ vựng thích hợp với ngữ cảnh |
| 5 | Từ đồng nghĩa | Chọn từ/cụm từ có nghĩa gần nhất |
| 6 | Cách dùng từ | Chọn câu dùng từ đúng cách nhất |
| 7 | Ngữ pháp | Chọn mẫu ngữ pháp điền vào chỗ trống |
| 8 | Hái sao | Xếp 4 mảnh vào 4 ô, điểm tính theo mảnh ở ô ★ |
| 9 | Đục lỗ | Bài đọc có nhiều chỗ trống, chọn đáp án cho từng chỗ |
| 10 | Đoản văn | Đọc đoạn văn ngắn, trả lời câu hỏi |
| 11 | Trung văn | Đọc bài văn cỡ vừa, trả lời câu hỏi |
| 12 | A và B | Đọc hai bài viết A, B và so sánh ý kiến |
| 13 | Trường văn | Đọc bài văn dài, nắm ý chính tác giả |
| 14 | Tìm thông tin | Đọc tài liệu thông tin, chọn đáp án theo điều kiện |

Công nghệ: **Vite + React + React Router** (web tĩnh, không cần server). Dữ liệu nằm trong các file JSON.

## Thi thử như đề thật

Vào `/thi-thu` (nút **Thi thử như đề thật** ở trang chủ). Có 3 chế độ:

| Chế độ | Gồm | Thời gian |
|---|---|---|
| Từ vựng + Ngữ pháp | Mondai 1 → 9 | 30-40 phút (chọn bằng thanh trượt, mặc định 35) |
| Đọc hiểu | Mondai 10 → 14 | 65-75 phút (mặc định 70) |
| Toàn bộ đề | Mondai 1 → 14 | 105 phút |

- Đề tạo ngẫu nhiên từ database: mondai 1-8 lấy 5 / 5 / 3 / 7 / 5 / 5 / 12 / 5 câu; mondai 9-14 lấy 1 / 5 / 3 / 1 / 1 / 1 **bài** (số câu hỏi theo dữ liệu của từng bài, ví dụ m10 mỗi bài 1 câu, m11 mỗi bài 3 câu). Cấu trúc này nằm trong `EXAM_SPEC` ở `src/lib/exam.js`.
- Một đề không bao giờ có hai câu trùng nội dung. Database chưa đủ thì đề lấy tối đa số hiện có, màn chọn chế độ có bảng "Cần / Database có".
- Khi làm bài không hiện đáp án đúng/sai, có thể quay lại sửa, đánh dấu xem lại, phím 1-4 chọn đáp án, phím ← → đổi câu. Hết giờ tự nộp bài.
- Kết quả gồm số câu đúng theo từng mondai và tổng, kèm phần xem lại đáp án và giải thích. Hái sao chỉ chấm theo mảnh ở ô ★ như đề thật.
- Tiến độ không được lưu: tải lại trang là mất bài đang làm.

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

Mỗi trò có 1 file JSON trong `src/data/`:

| Trò | File | Kiểu dữ liệu |
|---|---|---|
| Chọn cách đọc | `reading.json` | câu trắc nghiệm |
| Chọn chữ Hán | `kanji.json` | câu trắc nghiệm |
| Tiền tố / Hậu tố | `affix.json` | câu trắc nghiệm |
| Điền từ | `context.json` | câu trắc nghiệm |
| Từ đồng nghĩa | `synonym.json` | câu trắc nghiệm |
| Cách dùng từ | `usage.json` | câu trắc nghiệm |
| Ngữ pháp | `grammar.json` | câu trắc nghiệm |
| Hái sao | `star.json` | xếp 4 mảnh |
| Đục lỗ | `cloze.json` | bài đọc + câu hỏi |
| Đoản văn | `short.json` | bài đọc + câu hỏi |
| Trung văn | `medium.json` | bài đọc + câu hỏi |
| A và B | `ab.json` | bài đọc + câu hỏi |
| Trường văn | `long.json` | bài đọc + câu hỏi |
| Tìm thông tin | `info.json` | bài đọc + câu hỏi |

`id` không được trùng trong cùng một file. Chạy `npm run validate` để kiểm tra dữ liệu; lệnh này cũng tự chạy trước `npm run build`, nên dữ liệu sai sẽ làm build thất bại và Vercel báo lỗi rõ ràng. Dữ liệu trùng nội dung chỉ bị cảnh báo, không làm build thất bại.

### Câu trắc nghiệm (mondai 1-7)

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

- `sentence`: đánh dấu phần cần hỏi bằng `[ ]`.
- `choices`: đúng 4 đáp án khác nhau và phải chứa `answer` (thứ tự được xáo ngẫu nhiên khi chơi).
- Trường bắt buộc theo từng trò:
  - **Chọn cách đọc / Chọn chữ Hán**: `word`, `reading`. Cách đọc thì `[ ]` chứa chữ Hán và `answer` = `reading`; chữ Hán thì `[ ]` chứa hiragana và `answer` = `word`.
  - **Tiền tố / Hậu tố**: thêm `type` là `prefix` (từ bắt đầu bằng `answer`) hoặc `suffix` (từ kết thúc bằng `answer`); `[ ]` là chỗ trống.
  - **Điền từ**: `[ ]` là chỗ trống. `word`, `reading`, `explanation` tùy chọn.
  - **Từ đồng nghĩa**: `[từ gạch chân]` trong câu, `word` = từ đó, 4 đáp án là từ/cụm từ.
  - **Cách dùng từ**: `sentence` chỉ gồm từ cần hỏi, ví dụ `"[あいにく]"`, `word` = từ đó, 4 đáp án là 4 câu hoàn chỉnh.
  - **Ngữ pháp**: `[ ]` là chỗ trống, bắt buộc có `grammar` (tên mẫu ngữ pháp).
- `explanation` (giải thích) luôn là tùy chọn.

### Hái sao (mondai 8)

```
{
  "id": "s006",
  "before": "山田さんは",
  "pieces": ["先輩から", "言われた", "とおりに", "資料を作った"],
  "starIndex": 2,
  "after": "。",
  "meaning": "Yamada đã làm tài liệu đúng như lời tiền bối nói."
}
```

- Câu hoàn chỉnh = `before` + 4 mảnh `pieces` nối theo thứ tự + `after`.
- `pieces`: đúng 4 mảnh khác nhau, **viết theo thứ tự đúng**; khi chơi sẽ được xáo ngẫu nhiên.
- `starIndex`: vị trí ô ★ từ 0 đến 3 (đề thi thật thường là `2`).
- Nên chọn mảnh sao cho chỉ có **một** cách xếp đúng.

### Bài đọc (mondai 9-14)

```
{
  "id": "m002",
  "passages": [{ "text": "Nội dung bài đọc...\n\nĐoạn 2... __chữ gạch chân__ ..." }],
  "translation": "Nghĩa tiếng Việt của bài đọc (không bắt buộc).",
  "questions": [
    {
      "id": "m002-1",
      "prompt": "Câu hỏi?",
      "choices": ["đáp án 1", "đáp án 2", "đáp án 3", "đáp án 4"],
      "answer": "đáp án 2",
      "explanation": "Giải thích (không bắt buộc)."
    }
  ]
}
```

- Mỗi phần tử trong file là **một bài đọc** với nhiều câu hỏi (`questions`).
- Xuống dòng trong bài đọc dùng `\n`; chữ gạch chân dùng `__chữ__`.
- **Đoản văn, Trung văn, Trường văn, Tìm thông tin**: `passages` có đúng 1 đoạn. Với Tìm thông tin, đoạn đó là tài liệu (thông báo, bảng giá, lịch...).
- **A và B**: `passages` có đúng 2 đoạn, thêm `"label": "A"` và `"label": "B"` lần lượt cho từng đoạn.
- **Đục lỗ**: bài đọc chứa các chỗ trống `[1]`, `[2]`, ... mỗi số đúng 1 lần, khớp thứ tự với `questions`; các câu hỏi không cần `prompt`.
- Các trò còn lại bắt buộc mỗi câu hỏi có `prompt`.

## Thêm trò chơi mới

1. Tạo file dữ liệu mới trong `src/data/`.
2. Thêm một mục vào danh sách `GAMES` trong `src/games.js`, đặt đúng vị trí muốn hiển thị (trang chủ và đường dẫn tự cập nhật). Trường `kind`: `"quiz"` (trắc nghiệm), `"star"` (Hái sao) hoặc `"reading"` (bài đọc + nhiều câu hỏi).
3. Trò có cách chơi khác hoàn toàn thì tạo component riêng và rẽ nhánh trong `GameView` ở `src/App.jsx`.
4. Thêm quy tắc kiểm tra cho file dữ liệu mới vào `scripts/validate-data.mjs`.

## Khi database lớn hơn

Với vài trăm đến vài nghìn câu, để JSON như hiện tại vẫn chạy tốt. Nếu sau này cần quản lý hàng chục nghìn câu hoặc lưu tiến độ người dùng, có thể chuyển sang Supabase hoặc Vercel Postgres, tải dữ liệu qua API thay cho file JSON. Phần giao diện không cần viết lại.

## Cấu trúc thư mục

```
src/
  data/        14 file JSON (database, mỗi trò một file)
  components/  QuizGame.jsx (trắc nghiệm), StarGame.jsx (Hái sao), ReadingGame.jsx (đọc hiểu)
  pages/       Home.jsx (trang chủ)
  lib/         quiz.js (xáo trộn, tách câu, tạo bộ đề)
  games.js     danh sách trò chơi theo thứ tự mondai
  styles.css   giao diện (nền tối, chữ trắng)
scripts/       validate-data.mjs (kiểm tra dữ liệu)
```