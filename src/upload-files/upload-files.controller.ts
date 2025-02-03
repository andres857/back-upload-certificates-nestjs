import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadFilesService } from './upload-files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { Response } from 'express';

@Controller('upload-files')
export class UploadFilesController {
  constructor(
    private readonly uploadFilesService: UploadFilesService,
  ) {}

  //  Esta ruta renderiza el formulario HTML
  @Get()
  getUploadForm(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', '..', 'public', 'index.html'));
  }

  // Esta ruta maneja la subida del archivo
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    console.log('ZIP upload start');
    if (!file.originalname.endsWith('.zip')) {
      throw new HttpException(
        'Por favor sube un archivo ZIP válido',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.uploadFilesService.processZipFile(file);
      console.log('ZIP upload sucess');
      return {
        // success: true,
        estructura: result.estructura,
        message: `Se subieron ${result.estructura.urls_archivos.length} archivos correctamente`,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: `Error al procesar el archivo ZIP: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('certificate')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCertificate(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(pdf|jpg|jpeg|png)$' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() certificateData: any,
  ) {
    return this.uploadFilesService.processUploadCertificate(file, certificateData);
  }
}
