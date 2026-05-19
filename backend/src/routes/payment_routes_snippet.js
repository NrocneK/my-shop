// ============================================================
// THÊM VÀO src/routes/index.js  [V9 - Payment Routes]
// Thêm đoạn code dưới đây vào file routes/index.js hiện tại
// (Đặt trước dòng module.exports = router;)
// ============================================================

// Thêm require ở đầu file:
// const paymentCtrl = require('../controllers/paymentController');

// ================================ PAYMENT
// MoMo
router.post('/payment/momo/create',     optionalAuthenticate, paymentCtrl.createMoMoPayment);
router.post('/payment/momo/ipn',        paymentCtrl.momoIPN);           // webhook, không cần auth
router.get ('/payment/momo/result',     paymentCtrl.momoResult);         // redirect từ MoMo
router.get ('/payment/momo/status/:orderId', authenticate, paymentCtrl.checkMoMoStatus);

// Chuyển khoản ngân hàng
router.get ('/payment/bank-info/:orderId', optionalAuthenticate, paymentCtrl.getBankInfo);
