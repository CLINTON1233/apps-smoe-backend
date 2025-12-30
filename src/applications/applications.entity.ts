// src/applications/applications.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/categories.entity';
import { Icon } from '../icons/icons.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'full_name', type: 'varchar', length: 500 })
  full_name: string;

  @Column({ name: 'category_id', type: 'int' })
  category_id: number;

  @Column({ name: 'icon_id', type: 'int', nullable: true })
  icon_id: number | null;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  file_name: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  file_path: string; // Path di FTP Synology

  @Column({ name: 'file_url', type: 'varchar', length: 500, nullable: true })
  file_url: string; // URL publik untuk download

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  file_size: number;

  @Column({ name: 'file_type', type: 'varchar', length: 100, nullable: true })
  file_type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'license',
    enum: ['license', 'paid'],
  })
  status: string;

  @Column({ name: 'download_count', type: 'int', default: 0 })
  download_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Category, (category) => category.applications)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Icon, (icon) => icon.id, { nullable: true })
  @JoinColumn({ name: 'icon_id' })
  icon: Icon | null;

  // Helper method untuk mendapatkan URL download
  getDownloadUrl(): string {
    if (this.file_url) {
      return this.file_url;
    }
    // Fallback ke local file jika tidak ada FTP URL
    return `/uploads/applications/${this.file_name}`;
  }
}