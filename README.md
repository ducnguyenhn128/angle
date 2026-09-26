# Thử Thách Hình Học

Ứng dụng web luyện tập nền tảng hình học THCS dưới dạng mini-game: học sinh chọn cấp độ, trả lời câu hỏi trắc nghiệm, tích lũy điểm để hoàn thành thử thách. Dành cho giáo viên và học sinh muốn ôn tập nhanh các khái niệm cơ bản như góc nhọn/vuông/tù/bẹt, ước lượng số đo góc, đếm góc, tia/đường thẳng/đoạn thẳng, đường song song, đường vuông góc/đường cao, tia phân giác, so sánh góc, góc kề bù/đối đỉnh, tính góc tổng hợp.

---

## Tính năng chính

- **9 cấp độ**:

  | ID | Tên | Mô tả |
  |----|-----|-------|
  | `1` | Nhận biết loại góc | Góc nhọn, vuông, tù, bẹt - hình vẽ SVG sinh ngẫu nhiên |
  | `2` | Ước lượng số đo góc | Chọn đáp án gần đúng (sai số rộng) |
    | `3` | Đếm số góc trên hình | Dùng kho hình `count-angles` |
  | `4` | Đường thẳng · Tia · Đoạn thẳng | Dùng kho hình `rays-lines` |
  | `5` | Hai đường thẳng song song | Chế độ giáo viên, HS trả lời miệng, có gợi ý đáp án |
  | `6` | Đường vuông góc · Đường cao | Dùng kho hình `perpendicular` |
  | `7` | Tia phân giác | Dùng kho hình `bisector` |
  | `8` | So sánh góc | 4 dạng trộn: so sánh 2 góc, tia phân giác, đường vuông góc, góc kề bù/đối đỉnh (SVG động) |
  | `9` | Tính góc tổng hợp | Tính số đo góc: kề bù, đối đỉnh, tia phân giác, so le trong/đồng vị/trong cùng phía, tổng 3 góc tam giác & góc ngoài, bài nhiều bước (SVG động) |

- **Hệ thống điểm**: mỗi câu đúng +10 điểm, chuỗi từ 3 câu đúng liên tiếp trở lên được +15 điểm, sai không trừ điểm. Mục tiêu mỗi cấp độ là 150 điểm.
- **Kho hình bằng TikZ / tkz-euclide**: hình học được vẽ chính xác, render ra SVG để tích hợp web.
- **Giải thích sau mỗi câu**: HS xem ngay lý do đúng/sai để củng cố kiến thức.
- **Chế độ giáo viên (Level 5)**: chỉ hiển thị hình và gợi ý đáp án ẩn, GV tự hỏi HS và kiểm tra bằng nút bật/tắt gợi ý.

---

## Công nghệ sử dụng

- **Frontend**: React 19, Vite 7, Tailwind CSS 4
- **Animation**: Framer Motion
- **Icon**: Lucide React
- **Linting**: ESLint 9 với flat config
- **Hình học**: LaTeX (`standalone`, `tkz-euclide`, `dvisvgm`) để vẽ và xuất SVG

---

## Cấu trúc thư mục

```text
angle/
├── dist/                    # Build production (do Vite tạo)
├── figures-src/             # Nguồn LaTeX của các hình minh họa
│   ├── _theme.tex           # Màu sắc chung cho hình vẽ
│   ├── build-figures.ps1    # Pipeline build hình
│   ├── bisector/            # Tia phân giác
│   ├── count-angles/        # Đếm góc
│   ├── parallel/            # Đường thẳng song song (chế độ GV)
│   ├── perpendicular/       # Đường vuông góc / đường cao
│   └── rays-lines/          # Tia, đường thẳng, đoạn thẳng
├── public/figures/          # SVG hình minh họa sau khi build
├── src/
│   ├── components/          # Các component dùng chung (AngleFigure, FigureViewer, ...)
│   ├── data/
│   │   └── figures-manifest.json  # Dữ liệu câu hỏi, tự động sinh từ %META trong .tex
│   ├── game/                # Game loop và generators
│   ├── levels/              # Các component cấp độ
│   ├── App.jsx              # Màn hình chọn cấp độ
│   ├── index.css            # Theme và utility Tailwind
│   └── main.jsx             # Entry React
├── .gitignore
├── eslint.config.js         # Cấu hình ESLint 9
├── index.html
├── netlify.toml             # Cấu hình triển khai Netlify
├── package.json
└── README.md
```

