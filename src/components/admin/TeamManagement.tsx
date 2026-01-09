import { useState, useEffect } from 'react'
import type { TeamWithDetails } from '../../types/team'
import type { Profile } from '../../types/auth'
import {
  getTeamsWithDetails,
  createTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember
} from '../../lib/teams'
import { getAllProfiles } from '../../lib/auth'

export function TeamManagement() {
  const [teams, setTeams] = useState<TeamWithDetails[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)

  // 새 팀 폼 상태
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamLeaderId, setNewTeamLeaderId] = useState('')

  // 팀원 추가 상태
  const [addMemberUserId, setAddMemberUserId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [teamsData, profilesData] = await Promise.all([
        getTeamsWithDetails(),
        getAllProfiles()
      ])
      setTeams(teamsData)
      setProfiles(profilesData)
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !newTeamLeaderId) {
      alert('팀 이름과 팀장을 선택해주세요.')
      return
    }

    try {
      await createTeam({ name: newTeamName.trim(), leader_id: newTeamLeaderId })
      setNewTeamName('')
      setNewTeamLeaderId('')
      setShowAddForm(false)
      await loadData()
    } catch (error) {
      console.error('팀 생성 실패:', error)
      alert('팀 생성에 실패했습니다.')
    }
  }

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`"${teamName}" 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      await deleteTeam(teamId)
      await loadData()
    } catch (error) {
      console.error('팀 삭제 실패:', error)
      alert('팀 삭제에 실패했습니다.')
    }
  }

  const handleAddMember = async (teamId: string) => {
    if (!addMemberUserId) {
      alert('추가할 팀원을 선택해주세요.')
      return
    }

    try {
      await addTeamMember(teamId, addMemberUserId)
      setAddMemberUserId('')
      await loadData()
    } catch (error) {
      console.error('팀원 추가 실패:', error)
      alert('팀원 추가에 실패했습니다.')
    }
  }

  const handleRemoveMember = async (teamId: string, userId: string, userName: string) => {
    if (!confirm(`"${userName}"님을 팀에서 제거하시겠습니까?`)) {
      return
    }

    try {
      await removeTeamMember(teamId, userId)
      await loadData()
    } catch (error) {
      console.error('팀원 제거 실패:', error)
      alert('팀원 제거에 실패했습니다.')
    }
  }

  const getAvailableMembers = (team: TeamWithDetails) => {
    const existingMemberIds = new Set(team.members.map(m => m.user_id))
    return profiles.filter(p => !existingMemberIds.has(p.id))
  }

  if (loading) {
    return <div className="loading-message">팀 정보를 불러오는 중...</div>
  }

  return (
    <div className="team-management">
      <div className="team-management-header">
        <h2>팀 관리</h2>
        <button
          className="add-team-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '취소' : '+ 새 팀 추가'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-team-form">
          <input
            type="text"
            placeholder="팀 이름"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="form-input"
          />
          <select
            value={newTeamLeaderId}
            onChange={(e) => setNewTeamLeaderId(e.target.value)}
            className="form-select"
          >
            <option value="">팀장 선택</option>
            {profiles.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.name || '이름 없음'}
              </option>
            ))}
          </select>
          <button onClick={handleCreateTeam} className="save-button">
            팀 생성
          </button>
        </div>
      )}

      <div className="teams-list">
        {teams.length === 0 ? (
          <p className="no-teams">등록된 팀이 없습니다.</p>
        ) : (
          teams.map(team => (
            <div key={team.id} className="team-card">
              <div className="team-card-header">
                <div className="team-info">
                  <h3 className="team-name">{team.name}</h3>
                  <span className="team-leader">
                    팀장: {team.leader?.name || '미지정'}
                  </span>
                  <span className="team-member-count">
                    팀원: {team.members.length}명
                  </span>
                </div>
                <div className="team-actions">
                  <button
                    className="expand-button"
                    onClick={() => setExpandedTeamId(
                      expandedTeamId === team.id ? null : team.id
                    )}
                  >
                    {expandedTeamId === team.id ? '접기' : '펼치기'}
                  </button>
                  <button
                    className="delete-team-button"
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                  >
                    삭제
                  </button>
                </div>
              </div>

              {expandedTeamId === team.id && (
                <div className="team-details">
                  <h4>팀원 목록</h4>
                  <ul className="members-list">
                    {team.members.map(member => (
                      <li key={member.id} className="member-item">
                        <span className="member-name">
                          {member.profile?.name || '이름 없음'}
                          {member.user_id === team.leader_id && (
                            <span className="leader-badge">팀장</span>
                          )}
                        </span>
                        {member.user_id !== team.leader_id && (
                          <button
                            className="remove-member-button"
                            onClick={() => handleRemoveMember(
                              team.id,
                              member.user_id,
                              member.profile?.name || '이름 없음'
                            )}
                          >
                            제거
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="add-member-section">
                    <select
                      value={addMemberUserId}
                      onChange={(e) => setAddMemberUserId(e.target.value)}
                      className="form-select"
                    >
                      <option value="">팀원 추가</option>
                      {getAvailableMembers(team).map(profile => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name || '이름 없음'}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddMember(team.id)}
                      className="add-member-button"
                      disabled={!addMemberUserId}
                    >
                      추가
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
