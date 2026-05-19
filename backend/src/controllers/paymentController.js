// src/controllers/paymentController.js  [V9 - MoMo + Chuyển khoản]
//
// MoMo Integration:
//   - Dùng MoMo Sandbox API (test miễn phí, không cần ký hợp đồng)
//   - Đăng ký sandbox: https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
//   - Sau khi đăng ký, thay credentials trong .env
//
// Chuyển khoản ngân hàng:
//   - Tự động tạo QR code VietQR (chuẩn NAPAS, miễn phí)
//   - QR code chứa sẵn thông tin STK, số tiền, nội dung
//   - Không cần tích hợp gì thêm với ngân hàng

const crypto = require('crypto');
const https  = require('https');
const db     = require('../config/db');

// ─── BANK TRANSFER CONFIG ────────────────────────────────────
// Thông tin ngân hàng của cửa hàng - thay bằng thông tin thật
const BANK_CONFIG = {
  bankId:     process.env.BANK_ID     || 'MB',         // Mã ngân hàng (MB, VCB, TCB, ...)
  accountNo:  process.env.BANK_ACCOUNT || '9999999999', // Số tài khoản
  accountName:process.env.BANK_NAME   || 'NGUYEN VAN A', // Tên chủ TK (viết hoa, không dấu)
  // Danh sách ngân hàng phổ biến: MB, VCB (Vietcombank), TCB (Techcombank),
  // ACB, BIDV, CTG (VietinBank), VPB (VPBank), TPB (TPBank), ...
};

// ─── MOMO CONFIG ─────────────────────────────────────────────
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  accessKey:   process.env.MOMO_ACCESS_KEY   || 'F8BBA842ECF85',          // Sandbox key
  secretKey:   process.env.MOMO_SECRET_KEY   || 'K951B6PE1waDMi640xX08PD3vg6EkVlz', // Sandbox key
  apiUrl:      'https://test-payment.momo.vn', // Sandbox endpoint
  // Production: https://payment.momo.vn
};

// ─── HELPER: Tạo chữ ký HMAC SHA256 ─────────────────────────
const hmacSHA256 = (data, key) =>
  crypto.createHmac('sha256', key).update(data).digest('hex');

// ─── HELPER: HTTP request to MoMo ────────────────────────────
const momoRequest = (path, body) => new Promise((resolve, reject) => {
  const bodyStr   = JSON.stringify(body);
  const urlParsed = new URL(MOMO_CONFIG.apiUrl + path);

  const options = {
    hostname: urlParsed.hostname,
    port:     443,
    path:     urlParsed.pathname,
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(new Error('MoMo response parse error')); }
    });
  });

  req.on('error', reject);
  req.write(bodyStr);
  req.end();
});

