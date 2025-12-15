import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import * as path from 'path';

@Injectable()
export class FtpService {
  private config = {
    host: process.env.FTP_HOST,
    port: parseInt(process.env.FTP_PORT || '21'),
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false,
  };

  /**
   * Upload file ke FTP Synology
   */
  async uploadFile(
    localFilePath: string,
    remotePath: string,
    fileName: string,
  ): Promise<string> {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Untuk debugging

    try {
      // Connect ke FTP server
      await client.access(this.config);

      // Buat directory jika belum ada
      const remoteDir = path.dirname(remotePath);
      await client.ensureDir(remoteDir);

      // Upload file
      await client.uploadFrom(localFilePath, remotePath);

      console.log(' File uploaded to FTP:', remotePath);

      // Return URL publik (sesuai konfigurasi)
      const publicUrl = `${process.env.FTP_BASE_URL}/${fileName}`;
      return publicUrl;
    } catch (error) {
      console.error(' FTP upload error:', error);
      throw new HttpException(
        `FTP upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      client.close();
    }
  }

  /**
   * Delete file dari FTP
   */
  async deleteFile(remotePath: string): Promise<boolean> {
    const client = new ftp.Client();

    try {
      await client.access(this.config);
      await client.remove(remotePath);
      console.log(' File deleted from FTP:', remotePath);
      return true;
    } catch (error) {
      console.error(' FTP delete error:', error);
      throw new HttpException(
        `FTP delete failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      client.close();
    }
  }

  /**
   * Check koneksi FTP
   */
  async testConnection(): Promise<boolean> {
    const client = new ftp.Client();

    try {
      await client.access(this.config);
      console.log(' FTP Connection successful');
      return true;
    } catch (error) {
      console.error(' FTP Connection failed:', error);
      return false;
    } finally {
      client.close();
    }
  }

  /**
   * Generate remote path untuk file
   */
  generateRemotePath(fileName: string): string {
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    
    // Format: applications/app-{timestamp}-{baseName}{ext}
    const safeFileName = `${baseName}-${timestamp}${ext}`.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `applications/${safeFileName}`;
  }
}