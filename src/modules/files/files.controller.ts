import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('user')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileUser(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.filesService.uploadFile(file);
    return { url: fileUrl };
  }

  // Alias para compatibilidad con el frontend
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.filesService.uploadFile(file);
    return { url: fileUrl };
  }
}
