import { apiRequest } from './apiClient';
import {
  IInstitution,
  IInstitutionMembership,
  IInstitutionDashboardMetrics,
  IInvitationInfo,
  InstitutionRole,
  InstitutionType,
} from '../types/institution';

export interface CreateInstitutionPayload {
  name: string;
  institutionType: InstitutionType;
  description?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface AddMemberPayload {
  email: string;
  role: InstitutionRole;
  title?: string;
  department?: string;
  name?: string;
  permissions?: string[];
  linkedLearners?: string[];
  status?: 'active' | 'invited';
  notes?: string;
}

export interface UpdateMemberPayload {
  role?: InstitutionRole;
  status?: 'active' | 'invited' | 'suspended';
  title?: string;
  department?: string;
  permissions?: string[];
  linkedLearners?: string[];
  notes?: string;
}

export interface MemberFilters {
  role?: string;
  status?: string;
  search?: string;
}

export const institutionService = {
  createInstitution: async (
    payload: CreateInstitutionPayload
  ): Promise<{ institution: IInstitution; membership: IInstitutionMembership }> => {
    const res = await apiRequest<{
      success: boolean;
      data: { institution: IInstitution; membership: IInstitutionMembership };
    }>('/institutions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  getMyInstitutions: async (): Promise<
    Array<{ institution: IInstitution; membership: IInstitutionMembership }>
  > => {
    const res = await apiRequest<{
      success: boolean;
      data: Array<{ institution: IInstitution; membership: IInstitutionMembership }>;
    }>('/institutions/my');
    return res.data;
  },

  getInstitutionById: async (
    institutionId: string
  ): Promise<{ institution: IInstitution; membership?: IInstitutionMembership }> => {
    const res = await apiRequest<{
      success: boolean;
      data: { institution: IInstitution; membership?: IInstitutionMembership };
    }>(`/institutions/${institutionId}`, {
      headers: {
        'x-institution-id': institutionId,
      },
    });
    return res.data;
  },

  updateInstitution: async (
    institutionId: string,
    payload: Partial<CreateInstitutionPayload>
  ): Promise<IInstitution> => {
    const res = await apiRequest<{ success: boolean; data: IInstitution }>(
      `/institutions/${institutionId}`,
      {
        method: 'PUT',
        headers: {
          'x-institution-id': institutionId,
        },
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  getDashboardMetrics: async (
    institutionId: string
  ): Promise<IInstitutionDashboardMetrics> => {
    const res = await apiRequest<{
      success: boolean;
      data: IInstitutionDashboardMetrics;
    }>(`/institutions/${institutionId}/dashboard`, {
      headers: {
        'x-institution-id': institutionId,
      },
    });
    return res.data;
  },

  getMembers: async (
    institutionId: string,
    filters: MemberFilters = {}
  ): Promise<{ members: IInstitutionMembership[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: IInstitutionMembership[];
      total: number;
    }>(`/institutions/${institutionId}/members${qs}`, {
      headers: {
        'x-institution-id': institutionId,
      },
    });
    return { members: res.data, total: res.total };
  },

  getMemberById: async (
    institutionId: string,
    memberId: string
  ): Promise<IInstitutionMembership> => {
    const res = await apiRequest<{ success: boolean; data: IInstitutionMembership }>(
      `/institutions/${institutionId}/members/${memberId}`,
      {
        headers: {
          'x-institution-id': institutionId,
        },
      }
    );
    return res.data;
  },

  addMember: async (
    institutionId: string,
    payload: AddMemberPayload
  ): Promise<IInstitutionMembership> => {
    const res = await apiRequest<{ success: boolean; data: IInstitutionMembership }>(
      `/institutions/${institutionId}/members`,
      {
        method: 'POST',
        headers: {
          'x-institution-id': institutionId,
        },
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  updateMember: async (
    institutionId: string,
    memberId: string,
    payload: UpdateMemberPayload
  ): Promise<IInstitutionMembership> => {
    const res = await apiRequest<{ success: boolean; data: IInstitutionMembership }>(
      `/institutions/${institutionId}/members/${memberId}`,
      {
        method: 'PUT',
        headers: {
          'x-institution-id': institutionId,
        },
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  removeMember: async (
    institutionId: string,
    memberId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiRequest<{ success: boolean; message: string }>(
      `/institutions/${institutionId}/members/${memberId}`,
      {
        method: 'DELETE',
        headers: {
          'x-institution-id': institutionId,
        },
      }
    );
    return res;
  },

  getInvitationInfo: async (code: string): Promise<IInvitationInfo> => {
    const res = await apiRequest<{ success: boolean; data: IInvitationInfo }>(
      `/institutions/invitation-info/${encodeURIComponent(code)}`
    );
    return res.data;
  },

  acceptInvitation: async (
    invitationCode: string
  ): Promise<{ membership: IInstitutionMembership; institution: IInstitution }> => {
    const res = await apiRequest<{
      success: boolean;
      data: { membership: IInstitutionMembership; institution: IInstitution };
    }>('/institutions/join', {
      method: 'POST',
      body: JSON.stringify({ invitationCode }),
    });
    return res.data;
  },

  revokeInvitation: async (
    institutionId: string,
    memberId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiRequest<{ success: boolean; message: string }>(
      `/institutions/${institutionId}/members/${memberId}/invitation`,
      {
        method: 'DELETE',
        headers: {
          'x-institution-id': institutionId,
        },
      }
    );
    return res;
  },
};

