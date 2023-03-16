import * as util from 'util';
import * as path from 'path';
import { TranslateOptions, I18nContext } from 'nestjs-i18n';

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
    const entries = Object.entries(object).filter(([, value]) => Boolean(value));

    return Object.fromEntries(entries) as Output;
}

/**
 * Create a new object with only given keys from source object.
 */
export function onlyKeys<T = Record<string, any>>(source: T, keys: (keyof T)[]): {[key: string]: any} {
    const target = {};

    for (const key of keys) {
        target[key as string] = source[key];
    }

    return target;
}

/**
 * Get translation for given key.
 */
export function __(key: string, options: TranslateOptions | null = null): string {
    return I18nContext.current().translate(key, options);
}

/**
 * Generate a random string.
 */
export function randomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export function benchmark(callback: () => void, iterations = 10000) {
    const begin = performance.now();

    for (let i = 0; i < iterations; i++) {
        callback();
    }

    return performance.now() - begin;
}

export function startsWith(string: string, prefix: string): boolean {
    return string.substring(0, prefix.length) === prefix;
}

export function endsWith(string: string, suffix: string): boolean {
    return string.substring(string.length - suffix.length) === suffix;
}

export async function sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function keyBy<T = Record<string, any>>(items: T[], key: string): Record<string, T> {
    const map: Record<string, T> = {};

    for (const item of items) {
        map[item[key]] = item;
    }

    return map;
}

export function fileExtension(file: string): string {
    return path.extname(file).replace('.', '').toLowerCase();
}

export function enumKeys(enumObject: object): string[] {
    return Object.keys(enumObject).filter(key => {
        return isNaN(parseInt(key));
    });
}

export function escapeLike(string: string): string {
    return string.replace('\\', '\\\\')
        .replace('_', '\\_')
        .replace('%', '\\%');
}