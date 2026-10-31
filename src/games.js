import readingData from "./data/reading.json";
import kanjiData from "./data/kanji.json";

// Số câu tối đa mỗi lượt chơi (áp dụng cho các trò bên dưới)
export const ROUND_SIZE = 10;

// Danh sách trò chơi. Muốn thêm trò mới: thêm 1 mục vào đây rồi tạo trang tương ứng trong App.jsx
export const GAMES = [
  {
    id: "reading",
    path: "/chon-cach-doc",
    icon: "読",
    title: "Chọn cách đọc",
    desc: "Cho câu có chữ Hán, chọn phiên âm hiragana đúng của từ được gạch chân.",
    prompt: "Chọn cách đọc đúng của từ được gạch chân",
    roundSize: ROUND_SIZE,
    questions: readingData,
  },
  {
    id: "kanji",
    path: "/chon-han-tu",
    icon: "漢",
    title: "Chọn chữ Hán",
    desc: "Cho phiên âm hiragana trong câu, chọn chữ Hán đúng của từ được gạch chân.",
    prompt: "Chọn chữ Hán đúng của từ được gạch chân",
    roundSize: ROUND_SIZE,
    questions: kanjiData,
  },
];