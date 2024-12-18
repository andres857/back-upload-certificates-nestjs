import { Module } from '@nestjs/common';
import { UploadFilesService } from './upload-files.service';
import { UploadFilesController } from './upload-files.controller';

@Module({
  providers: [UploadFilesService],
  controllers: [UploadFilesController]
})
export class UploadFilesModule {}
