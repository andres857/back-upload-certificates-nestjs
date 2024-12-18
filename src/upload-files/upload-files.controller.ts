import { Controller, Get } from '@nestjs/common';
import { UploadFilesService } from './upload-files.service';
@Controller('upload-files')
export class UploadFilesController {
  constructor(private readonly uploadFilesService: UploadFilesService) {}

  @Get()
  async uploadObject() {
    await this.uploadFilesService.uploadObject();
  }
}
