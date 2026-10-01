import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  ResearchProjectSummary,
  ResearchProjectDetail,
} from '../types/research';
import { researchService } from '../services/researchService';

export interface ResearchActiveProjectContextType {
  activeProject: ResearchProjectSummary | null;
  activeProjectId: string | null;
  projectDetail: ResearchProjectDetail | null;
  allProjects: ResearchProjectSummary[];
  loading: boolean;
  setActiveProjectId: (id: string | null) => void;
  refreshProjects: () => Promise<void>;
  refreshProjectDetail: () => Promise<void>;
}

const ResearchActiveProjectContext = createContext<
  ResearchActiveProjectContextType | undefined
>(undefined);

export const ResearchActiveProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const [allProjects, setAllProjects] = useState<ResearchProjectSummary[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<ResearchProjectSummary | null>(null);
  const [projectDetail, setProjectDetail] = useState<ResearchProjectDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load real projects from backend
  const refreshProjects = useCallback(async () => {
    try {
      const realProjects = await researchService.listProjects();
      setAllProjects(realProjects);

      // Determine initial or current active project
      setActiveProjectIdState((currentId) => {
        // If route has /research/projects/:id, use URL ID
        const match = location.pathname.match(/\/research\/projects\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          return match[1];
        }

        // If currentId is valid in the list, keep it
        if (currentId && realProjects.some((p) => p.id === currentId || (p as any)._id === currentId)) {
          return currentId;
        }

        // Otherwise pick the first real project
        if (realProjects.length > 0) {
          return realProjects[0].id || (realProjects[0] as any)._id;
        }

        return null;
      });
    } catch (err) {
      console.warn('Could not list research projects:', err);
      setAllProjects([]);
    } finally {
      setLoading(false);
    }
  }, [location.pathname]);

  // Synchronize active project whenever URL changes to a project route
  useEffect(() => {
    const match = location.pathname.match(/\/research\/projects\/([a-zA-Z0-9_-]+)/);
    if (match && match[1] && match[1] !== activeProjectId) {
      setActiveProjectIdState(match[1]);
    }
  }, [location.pathname, activeProjectId]);

  // Initial fetch
  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  // Update activeProject summary when activeProjectId or allProjects change
  useEffect(() => {
    if (!activeProjectId) {
      if (allProjects.length > 0) {
        setActiveProject(allProjects[0]);
      } else {
        setActiveProject(null);
      }
      return;
    }

    const found = allProjects.find(
      (p) => p.id === activeProjectId || (p as any)._id === activeProjectId
    );
    if (found) {
      setActiveProject(found);
    } else if (allProjects.length > 0) {
      setActiveProject(allProjects[0]);
    } else {
      setActiveProject(null);
    }
  }, [activeProjectId, allProjects]);

  // Fetch full project detail from MongoDB when activeProjectId changes
  const refreshProjectDetail = useCallback(async () => {
    if (!activeProjectId) {
      setProjectDetail(null);
      return;
    }

    try {
      const detail = await researchService.getProjectById(activeProjectId);
      setProjectDetail(detail);
    } catch (err) {
      console.warn('Could not load detailed project for active project:', err);
      setProjectDetail(null);
    }
  }, [activeProjectId]);

  useEffect(() => {
    refreshProjectDetail();
  }, [refreshProjectDetail]);

  const setActiveProjectId = useCallback((id: string | null) => {
    setActiveProjectIdState(id);
  }, []);

  return (
    <ResearchActiveProjectContext.Provider
      value={{
        activeProject,
        activeProjectId,
        projectDetail,
        allProjects,
        loading,
        setActiveProjectId,
        refreshProjects,
        refreshProjectDetail,
      }}
    >
      {children}
    </ResearchActiveProjectContext.Provider>
  );
};

export const useResearchActiveProject = (): ResearchActiveProjectContextType => {
  const context = useContext(ResearchActiveProjectContext);
  if (!context) {
    throw new Error(
      'useResearchActiveProject must be used within a ResearchActiveProjectProvider'
    );
  }
  return context;
};
