// Component Stepper 4 bước chuẩn xác: Registration (0) -> Commit (1) -> Reveal (2) -> Finished (3)
import React from 'react';
import { CheckIcon } from './Icons';

export default function Stepper({
  phase = 0,
  isWhitelisted = false,
  hasCommitted = false,
  hasRevealed = false,
  hasWhitelistAdded = false,
  mode = 'voter'
}) {
  let step1 = { status: 'upcoming', sub: '' };
  let step2 = { status: 'upcoming', sub: '' };
  let step3 = { status: 'upcoming', sub: '' };
  let step4 = { status: 'upcoming', sub: '' };

  if (mode === 'admin') {
    // --------------------------------------------------------------------------
    // DÀNH CHO QUẢN TRỊ VIÊN
    // --------------------------------------------------------------------------
    // 1. Bước 1: Ghi danh
    if (phase === 0) {
      step1 = { status: 'active', sub: hasWhitelistAdded ? '✓ Đã thêm cử tri' : '(Đang ghi danh)' };
    } else {
      step1 = { status: 'completed', sub: '✓ Đã khóa Whitelist' };
    }

    // 2. Bước 2: Commit
    if (phase === 0) {
      step2 = { status: 'upcoming', sub: '(Chờ bắt đầu)' };
    } else if (phase === 1) {
      step2 = { status: 'active', sub: '(Đang mở Commit)' };
    } else {
      step2 = { status: 'completed', sub: '✓ Đã đóng Commit' };
    }

    // 3. Bước 3: Reveal
    if (phase < 2) {
      step3 = { status: 'upcoming', sub: '(Chưa bắt đầu)' };
    } else if (phase === 2) {
      step3 = { status: 'active', sub: '(Đang mở Reveal)' };
    } else {
      step3 = { status: 'completed', sub: '✓ Đã đóng Reveal' };
    }

    // 4. Bước 4: Kết quả
    if (phase < 3) {
      step4 = { status: 'upcoming', sub: '(Chưa kết thúc)' };
    } else {
      step4 = { status: 'active', sub: '(Đã công bố)' };
    }
  } else {
    // --------------------------------------------------------------------------
    // DÀNH CHO CỬ TRI
    // --------------------------------------------------------------------------
    if (!isWhitelisted) {
      // Ví cử tri CHƯA được cấp Whitelist (Chế độ Quan sát viên)
      step1 = { status: 'active', sub: 'Chưa cấp Whitelist' };
      step2 = { status: 'upcoming', sub: '(Chỉ xem)' };
      step3 = { status: 'upcoming', sub: '(Chỉ xem)' };
      step4 = phase === 3
        ? { status: 'active', sub: '(Đã công bố)' }
        : { status: 'upcoming', sub: '(Chưa kết thúc)' };
    } else {
      // Ví cử tri ĐÃ được cấp Whitelist
      step1 = { status: 'completed', sub: '✓ Đã cấp quyền' };

      // Bước 2: Commit
      if (phase === 0) {
        step2 = { status: 'upcoming', sub: '(Chờ mở hòm phiếu)' };
        step3 = { status: 'upcoming', sub: '(Chưa bắt đầu)' };
      } else if (phase === 1) {
        step2 = hasCommitted
          ? { status: 'completed', sub: '✓ Đã niêm phong' }
          : { status: 'active', sub: '(Đang mở bỏ phiếu)' };
        step3 = { status: 'upcoming', sub: '(Chưa bắt đầu)' };
      } else {
        step2 = hasCommitted
          ? { status: 'completed', sub: '✓ Đã niêm phong' }
          : { status: 'upcoming', sub: '(Bỏ lỡ Commit)' };

        // Bước 3: Reveal
        if (phase === 2) {
          if (hasRevealed) {
            step3 = { status: 'completed', sub: '✓ Đã mở phiếu' };
          } else if (hasCommitted) {
            step3 = { status: 'active', sub: '(Cần mở phiếu)' };
          } else {
            step3 = { status: 'upcoming', sub: '(Không thể mở)' };
          }
        } else {
          // phase === 3
          step3 = hasRevealed
            ? { status: 'completed', sub: '✓ Đã mở phiếu' }
            : { status: 'upcoming', sub: '(Chưa mở phiếu)' };
        }
      }

      // Bước 4: Kết quả
      if (phase < 3) {
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
                color: step1.status === 'completed' ? '#16A36A' : step1.status === 'active' ? '#3155F5' : undefined,
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
              style={{
                color: step2.status === 'completed' ? '#16A36A' : step2.status === 'active' ? '#3155F5' : undefined,
                fontWeight: 600
              }}
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
              style={{
                color: step3.status === 'completed' ? '#16A36A' : step3.status === 'active' ? '#3155F5' : undefined,
                fontWeight: 600
              }}
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
          {step4.status === 'completed' ? <CheckIcon size={14} /> : '4'}
        </div>
        <div className="step-label-group">
          <span className="step-title">Kết quả</span>
          {step4.sub && (
            <span
              className="step-sub"
              style={{
                color: step4.status === 'completed' ? '#16A36A' : step4.status === 'active' ? '#3155F5' : undefined,
                fontWeight: 600
              }}
            >
              {step4.sub}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
