import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('icons')
export class Icon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'icon_key', type: 'varchar', length: 100 })
  icon_key: string;

  @Column({ type: 'varchar', length: 50, default: 'General' })
  category: string;

  @Column({ type: 'varchar', length: 20, default: 'system' })
  type: string; // 'system' atau 'custom'

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  file_path: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  file_name: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  file_size: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}