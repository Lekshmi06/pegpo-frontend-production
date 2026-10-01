import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FolderKanban,
  Send,
  Trash2,
  Check,
  Clock,
  Sparkles,
  FileText,
  Eye,
  Edit3,
  BookOpen,
  ArrowRight,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import { researcherProfileService } from '../../services/researcherProfileService';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';
import {
  CollaborationRole,
  ProjectTeamMember,
  CollaborationInvite,
  ManuscriptComment,
  Manuscript,
} from '../../types/research';

const ROLE_DEFINITIONS: Record<
  CollaborationRole | 'owner',
  { label: string; badgeClass: string; description: string; permissions: string[] }
> = {
  owner: {
    label: 'Owner',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: 'Project founder and principal investigator. Has full authority over manuscript, membership, roles, and project lifecycle.',
    permissions: ['Full project CRUD', 'Invite & remove members', 'Assign roles', 'Draft & finalize manuscript', 'Query AI Copilot'],
  },
  co_author: {
    label: 'Co-Author',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'Key research collaborator with co-authorship. Can write sections, add literature and notes, invite peers, and use AI tools.',
    permissions: ['Draft & edit manuscript', 'Add research notes & papers', 'Invite collaborators', 'Query AI Copilot'],
  },
  contributor: {
    label: 'Contributor',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Research assistant or specialist. Can contribute evidence, notes, and manuscript drafts, but cannot manage team members.',
    permissions: ['Draft manuscript sections', 'Add research notes & literature', 'Leave review comments', 'Read-only team list'],
  },
  reviewer: {
    label: 'Peer Reviewer',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Advisory or internal peer reviewer. Can examine manuscripts and literature, annotate claims, and critique drafts without editing rights.',
    permissions: ['Annotate manuscript sections', 'Comment on hypotheses', 'Examine evidence repository', 'No manuscript editing'],
  },
  viewer: {
    label: 'Viewer',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    description: 'Read-only observer or institutional stakeholder. Can read documents and progress tracking.',
    permissions: ['Read-only literature & notes', 'Read-only manuscript draft', 'No commenting or editing rights'],
  },
};

