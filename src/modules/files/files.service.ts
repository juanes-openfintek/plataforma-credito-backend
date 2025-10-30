import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { Auth } from '../auth/decorators';

@Injectable()
@Auth()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo para cargar.');
    }

    const safeOriginalName = (file.originalname || 'archivo')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase();

    const fileBuffer = await this.getFileBuffer(file, safeOriginalName);
    const dataUrl = this.createDataUrl(fileBuffer, file.mimetype);

    this.logger.warn(
      `Carga simulada para demo: "${safeOriginalName}" aceptado, se retorna Data URL sin almacenar en storage.`,
    );

    return dataUrl;
  }

  private async getFileBuffer(
    file: Express.Multer.File,
    safeOriginalName: string,
  ): Promise<Buffer> {
    if (file.buffer && file.buffer.length) {
      return file.buffer;
    }

    const filePath = (file as any).path;
    if (!filePath) {
      throw new BadRequestException(
        `El archivo "${safeOriginalName}" está vacío o no es accesible.`,
      );
    }

    const buffer = await fs.promises.readFile(filePath);
    await fs.promises.unlink(filePath).catch(() => null);
    return buffer;
  }

  private createDataUrl(buffer: Buffer, mimetype?: string): string {
    if (!buffer || !buffer.length) {
      throw new BadRequestException('El contenido del archivo está vacío.');
    }

    const contentType = mimetype || 'application/octet-stream';
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  }
}
