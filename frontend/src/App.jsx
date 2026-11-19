import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_DECIMAL } from './config/contract';

// Component chính quản lý giao diện bầu cử và trang quản trị Admin
export default function App() {
  // Trạng thái địa chỉ ví người dùng
  const [account, setAccount] = useState('');
  // Trạng thái chain ID mạng hiện tại
  const [chainId, setChainId] = useState(null);
  // Trạng thái địa chỉ owner của contract
  const [contractOwner, setContractOwner] = useState('');
  // Trạng thái vai trò của ví (Admin hoặc Cử tri)
  const [isAdmin, setIsAdmin] = useState(false);
  // Trạng thái thông báo lỗi
  const [errorMessage, setErrorMessage] = useState('');
  // Trạng thái thông báo thành công
  const [successMessage, setSuccessMessage] = useState('');
  // Trạng thái đang tải dữ liệu
  const [isLoading, setIsLoading] = useState(false);

  // Trạng thái form tạo cuộc bầu cử
  const [electionName, setElectionName] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Danh sách các cuộc bầu cử đã tạo
  const [electionsList, setElectionsList] = useState([]);

  // Kiểm tra mạng hiện tại có phải Sepolia không
  const isSepolia = chainId === SEPOLIA_CHAIN_ID_DECIMAL || chainId === Number(SEPOLIA_CHAIN_ID);

  // Đọc danh sách cuộc bầu cử từ smart contract
  const fetchElections = useCallback(async (contract) => {
    try {
      // Đọc tổng số cuộc bầu cử
      const countBigInt = await contract.electionCount();
      const count = Number(countBigInt);
      const list = [];

      // Duyệt qua từng ID cuộc bầu cử để lấy thông tin
      for (let i = 1; i <= count; i++) {
        const data = await contract.getElection(i);
        list.push({
          id: i,
          name: data.name,
          options: data.options,
          phase: Number(data.phase), // 0: Commit, 1: Reveal, 2: Finished
          totalCommitted: Number(data.totalCommitted),
          totalRevealed: Number(data.totalRevealed)
        });
      }

      setElectionsList(list);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bầu cử:', error);
    }
  }, []);

  // Đọc dữ liệu từ smart contract
  const loadContractData = useCallback(async (provider, currentAccount) => {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return;

    try {
      setIsLoading(true);
      // Khởi tạo contract view instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Đọc địa chỉ owner
      const ownerAddress = await contract.owner();
      setContractOwner(ownerAddress);

      // Xác định vai trò Admin
      const adminRole = currentAccount && ownerAddress.toLowerCase() === currentAccount.toLowerCase();
      setIsAdmin(adminRole);

      // Tải danh sách các cuộc bầu cử
      await fetchElections(contract);
    } catch (error) {
      console.error('Lỗi khi đọc contract:', error);
      setErrorMessage('Không thể đọc dữ liệu contract: ' + (error.reason || error.message));
    } finally {
      setIsLoading(false);
    }
  }, [fetchElections]);

  // Xử lý khi tài khoản hoặc mạng thay đổi
  const handleAccountOrNetworkChange = useCallback(async (accounts) => {
    if (!accounts || accounts.length === 0) {
      setAccount('');
      setIsAdmin(false);
      setContractOwner('');
      setElectionsList([]);
      return;
    }

    const currentAccount = accounts[0];
    setAccount(currentAccount);
    setErrorMessage('');

    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);

      if (currentChainId === SEPOLIA_CHAIN_ID_DECIMAL) {
        await loadContractData(provider, currentAccount);
      }
    }
  }, [loadContractData]);

  // Kết nối ví MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      setErrorMessage('Vui lòng cài đặt tiện ích mở rộng MetaMask để tiếp tục.');
      return;
    }

    try {
      setErrorMessage('');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await handleAccountOrNetworkChange(accounts);
    } catch (error) {
      console.error('Lỗi kết nối ví:', error);
      setErrorMessage('Kết nối ví thất bại: ' + error.message);
    }
  };

  // Chuyển sang mạng Sepolia
  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      setErrorMessage('Không thể chuyển sang mạng Sepolia: ' + switchError.message);
    }
  };

  // Thêm ô nhập lựa chọn
  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  // Xóa một ô lựa chọn
  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setErrorMessage('Một cuộc bầu cử cần tối thiểu 2 lựa chọn.');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // Thay đổi nội dung ô lựa chọn
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Gửi giao dịch tạo cuộc bầu cử mới (chỉ Admin)
  const handleCreateElection = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Kiểm tra tên cuộc bầu cử
    if (!electionName.trim()) {
      setErrorMessage('Vui lòng nhập tên cuộc bầu cử.');
      return;
    }

    // Lọc các lựa chọn không rỗng
    const validOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
    if (validOptions.length < 2) {
      setErrorMessage('Phải có ít nhất 2 lựa chọn hợp lệ.');
      return;
    }

    try {
      setIsSubmitting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Gửi giao dịch gọi hàm createElection
      const tx = await contract.createElection(electionName.trim(), validOptions);
      setSuccessMessage('Giao dịch đã được gửi, đang chờ xác nhận: ' + tx.hash);

      // Chờ xác nhận giao dịch trên blockchain
      await tx.wait();

      setSuccessMessage('Tạo cuộc bầu cử thành công!');
      setElectionName('');
      setOptions(['', '']);

      // Tải lại danh sách bầu cử mới nhất
      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi tạo bầu cử:', error);
      setErrorMessage('Tạo bầu cử thất bại: ' + (error.reason || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Khởi chạy lắng nghe sự kiện ví
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => handleAccountOrNetworkChange(accounts);
    const onChainChanged = () => window.location.reload();

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts && accounts.length > 0) {
          handleAccountOrNetworkChange(accounts);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', onAccountsChanged);
        window.ethereum.removeListener('chainChanged', onChainChanged);
      }
    };
  }, [handleAccountOrNetworkChange]);

  // Nhãn hiển thị giai đoạn
  const getPhaseBadge = (phase) => {
    switch (phase) {
      case 0:
        return <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Commit (Bỏ phiếu kín)</span>;
      case 1:
        return <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>Reveal (Mở phiếu)</span>;
      case 2:
        return <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Finished (Đã kết thúc)</span>;
      default:
        return <span className="badge">Chưa xác định</span>;
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Hệ Thống Bỏ Phiếu Điện Tử EVoting</h1>
        <p className="subtitle">Quản lý cuộc bầu cử minh bạch trên mạng Ethereum Sepolia</p>

        {/* Thông báo lỗi */}
        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        {/* Thông báo thành công */}
        {successMessage && (
          <div className="alert" style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
            {successMessage}
          </div>
        )}

        {/* Cảnh báo sai mạng */}
        {account && !isSepolia && (
          <div className="alert alert-warning">
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>Sai mạng kết nối!</strong> Vui lòng chuyển sang mạng <strong>Sepolia Testnet</strong>.
            </p>
            <button className="btn btn-warning" onClick={switchToSepolia}>
              Chuyển sang Sepolia
            </button>
          </div>
        )}

        {/* Thông tin tài khoản ví */}
        {!account ? (
          <div>
            <p>Vui lòng kết nối ví MetaMask để truy cập hệ thống.</p>
            <button className="btn btn-primary" onClick={connectWallet}>
              Kết nối ví MetaMask
            </button>
          </div>
        ) : (
          <div>
            <div className="info-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="info-label">Ví hiện tại:</div>
                <div className="info-value">{account}</div>
              </div>
              <div>
                {isAdmin ? (
                  <span className="badge badge-admin">Quản trị viên (Admin)</span>
                ) : (
                  <span className="badge badge-voter">Cử tri</span>
                )}
              </div>
            </div>

            {/* Khu vực tạo cuộc bầu cử của Admin (Task T004) */}
            {isAdmin && isSepolia && (
              <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.2rem', marginTop: 0, marginBottom: '16px', color: '#0f172a' }}>
                  Tạo cuộc bầu cử mới (Admin)
                </h2>
                <form onSubmit={handleCreateElection}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
                      Tiêu đề cuộc bầu cử:
                    </label>
                    <input
                      type="text"
                      value={electionName}
                      onChange={(e) => setElectionName(e.target.value)}
                      placeholder="Ví dụ: Bầu cử Trưởng nhóm dự án 2026"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
                      Danh sách lựa chọn / Ứng viên:
                    </label>
                    {options.map((option, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Lựa chọn #${index + 1}`}
                          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddOption}
                      style={{ padding: '6px 12px', fontSize: '0.85rem', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '4px' }}
                    >
                      + Thêm lựa chọn
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ width: '100%', marginTop: '8px' }}
                  >
                    {isSubmitting ? 'Đang gửi giao dịch...' : 'Tạo cuộc bầu cử'}
                  </button>
                </form>
              </div>
            )}

            {/* Danh sách các cuộc bầu cử */}
            <div style={{ marginTop: '28px' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '14px', color: '#0f172a' }}>
                Danh sách cuộc bầu cử ({electionsList.length})
              </h2>

              {isLoading ? (
                <p>Đang tải dữ liệu từ Smart Contract...</p>
              ) : electionsList.length === 0 ? (
                <p style={{ color: '#64748b' }}>Chưa có cuộc bầu cử nào được tạo.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {electionsList.map((election) => (
                    <div
                      key={election.id}
                      style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                          #{election.id}. {election.name}
                        </span>
                        {getPhaseBadge(election.phase)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '6px' }}>
                        <strong>Các lựa chọn:</strong> {election.options.join(', ')}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Phiếu đã commit: {election.totalCommitted} | Phiếu đã mở: {election.totalRevealed}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