> **Lưu ý**: `src/data/figures-manifest.json` là file tự động sinh, **không nên sửa trực tiếp**. Dữ liệu câu hỏi được khai báo trong comment `%META` của từng file `.tex` rồi pipeline sẽ tổng hợp.

---

## Yêu cầu

### Để chạy web

- Node.js 20+ (khuyên dùng LTS mới nhất)
- npm

### Để build thêm hình (tùy chọn)

- MiKTeX (Windows) hoặc TeX Live (Linux/macOS) với các gói:
  - `standalone`
  - `tkz-euclide`
  - `dvisvgm` (thường đi kèm TeX distribution)
- Trên Windows, PowerShell cho phép chạy script (`-ExecutionPolicy Bypass`)

---

## Cài đặt và chạy

```bash
# 1. Cài dependency
npm install

# 2. Chạy dev server
npm run dev
```

Mở trình duyệt tại địa chỉ Vite hiển thị (thường là `http://localhost:5173`).

---

## Các script có sẵn

| Script | Chức năng |
|--------|-----------|
| `npm run dev` | Chạy server phát triển với HMR |
| `npm run build` | Build production ra thư mục `dist/` |
| `npm run preview` | Xem trước bản production sau khi build |
| `npm run lint` | Kiểm tra code với ESLint |
| `npm run figures` | Build toàn bộ hình từ `figures-src/` sang `public/figures/` và cập nhật `figures-manifest.json` |
| `npm run figures -- -Topic bisector` | Chỉ build hình của một chủ đề (PowerShell) |

> **Lưu ý khi build hình**: script mặc định chạy `pdflatex` và `dvisvgm`. Nếu chưa cài LaTeX, bạn vẫn có thể chạy web bình thường vì `public/figures/` đã chứa sẵn các SVG.

---

## Cách thêm hình minh họa mới

### 1. Tạo file `.tex` trong đúng thư mục chủ đề

Ví dụ thêm hình tia phân giác mới:

```text
figures-src/bisector/bi04.tex
```

### 2. Khai báo metadata bằng comment `%META`

Với hình dùng cho **câu hỏi trắc nghiệm**:

```latex
%META {"question":"Trong hình, Oz là tia phân giác của góc nào?","options":["Góc xOy","Góc xOz","Góc yOz","Không có"],"answer":0,"note":"Vì Oz nằm giữa Ox, Oy và chia góc xOy thành hai góc bằng nhau."}
\documentclass[border=5pt]{standalone}
\usepackage{tkz-euclide}
\usetikzlibrary{arrows.meta}
\input{_theme.tex}
\begin{document}
\begin{tikzpicture}[line width=1.1pt,>={Stealth[length=3.5mm]}]
  \coordinate (O) at (0,0);
  \coordinate (X) at (3.6,0);
  \coordinate (Y) at (1.5,2.9);
  \coordinate (Z) at (3.1,1.87);
  \draw[tmblue,->] (O) -- (X) node[below=3pt]{$x$};
  \draw[tmblue,->] (O) -- (Y) node[above right=1pt]{$y$};
  \draw[tmpink,->] (O) -- (Z) node[right=3pt]{$z$};
  \tkzMarkAngles[size=0.75,arc=l,color=tmgreen,line width=1pt](X,O,Z)
  \tkzMarkAngles[size=0.75,arc=l,color=tmgreen,line width=1pt](Z,O,Y)
\end{tikzpicture}
\end{document}
```

