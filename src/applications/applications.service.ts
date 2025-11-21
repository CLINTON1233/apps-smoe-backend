import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './applications.entity';
import { Category } from '../categories/categories.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>, // INJECT CATEGORY REPOSITORY
  ) {}

  async findAll() {
    try {
      const applications = await this.applicationsRepository.find({
        relations: ['category'],
        order: { id: 'ASC' },
      });
      
      // Debug log untuk memastikan data terambil
      console.log('Applications found:', applications.length);
      
      return applications;
    } catch (error) {
      console.error('Error in findAll:', error);
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
        relations: ['category'],
      });

      if (!application) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }
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

      // Handle file upload
      const fileData: any = {};
      if (file) {
        const uploadsDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          'applications',
        );

        // Ensure upload directory exists
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const fileExt = path.extname(file.originalname);
        const fileName = `app-${Date.now()}${fileExt}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file
        fs.writeFileSync(filePath, file.buffer);

        fileData.file_name = file.originalname;
        fileData.file_path = `uploads/applications/${fileName}`;
        fileData.file_size = file.size;
        fileData.file_type = this.getFileType(fileExt);
      }

      // Create new application
      const newApplication = this.applicationsRepository.create({
        title: applicationData.title.trim(),
        full_name: applicationData.fullName.trim(),
        category_id: parseInt(applicationData.categoryId),
        icon_id: applicationData.iconId
          ? parseInt(applicationData.iconId)
          : null,
        version: applicationData.version || '1.0.0',
        description: applicationData.description || '',
        ...fileData,
      } as Partial<Application>);

      const savedApplication =
        await this.applicationsRepository.save(newApplication);

      // Return application with relations
      const applicationWithRelations =
        await this.applicationsRepository.findOne({
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, applicationData: any, file?: Express.Multer.File) {
    try {
      // Find existing application
      const existingApplication = await this.applicationsRepository.findOne({
        where: { id },
      });

      if (!existingApplication) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }

      // Handle file upload if new file provided
      const fileData: any = {};
      if (file) {
        // Delete old file if exists
        if (existingApplication.file_path) {
          const oldFilePath = path.join(
            process.cwd(),
            'public',
            existingApplication.file_path,
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        const uploadsDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          'applications',
        );

        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileExt = path.extname(file.originalname);
        const fileName = `app-${Date.now()}${fileExt}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, file.buffer);

        fileData.file_name = file.originalname;
        fileData.file_path = `uploads/applications/${fileName}`;
        fileData.file_size = file.size;
        fileData.file_type = this.getFileType(fileExt);
      }

      // Update application data
      await this.applicationsRepository.update(id, {
        title: applicationData.title || existingApplication.title,
        full_name: applicationData.fullName || existingApplication.full_name,
        category_id: applicationData.categoryId
          ? parseInt(applicationData.categoryId)
          : existingApplication.category_id,
        icon_id: applicationData.iconId
          ? parseInt(applicationData.iconId)
          : existingApplication.icon_id,
        version: applicationData.version || existingApplication.version,
        description:
          applicationData.description || existingApplication.description,
        ...fileData,
      });

      // Return updated application dengan relations
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: number) {
    try {
      // Find application to delete
      const applicationToDelete = await this.applicationsRepository.findOne({
        where: { id },
      });

      if (!applicationToDelete) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }

      // Delete file if exists
      if (applicationToDelete.file_path) {
        const filePath = path.join(
          process.cwd(),
          'public',
          applicationToDelete.file_path,
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete application
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
    };

    return typeMap[fileExt.toLowerCase()] || 'Unknown';
  }
}
