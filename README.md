# Ám Ảnh Kinh Hoàng

Game kinh dị giải đố 3D góc nhìn thứ nhất chạy ngay trên trình duyệt (WebGL2), 6 map:
Căn Nhà Số 13 · Trong Rừng · Lâu Đài Bị Bỏ Hoang · Nghĩa Trang Lúc 0h Đêm · Nhà Máy Xí Nghiệp · Bệnh Viện Dị Nhân (map khó).

> ⚠️ Nội dung kinh dị, khuyến cáo 16+. Nên chơi bằng tai nghe, trong phòng tối.

**▶ Chơi ngay:** `https://<tên-tài-khoản>.github.io/<tên-repo>/` *(sửa lại sau khi bật GitHub Pages)*

## Đưa lên GitHub & bật link chơi (GitHub Pages)

1. Vào github.com → **New repository** → đặt tên (vd `am-anh-kinh-hoang`) → chọn **Public** → **Create repository**.
2. Bấm **uploading an existing file** → kéo **toàn bộ nội dung** thư mục này vào (gồm `index.html`, `README.md`, `.nojekyll`, thư mục `css`, `js`, `assets`) → **Commit changes**.
   *(File `.nojekyll` bị ẩn trên Windows thì cũng không sao, không bắt buộc.)*
3. Vào **Settings → Pages** → mục *Branch* chọn `main` và `/ (root)` → **Save**.
4. Đợi 1–2 phút, tải lại trang Settings → Pages sẽ hiện link `https://<tên-tài-khoản>.github.io/<tên-repo>/`. Sửa link ở đầu README này cho đúng.

**Cập nhật game sau này:** vào repo → **Add file → Upload files** → kéo file đã sửa vào (cùng tên, cùng thư mục) → **Commit**. Link chơi tự cập nhật sau 1–2 phút.

## Cách chơi

- **W A S D** di chuyển · **Chuột** nhìn · **Shift** chạy · **E** tương tác/trốn · **F** đèn pin · **M** bản đồ · **Tab** nhiệm vụ · **N** sổ ghi chép · **C** ngồi · **Space** nhảy · **Esc** tạm dừng.
- Chơi 2 người online: chọn **Hai người (online)** → một người **Tạo phòng**, người kia nhập **ID phòng**.

## Đồ họa 3D thật

Vào game là tự bật: game tải đúng những vật liệu PBR và đồ vật quét 3D mà map đang chơi cần từ **Poly Haven** (lần đầu cần mạng, góc phải dưới hiện %), sau đó trình duyệt lưu lại nên lần sau vào gần như tức thì.

- **Cài đặt → Đồ họa 3D thật**: *Tắt* (máy yếu) / *Bật* / *Siêu nét* (máy mạnh) — đổi được ngay khi đang chơi.
- **Cài đặt → Nền menu 3D**: bật/tắt cảnh 3D phía sau menu.
- Không tải được (mất mạng…) thì game tự dùng đồ họa vẽ bằng code, vẫn chơi bình thường.

## Chạy trên máy (không cần GitHub)

Nhấp đúp `index.html` (Chrome/Edge). Sửa code bằng VS Code: dùng tiện ích **Live Server** để vừa sửa vừa xem.

## Nguồn tài nguyên

