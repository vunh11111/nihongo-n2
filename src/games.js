import readingData from "./data/reading.json";
import kanjiData from "./data/kanji.json";
import affixData from "./data/affix.json";
import contextData from "./data/context.json";
import synonymData from "./data/synonym.json";
import usageData from "./data/usage.json";
import grammarData from "./data/grammar.json";
import starData from "./data/star.json";
import clozeData from "./data/cloze.json";
import shortData from "./data/short.json";
import mediumData from "./data/medium.json";
import abData from "./data/ab.json";
import longData from "./data/long.json";
import infoData from "./data/info.json";

// Số câu tối đa mỗi lượt chơi (trò trắc nghiệm 4 đáp án)
export const ROUND_SIZE = 10;
// Hái sao (mondai 8) trong đề thi thật có 5 câu nên mỗi lượt cũng lấy 5 câu
export const STAR_ROUND_SIZE = 5;
// Các trò đọc hiểu (mondai 9-14): mỗi lượt chơi gồm bấy nhiêu bài đọc (mỗi bài có nhiều câu hỏi)
export const PASSAGE_ROUND_SIZE = 1;

// Danh sách trò chơi, xếp theo thứ tự các mondai trong đề JLPT N2 (trang chủ hiển thị đúng thứ tự này).
// Muốn thêm trò mới: thêm 1 mục vào đây (đúng vị trí mong muốn).
//
// kind:
//   "quiz"    = trắc nghiệm 4 đáp án cho từng câu (QuizGame)
//   "star"    = xếp mảnh vào 4 ô (StarGame)
//   "reading" = bài đọc + nhiều câu hỏi (ReadingGame)
// Các cờ tùy chọn:
//   fillBlank   : (quiz) hiện chỗ trống, trả lời xong thì điền đáp án vào câu
//   longChoices : (quiz) đáp án là cả câu dài nên xếp 1 cột
//   cloze       : (reading) bài đọc có các chỗ trống [1], [2], ... tương ứng với các câu hỏi
//   unit        : đơn vị hiển thị số lượng dữ liệu ở trang chủ (mặc định "câu")
export const GAMES = [
  {
    id: "reading",
    kind: "quiz",
    mondai: 1,
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
    mondai: 2,
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
    mondai: 3,
    path: "/tien-to-hau-to",
    icon: "接",
    title: "Tiền tố / Hậu tố",
    desc: "Chọn tiền tố hoặc hậu tố thích hợp điền vào chỗ trống.",
    prompt: "Chọn tiền tố / hậu tố thích hợp điền vào chỗ trống",
    roundSize: ROUND_SIZE,
    fillBlank: true,
    questions: affixData,
  },
  {
    id: "context",
    kind: "quiz",
    mondai: 4,
    path: "/dien-tu",
    icon: "語",
    title: "Điền từ",
    desc: "Chọn từ vựng thích hợp nhất với ngữ cảnh để điền vào chỗ trống.",
    prompt: "Chọn từ thích hợp nhất điền vào chỗ trống",
    roundSize: ROUND_SIZE,
    fillBlank: true,
    questions: contextData,
  },
  {
    id: "synonym",
    kind: "quiz",
    mondai: 5,
    path: "/dong-nghia",
    icon: "類",
    title: "Từ đồng nghĩa",
    desc: "Chọn từ hoặc cụm từ có nghĩa gần nhất với từ được gạch chân.",
    prompt: "Chọn từ / cụm từ có nghĩa gần nhất với từ được gạch chân",
    roundSize: ROUND_SIZE,
    questions: synonymData,
  },
  {
    id: "usage",
    kind: "quiz",
    mondai: 6,
    path: "/cach-dung-tu",
    icon: "用",
    title: "Cách dùng từ",
    desc: "Cho một từ, chọn câu dùng từ đó đúng cách nhất trong 4 câu.",
    prompt: "Chọn câu dùng từ này đúng cách nhất",
    roundSize: ROUND_SIZE,
    longChoices: true,
    keepOrder: true, 
    questions: usageData,
  },
  {
    id: "grammar",
    kind: "quiz",
    mondai: 7,
    path: "/ngu-phap",
    icon: "文",
    title: "Ngữ pháp",
    desc: "Chọn mẫu ngữ pháp thích hợp điền vào chỗ trống.",
    prompt: "Chọn mẫu ngữ pháp thích hợp điền vào chỗ trống",
    roundSize: ROUND_SIZE,
    fillBlank: true,
    questions: grammarData,
  },
  {
    id: "star",
    kind: "star",
    mondai: 8,
    path: "/hai-sao",
    icon: "★",
    title: "Hái sao",
    desc: "Xếp 4 mảnh vào 4 ô trống thành câu đúng, mảnh nằm ở ô ★ là đáp án.",
    prompt: "Xếp 4 mảnh vào các ô trống để thành câu hoàn chỉnh",
    roundSize: STAR_ROUND_SIZE,
    questions: starData,
  },
  {
    id: "cloze",
    kind: "reading",
    mondai: 9,
    path: "/duc-lo",
    icon: "空",
    title: "Đục lỗ",
    desc: "Đọc đoạn văn có các chỗ trống, chọn từ / mẫu câu thích hợp cho từng chỗ.",
    prompt: "Chọn đáp án thích hợp nhất cho từng chỗ trống trong đoạn văn",
    roundSize: PASSAGE_ROUND_SIZE,
    cloze: true,
    unit: "bài",
    questions: clozeData,
  },
  {
    id: "short",
    kind: "reading",
    mondai: 10,
    path: "/doan-van",
    icon: "短",
    title: "Đoản văn",
    desc: "Đọc đoạn văn ngắn (khoảng 200 chữ) rồi trả lời câu hỏi nội dung.",
    prompt: "Đọc đoạn văn rồi chọn đáp án đúng",
    roundSize: PASSAGE_ROUND_SIZE,
    unit: "bài",
    questions: shortData,
  },
  {
    id: "medium",
    kind: "reading",
    mondai: 11,
    path: "/trung-van",
    icon: "中",
    title: "Trung văn",
    desc: "Đọc bài văn cỡ vừa (khoảng 500 chữ) rồi trả lời các câu hỏi nội dung.",
    prompt: "Đọc bài văn rồi chọn đáp án đúng",
    roundSize: PASSAGE_ROUND_SIZE,
    unit: "bài",
    questions: mediumData,
  },
  {
    id: "ab",
    kind: "reading",
    mondai: 12,
    path: "/a-va-b",
    icon: "合",
    title: "A và B",
    desc: "Đọc hai bài viết A và B về cùng một chủ đề, so sánh và tổng hợp ý kiến.",
    prompt: "Đọc hai bài viết A và B rồi chọn đáp án đúng",
    roundSize: PASSAGE_ROUND_SIZE,
    unit: "bài",
    questions: abData,
  },
  {
    id: "long",
    kind: "reading",
    mondai: 13,
    path: "/truong-van",
    icon: "長",
    title: "Trường văn",
    desc: "Đọc bài văn dài (khoảng 1000 chữ), nắm bắt chủ trương, ý kiến của tác giả.",
    prompt: "Đọc bài văn rồi chọn đáp án đúng",
    roundSize: PASSAGE_ROUND_SIZE,
    unit: "bài",
    questions: longData,
  },
  {
    id: "info",
    kind: "reading",
    mondai: 14,
    path: "/tim-thong-tin",
    icon: "検",
    title: "Tìm thông tin",
    desc: "Đọc tài liệu thông tin (thông báo, bảng giá, lịch...) và chọn đáp án phù hợp với điều kiện cho trước.",
    prompt: "Đọc tài liệu rồi chọn đáp án phù hợp với điều kiện của câu hỏi",
    roundSize: PASSAGE_ROUND_SIZE,
    unit: "bài",
    questions: infoData,
  },
];