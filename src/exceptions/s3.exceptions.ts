import { BaseException } from "./base.exception";

export class S3UploadException extends BaseException {
  constructor(message: string, details?: any) {
    super(
      message,
      'S3_UPLOAD_ERROR',
      500,
      details
    );
  }
}

export class S3TimeoutException extends BaseException {
  constructor(details?: any) {
    super(
      'Operation timed out while uploading to bucket',
      'S3_TIMEOUT_ERROR',
      504,
      details
    );
  }
}