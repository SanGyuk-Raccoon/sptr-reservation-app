import { TeamManagement } from './TeamManagement'

interface AdminPageProps {
  onClose: () => void
}

export function AdminPage({ onClose }: AdminPageProps) {
  return (
    <div className="admin-page-overlay">
      <div className="admin-page">
        <div className="admin-page-header">
          <h1>관리자 페이지</h1>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>
        <div className="admin-page-content">
          <TeamManagement />
        </div>
      </div>
    </div>
  )
}
