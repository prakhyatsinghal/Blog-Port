import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CreateCommentDTO, CommentResponse } from 'src/models/comment.models';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepo: Repository<CommentEntity>,
  ) {}

  async findByArticleSlug(slug: string): Promise<CommentResponse[]> {
    const where: FindOptionsWhere<CommentEntity> = { article: { slug } };
    const comments = await this.commentRepo.find({
      where,
      relations: ['article'],
    });
    return comments;
  }

  findById(id: number): Promise<CommentResponse> {
    return this.commentRepo.findOne({ where: { id } });
  }

  async createComment(
    user: UserEntity,
    data: CreateCommentDTO,
  ): Promise<CommentResponse> {
    const comment = this.commentRepo.create(data);
    comment.author = user;
    await comment.save();
    return this.commentRepo.findOne({ where: { body: data.body } });
  }

  async deleteComment(user: UserEntity, id: number): Promise<CommentResponse> {
    const where: FindOptionsWhere<CommentEntity> = { id };
    const comment = await this.commentRepo
      .createQueryBuilder()
      .where(where)
      .andWhere('author.id = :userId', { userId: user.id })
      .getOne();
    await comment.remove();
    return comment;
  }
}
