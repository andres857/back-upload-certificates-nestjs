import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { User } from 'src/entities/user.entity';
import {
  UserCertificate,
  CertificateType,
} from 'src/entities/user-certificate.entity';
import { log } from 'console';
@Injectable()
export class KalmsystemService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCertificate)
    private readonly certificateRepository: Repository<UserCertificate>,
  ) {}

  // async findAll() {
  //   return await this.userRepository.find({
  //     where: {
  //       status_user: 'active',
  //       name: Not(''),
  //     },
  //     order: {
  //       created_at: 'DESC',
  //     },
  //   });
  // }
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    return user;
  }

  async findByIdentification(identification: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { identification },
    });

    return user;
  }

  async writeCertificateData(
    user_id: string,
    certificate_name: string,
    url_certificate: string,
  ) {
    let id, client_id;
    const user_id_number = parseInt(user_id);
    try {
      const user = await this.findById(user_id_number);
      if (user) {
        ({ id, client_id } = user);

        const certificate = new UserCertificate();
        certificate.user_id = id;
        certificate.client_id = 72;
        certificate.file_path = url_certificate;
        certificate.type = CertificateType.EXTERNAL;
        certificate.issue_date = new Date();
        certificate.name = certificate_name;
        certificate.user_snapshot = user;
        console.log('certificate', certificate);
        await this.certificateRepository.save(certificate);
      }
    } catch (error) {
      console.log(error);
      throw new Error('Error al guardar el certificado');
    }
  }
}
