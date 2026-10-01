import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Sparkles,
  Award,
  Target,
  FolderKanban,
  Wrench,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { EdupyeLogo } from '../../../components/common/EdupyeLogo';
import { Button } from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';
import { useToast } from '../../../hooks/useToast';
import { authService } from '../../../services/authService';
import { researcherProfileService } from '../../../services/researcherProfileService';
import {
  ResearcherProfileData,
  BasicInformationData,
  AcademicInformationData,
  ResearchInformationData,
  ResearchExperienceData,
  ResearchGoalsData,
  CurrentResearchProjectData,
  ResearchToolsSkillsData,
  ResearchPreferencesData,
} from '../../../types/researcher';

// Steps
import { BasicInformation } from './steps/BasicInformation';
import { AcademicInformation } from './steps/AcademicInformation';
import { ResearchInformation } from './steps/ResearchInformation';
import { ResearchExperience } from './steps/ResearchExperience';
import { ResearchGoals } from './steps/ResearchGoals';
import { CurrentResearch } from './steps/CurrentResearch';
import { ResearchToolsSkills } from './steps/ResearchToolsSkills';
import { ResearchPreferences } from './steps/ResearchPreferences';
import { Completion } from './steps/Completion';

const STEP_LABELS = [
  { id: 1, label: 'Basic Info', icon: User },
  { id: 2, label: 'Academic', icon: GraduationCap },
  { id: 3, label: 'Research Domain', icon: Sparkles },
  { id: 4, label: 'Experience', icon: Award },
  { id: 5, label: 'Goals', icon: Target },
  { id: 6, label: 'Current Project', icon: FolderKanban },
  { id: 7, label: 'Tools & Skills', icon: Wrench, optional: true },
  { id: 8, label: 'Preferences', icon: Bookmark, optional: true },
  { id: 9, label: 'Summary', icon: CheckCircle2 },
];

