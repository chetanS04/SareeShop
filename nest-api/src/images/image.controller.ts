import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import * as path from 'path';
import { existsSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { ImageService } from './image.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

const getStorageBaseDir = () => {
  const envPath = process.env.UPLOAD_PATH || process.env.SHARED_STORAGE_PATH;
  if (!envPath) {
    const defaultZelton = join(process.cwd(), '../Saree-app-storage/api/public/storage');
    if (existsSync(defaultZelton)) return defaultZelton;
    return join(process.cwd(), '../Saree-app-storage/api/public/storage');
  }
  return path.isAbsolute(envPath) ? envPath : resolve(process.cwd(), envPath);
};

const tempStorage = diskStorage({
  destination: (req, file, cb) => {
    const tempDir = join(getStorageBaseDir(), '_temp');
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname) || '.png';
    cb(null, `${unique}${ext}`);
  },
});

@Controller('images')
export class ImageController {
  constructor(private svc: ImageService) { }

  @Get('get-files/:directory')
  getFiles(@Param('directory') dir: string): Promise<any> {
    return this.svc.getFiles(dir);
  }

  @Post('upload')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: tempStorage,
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Query('directory') queryDir?: string,
    @Headers('x-directory') headerDir?: string,
  ): Promise<any> {
    const file = files && files.length > 0 ? files[0] : null;
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const directory = body?.directory || queryDir || headerDir || 'products';
    const targetDir = join(getStorageBaseDir(), directory);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    let nextNum = 1;
    if (existsSync(targetDir)) {
      const existingFiles = readdirSync(targetDir);
      const nums = existingFiles
        .map((f: string) => parseInt(f.split('.')[0], 10))
        .filter((n: number) => !isNaN(n));
      if (nums.length > 0) nextNum = Math.max(...nums) + 1;
    }
    const ext = extname(file.originalname) || '.png';
    const finalFilename = String(nextNum).padStart(15, '0') + (ext.startsWith('.') ? ext : `.${ext}`);
    const finalPath = join(targetDir, finalFilename);

    // Move file from temp to final target directory
    renameSync(file.path, finalPath);

    const url = `/storage/${directory}/${finalFilename}`;
    return {
      isSuccess: true,
      success: true,
      result: url,
      url,
      filename: finalFilename,
      message: 'Image uploaded successfully.',
    };
  }

  @Post('upload/:directory')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: tempStorage,
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async uploadToDir(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('directory') directoryParam: string,
  ): Promise<any> {
    const file = files && files.length > 0 ? files[0] : null;
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const directory = directoryParam || 'general';
    const targetDir = join(getStorageBaseDir(), directory);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    let nextNum = 1;
    if (existsSync(targetDir)) {
      const existingFiles = readdirSync(targetDir);
      const nums = existingFiles
        .map((f: string) => parseInt(f.split('.')[0], 10))
        .filter((n: number) => !isNaN(n));
      if (nums.length > 0) nextNum = Math.max(...nums) + 1;
    }
    const ext = extname(file.originalname) || '.png';
    const finalFilename = String(nextNum).padStart(15, '0') + (ext.startsWith('.') ? ext : `.${ext}`);
    const finalPath = join(targetDir, finalFilename);

    renameSync(file.path, finalPath);

    const url = `/storage/${directory}/${finalFilename}`;
    return {
      success: true,
      isSuccess: true,
      message: 'File uploaded successfully',
      url,
      result: url,
      filename: finalFilename,
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: tempStorage,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Query('directory') queryDir?: string,
    @Headers('x-directory') headerDir?: string,
  ): Promise<any> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    const directory = body?.directory || queryDir || headerDir || 'products';
    const targetDir = join(getStorageBaseDir(), directory);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const existingFiles = existsSync(targetDir) ? readdirSync(targetDir) : [];
    const nums = existingFiles
      .map((f: string) => parseInt(f.split('.')[0], 10))
      .filter((n: number) => !isNaN(n));
    let nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;

    const urls: string[] = [];
    const filenames: string[] = [];

    for (const file of files) {
      const ext = extname(file.originalname) || '.png';
      const finalFilename = String(nextNum).padStart(15, '0') + (ext.startsWith('.') ? ext : `.${ext}`);
      const finalPath = join(targetDir, finalFilename);

      renameSync(file.path, finalPath);
      const url = `/storage/${directory}/${finalFilename}`;
      urls.push(url);
      filenames.push(finalFilename);
      nextNum++;
    }

    return {
      success: true,
      isSuccess: true,
      message: `${urls.length} files uploaded successfully.`,
      urls,
      result: urls,
      filenames,
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete()
  @HttpCode(200)
  delete(@Body() b: any): Promise<any> {
    const targetPath = b.path ?? b.file_path;
    return this.svc.delete(targetPath);
  }
}
