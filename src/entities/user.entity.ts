import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  //   ManyToOne,
  //   OneToMany,
} from 'typeorm';

// import { Client } from './client.entity';
// import { UserCertificate } from './user-certificate.entity';

export enum IdentificationType {
  AA = 'AA',
  CC = 'CC',
  CE = 'CE',
  PA = 'PA',
  RC = 'RC',
  TI = 'TI',
}

export enum UserType {
  VISITANTE = 'visitante',
  PACIENTE = 'paciente',
  CUIDADOR = 'cuidador',
  NINGUNO = 'ninguno',
  FUNCIONARIO = 'funcionario',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: 'timestamp' })
  email_verified_at: Date;

  @Column({ nullable: true })
  password: string;

  // @Column({ nullable: true, type: 'text' })
  // two_factor_secret: string;

  @Column({ nullable: true, type: 'text' })
  two_factor_recovery_codes: string;

  @Column({ nullable: true, type: 'timestamp' })
  two_factor_confirmed_at: Date;

  @Column({ default: false })
  approved: boolean;

  @Column({ default: false })
  notifications: boolean;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'int', unsigned: true })
  client_id: number;

  @Column({ nullable: true, type: 'datetime' })
  last_login_at: Date;

  @Column({ nullable: true, length: 100 })
  remember_token: string;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @Column({ nullable: true, length: 20 })
  identification: string;

  @Column({
    type: 'enum',
    enum: IdentificationType,
    default: IdentificationType.AA,
  })
  identification_type: IdentificationType;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.NINGUNO,
    nullable: true,
  })
  type: UserType;

  @Column({ nullable: true })
  facebook_user_id: string;

  @Column({ nullable: true, type: 'int', unsigned: true })
  creator_id: number;

  @Column({ default: false })
  is_private: boolean;

  @Column({ nullable: true })
  charge: string;

  @Column({ nullable: true })
  codigo_tm: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'text' })
  login_dates: string;

  @Column({ nullable: true })
  last_session: string;

  @Column({ default: false })
  has_greenlight_account: boolean;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  external_id: string;

  @Column({ nullable: true })
  external_auth: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  status_validation: string;

  @Column({ nullable: true })
  registerd_sex_user: string;

  @Column({ nullable: true })
  registerd_status_civil_user: string;

  @Column({ nullable: true })
  registerd_city_user: string;

  @Column({ nullable: true })
  registerd_direction_user: string;

  @Column({ nullable: true })
  user_type_haus_user: string;

  @Column({ nullable: true })
  registerd_age_user: string;

  @Column({ nullable: true })
  prefix: string;

  @Column({ nullable: true, type: 'text' })
  camp_1: string;

  @Column({ nullable: true, type: 'text' })
  camp_2: string;

  @Column({ nullable: true, type: 'text' })
  camp_3: string;

  @Column({ nullable: true, type: 'text' })
  camp_4: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status_user: string;
}