export default function ResearcherOnboarding() {
  const navigate = useNavigate();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [profile, setProfile] = useState<ResearcherProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  // Load existing profile or initialize on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = authService.getCurrentUser();
        const data = await researcherProfileService.getProfile();

        // If user session has name/email, ensure it's reflected in basic info
        if (user) {
          if (!data.fullName && user.name) data.fullName = user.name;
          if (!data.contact?.email && user.email) {
            data.contact = { ...data.contact, email: user.email };
          }
        }

        setProfile(data);
        if (data.onboardingStep && data.onboardingStep > 1 && data.onboardingStep <= 9) {
          setCurrentStep(data.onboardingStep);
        }
      } catch (err) {
        console.warn('Failed loading profile, using initial defaults:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSaveStep = async (stepNum: number, stepData: any) => {
    setIsSaving(true);
    try {
      const updated = await researcherProfileService.saveStep(stepNum, stepData);
      setProfile(updated);
      toast.success('Progress saved');
      if (stepNum < 9) {
        setCurrentStep(stepNum + 1);
      }
    } catch {
      toast.error('Failed to sync progress to cloud, cached locally.');
      if (stepNum < 9) {
        setCurrentStep(stepNum + 1);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsCompleting(true);
    try {
      await researcherProfileService.completeOnboarding();
      authService.updateCurrentUser({
        role: 'researcher',
        goal: profile?.researchGoals?.primaryGoals?.[0] || 'Literature review',
      });
      toast.success('Researcher profile created successfully! Welcome to EduPye.');
      navigate('/research');
    } catch {
      toast.error('Entering research workspace...');
      navigate('/research');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDirectDashboardSkip = () => {
    navigate('/research');
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#f8fbfe] flex items-center justify-center">
        <Loader fullScreen size="lg" text="Setting up your Research Workspace..." />
      </div>
    );
  }

  const progressPercent = Math.round(((currentStep - 1) / (STEP_LABELS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-[#f8fbfe] flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pl-2 pt-2">
        <EdupyeLogo className="scale-110" />
        <div className="flex items-center gap-4">
          {currentStep < 9 && (
            <button
              type="button"
              onClick={handleDirectDashboardSkip}
              className="text-xs font-bold text-slate-400 hover:text-[#0091ff] transition-colors cursor-pointer"
            >
              Skip to Dashboard &rarr;
            </button>
          )}
        </div>
      </header>

      {/* Main Card Container */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-8">
        <div className="max-w-3xl w-full bg-white border border-[#e2ebf4] rounded-3xl p-5 sm:p-9 shadow-sm space-y-6">
          {/* Header pill & Progress */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold px-3 py-1 bg-[#d8ecfc] text-[#006bbd] rounded-full uppercase tracking-wider">
                  Researcher Onboarding
                </span>
                <span className="text-xs text-slate-400 font-bold ml-2">
                  Step {currentStep} of {STEP_LABELS.length}: {STEP_LABELS[currentStep - 1].label}
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#0091ff]">
                {progressPercent}% Complete
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0091ff] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Step navigation dots / tabs (horizontal scroll on mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {STEP_LABELS.map((step) => {
                const isCurrent = currentStep === step.id;
                const isPast = currentStep > step.id;
                const Icon = step.icon;
                return (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => {
                      if (isPast || isCurrent) {
                        setCurrentStep(step.id);
                      }
                    }}
                    disabled={!isPast && !isCurrent}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      isCurrent
                        ? 'bg-[#0091ff] text-white shadow-xs'
                        : isPast
                        ? 'bg-blue-50 text-[#006bbd] hover:bg-blue-100 cursor-pointer'
                        : 'bg-transparent text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{step.label}</span>
                    {step.optional && !isCurrent && (
                      <span className="text-[9px] opacity-75">(Opt)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Step View */}
          <div className="min-h-[380px]">
            {currentStep === 1 && (
              <BasicInformation
                initialData={{
                  fullName: profile.fullName || '',
                  profileImage: profile.profileImage || '',
                  email: profile.contact?.email || '',
                  phone: profile.contact?.phone || '',
                  country: profile.location?.country || 'India',
                  state: profile.location?.state || '',
                  preferredLanguage: profile.preferences?.language || 'English',
                }}
                onSave={(data: BasicInformationData) =>
                  handleSaveStep(1, {
                    fullName: data.fullName,
                    profileImage: data.profileImage,
                    contact: { email: data.email, phone: data.phone },
                    location: { country: data.country, state: data.state },
                    preferences: {
                      ...profile.preferences,
                      language: data.preferredLanguage,
                    },
                  })
                }
              />
            )}

            {currentStep === 2 && (
              <AcademicInformation
                initialData={{
                  currentStatus: profile.academicInfo?.currentStatus || '',
                  highestQualification: profile.academicInfo?.highestQualification || '',
                  institution: profile.academicInfo?.institution || '',
                  department: profile.academicInfo?.department || '',
                  currentCourse: profile.academicInfo?.currentCourse || '',
                  yearOfStudy: profile.academicInfo?.yearOfStudy || '',
                  graduationYear: profile.academicInfo?.graduationYear || '',
                  researcherId: profile.academicInfo?.researcherId || '',
                }}
                onSave={(data: AcademicInformationData) =>
                  handleSaveStep(2, {
                    academicInfo: data,
                  })
                }
              />
            )}

            {currentStep === 3 && (
              <ResearchInformation
                initialData={{
                  primaryDomain: profile.researchDomains?.[0] || 'Computer Science',
                  specializations: profile.researchSpecializations || [],
                  interests: profile.researchInterests || [],
                }}
                onSave={(data: ResearchInformationData) =>
                  handleSaveStep(3, {
                    researchDomains: [data.primaryDomain],
                    researchSpecializations: data.specializations,
                    researchInterests: data.interests,
                  })
                }
              />
            )}

            {currentStep === 4 && (
              <ResearchExperience
                initialData={{
                  level: profile.researchExperience?.level || 'Beginner',
                  hasWorkedOnProject: profile.researchExperience?.hasWorkedOnProject ?? false,
                  hasPublishedPaper: profile.researchExperience?.hasPublishedPaper ?? false,
                  hasParticipatedConference: profile.researchExperience?.hasParticipatedConference ?? false,
                  hasWorkedWithDatasets: profile.researchExperience?.hasWorkedWithDatasets ?? false,
                  hasWorkedWithDataAnalysisTools: profile.researchExperience?.hasWorkedWithDataAnalysisTools ?? false,
                  previousProjects: profile.researchExperience?.previousProjects || [],
                  publications: profile.researchExperience?.publications || [],
                  conferences: profile.researchExperience?.conferences || [],
                  researchLabs: profile.researchExperience?.researchLabs || [],
                }}
                onSave={(data: ResearchExperienceData) =>
                  handleSaveStep(4, {
                    researchExperience: data,
                  })
                }
              />
            )}

            {currentStep === 5 && (
              <ResearchGoals
                initialData={{
                  primaryGoals: profile.researchGoals?.primaryGoals || [],
                  customGoal: profile.researchGoals?.customGoal || '',
                }}
                onSave={(data: ResearchGoalsData) =>
                  handleSaveStep(5, {
                    researchGoals: data,
                  })
                }
              />
            )}

            {currentStep === 6 && (
              <CurrentResearch
                initialData={{
                  hasProject: profile.currentResearchProject?.hasProject || 'exploring',
                  title: profile.currentResearchProject?.title || '',
                  domain: profile.currentResearchProject?.domain || '',
                  problemStatement: profile.currentResearchProject?.problemStatement || '',
                  researchObjectives: profile.currentResearchProject?.researchObjectives || '',
                  researchQuestions: profile.currentResearchProject?.researchQuestions || '',
                  currentStage: profile.currentResearchProject?.currentStage || 'Literature review',
                }}
                onSave={(data: CurrentResearchProjectData) =>
                  handleSaveStep(6, {
                    currentResearchProject: data,
                  })
                }
              />
            )}

            {currentStep === 7 && (
              <ResearchToolsSkills
                initialData={{
                  researchTools: profile.researchTools || [],
                  technicalSkills: profile.technicalSkills || [],
                }}
                onSave={(data: ResearchToolsSkillsData) =>
                  handleSaveStep(7, {
                    researchTools: data.researchTools,
                    technicalSkills: data.technicalSkills,
                  })
                }
              />
            )}

            {currentStep === 8 && (
              <ResearchPreferences
                initialData={{
                  citationStyle: profile.preferences?.citationStyle || 'APA',
                  outputFormat: profile.preferences?.outputFormat || 'PDF Document',
                  language: profile.preferences?.language || 'English',
                  notificationPreferences: {
                    emailAlerts: profile.preferences?.notificationPreferences?.emailAlerts ?? true,
                    paperRecommendations: profile.preferences?.notificationPreferences?.paperRecommendations ?? true,
                    collaborationInvites: profile.preferences?.notificationPreferences?.collaborationInvites ?? true,
                  },
                }}
                onSave={(data: ResearchPreferencesData) =>
                  handleSaveStep(8, {
                    preferences: data,
                  })
                }
              />
            )}

            {currentStep === 9 && (
              <Completion
                profile={profile}
                onEdit={(stepNumber) => setCurrentStep(stepNumber)}
                onFinish={handleFinishOnboarding}
                isCompleting={isCompleting}
              />
            )}
          </div>

          {/* Bottom Action Footer for Steps 1-8 */}
          {currentStep < 9 && (
            <div className="flex items-center justify-between pt-5 border-t border-slate-100">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Skip option for optional steps */}
                {STEP_LABELS[currentStep - 1]?.optional && (
                  <button
                    type="button"
                    onClick={handleSkipStep}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-2 cursor-pointer transition-colors"
                  >
                    Skip step
                  </button>
                )}

                <Button
                  type="submit"
                  form="step-form"
                  isLoading={isSaving}
                  className="px-6 py-3 flex items-center gap-2"
                >
                  <span>{currentStep === 8 ? 'Review Profile' : 'Next Step'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs font-bold text-slate-400 py-2">
        © 2026 EDUPYE. All rights reserved.
      </footer>
    </div>
  );
}
