import { CoreModule } from '@app/core/core.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [CoreModule.forRoot()],
})
export class UploadsModule {}
