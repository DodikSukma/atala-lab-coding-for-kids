import { Module } from "@nestjs/common";
import {
  HealthController,
  CurriculumController,
  ProjectsController,
} from "./routes";
import { ProjectsService } from "./projects.service";
@Module({
  controllers: [HealthController, CurriculumController, ProjectsController],
  providers: [ProjectsService],
})
export class AppModule {}
