import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as unzipper from 'unzipper';
import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { KalmsystemService } from 'src/kalmsystem/kalmsystem.service';
interface FileStructure {
  carpetas: string[];
  archivos: string[];
  urls_archivos: Array<{
    nombre: string;
    carpeta: string;
    url?: string;
    status: string;
    message?: string;
  }>;
}

@Injectable()
export class UploadFilesService {
  constructor(private readonly kalmsystemService: KalmsystemService) {}

  private getContentType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    const contentTypes = new Map<string, string>([
      ['pdf', 'application/pdf'],
      ['png', 'image/png'],
      ['jpg', 'image/jpeg'],
      ['jpeg', 'image/jpeg'],
      ['doc', 'application/msword'],
      [
        'docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    ]);

    return contentTypes.get(extension) || 'application/octet-stream';
  }

  getIdentificationFromCertificate(certificate: string): string {
    return certificate.split('_')[0];
  }

  s3Client = new S3Client({
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    forcePathStyle: false,
    region: 'nyc3',
    credentials: {
      accessKeyId: process.env.aws_access_key_id,
      secretAccessKey: process.env.aws_secret_access_key,
    },
  });

  uploadToSpaces = async (fileName, fileContent, spacePath, bucket) => {
    console.log('********', fileName);
    const region = 'nyc3';
    const ACL = 'public-read' as ObjectCannedACL;
    const contentType = this.getContentType(fileName);

    const params = {
      Bucket: bucket,
      Key: spacePath,
      Body: fileContent,
      ACL: ACL,
      ContentType: contentType,
    };

    try {
      const data = await this.s3Client.send(new PutObjectCommand(params));
      const fileUrl = `https://${bucket}.${region}.digitaloceanspaces.com/${spacePath}`;

      console.log(
        'Successfully uploaded object: ' + params.Bucket + '/' + params.Key,
      );
      return {
        data: data,
        fileUrl: fileUrl,
      };
    } catch (err) {
      console.log('Error', err);
    }
  };

  async processZipFile(
    file: Express.Multer.File,
  ): Promise<{ estructura: FileStructure }> {
    const estructura: FileStructure = {
      carpetas: [],
      archivos: [],
      urls_archivos: [],
    };

    const carpetasSet = new Set<string>();

    try {
      const directory = await unzipper.Open.buffer(file.buffer);

      for (const entry of directory.files) {
        if (entry.type === 'Directory') {
          carpetasSet.add(entry.path);
          continue;
        }
        const certificate_name = path.dirname(entry.path);
        const folderPath = path.dirname(entry.path) + '/';
        const fileName = path.basename(entry.path);
        const identification = this.getIdentificationFromCertificate(fileName);

        try {
          const fileContent = await entry.buffer();
          const spacesPath = `${folderPath}${fileName}`;

          const user = await this.kalmsystemService.findByIdentification(identification);

          if (user) {
            const uploadResult = await this.uploadToSpaces(
              fileName,
              fileContent,
              spacesPath,
              'certificates-private-zones',
            );
  
            if (uploadResult) {
              const user_id = user.id.toString();
              await this.kalmsystemService.writeCertificateData(
                user_id,
                certificate_name,
                uploadResult.fileUrl,
              );
              console.log('identification', identification);
              console.log('Certificado', certificate_name);
              console.log(
                `Success: file upload success, certificate: ${fileName}, name: ${certificate_name}`,
              );
              // Agregar la respuesta del upload al array de urls_archivos para retornarla al frontend
              estructura.urls_archivos.push({
                nombre: fileName,
                carpeta: folderPath,
                url: uploadResult.fileUrl,
                status: 'Success',
                message: 'file upload success',
              });
            } else {
              // Error al subir el archivo al CDN
              console.log(`Error: No se pudo obtener URL para ${fileName}`);
              estructura.urls_archivos.push({
                nombre: fileName,
                carpeta: folderPath,
                url: uploadResult?.fileUrl,
                status: 'Error',
                message: 'Error al subir el archivo al CDN',
              });
            }
          } else {
            estructura.urls_archivos.push({
              nombre: fileName,
              carpeta: folderPath,
              url: null,
              status: 'Error',
              message: 'user not found',
            });
          }
        } catch (error) {
          console.error(
            `Error al procesar archivo ${fileName}: ${error.message}`,
          );
        }
        estructura.archivos.push(fileName);
      }

      estructura.carpetas = Array.from(carpetasSet);
      return { estructura };
    } catch (error) {
      throw new Error(`Error processing ZIP file: ${error.message}`);
    }
  }
}
