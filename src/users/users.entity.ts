import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nama: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  badge: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telp: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  departemen: string;

  @Column({ type: 'varchar', length: 20, default: 'admin' })
  role: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}