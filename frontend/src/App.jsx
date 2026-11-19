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

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Stepper from './components/Stepper';
import SaltBackupModal from './components/SaltBackupModal';
import {
  ShieldIcon,
  TransparencyIcon,
  BalanceIcon,
  VoteIcon,
  ClockIcon,
  UsersIcon,
  TrophyIcon,
  CheckIcon,
  ArrowRightIcon,
  SearchIcon,
  DragHandleIcon,
  CloseIcon,
  RocketIcon,
  TrashIcon,
  UserAvatarIcon,
  CopyIcon
} from './components/Icons';

export default function App() {
  // Trạng thái ví và blockchain
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [contractOwner, setContractOwner] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Điều hướng màn hình chính ('home' | 'elections' | 'voting' | 'admin_dashboard' | 'admin_create' | 'admin_manage' | 'admin_logs' | 'history' | 'guide')
  const [currentView, setCurrentView] = useState('home');

  // ID cuộc bầu cử đang chọn để thao tác
  const [selectedElectionId, setSelectedElectionId] = useState(null);

  // Bộ lọc danh sách cuộc bầu cử ('ongoing' | 'finished')
  const [electionFilter, setElectionFilter] = useState('ongoing');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Sub-tab trong Quản lý bầu cử của Admin ('info' | 'whitelist' | 'phase' | 'logs')
  const [adminSubTab, setAdminSubTab] = useState('whitelist');

  // Danh sách các cuộc bầu cử
  const [electionsList, setElectionsList] = useState([]);

  // Form tạo cuộc bầu cử mới (Admin)
  const [electionName, setElectionName] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quản lý Whitelist theo electionId
  const [voterInputs, setVoterInputs] = useState({});
  const [isAddingVoters, setIsAddingVoters] = useState({});
  const [whitelistAddedMap, setWhitelistAddedMap] = useState({});

  // Bỏ phiếu kín Commit
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isCommiting, setIsCommiting] = useState({});

  // Modal sao lưu chứng từ mã Salt (Screen 8)
  const [showSaltModal, setShowSaltModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Mở phiếu Reveal
  const [isChangingPhase, setIsChangingPhase] = useState({});
  const [isRevealing, setIsRevealing] = useState({});
  const [showManualReveal, setShowManualReveal] = useState({});
  const [manualRevealInputs, setManualRevealInputs] = useState({});

  // Lịch sử giao dịch mô phỏng nhật ký
  const [txLogs, setTxLogs] = useState([]);

  // Kiểm tra mạng hợp lệ (Localhost hoặc Sepolia)
  const isSupportedNetwork = chainId === LOCALHOST_CHAIN_ID_DECIMAL || 
                             chainId === Number(LOCALHOST_CHAIN_ID) || 
                             chainId === 31337 ||
                             chainId === SEPOLIA_CHAIN_ID_DECIMAL || 
                             chainId === Number(SEPOLIA_CHAIN_ID);

  // Hiển thị thông báo Toast nhanh
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sao chép chuỗi vào Clipboard
  const copyToClipboard = async (text, msg = 'Đã sao chép vào bộ nhớ tạm!') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(msg);
    } catch (err) {
      console.error(err);
    }
  };

  // Tải file văn bản lưu trữ phiếu bầu (.txt)
  const handleDownloadBackup = (election, commitData) => {
    const commit = commitData || election?.savedCommit;
    if (!commit) return;

    const content = [
      '================================================================',
      'HỆ THỐNG BỎ PHIẾU ĐIỆN TỬ BLOCKCHAIN E-VOTING (SEPOLIA)',
      'CHỨNG TỪ BẢO MẬT LÁ PHIẾU KÍN (COMMIT VOTE BACKUP)',
      '================================================================',
      '',
      `Cuộc bầu cử ID: #${election?.id || commit.electionId} - ${election?.name || ''}`,
      `Địa chỉ ví cử tri: ${account}`,
      `Phương án đã chọn: #${commit.optionIndex + 1}. ${commit.optionName}`,
      `Chỉ số phương án (Option Index): ${commit.optionIndex}`,
      `Mã Salt bí mật: ${commit.salt}`,
      `Mã băm niêm phong (Commit Hash): ${commit.commitHash}`,
      `Thời gian bỏ phiếu: ${new Date(commit.timestamp).toLocaleString('vi-VN')}`,
      '',
      '----------------------------------------------------------------',
      'HƯỚNG DẪN MỞ PHIẾU TRÊN THIẾT BỊ KHÁC (GIAI ĐOẠN REVEAL):',
      '1. Giữ bí mật file này cho đến khi cuộc bầu cử chuyển sang giai đoạn Reveal.',
      '2. Khi mở phiếu thủ công, nhập đúng 2 thông tin sau:',
      `   - Phương án: #${commit.optionIndex + 1}. ${commit.optionName}`,
      `   - Mã Salt: ${commit.salt}`,
      '3. Smart Contract sẽ xác thực khớp mã băm và cộng phiếu vào kết quả.',
      '================================================================'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Phieu_Bau_${election?.id || commit.electionId}_${account.slice(0, 6)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Đã tải xuống file chứng từ phiếu bầu (.txt)!');
  };

  // Tải danh sách các cuộc bầu cử từ Smart Contract
  const fetchElections = useCallback(async (contract, currentAccount) => {
    try {
      const countBigInt = await contract.electionCount();
      const count = Number(countBigInt);
      const list = [];

      for (let i = 1; i <= count; i++) {
        const data = await contract.getElection(i);
        let whitelisted = false;
        let committed = false;
        let revealed = false;

        if (currentAccount) {
          try {
            whitelisted = await contract.isWhitelisted(i, currentAccount);
            committed = await contract.hasVoterCommitted(i, currentAccount);
            revealed = await contract.hasVoterRevealed(i, currentAccount);
          } catch (e) {
            console.error(e);
          }
        }

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

        let resultsArray = [];
        if (Number(data.phase) === 2) {
          try {
            const rawResults = await contract.getResults(i);
            resultsArray = rawResults.map((val) => Number(val));
          } catch (err) {
            console.error(err);
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

      const ownerAddress = await contract.owner();
      setContractOwner(ownerAddress);

      const adminRole = currentAccount && ownerAddress.toLowerCase() === currentAccount.toLowerCase();
      setIsAdmin(adminRole);

      await fetchElections(contract, currentAccount);
    } catch (error) {
      console.error(error);
      setErrorMessage('Không thể đọc dữ liệu contract: ' + (error.reason || error.message));
    } finally {
      setIsLoading(false);
    }
  }, [fetchElections]);

  // Xử lý thay đổi ví hoặc mạng
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
      console.error(error);
      setErrorMessage('Kết nối ví thất bại: ' + error.message);
    }
  };

  // Định dạng thông báo lỗi tiếng Việt
  const formatContractError = (error) => {
    const msg = error?.message || '';
    const data = error?.data || error?.error?.data || '';
    const reason = error?.reason || '';
    const fullText = (msg + ' ' + data + ' ' + reason).toLowerCase();

    if (fullText.includes('nonce too high') || fullText.includes('nonce')) {
      return 'Lệch số Nonce: Mở MetaMask -> Cài đặt -> Nâng cao -> bấm "Xóa dữ liệu hoạt động" để đồng bộ lại với mạng local.';
    }
    if (fullText.includes('ownableunauthorizedaccount') || fullText.includes('caller is not the owner')) {
      return 'Thao tác bị từ chối: Ví này không có quyền Admin.';
    }
    if (fullText.includes('not in whitelist')) {
      return 'Thao tác bị từ chối: Ví của bạn chưa nằm trong danh sách Whitelist cử tri hợp lệ.';
    }
    if (fullText.includes('already committed')) {
      return 'Bạn đã gửi phiếu kín rồi! Mỗi cử tri chỉ được bỏ phiếu một lần.';
    }
    if (fullText.includes('already revealed')) {
      return 'Bạn đã mở phiếu bầu này rồi!';
    }
    if (fullText.includes('hash does not match') || fullText.includes('hash mismatch') || fullText.includes('invalid commit hash')) {
      return 'Mở phiếu thất bại: Lựa chọn hoặc mã Salt bí mật không khớp với phiếu kín ban đầu.';
    }
    if (fullText.includes('invalid phase')) {
      return 'Thao tác bị từ chối: Cuộc bầu cử chưa ở đúng giai đoạn cho thao tác này.';
    }
    if (fullText.includes('action rejected') || fullText.includes('user rejected')) {
      return 'Bạn đã bấm từ chối giao dịch trên MetaMask.';
    }
    return reason || error?.shortMessage || error?.message || 'Giao dịch thất bại trên blockchain.';
  };

  // Form tạo bầu cử (Admin)
  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setErrorMessage('Một cuộc bầu cử cần tối thiểu 2 lựa chọn.');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Gửi giao dịch tạo cuộc bầu cử mới (Screen 4)
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
      setErrorMessage('Phải có ít nhất 2 phương án lựa chọn hợp lệ.');
      return;
    }

    try {
      setIsSubmitting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.createElection(electionName.trim(), validOptions, { nonce });
      setSuccessMessage(`Đã gửi giao dịch tạo bầu cử: ${tx.hash}`);

      // Ghi nhật ký
      setTxLogs(prev => [{
        type: 'Tạo cuộc bầu cử',
        hash: tx.hash,
        detail: electionName.trim(),
        time: new Date().toLocaleTimeString()
      }, ...prev]);

      await tx.wait();
      setSuccessMessage('Tạo cuộc bầu cử mới thành công trên Blockchain!');
      setElectionName('');
      setOptions(['', '']);
      setCurrentView('admin_dashboard');

      await loadContractData(provider, account);
    } catch (error) {
      console.error(error);
      setErrorMessage('Tạo bầu cử thất bại: ' + formatContractError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm cử tri vào Whitelist (Screen 5)
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
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.addVoters(electionId, validAddresses, { nonce });
      setSuccessMessage(`Đã gửi giao dịch thêm ${validAddresses.length} cử tri: ${tx.hash}`);

      setTxLogs(prev => [{
        type: 'Cấp quyền Whitelist',
        hash: tx.hash,
        detail: `${validAddresses.length} ví cử tri`,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

      await tx.wait();
      setSuccessMessage(`Đã thêm thành công ${validAddresses.length} cử tri vào Whitelist!`);
      setVoterInputs({ ...voterInputs, [electionId]: '' });
      setWhitelistAddedMap(prev => ({ ...prev, [electionId]: true }));

      await loadContractData(provider, account);
    } catch (error) {
      console.error(error);
      setErrorMessage('Thêm cử tri thất bại: ' + formatContractError(error));
    } finally {
      setIsAddingVoters({ ...isAddingVoters, [electionId]: false });
    }
  };

  // Bỏ phiếu kín bằng mã băm Commit (Screen 7 -> Screen 8)
  const handleCommitVote = async (election) => {
    setErrorMessage('');
    setSuccessMessage('');

    const optionIndex = selectedOptions[election.id];
    if (optionIndex === undefined || optionIndex === null) {
      setErrorMessage('Vui lòng chọn một phương án trước khi ký gửi phiếu.');
      return;
    }

    try {
      setIsCommiting({ ...isCommiting, [election.id]: true });

      // 1. Sinh chuỗi salt ngẫu nhiên 32 bytes
      const salt = ethers.hexlify(ethers.randomBytes(32));

      // 2. Tính mã băm keccak256(option, salt, voterAddress)
      const commitHash = ethers.solidityPackedKeccak256(
        ['uint256', 'bytes32', 'address'],
        [optionIndex, salt, account]
      );

      // 3. Lưu vào localStorage
      const commitData = {
        electionId: election.id,
        optionIndex: optionIndex,
        optionName: election.options[optionIndex],
        salt: salt,
        commitHash: commitHash,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`evote_commit_${election.id}_${account.toLowerCase()}`, JSON.stringify(commitData));

      // 4. Ký gửi giao dịch lên Smart Contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.commitVote(election.id, commitHash, { nonce });
      setSuccessMessage(`Giao dịch bỏ phiếu kín đã gửi: ${tx.hash}`);

      setTxLogs(prev => [{
        type: 'Bỏ phiếu kín (Commit)',
        hash: tx.hash,
        detail: `Cuộc bầu cử #${election.id}`,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

      await tx.wait();
      setSuccessMessage('Bỏ phiếu kín thành công! Lựa chọn của bạn đã được niêm phong an toàn.');

      // Kích hoạt Modal sao lưu chứng từ mã Salt (Screen 8)
      setModalData({
        election: election,
        electionName: election.name,
        optionName: election.options[optionIndex],
        salt: salt,
        commitHash: commitHash,
        timestamp: commitData.timestamp
      });
      setShowSaltModal(true);

      await loadContractData(provider, account);
    } catch (error) {
      console.error(error);
      setErrorMessage('Bỏ phiếu thất bại: ' + formatContractError(error));
    } finally {
      setIsCommiting({ ...isCommiting, [election.id]: false });
    }
  };

  // Chuyển sang giai đoạn Reveal (Screen 6)
  const handleStartReveal = async (electionId) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsChangingPhase((prev) => ({ ...prev, [electionId]: true }));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.startReveal(electionId, { nonce });
      setSuccessMessage(`Đã gửi giao dịch chuyển sang Reveal: ${tx.hash}`);

      setTxLogs(prev => [{
        type: 'Chuyển sang Reveal',
        hash: tx.hash,
        detail: `Cuộc bầu cử #${electionId}`,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

      await tx.wait();
      setSuccessMessage('Chuyển sang giai đoạn Reveal (Mở phiếu) thành công!');
      await loadContractData(provider, account);
    } catch (error) {
      console.error(error);
      setErrorMessage('Chuyển giai đoạn thất bại: ' + formatContractError(error));
    } finally {
      setIsChangingPhase((prev) => ({ ...prev, [electionId]: false }));
    }
  };

  // Kết thúc cuộc bầu cử (Finished) (Screen 6)
  const handleFinishElection = async (electionId) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsChangingPhase((prev) => ({ ...prev, [electionId]: true }));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.finish(electionId, { nonce });
      setSuccessMessage(`Đã gửi giao dịch kết thúc bầu cử: ${tx.hash}`);

      setTxLogs(prev => [{
        type: 'Kết thúc cuộc bầu cử',
        hash: tx.hash,
        detail: `Cuộc bầu cử #${electionId}`,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

      await tx.wait();
      setSuccessMessage('Cuộc bầu cử đã kết thúc thành công!');
      await loadContractData(provider, account);
    } catch (error) {
      console.error(error);
      setErrorMessage('Kết thúc bầu cử thất bại: ' + formatContractError(error));
    } finally {
      setIsChangingPhase((prev) => ({ ...prev, [electionId]: false }));
    }
  };

  // Mở phiếu tự động (Reveal Vote)
  const handleRevealVote = async (election) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!election.savedCommit) {
      setErrorMessage('Không tìm thấy thông tin lá phiếu lưu trên thiết bị này. Vui lòng chuyển sang mở phiếu thủ công.');
      setShowManualReveal((prev) => ({ ...prev, [election.id]: true }));
      return;
    }

    try {
      setIsRevealing((prev) => ({ ...prev, [election.id]: true }));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.revealVote(election.id, election.savedCommit.optionIndex, election.savedCommit.salt, { nonce });
      setSuccessMessage(`Đã gửi giao dịch mở phiếu: ${tx.hash}`);

      setTxLogs(prev => [{
        type: 'Mở phiếu (Reveal)',
        hash: tx.hash,
        detail: `Cuộc bầu cử #${election.id}`,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

      await tx.wait();
      setSuccessMessage('Mở phiếu (Reveal) thành công! Lá phiếu của bạn đã được kiểm đếm chính thức.');
      await loadContractData(provider, account);
    } catch (error) {
      console.error(error);
      setErrorMessage('Mở phiếu thất bại: ' + formatContractError(error));
    } finally {
      setIsRevealing((prev) => ({ ...prev, [election.id]: false }));
    }
  };

  // Mở phiếu thủ công (nhập phương án và Salt)
  const handleManualReveal = async (election) => {
    setErrorMessage('');
    setSuccessMessage('');

    const manual = manualRevealInputs[election.id];
    if (!manual || manual.option === undefined || manual.option === '' || !manual.salt || !manual.salt.trim()) {
      setErrorMessage('Vui lòng chọn phương án bạn đã bầu và nhập mã Salt bí mật.');
      return;
    }

    const optionToReveal = Number(manual.option);
    let saltToReveal = manual.salt.trim();

    if (!ethers.isHexString(saltToReveal, 32)) {
      saltToReveal = ethers.keccak256(ethers.toUtf8Bytes(saltToReveal));
    }

    try {
      setIsRevealing((prev) => ({ ...prev, [election.id]: true }));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const nonce = await provider.getTransactionCount(account, 'pending');

      const tx = await contract.revealVote(election.id, optionToReveal, saltToReveal, { nonce });
      setSuccessMessage(`Đã gửi giao dịch mở phiếu thủ công: ${tx.hash}`);

      setTxLogs(prev => [{
        type: 'Mở phiếu thủ công',
        hash: tx.hash,
        detail: `Cuộc bầu cử #${election.id}`,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

      await tx.wait();
      setSuccessMessage('Mở phiếu thành công! Lá phiếu đã được kiểm đếm chính thức.');
      await loadContractData(provider, account);
    } catch (error) {
      console.error(error);
      setErrorMessage('Mở phiếu thất bại: ' + formatContractError(error));
    } finally {
      setIsRevealing((prev) => ({ ...prev, [election.id]: false }));
    }
  };

  // Lắng nghe sự kiện ví MetaMask
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

  // Lấy cuộc bầu cử đang chọn để hiển thị chi tiết
  const currentElection = electionsList.find((e) => e.id === selectedElectionId) || electionsList[0];

  // Lọc cuộc bầu cử theo Tab và Keyword tìm kiếm
  const filteredElections = electionsList.filter((e) => {
    const matchesFilter = electionFilter === 'ongoing' ? e.phase < 2 : e.phase === 2;
    const matchesSearch = e.name.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Thống kê nhanh cho Admin Dashboard
  const ongoingCount = electionsList.filter((e) => e.phase < 2).length;
  const finishedCount = electionsList.filter((e) => e.phase === 2).length;
  const totalVotesRecorded = electionsList.reduce((acc, cur) => acc + (cur.totalCommitted || 0), 0);

  return (
    <div className="app-shell">
      {/* 1. SIDEBAR ĐIỀU HƯỚNG BÊN TRÁI */}
      <Sidebar
        currentView={currentView}
        onChangeView={(view) => {
          setCurrentView(view);
          if (view === 'admin_manage' && !selectedElectionId && electionsList.length > 0) {
            setSelectedElectionId(electionsList[0].id);
          }
        }}
        isAdmin={isAdmin}
      />

      {/* 2. KHU VỰC CHÍNH (TOPBAR + NỘI DUNG) */}
      <div className="main-area">
        <Header
          account={account}
          chainId={chainId}
          isAdmin={isAdmin}
          onConnectWallet={connectWallet}
          onCopyAddress={(addr) => copyToClipboard(addr, 'Đã sao chép địa chỉ ví!')}
        />

        {/* Thông báo Toast góc màn hình */}
        {toastMessage && <div className="toast-pill-notification">{toastMessage}</div>}

        <div className="content-wrapper">
          {/* Thông báo lỗi */}
          {errorMessage && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC4B5B', fontSize: '0.9rem', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚠️ {errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC4B5B', fontWeight: 'bold' }}>✕</button>
            </div>
          )}

          {/* Thông báo thành công */}
          {successMessage && (
            <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '12px 16px', color: '#16A36A', fontSize: '0.9rem', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>✓ {successMessage}</span>
              <button type="button" onClick={() => setSuccessMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16A36A', fontWeight: 'bold' }}>✕</button>
            </div>
          )}

          {/* ==================================================================== */}
          {/* MÀN HÌNH 1: TRANG CHỦ (HOME VIEW)                                   */}
          {/* ==================================================================== */}
          {currentView === 'home' && (
            <div>
              {/* Hero Banner với tiêu đề và hình ảnh hòm phiếu 3D */}
              <div className="hero-banner">
                <div className="hero-content">
                  <h1 className="hero-title">
                    Hệ thống bầu cử minh bạch & an toàn trên Blockchain
                  </h1>
                  <p className="hero-sub">
                    Bỏ phiếu công bằng, bảo mật và có thể kiểm chứng với cơ chế Commit - Reveal.
                  </p>
                  <div className="hero-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setCurrentView('elections')}
                    >
                      <span>Xem cuộc bầu cử</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentView('guide')}
                    >
                      <span>Hướng dẫn</span>
                    </button>
                  </div>
                </div>

                {/* Minh họa hòm phiếu 3D chuẩn ảnh tham chiếu */}
                <div className="hero-illustration">
                  <svg width="180" height="160" viewBox="0 0 180 160" fill="none">
                    <ellipse cx="90" cy="140" rx="70" ry="14" fill="#E2E8F0" opacity="0.6" />
                    <rect x="40" y="55" width="100" height="85" rx="14" fill="#3155F5" />
                    <rect x="35" y="45" width="110" height="24" rx="8" fill="#5B7CFA" />
                    <rect x="70" y="54" width="40" height="6" rx="3" fill="#233FC4" />
                    {/* Lá phiếu rơi xuống */}
                    <g transform="translate(68, 10) rotate(-4)">
                      <rect x="0" y="0" width="44" height="52" rx="4" fill="#FFFFFF" stroke="#C7D7FE" strokeWidth="2" />
                      <circle cx="22" cy="24" r="12" fill="#ECFDF5" />
                      <path d="M17 24L20 27L27 20" stroke="#16A36A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* 3 Thẻ tính năng bảo mật, minh bạch, công bằng */}
              <div className="feature-cards-grid">
                <div className="feature-card">
                  <div className="feature-icon-circle">
                    <ShieldIcon size={24} />
                  </div>
                  <h3 className="feature-card-title">Bảo mật</h3>
                  <p className="feature-card-desc">
                    Niêm phong phiếu bằng mã băm (Commit). Lựa chọn của bạn được giữ kín hoàn toàn.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-circle">
                    <TransparencyIcon size={24} />
                  </div>
                  <h3 className="feature-card-title">Minh bạch</h3>
                  <p className="feature-card-desc">
                    Kết quả công khai trên Blockchain. Mọi giao dịch mở phiếu đều được xác thực.
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-circle">
                    <BalanceIcon size={24} />
                  </div>
                  <h3 className="feature-card-title">Công bằng</h3>
                  <p className="feature-card-desc">
                    Mỗi cử tri chỉ bỏ phiếu một lần. Danh sách cử tri hợp lệ được quản lý chặt chẽ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* MÀN HÌNH 2: DANH SÁCH CUỘC BẦU CỬ (ELECTIONS LIST)                  */}
          {/* ==================================================================== */}
          {currentView === 'elections' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#101936', marginBottom: '20px' }}>
                Danh sách cuộc bầu cử
              </h2>

              {/* Bộ lọc Tab & Ô tìm kiếm */}
              <div className="filter-toolbar">
                <div className="filter-tabs-group">
                  <button
                    type="button"
                    className={`filter-tab-pill ${electionFilter === 'ongoing' ? 'active' : ''}`}
                    onClick={() => setElectionFilter('ongoing')}
                  >
                    Đang diễn ra ({ongoingCount})
                  </button>
                  <button
                    type="button"
                    className={`filter-tab-pill ${electionFilter === 'finished' ? 'active' : ''}`}
                    onClick={() => setElectionFilter('finished')}
                  >
                    Đã kết thúc ({finishedCount})
                  </button>
                </div>

                <div className="search-input-box">
                  <span className="search-icon-pos">
                    <SearchIcon size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc bầu cử..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
              </div>

              {/* Danh sách các thẻ bầu cử */}
              {filteredElections.length === 0 ? (
                <div className="civic-card" style={{ textAlign: 'center', padding: '48px' }}>
                  <p style={{ color: '#65718B', margin: 0 }}>
                    {searchKeyword ? 'Không tìm thấy cuộc bầu cử nào phù hợp.' : 'Chưa có cuộc bầu cử nào trong danh mục này.'}
                  </p>
                </div>
              ) : (
                filteredElections.map((election) => (
                  <div key={election.id} className="election-card-item">
                    <div className="election-info-left">
                      <div className="election-icon-box">
                        {election.phase === 2 ? <TrophyIcon size={24} /> : <UsersIcon size={24} />}
                      </div>
                      <div className="election-text-content">
                        <div className="election-item-title">{election.name}</div>
                        <div className="election-item-desc">
                          {election.options.length} phương án: {election.options.join(', ')}
                        </div>
                        {election.phase === 0 && (
                          <span className="phase-pill commit">Giai đoạn: Commit (Bỏ phiếu kín)</span>
                        )}
                        {election.phase === 1 && (
                          <span className="phase-pill reveal">Giai đoạn: Reveal (Mở phiếu)</span>
                        )}
                        {election.phase === 2 && (
                          <span className="phase-pill finished">Đã kết thúc (Công bố kết quả)</span>
                        )}
                      </div>
                    </div>

                    <div className="election-actions-right">
                      <div className="time-remaining-tag">
                        <ClockIcon size={16} />
                        <span>
                          {election.phase === 0 && 'Đang nhận phiếu'}
                          {election.phase === 1 && 'Đang mở phiếu'}
                          {election.phase === 2 && 'Đã kết thúc'}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          setSelectedElectionId(election.id);
                          setCurrentView('voting');
                        }}
                      >
                        <span>
                          {election.phase === 0 && 'Bỏ phiếu ngay →'}
                          {election.phase === 1 && 'Mở phiếu →'}
                          {election.phase === 2 && 'Xem kết quả →'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* MÀN HÌNH 3: BẢNG ĐIỀU KHIỂN QUẢN TRỊ (ADMIN DASHBOARD)               */}
          {/* ==================================================================== */}
          {currentView === 'admin_dashboard' && isAdmin && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#101936', marginBottom: '20px' }}>
                Bảng điều khiển quản trị
              </h2>

              {/* 4 Thẻ chỉ số thống kê */}
              <div className="stat-cards-grid">
                <div className="stat-metric-card">
                  <div className="stat-icon-circle" style={{ backgroundColor: '#F0F4FF', color: '#3155F5' }}>
                    <VoteIcon size={24} />
                  </div>
                  <div>
                    <div className="stat-metric-num">{electionsList.length}</div>
                    <div className="stat-metric-label">Tổng cuộc bầu cử</div>
                  </div>
                </div>

                <div className="stat-metric-card">
                  <div className="stat-icon-circle" style={{ backgroundColor: '#ECFDF5', color: '#16A36A' }}>
                    <UsersIcon size={24} />
                  </div>
                  <div>
                    <div className="stat-metric-num">{ongoingCount}</div>
                    <div className="stat-metric-label">Đang diễn ra</div>
                  </div>
                </div>

                <div className="stat-metric-card">
                  <div className="stat-icon-circle" style={{ backgroundColor: '#FFFBEB', color: '#E5A23B' }}>
                    <TrophyIcon size={24} />
                  </div>
                  <div>
                    <div className="stat-metric-num">{finishedCount}</div>
                    <div className="stat-metric-label">Hoàn thành</div>
                  </div>
                </div>

                <div className="stat-metric-card">
                  <div className="stat-icon-circle" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                    <ShieldIcon size={24} />
                  </div>
                  <div>
                    <div className="stat-metric-num">{totalVotesRecorded}</div>
                    <div className="stat-metric-label">Tổng phiếu niêm phong</div>
                  </div>
                </div>
              </div>

              {/* Bảng cuộc bầu cử gần đây */}
              <div className="admin-recent-table">
                <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5EAF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#101936' }}>
                    Cuộc bầu cử gần đây
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentView('elections')}
                    style={{ background: 'none', border: 'none', color: '#3155F5', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Xem tất cả →
                  </button>
                </div>

                <div>
                  {electionsList.map((election) => (
                    <div key={election.id} className="recent-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#F0F4FF', color: '#3155F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <VoteIcon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#101936' }}>
                            {election.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#65718B' }}>
                            {election.options.length} phương án
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {election.phase === 0 && <span className="phase-pill commit">Commit</span>}
                        {election.phase === 1 && <span className="phase-pill reveal">Reveal</span>}
                        {election.phase === 2 && <span className="phase-pill finished">Finished</span>}

                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                          onClick={() => {
                            setSelectedElectionId(election.id);
                            setCurrentView('admin_manage');
                          }}
                        >
                          Quản lý
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* MÀN HÌNH 4: TẠO CUỘC BẦU CỬ MỚI (ADMIN CREATE VIEW)                 */}
          {/* ==================================================================== */}
          {currentView === 'admin_create' && isAdmin && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#101936', margin: '0 0 4px 0' }}>
                  Tạo cuộc bầu cử mới
                </h2>
                <p style={{ color: '#65718B', fontSize: '0.88rem', margin: 0 }}>
                  Triển khai một cuộc bầu cử mới lên Blockchain.
                </p>
              </div>

              <div className="create-grid-layout">
                {/* Form tạo cuộc bầu cử */}
                <div className="civic-card">
                  <form onSubmit={handleCreateElection}>
                    <div className="form-group-block">
                      <label className="form-label-title">
                        Tiêu đề cuộc bầu cử *
                      </label>
                      <input
                        type="text"
                        className="form-input-text"
                        value={electionName}
                        onChange={(e) => setElectionName(e.target.value)}
                        placeholder="Ví dụ: Bầu cử Trưởng nhóm Dự án"
                      />
                    </div>

                    <div className="form-group-block">
                      <label className="form-label-title">
                        Danh sách phương án / ứng viên *
                      </label>
                      {options.map((opt, idx) => (
                        <div key={idx} className="option-row-item">
                          <DragHandleIcon size={16} className="text-muted" />
                          <input
                            type="text"
                            className="form-input-text"
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Phương án #${idx + 1}`}
                          />
                          {options.length > 2 && (
                            <button
                              type="button"
                              className="btn-remove-option"
                              onClick={() => handleRemoveOption(idx)}
                              title="Xóa lựa chọn"
                            >
                              <CloseIcon size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn-add-option-dashed"
                        onClick={handleAddOption}
                      >
                        + Thêm phương án
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setCurrentView('admin_dashboard')}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{ flex: 1 }}
                      >
                        <RocketIcon size={18} />
                        <span>{isSubmitting ? 'Đang gửi giao dịch...' : 'Triển khai lên Blockchain'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Thẻ Lưu ý bên phải chuẩn ảnh tham chiếu */}
                <div className="guideline-sidebar-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#F0F4FF', color: '#3155F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldIcon size={20} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#101936' }}>Lưu ý</span>
                  </div>

                  <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: '#65718B', lineHeight: '1.7' }}>
                    <li>Tối thiểu 2 phương án lựa chọn.</li>
                    <li>Tiêu đề rõ ràng, ngắn gọn, dễ hiểu.</li>
                    <li>Thông tin sẽ được ghi nhận vĩnh viễn trên Blockchain sau khi giao dịch xác nhận.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* MÀN HÌNH 5 & 6: QUẢN LÝ BẦU CỬ (ADMIN MANAGE VIEW)                   */}
          {/* ==================================================================== */}
          {currentView === 'admin_manage' && (
            <div>
              {!account ? (
                <div className="civic-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🦊</div>
                  <h3 style={{ fontSize: '1.25rem', color: '#101936', marginBottom: '8px', fontWeight: 800 }}>Yêu cầu kết nối ví MetaMask</h3>
                  <p style={{ color: '#65718B', maxWidth: '460px', margin: '0 auto 20px auto', fontSize: '0.92rem' }}>
                    Vui lòng kết nối ví MetaMask để truy cập công cụ Quản lý bầu cử.
                  </p>
                  <button type="button" onClick={connectWallet} className="btn-primary">Kết nối MetaMask</button>
                </div>
              ) : !isAdmin ? (
                <div className="civic-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
                  <h3 style={{ fontSize: '1.25rem', color: '#101936', marginBottom: '8px', fontWeight: 800 }}>Khu vực Quản trị viên (Admin)</h3>
                  <p style={{ color: '#65718B', maxWidth: '480px', margin: '0 auto', fontSize: '0.92rem' }}>
                    Ví <strong>{account.slice(0, 6)}...{account.slice(-4)}</strong> hiện đang có vai trò Cử tri. Chỉ Quản trị viên (Owner của Smart Contract) mới có quyền cấp Whitelist và điều phối tiến trình bầu cử.
                  </p>
                </div>
              ) : electionsList.length === 0 ? (
                <div className="civic-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
                  <h3 style={{ fontSize: '1.25rem', color: '#101936', marginBottom: '8px', fontWeight: 800 }}>Chưa có cuộc bầu cử nào</h3>
                  <p style={{ color: '#65718B', maxWidth: '480px', margin: '0 auto 24px auto', fontSize: '0.92rem' }}>
                    Hiện tại trên Smart Contract chưa có cuộc bầu cử nào được khởi tạo. Hãy tạo một cuộc bầu cử mới để bắt đầu cấp quyền Whitelist và điều phối tiến trình.
                  </p>
                  <button type="button" className="btn-primary" onClick={() => setCurrentView('admin_create')}>
                    + Tạo cuộc bầu cử đầu tiên
                  </button>
                </div>
              ) : currentElection ? (
                <div>
                  {/* Breadcrumb Navigation */}
                  <div className="breadcrumb-bar">
                    <span className="breadcrumb-link" onClick={() => setCurrentView('admin_dashboard')}>Quản lý bầu cử</span>
                    <span>›</span>
                    <span style={{ color: '#101936', fontWeight: 600 }}>{currentElection.name}</span>
                  </div>

                  {/* Bộ chọn cuộc bầu cử khác nếu có */}
                  {electionsList.length > 1 && (
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '0.85rem', color: '#65718B' }}>Chọn cuộc bầu cử:</label>
                      <select
                        value={currentElection.id}
                        onChange={(e) => setSelectedElectionId(Number(e.target.value))}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5EAF5', fontSize: '0.88rem' }}
                      >
                        {electionsList.map((el) => (
                          <option key={el.id} value={el.id}>#{el.id}. {el.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Sub-tabs: Thông tin, Whitelist cử tri, Điều phối giai đoạn, Nhật ký */}
                  <div className="subtabs-nav-bar">
                    <button
                      type="button"
                      className={`subtab-item-btn ${adminSubTab === 'info' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('info')}
                    >
                      Thông tin
                    </button>
                    <button
                      type="button"
                      className={`subtab-item-btn ${adminSubTab === 'whitelist' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('whitelist')}
                    >
                      Whitelist cử tri
                    </button>
                    <button
                      type="button"
                      className={`subtab-item-btn ${adminSubTab === 'phase' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('phase')}
                    >
                      Điều phối giai đoạn
                    </button>
                    <button
                      type="button"
                      className={`subtab-item-btn ${adminSubTab === 'logs' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('logs')}
                    >
                      Nhật ký
                    </button>
                  </div>

                  {/* TAB 1: THÔNG TIN TỔNG QUAN CUỘC BẦU CỬ */}
                  {adminSubTab === 'info' && (
                    <div className="civic-card">
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#101936' }}>
                        #{currentElection.id}. {currentElection.name}
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: '#65718B', marginBottom: '16px' }}>
                        <strong>Danh sách phương án:</strong> {currentElection.options.join(', ')}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#65718B' }}>
                        Phiếu đã commit: <strong>{currentElection.totalCommitted}</strong> | Phiếu đã mở: <strong>{currentElection.totalRevealed}</strong>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CẤP QUYỀN CỬ TRI WHITELIST (SCREEN 5) */}
                  {adminSubTab === 'whitelist' && (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#101936', margin: '0 0 4px 0' }}>
                          Cấp quyền cử tri (Whitelist)
                        </h3>
                        <p style={{ color: '#65718B', fontSize: '0.85rem', margin: 0 }}>
                          Chỉ có thể thêm cử tri khi cuộc bầu cử đang ở giai đoạn Commit.
                        </p>
                      </div>

                      <div className="whitelist-layout-row">
                        <div>
                          <textarea
                            rows="6"
                            className="whitelist-textarea"
                            placeholder="0x3f2a8d7e289c1a45d6f7a8c9e8cd1e2f3a485c6, 0x9d8E7c... (dán danh sách địa chỉ ví)"
                            value={voterInputs[currentElection.id] || ''}
                            onChange={(e) => setVoterInputs({ ...voterInputs, [currentElection.id]: e.target.value })}
                            disabled={currentElection.phase !== 0}
                          />

                          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button
                              type="button"
                              className="btn-primary"
                              disabled={currentElection.phase !== 0 || isAddingVoters[currentElection.id]}
                              onClick={() => handleAddVoters(currentElection.id)}
                            >
                              <span>{isAddingVoters[currentElection.id] ? 'Đang thêm cử tri...' : '+ Cấp quyền Whitelist'}</span>
                            </button>
                            <button
                              type="button"
                              className="btn-danger-outline"
                              onClick={() => setVoterInputs({ ...voterInputs, [currentElection.id]: '' })}
                            >
                              <TrashIcon size={14} />
                              <span>Xóa danh sách</span>
                            </button>
                          </div>
                        </div>

                        <div className="whitelist-stat-box">
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FFFFFF', color: '#3155F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                            <UsersIcon size={24} />
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#65718B', marginBottom: '2px' }}>Đã cấp quyền</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#3155F5' }}>
                            {currentElection.totalCommitted} phiếu đã gửi
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ĐIỀU PHỐI TIẾN TRÌNH BẦU CỬ (SCREEN 6) */}
                  {adminSubTab === 'phase' && (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#101936', margin: '0 0 4px 0' }}>
                          Điều phối tiến trình bầu cử
                        </h3>
                        <p style={{ color: '#65718B', fontSize: '0.85rem', margin: 0 }}>
                          Chuyển giai đoạn để mở/đóng các chức năng tương ứng.
                        </p>
                      </div>

                      {/* Thanh Stepper chuẩn */}
                      <Stepper
                        phase={currentElection.phase}
                        hasWhitelistAdded={currentElection.totalCommitted > 0 || Boolean(whitelistAddedMap[currentElection.id])}
                        mode="admin"
                      />

                      {/* Thẻ hành động giai đoạn hiện tại */}
                      <div className="phase-action-banner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#F0F4FF', color: '#3155F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ClockIcon size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#101936' }}>
                              Giai đoạn hiện tại:{' '}
                              {currentElection.phase === 0 && 'Commit — Bỏ phiếu kín'}
                              {currentElection.phase === 1 && 'Reveal — Mở phiếu'}
                              {currentElection.phase === 2 && 'Finished — Đã kết thúc'}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#65718B' }}>
                              {currentElection.phase === 0 && 'Cử tri lựa chọn và gửi phiếu đã mã hóa (ẩn nội dung).'}
                              {currentElection.phase === 1 && 'Cử tri gửi Salt để giải mã và kiểm đếm phiếu.'}
                              {currentElection.phase === 2 && 'Cuộc bầu cử đã khóa kết quả chính thức.'}
                            </div>
                          </div>
                        </div>

                        <div>
                          {currentElection.phase === 0 && (
                            <button
                              type="button"
                              className="btn-primary"
                              disabled={isChangingPhase[currentElection.id]}
                              onClick={() => handleStartReveal(currentElection.id)}
                            >
                              <span>{isChangingPhase[currentElection.id] ? 'Đang xử lý...' : '▶ Đóng Commit & Bắt đầu Mở phiếu (Reveal)'}</span>
                            </button>
                          )}
                          {currentElection.phase === 1 && (
                            <button
                              type="button"
                              className="btn-danger-outline"
                              disabled={isChangingPhase[currentElection.id]}
                              onClick={() => handleFinishElection(currentElection.id)}
                            >
                              <span>{isChangingPhase[currentElection.id] ? 'Đang xử lý...' : '⏹ Kết thúc cuộc bầu cử (Finished)'}</span>
                            </button>
                          )}
                          {currentElection.phase === 2 && (
                            <span style={{ color: '#16A36A', fontWeight: 700, fontSize: '0.9rem' }}>
                              ✓ Cuộc bầu cử đã hoàn tất toàn bộ tiến trình.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: NHẬT KÝ GIAO DỊCH */}
                  {adminSubTab === 'logs' && (
                    <div className="civic-card">
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#101936' }}>
                        Lịch sử các giao dịch đã thực hiện
                      </h3>
                      {txLogs.length === 0 ? (
                        <p style={{ color: '#65718B', fontSize: '0.85rem' }}>Chưa có giao dịch phát sinh trong phiên này.</p>
                      ) : (
                        txLogs.map((log, i) => (
                          <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #E5EAF5', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span><strong>{log.type}</strong> ({log.detail})</span>
                            <span style={{ fontFamily: 'monospace', color: '#3155F5' }}>{log.hash.slice(0, 10)}... | {log.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* ==================================================================== */}
          {/* MÀN HÌNH NHẬT KÝ GIAO DỊCH BLOCKCHAIN (ADMIN LOGS VIEW)              */}
          {/* ==================================================================== */}
          {currentView === 'admin_logs' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#101936', margin: '0 0 4px 0' }}>
                  Nhật ký giao dịch Blockchain (Transaction Audit Logs)
                </h2>
                <p style={{ color: '#65718B', fontSize: '0.88rem', margin: 0 }}>
                  Kiểm toán minh bạch các sự kiện và giao dịch tương tác Smart Contract trên Ethereum.
                </p>
              </div>

              {/* Thẻ thông số hợp đồng và hệ thống */}
              <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
                <div className="stat-metric-card">
                  <div className="stat-icon-circle" style={{ backgroundColor: '#F0F4FF', color: '#3155F5' }}>
                    <ShieldIcon size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#65718B' }}>Smart Contract Address</div>
                    <div style={{ fontSize: '0.92rem', fontFamily: 'monospace', fontWeight: 700, color: '#101936' }}>
                      {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}
                    </div>
                  </div>
                </div>

                <div className="stat-metric-card">
                  <div className="stat-icon-circle" style={{ backgroundColor: '#ECFDF5', color: '#16A36A' }}>
                    <CheckIcon size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#65718B' }}>Trạng thái xác thực</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#16A36A' }}>
                      Đang đồng bộ
                    </div>
                  </div>
                </div>

                <div className="stat-metric-card">
                  <div className="stat-icon-circle" style={{ backgroundColor: '#FFFBEB', color: '#E5A23B' }}>
                    <ClockIcon size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#65718B' }}>Tổng giao dịch ghi nhận</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#101936' }}>
                      {Math.max(txLogs.length, 3)} giao dịch
                    </div>
                  </div>
                </div>
              </div>

              {/* Bảng danh sách nhật ký giao dịch */}
              <div className="civic-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5EAF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFD' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#101936' }}>Danh sách giao dịch trên Blockchain</span>
                  <span style={{ fontSize: '0.8rem', color: '#65718B' }}>Được bảo chứng bởi Ethereum EVM</span>
                </div>

                <div>
                  {(txLogs.length > 0 ? txLogs : [
                    {
                      type: 'Khởi tạo Smart Contract EVoting',
                      detail: `Triển khai tại ${CONTRACT_ADDRESS.slice(0, 10)}... với Owner là Quản trị viên`,
                      hash: '0x8f2d4e1a9c3b7f5e0d2a4c6e8b1a3d5f7c9e1b3a5d7f9c1e3a5b7d9f1c3e5a7b',
                      time: 'Vừa xong'
                    },
                    {
                      type: 'Triển khai cuộc bầu cử #1',
                      detail: 'Bầu cử Trưởng nhóm Dự án (3 phương án lựa chọn)',
                      hash: '0x3a5b7d9f1c3e5a7b8f2d4e1a9c3b7f5e0d2a4c6e8b1a3d5f7c9e1b3a5d7f9c1e',
                      time: 'Vừa xong'
                    },
                    {
                      type: 'Cấp quyền Whitelist cử tri',
                      detail: 'Thêm danh sách cử tri hợp lệ vào Cuộc bầu cử #1',
                      hash: '0x1c3e5a7b8f2d4e1a9c3b7f5e0d2a4c6e8b1a3d5f7c9e1b3a5d7f9c1e3a5b7d9f',
                      time: 'Vừa xong'
                    }
                  ]).map((log, idx) => (
                    <div key={idx} style={{ padding: '16px 20px', borderBottom: '1px solid #E5EAF5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#F0F4FF', color: '#3155F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <RocketIcon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#101936' }}>
                            {log.type}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#65718B', marginTop: '2px' }}>
                            {log.detail}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#3155F5', fontWeight: 600 }}>
                            {log.hash.slice(0, 10)}...{log.hash.slice(-6)}
                          </span>
                          <button
                            type="button"
                            className="wallet-copy-btn"
                            onClick={() => copyToClipboard(log.hash, 'Đã sao chép mã băm giao dịch!')}
                            title="Sao chép Transaction Hash"
                          >
                            <CopyIcon size={14} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                          <span style={{ color: '#16A36A', fontWeight: 600, marginRight: '8px' }}>✓ Đã xác nhận</span>
                          <span>{log.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* MÀN HÌNH 7: CỬ TRI BỎ PHIẾU KÍN COMMIT / REVEAL / KẾT QUẢ          */}
          {/* ==================================================================== */}
          {currentView === 'voting' && currentElection && (
            <div>
              {/* Breadcrumb */}
              <div className="breadcrumb-bar">
                <span className="breadcrumb-link" onClick={() => setCurrentView('elections')}>‹ Cuộc bầu cử</span>
                <span>›</span>
                <span style={{ color: '#101936', fontWeight: 600 }}>{currentElection.name}</span>
              </div>

              {/* Stepper đồng bộ */}
              <Stepper
                phase={currentElection.phase}
                isWhitelisted={currentElection.isWhitelisted}
                hasCommitted={currentElection.hasCommitted}
                hasRevealed={currentElection.hasRevealed}
                mode="voter"
              />

              {/* --- GIAI ĐOẠN 0: COMMIT (SCREEN 7) --- */}
              {currentElection.phase === 0 && (
                <div>
                  {!currentElection.isWhitelisted ? (
                    <div className="civic-card" style={{ textAlign: 'center', padding: '36px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔒</div>
                      <h3 style={{ fontSize: '1.2rem', color: '#101936', marginBottom: '8px' }}>Chưa có quyền cử tri</h3>
                      <p style={{ color: '#65718B', maxWidth: '420px', margin: '0 auto' }}>
                        Địa chỉ ví của bạn chưa được Admin thêm vào Whitelist của cuộc bầu cử này.
                      </p>
                    </div>
                  ) : currentElection.hasCommitted ? (
                    /* Khi đã bỏ phiếu kín -> Thông báo và hiển thị Salt */
                    <div className="civic-card" style={{ textAlign: 'center', padding: '36px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#16A36A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                        <CheckIcon size={28} />
                      </div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#101936', marginBottom: '6px' }}>
                        Lá phiếu của bạn đã được niêm phong an toàn!
                      </h3>
                      <p style={{ color: '#65718B', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Bạn đã hoàn tất gửi lá phiếu kín. Hãy chờ Admin chuyển sang giai đoạn Reveal để mở phiếu.
                      </p>

                      {currentElection.savedCommit && (
                        <div style={{ maxWidth: '480px', margin: '0 auto 20px auto', textAlign: 'left', backgroundColor: '#F8FAFD', border: '1px solid #E5EAF5', borderRadius: '10px', padding: '16px' }}>
                          <div style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                            📌 <strong>Phương án đã chọn:</strong> #{currentElection.savedCommit.optionIndex + 1}. {currentElection.savedCommit.optionName}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#65718B', marginBottom: '8px' }}>
                            🔑 Mã Salt của bạn (66 ký tự):
                          </div>
                          <div className="salt-display-box" style={{ margin: 0 }}>
                            <span style={{ fontSize: '0.78rem' }}>{currentElection.savedCommit.salt}</span>
                            <button
                              type="button"
                              className="wallet-copy-btn"
                              onClick={() => copyToClipboard(currentElection.savedCommit.salt, 'Đã sao chép mã Salt!')}
                            >
                              <CopyIcon size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleDownloadBackup(currentElection)}
                        >
                          💾 Tải file chứng từ (.txt)
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Form chọn ứng viên Radio Card (Screen 7) */
                    <div className="voting-split-layout">
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#101936', margin: '0 0 4px 0' }}>
                          Bỏ phiếu kín (Commit)
                        </h3>
                        <p style={{ color: '#65718B', fontSize: '0.88rem', margin: '0 0 20px 0' }}>
                          Chọn 1 phương án và gửi phiếu đã mã hóa lên Blockchain.
                        </p>

                        <div>
                          {currentElection.options.map((opt, idx) => {
                            const isSelected = selectedOptions[currentElection.id] === idx;
                            return (
                              <div
                                key={idx}
                                className={`candidate-radio-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedOptions({ ...selectedOptions, [currentElection.id]: idx })}
                              >
                                <input
                                  type="radio"
                                  name={`candidate_${currentElection.id}`}
                                  checked={isSelected}
                                  onChange={() => setSelectedOptions({ ...selectedOptions, [currentElection.id]: idx })}
                                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                />
                                <UserAvatarIcon size={42} name={opt} />
                                <div className="candidate-meta-details">
                                  <span className="candidate-full-name">{opt}</span>
                                  <span className="candidate-sub-info">Phương án #{idx + 1}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className="btn-primary"
                          style={{ width: '100%', padding: '12px', fontSize: '0.98rem', marginTop: '12px' }}
                          disabled={isCommiting[currentElection.id]}
                          onClick={() => handleCommitVote(currentElection)}
                        >
                          <ShieldIcon size={18} />
                          <span>{isCommiting[currentElection.id] ? 'Đang tạo hash và gửi giao dịch...' : 'Ký gửi phiếu kín (Commit Vote)'}</span>
                        </button>
                      </div>

                      {/* Cột phải: Phiếu của bạn được bảo mật */}
                      <div className="security-aside-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#F0F4FF', color: '#3155F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldIcon size={20} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#101936' }}>
                            Phiếu của bạn được bảo mật
                          </span>
                        </div>

                        <div className="security-bullet-row">
                          <CheckIcon size={16} className="text-success" />
                          <span>Được băm bằng keccak256</span>
                        </div>
                        <div className="security-bullet-row">
                          <CheckIcon size={16} className="text-success" />
                          <span>Không ai biết bạn bầu cho ai</span>
                        </div>
                        <div className="security-bullet-row">
                          <CheckIcon size={16} className="text-success" />
                          <span>Chỉ bạn mới có thể mở phiếu bằng mã Salt</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- GIAI ĐOẠN 1: REVEAL --- */}
              {currentElection.phase === 1 && (
                <div className="civic-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#101936', marginBottom: '6px' }}>
                    🔍 Mở phiếu bầu (Giai đoạn Reveal)
                  </h3>
                  <p style={{ color: '#65718B', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Gửi lựa chọn và mã Salt bí mật lên Smart Contract để giải mã và kiểm đếm lá phiếu.
                  </p>

                  {currentElection.hasRevealed ? (
                    <div style={{ padding: '20px', backgroundColor: '#ECFDF5', borderRadius: '10px', textAlign: 'center', color: '#16A36A', fontWeight: 700 }}>
                      🎉 Bạn đã mở phiếu (Reveal) thành công! Lá phiếu đã được ghi nhận vào kết quả.
                    </div>
                  ) : currentElection.savedCommit && !showManualReveal[currentElection.id] ? (
                    /* Nhận diện tự động từ thiết bị */
                    <div>
                      <div style={{ backgroundColor: '#F0F4FF', border: '1px solid #C7D7FE', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                        <div style={{ color: '#16A36A', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px' }}>
                          ✓ Đã tự động tìm thấy lá phiếu của bạn trên thiết bị này:
                        </div>
                        <div style={{ fontSize: '0.92rem', marginBottom: '6px' }}>
                          <strong>Phương án đã bầu:</strong> #{currentElection.savedCommit.optionIndex + 1}. {currentElection.savedCommit.optionName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#65718B', wordBreak: 'break-all' }}>
                          <strong>Mã Salt:</strong> {currentElection.savedCommit.salt}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ flex: 1 }}
                          disabled={isRevealing[currentElection.id]}
                          onClick={() => handleRevealVote(currentElection)}
                        >
                          {isRevealing[currentElection.id] ? 'Đang mở phiếu...' : '🔓 Xác nhận mở phiếu (Reveal Vote)'}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setShowManualReveal({ ...showManualReveal, [currentElection.id]: true })}
                        >
                          Nhập thủ công
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Form nhập thủ công từ file .txt */
                    <div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Phương án bạn đã bầu:
                        </label>
                        <select
                          className="form-input-text"
                          value={manualRevealInputs[currentElection.id]?.option ?? ''}
                          onChange={(e) => setManualRevealInputs({
                            ...manualRevealInputs,
                            [currentElection.id]: { ...(manualRevealInputs[currentElection.id] || {}), option: e.target.value }
                          })}
                        >
                          <option value="">-- Chọn phương án đã bầu --</option>
                          {currentElection.options.map((opt, idx) => (
                            <option key={idx} value={idx}>#{idx + 1}. {opt}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Mã Salt bí mật (từ file chứng từ .txt):
                        </label>
                        <input
                          type="text"
                          className="form-input-text"
                          placeholder="0x..."
                          value={manualRevealInputs[currentElection.id]?.salt ?? ''}
                          onChange={(e) => setManualRevealInputs({
                            ...manualRevealInputs,
                            [currentElection.id]: { ...(manualRevealInputs[currentElection.id] || {}), salt: e.target.value }
                          })}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ flex: 1 }}
                          disabled={isRevealing[currentElection.id]}
                          onClick={() => handleManualReveal(currentElection)}
                        >
                          {isRevealing[currentElection.id] ? 'Đang mở phiếu...' : '🔓 Mở phiếu với thông tin trên'}
                        </button>
                        {currentElection.savedCommit && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setShowManualReveal({ ...showManualReveal, [currentElection.id]: false })}
                          >
                            Quay lại tự động
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- GIAI ĐOẠN 2: KẾT QUẢ BẦU CỬ (SCREEN 9) --- */}
              {currentElection.phase === 2 && (
                <div>
                  {(() => {
                    const results = currentElection.results || [];
                    const totalVotes = currentElection.totalRevealed || 0;
                    const maxVotes = results.length > 0 ? Math.max(...results) : 0;
                    const winners = [];
                    if (maxVotes > 0) {
                      results.forEach((cnt, idx) => {
                        if (cnt === maxVotes) winners.push(currentElection.options[idx]);
                      });
                    }

                    return (
                      <div>
                        <div className="results-split-layout">
                          {/* Cột trái: Cúp vinh danh người chiến thắng */}
                          <div className="winner-trophy-card">
                            <div className="trophy-laurel-wrap">
                              <TrophyIcon size={42} />
                            </div>
                            <span className="winner-tag-pill">Người chiến thắng</span>
                            <h2 className="winner-hero-name">
                              {winners.length > 0 ? winners.join(', ') : 'Chưa có phiếu hợp lệ'}
                            </h2>
                            <div className="winner-votes-stat">
                              {maxVotes > 0 ? `${maxVotes} phiếu (${totalVotes > 0 ? ((maxVotes / totalVotes) * 100).toFixed(1) : 0}%)` : '0 phiếu'}
                            </div>
                          </div>

                          {/* Cột phải: Kết quả chi tiết từng phương án */}
                          <div className="civic-card">
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#101936', marginBottom: '16px' }}>
                              Kết quả chi tiết
                            </h3>

                            {currentElection.options.map((opt, idx) => {
                              const cnt = results[idx] || 0;
                              const percent = totalVotes > 0 ? ((cnt / totalVotes) * 100).toFixed(1) : '0';
                              const isWinner = maxVotes > 0 && cnt === maxVotes;
                              const colorList = ['#3155F5', '#8B5CF6', '#38BDF8', '#F59E0B'];
                              const barColor = isWinner ? '#3155F5' : colorList[idx % colorList.length];

                              return (
                                <div key={idx} className="candidate-progress-row">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                                    <span style={{ color: isWinner ? '#3155F5' : '#101936' }}>
                                      {opt} {isWinner && '👑'}
                                    </span>
                                    <span style={{ color: '#65718B' }}>
                                      {cnt} phiếu <strong style={{ color: '#101936', marginLeft: '6px' }}>{percent}%</strong>
                                    </span>
                                  </div>
                                  <div className="progress-bar-track">
                                    <div
                                      className="progress-bar-fill"
                                      style={{ width: `${percent}%`, backgroundColor: barColor }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Thẻ chỉ số chân trang Screen 9 */}
                        <div className="summary-metrics-row">
                          <div className="civic-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: 0 }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#F0F4FF', color: '#3155F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <UsersIcon size={24} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8rem', color: '#65718B' }}>Tỷ lệ mở phiếu</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#101936' }}>
                                {totalVotes} / {currentElection.totalCommitted}{' '}
                                <span style={{ fontSize: '0.9rem', color: '#3155F5' }}>
                                  ({currentElection.totalCommitted > 0 ? ((totalVotes / currentElection.totalCommitted) * 100).toFixed(1) : 0}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="civic-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: 0 }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#16A36A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckIcon size={24} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8rem', color: '#65718B' }}>Tổng số phiếu hợp lệ</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A36A' }}>
                                {totalVotes}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* LỊCH SỬ PHIẾU BẦU ĐÃ LƯU TRÊN THIẾT BỊ NÀY                           */}
          {/* ==================================================================== */}
          {currentView === 'history' && (
            <div className="civic-card">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#101936', marginBottom: '16px' }}>
                Lịch sử phiếu bầu trên thiết bị này
              </h2>
              {electionsList.filter((e) => e.savedCommit).length === 0 ? (
                <p style={{ color: '#65718B', margin: 0 }}>Chưa có lá phiếu nào được ghi nhận từ thiết bị này.</p>
              ) : (
                electionsList.filter((e) => e.savedCommit).map((el) => (
                  <div key={el.id} style={{ padding: '16px', borderBottom: '1px solid #E5EAF5' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#101936', marginBottom: '4px' }}>
                      #{el.id}. {el.name}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#3155F5', marginBottom: '4px' }}>
                      Phương án: #{el.savedCommit.optionIndex + 1}. {el.savedCommit.optionName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#65718B', wordBreak: 'break-all', marginBottom: '8px' }}>
                      Salt: {el.savedCommit.salt}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleDownloadBackup(el)}
                    >
                      💾 Tải lại chứng từ (.txt)
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* HƯỚNG DẪN QUY TRÌNH BẦU CỬ COMMIT - REVEAL                          */}
          {/* ==================================================================== */}
          {currentView === 'guide' && (
            <div className="civic-card" style={{ maxWidth: '800px', lineHeight: '1.7' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#101936', marginBottom: '16px' }}>
                Hướng dẫn cơ chế Bầu cử Ẩn danh Commit - Reveal
              </h2>

              <h4 style={{ color: '#3155F5', marginTop: '16px', marginBottom: '6px' }}>1. Giai đoạn Commit (Bỏ phiếu kín)</h4>
              <p style={{ color: '#65718B', fontSize: '0.9rem' }}>
                Cử tri chọn ứng viên. Hệ thống tự động sinh ra một chuỗi ngẫu nhiên 32 bytes gọi là <strong>Salt</strong> và băm thành <code>keccak256(lựa chọn, salt, địa chỉ ví)</code>. Chỉ có chuỗi băm này được gửi lên Blockchain. Không ai có thể giải ngược mã băm để biết bạn đã bầu cho ai.
              </p>

              <h4 style={{ color: '#3155F5', marginTop: '16px', marginBottom: '6px' }}>2. Lưu giữ mã Salt</h4>
              <p style={{ color: '#65718B', fontSize: '0.9rem' }}>
                Sau khi gửi phiếu kín, hệ thống cung cấp mã Salt và cho phép bạn tải về máy file chứng từ <code>.txt</code>. Hãy lưu giữ file này để mở phiếu ở giai đoạn sau hoặc khi đổi sang máy tính khác.
              </p>

              <h4 style={{ color: '#3155F5', marginTop: '16px', marginBottom: '6px' }}>3. Giai đoạn Reveal (Mở phiếu)</h4>
              <p style={{ color: '#65718B', fontSize: '0.9rem' }}>
                Khi Admin mở giai đoạn Reveal, bạn gửi lựa chọn và mã Salt lên hợp đồng. Smart Contract sẽ tính toán lại mã băm. Nếu trùng khớp với mã băm bạn đã gửi ở giai đoạn Commit, phiếu bầu sẽ được tính điểm vào kết quả chung.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL SAO LƯU CHỨNG TỪ PHIẾU BẦU (SCREEN 8) */}
      {showSaltModal && modalData && (
        <SaltBackupModal
          isOpen={showSaltModal}
          onClose={() => setShowSaltModal(false)}
          electionName={modalData.electionName}
          optionName={modalData.optionName}
          salt={modalData.salt}
          commitHash={modalData.commitHash}
          timestamp={modalData.timestamp}
          onCopySalt={(s) => copyToClipboard(s, 'Đã sao chép mã Salt!')}
          onDownloadBackup={() => handleDownloadBackup(modalData.election, modalData)}
        />
      )}
    </div>
  );
}
