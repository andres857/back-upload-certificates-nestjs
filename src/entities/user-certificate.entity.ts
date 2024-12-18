import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from './user.entity';

export enum CertificateType {
  EXTERNAL = 'external',
  LOCAL = 'local',
}

@Entity('user_certificates')
export class UserCertificate {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  user_id: number;

  @Column()
  file_path: string;

  @Column({
    type: 'enum',
    enum: CertificateType,
    default: CertificateType.LOCAL,
  })
  type: CertificateType;

  @Column({ type: 'date' })
  issue_date: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'json', nullable: true })
  user_snapshot: any;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'text', nullable: true })
  additional_info: string;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ type: 'int', unsigned: true, nullable: true })
  client_id: number;
}
