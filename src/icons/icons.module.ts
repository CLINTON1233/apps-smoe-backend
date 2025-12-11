import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';
import { Icon } from './icons.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Icon]),
    MulterModule.register({
      storage: diskStorage({
        destination: './public/uploads/icons',
        filename: (req, file, cb) => {
          const randomName = `icon-${Date.now()}${extname(file.originalname)}`;
          cb(null, randomName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|svg\+xml|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [IconsController],
  providers: [IconsService],
  exports: [IconsService],
})
export class IconsModule {}
