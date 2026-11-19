// Component Header chuẩn phong cách Civic Premium Light
import React from 'react';
import { CopyIcon } from './Icons';

export default function Header({
  account,
  chainId,
  isAdmin,
  onConnectWallet,
  onCopyAddress
}) {
  // Rút gọn địa chỉ ví: 0x71d3...9a42
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : '';

  // Xác định tên mạng
  const networkName = chainId === 11155111
    ? 'Sepolia'
    : chainId === 31337 || chainId === 1337
    ? 'Localhost 31337'
    : 'Ethereum';

  return (
    <header className="top-header">
      {account ? (
        <>
          {/* Trạng thái mạng kết nối */}
          <div className="network-badge">
            <span className="network-dot" />
            <span>{networkName}</span>
          </div>

          {/* Địa chỉ ví rút gọn kèm nút sao chép */}
          <div className="wallet-box" title={account}>
            <span>{shortAddress}</span>
            <button
              type="button"
              className="wallet-copy-btn"
              onClick={() => onCopyAddress(account)}
              title="Sao chép địa chỉ ví"
            >
              <CopyIcon size={14} />
            </button>
          </div>

          {/* Huy hiệu vai trò Quản trị viên hoặc Cử tri */}
          {isAdmin ? (
            <div className="role-badge-admin">
              <span>👑</span>
              <span>Quản trị viên</span>
            </div>
          ) : (
            <div className="role-badge-voter">
              <span>🗳️</span>
              <span>Cử tri</span>
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={onConnectWallet}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.88rem' }}
        >
          🦊 Kết nối MetaMask
        </button>
      )}
    </header>
  );
}
