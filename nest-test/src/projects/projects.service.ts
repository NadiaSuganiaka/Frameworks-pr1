import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectResponseDto } from './dto/project-response.dto.js';
import type { Project } from './entities/project.entity.js';
import { PROJECTS_REPOSITORY } from './projects.repository.js';
import type { ProjectsRepositoryPort } from './projects.repository.js';

@Injectable()
export class ProjectsService {
  constructor(@Inject(PROJECTS_REPOSITORY) private readonly repository: ProjectsRepositoryPort) {}

  async create(data: CreateProjectDto): Promise<ProjectResponseDto> {
    await this.ensureNameIsUnique(data.name);
    return this.toResponse(await this.repository.create(data));
  }

  async findAll(): Promise<ProjectResponseDto[]> {
    return (await this.repository.findAll()).map((project) => this.toResponse(project));
  }

  async findOne(id: number): Promise<ProjectResponseDto> {
    return this.toResponse(await this.getOrThrow(id));
  }

  async update(id: number, data: UpdateProjectDto): Promise<ProjectResponseDto> {
    await this.getOrThrow(id);
    if (data.name) await this.ensureNameIsUnique(data.name, id);
    return this.toResponse(await this.updateOrThrow(id, data));
  }

  async remove(id: number): Promise<void> {
    if (!(await this.repository.remove(id))) {
      throw new NotFoundException(`Project with id ${id} was not found`);
    }
  }

  private async getOrThrow(id: number): Promise<Project> {
    const project = await this.repository.findOne(id);
    if (!project) throw new NotFoundException(`Project with id ${id} was not found`);
    return project;
  }

  private async updateOrThrow(id: number, data: UpdateProjectDto): Promise<Project> {
    const project = await this.repository.update(id, data);
    if (!project) throw new NotFoundException(`Project with id ${id} was not found`);
    return project;
  }

  private async ensureNameIsUnique(name: string, excludingId?: number): Promise<void> {
    const projects = await this.repository.findAll();
    if (projects.some((project) => project.name === name && project.id !== excludingId)) {
      throw new ConflictException(`Project with name "${name}" already exists`);
    }
  }

  private toResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
    };
  }
}
