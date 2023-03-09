export class LimitExceededException extends Error {
    public constructor(
        public readonly limit: number | null = null,
        public readonly received: number | null = null,
    ) {
        super('Limit exceeded');
    }
}