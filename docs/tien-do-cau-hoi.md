# Tiến độ: Luyện tập & kiểm tra theo bài

Cập nhật: 25/09/2026 · Nhánh: `master` (đã gộp từ `feature/cau-hoi-theo-bai`)

**Đối tượng:** học sinh trung bình và yếu, lớp 7 và lớp 8. Lớp 8 tập trung vào chương **Tứ giác**.
**Sách giáo khoa:** Kết nối tri thức với cuộc sống.
**Cách làm:** câu hỏi soạn sẵn (có giáo viên duyệt), không sinh bằng AI lúc chạy.

---

## 1. Đã làm được

### 1.1 Khung chức năng

| Hạng mục | Chi tiết |
|---|---|
| Màn chọn đề | Chọn khối (Ôn nền tảng / Lớp 7 / Lớp 8) → chương → bài; chọn dạng câu, mức độ (NB / TH / VD / VDC), số câu (5 / 10 / 15 / 20). Bài chưa có câu hỏi hiện mờ, ghi "sắp có" |
| 2 chế độ | **Luyện tập**: sai được làm lại 1 lần, phương án đã chọn sai bị gạch, gợi ý tự mở, có câu động viên. **Kiểm tra**: mỗi câu trả lời 1 lần, chấm thang 10 |
| Hỗ trợ học sinh yếu | Gợi ý theo bậc cho từng câu · thẻ **"Nhắc lại kiến thức"** cho từng bài (xem được trước và trong khi làm) · lời giải thích sau mỗi câu · nhận xét theo điểm · nút **"Luyện lại câu sai"** (câu được sinh lại với số liệu hoặc thứ tự phương án mới) |
| 9 dạng câu | Trắc nghiệm 1 đáp án · Đúng/Sai · Chọn nhiều đáp án (ghi rõ "Chọn N đáp án") · Điền vào chỗ trống (tự chuẩn hoá: `65`, `65°`, `65 độ`, `65,0` đều được chấp nhận) · **Chạm vào hình** (chạm vào đỉnh, cạnh, đường chéo, góc) · **Phân loại** · **Ghép nối** · **Sắp xếp các bước** · **Tìm bước sai** (xem mục 1.4) |
| Mẫu câu có tham số | Viết `{a}`, `{=180 - a}` trong câu hỏi; mỗi lần ra đề có số liệu mới. Điều kiện `where` loại các bộ số không hợp lệ |
| Hình tứ giác vẽ từ dữ liệu | `QuadFigure` vẽ 9 loại hình: tứ giác, hình thang, hình thang vuông, hình thang cân, HBH, HCN, hình thoi, hình vuông, hình cánh diều. Ký hiệu bật theo nhóm: cạnh bằng, song song, góc vuông, góc bằng, đường chéo, nửa đường chéo bằng. Có nhãn số đo, nhãn độ dài, tô màu nổi bật. Hình sinh ngẫu nhiên nhưng **không vô tình mang tính chất của loại hình "mạnh hơn"** (đã kiểm tra 2000 lần cho mỗi loại) |
| Dùng lại các level cũ | Câu có hình của Level 1–9 (loại góc, ước lượng, đếm góc, kề bù/đối đỉnh, phân giác, song song, tam giác) được trộn vào đề của bài tương ứng |
| Kiểm tra ngân hàng câu | `npm run validate-questions`: kiểm tra đúng cấu trúc, id không trùng, hình có tồn tại; với mẫu câu thì **thử toàn bộ bộ số** để bắt phương án trùng hoặc biến chưa khai báo |
| Chống trắng màn hình | Câu bị lỗi khi vẽ hoặc khi chấm hiện thông báo kèm nút **"Bỏ qua câu này"**; câu bỏ qua không tính điểm. Câu lỗi ngay lúc tạo đề thì bị loại khỏi đề. Nếu mọi câu đều lỗi thì quay về màn chọn đề |

### 1.2 Nội dung: 229 câu (trong đó 44 mẫu câu có tham số)

