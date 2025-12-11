import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Icon } from './icons.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class IconsService {
  constructor(
    @InjectRepository(Icon)
    private iconsRepository: Repository<Icon>,
  ) {}

  async findAll() {
    try {
      const icons = await this.iconsRepository.find({
        order: { category: 'ASC', name: 'ASC' },
      });
      return icons;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve icons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: number) {
    try {
      const icon = await this.iconsRepository.findOne({
        where: { id },
      });

      if (!icon) {
        throw new HttpException('Icon not found', HttpStatus.NOT_FOUND);
      }
      return icon;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve icon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  

  async createSystemIcons() {
    try {
      const systemIcons = [
        // Navigation
        { name: 'Dashboard', icon_key: 'LayoutDashboard', category: 'Navigation' },
        { name: 'Home', icon_key: 'Home', category: 'Navigation' },
        { name: 'Settings', icon_key: 'Settings', category: 'Navigation' },
        { name: 'Menu', icon_key: 'Menu', category: 'Navigation' },
        { name: 'List', icon_key: 'List', category: 'Navigation' },
        
        // Files
        { name: 'File', icon_key: 'FileText', category: 'Files' },
        { name: 'Folder', icon_key: 'Folder', category: 'Files' },
        { name: 'Download', icon_key: 'Download', category: 'Files' },
        { name: 'Upload', icon_key: 'Upload', category: 'Files' },
        { name: 'Save', icon_key: 'Save', category: 'Files' },
        
        // Actions
        { name: 'Plus', icon_key: 'Plus', category: 'Actions' },
        { name: 'Edit', icon_key: 'Edit', category: 'Actions' },
        { name: 'Trash', icon_key: 'Trash2', category: 'Actions' },
        { name: 'Eye', icon_key: 'Eye', category: 'Actions' },
        { name: 'Refresh', icon_key: 'RefreshCw', category: 'Actions' },
        { name: 'Search', icon_key: 'Search', category: 'Actions' },
        { name: 'Filter', icon_key: 'Filter', category: 'Actions' },
        
        // Applications
        { name: 'Globe', icon_key: 'Globe', category: 'Applications' },
        { name: 'Store', icon_key: 'Store', category: 'Applications' },
        { name: 'Database', icon_key: 'Database', category: 'Applications' },
        { name: 'Server', icon_key: 'Server', category: 'Applications' },
        { name: 'Cloud', icon_key: 'Cloud', category: 'Applications' },
        { name: 'Monitor', icon_key: 'Monitor', category: 'Applications' },
        { name: 'Smartphone', icon_key: 'Smartphone', category: 'Applications' },
        
        // Communication
        { name: 'Mail', icon_key: 'Mail', category: 'Communication' },
        { name: 'Message', icon_key: 'MessageSquare', category: 'Communication' },
        { name: 'Bell', icon_key: 'Bell', category: 'Communication' },
        { name: 'Phone', icon_key: 'Phone', category: 'Communication' },
        
        // Security
        { name: 'Lock', icon_key: 'Lock', category: 'Security' },
        { name: 'Shield', icon_key: 'Shield', category: 'Security' },
        { name: 'Key', icon_key: 'Key', category: 'Security' },
        
        // Users
        { name: 'User', icon_key: 'User', category: 'Users' },
        { name: 'Users', icon_key: 'Users', category: 'Users' },
        
        // Status
        { name: 'Check Circle', icon_key: 'CheckCircle', category: 'Status' },
        { name: 'X Circle', icon_key: 'XCircle', category: 'Status' },
        { name: 'Alert Circle', icon_key: 'AlertCircle', category: 'Status' },
        { name: 'Info', icon_key: 'Info', category: 'Status' },
        
        // Media
        { name: 'Image', icon_key: 'Image', category: 'Media' },
        { name: 'Video', icon_key: 'Video', category: 'Media' },
        { name: 'Music', icon_key: 'Music', category: 'Media' },
        { name: 'Camera', icon_key: 'Camera', category: 'Media' },
        
        // Development
        { name: 'Code', icon_key: 'Code', category: 'Development' },
        { name: 'Terminal', icon_key: 'Terminal', category: 'Development' },
        { name: 'Cog', icon_key: 'Cog', category: 'Development' },
        { name: 'Wrench', icon_key: 'Wrench', category: 'Development' },
      ];

      for (const iconData of systemIcons) {
        const existingIcon = await this.iconsRepository.findOne({
          where: { icon_key: iconData.icon_key, type: 'system' },
        });

        if (!existingIcon) {
          const icon = this.iconsRepository.create({
            ...iconData,
            type: 'system',
          });
          await this.iconsRepository.save(icon);
        }
      }

      return { message: 'System icons created successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to create system icons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
// Di fungsi createCustomIcon, perbaiki file_path:
async createCustomIcon(file: Express.Multer.File, name: string, category: string = 'Custom') {
  try {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    console.log('📦 File received:', {
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });

    // PERBAIKAN: Simpan hanya nama file, bukan path lengkap
    const iconKey = file.filename;
    const fileName = file.filename; // Hanya nama file saja

    console.log('💾 Saving to database:', {
      name: name || file.originalname.replace(/\.[^/.]+$/, ""),
      icon_key: iconKey,
      file_name: fileName
    });

    const icon = this.iconsRepository.create({
      name: name || file.originalname.replace(/\.[^/.]+$/, ""),
      icon_key: iconKey,
      category: category || 'Custom',
      type: 'custom',
      file_path: `uploads/icons/${fileName}`, // Path relatif
      file_name: fileName,
      file_size: file.size,
    });

    const savedIcon = await this.iconsRepository.save(icon);
    
    console.log('✅ Icon saved successfully:', savedIcon);
    
    return savedIcon;
  } catch (error) {
    console.error('❌ Error in createCustomIcon:', error);
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      'Failed to create custom icon: ' + error.message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


  async delete(id: number) {
    try {
      const icon = await this.iconsRepository.findOne({
        where: { id },
      });

      if (!icon) {
        throw new HttpException('Icon not found', HttpStatus.NOT_FOUND);
      }

      // Delete file if it's a custom icon
      if (icon.type === 'custom' && icon.file_path) {
        const filePath = path.join(process.cwd(), 'public', icon.file_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await this.iconsRepository.delete(id);
      return { message: 'Icon deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete icon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchIcons(search: string) {
    try {
      const query = this.iconsRepository
        .createQueryBuilder('icon')
        .where('icon.name ILIKE :search', { search: `%${search}%` })
        .orWhere('icon.icon_key ILIKE :search', { search: `%${search}%` })
        .orWhere('icon.category ILIKE :search', { search: `%${search}%` })
        .orderBy('icon.category', 'ASC')
        .addOrderBy('icon.name', 'ASC');

      return await query.getMany();
    } catch (error) {
      throw new HttpException(
        'Failed to search icons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}