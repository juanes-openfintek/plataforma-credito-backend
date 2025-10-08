import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { Auth } from '../auth/decorators';

@Injectable()
@Auth()
export class FilesService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = admin.storage().bucket();
    const tempFilePath = path.join(os.tmpdir(), file.originalname);

    const stream = fs.createWriteStream(tempFilePath);
    stream.write(file.buffer);
    stream.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    await bucket.upload(tempFilePath, {
      destination: file.originalname,
    });

    fs.unlinkSync(tempFilePath);

    // Genera y devuelve la URL pública del archivo cargado
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${file.originalname}?alt=media`;

    return publicUrl;
  }
}