| Bài | Số câu | Mẫu câu | Dạng câu | Mức độ |
|---|---|---|---|---|
| Ôn nền tảng: Góc · Các loại góc | 14 | 0 | TN 3 · Đ/S 3 · Chọn nhiều 2 · Điền 4 · Phân loại 1 · Ghép nối 1 | NB 10 · TH 4 |
| Lớp 7, Bài 8: Góc ở vị trí đặc biệt. Tia phân giác | 30 | 6 | TN 8 · Đ/S 7 · Chọn nhiều 2 · Điền 9 · Ghép nối 1 · Sắp xếp 1 · Tìm bước sai 2 | NB 17 · TH 10 · VD 3 |
| Lớp 7, Bài 9: Hai đường thẳng song song và dấu hiệu nhận biết *(26/09/2026)* | 26 | 8 | TN 10 · Đ/S 8 · Chọn nhiều 1 · Điền 2 · Phân loại 1 · Ghép nối 1 · Sắp xếp 1 · Tìm bước sai 2 | NB 14 · TH 11 · VD 1 |
| Lớp 8, Bài 10: Tứ giác | 27 | 5 | Chạm 6 · TN 5 · Đ/S 8 · Chọn nhiều 2 · Điền 3 · Ghép nối 1 · Sắp xếp 1 · Tìm bước sai 1 | NB 19 · TH 8 |
| Lớp 8, Bài 11: Hình thang cân | 31 | 6 | Chạm 3 · TN 9 · Đ/S 10 · Chọn nhiều 2 · Điền 4 · Phân loại 1 · Sắp xếp 1 · Tìm bước sai 1 | NB 14 · TH 17 |
| Lớp 8, Bài 12: Hình bình hành | 31 | 6 | Chạm 2 · TN 7 · Đ/S 10 · Chọn nhiều 3 · Điền 5 · Phân loại 1 · Ghép nối 1 · Sắp xếp 1 · Tìm bước sai 1 | NB 12 · TH 18 · VD 1 |
| Lớp 8, Bài 13: Hình chữ nhật | 28 | 6 | Chạm 1 · TN 6 · Đ/S 10 · Chọn nhiều 3 · Điền 5 · Phân loại 1 · Sắp xếp 1 · Tìm bước sai 1 | NB 9 · TH 18 · VD 1 |
| Lớp 8, Bài 14: Hình thoi và hình vuông | 42 | 7 | Chạm 1 · TN 9 · Đ/S 14 · Chọn nhiều 6 · Điền 7 · Phân loại 1 · Ghép nối 1 · Sắp xếp 1 · Tìm bước sai 2 | NB 16 · TH 26 |

Các bài chỉ có câu sinh tự động từ level cũ (trắc nghiệm có hình, chưa có gợi ý): *Ôn nền tảng: Đường thẳng · Tia · Đoạn thẳng*, *Ôn nền tảng: Đường vuông góc · Đường cao*, *Lớp 7 Bài 10: Tiên đề Euclid*, *Lớp 7 Bài 12: Tổng các góc trong tam giác*.

Nội dung chương Tứ giác:
- Mỗi bài theo 5 bước: nhận biết trên hình → định nghĩa → tính chất → tính toán 1–2 bước → dấu hiệu nhận biết.
- Không dùng Pythagore hay đường trung bình, vì theo sách Kết nối tri thức hai phần này học sau chương Tứ giác.
- Các ngộ nhận hay gặp đều có câu Đúng/Sai kèm **hình phản ví dụ**, ví dụ "hai đường chéo bằng nhau là HCN" đi kèm hình thang cân, "hai đường chéo vuông góc là hình thoi" đi kèm hình cánh diều.
- **Bổ sung 25/09/2026 — 45 câu lý thuyết** (Đúng/Sai, trắc nghiệm định nghĩa, chọn nhiều tính chất/dấu hiệu), mức NB/TH, câu nào cũng có giải thích, câu TH có gợi ý. Nội dung: cạnh kề/đối, đường chéo; tổng 4 góc (4 góc nhọn, 3 góc nhọn); định nghĩa từng hình; tính chất đường chéo và góc; hình này có phải hình kia không; dấu hiệu nhận biết. Hình phản ví dụ mới: cánh diều cho "một cặp góc đối bằng nhau là HBH" và "hai cạnh kề bằng nhau là hình thoi"; hình thang vuông cho "một góc vuông là HCN".

### 1.4 Bước 2 (P4): 4 dạng câu mới — 25/09/2026

Mọi thao tác đều là **chạm để chọn**, không cần kéo thả (dùng tốt trên điện thoại, dễ với học sinh yếu).

| Dạng | Cách làm | Chấm & luyện lại |
|---|---|---|
| Phân loại (`classify`) | Dưới mỗi mục (chữ hoặc hình tứ giác) có 2–3 nút nhóm | Chấm từng mục; hiện nhóm đúng |
| Ghép nối (`match`) | Chạm ô của dòng rồi chạm phương án (mặc định điền ô trống đầu tiên); có thể có phương án nhiễu | Chấm từng cặp; hiện đáp án đúng |
| Sắp xếp các bước (`order`) | Chạm lần lượt bước 1, 2, 3…; chạm bước đã xếp để bỏ ra | Chấm từng vị trí; hiện thứ tự đúng |
| Tìm bước sai (`find-error`) | Chạm vào dòng sai đầu tiên của lời giải | Như trắc nghiệm: chọn sai thì dòng đó bị gạch |

