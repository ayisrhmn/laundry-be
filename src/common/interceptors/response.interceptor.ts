import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { PaginatedResult } from '../dto/paginated.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Success';

    return next.handle().pipe(
      map((result: unknown) => {
        const isPaginated =
          result !== null &&
          typeof result === 'object' &&
          'pagination' in result;

        if (isPaginated) {
          const { data, pagination } = result as PaginatedResult<unknown>;
          return { message, status: response.statusCode, data, pagination };
        }

        return {
          message,
          status: response.statusCode,
          data: (result ?? null) as unknown,
        };
      }),
    );
  }
}
