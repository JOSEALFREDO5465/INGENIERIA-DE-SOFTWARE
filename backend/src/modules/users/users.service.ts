import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    // SEED: Automatically prompt Tito with 1234 if the database has zero users
    const userCount = await this.userRepository.count();
    if (userCount === 0) {
      console.log('--- Database empty. Seeding administration root user "Tito" (password: 1234)...');
      const hashedPassword = await bcrypt.hash('1234', 10);
      const admin = this.userRepository.create({
        nombre_completo: 'Tito',
        nombre_usuario: 'Tito',
        correo: 'tito@filadelfia.org',
        contrasena: hashedPassword,
        fecha_registro: new Date().toISOString(),
        ultimo_acceso: '',
        rol: 'admin',
        aprobado: true,
      });
      await this.userRepository.save(admin);
      console.log('--- Root administration user seeded successfully.');
    }
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({ order: { id_usuario: 'ASC' } });
  }

  async findOne(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id_usuario: id } });
  }

  async findByUsernameOrEmail(identifier: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: [
        { nombre_usuario: identifier },
        { correo: identifier }
      ]
    });
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    if (user.contrasena) {
      user.contrasena = await bcrypt.hash(user.contrasena, 10);
    }
    user.fecha_registro = new Date().toISOString();
    user.ultimo_acceso = '';
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async update(id: number, data: Partial<UserEntity>): Promise<UserEntity | null> {
    const user = await this.findOne(id);
    if (!user) return null;

    if (data.contrasena && data.contrasena !== user.contrasena) {
      data.contrasena = await bcrypt.hash(data.contrasena, 10);
    }

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async approve(id: number): Promise<UserEntity | null> {
    const user = await this.findOne(id);
    if (!user) return null;
    user.aprobado = true;
    return this.userRepository.save(user);
  }
}
