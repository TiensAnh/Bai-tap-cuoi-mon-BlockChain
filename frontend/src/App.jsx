import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_DECIMAL } from './config/contract';

// Component chính quản lý giao diện bầu cử, cử tri và bỏ phiếu kín Commit
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

  // Trạng thái nhập danh sách cử tri theo từng electionId
  const [voterInputs, setVoterInputs] = useState({});
  // Trạng thái đang gửi giao dịch thêm cử tri theo electionId
  const [isAddingVoters, setIsAddingVoters] = useState({});

  // Trạng thái lựa chọn ứng viên theo từng electionId (dùng khi bỏ phiếu)
  const [selectedOptions, setSelectedOptions] = useState({});
  // Trạng thái đang gửi giao dịch bỏ phiếu kín commit
  const [isCommiting, setIsCommiting] = useState({});
  // Trạng thái hiển thị thông tin salt đã lưu
  const [showSaltInfo, setShowSaltInfo] = useState({});

  // Kiểm tra mạng hiện tại có phải Sepolia không
  const isSepolia = chainId === SEPOLIA_CHAIN_ID_DECIMAL || chainId === Number(SEPOLIA_CHAIN_ID);

  // Đọc danh sách cuộc bầu cử, whitelist và trạng thái commit từ smart contract
  const fetchElections = useCallback(async (contract, currentAccount) => {
    try {
      // Đọc tổng số cuộc bầu cử
      const countBigInt = await contract.electionCount();
      const count = Number(countBigInt);
      const list = [];

      // Duyệt qua từng cuộc bầu cử để lấy thông tin chi tiết
      for (let i = 1; i <= count; i++) {
        const data = await contract.getElection(i);
        let whitelisted = false;
        let committed = false;

        // Nếu có tài khoản kết nối thì kiểm tra whitelist và trạng thái đã commit
        if (currentAccount) {
          try {
            whitelisted = await contract.isWhitelisted(i, currentAccount);
            committed = await contract.hasVoterCommitted(i, currentAccount);
          } catch (e) {
            console.error('Lỗi kiểm tra quyền cử tri:', e);
          }
        }

        // Lấy thông tin commit đã lưu trong localStorage (nếu có)
        let savedCommitData = null;
        if (currentAccount) {
          const key = `evote_commit_${i}_${currentAccount.toLowerCase()}`;
          const localStr = localStorage.getItem(key);
          if (localStr) {
            try {
              savedCommitData = JSON.parse(localStr);
            } catch (err) {
              console.error(err);
            }
          }
        }

        list.push({
          id: i,
          name: data.name,
          options: data.options,
          phase: Number(data.phase), // 0: Commit, 1: Reveal, 2: Finished
          totalCommitted: Number(data.totalCommitted),
          totalRevealed: Number(data.totalRevealed),
          isWhitelisted: whitelisted,
          hasCommitted: committed,
          savedCommit: savedCommitData
        });
      }

      setElectionsList(list);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bầu cử:', error);
    }
  }, []);

  // Tải dữ liệu toàn bộ từ Smart Contract
  const loadContractData = useCallback(async (provider, currentAccount) => {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return;

    try {
      setIsLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Đọc địa chỉ owner
      const ownerAddress = await contract.owner();
      setContractOwner(ownerAddress);

      // Xác định vai trò Admin
      const adminRole = currentAccount && ownerAddress.toLowerCase() === currentAccount.toLowerCase();
      setIsAdmin(adminRole);

      // Tải danh sách cuộc bầu cử
      await fetchElections(contract, currentAccount);
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

  // Thêm ô nhập lựa chọn trong form Admin
  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  // Xóa một ô lựa chọn trong form Admin
  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setErrorMessage('Một cuộc bầu cử cần tối thiểu 2 lựa chọn.');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // Cập nhật nội dung ô lựa chọn
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Gửi giao dịch tạo cuộc bầu cử mới (Admin)
  const handleCreateElection = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!electionName.trim()) {
      setErrorMessage('Vui lòng nhập tên cuộc bầu cử.');
      return;
    }

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

      const tx = await contract.createElection(electionName.trim(), validOptions);
      setSuccessMessage('Giao dịch tạo bầu cử đã gửi: ' + tx.hash);

      await tx.wait();
      setSuccessMessage('Tạo cuộc bầu cử thành công!');
      setElectionName('');
      setOptions(['', '']);

      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi tạo bầu cử:', error);
      setErrorMessage('Tạo bầu cử thất bại: ' + (error.reason || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cập nhật nội dung nhập danh sách cử tri theo từng electionId
  const handleVoterInputChange = (electionId, value) => {
    setVoterInputs({ ...voterInputs, [electionId]: value });
  };

  // Gửi giao dịch thêm cử tri vào Whitelist (Admin)
  const handleAddVoters = async (electionId) => {
    setErrorMessage('');
    setSuccessMessage('');

    const rawText = voterInputs[electionId] || '';
    const rawList = rawText.split(/[\n,; ]+/).map((addr) => addr.trim()).filter((addr) => addr.length > 0);

    if (rawList.length === 0) {
      setErrorMessage('Vui lòng nhập ít nhất một địa chỉ ví cử tri.');
      return;
    }

    const validAddresses = [];
    for (const addr of rawList) {
      if (!ethers.isAddress(addr)) {
        setErrorMessage(`Địa chỉ ví không hợp lệ: ${addr}`);
        return;
      }
      validAddresses.push(ethers.getAddress(addr));
    }

    try {
      setIsAddingVoters({ ...isAddingVoters, [electionId]: true });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.addVoters(electionId, validAddresses);
      setSuccessMessage(`Đã gửi giao dịch thêm ${validAddresses.length} cử tri: ${tx.hash}`);

      await tx.wait();
      setSuccessMessage(`Đã thêm thành công ${validAddresses.length} cử tri vào Whitelist!`);
      setVoterInputs({ ...voterInputs, [electionId]: '' });

      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi thêm cử tri:', error);
      setErrorMessage('Thêm cử tri thất bại: ' + (error.reason || error.message));
    } finally {
      setIsAddingVoters({ ...isAddingVoters, [electionId]: false });
    }
  };

  // Cập nhật lựa chọn ứng viên của cử tri
  const handleSelectOption = (electionId, optionIndex) => {
    setSelectedOptions({ ...selectedOptions, [electionId]: optionIndex });
  };

  // Bỏ phiếu kín bằng mã băm commit (Task T006)
  const handleCommitVote = async (election) => {
    setErrorMessage('');
    setSuccessMessage('');

    const optionIndex = selectedOptions[election.id];
    if (optionIndex === undefined || optionIndex === null) {
      setErrorMessage('Vui lòng chọn một phương án / ứng viên trước khi bỏ phiếu.');
      return;
    }

    try {
      setIsCommiting({ ...isCommiting, [election.id]: true });

      // 1. Sinh chuỗi salt ngẫu nhiên 32 bytes an toàn
      const salt = ethers.hexlify(ethers.randomBytes(32));

      // 2. Tính mã băm bí mật keccak256(option, salt, voterAddress)
      const commitHash = ethers.solidityPackedKeccak256(
        ['uint256', 'bytes32', 'address'],
        [optionIndex, salt, account]
      );

      // 3. Lưu thông tin bỏ phiếu bí mật vào localStorage của trình duyệt
      const commitData = {
        electionId: election.id,
        optionIndex: optionIndex,
        optionName: election.options[optionIndex],
        salt: salt,
        commitHash: commitHash,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`evote_commit_${election.id}_${account.toLowerCase()}`, JSON.stringify(commitData));

      // 4. Gửi mã băm commit lên Smart Contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.commitVote(election.id, commitHash);
      setSuccessMessage(`Giao dịch bỏ phiếu kín đã gửi: ${tx.hash}`);

      // Chờ xác nhận giao dịch
      await tx.wait();
      setSuccessMessage('Bỏ phiếu kín thành công! Lựa chọn của bạn đã được bảo mật an toàn.');

      // Tải lại dữ liệu cuộc bầu cử
      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi bỏ phiếu kín:', error);
      setErrorMessage('Bỏ phiếu thất bại: ' + (error.reason || error.message));
    } finally {
      setIsCommiting({ ...isCommiting, [election.id]: false });
    }
  };

  // Bật/tắt hiển thị thông tin salt
  const toggleShowSalt = (electionId) => {
    setShowSaltInfo({ ...showSaltInfo, [electionId]: !showSaltInfo[electionId] });
  };

  // Lắng nghe sự kiện tài khoản MetaMask
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
        <p className="subtitle">Bỏ phiếu ẩn danh minh bạch qua cơ chế Commit-Reveal trên Sepolia</p>

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

            {/* Khu vực tạo cuộc bầu cử của Admin */}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {electionsList.map((election) => (
                    <div
                      key={election.id}
                      style={{ padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                          #{election.id}. {election.name}
                        </span>
                        {getPhaseBadge(election.phase)}
                      </div>

                      <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '8px' }}>
                        <strong>Các lựa chọn:</strong> {election.options.join(', ')}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Phiếu đã commit: <strong>{election.totalCommitted}</strong> | Phiếu đã mở: <strong>{election.totalRevealed}</strong>
                        </div>
                        {/* Huy hiệu hiển thị quyền bỏ phiếu của ví hiện tại */}
                        <div>
                          {election.isWhitelisted ? (
                            <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                              ✓ Đủ điều kiện bỏ phiếu (Trong Whitelist)
                            </span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                              Chưa có quyền bầu (Ngoài Whitelist)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* KHU VỰC BỎ PHIẾU KÍN COMMIT (Task T006) */}
                      {election.phase === 0 && election.isWhitelisted && (
                        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                          <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '12px', color: '#166534' }}>
                            Bỏ phiếu kín (Giai đoạn Commit)
                          </h3>

                          {!election.hasCommitted ? (
                            <div>
                              <p style={{ fontSize: '0.85rem', color: '#15803d', marginTop: 0, marginBottom: '10px' }}>
                                Lựa chọn của bạn sẽ được băm cùng chuỗi Salt bí mật trước khi gửi lên blockchain.
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                                {election.options.map((opt, idx) => (
                                  <label
                                    key={idx}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', cursor: 'pointer', padding: '6px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #dcfce7' }}
                                  >
                                    <input
                                      type="radio"
                                      name={`option_${election.id}`}
                                      value={idx}
                                      checked={selectedOptions[election.id] === idx}
                                      onChange={() => handleSelectOption(election.id, idx)}
                                    />
                                    <span>#{idx + 1}. {opt}</span>
                                  </label>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCommitVote(election)}
                                disabled={isCommiting[election.id]}
                                className="btn btn-primary"
                                style={{ backgroundColor: '#16a34a', width: '100%' }}
                              >
                                {isCommiting[election.id] ? 'Đang tạo hash và gửi phiếu...' : '🔒 Gửi phiếu kín (Commit Vote)'}
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p style={{ color: '#15803d', fontWeight: 600, margin: '0 0 10px 0' }}>
                                ✓ Bạn đã bỏ phiếu kín thành công!
                              </p>
                              <button
                                type="button"
                                onClick={() => toggleShowSalt(election.id)}
                                style={{ fontSize: '0.8rem', padding: '4px 10px', backgroundColor: '#ffffff', border: '1px solid #86efac', borderRadius: '4px', cursor: 'pointer', color: '#166534' }}
                              >
                                {showSaltInfo[election.id] ? 'Ẩn thông tin Salt' : 'Xem thông tin Salt đã lưu'}
                              </button>

                              {showSaltInfo[election.id] && election.savedCommit && (
                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #d1fae5', wordBreak: 'break-all' }}>
                                  <div><strong>Phương án đã chọn:</strong> #{election.savedCommit.optionIndex + 1}. {election.savedCommit.optionName}</div>
                                  <div style={{ marginTop: '4px' }}><strong>Mã Salt bí mật:</strong> {election.savedCommit.salt}</div>
                                  <div style={{ marginTop: '4px' }}><strong>Mã Commit Hash:</strong> {election.savedCommit.commitHash}</div>
                                  <p style={{ color: '#b45309', margin: '6px 0 0 0', fontSize: '0.75rem' }}>
                                    ⚠️ Trình duyệt đã tự động lưu mã Salt này. Ở giai đoạn Reveal, web sẽ tự đọc lại để mở phiếu cho bạn.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Khu vực thêm cử tri của Admin */}
                      {isAdmin && election.phase === 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            Thêm cử tri vào Whitelist (Admin):
                          </label>
                          <textarea
                            rows="2"
                            value={voterInputs[election.id] || ''}
                            onChange={(e) => handleVoterInputChange(election.id, e.target.value)}
                            placeholder="Dán địa chỉ ví cử tri (phân tách bởi dấu phẩy, dấu cách hoặc xuống dòng)..."
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddVoters(election.id)}
                            disabled={isAddingVoters[election.id]}
                            className="btn btn-primary"
                            style={{ padding: '6px 14px', fontSize: '0.85rem', marginTop: '6px' }}
                          >
                            {isAddingVoters[election.id] ? 'Đang thêm cử tri...' : '+ Thêm cử tri vào Whitelist'}
                          </button>
                        </div>
                      )}
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
