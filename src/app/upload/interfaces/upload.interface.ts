export interface UploadResponse {
  url: string;
  message: string;
}

export interface CloudflareConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}
