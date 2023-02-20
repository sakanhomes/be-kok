import { format } from 'winston';

export class Format {
    public static default() {
        return format.combine(
            this.errors(),
            this.timestamp(),
            this.template(),
        )
    }

    public static template() {
        return format.printf(({ timestamp, level, message, stack, ...meta }) => {
            const nestScope = meta[Symbol.for('splat')] ?? null;

            if (nestScope && typeof nestScope === 'string') {              
                message = `[${nestScope}] ${message}`;
            }

            const metaJson = JSON.stringify(meta);
            stack = stack ? '\n' + stack : '';

            return `[${timestamp}] ${level}: ${message} ${metaJson}${stack}`;
        })
    }

    public static errors() {
        return format((info) => {
            if (!(info.message instanceof Error)) {
                return info;
            }

            const error = info.message;
            info.message = error.message;
            info.stack = this.stringifyErrorStack(error);

            return info;
        })();
    }

    public static timestamp() {
        return format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        })
    }

    /**
     * Recursively stringify error stack.
     */
    private static stringifyErrorStack(error: any): string {
        if (!(error instanceof Error)) {
            let type = typeof error;

            if (type === 'object' && error.constructor.name !== 'Object') {
                type = error.constructor.name;
            }

            throw new TypeError(`Only subclasses of Error can be stringified, ${type}) is given`);
        }

        error = error as any;

        let string = error.stack;

        if (error.data) {
            string = this.injectDataToStack(string, error.data);
        }

        if (error.cause) {
            string += '\n' + this.stringifyErrorStack(error.cause);
        }

        return string;
    }

    /**
     * Inject data into error stack (before first new line).
     */
    private static injectDataToStack(stack: string, data: object | Array<any>): string {
        const firstNewLine = stack.indexOf('\n');

        if (firstNewLine === -1) {
            throw new Error(`Unknown stack format encountered: "${stack}"`);
        }

        return stack.substring(0, firstNewLine) + ' ' + JSON.stringify(data) + stack.substring(firstNewLine);
    }
}