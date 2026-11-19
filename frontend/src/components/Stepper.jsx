// Component Stepper 4 bước chuẩn xác theo vòng đời và quyền Whitelist thực tế
import React from 'react';
import { CheckIcon } from './Icons';

export default function Stepper({
  phase = 0,
  isWhitelisted = false,
  hasCommitted = false,
  hasRevealed = false,
  hasWhitelistAdded = false, // Dành cho Admin: đã cấp danh sách Whitelist cho cuộc bầu cử chưa
  mode = 'voter'             // 'admin' hoặc 'voter'
}) {
  let step1 = { status: 'upcoming', sub: '' };
  let step2 = { status: 'upcoming', sub: '' };
  let step3 = { status: 'upcoming', sub: '' };
  let step4 = { status: 'upcoming', sub: '' };

  if (mode === 'admin') {
    // --------------------------------------------------------------------------
    // DÀNH CHO QUẢN TRỊ VIÊN: Theo dõi tiến độ quản trị cuộc bầu cử
    // --------------------------------------------------------------------------
    // 1. Bước 1: Ghi danh (Cấp quyền Whitelist)
    if (hasWhitelistAdded || phase > 0) {
      step1 = { status: 'completed', sub: '✓ Đã cấp quyền' };
    } else {
      step1 = { status: 'active', sub: 'Chưa cấp Whitelist' };
    }

    // 2. Bước 2: Commit (Bỏ phiếu kín)
    if (phase === 0) {
      step2 = hasWhitelistAdded
        ? { status: 'active', sub: '(Đang diễn ra)' }
        : { status: 'upcoming', sub: '(Chờ Whitelist)' };
    } else {
      step2 = { status: 'completed', sub: '✓ Đã đóng Commit' };
    }

    // 3. Bước 3: Reveal (Mở phiếu)
    if (phase === 0) {
      step3 = { status: 'upcoming', sub: '(Chưa bắt đầu)' };
    } else if (phase === 1) {
      step3 = { status: 'active', sub: '(Đang diễn ra)' };
    } else {
      step3 = { status: 'completed', sub: '✓ Đã đóng Reveal' };
    }

    // 4. Bước 4: Kết quả
    if (phase < 2) {
      step4 = { status: 'upcoming', sub: '(Chưa kết thúc)' };
    } else {
      step4 = { status: 'active', sub: '(Đã công bố)' };
    }
  } else {
    // --------------------------------------------------------------------------
    // DÀNH CHO CỬ TRI: Phản ánh trung thực quyền hạn và hành động của ví cử tri
    // --------------------------------------------------------------------------
    if (!isWhitelisted) {
      // Ví cử tri CHƯA được cấp Whitelist -> Tuyệt đối không tích xanh
      step1 = { status: 'active', sub: 'Chưa cấp Whitelist' };
      step2 = { status: 'upcoming', sub: '(Bị khóa)' };
      step3 = { status: 'upcoming', sub: '(Bị khóa)' };
      step4 = phase === 2
        ? { status: 'active', sub: '(Đã công bố)' }
        : { status: 'upcoming', sub: '(Chưa kết thúc)' };
    } else {
      // Ví cử tri ĐÃ được cấp Whitelist
      step1 = { status: 'completed', sub: '✓ Đã cấp quyền' };

      // Bước 2: Commit
      if (phase === 0) {
        if (hasCommitted) {
          step2 = { status: 'completed', sub: '✓ Đã niêm phong' };
        } else {
          step2 = { status: 'active', sub: '(Đang diễn ra)' };
        }
        step3 = { status: 'upcoming', sub: '(Chưa bắt đầu)' };
      } else {
        // Đã qua giai đoạn Commit (phase 1 hoặc 2)
        if (hasCommitted) {
          step2 = { status: 'completed', sub: '✓ Đã niêm phong' };
        } else {
          step2 = { status: 'upcoming', sub: '(Bỏ lỡ Commit)' };
        }

        // Bước 3: Reveal
        if (phase === 1) {
          if (hasRevealed) {
            step3 = { status: 'completed', sub: '✓ Đã mở phiếu' };
          } else if (hasCommitted) {
            step3 = { status: 'active', sub: '(Cần mở phiếu)' };
          } else {
            step3 = { status: 'upcoming', sub: '(Không thể mở)' };
          }
        } else {
          // phase === 2 (Finished)
          if (hasRevealed) {
            step3 = { status: 'completed', sub: '✓ Đã mở phiếu' };
          } else {
            step3 = { status: 'upcoming', sub: '(Chưa mở phiếu)' };
          }
        }
      }

      // Bước 4: Kết quả
      if (phase < 2) {
        step4 = { status: 'upcoming', sub: '(Chưa kết thúc)' };
      } else {
        step4 = { status: 'active', sub: '(Đã công bố)' };
      }
    }
  }

  return (
    <div className="stepper-card">
      {/* Bước 1: Ghi danh */}
      <div className={`stepper-step ${step1.status}`}>
        <div className="step-num-circle">
          {step1.status === 'completed' ? <CheckIcon size={14} /> : '1'}
        </div>
        <div className="step-label-group">
          <span className="step-title">Ghi danh</span>
          {step1.sub && (
            <span
              className="step-sub"
              style={{
                color: step1.status === 'completed' ? '#16A36A' : step1.status === 'active' ? '#DC4B5B' : undefined,
                fontWeight: 600
              }}
            >
              {step1.sub}
            </span>
          )}
        </div>
      </div>

      <div className={`stepper-line ${step1.status === 'completed' ? 'completed' : ''}`} />

      {/* Bước 2: Commit */}
      <div className={`stepper-step ${step2.status}`}>
        <div className="step-num-circle">
          {step2.status === 'completed' ? <CheckIcon size={14} /> : '2'}
        </div>
        <div className="step-label-group">
          <span className="step-title">Commit</span>
          {step2.sub && (
            <span
              className="step-sub"
              style={{ color: step2.status === 'completed' ? '#16A36A' : undefined }}
            >
              {step2.sub}
            </span>
          )}
        </div>
      </div>

      <div className={`stepper-line ${step2.status === 'completed' ? 'completed' : ''}`} />

      {/* Bước 3: Reveal */}
      <div className={`stepper-step ${step3.status}`}>
        <div className="step-num-circle">
          {step3.status === 'completed' ? <CheckIcon size={14} /> : '3'}
        </div>
        <div className="step-label-group">
          <span className="step-title">Reveal</span>
          {step3.sub && (
            <span
              className="step-sub"
              style={{ color: step3.status === 'completed' ? '#16A36A' : undefined }}
            >
              {step3.sub}
            </span>
          )}
        </div>
      </div>

      <div className={`stepper-line ${step3.status === 'completed' ? 'completed' : ''}`} />

      {/* Bước 4: Kết quả */}
      <div className={`stepper-step ${step4.status}`}>
        <div className="step-num-circle">
          {phase === 2 ? '🏆' : '4'}
        </div>
        <div className="step-label-group">
          <span className="step-title">Kết quả</span>
          {step4.sub && (
            <span
              className="step-sub"
              style={{ color: phase === 2 ? '#3155F5' : undefined }}
            >
              {step4.sub}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
