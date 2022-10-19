import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req
} from '@nestjs/common'
import { Private } from '../auth/decorator/guard.decorator'
import { User } from '../users/entities/User.entity'
import { BuildsService } from './builds.service'
import { CloneBuildParam } from './dto/CloneBuildDto'
import { DeleteBuildParam } from './dto/DeleteBuildDto'
import { UpdateBuildDto, UpdateBuildParam } from './dto/UpdateBuildDto'

@Private()
@Controller('builds')
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}

  @Get()
  async getBuilds(@Req() { user }: { user: User }) {
    return await this.buildsService.getBuilds(user)
  }

  @Post()
  @HttpCode(201)
  async createBuild(@Req() { user }: { user: User }) {
    return await this.buildsService.createBuild(user)
  }

  @Post(':buildId/clone')
  @HttpCode(201)
  async cloneBuild(
    @Req() { user }: { user: User },
    @Param() { buildId }: CloneBuildParam
  ) {
    return await this.buildsService.cloneBuild(user, buildId)
  }

  @Patch(':buildId')
  @HttpCode(204)
  async updateBuild(
    @Req() { user }: { user: User },
    @Param() { buildId }: UpdateBuildParam,
    @Body() updateBuildDto: UpdateBuildDto
  ) {
    return await this.buildsService.updateBuild(user, buildId, updateBuildDto)
  }

  @Delete(':buildId')
  @HttpCode(204)
  async deleteBuild(
    @Req() { user }: { user: User },
    @Param() { buildId }: DeleteBuildParam
  ) {
    return await this.buildsService.deleteBuild(user, buildId)
  }
}
