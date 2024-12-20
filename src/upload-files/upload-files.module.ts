import { Module } from '@nestjs/common';
import { UploadFilesService } from './upload-files.service';
import { UploadFilesController } from './upload-files.controller';
import { KalmsystemModule } from 'src/kalmsystem/kalmsystem.module';
@Module({
  imports: [KalmsystemModule],
  providers: [UploadFilesService],
  controllers: [UploadFilesController],
})
export class UploadFilesModule {}
