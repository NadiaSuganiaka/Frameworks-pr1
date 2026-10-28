import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectStatus, type Project } from './entities/project.entity.js';
import type { ListProjectsDto } from './dto/list-projects.dto.js';

@Injectable()
export class PrismaProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({ ownerId, ...data }: Omit<Project, 'id' | 'createdAt'> & { ownerId: number }): Promise<Project> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const project = await tx.project.create({ data });
        await tx.membership.create({ data: { projectId: project.id, userId: ownerId, role: 'owner' } });
        return this.toEntity(project);
      });
    } catch (error) {
      this.rethrow(error, data.name);
    }
  }

  async findPage(query: ListProjectsDto): Promise<{ data: Project[]; total: number }> {
    const where: Prisma.ProjectWhereInput = {
      status: query.status,
      ...(query.assigneeId === undefined ? {} : { tasks: { some: { assigneeId: query.assigneeId } } }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where, skip: (query.page - 1) * query.size, take: query.size,
        orderBy: [{ [query.sort]: query.order }, { id: query.order }],
      }),
      this.prisma.project.count({ where }),
    ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    return { data: data.map(this.toEntity), total };
  }

  async addMember(projectId: number, userId: number) {
    try {
      return await this.prisma.membership.create({ data: { projectId, userId, role: 'member' } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({ errorCode: 'MEMBERSHIP_ALREADY_EXISTS', message: 'Користувач уже є учасником проєкту' });
      }
      this.rethrow(error);
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
    return { id: project.id, name: project.name, description: project.description ?? undefined,
      status: project.status as ProjectStatus, createdAt: project.createdAt };
  }

  private rethrow(error: unknown, name?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(`Project with name "${name}" already exists`);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new BadRequestException('Referenced user or project does not exist');
    }
    throw error;
  }
}