export default function Collaboration() {
  const { activeProject, activeProjectId, allProjects, setActiveProjectId } = useResearchActiveProject();
  const currentProfileId = researcherProfileService.getProfileId();

  // Active view tab: 'team' | 'invitations' | 'reviews'
  const [activeTab, setActiveTab] = useState<'team' | 'invitations' | 'reviews'>('team');

  // Team & Project State
  const [teamMembers, setTeamMembers] = useState<{
    projectId?: string;
    currentUserRole?: 'owner' | CollaborationRole;
    owner: any;
    collaborators: ProjectTeamMember[];
  }>({
    owner: null,
    collaborators: [],
  });
  const [loadingTeam, setLoadingTeam] = useState<boolean>(false);
  const [teamError, setTeamError] = useState<string | null>(null);

  // Invitations State
  const [incomingInvites, setIncomingInvites] = useState<CollaborationInvite[]>([]);
  const [outgoingInvites, setOutgoingInvites] = useState<CollaborationInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState<boolean>(false);

  // Peer Review & Comments State
  const [projectManuscripts, setProjectManuscripts] = useState<Manuscript[]>([]);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>('');
  const [comments, setComments] = useState<ManuscriptComment[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [commentFilter, setCommentFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  // Modals & Forms
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<CollaborationRole>('co_author');
  const [inviteMessage, setInviteMessage] = useState<string>('');
  const [inviting, setInviting] = useState<boolean>(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Comment Modal
  const [showAddCommentModal, setShowAddCommentModal] = useState<boolean>(false);
  const [newCommentContent, setNewCommentContent] = useState<string>('');
  const [newCommentQuote, setNewCommentQuote] = useState<string>('');
  const [postingComment, setPostingComment] = useState<boolean>(false);

  // Action status toast
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Helper to extract string ID from an ObjectId, string, or populated object
  const getEntityId = (entity: any): string | null => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity.trim();
    if (entity._id) return String(entity._id).trim();
    if (entity.id) return String(entity.id).trim();
    return String(entity).trim();
  };

  // Determine current user's role on the active project
  // Owner must NEVER fall through to viewer.
  const currentUserRole = useMemo<CollaborationRole | 'owner' | null>(() => {
    // 1. Authoritative server response: if server resolved and returned role for this project
    if (teamMembers.currentUserRole && (!teamMembers.projectId || teamMembers.projectId === activeProjectId)) {
      return teamMembers.currentUserRole;
    }

    if (!activeProject || !currentProfileId) {
      return teamMembers.currentUserRole || null;
    }

    const authenticatedResearcherId = String(currentProfileId).trim().toLowerCase();

    // Check project.ownerId (from activeProject or from teamMembers.owner)
    const projectOwnerId =
      getEntityId((activeProject as any)?.ownerId) ||
      getEntityId(teamMembers.owner);

    if (projectOwnerId && projectOwnerId.toLowerCase() === authenticatedResearcherId) {
      return 'owner';
    }

    // Check project.collaborators
    const collabs = teamMembers.collaborators.length > 0
      ? teamMembers.collaborators
      : (activeProject as any)?.collaborators || [];

    const collaborator = collabs.find((c: any) => {
      const cId = getEntityId(c.researcherId);
      return cId && cId.toLowerCase() === authenticatedResearcherId;
    });

    if (collaborator) {
      return collaborator.role;
    }

    // Fallback to server-resolved role if available
    if (teamMembers.currentUserRole) {
      return teamMembers.currentUserRole;
    }

    // The owner must NEVER fall through to viewer. If not owner and not collaborator, return null.
    return null;
  }, [activeProject, currentProfileId, teamMembers, activeProjectId]);

  const isOwner = currentUserRole === 'owner';
  const canManageTeam = isOwner || currentUserRole === 'co_author';
  const canComment = currentUserRole !== null && currentUserRole !== 'viewer';

  // Load team members whenever activeProjectId changes
  const loadTeam = async (projId: string) => {
    if (!projId) return;
    try {
      setLoadingTeam(true);
      setTeamError(null);
      const res = await researchService.getProjectCollaborators(projId);
      // Verify that active project ID from frontend matches the project being queried
      if (res && (!res.projectId || res.projectId === projId)) {
        setTeamMembers(res);
      }
    } catch (err: any) {
      setTeamError(err?.message || 'Failed to load team members');
    } finally {
      setLoadingTeam(false);
    }
  };

  // Load incoming & outgoing invitations
  const loadInvitations = async () => {
    try {
      setLoadingInvites(true);
      const [incoming, outgoing] = await Promise.all([
        researchService.getIncomingInvitations().catch(() => []),
        researchService.getOutgoingInvitations(activeProjectId || undefined).catch(() => []),
      ]);
      setIncomingInvites(incoming);
      setOutgoingInvites(outgoing);
    } catch (err) {
      console.error('Failed to load invitations:', err);
    } finally {
      setLoadingInvites(false);
    }
  };

  // Load manuscripts & review comments for selected project
  const loadManuscriptsAndComments = async (projId: string) => {
    if (!projId) return;
    try {
      setLoadingComments(true);
      const manuscripts = await researchService.listManuscripts(projId);
      setProjectManuscripts(manuscripts);
      if (manuscripts.length > 0) {
        const firstId = manuscripts[0]._id || '';
        const targetId = selectedManuscriptId && manuscripts.some((m: Manuscript) => m._id === selectedManuscriptId)
          ? selectedManuscriptId
          : firstId;
        setSelectedManuscriptId(targetId);
        if (targetId) {
          const comms = await researchService.getManuscriptComments(targetId);
          setComments(comms);
        }
      } else {
        setSelectedManuscriptId('');
        setComments([]);
      }
    } catch (err) {
      console.error('Failed to load review comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      loadTeam(activeProjectId);
      loadManuscriptsAndComments(activeProjectId);
      // Direct server-side role check for immediate synchronization
      researchService.getProjectRole(activeProjectId).then((roleRes) => {
        if (roleRes?.hasAccess && roleRes.role && (!roleRes.projectId || roleRes.projectId === activeProjectId)) {
          setTeamMembers((prev) => ({
            ...prev,
            projectId: roleRes.projectId,
            currentUserRole: roleRes.role as any,
          }));
        }
      }).catch(() => {});
    }
    loadInvitations();
  }, [activeProjectId]);

  // Handle Manuscript selection change
  const handleManuscriptSelect = async (mId: string) => {
    setSelectedManuscriptId(mId);
    try {
      setLoadingComments(true);
      const comms = await researchService.getManuscriptComments(mId);
      setComments(comms);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Send Invitation
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId || !inviteEmail.trim()) return;

    try {
      setInviting(true);
      setInviteFeedback(null);
      await researchService.inviteCollaborator(
        activeProjectId,
        inviteEmail.trim(),
        inviteRole,
        inviteMessage.trim() || undefined
      );

      setInviteFeedback({
        type: 'success',
        message: `Invitation successfully dispatched to ${inviteEmail}`,
      });
      setInviteEmail('');
      setInviteMessage('');
      loadInvitations();
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteFeedback(null);
      }, 1500);
    } catch (err: any) {
      setInviteFeedback({
        type: 'error',
        message: err?.message || 'Failed to dispatch invitation',
      });
    } finally {
      setInviting(false);
    }
  };

  // Respond to invitation (Accept/Decline)
  const handleRespondInvite = async (inviteId: string, action: 'accept' | 'decline') => {
    try {
      await researchService.respondToInvitation(inviteId, action);
      showNotice(`Invitation ${action === 'accept' ? 'accepted! You are now part of the project.' : 'declined.'}`);
      loadInvitations();
      if (action === 'accept' && activeProjectId) {
        loadTeam(activeProjectId);
      }
    } catch (err: any) {
      showNotice(err?.message || `Failed to ${action} invitation`, 'error');
    }
  };

  // Revoke invitation
  const handleRevokeInvite = async (inviteId: string) => {
    if (!window.confirm('Are you sure you want to revoke this pending invitation?')) return;
    try {
      await researchService.revokeInvitation(inviteId);
      showNotice('Invitation revoked.');
      loadInvitations();
    } catch (err: any) {
      showNotice(err?.message || 'Failed to revoke invitation', 'error');
    }
  };

  // Change collaborator role
  const handleRoleChange = async (targetResearcherId: string, newRole: CollaborationRole) => {
    if (!activeProjectId) return;
    try {
      await researchService.updateCollaboratorRole(activeProjectId, targetResearcherId, newRole);
      showNotice('Collaborator role updated successfully.');
      loadTeam(activeProjectId);
    } catch (err: any) {
      showNotice(err?.message || 'Failed to update role', 'error');
    }
  };

  // Remove collaborator or leave project
  const handleRemoveMember = async (targetResearcherId: string, isSelf: boolean) => {
    if (!activeProjectId) return;
    const confirmMsg = isSelf
      ? 'Are you sure you want to leave this project? You will immediately lose access to private documents.'
      : 'Are you sure you want to remove this collaborator from the team?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await researchService.removeCollaborator(activeProjectId, targetResearcherId);
      showNotice(isSelf ? 'You have left the project.' : 'Collaborator removed.');
      loadTeam(activeProjectId);
    } catch (err: any) {
      showNotice(err?.message || 'Failed to remove member', 'error');
    }
  };

  // Post peer review comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManuscriptId || !newCommentContent.trim()) return;

    try {
      setPostingComment(true);
      await researchService.addManuscriptComment(
        selectedManuscriptId,
        newCommentContent.trim(),
        undefined,
        newCommentQuote.trim() || undefined
      );
      setNewCommentContent('');
      setNewCommentQuote('');
      setShowAddCommentModal(false);
      showNotice('Peer critique / annotation added.');
      const comms = await researchService.getManuscriptComments(selectedManuscriptId);
      setComments(comms);
    } catch (err: any) {
      showNotice(err?.message || 'Failed to post comment', 'error');
    } finally {
      setPostingComment(false);
    }
  };

  // Reply to comment thread
  const handleReplyToComment = async (commentId: string) => {
    const text = replyTextMap[commentId]?.trim();
    if (!text) return;

    try {
      setSubmittingReply(commentId);
      await researchService.replyToComment(commentId, text);
      setReplyTextMap((prev) => ({ ...prev, [commentId]: '' }));
      showNotice('Reply posted.');
      const comms = await researchService.getManuscriptComments(selectedManuscriptId);
      setComments(comms);
    } catch (err: any) {
      showNotice(err?.message || 'Failed to post reply', 'error');
    } finally {
      setSubmittingReply(null);
    }
  };

  // Resolve comment
  const handleResolveComment = async (commentId: string) => {
    try {
      await researchService.resolveComment(commentId);
      showNotice('Comment thread marked resolved.');
      const comms = await researchService.getManuscriptComments(selectedManuscriptId);
      setComments(comms);
    } catch (err: any) {
      showNotice(err?.message || 'Failed to resolve comment', 'error');
    }
  };

  // Filtered comments
  const filteredComments = useMemo(() => {
    if (commentFilter === 'all') return comments;
    return comments.filter((c) => c.status === commentFilter);
  }, [comments, commentFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {actionNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-2 text-sm font-medium transition-all ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Users className="w-4 h-4" />
              <span>Multi-Author Workspace & Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Peer Collaboration & Co-Authoring
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Collaborate securely across institutional boundaries. Manage author roles, co-draft manuscripts,
              and coordinate peer review annotations with granular role permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canManageTeam && (
              <button
                id="btn-invite-collaborator"
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Collaborator</span>
              </button>
            )}

            <Link
              to="/research/write"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Writing Workspace</span>
            </Link>
          </div>
        </div>

        {/* Project Selector Bar */}
        <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Selected Research Project</div>
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{activeProject?.title || 'No Project Selected'}</span>
                {currentUserRole && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      ROLE_DEFINITIONS[currentUserRole]?.badgeClass || ''
                    }`}
                  >
                    Your Role: {ROLE_DEFINITIONS[currentUserRole]?.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="project-selector" className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Switch Project:
            </label>
            <select
              id="project-selector"
              value={activeProjectId || ''}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="mt-6 flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'team'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team & Permissions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {(teamMembers.owner ? 1 : 0) + teamMembers.collaborators.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'invitations'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Invitations</span>
            {incomingInvites.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold">
                {incomingInvites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Peer Review & Discussions</span>
            {comments.filter((c) => c.status === 'open').length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                {comments.filter((c) => c.status === 'open').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* ========================================================= */}
        {/* TAB 1: TEAM MEMBERS & PERMISSIONS */}
        {/* ========================================================= */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Role Definitions Guide Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['co_author', 'contributor', 'reviewer', 'viewer'] as CollaborationRole[]).map((r) => {
                const info = ROLE_DEFINITIONS[r];
                return (
                  <div
                    key={r}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${info.badgeClass}`}>
                          {info.label}
                        </span>
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                        {info.description}
                      </p>
                    </div>
                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      {info.permissions.slice(0, 2).map((perm, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Team Roster */}
            <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Research Team Roster</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Governed members with authenticated access to project literature, notes, and manuscript drafts.
                  </p>
                </div>
                {canManageTeam && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                )}
              </div>

              {loadingTeam ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  <p className="text-sm">Loading project team members...</p>
                </div>
              ) : teamError ? (
                <div className="p-6 text-center text-rose-500">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{teamError}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {/* Lead PI / Owner Card */}
                  {teamMembers.owner && (
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {teamMembers.owner.fullName
                            ? teamMembers.owner.fullName.charAt(0).toUpperCase()
                            : 'PI'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                              {teamMembers.owner.fullName || 'Lead Principal Investigator'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                              Lead PI (Owner)
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {teamMembers.owner.contact?.email || 'Project Creator'}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 italic">Project Founder • Permanent Owner</div>
                    </div>
                  )}

                  {/* Collaborators List */}
                  {teamMembers.collaborators.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        No external collaborators yet.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Invite co-authors, contributors, or reviewers to co-author this paper.
                      </p>
                      {canManageTeam && (
                        <button
                          onClick={() => setShowInviteModal(true)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Invite Peer Collaborator</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    teamMembers.collaborators.map((member, idx) => {
                      const memberId = getEntityId(member.researcherId) || `member-${idx}`;
                      const isSelf = Boolean(
                        memberId &&
                          currentProfileId &&
                          memberId.toLowerCase() === String(currentProfileId).trim().toLowerCase()
                      );
                      const memberName =
                        (member as any)?.researcherId?.fullName || member.fullName || 'Collaborator';
                      const memberEmail =
                        (member as any)?.researcherId?.contact?.email || member.email || '';

                      return (
                        <div
                          key={memberId}
                          className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm">
                              {memberName ? memberName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                  {memberName}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{memberEmail}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Role selector: Editable if owner, badge if not */}
                            {isOwner ? (
                              <select
                                value={member.role}
                                onChange={(e) =>
                                  handleRoleChange(memberId, e.target.value as CollaborationRole)
                                }
                                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="co_author">Co-Author</option>
                                <option value="contributor">Contributor</option>
                                <option value="reviewer">Peer Reviewer</option>
                                <option value="viewer">Viewer</option>
                              </select>
                            ) : (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                  ROLE_DEFINITIONS[member.role]?.badgeClass || ''
                                }`}
                              >
                                {ROLE_DEFINITIONS[member.role]?.label}
                              </span>
                            )}

                            {/* Actions: Owner can remove, Collaborator can leave */}
                            {isOwner && (
                              <button
                                onClick={() => handleRemoveMember(memberId, false)}
                                title="Remove Collaborator"
                                className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            {isSelf && !isOwner && (
                              <button
                                onClick={() => handleRemoveMember(memberId, true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Leave Project</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: INVITATIONS */}
        {/* ========================================================= */}
        {activeTab === 'invitations' && (
          <div className="space-y-8">
            {/* Incoming Invitations Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Incoming Invitations ({incomingInvites.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invitations extended to you by other research teams.
                  </p>
                </div>
                <button
                  onClick={loadInvitations}
                  className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingInvites ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {incomingInvites.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    No pending incoming invitations.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    When another researcher invites you to join their project, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incomingInvites.map((invite) => {
                    const projectObj = typeof invite.projectId === 'object' ? invite.projectId : null;
                    const inviterObj = typeof invite.inviterId === 'object' ? invite.inviterId : null;
                    return (
                      <div
                        key={invite._id}
                        className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                                  ROLE_DEFINITIONS[invite.role]?.badgeClass || ''
                                }`}
                              >
                                Role: {ROLE_DEFINITIONS[invite.role]?.label}
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                                {projectObj?.title || 'Research Project'}
                              </h3>
                              {projectObj?.domain && (
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                  {projectObj.domain}
                                </p>
                              )}
                            </div>
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-400 my-2">
                            Invited by <strong className="text-slate-800 dark:text-slate-200">{inviterObj?.fullName || 'Project PI'}</strong>
                            {inviterObj?.contact?.email && ` (${inviterObj.contact.email})`}
                          </div>

                          {invite.message && (
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic mb-4">
                              "{invite.message}"
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleRespondInvite(invite._id, 'accept')}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRespondInvite(invite._id, 'decline')}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Outgoing Invitations Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Pending Outgoing Invitations ({outgoingInvites.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track invitations sent to co-authors and reviewers that are awaiting response.
                  </p>
                </div>
                {canManageTeam && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite Peer</span>
                  </button>
                )}
              </div>

              {outgoingInvites.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    No active outgoing invitations.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Use the "Invite Collaborator" button to recruit research partners.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {outgoingInvites.map((invite) => {
                    const projectObj = typeof invite.projectId === 'object' ? invite.projectId : null;
                    return (
                      <div
                        key={invite._id}
                        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                              {invite.inviteeEmail}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                                ROLE_DEFINITIONS[invite.role]?.badgeClass || ''
                              }`}
                            >
                              {ROLE_DEFINITIONS[invite.role]?.label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Target Project: <span className="font-medium">{projectObj?.title || 'Current Project'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleRevokeInvite(invite._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PEER REVIEW & DISCUSSIONS */}
        {/* ========================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Manuscript Picker & Filter Bar */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Review Manuscript</div>
                  {projectManuscripts.length === 0 ? (
                    <span className="text-xs text-slate-400">No manuscripts in this project yet</span>
                  ) : (
                    <select
                      value={selectedManuscriptId}
                      onChange={(e) => handleManuscriptSelect(e.target.value)}
                      className="text-sm font-semibold bg-transparent text-slate-900 dark:text-white border-none p-0 focus:outline-none cursor-pointer"
                    >
                      {projectManuscripts.map((m) => (
                        <option key={m._id} value={m._id} className="dark:bg-slate-900">
                          {m.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  <button
                    onClick={() => setCommentFilter('open')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      commentFilter === 'open'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setCommentFilter('resolved')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      commentFilter === 'resolved'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Resolved
                  </button>
                  <button
                    onClick={() => setCommentFilter('all')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      commentFilter === 'all'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    All
                  </button>
                </div>

                {canComment && selectedManuscriptId && (
                  <button
                    onClick={() => setShowAddCommentModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Add Critique</span>
                  </button>
                )}
              </div>
            </div>

            {/* Comments Thread List */}
            {loadingComments ? (
              <div className="p-8 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <p className="text-sm">Loading review comments...</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No review annotations {commentFilter !== 'all' ? `marked as ${commentFilter}` : 'found'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Reviewers and co-authors can annotate manuscript sections with critiques, questions, and evidence requests.
                </p>
                {canComment && selectedManuscriptId && (
                  <button
                    onClick={() => setShowAddCommentModal(true)}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Add First Critique</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((comment) => {
                  const authorObj = typeof comment.authorId === 'object' ? comment.authorId : null;
                  const isResolved = comment.status === 'resolved';
                  const replyText = replyTextMap[comment._id] || '';

                  return (
                    <div
                      key={comment._id}
                      className={`p-5 rounded-xl border bg-white dark:bg-slate-800/90 shadow-sm transition-all ${
                        isResolved
                          ? 'border-emerald-200 dark:border-emerald-950/60 opacity-80'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {/* Comment Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                            {authorObj?.fullName ? authorObj.fullName.charAt(0).toUpperCase() : 'R'}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-white">
                              {authorObj?.fullName || 'Peer Reviewer'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300'
                            }`}
                          >
                            {isResolved ? 'Resolved' : 'Needs Review'}
                          </span>

                          {!isResolved && canComment && (
                            <button
                              onClick={() => handleResolveComment(comment._id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Resolve</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quoted / Highlighted Text */}
                      {comment.highlightedText && (
                        <div className="mb-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500 text-xs text-amber-900 dark:text-amber-200 italic">
                          "{comment.highlightedText}"
                        </div>
                      )}

                      {/* Comment Body */}
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap mb-4">
                        {comment.content}
                      </p>

                      {/* Discussion Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-3 mb-3">
                          {comment.replies.map((reply, idx) => {
                            const replyAuthor = typeof reply.authorId === 'object' ? reply.authorId : null;
                            return (
                              <div key={idx} className="text-xs">
                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                  <span>{replyAuthor?.fullName || 'Collaborator'}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{reply.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Inline Reply Box */}
                      {canComment && !isResolved && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Write a reply or address this critique..."
                            value={replyText}
                            onChange={(e) =>
                              setReplyTextMap((prev) => ({ ...prev, [comment._id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleReplyToComment(comment._id);
                            }}
                            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => handleReplyToComment(comment._id)}
                            disabled={!replyText.trim() || submittingReply === comment._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Reply</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: INVITE COLLABORATOR */}
      {/* ========================================================= */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Invite Research Collaborator</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target Project: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeProject?.title}</span>
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {inviteFeedback && (
              <div
                className={`p-3 rounded-lg mb-4 text-xs font-medium flex items-center gap-2 ${
                  inviteFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {inviteFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>{inviteFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Collaborator Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. colleague@university.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Collaboration Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['co_author', 'contributor', 'reviewer', 'viewer'] as CollaborationRole[]).map((r) => {
                    const info = ROLE_DEFINITIONS[r];
                    const isSelected = inviteRole === r;
                    return (
                      <div
                        key={r}
                        onClick={() => setInviteRole(r)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{info.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {info.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Invitation Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Would love your insights on our methodology section!"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {inviting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{inviting ? 'Dispatching...' : 'Send Invitation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD CRITIQUE / REVIEW NOTE */}
      {/* ========================================================= */}
      {showAddCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Add Peer Critique or Annotation</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: {projectManuscripts.find((m) => m._id === selectedManuscriptId)?.title || 'Manuscript'}
                </p>
              </div>
              <button
                onClick={() => setShowAddCommentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostComment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Referenced Manuscript Claim / Excerpt (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. In Section 3.2: 'Accuracy improved by 14%'"
                  value={newCommentQuote}
                  onChange={(e) => setNewCommentQuote(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Peer Review Critique / Question *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="State your observation, methodological critique, or request for additional empirical baselines..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddCommentModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingComment || !newCommentContent.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {postingComment ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{postingComment ? 'Posting...' : 'Post Critique'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
