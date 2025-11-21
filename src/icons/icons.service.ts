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
        order: { type: 'ASC', name: 'ASC' },
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
        // Lucide React Icons
        { name: 'Layout', value: 'LayoutDashboard', type: 'system' },
        { name: 'Store', value: 'Store', type: 'system' },
        { name: 'Users', value: 'Users', type: 'system' },
        { name: 'User', value: 'User', type: 'system' },
        { name: 'Settings', value: 'Settings', type: 'system' },
        { name: 'Download', value: 'Download', type: 'system' },
        { name: 'Upload', value: 'Upload', type: 'system' },
        { name: 'File', value: 'FileText', type: 'system' },
        { name: 'Folder', value: 'Folder', type: 'system' },
        { name: 'Search', value: 'Search', type: 'system' },
        { name: 'Plus', value: 'Plus', type: 'system' },
        { name: 'Edit', value: 'Edit', type: 'system' },
        { name: 'Trash', value: 'Trash2', type: 'system' },
        { name: 'Eye', value: 'Eye', type: 'system' },
        { name: 'Refresh', value: 'RefreshCw', type: 'system' },
        { name: 'Filter', value: 'Filter', type: 'system' },
        { name: 'Bar Chart', value: 'BarChart3', type: 'system' },
        { name: 'Pie Chart', value: 'PieChart', type: 'system' },
        { name: 'Line Chart', value: 'LineChart', type: 'system' },
        { name: 'Database', value: 'Database', type: 'system' },
        { name: 'Server', value: 'Server', type: 'system' },
        { name: 'Cloud', value: 'Cloud', type: 'system' },
        { name: 'Globe', value: 'Globe', type: 'system' },
        { name: 'Mail', value: 'Mail', type: 'system' },
        { name: 'Message', value: 'MessageSquare', type: 'system' },
        { name: 'Bell', value: 'Bell', type: 'system' },
        { name: 'Calendar', value: 'Calendar', type: 'system' },
        { name: 'Clock', value: 'Clock', type: 'system' },
        { name: 'Star', value: 'Star', type: 'system' },
        { name: 'Heart', value: 'Heart', type: 'system' },
        { name: 'Bookmark', value: 'Bookmark', type: 'system' },
        { name: 'Image', value: 'Image', type: 'system' },
        { name: 'Video', value: 'Video', type: 'system' },
        { name: 'Music', value: 'Music', type: 'system' },
        { name: 'Camera', value: 'Camera', type: 'system' },
        { name: 'Phone', value: 'Phone', type: 'system' },
        { name: 'Tablet', value: 'Tablet', type: 'system' },
        { name: 'Monitor', value: 'Monitor', type: 'system' },
        { name: 'Printer', value: 'Printer', type: 'system' },
        { name: 'Mouse', value: 'Mouse', type: 'system' },
        { name: 'Keyboard', value: 'Keyboard', type: 'system' },
        { name: 'Headphones', value: 'Headphones', type: 'system' },
        { name: 'Mic', value: 'Mic', type: 'system' },
        { name: 'Speaker', value: 'Speaker', type: 'system' },
        { name: 'Gamepad', value: 'Gamepad', type: 'system' },
        { name: 'Code', value: 'Code', type: 'system' },
        { name: 'Terminal', value: 'Terminal', type: 'system' },
        { name: 'Cog', value: 'Cog', type: 'system' },
        { name: 'Wrench', value: 'Wrench', type: 'system' },
        { name: 'Tool', value: 'Tool', type: 'system' },
        { name: 'Shield', value: 'Shield', type: 'system' },
        { name: 'Lock', value: 'Lock', type: 'system' },
        { name: 'Key', value: 'Key', type: 'system' },
        { name: 'Eye Off', value: 'EyeOff', type: 'system' },
        { name: 'Check Circle', value: 'CheckCircle', type: 'system' },
        { name: 'X Circle', value: 'XCircle', type: 'system' },
        { name: 'Alert Circle', value: 'AlertCircle', type: 'system' },
        { name: 'Info', value: 'Info', type: 'system' },
        { name: 'Help Circle', value: 'HelpCircle', type: 'system' },
        { name: 'External Link', value: 'ExternalLink', type: 'system' },
        { name: 'Link', value: 'Link', type: 'system' },
        { name: 'Share', value: 'Share', type: 'system' },
        { name: 'Copy', value: 'Copy', type: 'system' },
        { name: 'Save', value: 'Save', type: 'system' },
        { name: 'Home', value: 'Home', type: 'system' },
        { name: 'Building', value: 'Building', type: 'system' },
        { name: 'Map', value: 'Map', type: 'system' },
        { name: 'Navigation', value: 'Navigation', type: 'system' },
        { name: 'Compass', value: 'Compass', type: 'system' },
        { name: 'Car', value: 'Car', type: 'system' },
        { name: 'Plane', value: 'Plane', type: 'system' },
        { name: 'Ship', value: 'Ship', type: 'system' },
        { name: 'Rocket', value: 'Rocket', type: 'system' },
        { name: 'Coffee', value: 'Coffee', type: 'system' },
        { name: 'Shopping Cart', value: 'ShoppingCart', type: 'system' },
        { name: 'Credit Card', value: 'CreditCard', type: 'system' },
        { name: 'Dollar Sign', value: 'DollarSign', type: 'system' },
        { name: 'Euro', value: 'Euro', type: 'system' },
        { name: 'Bitcoin', value: 'Bitcoin', type: 'system' },
        { name: 'Activity', value: 'Activity', type: 'system' },
        { name: 'Trending Up', value: 'TrendingUp', type: 'system' },
        { name: 'Trending Down', value: 'TrendingDown', type: 'system' },
        { name: 'Award', value: 'Award', type: 'system' },
        { name: 'Medal', value: 'Medal', type: 'system' },
        { name: 'Crown', value: 'Crown', type: 'system' },
        { name: 'Flag', value: 'Flag', type: 'system' },
        { name: 'Book', value: 'Book', type: 'system' },
        { name: 'Book Open', value: 'BookOpen', type: 'system' },
        { name: 'Feather', value: 'Feather', type: 'system' },
        { name: 'Pen Tool', value: 'PenTool', type: 'system' },
        { name: 'Brush', value: 'Brush', type: 'system' },
        { name: 'Palette', value: 'Palette', type: 'system' },
        { name: 'Layers', value: 'Layers', type: 'system' },
        { name: 'Grid', value: 'Grid', type: 'system' },
        { name: 'Layout Grid', value: 'LayoutGrid', type: 'system' },
        { name: 'List', value: 'List', type: 'system' },
        { name: 'Menu', value: 'Menu', type: 'system' },
        { name: 'More Horizontal', value: 'MoreHorizontal', type: 'system' },
        { name: 'More Vertical', value: 'MoreVertical', type: 'system' },
        { name: 'Chevron Down', value: 'ChevronDown', type: 'system' },
        { name: 'Chevron Up', value: 'ChevronUp', type: 'system' },
        { name: 'Chevron Left', value: 'ChevronLeft', type: 'system' },
        { name: 'Chevron Right', value: 'ChevronRight', type: 'system' },
        { name: 'Arrow Up', value: 'ArrowUp', type: 'system' },
        { name: 'Arrow Down', value: 'ArrowDown', type: 'system' },
        { name: 'Arrow Left', value: 'ArrowLeft', type: 'system' },
        { name: 'Arrow Right', value: 'ArrowRight', type: 'system' },
        { name: 'Move', value: 'Move', type: 'system' },
        { name: 'Rotate', value: 'RotateCw', type: 'system' },
        { name: 'Zoom In', value: 'ZoomIn', type: 'system' },
        { name: 'Zoom Out', value: 'ZoomOut', type: 'system' },
        { name: 'Maximize', value: 'Maximize', type: 'system' },
        { name: 'Minimize', value: 'Minimize', type: 'system' },
        { name: 'X', value: 'X', type: 'system' },
        { name: 'Plus Circle', value: 'PlusCircle', type: 'system' },
        { name: 'Minus Circle', value: 'MinusCircle', type: 'system' },
        { name: 'Multiply', value: 'X', type: 'system' },
        { name: 'Divide', value: 'Divide', type: 'system' },
      ];

      for (const iconData of systemIcons) {
        const existingIcon = await this.iconsRepository.findOne({
          where: { value: iconData.value, type: 'system' },
        });

        if (!existingIcon) {
          const icon = this.iconsRepository.create(iconData);
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

  async createCustomIcon(file: Express.Multer.File, name: string) {
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'icons');

      // Ensure upload directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const fileName = `icon-${Date.now()}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);

      // Save file
      fs.writeFileSync(filePath, file.buffer);

      // Create icon record
      const icon = this.iconsRepository.create({
        name: name || file.originalname,
        value: fileName,
        type: 'custom',
        file_path: `uploads/icons/${fileName}`,
        file_name: file.originalname,
        file_size: file.size,
      });

      const savedIcon = await this.iconsRepository.save(icon);
      return savedIcon;
    } catch (error) {
      throw new HttpException(
        'Failed to create custom icon',
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
}
