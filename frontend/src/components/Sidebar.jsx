// Component Sidebar điều hướng chuẩn phong cách Civic Premium Light
import React from 'react';
import {
  LogoIcon,
  HomeIcon,
  VoteIcon,
  HistoryIcon,
  GuideIcon,
  DashboardIcon,
  PlusCircleIcon,
  ManageIcon,
  LogIcon
} from './Icons';

export default function Sidebar({ currentView, onChangeView, isAdmin }) {
  return (
    <aside className="sidebar">
      {/* Logo thương hiệu E-Voting */}
      <div className="sidebar-logo">
        <LogoIcon size={32} />
        <div className="logo-text-wrap">
          <div className="logo-brand-title">E-Voting</div>
          <div className="logo-brand-sub">Bầu cử trên Blockchain</div>
        </div>
      </div>

      {/* Danh mục điều hướng */}
      <nav className="sidebar-nav">
        {/* Nhóm menu chung cho Cử tri */}
        <button
          type="button"
          className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => onChangeView('home')}
        >
          <HomeIcon size={18} />
          <span>Trang chủ</span>
        </button>

        <button
          type="button"
          className={`nav-item ${currentView === 'elections' || currentView === 'voting' ? 'active' : ''}`}
          onClick={() => onChangeView('elections')}
        >
          <VoteIcon size={18} />
          <span>Cuộc bầu cử</span>
        </button>

        <button
          type="button"
          className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => onChangeView('history')}
        >
          <HistoryIcon size={18} />
          <span>Lịch sử phiếu</span>
        </button>

        <button
          type="button"
          className={`nav-item ${currentView === 'guide' ? 'active' : ''}`}
          onClick={() => onChangeView('guide')}
        >
          <GuideIcon size={18} />
          <span>Hướng dẫn</span>
        </button>

        {/* Nhóm menu dành riêng cho Quản trị viên (Admin) */}
        {isAdmin && (
          <>
            <div className="nav-section-title">QUẢN TRỊ VIÊN</div>

            <button
              type="button"
              className={`nav-item ${currentView === 'admin_dashboard' ? 'active' : ''}`}
              onClick={() => onChangeView('admin_dashboard')}
            >
              <DashboardIcon size={18} />
              <span>Tổng quan</span>
            </button>

            <button
              type="button"
              className={`nav-item ${currentView === 'admin_create' ? 'active' : ''}`}
              onClick={() => onChangeView('admin_create')}
            >
              <PlusCircleIcon size={18} />
              <span>Tạo cuộc bầu cử</span>
            </button>

            <button
              type="button"
              className={`nav-item ${currentView === 'admin_manage' ? 'active' : ''}`}
              onClick={() => onChangeView('admin_manage')}
            >
              <ManageIcon size={18} />
              <span>Quản lý bầu cử</span>
            </button>

            <button
              type="button"
              className={`nav-item ${currentView === 'admin_logs' ? 'active' : ''}`}
              onClick={() => onChangeView('admin_logs')}
            >
              <LogIcon size={18} />
              <span>Nhật ký giao dịch</span>
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}
