import readingData from "./data/reading.json";
import kanjiData from "./data/kanji.json";
import affixData from "./data/affix.json";
import grammarData from "./data/grammar.json";
import starData from "./data/star.json";

// Số câu tối đa mỗi lượt chơi
export const ROUND_SIZE = 10;
// Hái sao (mondai 8) trong đề thi thật có 5 câu nên mỗi lượt cũng lấy 5 câu
export const STAR_ROUND_SIZE = 5;

// Danh sách trò chơi. Muốn thêm trò mới: thêm 1 mục vào đây rồi tạo trang tương ứng trong App.jsx
// kind: "quiz" = trắc nghiệm 4 đáp án (QuizGame), "star" = xếp mảnh vào 4 ô (StarGame)
export const GAMES = [
  {
    id: "reading",
    kind: "quiz",
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
    kind: "quiz",
    path: "/chon-han-tu",
    icon: "漢",
    title: "Chọn chữ Hán",
    desc: "Cho phiên âm hiragana trong câu, chọn chữ Hán đúng của từ được gạch chân.",
    prompt: "Chọn chữ Hán đúng của từ được gạch chân",
    roundSize: ROUND_SIZE,
    questions: kanjiData,
  },
  {
    id: "affix",
    kind: "quiz",
    path: "/tien-to-hau-to",
    icon: "接",
    title: "Tiền tố / Hậu tố",
    desc: "Giống mondai 3 của đề JLPT: chọn tiền tố hoặc hậu tố thích hợp điền vào chỗ trống.",
    prompt: "Chọn tiền tố / hậu tố thích hợp điền vào chỗ trống",
    roundSize: ROUND_SIZE,
    fillBlank: true, // hiện chỗ trống, trả lời xong thì điền đáp án vào câu
    questions: affixData,
  },
  {
    id: "grammar",
    kind: "quiz",
    path: "/ngu-phap",
    icon: "文",
    title: "Ngữ pháp",
    desc: "Giống mondai 7 của đề JLPT: chọn mẫu ngữ pháp thích hợp điền vào chỗ trống.",
    prompt: "Chọn mẫu ngữ pháp thích hợp điền vào chỗ trống",
    roundSize: ROUND_SIZE,
    fillBlank: true,
    questions: grammarData,
  },
  {
    id: "star",
    kind: "star",
    path: "/hai-sao",
    icon: "★",
    title: "Hái sao",
    desc: "Giống mondai 8 của đề JLPT: xếp 4 mảnh vào 4 ô trống thành câu đúng, mảnh nằm ở ô ★ là đáp án.",
    prompt: "Xếp 4 mảnh vào các ô trống để thành câu hoàn chỉnh",
    roundSize: STAR_ROUND_SIZE,
    questions: starData,
  },
];