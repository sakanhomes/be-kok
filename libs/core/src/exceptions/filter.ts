import {
    ExceptionFilter as FilterContract,
    Catch,
    ArgumentsHost,
    LoggerService,
    HttpStatus,
    ForbiddenException,
    NotFoundException as HttpNotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationException } from './app/application.exception';
import { NotFoundException } from './app/not-found.exception';
import { UnprocessableException } from './app/unprocessable.exception';
import { BadRequestException } from './http/bad-request.exception';
import { ServerErrorException } from './http/server-error.exception';
import { UnauthorizedException } from './http/unauthorized.exception';

@Catch()
export default class ExceptionFilter implements FilterContract<Error> {
    private dontReport = [
        HttpNotFoundException,
        UnauthorizedException,
        UnprocessableException,
        ForbiddenException,
    ];

    public constructor(private readonly logger: LoggerService) { }

    public catch(exception: any, host: ArgumentsHost) {
        if (this.shouldReport(exception)) {
            console.log(exception);
            this.logger.error(exception);
        }

        exception = this.transform(exception) as ServerErrorException;

        this.response(host, exception);
    }

    // TODO Handle invalid JSON (bad request exception)
    protected transform(error: any): ServerErrorException {
        if (error instanceof HttpNotFoundException) {
            return this.buildNotFoundException();
        } else if (error instanceof ForbiddenException) {
            return new UnauthorizedException();
        }

        if (error instanceof UnprocessableException) {
            return new BadRequestException(error.data, error.message);
        } else if (error instanceof NotFoundException) {
            return this.buildNotFoundException(error.data, error.message);
        } else if (error instanceof ApplicationException) {
            return new ServerErrorException(error.data, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ServerErrorException();
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