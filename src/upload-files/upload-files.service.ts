import { Injectable, InternalServerErrorException, Provider } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as unzipper from 'unzipper';
import {
  ObjectCannedACL,
  PutObjectCommand,
  S3,
  S3Client,
} from '@aws-sdk/client-s3';
import { KalmsystemService } from 'src/kalmsystem/kalmsystem.service';
import { S3UploadException, S3TimeoutException } from 'src/exceptions/s3.exceptions';


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
  
  private readonly s3Client = new S3Client({
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    forcePathStyle: false,
    region: 'nyc3',
    credentials: {
      accessKeyId: process.env.aws_access_key_id,
      secretAccessKey: process.env.aws_secret_access_key,
    },
  });

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
      ['xls', 'application/vnd.ms-excel'],
      [
        'xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      ['ppt', 'application/vnd.ms-powerpoint'],
      [
        'pptx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
    ]);    
    return contentTypes.get(extension) || 'application/octet-stream';
  }

  async guardarReporte(estructura) {
    // Definimos la ruta base para los reportes en la raíz del proyecto
    // process.cwd() nos da la ruta absoluta de donde se está ejecutando el proyecto
    const reportPath = path.join(process.cwd(), 'temp', 'reports');
  
    return new Promise((resolve, reject) => {
      // Verificamos si existe el directorio y lo creamos si es necesario
      // recursive: true permite crear toda la estructura de directorios necesaria
      if (!fs.existsSync(reportPath)) {
        fs.mkdir(reportPath, { recursive: true }, (error) => {
          if (error) {
            console.error('Error creando directorio:', error);
            return reject(error);
          }
          // Si se crea el directorio exitosamente, procedemos a guardar el archivo
          guardarArchivo();
        });
      } else {
        // Si el directorio ya existe, guardamos el archivo directamente
        guardarArchivo();
      }
  
      function guardarArchivo() {
        // Creamos un nombre único para el archivo usando timestamp
        // Reemplazamos : y . del timestamp para evitar problemas con nombres de archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `reporte-${timestamp}.json`;
        const filePath = path.join(reportPath, fileName);
        
        // Convertimos la estructura a JSON con formato legible (el null y 2 agregan indentación)
        const contenido = JSON.stringify(estructura, null, 2);
        
        // Escribimos el archivo de manera asíncrona
        fs.writeFile(filePath, contenido, (error) => {
          if (error) {
            console.error('Error guardando archivo:', error);
            return reject(error);
          }
          console.log(`Reporte guardado en: ${filePath}`);
          resolve(filePath);
        });
      }
    });
  }

  getIdentificationFromCertificate(certificate: string): string {
    return certificate.split('_')[0];
  }

  uploadToSpaces = async (fileName, fileContent, spacePath, bucket) => {
    const contentType = this.getContentType(fileName);
    if (contentType !== 'application/octet-stream') {
      const region = 'nyc3';
      const ACL = 'public-read' as ObjectCannedACL;  
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
        console.log('[SPACES DO] - Successfully uploaded file: ' + params.Bucket + '/' + params.Key);
        
        return {
          status: 'Success',
          message: 'file upload success to spaces',
          data: data,
          fileUrl: fileUrl,
        };
      }catch (err) {
        if (err instanceof S3UploadException) {
          throw err;
        }
        if (err instanceof S3TimeoutException) {
          throw err;
        }
        throw new InternalServerErrorException('Error uploading file to S3', err);
      }
    }
    // Error al obtener el contentType, el file tiene una extensión no soportada
    return {
      status: 'Error',
      message: `El archivo tiene una extensión no soportada`,
      fileUrl: null,
      data:null
    }
  };

  async processZipFile(file: Express.Multer.File,): Promise<{ estructura: FileStructure }> {
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
  
            if (uploadResult.status === 'Success') {
              const user_id = user.id.toString();
              await this.kalmsystemService.writeCertificateData(
                user_id,
                certificate_name,
                uploadResult.fileUrl,
              );
              console.log(
                `Success: file upload success, certificate: ${fileName}, name: ${certificate_name}`,
              );
              // Agregar la respuesta del upload al array de urls_archivos para retornarla al frontend
              estructura.urls_archivos.push({
                nombre: fileName,
                carpeta: folderPath,
                url: uploadResult.fileUrl,
                status: uploadResult.status,
                message: uploadResult.message,
              });
            } else {
              // Error al subir el archivo al CDN
              console.log(`[SPACES - Error] - ${uploadResult.message}`);
              estructura.urls_archivos.push({
                nombre: fileName,
                carpeta: folderPath,
                url: uploadResult?.fileUrl,
                status: uploadResult.status,
                message: uploadResult.message,
              });
            }
          } else {
            estructura.urls_archivos.push({
              nombre: fileName,
              carpeta: folderPath,
              url: null,
              status: 'Error',
              message: 'Usuario no encontrado',
            });
          }
        } catch (err) {
          console.log(err);
          
          console.error(`Error al procesar archivo ${fileName}: ${err.message}`);
          estructura.urls_archivos.push({
            nombre: fileName,
            carpeta: folderPath,
            url: null,
            status: 'Error',
            message: 'Error inesperado con el archivo ZIP',
          });
        }
        estructura.archivos.push(fileName);
      }

      estructura.carpetas = Array.from(carpetasSet);

      this.guardarReporte(estructura)
        .then(rutaArchivo => {
          console.log('Reporte guardado exitosamente en:', rutaArchivo);
        })
        .catch(error => {
          console.error('Error guardando el reporte:', error);
        });
      return { estructura };
    } catch (err) {
      throw new InternalServerErrorException('[ERROR GENERAL] - Error con el archivo ZIP', err);
    }
  }
}
