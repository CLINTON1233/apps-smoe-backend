import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './applications.entity';
import { Icon } from '../icons/icons.entity';
import { FtpService } from '../shared/ftp.service'; 
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    
    @InjectRepository(Icon)
    private iconsRepository: Repository<Icon>,
    
    private ftpService: FtpService, 
  ) {}

  async findAll() {
    try {
      const applications = await this.applicationsRepository.find({
        relations: ['category', 'icon'],
        order: { id: 'ASC' },
      });
      
      return applications;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve applications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

async findById(id: number) {
  try {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['category', 'icon'],
    });

    if (!application) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }

    // PERBAIKAN: Jangan transform icon
    return application;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      'Failed to retrieve application',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

  async create(applicationData: any, file?: Express.Multer.File) {
    try {
      // Validasi required fields
      if (
        !applicationData.title ||
        !applicationData.fullName ||
        !applicationData.categoryId
      ) {
        throw new HttpException(
          'Title, full name, and category are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('CREATE APPLICATION DATA:', applicationData);

      // Handle icon
      let iconId: number | null = null;
      if (applicationData.iconId && applicationData.iconId !== 'null' && applicationData.iconId !== '') {
        const iconIdNumber = parseInt(applicationData.iconId);
        if (!isNaN(iconIdNumber) && iconIdNumber > 0) {
          const icon = await this.iconsRepository.findOne({
            where: { id: iconIdNumber },
          });
          if (icon) {
            iconId = icon.id;
          }
        }
      }

      // Handle file upload ke FTP
      let fileData: any = {};
      if (file) {
        // Step 1: Simpan file sementara di local
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempFileName = `temp-${Date.now()}-${file.originalname}`;
        const tempFilePath = path.join(tempDir, tempFileName);
        fs.writeFileSync(tempFilePath, file.buffer);

        try {
          // Step 2: Upload ke FTP
          const remoteFileName = `app-${Date.now()}-${file.originalname}`;
          const uploadResult = await this.ftpService.uploadFile(
            tempFilePath,
            remoteFileName,
          );

          // Step 3: Setup file data untuk database
          fileData = {
            file_name: file.originalname,
            file_path: uploadResult.remotePath, // Path di FTP
            file_url: uploadResult.fileUrl, // URL FTP untuk download
            file_size: file.size,
            file_type: this.getFileType(path.extname(file.originalname)),
          };

          console.log('File uploaded to FTP:', uploadResult);
        } finally {
          // Step 4: Hapus file temporary
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      }

      // Create application
      const newApplication = this.applicationsRepository.create({
        title: applicationData.title.trim(),
        full_name: applicationData.fullName.trim(),
        category_id: parseInt(applicationData.categoryId),
        icon_id: iconId,
        version: applicationData.version || '1.0.0',
        description: applicationData.description || '',
        status: applicationData.status || 'license',
        ...fileData,
      } as Partial<Application>);

      const savedApplication = await this.applicationsRepository.save(newApplication);

      // Return dengan relations
      const applicationWithRelations = await this.applicationsRepository.findOne({
        where: { id: savedApplication.id },
        relations: ['category', 'icon'],
      });

      if (!applicationWithRelations) {
        throw new HttpException(
          'Application not found after creation',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return applicationWithRelations;
    } catch (error) {
      console.error('Error creating application:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create application: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, applicationData: any, file?: Express.Multer.File) {
    try {
      const existingApplication = await this.applicationsRepository.findOne({
        where: { id },
      });

      if (!existingApplication) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }

      // Handle icon update
      let iconId: number | null = existingApplication.icon_id;
      if (applicationData.iconId === 'null' || applicationData.iconId === '') {
        iconId = null;
      } else if (applicationData.iconId && applicationData.iconId !== 'null' && applicationData.iconId !== '') {
        const iconIdNumber = parseInt(applicationData.iconId);
        if (!isNaN(iconIdNumber) && iconIdNumber > 0) {
          const icon = await this.iconsRepository.findOne({
            where: { id: iconIdNumber },
          });
          iconId = icon ? icon.id : null;
        }
      }

      // Handle file update ke FTP
      let fileData: any = {};
      if (file) {
        // Delete old file dari FTP jika ada
        if (existingApplication.file_path) {
          try {
            await this.ftpService.deleteFile(existingApplication.file_path);
          } catch (deleteError) {
            console.warn('Failed to delete old FTP file:', deleteError);
          }
        }

        // Upload new file ke FTP
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempFileName = `temp-update-${Date.now()}-${file.originalname}`;
        const tempFilePath = path.join(tempDir, tempFileName);
        fs.writeFileSync(tempFilePath, file.buffer);

        try {
          const remoteFileName = `app-${Date.now()}-${file.originalname}`;
          const uploadResult = await this.ftpService.uploadFile(
            tempFilePath,
            remoteFileName,
          );

          fileData = {
            file_name: file.originalname,
            file_path: uploadResult.remotePath,
            file_url: uploadResult.fileUrl,
            file_size: file.size,
            file_type: this.getFileType(path.extname(file.originalname)),
          };
        } finally {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      }

      // Update application
      await this.applicationsRepository.update(id, {
        title: applicationData.title || existingApplication.title,
        full_name: applicationData.fullName || existingApplication.full_name,
        category_id: applicationData.categoryId
          ? parseInt(applicationData.categoryId)
          : existingApplication.category_id,
        icon_id: iconId,
        version: applicationData.version || existingApplication.version,
        description: applicationData.description || existingApplication.description,
        status: applicationData.status || existingApplication.status,
        ...fileData,
      });

      const updatedApplication = await this.applicationsRepository.findOne({
        where: { id },
        relations: ['category', 'icon'],
      });

      if (!updatedApplication) {
        throw new HttpException(
          'Application not found after update',
          HttpStatus.NOT_FOUND,
        );
      }

      return updatedApplication;
    } catch (error) {
      console.error('Error updating application:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update application: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async delete(id: number) {
    try {
      const applicationToDelete = await this.applicationsRepository.findOne({
        where: { id },
      });

      if (!applicationToDelete) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }

      // Delete file dari FTP jika ada
      if (applicationToDelete.file_path) {
        try {
          await this.ftpService.deleteFile(applicationToDelete.file_path);
        } catch (ftpError) {
          console.warn('Failed to delete FTP file:', ftpError);
        }
      }

      // Delete dari database
      const result = await this.applicationsRepository.delete(id);

      if (result.affected === 0) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


   async incrementDownloadCount(id: number) {
    try {
      const application = await this.applicationsRepository.findOne({
        where: { id },
      });

      if (!application) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }

      application.download_count += 1;
      await this.applicationsRepository.save(application);

      return application;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update download count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

   async getFileForDownload(id: number): Promise<{ filePath: string; fileName: string }> {
    const application = await this.findById(id);
    
    if (!application.file_path) {
      throw new HttpException('No file available', HttpStatus.NOT_FOUND);
    }

    // Download file dari FTP ke temporary location
    const tempDir = path.join(process.cwd(), 'temp', 'downloads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const localFilePath = path.join(tempDir, application.file_name);
    
    try {
      await this.ftpService.downloadFile(
        application.file_path,
        localFilePath,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to download file from FTP: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      filePath: localFilePath,
      fileName: application.file_name,
    };
  }

  private getFileType(fileExt: string): string {
    const typeMap: { [key: string]: string } = {
      '.exe': 'Windows Executable',
      '.msi': 'Windows Installer',
      '.dmg': 'Mac OS Disk Image',
      '.pkg': 'Mac OS Package',
      '.deb': 'Debian Package',
      '.rpm': 'Red Hat Package',
      '.apk': 'Android Package',
      '.ipa': 'iOS App',
      '.zip': 'Archive',
      '.rar': 'Archive',
      '.7z': 'Archive',
      '.tar': 'Archive',
      '.gz': 'Archive',
      '.app': 'Mac OS Application',
      '.dll': 'Windows DLL',
      '.bin': 'Binary File',
      '.iso': 'Disk Image',
    };

    return typeMap[fileExt.toLowerCase()] || 'Unknown';
  }
}