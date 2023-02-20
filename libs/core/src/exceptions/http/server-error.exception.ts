import { HttpException, HttpStatus } from '@nestjs/common';

export class ServerErrorException extends HttpException {
    constructor(
        data: object = {},
        message = 'Internal server error',
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
