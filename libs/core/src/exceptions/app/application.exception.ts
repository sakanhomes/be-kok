export class ApplicationException extends Error {
    constructor(public readonly data: object = {}, message = 'Application error') {
        super(message);
    }
}