Vật liệu & mô hình 3D: **[Poly Haven](https://polyhaven.com)** — giấy phép **CC0** (miễn phí, dùng cả mục đích thương mại). Powered by Poly Haven.

## Cấu trúc

```
am-anh-kinh-hoang/
├── index.html        Khung trang (các màn hình, nút bấm) + nạp CSS và JS
├── css/style.css     Toàn bộ giao diện
├── js/               Mã game, chia theo phần
└── assets/           danh-sach.json: danh sách vật liệu & mô hình Poly Haven mà game dùng
```

| File | Nội dung |
|---|---|
| `01-cau-hinh.js` | Cấu hình chung: độ khó (DIFF), chất lượng hình (RESO), hàm $ |
| `02-texture.js` | Vẽ texture tường, sàn, đồ vật bằng code |
| `03-ban-do.js` | Bản đồ Căn Nhà Số 13 (3 tầng), FLOORS |
| `04-giao-dien-co-ban.js` | Giao diện cơ bản: chữ gõ, thông báo |
| `05-am-thanh.js` | Âm thanh & hiệu ứng (noise, tone) |
| `06-con-ma.js` | Con ma: di chuyển, đuổi theo |
| `07-cau-do.js` | Câu đố / hành động khi tương tác (ACTIONS) |
| `08-dieu-khien.js` | Điều khiển bàn phím, chuột, cảm ứng |
| `09-do-hoa-webgl.js` | Đồ họa 3D WebGL2: shader, ánh sáng, đèn pin |
| `10-mo-hinh-3d.js` | Mô hình 3D đồ vật (hộp, trụ, cầu…) |
| `11-vong-lap-khoi-dong.js` | Vòng lặp game & khởi động |
| `12-map-trong-rung.js` | Map Trong Rừng |
| `13-ke-thu-dung-chung.js` | Kẻ thù dùng chung |
| `14-map-lau-dai.js` | Map Lâu Đài |
| `15-map-nghia-trang.js` | Map Nghĩa Trang |
| `16-map-nha-may.js` | Map Nhà Máy |
| `17-hoat-anh-nhan-vat.js` | Hoạt ảnh nhân vật (khớp, bước đi) |
| `18-giao-dien-menu-hud.js` | Menu, phông nền động, HUD, sổ tay |
| `19-kien-truc.js` | Kiến trúc phòng, dựng lưới 3D cho mỗi tầng |
| `20-choi-2-nguoi.js` | Chơi 2 người, nhiệm vụ phụ |
| `21-nhan-vat-3d-phim-mo-dau.js` | Nhân vật 3D, phim cắt cảnh |
| `22-choi-online.js` | Chơi online 2 máy (PeerJS) |
| `23-bo-cuc-do-dac.js` | Bố cục map, đồ đạc 3D, ngồi/nhảy, nhạc theo căng thẳng |
| `24-chu-chiller.js` | Chữ Chiller có dấu tiếng Việt |
| `25-nhen-dao-dien-hu-doa.js` | Nhện, "đạo diễn" hù dọa |
| `26-hu-dung-luc.js` | Hù dọa đúng lúc |
| `27-va-cham-cua-so.js` | Va chạm đồ vật, cửa sổ, nhiệm vụ theo độ khó |
| `28-mat-ma-do-hoa.js` | Mặt ma kín màn hình, hiệu ứng hình |
| `29-doi-qua-ma-bay.js` | Dơi, quạ, ma bay |
| `30-nhac-menu-be-mat.js` | Nhạc menu, cảnh báo 16+, bề mặt có chiều sâu |
| `31-ten-khu-vuc-tu-mo.js` | Tên khu vực, mở tủ/ngăn kéo |
| `32-ban-do-truc-tiep.js` | Bản đồ nhỏ cập nhật trực tiếp |
| `33-cai-dat-nhac-menu.js` | Cài đặt, nhạc nền, menu chính |
| `34-ky-luc.js` | Kỷ lục thời gian |
| `35-map-benh-vien.js` | Map Bệnh Viện Dị Nhân |
| `36-tieng-ma-noi.js` | Tiếng ma nói bên tai |
| `37-ma-gao-het-den-pin.js` | Ma gào hét, đèn pin phải tự tìm ở Bệnh Viện |
| `38-phim-cot-truyen.js` | Phim cốt truyện |
| `39-kich-ban-phim.js` | Kịch bản phim từng map, ô chọn map |
| `40-menu-doc-4k.js` | Menu chọn map dọc, đồ họa 4K |
| `41-ngay-dem-bay-do.js` | Phim ngày → đêm, bày đồ tự nhiên |
| `42-muot-hon.js` | Tối ưu cho mượt (bản 26) |

## Quy tắc quan trọng khi sửa

1. **Thứ tự nạp file là cố định** (theo số đầu tên file, khai báo trong `index.html`). File sau được dùng hàm/biến của file trước, và có thể *ghi đè* hàm của file trước. Thêm file mới thì đặt tên số tiếp theo (vd. `43-ten-moi.js`) và thêm một dòng `<script src="js/43-ten-moi.js"></script>` cuối danh sách trong `index.html`.
2. **Không khai báo trùng tên** `const`/`let` ở hai file khác nhau (trình duyệt sẽ báo lỗi và game không chạy).
3. Đổi tên file thì nhớ sửa dòng `<script>` tương ứng trong `index.html`.
4. Mở **F12 → Console** khi thử: nếu có lỗi màu đỏ, nó ghi rõ file và dòng.

## Hàm được bản cập nhật sau "bọc" hoặc thay thế

Khi sửa các hàm dưới đây, hãy xem cả file ghi đè — ở đó có phần xử lý chạy trước/sau hàm gốc.

| Hàm | Khai báo gốc | Bị bọc/thay ở |
|---|---|---|
| `buildFilm` | 39-kich-ban-phim.js | 41-ngay-dem-bay-do.js |
| `buildFloorMesh` | 19-kien-truc.js | 42-muot-hon.js |
| `buildHospital` | 35-map-benh-vien.js | 37-ma-gao-het-den-pin.js |
| `buildMenus` | 18-giao-dien-menu-hud.js | 37-ma-gao-het-den-pin.js, 39-kich-ban-phim.js |
| `buildProp` | 10-mo-hinh-3d.js | 35-map-benh-vien.js |
| `cutFrame` | 21-nhan-vat-3d-phim-mo-dau.js | 41-ngay-dem-bay-do.js |
| `cutSfx` | 21-nhan-vat-3d-phim-mo-dau.js | 41-ngay-dem-bay-do.js |
| `drawCritters` | 29-doi-qua-ma-bay.js | 35-map-benh-vien.js |
| `drawSpiders` | 25-nhen-dao-dien-hu-doa.js | 42-muot-hon.js |
| `drawWatchers` | 25-nhen-dao-dien-hu-doa.js | 42-muot-hon.js |
| `extendMaps` | 27-va-cham-cua-so.js | 35-map-benh-vien.js |
| `furnishRooms` | 26-hu-dung-luc.js | 41-ngay-dem-bay-do.js |
| `ghostDraw` | 29-doi-qua-ma-bay.js | 42-muot-hon.js |
| `hospLive` | 35-map-benh-vien.js | 37-ma-gao-het-den-pin.js, 38-phim-cot-truyen.js |
| `paintFace` | 28-mat-ma-do-hoa.js | 35-map-benh-vien.js |
| `perfTick` | 23-bo-cuc-do-dac.js | 42-muot-hon.js |
| `playCutscene` | 21-nhan-vat-3d-phim-mo-dau.js | 38-phim-cot-truyen.js, 39-kich-ban-phim.js |
| `playStory` | 20-choi-2-nguoi.js | 38-phim-cot-truyen.js |
| `propAt` | 21-nhan-vat-3d-phim-mo-dau.js | 35-map-benh-vien.js |
| `realModel` | 26-hu-dung-luc.js | 35-map-benh-vien.js |
| `refreshWalls` | 10-mo-hinh-3d.js | 42-muot-hon.js |
| `roomKind` | 26-hu-dung-luc.js | 35-map-benh-vien.js |
| `showWarning` | 29-doi-qua-ma-bay.js | 30-nhac-menu-be-mat.js |
| `soundBehind` | 25-nhen-dao-dien-hu-doa.js | 36-tieng-ma-noi.js |
| `storyFilm` | 38-phim-cot-truyen.js | 39-kich-ban-phim.js |
| `taskAudioTick` | 27-va-cham-cua-so.js | 35-map-benh-vien.js, 36-tieng-ma-noi.js |
| `taskModelX` | 27-va-cham-cua-so.js | 35-map-benh-vien.js |
| `thing2` | 16-map-nha-may.js | 35-map-benh-vien.js |
| `toggleLight` | 20-choi-2-nguoi.js | 37-ma-gao-het-den-pin.js |

## Đồ họa quét 3D thật (bản 27)

Nguồn: **[Poly Haven](https://polyhaven.com)** — mô hình quét/dựng thật và vật liệu quét ảnh (photogrammetry), giấy phép **CC0** (miễn phí, không cần ghi công). Powered by Poly Haven.

- **Vật liệu PBR** cho tường, sàn, trần: mỗi vật liệu gồm ảnh màu, bản đồ pháp tuyến (vân gỗ, mạch gạch nổi khối theo đèn pin) và độ nhám/kim loại (gạch men bóng, gỗ mờ, kim loại phản chiếu). Chữ máu trên tường được vẽ đè lên vật liệu thật.
- **Mô hình 3D** thay đồ đạc khối hộp: giường, tủ, ghế bành, sofa, bàn ăn, kệ sách, đồng hồ quả lắc, khung tranh, gương, thùng phi, kệ sắt… đúng hình dáng và kích thước mét ngoài đời. Va chạm (không đi xuyên) giữ nguyên như cũ.
- Tủ/ngăn kéo khi **mở ra** tạm hiện lại bằng mô hình vẽ code (để thấy được bên trong).

**Thêm hoặc đổi đồ vật:**
1. Tìm đồ trên polyhaven.com, lấy id ở cuối link (vd `polyhaven.com/a/Rockingchair_01` → `Rockingchair_01`).
2. Thêm id vào `assets/danh-sach.json` (mục `models` hoặc `textures`) để ghi nhớ.
3. Trong `js/43-quet-3d-pbr.js`: khai báo tên gọn ở `SCAN_MODELS`, rồi chỉ định đồ vật nào của game dùng nó ở `SCAN_LAYOUT` (vật liệu tường/sàn ở `SCAN_SURF`).

Muốn ảnh nét hơn: trong game chọn **Cài đặt → Đồ họa 3D thật → Siêu nét**.
