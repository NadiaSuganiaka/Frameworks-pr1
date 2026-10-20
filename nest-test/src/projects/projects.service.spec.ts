import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service.js';
import { InMemoryProjectsRepository } from './in-memory-projects.repository.js';
import { PROJECTS_REPOSITORY } from './projects.repository.js';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        InMemoryProjectsRepository,
        { provide: PROJECTS_REPOSITORY, useExisting: InMemoryProjectsRepository },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
