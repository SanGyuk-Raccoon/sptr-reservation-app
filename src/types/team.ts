import type { Profile } from './auth'

export interface Team {
  id: string
  name: string
  leader_id: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  created_at: string
}

export interface TeamWithDetails extends Team {
  leader: Profile | null
  members: (TeamMember & { profile: Profile })[]
}

export interface CreateTeamData {
  name: string
  leader_id: string
}