Ở chế độ Luyện tập, 3 dạng đầu **giữ lại phần đúng, xoá phần sai** để học sinh làm lại phần đó (dạng Sắp xếp giữ các bước đúng liên tiếp từ đầu). Nút "Kiểm tra" chỉ bật khi đã điền đủ.

**Nội dung: 24 câu** (10 mẫu câu có tham số), phân bố ở các bài Góc, 7-08, 8-10 → 8-14: Phân loại 5 · Ghép nối 5 · Sắp xếp 6 · Tìm bước sai 8. Các câu Tìm bước sai tập trung vào lỗi hay gặp: nhầm đối đỉnh/kề bù, tổng góc tứ giác là 180°, nhầm góc đối/góc kề của HBH, hai góc kề đáy của thang cân, "hai đường chéo bằng nhau → HCN", "hai đường chéo vuông góc → hình thoi" (kèm hình phản ví dụ), chu vi hình thoi.

Kiểm tra: `validate-questions` 203 câu 0 lỗi; mô phỏng trả lời đúng / sai / làm lại 200 lần cho mỗi câu mới, 0 lỗi; lint và build đạt.

### 1.3 Commit

| Commit | Nội dung |
|---|---|
| `a05538a` | Khung Luyện tập & kiểm tra, 5 dạng câu, `QuadFigure`, Bài 10 lớp 8 |
| `eb120ab` | Nội dung Bài 11–14 lớp 8, sửa nhãn trên hình |
| `e39bdcd` | Sửa lỗi trắng màn hình (điền chỗ trống / chọn nhiều / chạm vào hình) và lỗi mất phương án ở chế độ Luyện tập |
| *(commit Bước 0)* | Error boundary cho từng câu, bỏ qua câu lỗi khi tạo đề |

---

## 2. Chưa làm được / còn tồn tại

### 2.1 Kiểm thử tự động (25/09/2026)

Đã chạy tự động toàn bộ 11 bài có câu hỏi, đề 20 câu, trả lời ngẫu nhiên, sau đó bấm "Luyện lại câu sai":

| Chế độ | Số vòng | Số câu đã làm | Lần làm lại (sai lần 1) | Kết quả |
|---|---|---|---|---|
| Luyện tập | 4 | 1 188 | 947 | Không trắng màn hình, không mất phương án, không bị kẹt, không lỗi console |
| Kiểm tra | 2 | 687 | — | Không lỗi |

Cả 5 dạng câu đều được làm tới. Đã thử cài lỗi giả vào câu hỏi: câu lỗi hiện nút "Bỏ qua câu này", đề vẫn chạy tiếp tới màn kết quả.

### 2.2 Chưa làm

- **Dạng câu:** đã đủ 4 dạng dự kiến (mục 1.4). Đã quyết định bỏ Assertion–Reason, bài nhiều ý và phản ví dụ mức VDC, vì không phù hợp học sinh yếu.
  - Mới có 1–2 câu mỗi dạng mới cho mỗi bài; chưa thử trên trình duyệt thật và điện thoại.
- **Lớp 7:**
  - Chưa có câu soạn sẵn cho Bài 10–11 (chương III), chương IV (Bài 13–16, tam giác bằng nhau), chương IX (Bài 31–35), chương X (Bài 36–37).
  - Chưa có `TriangleFigure` để vẽ tam giác có ký hiệu.
- **Lớp 8:** chưa có nội dung cho chương IV (Thalès, đường trung bình, phân giác), chương IX (tam giác đồng dạng, Pythagore), chương X (hình chóp đều).
- **Ra đề theo ma trận** (ví dụ tỉ lệ NB/TH/VD 50/35/15), thống kê các kỹ năng học sinh hay sai, xuất đề ra LaTeX để in.
- **Lưu tiến độ** của học sinh: hiện tắt trang là mất kết quả.

### 2.3 Tồn tại cần cân nhắc

- **Tỉ lệ mức độ ở chương Tứ giác** là NB 66 · TH 73 · VD 2 (sau khi thêm 45 câu lý thuyết thì NB tăng từ 46% lên 47%), vẫn lệch về TH so với mục tiêu NB 50% · TH 35% · VD 15%. Nguyên nhân là các câu "dấu hiệu nhận biết" đang xếp vào TH. Cần giáo viên quyết định giữ nhãn hay đổi, và có cần thêm câu VD 2 bước không.
- **Số đo ghi trên hình không đúng tỉ lệ** (giống hình minh hoạ trong sách). Nếu học sinh yếu bị rối, có thể đổi sang cách dựng hình trước rồi lấy số đo thật từ hình để ra đề.
- **Câu sinh tự động từ level cũ** chưa có gợi ý và chưa gắn mức độ. Bộ lọc mức độ không áp dụng cho các câu này.
- **Giáo viên chưa duyệt** nội dung 229 câu.

