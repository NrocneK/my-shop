// src/pages/PaymentResultPage.jsx  [V9 - MỚI]
// Trang kết quả thanh toán MoMo sau khi redirect về

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const resultCode = searchParams.get('resultCode');
  const orderId    = searchParams.get('orderId');
  const transId    = searchParams.get('transId');
  const message    = searchParams.get('message');

  const isSuccess = resultCode === '0' || resultCode === '9000';

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
        {isSuccess ? (
          <>
            <CheckCircle size={80} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Thanh Toán Thành Công! 🎉</h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              Đơn hàng của bạn đã được thanh toán qua MoMo thành công.
            </p>
            {transId && (
              <div style={{
                background: 'var(--gray-100)', borderRadius: '0.75rem',
                padding: '1rem 1.5rem', marginBottom: '1.5rem',
                display: 'inline-flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left',
              }}>
                <div><span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Mã giao dịch: </span>
                     <strong>{transId}</strong></div>
                {orderId && <div><span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Mã đơn hàng: </span>
                     <strong style={{ fontSize: '0.9rem' }}>{orderId}</strong></div>}
              </div>
            )}
          </>
        ) : (
          <>
            <XCircle size={80} color="var(--danger)" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Thanh Toán Thất Bại</h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              {message || 'Thanh toán không thành công. Đơn hàng vẫn được lưu, bạn có thể thanh toán lại sau.'}
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/profile?tab=orders" className="btn btn-primary btn-lg">
            📦 Xem đơn hàng
          </Link>
          <Link to="/products" className="btn btn-outline btn-lg">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
