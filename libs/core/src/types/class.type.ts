export interface Class<T = object> {
    new (...args: any[]): T;
}