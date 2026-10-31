# Nihongo N2 - Luyện thi JLPT N2

Web luyện từ vựng tiếng Nhật JLPT N2, gồm 2 trò chơi trắc nghiệm 4 đáp án:

1. **Chọn cách đọc**: cho câu có chữ Hán, chọn phiên âm hiragana đúng.
2. **Chọn chữ Hán**: cho phiên âm hiragana trong câu, chọn chữ Hán đúng.

Công nghệ: **Vite + React + React Router** (web tĩnh, không cần server). Dữ liệu nằm trong các file JSON.

## Chạy trên máy

Cần Node.js 18 trở lên.

```bash
npm install
npm run dev        # mở http://localhost:5173
```

## Deploy lên Vercel

Cách 1 (khuyên dùng): đẩy thư mục này lên GitHub, vào vercel.com, chọn **Add New → Project**, chọn repo.
Vercel tự nhận diện Vite, không cần chỉnh gì thêm (Build Command `npm run build`, Output Directory `dist`).

Cách 2: dùng dòng lệnh.

```bash
npm i -g vercel
vercel            # lần đầu để liên kết dự án
vercel --prod     # deploy bản chính thức
```

File `vercel.json` đã có sẵn để các đường dẫn như `/chon-cach-doc` hoạt động khi tải lại trang.

## Bổ sung database

Mỗi trò có 1 file JSON, hiện mỗi file có 5 câu mẫu:

| Trò | File |
| --- | --- |
| Chọn cách đọc | `src/data/reading.json` |
| Chọn chữ Hán | `src/data/kanji.json` |

Mỗi câu có dạng:

```json
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

Quy tắc:

- `sentence`: đánh dấu phần cần hỏi bằng `[ ]`. Trò **Chọn cách đọc** để chữ Hán trong `[ ]`, trò **Chọn chữ Hán** để hiragana trong `[ ]`.
- `answer`: trò **Chọn cách đọc** thì bằng `reading`, trò **Chọn chữ Hán** thì bằng `word`.
- `choices`: đúng 4 đáp án khác nhau và phải chứa `answer` (thứ tự sẽ được xáo ngẫu nhiên khi chơi).
- `id` không được trùng trong cùng một file.

Chạy `npm run validate` để kiểm tra dữ liệu. Lệnh này cũng tự chạy trước `npm run build`, nên dữ liệu sai sẽ làm build thất bại và Vercel sẽ báo lỗi rõ ràng thay vì đưa lỗi lên web.

## Thêm trò chơi mới

1. Tạo file dữ liệu mới trong `src/data/`.
2. Thêm một mục vào danh sách `GAMES` trong `src/games.js` (trang chủ và đường dẫn tự cập nhật).
3. Nếu trò mới cũng là trắc nghiệm 4 đáp án, component `QuizGame` dùng lại được ngay. Trò có cách chơi khác thì tạo component riêng và khai báo route trong `src/App.jsx`.

## Khi database lớn hơn

Với vài trăm đến vài nghìn câu, để JSON như hiện tại vẫn chạy tốt. Nếu sau này cần quản lý hàng chục nghìn câu hoặc lưu tiến độ người dùng, có thể chuyển sang Supabase hoặc Vercel Postgres, tải dữ liệu qua API trong `QuizGame` thay cho file JSON. Phần giao diện không cần viết lại.

## Cấu trúc thư mục

```
src/
  data/        reading.json, kanji.json (database)
  components/  QuizGame.jsx (trò trắc nghiệm dùng chung)
  pages/       Home.jsx (trang chủ)
  lib/         quiz.js (xáo trộn, tách câu)
  games.js     danh sách trò chơi
  styles.css   giao diện (nền tối, chữ trắng, như bộ Football Hub)
scripts/       validate-data.mjs (kiểm tra dữ liệu)
```
