import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_DECIMAL } from './config/contract';

// Component chính quản lý kết nối ví và vai trò người dùng (Walking Skeleton)
export default function App() {
  // Trạng thái địa chỉ ví người dùng
  const [account, setAccount] = useState('');
  // Trạng thái chain ID mạng hiện tại
  const [chainId, setChainId] = useState(null);
  // Trạng thái địa chỉ owner của contract
  const [contractOwner, setContractOwner] = useState('');
  // Trạng thái vai trò của ví (Admin hoặc Cử tri)
  const [role, setRole] = useState('');
  // Trạng thái thông báo lỗi
  const [errorMessage, setErrorMessage] = useState('');
  // Trạng thái đang tải dữ liệu
  const [isLoading, setIsLoading] = useState(false);

  // Kiểm tra mạng hiện tại có phải Sepolia không
  const isSepolia = chainId === SEPOLIA_CHAIN_ID_DECIMAL || chainId === Number(SEPOLIA_CHAIN_ID);

  // Đọc địa chỉ owner từ smart contract
  const fetchContractOwner = useCallback(async (provider, currentAccount) => {
    // Bỏ qua nếu chưa cấu hình địa chỉ contract thật
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      setContractOwner('Chưa cấu hình CONTRACT_ADDRESS');
      setRole('Cần cấu hình địa chỉ contract trong src/config/contract.js');
      return;
    }

    try {
      setIsLoading(true);
      // Tạo contract instance ở chế độ view
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      // Gọi hàm owner() của contract
      const ownerAddress = await contract.owner();
      setContractOwner(ownerAddress);

      // So sánh địa chỉ ví hiện tại với owner để xác định vai trò
      if (currentAccount && ownerAddress.toLowerCase() === currentAccount.toLowerCase()) {
        setRole('Admin (Quản trị viên)');
      } else {
        setRole('Cử tri');
      }
    } catch (error) {
      // Báo lỗi nếu không đọc được contract
      console.error('Lỗi khi đọc contract owner:', error);
      setErrorMessage('Không thể đọc thông tin từ contract: ' + (error.reason || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Xử lý khi tài khoản hoặc mạng thay đổi
  const handleAccountOrNetworkChange = useCallback(async (accounts) => {
    // Xử lý khi ngắt kết nối ví
    if (!accounts || accounts.length === 0) {
      setAccount('');
      setRole('');
      setContractOwner('');
      return;
    }

    // Cập nhật tài khoản mới
    const currentAccount = accounts[0];
    setAccount(currentAccount);
    setErrorMessage('');

    // Kiểm tra mạng hiện tại
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);

      // Nếu đúng mạng Sepolia thì đọc thông tin contract
      if (currentChainId === SEPOLIA_CHAIN_ID_DECIMAL) {
        await fetchContractOwner(provider, currentAccount);
      }
    }
  }, [fetchContractOwner]);

  // Kết nối với ví MetaMask
  const connectWallet = async () => {
    // Kiểm tra trình duyệt có cài MetaMask không
    if (!window.ethereum) {
      setErrorMessage('Vui lòng cài đặt tiện ích mở rộng MetaMask để tiếp tục.');
      return;
    }

    try {
      setErrorMessage('');
      // Yêu cầu cấp quyền truy cập tài khoản
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await handleAccountOrNetworkChange(accounts);
    } catch (error) {
      // Báo lỗi khi người dùng từ chối kết nối
      console.error('Lỗi kết nối ví:', error);
      setErrorMessage('Kết nối ví thất bại: ' + error.message);
    }
  };

  // Yêu cầu MetaMask chuyển sang mạng Sepolia
  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      // Yêu cầu chuyển mạng sang Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // Nếu mạng Sepolia chưa có trong MetaMask, yêu cầu thêm mạng
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia test network',
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          setErrorMessage('Không thể thêm mạng Sepolia: ' + addError.message);
        }
      } else {
        setErrorMessage('Không thể chuyển sang mạng Sepolia: ' + switchError.message);
      }
    }
  };

  // Lắng nghe sự kiện tài khoản và mạng của MetaMask khi component khởi chạy
  useEffect(() => {
    if (!window.ethereum) return;

    // Lắng nghe đổi tài khoản
    const onAccountsChanged = (accounts) => {
      handleAccountOrNetworkChange(accounts);
    };

    // Lắng nghe đổi mạng
    const onChainChanged = () => {
      // Tải lại dữ liệu khi mạng thay đổi
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);

    // Kiểm tra xem đã kết nối sẵn trước đó chưa
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts && accounts.length > 0) {
          handleAccountOrNetworkChange(accounts);
        }
      })
      .catch((err) => console.error(err));

    // Dọn dẹp listener khi unmount
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', onAccountsChanged);
        window.ethereum.removeListener('chainChanged', onChainChanged);
      }
    };
  }, [handleAccountOrNetworkChange]);

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Hệ Thống Bỏ Phiếu Điện Tử EVoting</h1>
        <p className="subtitle">Khung kết nối ví MetaMask & Smart Contract (Task T003 - Walking Skeleton)</p>

        {/* Hiển thị lỗi nếu có */}
        {errorMessage && (
          <div className="alert alert-error">
            {errorMessage}
          </div>
        )}

        {/* Cảnh báo khi sai mạng */}
        {account && !isSepolia && (
          <div className="alert alert-warning">
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>Sai mạng kết nối!</strong> Vui lòng chuyển sang mạng <strong>Sepolia Testnet</strong> để tương tác.
            </p>
            <button className="btn btn-warning" onClick={switchToSepolia}>
              Chuyển sang Sepolia
            </button>
          </div>
        )}

        {/* Nút kết nối hoặc thông tin tài khoản */}
        {!account ? (
          <div>
            <p>Kết nối ví MetaMask của bạn để bắt đầu xác thực vai trò.</p>
            <button className="btn btn-primary" onClick={connectWallet}>
              Kết nối ví MetaMask
            </button>
          </div>
        ) : (
          <div>
            <div className="info-group">
              <div className="info-label">Địa chỉ ví của bạn:</div>
              <div className="info-value">{account}</div>
            </div>

            <div className="info-group">
              <div className="info-label">Mạng kết nối:</div>
              <div className="info-value">
                {isSepolia ? 'Sepolia Testnet (Hợp lệ)' : `Chain ID: ${chainId} (Chưa đúng Sepolia)`}
              </div>
            </div>

            <div className="info-group">
              <div className="info-label">Smart Contract:</div>
              <div className="info-value">{CONTRACT_ADDRESS}</div>
            </div>

            <div className="info-group">
              <div className="info-label">Chủ hợp đồng (Owner):</div>
              <div className="info-value">{isLoading ? 'Đang đọc...' : contractOwner}</div>
            </div>

            <div className="info-group" style={{ borderBottom: 'none' }}>
              <div className="info-label">Vai trò nhận diện:</div>
              <div style={{ marginTop: '6px' }}>
                {role.includes('Admin') ? (
                  <span className="badge badge-admin">{role}</span>
                ) : role === 'Cử tri' ? (
                  <span className="badge badge-voter">{role}</span>
                ) : (
                  <span>{role || 'Chưa xác định'}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
