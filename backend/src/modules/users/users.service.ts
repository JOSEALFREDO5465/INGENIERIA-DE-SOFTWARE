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
    // La base de datos se gestiona mediante el script SQL en /base de datos.
    // No se realizan seeds ni sincronizaciones automáticas.
    console.log('--- UsersService inicializado. Asegúrese de haber importado el script SQL.');
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
