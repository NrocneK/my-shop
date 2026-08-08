// src/controllers/paymentController.js  [FIX - Chỉ giữ chuyển khoản ngân hàng]
// Đã bỏ hoàn toàn MoMo (không khả dụng cho dự án cá nhân)

const db = require('../config/db');

// ═══════════════════════════════════════════════════════════════
// GET /api/payment/bank-info/:orderId
// Lấy thông tin chuyển khoản + QR VietQR
// ═══════════════════════════════════════════════════════════════
const getBankInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Tìm đơn hàng theo id hoặc order_code
    const [orders] = await db.query(
      `SELECT id, order_code, total, payment_status
       FROM orders
       WHERE id = ? OR order_code = ?`,
      [orderId, orderId]
    );

    if (orders.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });

    const order  = orders[0];
    const amount = Math.round(Number(order.total));

    // Nội dung chuyển khoản: VIẾT HOA, không dấu, không ký tự đặc biệt
    const transferContent = `BAGSTORE ${order.order_code}`;

    // VietQR URL - Chuẩn NAPAS, miễn phí, không cần API key
    // Format: https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png
    const vietQrUrl = [
      `https://img.vietqr.io/image/${process.env.BANK_ID}-${process.env.BANK_ACCOUNT}-compact2.png`,
      `?amount=${amount}`,
      `&addInfo=${encodeURIComponent(transferContent)}`,
      `&accountName=${encodeURIComponent(process.env.BANK_NAME || '')}`,
    ].join('');

    // Cập nhật payment_method nếu còn là COD
    await db.query(
      `UPDATE orders
       SET payment_method = 'bank_transfer'
       WHERE id = ? AND payment_method = 'cod'`,
      [order.id]
    );

    return res.json({
      success: true,
      data: {
        bankId:          process.env.BANK_ID,
        accountNo:       process.env.BANK_ACCOUNT,
        accountName:     process.env.BANK_NAME,
        amount,
        transferContent,
        qrCodeUrl:       vietQrUrl,
        order: {
          id:         order.id,
          order_code: order.order_code,
          total:      amount,
        },
        instructions: [
          'Mở ứng dụng ngân hàng hoặc ví điện tử',
          'Quét mã QR hoặc chuyển khoản thủ công',
          `Nhập đúng số tiền: ${amount.toLocaleString('vi-VN')} VNĐ`,
          `Nội dung: ${transferContent}`,
          'Đơn hàng sẽ được xác nhận trong 15 phút sau khi chuyển khoản',
        ],
      },
    });
  } catch (err) {
    console.error('getBankInfo error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getBankInfo };
