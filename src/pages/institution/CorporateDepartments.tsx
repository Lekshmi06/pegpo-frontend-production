import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Building2,
  Plus,
  Users,
  Layers,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import {
  IInstitution,
  IInstitutionMembership,
  IDepartment,
} from '../../types/institution';

interface OutletContextType {
  currentInst: IInstitution | null;
  currentMembership: IInstitutionMembership | null;
  reloadInstitutions: () => Promise<void>;
}

export default function CorporateDepartments() {
  const { currentInst, currentMembership } = useOutletContext<OutletContextType>();

  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [members, setMembers] = useState<IInstitutionMembership[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<IDepartment | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamsInput, setTeamsInput] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canManage =
    currentMembership?.role === 'admin' ||
    (currentMembership?.role === 'subadmin' &&
      Array.isArray(currentMembership?.permissions) &&
      (currentMembership.permissions.includes('manage_employees') ||
        currentMembership.permissions.includes('manage_members') ||
        currentMembership.permissions.includes('manage_departments')));

  useEffect(() => {
    if (currentInst) {
      loadData();
    }
  }, [currentInst]);

  const loadData = async () => {
    if (!currentInst) return;
    try {
      setLoading(true);
      const [deptList, memberRes] = await Promise.all([
        institutionService.getDepartments(currentInst._id),
        institutionService.getMembers(currentInst._id, { status: 'active' }),
      ]);
      setDepartments(deptList || []);
      setMembers(memberRes.members || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setTeamsInput('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: IDepartment) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setTeamsInput((dept.teams || []).join(', '));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInst) return;
    if (!name.trim()) {
      setFormError('Department name is required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);

      const parsedTeams = teamsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingDept) {
        await institutionService.updateDepartment(currentInst._id, editingDept._id, {
          name: name.trim(),
          description: description.trim() || undefined,
          teams: parsedTeams,
        });
      } else {
        await institutionService.createDepartment(currentInst._id, {
          name: name.trim(),
          description: description.trim() || undefined,
          teams: parsedTeams,
        });
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save department.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (deptId: string, deptName: string) => {
    if (!currentInst) return;
    if (!confirm(`Are you sure you want to delete department "${deptName}"?`)) return;

    try {
      await institutionService.deleteDepartment(currentInst._id, deptId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete department.');
    }
  };

  // Compute headcount per department
  const getDeptHeadcount = (deptName: string) => {
    return members.filter(
      (m) => m.department?.toLowerCase() === deptName.toLowerCase()
    ).length;
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit border border-blue-200">
            <Building2 className="w-3.5 h-3.5" />
            Company Structure
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Departments & Teams
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Structure your company into operational departments and sub-teams to streamline workforce assignment and training cohorts.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400">
          Loading company departments...
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No Departments Configured</h3>
            <p className="text-xs text-slate-500">
              Set up departments such as Engineering, Marketing, Operations, and Sales along with their sub-teams.
            </p>
          </div>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const headcount = getDeptHeadcount(dept.name);
            return (
              <div
                key={dept._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{headcount} Staff</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {dept.name}
                    </h3>
                    {dept.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {dept.description}
                      </p>
                    )}
                  </div>

                  {/* Sub-teams badges */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Sub-Teams ({dept.teams?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.teams && dept.teams.length > 0 ? (
                        dept.teams.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No sub-teams specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit Department"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {currentMembership?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(dept._id, dept.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingDept ? 'Edit Department' : 'Add Department'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Organize your organization and configure sub-teams.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering, People Operations, Product"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Operational responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Sub-Teams / Squads (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Frontend, Backend, DevOps, QA"
                  value={teamsInput}
                  onChange={(e) => setTeamsInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Separate team names with commas.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
