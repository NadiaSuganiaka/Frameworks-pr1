export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: Date;
}
