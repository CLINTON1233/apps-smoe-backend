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

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'full_name', type: 'varchar', length: 500 })
  full_name: string;

  // HAPUS BAGIAN INI
  // @Column({ type: 'varchar', length: 500 })
  // url: string;

  @Column({ name: 'category_id', type: 'int' })
  category_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  file_name: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  file_path: string;

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
    default: 'active',
    enum: ['active', 'inactive'],
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
}
