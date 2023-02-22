import * as util from 'util';

/**
 * Dump method to print out passed variables.
 *
 * @param {...*} args Variables to be dumped
 */
export function dump(...args: any[]) {
    for (const arg of args) {
        console.log(
            util.inspect(arg, {
                colors: true,
                depth: 3,
            }),
        );
    }
}

/**
 * Get current timestamp in seconds.
 *
 * @returns {number}
 */
export function timestamp(): number {
    return unixtime(Date.now());
}

/**
 * Get unix time (in seconds) from given date.
 *
 * @param date {Date}
 *
 * @returns {number}
 */
export function unixtime(date: Date | number): number {
    const timestamp = date instanceof Date ? date.getTime() : date;

    return Math.round(timestamp / 1000);
}

/**
 * Determine if given timestamp is in milliseconds.
 *
 * @param timestamp {number}
 *
 * @returns {boolean}
 */
export function isMillisecondTimestamp(timestamp: number): boolean {
    return Math.abs(Date.now() - timestamp) < Math.abs(Date.now() - timestamp * 1000);
}

/**
 * Filter object and remove falsy values.
 */
export function filterObject<Input = Record<string, any>, Output = Record<string, any>>(object: Input): Output {
    const entries = Object.entries(object).filter(([key, value]) => Boolean(value));

    return Object.fromEntries(entries) as Output;
}

/**
 * Create a new object with only given keys from source object.
 */
export function onlyKeys(source: Record<string, any>, keys: string[]): Record<string, any> {
    const target = {};

    for (const key of keys) {
        target[key] = source[key];
    }

    return target;
}
