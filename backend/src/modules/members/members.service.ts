import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from './entities/member.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {}

  async findAll(): Promise<MemberEntity[]> {
    return this.memberRepository.find({ order: { id_miembro: 'ASC' } });
  }

  async findOne(id: number): Promise<MemberEntity | null> {
    return this.memberRepository.findOne({ where: { id_miembro: id } });
  }

  // Las columnas de fecha en la base de datos real son tipo `date`:
  // cadenas vacías ('') provocan error de sintaxis en PostgreSQL.
  // Se convierten a NULL para que el registro funcione.
  private sanitizeDateFields(data: Partial<MemberEntity>): void {
    const camposFecha = ['fecha_nacimiento', 'fecha_conversion', 'fecha_bautizo'] as const;
    for (const campo of camposFecha) {
      const valor = (data as any)[campo];
      if (valor === '' || valor === undefined || valor === null) {
        if (campo === 'fecha_nacimiento') continue; // campo obligatorio (NOT NULL)
        (data as any)[campo] = null;
        continue;
      }
      const fecha = new Date(valor as string);
      if (isNaN(fecha.getTime()) && campo !== 'fecha_nacimiento') {
        (data as any)[campo] = null;
      }
    }
    // telefono es bigint: cadena vacía o 0 tampoco es válido
    if ((data as any).telefono === '' || (data as any).telefono === 0) {
      (data as any).telefono = null;
    }
  }

  async create(data: Partial<MemberEntity>): Promise<MemberEntity> {
    this.sanitizeDateFields(data);
    const newMember = this.memberRepository.create(data);
    return this.memberRepository.save(newMember);
  }

  async update(id: number, data: Partial<MemberEntity>): Promise<MemberEntity | null> {
    this.sanitizeDateFields(data);
    const member = await this.findOne(id);
    if (!member) return null;
    Object.assign(member, data);
    return this.memberRepository.save(member);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.memberRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
