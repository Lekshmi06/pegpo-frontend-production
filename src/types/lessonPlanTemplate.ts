export type TemplateType = 'predefined' | 'custom';
export type SectionContentType = 'text' | 'list' | 'table' | 'keyValue';

export interface LessonPlanTemplateSection {
  key: string;
  label: string;
  type: SectionContentType;
  order: number;
  description?: string;
  required?: boolean;
}

export interface LessonPlanTemplateSchema {
  templateName: string;
  description?: string;
  sections: LessonPlanTemplateSection[];
}

export interface LessonPlanTemplate {
  _id: string;
  name: string;
  description?: string;
  type: TemplateType;
  imageReference?: string;
  extractedSchema: LessonPlanTemplateSchema;
  createdBy?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyzeTemplateResponse {
  success: boolean;
  message: string;
  data: LessonPlanTemplateSchema;
}