// ═══════════════════════════════════════════════════════════════
// POST /api/payment/momo/create
// Tạo link thanh toán MoMo
// ═══════════════════════════════════════════════════════════════
const createMoMoPayment = async (req, res) => {
  try {
    const { order_id, order_code } = req.body;

    if (!order_id && !order_code)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng.' });

    // Lấy thông tin đơn hàng
    const [orders] = await db.query(
      'SELECT id, order_code, total, payment_status FROM orders WHERE ' +
      (order_id ? 'id = ?' : 'order_code = ?'),
      [order_id || order_code]
    );

    if (orders.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });

    const order = orders[0];

    if (order.payment_status === 'paid')
      return res.status(400).json({ success: false, message: 'Đơn hàng đã được thanh toán.' });

    // Chuẩn bị request MoMo
    const requestId   = `${MOMO_CONFIG.partnerCode}_${Date.now()}`;
    const orderId     = `${order.order_code}_${Date.now()}`; // Phải unique mỗi lần
    const amount      = Math.round(Number(order.total));     // VND, phải là số nguyên
    const orderInfo   = `Thanh toán đơn hàng ${order.order_code}`;
    const redirectUrl = `${process.env.APP_URL || 'http://localhost:3000'}/payment/result`;
    const ipnUrl      = `${process.env.SERVER_URL || 'http://localhost:5000'}/api/payment/momo/ipn`;
    const requestType = 'payWithMethod'; // Cho phép MoMo chọn phương thức
    const extraData   = Buffer.from(JSON.stringify({ bagstore_order_id: order.id })).toString('base64');

    // Tạo chữ ký
    const rawSignature = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${MOMO_CONFIG.partnerCode}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join('&');

    const signature = hmacSHA256(rawSignature, MOMO_CONFIG.secretKey);

    const momoBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey:   MOMO_CONFIG.accessKey,
      requestId,
      amount:      String(amount),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    };

    // Gọi MoMo API
    const momoRes = await momoRequest('/v2/gateway/api/create', momoBody);

    if (momoRes.resultCode !== 0) {
      console.error('MoMo error:', momoRes);
      return res.status(400).json({
        success: false,
        message: `MoMo: ${momoRes.message || 'Tạo thanh toán thất bại'}`,
        code: momoRes.resultCode,
      });
    }

    // Lưu momo_order_id vào DB để đối chiếu khi nhận IPN
    await db.query(
      'UPDATE orders SET momo_order_id = ?, payment_method = "momo" WHERE id = ?',
      [orderId, order.id]
    );

    return res.json({
      success:    true,
      payUrl:     momoRes.payUrl,       // URL redirect đến trang thanh toán MoMo
      deeplink:   momoRes.deeplink,     // Link mở app MoMo trực tiếp (mobile)
      qrCodeUrl:  momoRes.qrCodeUrl,    // URL ảnh QR code MoMo
      orderId:    momoRes.orderId,
      requestId:  momoRes.requestId,
    });
  } catch (err) {
    console.error('createMoMoPayment error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi kết nối đến MoMo. Vui lòng thử lại.' });
  }
};

