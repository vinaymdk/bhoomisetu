import { Body, Controller, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() currentUser: CurrentUserData) {
    return {
      user: currentUser.user,
      roles: currentUser.roles,
    };
  }

  @Patch('me')
  updateMe(@CurrentUser() currentUser: CurrentUserData, @Body() updateDto: UpdateProfileDto) {
    return this.usersService.updateProfile(currentUser.userId, updateDto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadAvatar(
    @CurrentUser() currentUser: CurrentUserData,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return { avatarUrl: currentUser.user.avatarUrl || null };
    }
    const upload = await this.storageService.uploadImage(file, 'bhoomisetu/avatars');
    const user = await this.usersService.updateProfile(currentUser.userId, { avatarUrl: upload.url });
    return { avatarUrl: user.avatarUrl };
  }
}

