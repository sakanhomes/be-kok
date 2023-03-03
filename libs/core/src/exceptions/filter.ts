import {
    ExceptionFilter as FilterContract,
    Catch,
    ArgumentsHost,
    LoggerService,
    HttpStatus,
    ForbiddenException as NestForbiddenException,
    NotFoundException as HttpNotFoundException,
    UnauthorizedException as NestUnauthorizedException,
    BadRequestException as NestBadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError } from 'typeorm';
import { ApplicationException } from './app/application.exception';
import { ForbiddenException } from './app/forbidden.exception';
import { ForbiddenException as HttpForbiddenException } from './http/forbidden.exception';
import { NotFoundException } from './app/not-found.exception';
import { UnprocessableException } from './app/unprocessable.exception';
import { ValidationException } from './app/validation.exception';
import { BadRequestException } from './http/bad-request.exception';
import { ServerErrorException } from './http/server-error.exception';
import { TooManyRequestsException } from './http/too-many-requests.exception';
import { UnauthorizedException } from './http/unauthorized.exception';
import { UnprocessableEntityException } from './http/unprocessable-entity.exception';

@Catch()
export default class ExceptionFilter implements FilterContract<Error> {
    private dontReport = [
        HttpNotFoundException,
        ValidationException,
        UnauthorizedException,
        NestUnauthorizedException,
        UnprocessableException,
        NestForbiddenException,
        TooManyRequestsException,
        EntityNotFoundError,
        ForbiddenException,
        NestBadRequestException,
    ];

    public constructor(private readonly logger: LoggerService) {}

    public catch(exception: any, host: ArgumentsHost) {
        if (this.shouldReport(exception)) {
            console.log(exception);
            this.logger.error(exception);
        }

        exception = this.transform(exception) as ServerErrorException;

        this.response(host, exception);
    }

    protected transform(error: any): ServerErrorException {
        if (error instanceof HttpNotFoundException || error instanceof EntityNotFoundError) {
            return this.buildNotFoundException();
        } else if (error instanceof NestForbiddenException) {
            return new UnauthorizedException();
        } else if (error instanceof NestUnauthorizedException) {
            return new UnauthorizedException();
        } else if (error instanceof NestBadRequestException) {
            return new BadRequestException({}, error.message);
        }

        if (error instanceof ValidationException) {
            return new UnprocessableEntityException(error.errors);
        } else if (error instanceof UnprocessableException) {
            return new BadRequestException(error.data, error.message);
        } else if (error instanceof NotFoundException) {
            return this.buildNotFoundException(error.data, error.message);
        } else if (error instanceof ForbiddenException) {
            return new HttpForbiddenException(error.data, error.message);
        } else if (error instanceof ApplicationException) {
            return new ServerErrorException(error.data, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return error instanceof ServerErrorException ? error : new ServerErrorException();
    }

    protected buildNotFoundException(data: object = {}, message = 'Requested resource not found') {
        return new HttpNotFoundException({ message, data });
    }

    protected response(host: ArgumentsHost, exception: ServerErrorException): void {
        const response = host.switchToHttp().getResponse<Response>();

        response.status(exception.getStatus()).json(exception.getResponse());
    }

    protected shouldReport(error: any): boolean {
        return this.dontReport.every((exception) => !(error instanceof exception));
    }
}