Với hình dùng cho **chế độ giáo viên** (Level 5 - song song):

```latex
%META {"title":"Cặp góc so le trong","note":"Hai góc được đánh dấu là một cặp góc so le trong bằng nhau → a // b."}
```

Các trường `%META`:

- `question`, `options`, `answer`, `note`: dùng cho câu hỏi trắc nghiệm (`answer` là chỉ số đáp án đúng, bắt đầu từ 0).
- `title`, `note`: dùng cho chế độ GV.

### 3. Build hình

```bash
npm run figures
```

Sau đó, `public/figures/<topic>/<file>.svg` và `src/data/figures-manifest.json` sẽ được cập nhật.

### 4. Kiểm tra

Chạy `npm run dev` và vào cấp độ tương ứng để xem hình mới.

---

## Luyện tập & kiểm tra theo bài (ngân hàng câu hỏi)

Chức năng dành cho **học sinh trung bình và yếu, lớp 7 và lớp 8**. Bài học xếp theo **SGK Kết nối tri thức**, trong đó lớp 8 tập trung vào chương Tứ giác.

- **Hai chế độ.** *Luyện tập*: sai được làm lại một lần, phương án đã chọn sai bị gạch và gợi ý tự mở. *Kiểm tra*: mỗi câu trả lời một lần, chấm theo thang 10.
- **Gợi ý theo bậc** (`hints`), **thẻ "Nhắc lại kiến thức"** của từng bài (`recap` trong `lessons.json`) và nút **"Luyện lại câu sai"** ở màn kết quả. Khi luyện lại, câu được sinh lại với phương án trộn mới hoặc số liệu mới.
- **Nguồn câu hỏi.** Câu soạn sẵn nằm trong `src/data/questions/<lesson>.json`. Câu có hình được sinh tự động từ generator của các level cũ, khai báo trong `src/quiz/bank.js`.

`src/data/lessons.json` có cấu trúc Khối → Chương → Bài: `[{ grade, label, chapters: [{ id, name, lessons: [{ id, name, skills, recap? }] }] }]`. Mã bài có dạng `<lớp>-<số bài SGK>`, ví dụ `8-12` là Bài 12 lớp 8 (Hình bình hành). Bài chưa có câu hỏi hiện mờ, kèm chữ "sắp có".

**Trường chung của mỗi câu:** `id`, `type`, `lesson`, `skills`, `level` (`NB` | `TH` | `VD` | `VDC`), `stem`, `hints?`, `figure?` (ví dụ `"bisector/bi01"` → `public/figures/bisector/bi01.svg`), `explanation`.

| type | Trường riêng |
|------|--------------|
| `mcq` | `options: string[]`, `answer: number` |
| `true-false` | `answer: boolean` |
| `multi-select` | `options: string[]`, `answers: number[]`. App tự hiện "Chọn N đáp án" |
| `fill-blank` | `stem` chứa ô `{{}}`, `blanks: [{ accept: string[], tol?: number }]` |
| `hotspot` | `shape` (bắt buộc), `pick: ('vertex' \| 'side' \| 'diagonal' \| 'angle')[]`, `answers: string[]`. Mã phần tử: đỉnh `A`, cạnh `AB`, đường chéo `AC`, góc `∠A`. Có 1 đáp án thì chạm là chấm luôn |
| `classify` | `groups: string[]` (2–3 nhóm), `items: [{ text?, shape?, group }]` (3–8 mục; `group` là chỉ số nhóm; mục có thể là hình tứ giác). HS chạm nút nhóm dưới mỗi mục |
| `match` | `pairs: [{ left, right }]` (2–4 cặp), `extra?: string[]` (phương án nhiễu bên phải). HS chạm ô rồi chạm phương án |
| `order` | `steps: string[]` (3–5 bước, viết theo ĐÚNG thứ tự; app tự trộn). Các bước phải có thứ tự duy nhất, tránh hai bước "giả thiết" đổi chỗ được cho nhau |
| `find-error` | `lines: string[]` (2–5 dòng lời giải), `answer: number` (chỉ số dòng sai ĐẦU TIÊN). Các dòng giữ nguyên thứ tự |

