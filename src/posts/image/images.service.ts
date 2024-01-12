import { BadRequestException, Injectable } from '@nestjs/common';
import { promises } from 'fs';
import { basename, join } from 'path';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/constants/path';
import { ImageModel } from 'src/common/entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostImageDto } from './dto/create-image.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(imageData: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const tempFilePath = join(TEMP_FOLDER_PATH, imageData.path);

    try {
      await promises.access(tempFilePath);
    } catch (error) {
      throw new BadRequestException('존재하지 않는 파일입니다.');
    }

    const fileName = basename(tempFilePath);
    const newPath = join(POST_IMAGE_PATH, fileName);

    const result = await repository.save({
      ...imageData,
    });

    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
