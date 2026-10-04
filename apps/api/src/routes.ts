import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  ParseUUIDPipe,
  Inject,
} from "@nestjs/common";
import {
  validate,
  IsArray,
  IsIn,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  ValidateNested,
  ArrayMaxSize,
  IsOptional,
} from "class-validator";
import { Type, plainToInstance } from "class-transformer";
import type { Request } from "express";
import { ProjectsService } from "./projects.service";
const kinds = [
  "start",
  "key",
  "move",
  "left",
  "right",
  "say",
  "wait",
  "repeat",
  "ifStar",
  "score",
];
class BlockDto {
  @IsUUID() id!: string;
  @IsIn(kinds) kind!: string;
  @IsOptional() @IsString() @MaxLength(40) value?: string;
}
class SceneDto {
  @IsIn(["space", "garden"]) backdrop!: string;
  @IsIn(["bot", "cat"]) sprite!: string;
}
export class ProjectDto {
  @IsUUID() id!: string;
  @IsString() @Length(1, 80) title!: string;
  @IsIn(["1-1", "1-2", "1-3", "1-4", "1-p", "2-1", "2-2", "2-3", "2-4", "2-p"])
  lessonId!: string;
  @IsArray()
  @ArrayMaxSize(80)
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  blocks!: BlockDto[];
  @IsOptional() @ValidateNested() @Type(() => SceneDto) scene?: SceneDto;
}
@Controller("health")
export class HealthController {
  constructor(
    @Inject(ProjectsService) private readonly service: ProjectsService,
  ) {}
  @Get() get() {
    return { ok: true, databaseConfigured: this.service.configured() };
  }
}
@Controller("curriculum")
export class CurriculumController {
  @Get() get() {
    return {
      activeMonths: [1, 2],
      lessonIds: [
        "1-1",
        "1-2",
        "1-3",
        "1-4",
        "1-p",
        "2-1",
        "2-2",
        "2-3",
        "2-4",
        "2-p",
      ],
    };
  }
}
@Controller("projects")
export class ProjectsController {
  constructor(
    @Inject(ProjectsService) private readonly service: ProjectsService,
  ) {}
  @Get() list(@Req() request: Request) {
    return this.service.list(request);
  }
  @Get(":id") get(
    @Req() request: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(request, id);
  }
  @Post() async save(@Req() request: Request, @Body() body: unknown) {
    const input = plainToInstance(ProjectDto, body);
    const errors = await validate(input, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length)
      throw new BadRequestException(
        "Periksa judul, pertemuan, dan blok proyek.",
      );
    return this.service.save(request, input);
  }
  @Delete(":id") remove(
    @Req() request: Request,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(request, id);
  }
}
