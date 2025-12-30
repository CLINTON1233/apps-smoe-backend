// src/shared/ftp.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import Client from 'ftp';
import * as ftp from 'ftp';
import { ftpConfig } from '../config/ftp.config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FtpService {
  private readonly logger = new Logger(FtpService.name);
  private ftpClient: Client;

  constructor() {
    this.ftpClient = new Client();
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ftpClient.on('ready', () => {
        this.logger.log('Connected to FTP server');
        resolve();
      });

      this.ftpClient.on('error', (err) => {
        this.logger.error('FTP connection error:', err);
        reject(err);
      });

      this.ftpClient.connect({
        host: ftpConfig.host,
        port: ftpConfig.port,
        user: ftpConfig.user,
        password: ftpConfig.password,
        secure: ftpConfig.secure,
        connTimeout: ftpConfig.timeout,
        pasvTimeout: ftpConfig.timeout,
        keepalive: 10000,
      });
    });
  }

  private disconnect(): void {
    if (this.ftpClient) {
      this.ftpClient.end();
      this.logger.log('Disconnected from FTP server');
    }
  }

  private ensureDirectoryExists(dirPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ftpClient.mkdir(dirPath, true, (err) => {
        if (err) {
          this.logger.error(`Error creating directory ${dirPath}:`, err);
          reject(err);
        } else {
          this.logger.log(`Directory ensured: ${dirPath}`);
          resolve();
        }
      });
    });
  }

  async uploadFile(
    localFilePath: string,
    remoteFileName: string,
    remotePath: string = ftpConfig.basePath,
  ): Promise<{ remotePath: string; fileUrl: string }> {
    try {
      await this.connect();

      // Ensure remote directory exists
      await this.ensureDirectoryExists(remotePath);

      return new Promise((resolve, reject) => {
        const finalRemotePath = path.join(remotePath, remoteFileName);

        this.ftpClient.put(localFilePath, finalRemotePath, (err) => {
          if (err) {
            this.logger.error('FTP upload error:', err);
            reject(
              new HttpException(
                `Failed to upload file to FTP: ${err.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else {
            this.logger.log(`File uploaded to FTP: ${finalRemotePath}`);

            // Construct public URL (sesuaikan dengan konfigurasi Anda)
            const fileUrl = `ftp://${ftpConfig.host}:${ftpConfig.port}${finalRemotePath}`;

            resolve({
              remotePath: finalRemotePath,
              fileUrl: fileUrl,
            });
          }
          this.disconnect();
        });
      });
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  async deleteFile(remoteFilePath: string): Promise<boolean> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        this.ftpClient.delete(remoteFilePath, (err) => {
          if (err) {
            this.logger.error('FTP delete error:', err);
            reject(err);
          } else {
            this.logger.log(`File deleted from FTP: ${remoteFilePath}`);
            resolve(true);
          }
          this.disconnect();
        });
      });
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  async listFiles(remotePath: string = ftpConfig.basePath): Promise<string[]> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        this.ftpClient.list(remotePath, (err, list) => {
          if (err) {
            this.logger.error('FTP list error:', err);
            reject(err);
          } else {
            const files = list
              .filter((item) => item.type === '-')
              .map((item) => item.name);
            resolve(files);
          }
          this.disconnect();
        });
      });
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  async downloadFile(
    remoteFilePath: string,
    localFilePath: string,
  ): Promise<void> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(localFilePath);

        this.ftpClient.get(remoteFilePath, (err, stream) => {
          if (err) {
            this.logger.error('FTP download error:', err);
            reject(err);
            return;
          }

          stream.once('close', () => {
            this.logger.log(`File downloaded: ${localFilePath}`);
            resolve();
            this.disconnect();
          });

          stream.pipe(writeStream);
        });
      });
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  async getFileSize(remoteFilePath: string): Promise<number> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        this.ftpClient.size(remoteFilePath, (err, size) => {
          if (err) {
            this.logger.error('FTP size error:', err);
            reject(err);
          } else {
            resolve(size);
          }
          this.disconnect();
        });
      });
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }
}