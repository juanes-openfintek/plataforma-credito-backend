import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const FILE_UPLOAD_OPTIONS: MulterOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
};

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('user')
  @UseInterceptors(FileInterceptor('file', FILE_UPLOAD_OPTIONS))
  async uploadFileUser(@UploadedFile() file: any) {
    const fileUrl = await this.filesService.uploadFile(file);
    return { url: fileUrl };
  }

  // Alias para compatibilidad con el frontend
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', FILE_UPLOAD_OPTIONS))
  async uploadFile(@UploadedFile() file: any) {
    const fileUrl = await this.filesService.uploadFile(file);
    return { url: fileUrl };
  }
}
