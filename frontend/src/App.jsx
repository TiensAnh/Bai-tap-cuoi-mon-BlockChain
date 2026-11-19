import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_DECIMAL,
  LOCALHOST_CHAIN_ID,
  LOCALHOST_CHAIN_ID_DECIMAL
} from './config/contract';

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
  // Trạng thái đang gửi giao dịch chuyển giai đoạn (Admin)
  const [isChangingPhase, setIsChangingPhase] = useState({});
  // Trạng thái đang gửi giao dịch mở phiếu reveal
  const [isRevealing, setIsRevealing] = useState({});
  // Trạng thái hiển thị form nhập thủ công khi mở phiếu
  const [showManualReveal, setShowManualReveal] = useState({});
  // Giá trị nhập thủ công khi mở phiếu: { [electionId]: { option: '', salt: '' } }
  const [manualRevealInputs, setManualRevealInputs] = useState({});

  // Kiểm tra mạng hiện tại có hợp lệ không (Localhost 1337 / 31337 hoặc Sepolia)
  const isSupportedNetwork = chainId === LOCALHOST_CHAIN_ID_DECIMAL || 
                             chainId === Number(LOCALHOST_CHAIN_ID) || 
                             chainId === 31337 ||
                             chainId === SEPOLIA_CHAIN_ID_DECIMAL || 
                             chainId === Number(SEPOLIA_CHAIN_ID);

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
        let revealed = false;

        // Nếu có tài khoản kết nối thì kiểm tra whitelist, trạng thái commit và reveal
        if (currentAccount) {
          try {
            whitelisted = await contract.isWhitelisted(i, currentAccount);
            committed = await contract.hasVoterCommitted(i, currentAccount);
            revealed = await contract.hasVoterRevealed(i, currentAccount);
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

        // Đọc kết quả bầu cử nếu đã kết thúc (Finished - Task T009)
        let resultsArray = [];
        if (Number(data.phase) === 2) {
          try {
            const rawResults = await contract.getResults(i);
            resultsArray = rawResults.map((val) => Number(val));
          } catch (err) {
            console.error('Lỗi khi tải kết quả bầu cử:', err);
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
          hasRevealed: revealed,
          savedCommit: savedCommitData,
          results: resultsArray
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

      const isOkChain = currentChainId === SEPOLIA_CHAIN_ID_DECIMAL || 
                        currentChainId === LOCALHOST_CHAIN_ID_DECIMAL || 
                        currentChainId === 31337;
      if (isOkChain) {
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

  // Chuyển đổi lỗi Smart Contract / MetaMask thành tiếng Việt thân thiện (Task T011)
  const formatContractError = (error) => {
    const msg = error?.message || '';
    const data = error?.data || error?.error?.data || '';
    const reason = error?.reason || '';
    const fullText = (msg + ' ' + data + ' ' + reason).toLowerCase();

    // Lỗi lệch số thứ tự Nonce
    if (fullText.includes('nonce too high') || fullText.includes('nonce')) {
      return 'Lệch số Nonce: Mở MetaMask -> Cài đặt -> Nâng cao -> bấm "Xóa dữ liệu hoạt động" để đồng bộ lại với mạng local.';
    }
    // Lỗi không có quyền Admin
    if (fullText.includes('ownableunauthorizedaccount') || fullText.includes('caller is not the owner')) {
      return 'Thao tác bị từ chối: Ví này không có quyền Admin (Chỉ Quản trị viên mới được thao tác).';
    }
    // Lỗi chưa có trong Whitelist
    if (fullText.includes('not in whitelist')) {
      return 'Thao tác bị từ chối: Ví này chưa được thêm vào danh sách cử tri hợp lệ (Whitelist) của cuộc bầu cử.';
    }
    // Lỗi đã bỏ phiếu kín trước đó
    if (fullText.includes('already committed')) {
      return 'Bạn đã gửi phiếu kín rồi! Mỗi cử tri chỉ được bỏ phiếu một lần.';
    }
    // Lỗi đã mở phiếu trước đó
    if (fullText.includes('already revealed')) {
      return 'Bạn đã mở phiếu bầu này rồi!';
    }
    // Lỗi sai salt hoặc lựa chọn khi reveal
    if (fullText.includes('invalid commit hash') || fullText.includes('hash mismatch')) {
      return 'Mở phiếu thất bại: Lựa chọn hoặc mã bí mật (Salt) không khớp với phiếu kín ban đầu.';
    }
    // Lỗi người dùng bấm từ chối ký
    if (fullText.includes('action rejected') || fullText.includes('user rejected')) {
      return 'Bạn đã bấm từ chối giao dịch trên MetaMask.';
    }
    return reason || error?.shortMessage || error?.message || 'Giao dịch thất bại trên blockchain.';
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
      // Lấy số nonce chuẩn từ mạng
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.createElection(electionName.trim(), validOptions, { nonce });
      setSuccessMessage('Giao dịch tạo bầu cử đã gửi: ' + tx.hash);

      await tx.wait();
      setSuccessMessage('Tạo cuộc bầu cử thành công!');
      setElectionName('');
      setOptions(['', '']);

      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi tạo bầu cử:', error);
      setErrorMessage('Tạo bầu cử thất bại: ' + formatContractError(error));
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
      // Lấy số nonce chuẩn từ mạng
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.addVoters(electionId, validAddresses, { nonce });
      setSuccessMessage(`Đã gửi giao dịch thêm ${validAddresses.length} cử tri: ${tx.hash}`);

      await tx.wait();
      setSuccessMessage(`Đã thêm thành công ${validAddresses.length} cử tri vào Whitelist!`);
      setVoterInputs({ ...voterInputs, [electionId]: '' });

      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi thêm cử tri:', error);
      setErrorMessage('Thêm cử tri thất bại: ' + formatContractError(error));
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
      // Lấy số nonce chuẩn từ mạng
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.commitVote(election.id, commitHash, { nonce });
      setSuccessMessage(`Giao dịch bỏ phiếu kín đã gửi: ${tx.hash}`);

      // Chờ xác nhận giao dịch
      await tx.wait();
      setSuccessMessage('Bỏ phiếu kín thành công! Lựa chọn của bạn đã được bảo mật an toàn.');

      // Tải lại dữ liệu cuộc bầu cử
      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi bỏ phiếu kín:', error);
      setErrorMessage('Bỏ phiếu thất bại: ' + formatContractError(error));
    } finally {
      setIsCommiting({ ...isCommiting, [election.id]: false });
    }
  };

  // Bật/tắt hiển thị thông tin salt
  const toggleShowSalt = (electionId) => {
    setShowSaltInfo({ ...showSaltInfo, [electionId]: !showSaltInfo[electionId] });
  };

  // Chuyển cuộc bầu cử sang giai đoạn Reveal (Admin)
  const handleStartReveal = async (electionId) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsChangingPhase((prev) => ({ ...prev, [electionId]: true }));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // Lấy số nonce chuẩn từ mạng
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.startReveal(electionId, { nonce });
      setSuccessMessage(`Đã gửi giao dịch chuyển sang Reveal: ${tx.hash}`);

      await tx.wait();
      setSuccessMessage('Chuyển sang giai đoạn Reveal (Mở phiếu) thành công!');
      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi chuyển sang Reveal:', error);
      setErrorMessage('Chuyển giai đoạn thất bại: ' + formatContractError(error));
    } finally {
      setIsChangingPhase((prev) => ({ ...prev, [electionId]: false }));
    }
  };

  // Kết thúc cuộc bầu cử, chuyển sang Finished (Admin)
  const handleFinishElection = async (electionId) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsChangingPhase((prev) => ({ ...prev, [electionId]: true }));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // Lấy số nonce chuẩn từ mạng
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.finish(electionId, { nonce });
      setSuccessMessage(`Đã gửi giao dịch kết thúc cuộc bầu cử: ${tx.hash}`);

      await tx.wait();
      setSuccessMessage('Cuộc bầu cử đã kết thúc thành công!');
      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi kết thúc cuộc bầu cử:', error);
      setErrorMessage('Kết thúc bầu cử thất bại: ' + formatContractError(error));
    } finally {
      setIsChangingPhase((prev) => ({ ...prev, [electionId]: false }));
    }
  };

  // Cập nhật giá trị nhập mở phiếu thủ công
  const handleManualInputChange = (electionId, field, value) => {
    setManualRevealInputs((prev) => ({
      ...prev,
      [electionId]: {
        ...(prev[electionId] || {}),
        [field]: value
      }
    }));
  };

  // Bật/tắt form nhập thủ công mở phiếu
  const toggleShowManualReveal = (electionId) => {
    setShowManualReveal((prev) => ({
      ...prev,
      [electionId]: !prev[electionId]
    }));
  };

  // Gửi giao dịch mở phiếu Reveal (Task T008)
  const handleRevealVote = async (election, overrideOption = null, overrideSalt = null) => {
    setErrorMessage('');
    setSuccessMessage('');

    let optionToReveal = overrideOption;
    let saltToReveal = overrideSalt;

    // Nếu không truyền trực tiếp, thử đọc từ dữ liệu commit đã lưu trong localStorage
    if (optionToReveal === null || optionToReveal === undefined || !saltToReveal) {
      if (election.savedCommit) {
        optionToReveal = election.savedCommit.optionIndex;
        saltToReveal = election.savedCommit.salt;
      }
    }

    // Nếu vẫn chưa có, đọc từ dữ liệu nhập thủ công
    if ((optionToReveal === null || optionToReveal === undefined || !saltToReveal) && manualRevealInputs[election.id]) {
      const manual = manualRevealInputs[election.id];
      if (manual.option !== undefined && manual.option !== '' && manual.salt) {
        optionToReveal = Number(manual.option);
        saltToReveal = manual.salt.trim();
      }
    }

    if (optionToReveal === null || optionToReveal === undefined || !saltToReveal) {
      setErrorMessage('Không tìm thấy thông tin phương án hoặc mã Salt. Vui lòng nhập thông tin thủ công để mở phiếu.');
      setShowManualReveal((prev) => ({ ...prev, [election.id]: true }));
      return;
    }

    try {
      setIsRevealing((prev) => ({ ...prev, [election.id]: true }));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // Lấy số nonce chuẩn từ mạng
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.revealVote(election.id, optionToReveal, saltToReveal, { nonce });
      setSuccessMessage(`Đã gửi giao dịch mở phiếu (Reveal): ${tx.hash}`);

      await tx.wait();
      setSuccessMessage('Mở phiếu (Reveal) thành công! Lá phiếu của bạn đã được kiểm đếm chính thức.');

      await loadContractData(provider, account);
    } catch (error) {
      console.error('Lỗi khi mở phiếu:', error);
      setErrorMessage('Mở phiếu thất bại: ' + formatContractError(error));
    } finally {
      setIsRevealing((prev) => ({ ...prev, [election.id]: false }));
    }
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
        {account && !isSupportedNetwork && (
          <div className="alert alert-warning">
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>Sai mạng kết nối!</strong> Vui lòng chuyển sang mạng <strong>Localhost (1337 / 31337)</strong> hoặc <strong>Sepolia Testnet</strong>.
            </p>
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
            {isAdmin && isSupportedNetwork && (
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
                            <div style={{ padding: '12px 14px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #86efac' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.2rem' }}>✅</span>
                                <strong style={{ color: '#166534', fontSize: '1rem' }}>
                                  Bạn đã gửi lá phiếu kín thành công!
                                </strong>
                              </div>
                              <p style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '0.85rem' }}>
                                Lá phiếu của bạn đã được niêm phong an toàn trên blockchain.
                              </p>

                              {/* Hiển thị chi tiết lựa chọn đã bỏ */}
                              {election.savedCommit ? (
                                <div style={{ backgroundColor: '#f0fdf4', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bbf7d0', marginBottom: '10px', fontSize: '0.85rem' }}>
                                  <div>📌 <strong>Phương án bạn đã chọn:</strong> <span style={{ color: '#166534', fontWeight: 700 }}>#{election.savedCommit.optionIndex + 1}. {election.savedCommit.optionName}</span></div>
                                  <div style={{ marginTop: '4px', fontSize: '0.78rem', color: '#64748b' }}>
                                    🔑 Mã Salt bí mật: <code style={{ wordBreak: 'break-all' }}>{election.savedCommit.salt.substring(0, 18)}...</code>
                                  </div>
                                </div>
                              ) : null}

                              {/* Hướng dẫn bước tiếp theo */}
                              <div style={{ padding: '8px 12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.85rem' }}>
                                ⏳ <strong>Bước tiếp theo:</strong> Chờ Admin chuyển sang <strong>Giai đoạn Reveal (Mở phiếu)</strong> để kiểm đếm lá phiếu của bạn vào kết quả chung!
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* KHU VỰC MỞ PHIẾU REVEAL (Task T008) */}
                      {election.phase === 1 && (
                        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                          <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '10px', color: '#1e40af' }}>
                            🔍 Mở phiếu bầu (Giai đoạn Reveal)
                          </h3>

                          {!election.isWhitelisted ? (
                            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                              Bạn không có tên trong Whitelist của cuộc bầu cử này.
                            </p>
                          ) : !election.hasCommitted ? (
                            <p style={{ color: '#b45309', fontSize: '0.85rem', margin: 0 }}>
                              ⚠️ Bạn chưa từng gửi phiếu kín trong giai đoạn Commit nên không thể tham gia mở phiếu.
                            </p>
                          ) : election.hasRevealed ? (
                            <div style={{ padding: '10px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                              <p style={{ color: '#15803d', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>
                                ✓ Bạn đã mở phiếu (Reveal) thành công! Lá phiếu đã được kiểm đếm chính thức vào kết quả.
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p style={{ fontSize: '0.85rem', color: '#1e40af', marginTop: 0, marginBottom: '12px' }}>
                                Gửi lựa chọn và mã Salt bí mật lên hợp đồng để giải mã và kiểm đếm lá phiếu của bạn.
                              </p>

                              {/* Hiển thị thông tin tự động nhận diện từ localStorage */}
                              {election.savedCommit && !showManualReveal[election.id] ? (
                                <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '12px', fontSize: '0.85rem' }}>
                                  <div style={{ color: '#15803d', fontWeight: 600, marginBottom: '6px' }}>
                                    ✓ Trình duyệt đã tự động tìm thấy lá phiếu của bạn:
                                  </div>
                                  <div><strong>Phương án đã bầu:</strong> #{election.savedCommit.optionIndex + 1}. {election.savedCommit.optionName}</div>
                                  <div style={{ marginTop: '4px', wordBreak: 'break-all' }}><strong>Mã Salt bí mật:</strong> {election.savedCommit.salt}</div>
                                  
                                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleRevealVote(election)}
                                      disabled={isRevealing[election.id]}
                                      className="btn btn-primary"
                                      style={{ backgroundColor: '#2563eb', padding: '8px 18px' }}
                                    >
                                      {isRevealing[election.id] ? 'Đang mở phiếu...' : '🔓 Xác nhận mở phiếu (Reveal Vote)'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleShowManualReveal(election.id)}
                                      style={{ fontSize: '0.8rem', padding: '6px 12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', color: '#475569' }}
                                    >
                                      Nhập thủ công
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Form nhập thủ công (phòng khi đổi máy hoặc mất localStorage) */
                                <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '12px' }}>
                                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', margin: '0 0 10px 0' }}>
                                    Nhập thông tin lá phiếu thủ công:
                                  </p>
                                  <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                                      Phương án bạn đã chọn:
                                    </label>
                                    <select
                                      value={manualRevealInputs[election.id]?.option ?? ''}
                                      onChange={(e) => handleManualInputChange(election.id, 'option', e.target.value)}
                                      style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                    >
                                      <option value="">-- Chọn phương án bạn đã bầu --</option>
                                      {election.options.map((opt, idx) => (
                                        <option key={idx} value={idx}>#{idx + 1}. {opt}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                                      Mã Salt bí mật (32 bytes dạng 0x...):
                                    </label>
                                    <input
                                      type="text"
                                      value={manualRevealInputs[election.id]?.salt ?? ''}
                                      onChange={(e) => handleManualInputChange(election.id, 'salt', e.target.value)}
                                      placeholder="0x..."
                                      style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleRevealVote(election)}
                                      disabled={isRevealing[election.id]}
                                      className="btn btn-primary"
                                      style={{ backgroundColor: '#2563eb', padding: '6px 16px', fontSize: '0.85rem' }}
                                    >
                                      {isRevealing[election.id] ? 'Đang mở phiếu...' : '🔓 Mở phiếu với thông tin trên'}
                                    </button>
                                    {election.savedCommit && (
                                      <button
                                        type="button"
                                        onClick={() => toggleShowManualReveal(election.id)}
                                        style={{ fontSize: '0.8rem', padding: '6px 10px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', color: '#475569' }}
                                      >
                                        Quay lại dữ liệu đã lưu
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* KẾT QUẢ BẦU CỬ CHÍNH THỨC (Task T009) */}
                      {election.phase === 2 && (
                        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                            <h3 style={{ fontSize: '1rem', margin: 0, color: '#0f172a' }}>
                              🏆 Kết quả bầu cử chính thức
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Tổng số phiếu mở hợp lệ: <strong>{election.totalRevealed}</strong> / {election.totalCommitted}
                            </span>
                          </div>

                          {/* Tính toán người chiến thắng */}
                          {(() => {
                            const results = election.results || [];
                            const totalVotes = election.totalRevealed || 0;
                            const maxVotes = results.length > 0 ? Math.max(...results) : 0;
                            const winners = [];
                            if (maxVotes > 0) {
                              results.forEach((cnt, idx) => {
                                if (cnt === maxVotes) winners.push(election.options[idx]);
                              });
                            }

                            return (
                              <div>
                                {/* Hộp vinh danh người chiến thắng */}
                                {maxVotes > 0 ? (
                                  <div style={{ padding: '10px 14px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a', marginBottom: '14px', color: '#92400e', fontSize: '0.9rem' }}>
                                    <strong>👑 Người chiến thắng:</strong> {winners.join(', ')} ({maxVotes} phiếu)
                                  </div>
                                ) : (
                                  <div style={{ padding: '10px 14px', backgroundColor: '#f1f5f9', borderRadius: '6px', marginBottom: '14px', color: '#64748b', fontSize: '0.85rem' }}>
                                    Chưa có phiếu bầu hợp lệ nào được mở trước khi cuộc bầu cử kết thúc.
                                  </div>
                                )}

                                {/* Danh sách từng lựa chọn kèm thanh tỷ lệ % */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {election.options.map((opt, idx) => {
                                    const voteCount = results[idx] || 0;
                                    const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                                    const isWinner = maxVotes > 0 && voteCount === maxVotes;

                                    return (
                                      <div key={idx} style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '6px', border: isWinner ? '1px solid #f59e0b' : '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                                          <span style={{ fontWeight: isWinner ? 700 : 500, color: isWinner ? '#b45309' : '#1e293b' }}>
                                            #{idx + 1}. {opt} {isWinner && '👑'}
                                          </span>
                                          <span style={{ color: '#475569', fontSize: '0.85rem' }}>
                                            <strong>{voteCount}</strong> phiếu ({percent}%)
                                          </span>
                                        </div>
                                        {/* Thanh tiến trình Progress Bar */}
                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                          <div
                                            style={{
                                              width: `${percent}%`,
                                              height: '100%',
                                              backgroundColor: isWinner ? '#f59e0b' : '#3b82f6',
                                              transition: 'width 0.5s ease-in-out'
                                            }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
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

                      {/* Khu vực Quản lý Giai đoạn (Admin - Task T007) */}
                      {isAdmin && (
                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                            Quản lý tiến trình bầu cử (Admin):
                          </label>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {election.phase === 0 && (
                              <button
                                type="button"
                                onClick={() => handleStartReveal(election.id)}
                                disabled={isChangingPhase[election.id]}
                                className="btn btn-primary"
                                style={{ backgroundColor: '#2563eb', padding: '6px 14px', fontSize: '0.85rem' }}
                              >
                                {isChangingPhase[election.id] ? 'Đang chuyển sang Reveal...' : '▶ Bắt đầu giai đoạn Reveal (Mở phiếu)'}
                              </button>
                            )}
                            {election.phase === 1 && (
                              <button
                                type="button"
                                onClick={() => handleFinishElection(election.id)}
                                disabled={isChangingPhase[election.id]}
                                className="btn btn-primary"
                                style={{ backgroundColor: '#dc2626', padding: '6px 14px', fontSize: '0.85rem' }}
                              >
                                {isChangingPhase[election.id] ? 'Đang kết thúc bầu cử...' : '⏹ Kết thúc cuộc bầu cử (Finished)'}
                              </button>
                            )}
                            {election.phase === 2 && (
                              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                                ✓ Cuộc bầu cử đã hoàn tất và kết thúc.
                              </span>
                            )}
                          </div>
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