---

## 3. Kế hoạch tiếp theo

### Bước 0: Chốt phần đang dở
1. ~~Chạy lại test tự động ở chế độ Luyện tập, gồm cả "Luyện lại câu sai", cho mọi bài.~~ Xong (mục 2.1).
2. ~~Thêm error boundary: câu lỗi hiện thông báo và nút "Bỏ qua câu này".~~ Xong.
3. ~~Chạy lint, build, `validate-questions`, rồi commit và push.~~ Xong.
4. **Còn lại:** giáo viên thử trên trình duyệt thật và duyệt nội dung chương Tứ giác.

### Bước 1: Hoàn thiện chương Tứ giác theo góp ý của giáo viên
- Chỉnh nhãn mức độ; thêm 1–2 câu VD cho mỗi bài (tính 2 bước).
- Thêm câu "Ôn tập chương III" trộn cả 5 bài.
- Tuỳ góp ý: dựng hình đúng tỉ lệ với số đo.

### Bước 2 (P4): Thêm dạng câu mới — ĐÃ LÀM (xem mục 1.4)
| Dạng | Dùng cho | Ví dụ |
|---|---|---|
| Phân loại (2–3 nhóm) | Tứ giác, loại góc | Kéo các hình vào nhóm "Hình bình hành" hoặc "Không phải hình bình hành" |
| Ghép nối (tối đa 4 cặp) | Tính chất các hình | Nối hình với tính chất của hai đường chéo |
| Sắp xếp các bước (3–4 bước, lý do viết sẵn) | Chứng minh ngắn | Sắp xếp các bước chứng minh ABCD là hình bình hành |
| Tìm bước sai (lời giải 2–3 dòng) | Tính góc, nhận biết hình | Lời giải kết luận "là HCN vì hai đường chéo bằng nhau" |

Kéo thả dùng `Reorder` của framer-motion (đã có trong dự án). Trên điện thoại cần có cách bấm-chọn thay cho kéo.

### Bước 3 (P5): Lớp 7
1. `TriangleFigure`: vẽ tam giác, hai tam giác cạnh nhau, ký hiệu cạnh/góc bằng nhau, vùng chạm.
2. Chương IV (trọng tâm): đọc ký hiệu để chọn trường hợp c.c.c / c.g.c / g.c.g; viết đúng các cạnh, góc tương ứng; tam giác cân; sắp xếp chứng minh 3 bước.
3. Chương III: soạn thêm câu có gợi ý cho Bài 10–11 (Bài 10 đang chỉ có câu sinh tự động; Bài 9 đã có từ 26/09).
4. Chương IX: bất đẳng thức tam giác; trọng tâm chia trung tuyến theo tỉ lệ 2/3.
5. Chương X: đếm mặt, cạnh, đỉnh; tính thể tích 1 bước.

### Bước 4 (P6): Ra đề và theo dõi
- Ra đề theo ma trận mức độ; đề 15 phút / 1 tiết.
- Lưu tiến độ và thống kê kỹ năng hay sai (theo `skills` của từng câu).
- Xuất đề ra LaTeX theo khuôn `\baitap` để in.

### Bước 5: Các chương còn lại của lớp 8
Chương IV (Thalès, đường trung bình), chương IX (Pythagore, tam giác đồng dạng), chương X (hình chóp đều).

---

## Phụ lục: vị trí các file

| File | Nội dung |
|---|---|
| `src/data/lessons.json` | Khối → Chương → Bài, kỹ năng, thẻ nhắc kiến thức |
| `src/data/questions/<mã bài>.json` | Ngân hàng câu hỏi (ví dụ `8-12.json` là Bài 12 lớp 8) |
| `src/quiz/types.js` | Chấm điểm, validate, mẫu câu có tham số |
| `src/quiz/shapes.js`, `src/components/QuadFigure.jsx` | Sinh toạ độ và vẽ tứ giác |
| `src/quiz/renderers.jsx`, `src/quiz/QuizRunner.jsx` | Giao diện từng dạng câu, màn làm bài |
| `src/quiz/QuestionErrorBoundary.jsx` | Bắt lỗi từng câu, nút "Bỏ qua câu này" |
| `src/levels/LessonTest.jsx` | Màn chọn đề và màn kết quả |
| `src/quiz/bank.js` | Nạp ngân hàng câu, gắn generator của các level cũ |
| `scripts/validate-questions.js` | Script `npm run validate-questions` |
| `README.md`, mục "Luyện tập & kiểm tra theo bài" | Hướng dẫn cách soạn câu hỏi |
