// Component Modal Sao lưu chứng từ phiếu bầu chuẩn Screen 8 hình ảnh tham chiếu
import React from 'react';
import { CheckIcon, CopyIcon } from './Icons';

export default function SaltBackupModal({
  isOpen,
  onClose,
  electionName,
  optionName,
  salt,
  commitHash,
  timestamp,
  onCopySalt,
  onDownloadBackup
}) {
  if (!isOpen) return null;

  // Rút gọn mã băm commit: 0x4dBe...7a91
  const shortHash = commitHash
    ? `${commitHash.slice(0, 6)}...${commitHash.slice(-4)}`
    : '0x...';

  // Định dạng ngày giờ bỏ phiếu
  const timeFormatted = timestamp
    ? new Date(timestamp).toLocaleString('vi-VN')
    : new Date().toLocaleString('vi-VN');

  return (
    <div className="modal-backdrop-layer">
      <div className="salt-modal-card">
        {/* Biểu tượng khiên xanh thành công */}
        <div className="modal-check-badge">
          <CheckIcon size={28} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#101936', marginBottom: '6px' }}>
          Đã gửi phiếu kín thành công!
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#65718B', marginBottom: '20px' }}>
          Phiếu bầu của bạn đã được niêm phong và ghi nhận trên Blockchain.
        </p>

        {/* Khung hiển thị mã Salt 66 ký tự */}
        <div style={{ textAlign: 'left', marginBottom: '4px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
            Mã Salt của bạn (32 bytes — 66 ký tự)
          </label>
        </div>

        <div className="salt-display-box">
          <span style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{salt}</span>
          <button
            type="button"
            className="wallet-copy-btn"
            onClick={() => onCopySalt(salt)}
            title="Sao chép mã Salt"
          >
            <CopyIcon size={16} />
          </button>
        </div>

        {/* Bảng tóm tắt thông tin lá phiếu 3 cột */}
        <div className="vote-receipt-summary-grid">
          <div>
            <div style={{ fontSize: '0.75rem', color: '#65718B', marginBottom: '2px' }}>Phương án đã chọn</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#101936' }}>{optionName}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#65718B', marginBottom: '2px' }}>Mã băm (Commit)</div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 600, color: '#3155F5' }}>{shortHash}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#65718B', marginBottom: '2px' }}>Thời gian bỏ phiếu</div>
            <div style={{ fontSize: '0.82rem', color: '#101936', fontWeight: 500 }}>{timeFormatted}</div>
          </div>
        </div>

        {/* Hàng nút sao lưu */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => onCopySalt(salt)}
            className="btn-secondary"
            style={{ flex: 1, padding: '9px 12px', fontSize: '0.88rem' }}
          >
            <CopyIcon size={16} />
            <span>Sao chép mã Salt</span>
          </button>
          <button
            type="button"
            onClick={onDownloadBackup}
            className="btn-secondary"
            style={{ flex: 1, padding: '9px 12px', fontSize: '0.88rem' }}
          >
            <span>💾 Tải file chứng từ (.txt)</span>
          </button>
        </div>

        {/* Nút hoàn tất đóng modal */}
        <button
          type="button"
          onClick={onClose}
          className="btn-primary"
          style={{ width: '100%', padding: '11px', fontSize: '0.95rem' }}
        >
          Hoàn tất
        </button>
      </div>
    </div>
  );
}
