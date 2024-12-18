import { Injectable } from '@nestjs/common';
import {
  PutObjectCommand,
  S3Client,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';

@Injectable()
export class UploadFilesService {
  s3Client = new S3Client({
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    forcePathStyle: false,
    region: 'nyc3',
    credentials: {
      accessKeyId: process.env.aws_access_key_id,
      secretAccessKey: process.env.aws_secret_access_key,
    },
  });

  // Step 4: Define a function that uploads your object using SDK's PutObjectCommand object and catches any errors.
  uploadObject = async () => {
    // Step 3: Define the parameters for the object you want to upload.
    const params = {
      Bucket: 'certificates-private-zones', // The path to the directory you want to upload the object to, starting with your Space name.
      Key: 'folder-path/hello-world.txt', // Object key, referenced whenever you want to access this file later.
      Body: 'Hello, World!', // The object's contents. This variable is an object, not a string.
      ACL: 'public-read' as ObjectCannedACL, // Defines ACL permissions, such as private or public.
      Metadata: {
        // Defines metadata tags.
        'x-amz-meta-my-key': 'your-value',
      },
    };
    try {
      const data = await this.s3Client.send(new PutObjectCommand(params));
      console.log(
        'Successfully uploaded object: ' + params.Bucket + '/' + params.Key,
      );
      return data;
    } catch (err) {
      console.log('Error', err);
    }
  };
}