Với `classify`, `match`, `order`: ở chế độ Luyện tập, khi làm sai app giữ lại phần đúng, xoá phần sai để học sinh làm lại phần đó.

Mặc định phương án được trộn khi hiển thị; đặt `"shuffle": false` để giữ nguyên thứ tự. Với câu điền chỗ trống, đáp án được chuẩn hoá trước khi chấm: bỏ `°`, `độ`, chữ `góc`, bỏ dấu cách, không phân biệt hoa thường, dấu phẩy thập phân được hiểu như dấu chấm.

**Hình tứ giác mô tả bằng dữ liệu** (trường `shape`, dùng được với mọi dạng câu; component `src/components/QuadFigure.jsx`):

```json
"shape": {
  "kind": "hbh",
  "names": "ABCD",
  "marks": ["sides", "parallel", "right", "angles", "diagonals", "diag-marks"],
  "center": "O",
  "angleLabels": { "A": "{a}°", "C": "?" },
  "sideLabels": { "AB": "6 cm" },
  "highlight": ["AC"]
}
```

`kind` nhận một trong các giá trị: `tu-giac`, `hinh-thang`, `thang-vuong`, `thang-can`, `hbh`, `hcn`, `thoi`, `vuong`, `dieu` (hình cánh diều, có hai đường chéo vuông góc). Các đỉnh được xếp ngược chiều kim đồng hồ, bắt đầu từ đỉnh dưới bên trái. Mỗi lần ra đề hình được sinh ngẫu nhiên, nhưng không vô tình mang tính chất của loại hình "mạnh hơn": hình bình hành không gần hình chữ nhật hay hình thoi, hình thang thường không gần hình thang cân hay hình thang vuông. Nhờ vậy học sinh không thể chỉ nhìn bằng mắt mà đoán ra loại hình. `marks` bật các ký hiệu vẽ sẵn theo loại hình: vạch cạnh bằng, mũi tên song song, góc vuông, cung góc bằng, đường chéo, vạch nửa đường chéo bằng. Hình vẽ chỉ để minh hoạ: số đo ghi trong `angleLabels` không nhất thiết đúng tỉ lệ.

**Mẫu câu có tham số.** Khai báo `vars` rồi dùng `{a}` hoặc `{=biểu thức}` trong mọi chuỗi. Mỗi lần ra đề, app thay một bộ số mới vào:

```json
{
  "id": "kbdd-t01", "type": "fill-blank", "lesson": "7-08", "level": "NB",
  "vars": { "a": [35, 145, 5] }, "where": ["a != 90"],
  "stem": "Hai góc xOy và yOz kề bù. Biết góc xOy = {a}°. Góc yOz = {{}}°.",
  "blanks": [{ "accept": ["{=180 - a}"] }],
  "hints": ["Hai góc kề bù có tổng bằng 180°."],
  "explanation": "yOz = 180° − {a}° = {=180 - a}°."
}
```

`vars.a = [từ, đến, bước]`. `where` là danh sách điều kiện mà bộ số phải thoả; bộ số không thoả thì app bốc lại. Biểu thức chỉ được dùng số, tên biến, `+ - * / %`, ngoặc và phép so sánh.

Sau khi thêm hoặc sửa câu hỏi, chạy lệnh dưới. Với mẫu câu, script thử thay số nhiều lần để bắt lỗi như phương án bị trùng hoặc biến chưa khai báo.

```bash
npm run validate-questions
```

---

## Cách thêm cấp độ mới

1. **Tạo component cấp độ** trong `src/levels/`, ví dụ `Level8.jsx`.
2. **Xuất component** trong `src/levels/index.jsx`:

   ```jsx
   export { default as Level8 } from './Level8';
   ```

