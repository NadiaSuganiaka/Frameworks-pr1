import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { PrismaProjectRepository } from './prisma-project.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectsService } from './projects.service.js';
import { PROJECTS_REPOSITORY } from './projects.repository.js';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    PrismaService,
    PrismaProjectRepository,
    { provide: PROJECTS_REPOSITORY, useExisting: PrismaProjectRepository },
  ],
})
export class ProjectsModule {}
