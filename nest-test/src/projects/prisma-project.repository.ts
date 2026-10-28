import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectStatus, type Project } from './entities/project.entity.js';
import type { ProjectsRepositoryPort } from './projects.repository.js';

@Injectable()
export class PrismaProjectRepository implements ProjectsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    try {
      return this.toEntity(await this.prisma.project.create({ data }));
    } catch (error) {
      this.rethrow(error, data.name);
    }
  }

  async findAll(): Promise<Project[]> {
    return (await this.prisma.project.findMany({ orderBy: { id: 'asc' } })).map(this.toEntity);
  }

  async findOne(id: number): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    return project ? this.toEntity(project) : null;
  }

  async update(id: number, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
    try {
      return this.toEntity(await this.prisma.project.update({ where: { id }, data }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return null;
      this.rethrow(error, data.name);
    }
  }

  async remove(id: number): Promise<boolean> {
    return (await this.prisma.project.deleteMany({ where: { id } })).count > 0;
  }

  private toEntity(project: { id: number; name: string; description: string | null; status: string; createdAt: Date }): Project {
    return { ...project, description: project.description ?? undefined, status: project.status as ProjectStatus };
  }

  private rethrow(error: unknown, name?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(`Project with name "${name}" already exists`);
    }
    throw error;
  }
}