3. **Thêm vào menu** trong `src/App.jsx`, mảng `LEVELS`:

   ```jsx
   {
     id: '8',
     name: 'Tỉ số lượng giác',
     desc: 'Nhận biết sin, cos, tan trong tam giác vuông',
     icon: Calculator,
     component: Level8,
     color: 'text-neon-pink',
   }
   ```

4. **Import icon** tương ứng từ `lucide-react` nếu cần.

---

## Triển khai

Dự án đã có `netlify.toml` cấu hình sẵn:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Bạn chỉ cần kết nối repo với Netlify (hoặc upload thư mục `dist/` sau khi chạy `npm run build`).

Cũng có thể triển khai trên Vercel, GitHub Pages hoặc bất kỳ static host nào hỗ trợ SPA.

---

## Ghi chú khi đóng góp

- Chạy `npm run lint` trước khi commit để đảm bảo code sạch.
- Không sửa `src/data/figures-manifest.json` thủ công; hãy sửa nguồn `.tex` rồi chạy `npm run figures`.
- Giữ màu sắc hình vẽ đồng bộ với `_theme.tex` để phù hợp nền tối của web.
- Nếu thêm hình cho cấp độ trắc nghiệm, luôn kiểm tra `answer` là chỉ số đúng trong mảng `options`.

---

## Tiềm năng phát triển thêm

### Ngắn hạn (dễ làm, tác động lớn)

1. **Chế độ thử thách theo thời gian**: giới hạn thời gian trả lời mỗi câu, tính điểm bonus cho câu trả lời nhanh.
2. **Lưu tiến độ**: dùng `localStorage` để nhớ điểm cao nhất, cấp độ đã mở khóa, và lỗi sai thường gặp của từng HS.
3. **Trang tổng kết lỗi sai**: sau mỗi lượt chơi, liệt kê các câu sai và đưa lại lý do giải thích.
4. **Cải thiện chế độ GV**: cho phép GV tự thêm ghi chú, đánh dấu hình đã dùng, hoặc xuất danh sách hình ra PDF/phiếu in.

### Trung hạn (tính năng mới)

5. **Thêm chủ đề hình học mới**:
   - Tứ giác, hình bình hành, hình thang
   - Tam giác đồng dạng
   - Đường tròn, cung, dây cung
   - Diện tích, chu vi
   - Lượng giác cơ bản
6. **Chế độ luyện tập theo lỗi**: tự động tạo thêm câu hỏi từ những chủ đề HS hay sai.
7. **Hệ thống tài khoản đơn giản**: GV tạo lớp, xem tiến độ của từng HS, giao bài tập theo chủ đề.
8. **PWA (Progressive Web App)**: cài đặt trên điện thoại, hoạt động offline sau lần tải đầu.
9. **Hỗ trợ đa ngôn ngữ**: tiếng Việt, tiếng Anh, dễ dàng mở rộng thêm ngôn ngữ khác.

### Dài hạn (nền tảng hóa)

10. **Trang admin quản lý hình**: giao diện web cho phép upload `.tex`, xem trước SVG, chỉnh sửa `%META` mà không cần mở code.
11. **Sinh câu hỏi tự động bằng AI/GeoGebra**: tạo hình và câu hỏi biến thể từ template, giảm thiểu trùng lặp.
12. **Xuất bộ đề in**: tạo file PDF chứa hình + câu hỏi + đáp án để GV in ra làm bài tập trên lớp.
13. **Tích hợp học liệu số**: liên kết với video bài giảng, bài tập bổ sung, hoặc LMS (Google Classroom, Moodle).
14. **Phân tích dữ liệu học tập**: dashboard thống kê thời gian làm bài, chủ đề yếu, xu hướng tiến bộ theo tuần/tháng.

---

## Liên hệ / Tác giả

Dự án được xây dựng cho **Talent Math** — nền tảng ôn tập Toán THCS.

Nếu phát hiện lỗi hoặc muốn đề xuất tính năng, hãy mô tả rõ trong issue hoặc liên hệ trực tiếp.
