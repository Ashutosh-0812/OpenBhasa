export interface ParticipantInviteData {
  name: string;
  email: string;
  phone: string;
  institute: string;
  age: number;
  gender: string;
  native: string;
  language: string[];
  dialects: string[];
  accent: string[];
}

export interface ParticipantInvite {
  _id: string;
  studentId: string;
  studentName: string;
  studentCollege: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  participantData: ParticipantInviteData;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  inviteLink: string;
  createdAt: string;
  expiresAt: string;
}

export interface CreateInviteResponse {
  invite: ParticipantInvite;
  message: string;
}

export interface GetInvitesResponse {
  invites: ParticipantInvite[];
  count: number;
}

export interface AcceptInviteResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    institute: string;
  };
  message: string;
  redirectTo: string;
}
