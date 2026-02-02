# My Kalimba

<p align="center">
  <img src="frontend/MyKalimba/src/assets/imgs/logo.svg" alt="My Kalimba" width="120" />
</p>

<p align="center">
  Chơi kalimba trực tiếp trong trình duyệt — chọn soundfont, tuỳ biến phím, ghi lại và phát lại.
</p>

<p align="center">
  <a href="#demo">Demo</a> ·
  <a href="#tinh-nang">Tính năng</a> ·
  <a href="#cai-dat-local">Cài đặt local</a> ·
  <a href="#cach-choi">Cách chơi</a> ·
  <a href="#cau-hinh-env">Cấu hình env</a>
</p>

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

## Demo

- Frontend: https://mykalimba.netlify.app
- Backend: triển khai kiểu PaaS (Render/…); mặc định local chạy ở `http://localhost:3000`

## Tính năng

- Chơi kalimba bằng chuột/cảm ứng hoặc bàn phím (có sơ đồ phím và nhãn hiển thị ngay trên từng thanh)
- Tuỳ chọn nhanh: âm lượng, nốt gốc, số phím, arrangement, label type, soundfont, màu sắc, ngôn ngữ
- Fullscreen để chơi “đã” hơn trên mobile/tablet
- Ghi lại (record) và phát lại (play) phần bạn vừa chơi
- Tài khoản: đăng ký/đăng nhập, hồ sơ người dùng
- Quên mật khẩu bằng OTP gửi qua Gmail
- Quản lý bài hát & tab nhạc (xem/preview/play thử)

## Kiến trúc

- Frontend: React + Vite (SPA)
- Backend: Node.js + Express
- Database: MySQL (Sequelize)

## Cài đặt local

### 0) Yêu cầu

- Node.js >= 18
- MySQL >= 8 (hoặc dịch vụ MySQL cloud)

### 1) Chạy backend (API)

Mở terminal tại thư mục repo và chạy:

1. Cài dependencies:
   - `cd backend/MyKalimbaServer`
   - `npm install`

2. Tạo file env cho local:
   - Khuyến nghị tạo `backend/MyKalimbaServer/.env.development`
   - Xem mẫu ở mục [Cấu hình env](#cau-hinh-env)

3. Chạy server:
   - `npm start`

Backend sẽ lắng nghe ở `http://localhost:3000` (hoặc theo `PORT`).

### 2) Chạy frontend (Web)

Mở terminal thứ hai:

1. Cài dependencies:
   - `cd frontend/MyKalimba`
   - `npm install`

2. Chạy dev server:
   - `npm run dev`

Mặc định Vite chạy tại `http://localhost:5173`.

### 3) Build & preview (tuỳ chọn)

Trong `frontend/MyKalimba`:

- Build: `npm run build`
- Preview: `npm run preview`

## Cách chơi

Ngay trong web đã có trang hướng dẫn: mở `/instructions` (menu “Hướng dẫn”).

### Bắt đầu nhanh

1. Vào trang chơi tại `/`.
2. Đợi nhạc cụ tải xong (thấy phím kalimba hiện ra và bấm được).
3. Click/tap để phát nốt; kéo rê để lướt nhanh (gliss).
4. Mở “Tùy chọn” để đổi soundfont, số phím, và bật điều khiển bàn phím.

### Chơi bằng bàn phím

- Vào Tùy chọn → `Keyboard control` và chọn một scheme.
- Phím tương ứng sẽ hiện trên mỗi thanh.
- Giữ `Space` để tăng quãng tám khi chơi.

### Các nút nhanh

- `Fullscreen`: bật/tắt toàn màn hình
- `Record`: bắt đầu/dừng ghi lại các nốt bạn đã chơi
- `Play`: phát lại bản ghi (chỉ bật sau khi đã có bản ghi)

## Cách sử dụng web

- Trang chủ (`/`): chơi kalimba + chọn bài để xem tab/lời ngay tại trang
- Bài hát (`/songs`): xem/thêm/sửa/xoá bài hát và tab nhạc
- Hồ sơ (`/profile`): cập nhật thông tin, tải ảnh đại diện (Cloudinary)
- Cài đặt (`/settings`): tuỳ chỉnh trải nghiệm
- Đăng nhập/đăng ký (`/login`, `/register`)
- Quên mật khẩu (`/forgot-password`): nhận OTP qua email và đặt lại mật khẩu

## Cấu hình env

Backend có cơ chế load env:

- Local: ưu tiên `backend/MyKalimbaServer/.env.development` (khi `NODE_ENV` không phải production)
- Production: ưu tiên biến môi trường trên host (Render/…); có thể dùng `DOTENV_CONFIG_PATH`

### Lưu ý bảo mật

- Không commit secret thật lên repo (API keys, mật khẩu DB, App Password…)
- Nếu repo đang có file env dùng để demo local, hãy thay bằng giá trị của bạn trước khi triển khai

### Env tối thiểu để chạy local

Tạo `backend/MyKalimbaServer/.env.development` với nội dung mẫu (điều chỉnh theo máy bạn):

```dotenv
# Server
PORT=3000
NODE_ENV=development

# CORS (khi chạy frontend Vite ở port 5173)
CORS_ORIGIN=http://localhost:5173
FRONTEND_BASE_URL=http://localhost:5173

# Auth
JWT_SECRET=dev_secret_change_me
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MySQL (Sequelize)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=kalimba_db
MYSQL_USER=root
MYSQL_PASSWORD=your_password

# Tạo bảng tự động khi dev (chạy 1 lần rồi tắt để tránh “sync” ngoài ý muốn)
DB_SYNC=true
```

### Quên mật khẩu (OTP qua Gmail)

Thiết lập các biến môi trường cho backend `backend/MyKalimbaServer`:

- `GMAIL_USER`: địa chỉ Gmail dùng để gửi mail (vd: `yourapp@gmail.com`)
- `GMAIL_APP_PASSWORD`: App Password của Gmail (khuyến nghị bật 2FA và tạo App Password)
- (tuỳ chọn) `MAIL_FROM_NAME`: tên hiển thị (mặc định `MyKalimba`)
- (tuỳ chọn) `MAIL_FROM_EMAIL`: email hiển thị ở From (mặc định `GMAIL_USER`)

Ví dụ:

```dotenv
GMAIL_USER=yourapp@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
MAIL_FROM_NAME=MyKalimba
MAIL_FROM_EMAIL=yourapp@gmail.com
```

#### Database cho OTP

Tính năng này dùng bảng `password_reset_otps`.

- Cách nhanh: chạy backend với `DB_SYNC=true` một lần để Sequelize tự tạo bảng.
- Hoặc tự tạo bảng bằng script: [backend/MyKalimbaServer/sql/create_password_reset_otps.sql](backend/MyKalimbaServer/sql/create_password_reset_otps.sql)

### (Tuỳ chọn) Cloudinary cho ảnh đại diện

Nếu muốn upload ảnh đại diện lên Cloudinary, cấu hình:

```dotenv
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# Tuỳ chọn
CLOUDINARY_FOLDER=kalimba/avatars
```

## Troubleshooting

- Không nghe tiếng: thử click/tap lên trang 1 lần (browser “unlock audio”), tăng Volume, hoặc đổi Soundfont.
- Bàn phím không ăn: chọn `Keyboard control` trong Tùy chọn và đảm bảo không focus vào input/select.
- Lỗi CORS khi dev: set `CORS_ORIGIN=http://localhost:5173` và restart backend.

## Đóng góp

PR/Issues luôn được hoan nghênh.

- Frontend: `frontend/MyKalimba`
- Backend: `backend/MyKalimbaServer`
