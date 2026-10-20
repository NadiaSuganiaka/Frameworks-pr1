import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { InMemoryProjectsRepository } from './in-memory-projects.repository.js';
import { ProjectsService } from './projects.service.js';
import { PROJECTS_REPOSITORY } from './projects.repository.js';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    InMemoryProjectsRepository,
    { provide: PROJECTS_REPOSITORY, useExisting: InMemoryProjectsRepository },
  ],
})
export class ProjectsModule {}