// ═══════════════════════════════════════════════════════════════
// POST /api/payment/momo/ipn
// MoMo gọi endpoint này sau khi thanh toán xong (webhook)
// KHÔNG cần xác thực JWT (MoMo gọi từ server của họ)
// ═══════════════════════════════════════════════════════════════
const momoIPN = async (req, res) => {
  try {
    const {
      orderId, requestId, amount, orderInfo, orderType,
      transId, resultCode, message, payType, responseTime,
      extraData, signature,
    } = req.body;

    // Xác thực chữ ký từ MoMo
    const rawSignature = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${MOMO_CONFIG.partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join('&');

    const expectedSignature = hmacSHA256(rawSignature, MOMO_CONFIG.secretKey);

    if (signature !== expectedSignature) {
      console.error('MoMo IPN: Chữ ký không hợp lệ!');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // resultCode === 0: Thanh toán thành công
    if (Number(resultCode) === 0) {
      // Lấy bagstore_order_id từ extraData
      let bagsOrderId = null;
      try {
        const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString('utf-8'));
        bagsOrderId = decoded.bagstore_order_id;
      } catch {
        // fallback: tìm bằng momo_order_id
      }

      // Cập nhật trạng thái đơn hàng
      if (bagsOrderId) {
        await db.query(
          `UPDATE orders SET
             payment_status = 'paid',
             momo_trans_id  = ?,
             paid_at        = NOW()
           WHERE id = ?`,
          [String(transId), bagsOrderId]
        );
      } else {
        await db.query(
          `UPDATE orders SET
             payment_status = 'paid',
             momo_trans_id  = ?,
             paid_at        = NOW()
           WHERE momo_order_id = ?`,
          [String(transId), orderId]
        );
      }

      console.log(`✅ MoMo IPN: Đơn hàng đã thanh toán - transId: ${transId}`);
    } else {
      // Thanh toán thất bại hoặc bị hủy
      console.log(`⚠️  MoMo IPN: Thanh toán thất bại - resultCode: ${resultCode}, message: ${message}`);
    }

    // Phải trả 200 để MoMo biết đã nhận IPN
    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('momoIPN error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/payment/momo/status/:orderId
// Kiểm tra trạng thái thanh toán MoMo
// ═══════════════════════════════════════════════════════════════
const checkMoMoStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const requestId   = `check_${Date.now()}`;

    const rawSignature = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `orderId=${orderId}`,
      `partnerCode=${MOMO_CONFIG.partnerCode}`,
      `requestId=${requestId}`,
    ].join('&');

    const signature = hmacSHA256(rawSignature, MOMO_CONFIG.secretKey);

    const momoRes = await momoRequest('/v2/gateway/api/query', {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey:   MOMO_CONFIG.accessKey,
      requestId,
      orderId,
      signature,
      lang: 'vi',
    });

    return res.json({
      success:    momoRes.resultCode === 0,
      resultCode: momoRes.resultCode,
      message:    momoRes.message,
      amount:     momoRes.amount,
      transId:    momoRes.transId,
      payType:    momoRes.payType,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Không thể kiểm tra trạng thái.' });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/payment/bank-info/:orderId
// Lấy thông tin chuyển khoản + QR code VietQR
// ═══════════════════════════════════════════════════════════════
const getBankInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Lấy thông tin đơn hàng
    const [orders] = await db.query(
      'SELECT id, order_code, total, payment_status FROM orders WHERE id = ? OR order_code = ?',
      [orderId, orderId]
    );

    if (orders.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });

    const order  = orders[0];
    const amount = Math.round(Number(order.total));

    // Nội dung chuyển khoản: không dấu, không ký tự đặc biệt
    const transferContent = `BAGSTORE ${order.order_code}`;

    // VietQR URL - Tạo QR code chuẩn NAPAS (miễn phí, không cần API key)
    // Format: https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png
    //         ?amount={amount}&addInfo={noi_dung}&accountName={ten_chu_tk}
    const vietQrUrl = [
      `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png`,
      `?amount=${amount}`,
      `&addInfo=${encodeURIComponent(transferContent)}`,
      `&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`,
    ].join('');

    // Cập nhật payment_method = bank_transfer
    await db.query(
      'UPDATE orders SET payment_method = "bank_transfer" WHERE id = ? AND payment_method = "cod"',
      [order.id]
    );

    return res.json({
      success: true,
      data: {
        bankId:          BANK_CONFIG.bankId,
        accountNo:       BANK_CONFIG.accountNo,
        accountName:     BANK_CONFIG.accountName,
        amount,
        transferContent,
        qrCodeUrl:       vietQrUrl,
        order: {
          id:         order.id,
          order_code: order.order_code,
          total:      amount,
        },
        // Hướng dẫn thanh toán
        instructions: [
          'Mở ứng dụng ngân hàng hoặc ví điện tử',
          'Quét mã QR hoặc chuyển khoản thủ công',
          `Nhập số tiền: ${amount.toLocaleString('vi-VN')} VNĐ`,
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

// ═══════════════════════════════════════════════════════════════
// POST /api/payment/momo/result (redirect từ MoMo sau thanh toán)
// MoMo redirect user về URL này sau khi thanh toán
// ═══════════════════════════════════════════════════════════════
const momoResult = async (req, res) => {
  // Frontend xử lý, backend chỉ cần confirm trạng thái
  const { resultCode, orderId, transId, message } = req.query;

  if (Number(resultCode) === 0) {
    // Thanh toán thành công - cũng cập nhật ở đây (dự phòng nếu IPN chưa đến)
    try {
      await db.query(
        `UPDATE orders SET payment_status = 'paid', momo_trans_id = ?, paid_at = NOW()
         WHERE momo_order_id = ? AND payment_status != 'paid'`,
        [transId, orderId]
      );
    } catch (err) {
      console.error('momoResult DB update error:', err);
    }
  }

  // Redirect về trang kết quả của frontend
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    resultCode: resultCode || '0',
    orderId:    orderId || '',
    transId:    transId || '',
    message:    message || '',
  });

  return res.redirect(`${frontendUrl}/payment/result?${params}`);
};

module.exports = {
  createMoMoPayment,
  momoIPN,
  checkMoMoStatus,
  getBankInfo,
  momoResult,
};
