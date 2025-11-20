import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';
import { Icon } from './icons.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Icon])],
  controllers: [IconsController],
  providers: [IconsService],
  exports: [IconsService],
})
export class IconsModule {}
