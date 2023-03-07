import { CoreModule } from '@app/core/core.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './models/upload.model';

@Module({
    imports: [
        CoreModule.forRoot(),
        TypeOrmModule.forFeature([Upload]),
    ],
})
export class UploadsModule {}
