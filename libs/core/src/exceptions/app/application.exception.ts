export class ApplicationException extends Error {
    constructor(message = 'Application error', public readonly data: object = {}) {
        super(message);
    }
}
