// src/config/email.js
// Cấu hình Nodemailer + các template email

const nodemailer = require('nodemailer');
require('dotenv').config();

// Tạo transporter kết nối SMTP
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true = port 465, false = port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Kiểm tra kết nối email khi khởi động
transporter.verify((err) => {
  if (err) {
    console.warn('⚠️  Email chưa cấu hình hoặc thông tin sai:', err.message);
  } else {
    console.log('✅ Kết nối email SMTP thành công!');
  }
});

/**
 * Hàm gửi email cơ bản
 */
const sendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from:    process.env.EMAIL_FROM || '"BagStore" <no-reply@bagstore.vn>',
    to,
    subject,
    html,
  });
};

// ============================================================
// EMAIL TEMPLATES
// ============================================================

/**
 * Email xác thực tài khoản
 */
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

  await sendMail({
    to:      user.email,
    subject: '✅ Xác thực tài khoản BagStore của bạn',
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #F97316, #EA580C); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.5rem;">👜 BagStore</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 0.5rem 0 0; font-size: 0.9rem;">Xác thực tài khoản</p>
        </div>
        <!-- Body -->
        <div style="padding: 2rem;">
          <h2 style="color: #1E293B; margin-top: 0;">Chào ${user.full_name}! 👋</h2>
          <p style="color: #6B7280; line-height: 1.7;">
            Cảm ơn bạn đã đăng ký tài khoản tại <strong>BagStore</strong>.
            Vui lòng nhấn nút bên dưới để xác thực địa chỉ email và kích hoạt tài khoản.
          </p>
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${verifyUrl}"
               style="display: inline-block; background: #F97316; color: white; padding: 0.875rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 1rem;">
              ✅ Xác Thực Email Ngay
            </a>
          </div>
          <p style="color: #9CA3AF; font-size: 0.8rem; text-align: center;">
            Link có hiệu lực trong <strong>24 giờ</strong>. Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.
          </p>
          <hr style="border: none; border-top: 1px solid #E9ECEF; margin: 1.5rem 0;" />
          <p style="color: #9CA3AF; font-size: 0.75rem; text-align: center;">
            Hoặc copy link này vào trình duyệt:<br/>
            <span style="color: #F97316; word-break: break-all;">${verifyUrl}</span>
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Email đặt lại mật khẩu
 */
const sendResetPasswordEmail = async (user, token) => {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  await sendMail({
    to:      user.email,
    subject: '🔐 Đặt lại mật khẩu BagStore',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #1E293B, #334155); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.5rem;">👜 BagStore</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0 0; font-size: 0.9rem;">Khôi phục mật khẩu</p>
        </div>
        <div style="padding: 2rem;">
          <h2 style="color: #1E293B; margin-top: 0;">Xin chào ${user.full_name},</h2>
          <p style="color: #6B7280; line-height: 1.7;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
            Nhấn nút bên dưới để tạo mật khẩu mới.
          </p>
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #F97316; color: white; padding: 0.875rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 1rem;">
              🔐 Đặt Lại Mật Khẩu
            </a>
          </div>
          <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
            <p style="margin: 0; color: #92400E; font-size: 0.85rem;">
              ⚠️ Link có hiệu lực trong <strong>1 giờ</strong>.
              Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — tài khoản vẫn an toàn.
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

/**
 * Email thông báo liên hệ đến admin
 */
const sendContactNotification = async (contact) => {
  await sendMail({
    to:      process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `📬 Liên hệ mới từ ${contact.full_name}: ${contact.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: #1E293B; padding: 1.5rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.25rem;">📬 Tin nhắn liên hệ mới</h1>
        </div>
        <div style="padding: 1.5rem;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 0.5rem; color: #6B7280; width: 120px;"><strong>Họ tên:</strong></td><td style="padding: 0.5rem;">${contact.full_name}</td></tr>
            <tr style="background:#F8F9FA;"><td style="padding: 0.5rem; color: #6B7280;"><strong>Email:</strong></td><td style="padding: 0.5rem;"><a href="mailto:${contact.email}">${contact.email}</a></td></tr>
            <tr><td style="padding: 0.5rem; color: #6B7280;"><strong>Điện thoại:</strong></td><td style="padding: 0.5rem;">${contact.phone || 'Không có'}</td></tr>
            <tr style="background:#F8F9FA;"><td style="padding: 0.5rem; color: #6B7280;"><strong>Chủ đề:</strong></td><td style="padding: 0.5rem;"><strong>${contact.subject}</strong></td></tr>
          </table>
          <div style="margin-top: 1rem; padding: 1rem; background: #F8F9FA; border-left: 4px solid #F97316; border-radius: 4px;">
            <p style="margin: 0; color: #374151; line-height: 1.7; white-space: pre-line;">${contact.message}</p>
          </div>
          <p style="color: #9CA3AF; font-size: 0.75rem; margin-top: 1rem;">
            Gửi lúc: ${new Date().toLocaleString('vi-VN')}
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Email xác nhận gửi liên hệ cho khách
 */
const sendContactConfirmation = async (contact) => {
  await sendMail({
    to:      contact.email,
    subject: '✅ BagStore đã nhận tin nhắn của bạn!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #F97316, #EA580C); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0;">👜 BagStore</h1>
        </div>
        <div style="padding: 2rem;">
          <h2 style="color: #1E293B;">Cảm ơn ${contact.full_name}! 🙏</h2>
          <p style="color: #6B7280; line-height: 1.7;">
            Chúng tôi đã nhận được tin nhắn của bạn về chủ đề <strong>"${contact.subject}"</strong>.
            Đội ngũ chăm sóc khách hàng sẽ phản hồi trong vòng <strong>24 giờ làm việc</strong>.
          </p>
          <div style="text-align: center; margin: 1.5rem 0;">
            <a href="${process.env.APP_URL}/products"
               style="display: inline-block; background: #F97316; color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; text-decoration: none; font-weight: 600;">
              Tiếp tục mua sắm →
            </a>
          </div>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendContactNotification,
  sendContactConfirmation,
};
