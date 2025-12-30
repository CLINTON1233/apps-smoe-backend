import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from './applications.entity';
import { Category } from '../categories/categories.entity';
import { Icon } from '../icons/icons.entity';
import { FtpService } from '../shared/ftp.service'; 
@Module({
  imports: [TypeOrmModule.forFeature([Application, Category, Icon])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, FtpService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}