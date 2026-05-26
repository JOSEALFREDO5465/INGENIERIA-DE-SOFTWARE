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

  async create(data: Partial<MemberEntity>): Promise<MemberEntity> {
    const newMember = this.memberRepository.create(data);
    return this.memberRepository.save(newMember);
  }

  async update(id: number, data: Partial<MemberEntity>): Promise<MemberEntity | null> {
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
