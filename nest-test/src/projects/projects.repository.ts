import type { Project } from './entities/project.entity.js';

export interface ProjectsRepositoryPort {
  create(data: Omit<Project, 'id' | 'createdAt'>): Promise<Project>;
  findAll(): Promise<Project[]>;
  findOne(id: number): Promise<Project | null>;
  update(id: number, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null>;
  remove(id: number): Promise<boolean>;
}

export const PROJECTS_REPOSITORY = Symbol('PROJECTS_REPOSITORY');
