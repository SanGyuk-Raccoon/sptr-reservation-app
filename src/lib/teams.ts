import { supabase } from './supabase'
import type { Team, TeamMember, TeamWithDetails, CreateTeamData } from '../types/team'

// 모든 팀 조회
export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('팀 목록 조회 실패:', error)
    throw error
  }

  return data || []
}

// 팀 상세 조회 (리더 + 멤버 정보 포함)
export async function getTeamWithDetails(teamId: string): Promise<TeamWithDetails | null> {
  // 팀 기본 정보 조회
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  if (teamError) {
    console.error('팀 조회 실패:', teamError)
    return null
  }

  // 리더 정보 조회
  let leader = null
  if (team.leader_id) {
    const { data: leaderData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', team.leader_id)
      .single()
    leader = leaderData
  }

  // 팀 멤버 조회 (프로필 포함)
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('team_id', teamId)

  if (membersError) {
    console.error('팀 멤버 조회 실패:', membersError)
  }

  return {
    ...team,
    leader,
    members: members || []
  }
}

// 모든 팀 상세 정보 조회 (관리자용)
export async function getTeamsWithDetails(): Promise<TeamWithDetails[]> {
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .order('name', { ascending: true })

  if (teamsError) {
    console.error('팀 목록 조회 실패:', teamsError)
    return []
  }

  const teamsWithDetails: TeamWithDetails[] = []

  for (const team of teams || []) {
    // 리더 정보 조회
    let leader = null
    if (team.leader_id) {
      const { data: leaderData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', team.leader_id)
        .single()
      leader = leaderData
    }

    // 팀 멤버 조회
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('team_id', team.id)

    teamsWithDetails.push({
      ...team,
      leader,
      members: members || []
    })
  }

  return teamsWithDetails
}

// 팀 생성 (관리자)
export async function createTeam(data: CreateTeamData): Promise<Team> {
  const { data: team, error } = await supabase
    .from('teams')
    .insert([{ name: data.name, leader_id: data.leader_id }])
    .select()
    .single()

  if (error) {
    console.error('팀 생성 실패:', error)
    throw error
  }

  // 팀장을 자동으로 팀 멤버에 추가
  await addTeamMember(team.id, data.leader_id)

  return team
}

// 팀 수정 (관리자)
export async function updateTeam(teamId: string, updates: Partial<Pick<Team, 'name' | 'leader_id'>>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single()

  if (error) {
    console.error('팀 수정 실패:', error)
    throw error
  }

  return data
}

// 팀 삭제 (관리자)
export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId)

  if (error) {
    console.error('팀 삭제 실패:', error)
    throw error
  }
}

// 팀 멤버 추가 (관리자)
export async function addTeamMember(teamId: string, userId: string): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert([{ team_id: teamId, user_id: userId }])
    .select()
    .single()

  if (error) {
    // 이미 멤버인 경우 무시
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single()
      return existing!
    }
    console.error('팀 멤버 추가 실패:', error)
    throw error
  }

  return data
}

// 팀 멤버 삭제 (관리자)
export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)

  if (error) {
    console.error('팀 멤버 삭제 실패:', error)
    throw error
  }
}

// 내가 팀장인 팀 목록 조회
export async function getMyLeaderTeams(userId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('leader_id', userId)
    .order('name', { ascending: true })

  if (error) {
    console.error('팀장 팀 조회 실패:', error)
    return []
  }

  return data || []
}
