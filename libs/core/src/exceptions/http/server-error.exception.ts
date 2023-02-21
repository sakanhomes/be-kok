import { HttpException, HttpStatus } from '@nestjs/common';

export class ServerErrorException extends HttpException {
    constructor(
        data: object = {},
        message: string | object = 'Internal server error',
        status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    ) {
        super(
            {
                status,
                message,
                data,
            },
            status,
        );
    }
}
