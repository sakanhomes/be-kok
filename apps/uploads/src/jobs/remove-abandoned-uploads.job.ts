import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { timestamp } from '@app/core/helpers';
import { Logger } from '@app/core/logging/decorators/logger.decorator';
import { Inject, Injectable, LoggerService, OnApplicationBootstrap } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { UPLOADS_CONFIG } from '../constants';
import { UploadStatus } from '../enums/upload-status.enum';
import { UploadPart } from '../models/upload-part.model';
import { Upload } from '../models/upload.model';
import { UploadsHelper } from '../uploads.helper';
import { UploadType } from '../enums/upload-type.enum';
import { CronJob } from 'cron';

@Injectable()
export class RemoveAbandonedUploadsJob implements OnApplicationBootstrap {
    private readonly helper: UploadsHelper;
    private readonly job: CronJob;

    public constructor(
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
        @InjectRepository(UploadPart)
        private readonly parts: Repository<UploadPart>,
        @Logger('uploads')
        private readonly logger: LoggerService,
        private readonly aws: AwsS3Service,
        @Inject(UPLOADS_CONFIG)
        private readonly config: Record<string, any>,
    ) {
        this.helper = new UploadsHelper({
            logger: this.logger,
            uploads: this.uploads,
            parts: this.parts,
        });
        this.job = new CronJob(CronExpression.EVERY_DAY_AT_MIDNIGHT, () => this.run());
    }

    public onApplicationBootstrap() {
        if (!this.config.enableAbandonedUploadsRemover) {
            return;
        }

        this.job.start();
    }

    public async run(): Promise<void> {
        await this.chunkAbandonedUploads(25, async (uploads) => {
            for (const upload of uploads) {
                if (upload.type === UploadType.single) {
                    await this.removeSingleUpload(upload);
                } else {
                    this.removeMultipartUploadInBackground(upload);
                }
            }
        });
    }

    private async removeSingleUpload(upload: Upload): Promise<void> {
        try {
            await this.aws.delete({
                Bucket: this.config.awsBucket,
                Key: upload.filename,
            });
            await this.uploads.remove(upload);
        } catch (error) {
            this.logger.error(`Failed to remove abandoned single upload [${upload.id}]: ${error?.message}`, { upload });
            this.logger.error(error);
        }
    }

    private async removeMultipartUploadInBackground(upload: Upload): Promise<void> {
        try {
            if (upload.status === UploadStatus.completed) {
                await this.aws.delete({
                    Bucket: this.config.awsBucket,
                    Key: upload.filename,
                });
                await Promise.all([
                    this.parts.delete({
                        uploadId: upload.id,
                    }),
                    this.uploads.remove(upload),
                ]);
            } else {
                await this.markUploadAsFailed(upload);
                await this.helper.allPartUploadsFinished(upload);
                await this.aws.abortUpload({
                    Bucket: this.config.awsBucket,
                    Key: upload.filename,
                    UploadId: upload.publicId,
                });
                await Promise.all([
                    this.parts.delete({
                        uploadId: upload.id,
                    }),
                    this.uploads.remove(upload),
                ]);
            }
        } catch (error) {
            this.logger.error(`Failed to remove abandoned multipart upload [${upload.id}]: ${error?.message}`, {
                upload,
            });
            this.logger.error(error);
        }
    }

    private async markUploadAsFailed(upload: Upload): Promise<void> {
        upload.status = UploadStatus.failed;

        await this.helper.lockUpload(upload, async (manager, upload) => {
            upload.status = UploadStatus.failed;

            await manager.save(upload);
        });
    }

    private async chunkAbandonedUploads(amount: number, callback: (uploads: Upload[]) => void) {
        const deadline = new Date((timestamp() - this.config.abandonedUploadsTtl) * 1000);
        let entities: Upload[];
        let startId = '0';

        while(true) {
            entities = await this.uploads.find({
                where: {
                    id: MoreThan(startId),
                    createdAt: LessThanOrEqual(deadline),
                },
                order: {
                    id: 'asc',
                },
                take: amount,
            });

            if (!entities.length) {
                return;
            }

            await callback(entities);

            startId = entities[entities.length - 1].id;
        }
    }
}