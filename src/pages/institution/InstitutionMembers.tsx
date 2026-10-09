import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  Edit2,
  Eye,
  X,
  AlertCircle,
  Building2,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  UserCheck,
  KeyRound,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import {
  IInstitution,
  IInstitutionMembership,
  InstitutionRole,
} from '../../types/institution';

interface OutletContextType {
  currentInst: IInstitution | null;
  currentMembership: IInstitutionMembership | null;
  reloadInstitutions: () => Promise<void>;
}

export default function InstitutionMembers() {
  const { currentInst, currentMembership } = useOutletContext<OutletContextType>();

  const [members, setMembers] = useState<IInstitutionMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Invite Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<InstitutionRole>('trainee');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');
  const [inviteMode, setInviteMode] = useState<'active' | 'invited'>('invited');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'manage_members',
  ]);
  const [linkedLearnersInput, setLinkedLearnersInput] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Invitation Success Dialog State
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // View Member Details Drawer State
  const [viewingMember, setViewingMember] = useState<IInstitutionMembership | null>(null);

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<IInstitutionMembership | null>(null);
  const [editRole, setEditRole] = useState<InstitutionRole>('trainee');
  const [editStatus, setEditStatus] = useState<'active' | 'invited' | 'suspended'>('active');
  const [editTitle, setEditTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editLinkedLearners, setEditLinkedLearners] = useState('');

  // Permission evaluation based on current membership
  const isAdmin = currentMembership?.role === 'admin';
  const isSubAdmin = currentMembership?.role === 'subadmin';
  const subAdminCanManage =
    isSubAdmin &&
    Array.isArray(currentMembership?.permissions) &&
    currentMembership.permissions.includes('manage_members');
  const subAdminCanInvite =
    isSubAdmin &&
    Array.isArray(currentMembership?.permissions) &&
    (currentMembership.permissions.includes('manage_members') ||
      currentMembership.permissions.includes('invite_members'));

  const canManageMembers = isAdmin || subAdminCanManage;
  const canInviteMembers = isAdmin || subAdminCanInvite;

  const ownerUserId =
    typeof currentInst?.owner === 'object'
      ? currentInst?.owner?._id
      : currentInst?.owner;

  useEffect(() => {
    if (currentInst) {
      loadMembers();
    }
  }, [currentInst, roleFilter, statusFilter, searchQuery]);

  const loadMembers = async () => {
    if (!currentInst) return;
    try {
      setLoading(true);
      const res = await institutionService.getMembers(currentInst._id, {
        role: roleFilter,
        status: statusFilter,
        search: searchQuery,
      });
      setMembers(res.members || []);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  const isMemberOwner = (member: IInstitutionMembership) => {
    return member.userId?._id === ownerUserId;
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInst) return;
    if (!email.trim()) {
      setModalError('Member email is required.');
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);

      const payloadLearners =
        role === 'parent' && linkedLearnersInput.trim()
          ? linkedLearnersInput
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

      const created = await institutionService.addMember(currentInst._id, {
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
        role,
        title: title.trim() || undefined,
        department: department.trim() || undefined,
        notes: notes.trim() || undefined,
        status: inviteMode,
        permissions: role === 'subadmin' ? selectedPermissions : undefined,
        linkedLearners: payloadLearners,
      });

      // Reset form fields
      setEmail('');
      setName('');
      setTitle('');
      setDepartment('');
      setNotes('');
      setLinkedLearnersInput('');
      setIsAddModalOpen(false);

      if (created.invitationCode) {
        setCreatedInviteCode(created.invitationCode);
      }

      await loadMembers();
    } catch (err: any) {
      setModalError(err.message || 'Failed to add member.');
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = (member: IInstitutionMembership) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditTitle(member.title || '');
    setEditDepartment(member.department || '');
    setEditNotes(member.notes || '');
    setEditPermissions(member.permissions || ['manage_members']);
    const learnerIds =
      member.linkedLearners && Array.isArray(member.linkedLearners)
        ? member.linkedLearners.map((l: any) => l._id || l).join(', ')
        : '';
    setEditLinkedLearners(learnerIds);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInst || !editingMember) return;

    try {
      setModalLoading(true);
      const payloadLearners =
        editRole === 'parent' && editLinkedLearners.trim()
          ? editLinkedLearners
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

      await institutionService.updateMember(currentInst._id, editingMember._id, {
        role: editRole,
        status: editStatus,
        title: editTitle.trim() || undefined,
        department: editDepartment.trim() || undefined,
        notes: editNotes.trim() || undefined,
        permissions: editRole === 'subadmin' ? editPermissions : undefined,
        linkedLearners: payloadLearners,
      });

      setEditingMember(null);
      await loadMembers();
      if (viewingMember && viewingMember._id === editingMember._id) {
        const refreshed = await institutionService.getMemberById(
          currentInst._id,
          editingMember._id
        );
        setViewingMember(refreshed);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update member.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (member: IInstitutionMembership) => {
    if (!currentInst) return;
    if (isMemberOwner(member)) {
      alert('The institution owner cannot be suspended or deactivated.');
      return;
    }

    const nextStatus = member.status === 'active' ? 'suspended' : 'active';
    const actionText = nextStatus === 'suspended' ? 'suspend' : 'activate';

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} ${member.userId?.name || member.userId?.email}?`
      )
    ) {
      return;
    }

    try {
      await institutionService.updateMember(currentInst._id, member._id, {
        status: nextStatus,
      });
      await loadMembers();
      if (viewingMember && viewingMember._id === member._id) {
        const refreshed = await institutionService.getMemberById(
          currentInst._id,
          member._id
        );
        setViewingMember(refreshed);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to change member status.');
    }
  };

  const handleRemoveMember = async (member: IInstitutionMembership) => {
    if (!currentInst) return;
    if (isMemberOwner(member)) {
      alert('Security Protection: The institution owner cannot be removed.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${member.userId?.name || member.userId?.email} from ${currentInst.name}?`
    );
    if (!confirmDelete) return;

    try {
      await institutionService.removeMember(currentInst._id, member._id);
      if (viewingMember && viewingMember._id === member._id) {
        setViewingMember(null);
      }
      await loadMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  const getRoleBadgeClass = (r: string) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'subadmin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'trainer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'parent':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'trainee':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        );
      case 'invited':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" />
            Invited
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50/80 px-2.5 py-0.5 rounded-full border border-rose-200">
            <Ban className="w-3 h-3" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-slate-500 capitalize">
            {status}
          </span>
        );
    }
  };

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const inviteUrl = createdInviteCode
    ? `${window.location.origin}/institution/join?code=${createdInviteCode}`
    : '';

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Institution Members
            </h1>
            <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrators, instructors, trainees, and parents in {currentInst?.name}
          </p>
        </div>

        {canInviteMembers && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add / Invite Member</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'admin', label: 'Admins' },
              { id: 'subadmin', label: 'Sub-Admins' },
              { id: 'trainer', label: 'Trainers' },
              { id: 'trainee', label: 'Trainees' },
              { id: 'parent', label: 'Parents' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  roleFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Institution Role</th>
                <th className="px-6 py-3.5">Title / Designation</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.length > 0 ? (
                members.map((member) => {
                  const user = member.userId;
                  const isOwner = isMemberOwner(member);
                  const isMemberAdmin = member.role === 'admin';
                  const canEditThisMember =
                    isAdmin || (subAdminCanManage && !isMemberAdmin && !isOwner);

                  return (
                    <tr
                      key={member._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">
                                {user?.name || 'Unnamed Member'}
                              </span>
                              {isOwner && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.2 rounded border border-amber-300">
                                  OWNER
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 font-medium text-[11px]">
                              {user?.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getRoleBadgeClass(
                            member.role
                          )}`}
                        >
                          {member.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {member.title || '—'}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {member.department || '—'}
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(member.status)}</td>

                      <td className="px-6 py-4 text-slate-400">
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString()
                          : member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString()
                          : '—'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setViewingMember(member)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Member Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          {canEditThisMember && (
                            <button
                              onClick={() => openEditModal(member)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Member Role / Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Toggle Status (Active / Suspended) */}
                          {canEditThisMember && !isOwner && (
                            <button
                              onClick={() => handleToggleStatus(member)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                member.status === 'active'
                                  ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={
                                member.status === 'active'
                                  ? 'Suspend Membership'
                                  : 'Activate Membership'
                              }
                            >
                              {member.status === 'active' ? (
                                <Ban className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Remove */}
                          {canEditThisMember && !isOwner && (
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading institution members...</span>
                      </div>
                    ) : (
                      'No institution members found matching criteria.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Drawer */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm border border-blue-100">
                  {(viewingMember.userId?.name || viewingMember.userId?.email || 'M')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {viewingMember.userId?.name || 'Unnamed Member'}
                  </h2>
                  <p className="text-xs text-slate-500">{viewingMember.userId?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Role</span>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-bold border capitalize ${getRoleBadgeClass(
                      viewingMember.role
                    )}`}
                  >
                    {viewingMember.role}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Status</span>
                  <div className="mt-1">{getStatusBadge(viewingMember.status)}</div>
                </div>
              </div>

              {viewingMember.title && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Title / Designation</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                    {viewingMember.title}
                  </span>
                </div>
              )}

              {viewingMember.department && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Department</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                    {viewingMember.department}
                  </span>
                </div>
              )}

              {/* Sub-Admin Permissions */}
              {viewingMember.role === 'subadmin' && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-slate-500 font-bold block text-[11px]">
                    Sub-Admin Privileges
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMember.permissions && viewingMember.permissions.length > 0 ? (
                      viewingMember.permissions.map((p) => (
                        <span
                          key={p}
                          className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md font-medium text-[11px]"
                        >
                          {p.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">No special permissions granted</span>
                    )}
                  </div>
                </div>
              )}

              {/* Parent Linked Learners */}
              {viewingMember.role === 'parent' && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-slate-500 font-bold block text-[11px]">
                    Linked Learners
                  </span>
                  {viewingMember.linkedLearners && viewingMember.linkedLearners.length > 0 ? (
                    <div className="space-y-1.5">
                      {viewingMember.linkedLearners.map((learner: any) => (
                        <div
                          key={learner._id || learner}
                          className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80"
                        >
                          <span className="font-medium text-slate-800">
                            {learner.name || learner.email || learner}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {learner.email || learner._id || learner}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No linked learners assigned</span>
                  )}
                </div>
              )}

              {/* Invitation Code if invited */}
              {viewingMember.invitationCode && (
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 font-bold text-[11px]">
                      Pending Invitation Code
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/institution/join?code=${viewingMember.invitationCode}`,
                          true
                        )
                      }
                      className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200 font-mono text-center text-xs font-bold text-amber-900 tracking-wider">
                    {viewingMember.invitationCode}
                  </div>
                </div>
              )}

              {viewingMember.notes && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Notes</span>
                  <p className="text-slate-700 text-xs mt-0.5">{viewingMember.notes}</p>
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 space-y-1">
                <div>
                  Joined:{' '}
                  {viewingMember.joinedAt
                    ? new Date(viewingMember.joinedAt).toLocaleString()
                    : 'Pending Acceptance'}
                </div>
                <div>Record Created: {new Date(viewingMember.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setViewingMember(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Close
              </button>

              {canManageMembers && !isMemberOwner(viewingMember) && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const memberToEdit = viewingMember;
                      setViewingMember(null);
                      openEditModal(memberToEdit);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Invite Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Add / Invite Member</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  User Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="member@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as InstitutionRole)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-white capitalize"
                >
                  <option value="trainee">Trainee / Student</option>
                  <option value="trainer">Trainer / Instructor</option>
                  <option value="subadmin">Sub-Administrator</option>
                  <option value="parent">Parent / Guardian</option>
                  {isAdmin && <option value="admin">Administrator</option>}
                </select>
              </div>

              {/* Sub-Admin Permissions Selection */}
              {role === 'subadmin' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Sub-Admin Permissions
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'manage_members', label: 'Manage Members & Roles' },
                      { id: 'invite_members', label: 'Create Member Invitations' },
                      { id: 'view_reports', label: 'View Institution Reports' },
                    ].map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, perm.id]);
                            } else {
                              setSelectedPermissions(
                                selectedPermissions.filter((p) => p !== perm.id)
                              );
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Parent Linked Learners Input */}
              {role === 'parent' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Linked Learner IDs (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 64b1f..., 64b2c..."
                    value={linkedLearnersInput}
                    onChange={(e) => setLinkedLearnersInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Parents only have access to view linked learner progress and data.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Trainer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. IT Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional internal notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Invite Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enrollment Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteMode('invited')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      inviteMode === 'invited'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Generate Invitation
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteMode('active')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      inviteMode === 'active'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Direct Active Member
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={modalLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {modalLoading
                    ? 'Processing...'
                    : inviteMode === 'invited'
                    ? 'Create Invitation'
                    : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invitation Created Dialog */}
      {createdInviteCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Invitation Created Successfully!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Since external email delivery is not configured, share this code or direct link with the member.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-left">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Invitation Code:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                    {createdInviteCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdInviteCode, false)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">Direct Join Link:</span>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="bg-white text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 w-full text-slate-700 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteUrl, true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setCreatedInviteCode(null);
                setCopiedCode(false);
                setCopiedLink(false);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Edit Member Details
              </h2>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Member
                </label>
                <input
                  type="text"
                  disabled
                  value={`${editingMember.userId?.name || 'Unnamed'} (${editingMember.userId?.email})`}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution Role
                </label>
                <select
                  value={editRole}
                  disabled={isMemberOwner(editingMember)}
                  onChange={(e) => setEditRole(e.target.value as InstitutionRole)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-white capitalize disabled:bg-slate-100"
                >
                  <option value="trainee">Trainee / Student</option>
                  <option value="trainer">Trainer / Instructor</option>
                  <option value="subadmin">Sub-Administrator</option>
                  <option value="parent">Parent / Guardian</option>
                  {isAdmin && <option value="admin">Administrator</option>}
                </select>
                {isMemberOwner(editingMember) && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1">
                    Institution owner cannot be demoted.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  disabled={isMemberOwner(editingMember)}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-white capitalize disabled:bg-slate-100"
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="suspended">Suspended</option>
                </select>
                {isMemberOwner(editingMember) && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1">
                    Institution owner cannot be suspended.
                  </p>
                )}
              </div>

              {/* Sub-Admin Permissions Checkboxes */}
              {editRole === 'subadmin' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Sub-Admin Permissions
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'manage_members', label: 'Manage Members & Roles' },
                      { id: 'invite_members', label: 'Create Member Invitations' },
                      { id: 'view_reports', label: 'View Institution Reports' },
                    ].map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={editPermissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditPermissions([...editPermissions, perm.id]);
                            } else {
                              setEditPermissions(
                                editPermissions.filter((p) => p !== perm.id)
                              );
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Parent Linked Learners Input */}
              {editRole === 'parent' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Linked Learner IDs (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 64b1f..., 64b2c..."
                    value={editLinkedLearners}
                    onChange={(e) => setEditLinkedLearners(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Trainer"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. IT Department"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional internal notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  disabled={modalLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
