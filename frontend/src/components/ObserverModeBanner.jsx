// Component thông báo Chế độ Quan sát viên (Observer Mode) thiết kế chuẩn Civic UI
import React, { useState } from 'react';

export default function ObserverModeBanner({ account }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : 'Chưa kết nối';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderLeft: '4px solid #4F46E5',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        marginBottom: '24px',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
        {/* 1. Icon bên trái: Box 48px, bo góc 12px, gradient nhẹ */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            color: '#4F46E5',
            border: '1px solid #C7D2FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        {/* 2. Nội dung bên phải */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          {/* Badge nhỏ "CHỈ XEM" phía trên */}
          <div style={{ marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '2px 10px',
                borderRadius: '9999px',
                backgroundColor: '#EEF2FF',
                color: '#4338CA',
                border: '1px solid #C7D2FE'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4F46E5' }} />
              CHỈ XEM
            </span>
          </div>

          {/* Tiêu đề phân cấp thị giác */}
          <h4 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
            Chế độ Quan sát viên (Observer Mode)
          </h4>

          {/* Dòng 1: Trạng thái ví + Chip monospace kèm copy & tooltip */}
          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>Bạn không có trong danh sách bầu cử:</span>
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1'
              }}
              title={account || 'Chưa kết nối'}
            >
              <span>{shortAddress}</span>
              {account && (
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: copied ? '#16A34A' : '#64748B',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Sao chép địa chỉ ví"
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Dòng 2: Quyền hạn chia 2 cụm trực quan (Đạt chuẩn WCAG AA) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '8px',
              paddingTop: '10px',
              borderTop: '1px solid #F1F5F9',
              fontSize: '0.84rem',
              color: '#334155'
            }}
          >
            {/* Cụm 1: Bạn có thể */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#16A34A',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: '11px',
                  marginTop: '1px'
                }}
              >
                ✓
              </span>
              <span>
                <strong style={{ color: '#0F172A' }}>Bạn có thể:</strong> Xem tiến độ, danh sách người tham gia, số phiếu trên Blockchain.
              </span>
            </div>

            {/* Cụm 2: Bạn không thể */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: '11px',
                  marginTop: '1px'
                }}
              >
                ✕
              </span>
              <span>
                <strong style={{ color: '#0F172A' }}>Bạn không thể:</strong> Bỏ phiếu kín hoặc mở phiếu.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
