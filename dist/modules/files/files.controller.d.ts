/// <reference types="multer" />
import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFileUser(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
