# kalimba

## Quên mật khẩu (OTP qua Gmail)

### Backend env vars

Thiết lập các biến môi trường cho backend `backend/MyKalimbaServer`:

- `GMAIL_USER`: địa chỉ Gmail dùng để gửi mail (vd: `yourapp@gmail.com`)
- `GMAIL_APP_PASSWORD`: App Password của Gmail (khuyến nghị bật 2FA và tạo App Password)
- (tuỳ chọn) `MAIL_FROM_NAME`: tên hiển thị (mặc định `MyKalimba`)
- (tuỳ chọn) `MAIL_FROM_EMAIL`: email hiển thị ở From (mặc định `GMAIL_USER`)

### Database

Tính năng này dùng bảng `password_reset_otps`.

- Cách nhanh: chạy backend với `DB_SYNC=true` một lần để Sequelize tự tạo bảng.
- Hoặc tự tạo bảng bằng script: [backend/MyKalimbaServer/sql/create_password_reset_otps.sql](backend/MyKalimbaServer/sql/create_password_reset_otps.sql)
