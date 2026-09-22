# Thử Thách Hình Học

Ứng dụng web luyện tập nền tảng hình học THCS dưới dạng mini-game: học sinh chọn cấp độ, trả lời câu hỏi trắc nghiệm, tích lũy điểm để hoàn thành thử thách. Dành cho giáo viên và học sinh muốn ôn tập nhanh các khái niệm cơ bản như góc nhọn/vuông/tù/bẹt, ước lượng số đo góc, đếm góc, tia/đường thẳng/đoạn thẳng, đường song song, đường vuông góc/đường cao, tia phân giác, so sánh góc, góc kề bù/đối đỉnh.

---

## Tính năng chính

- **9 cấp độ** (7 cấp độ cơ bản + 1 cấp độ khó của phần ước lượng góc + 1 cấp độ tổng hợp):

  | ID | Tên | Mô tả |
  |----|-----|-------|
  | `1` | Nhận biết loại góc | Góc nhọn, vuông, tù, bẹt - hình vẽ SVG sinh ngẫu nhiên |
  | `2` | Ước lượng số đo góc | Chọn đáp án gần đúng (sai số rộng) |
  | `2h` | Ước lượng số đo góc (khó) | Sai số hẹp, đòi hỏi quan sát chính xác hơn |
  | `3` | Đếm số góc trên hình | Dùng kho hình `count-angles` |
  | `4` | Đường thẳng · Tia · Đoạn thẳng | Dùng kho hình `rays-lines` |
  | `5` | Hai đường thẳng song song | Chế độ giáo viên, HS trả lời miệng, có gợi ý đáp án |
  | `6` | Đường vuông góc · Đường cao | Dùng kho hình `perpendicular` |
  | `7` | Tia phân giác | Dùng kho hình `bisector` |
  | `8` | So sánh góc | 4 dạng trộn: so sánh 2 góc, tia phân giác, đường vuông góc, góc kề bù/đối đỉnh (SVG động) |

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
