// src/applications/applications.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './applications.entity';
import { Icon } from '../icons/icons.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    
    @InjectRepository(Icon)
    private iconsRepository: Repository<Icon>,
  ) {}
async findAll() {
  try {
    const applications = await this.applicationsRepository.find({
      relations: ['category', 'icon'],
      order: { id: 'ASC' },
    });
    
    // PERBAIKAN: Jangan transform data icon
    return applications.map(app => ({
      ...app,
      // Jangan ubah icon object
    }));
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

// PERBAIKAN: Ganti fungsi create() dan update() di applications.service.ts
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
    console.log('Icon ID from form:', applicationData.iconId);

    // Handle icon selection atau upload
    let iconId: number | null = null;
    
    // PERBAIKAN: Handle iconId dengan benar
    if (applicationData.iconId && applicationData.iconId !== 'null' && applicationData.iconId !== '') {
      const iconIdNumber = parseInt(applicationData.iconId);
      if (!isNaN(iconIdNumber) && iconIdNumber > 0) {
        // Cek apakah icon ada di database
        const icon = await this.iconsRepository.findOne({
          where: { id: iconIdNumber },
        });
        
        if (icon) {
          iconId = icon.id;
          console.log('Icon found:', { id: icon.id, name: icon.name, icon_key: icon.icon_key });
        } else {
          console.log('Icon not found with ID:', iconIdNumber);
        }
      }
    }

    // Handle file upload (installation file)
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

    console.log('Creating application with icon_id:', iconId);

    // Create new application
    const newApplication = this.applicationsRepository.create({
      title: applicationData.title.trim(),
      full_name: applicationData.fullName.trim(),
      category_id: parseInt(applicationData.categoryId),
      icon_id: iconId, // Bisa null atau number
      version: applicationData.version || '1.0.0',
      description: applicationData.description || '',
      ...fileData,
    } as Partial<Application>);

    const savedApplication = await this.applicationsRepository.save(newApplication);

    // Return application with relations
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

    console.log('Application created successfully:', {
      id: applicationWithRelations.id,
      icon_id: applicationWithRelations.icon_id,
      icon: applicationWithRelations.icon
    });

    return applicationWithRelations;
  } catch (error) {
    console.error('Error creating application:', error);
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

    console.log('UPDATE APPLICATION DATA:', applicationData);
    console.log('Existing icon_id:', existingApplication.icon_id);
    console.log('New iconId from form:', applicationData.iconId);

    // Handle icon update
    let iconId: number | null = existingApplication.icon_id;
    
    // PERBAIKAN: Handle icon update dengan benar
    if (applicationData.iconId === 'null' || applicationData.iconId === '') {
      iconId = null;
    } else if (applicationData.iconId && applicationData.iconId !== 'null' && applicationData.iconId !== '') {
      const iconIdNumber = parseInt(applicationData.iconId);
      if (!isNaN(iconIdNumber) && iconIdNumber > 0) {
        const icon = await this.iconsRepository.findOne({
          where: { id: iconIdNumber },
        });
        
        if (icon) {
          iconId = icon.id;
          console.log('Updated icon:', { id: icon.id, name: icon.name });
        } else {
          console.log('Icon not found with ID:', iconIdNumber);
          // Jika icon tidak ditemukan, set ke null
          iconId = null;
        }
      }
    }

    console.log('Updating application with icon_id:', iconId);

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
      icon_id: iconId, // Update icon_id
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

    console.log('Application updated successfully:', {
      id: updatedApplication.id,
      icon_id: updatedApplication.icon_id,
      icon: updatedApplication.icon
    });

    return updatedApplication;
  } catch (error) {
    console.error('Error updating application:', error);
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
      '.app': 'Mac OS Application',
      '.dll': 'Windows DLL',
      '.bin': 'Binary File',
      '.iso': 'Disk Image',
    };

    return typeMap[fileExt.toLowerCase()] || 'Unknown';
  }
}