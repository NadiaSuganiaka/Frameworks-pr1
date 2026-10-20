import { Injectable } from '@nestjs/common';
import type { Project } from './entities/project.entity.js';
import type { ProjectsRepositoryPort } from './projects.repository.js';

@Injectable()
export class InMemoryProjectsRepository implements ProjectsRepositoryPort {
  private readonly projects = new Map<string, Project>();
  private nextId = 1;

  async create(data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const project = { ...data, id: this.nextId++, createdAt: new Date() };
    this.projects.set(String(project.id), project);
    return project;
  }

  async findAll(): Promise<Project[]> {
    return [...this.projects.values()];
  }

  async findOne(id: number): Promise<Project | null> {
    return this.projects.get(String(id)) ?? null;
  }

  async update(id: number, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
    const existing = this.projects.get(String(id));
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.projects.set(String(id), updated);
    return updated;
  }

  async remove(id: number): Promise<boolean> {
    return this.projects.delete(String(id));
  }
}
