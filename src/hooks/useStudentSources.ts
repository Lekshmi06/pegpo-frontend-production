import { useState, useEffect, useCallback } from 'react';
import { SourceItem, SourceContent } from '../types/source';
import { sourceService } from '../services/sourceService';

export function useStudentSources(studentId: string | undefined) {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [sourceContent, setSourceContent] = useState<SourceContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    if (!studentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await sourceService.getStudentSources(studentId);
      setSources(data);

      // Default select the latest source if none selected
      setSelectedSource((current) => current || (data.length > 0 ? data[0] : null));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch student sources';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  // Fetch content whenever selectedSource changes
  useEffect(() => {
    let isCancelled = false;

    if (!selectedSource?._id) {
      setSourceContent(null);
      return;
    }

    const fetchContent = async () => {
      setIsContentLoading(true);
      try {
        const content = await sourceService.getSourceContent(selectedSource._id);
        if (!isCancelled) {
          setSourceContent(content);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Could not load source content:', err);
          setSourceContent(null);
        }
      } finally {
        if (!isCancelled) {
          setIsContentLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isCancelled = true;
    };
  }, [selectedSource?._id]);

  const selectSource = useCallback(async (source: SourceItem) => {
    setSelectedSource(source);
  }, []);

  const uploadFile = useCallback(
    async (file: File): Promise<SourceItem> => {
      if (!studentId) {
        throw new Error('No active student profile found to upload source to');
      }

      setIsUploading(true);
      setError(null);

      try {
        const newSource = await sourceService.uploadSource(studentId, file);
        setSources((prev) => [newSource, ...prev]);
        setSelectedSource(newSource);
        return newSource;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setError(msg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [studentId]
  );

  const deleteSource = useCallback(
    async (sourceId: string): Promise<void> => {
      await sourceService.deleteSource(sourceId);

      setSources((prev) => {
        const updated = prev.filter((s) => s._id !== sourceId);
        if (selectedSource?._id === sourceId) {
          setSelectedSource(updated.length > 0 ? updated[0] : null);
        }
        return updated;
      });
    },
    [selectedSource?._id]
  );

  return {
    sources,
    selectedSource,
    sourceContent,
    isLoading,
    isUploading,
    isContentLoading,
    error,
    uploadFile,
    selectSource,
    deleteSource,
    refetch: fetchSources,
  };
}
