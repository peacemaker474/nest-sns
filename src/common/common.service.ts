import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { HOST, PROTOCOL } from './constants/env';

import { BaseModel } from './entity/base.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FILTER_MAPPER } from './constants/filter-mapper';

@Injectable()
export class CommonService {
  paginate<T extends BaseModel>(
    query: BasePaginationDto,
    repository: Repository<BaseModel>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (query.page) {
      return this.pagePaginate(query, repository, overrideFindOptions);
    }

    return this.cursorPaginate(query, repository, overrideFindOptions, path);
  }

  private async pagePaginate<T extends BaseModel>(
    query: BasePaginationDto,
    repository: Repository<BaseModel>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(query);

    const [data, count] = await repository.findAndCount({
      ...(findOptions as any),
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    query: BasePaginationDto,
    repository: Repository<BaseModel>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(query);

    const results = await repository.find({
      ...(findOptions as any),
      ...(overrideFindOptions as any),
    });

    const lastPost =
      results.length > 0 && results.length === query.take
        ? results[results.length - 1]
        : null;
    const nextUrl = lastPost && new URL(`${PROTOCOL}://${HOST}/${path}`);

    if (nextUrl) {
      for (const key of Object.keys(query)) {
        if (
          query[key] &&
          key !== 'where__id__more_than' &&
          key !== 'where__id__less_than'
        ) {
          nextUrl.searchParams.append(key, query[key]);
        }
      }

      let key = null;

      if (query.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastPost.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastPost?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    query: BasePaginationDto,
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('where___')) {
        where = {
          ...where,
          ...this.parseOptionsFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseOptionsFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      skip: query.page ? query.take * (query.page - 1) : null,
      take: query.take,
    };
  }

  private parseOptionsFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2 또는 3이어야 합니다. - 문제되는 키값 ${key}`,
      );
    }

    if (split.length === 2) {
      const [_, field] = split;

      options[field] = value;
    } else {
      const [_, field, operator] = split;

      options[field] = FILTER_MAPPER[operator](value);
    }

    return options;
  }
}
