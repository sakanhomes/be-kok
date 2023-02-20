import { FileChannel, FileChannelOptions } from './file.channel';
import * as path from 'path';

export default class DailyChannel extends FileChannel {
    public constructor(options: FileChannelOptions) {
        const date = new Date().toISOString().slice(0, 10);
        const dir = path.dirname(options.file);
        const [name, extension] = path.basename(options.file).split('.', 2);

        super({
            file: path.join(dir, `${name}-${date}.${extension}`),
        });
    }
}
