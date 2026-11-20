// Component thông báo khi người dùng không có trong danh sách bầu cử
import React from 'react';

export default function ObserverModeBanner({ account }) {
  return (
    <div
      style={{
        padding: '14px 20px',
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderLeft: '4px solid #3B82F6',
        borderRadius: '10px',
        color: '#1E3A8A',
        fontSize: '0.95rem',
        fontWeight: 600,
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>Bạn không nằm trong danh sách bầu cử</span>
    </div>
  );
}
