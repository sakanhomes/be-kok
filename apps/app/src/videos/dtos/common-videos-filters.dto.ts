import { Category } from '../enums/category.enum';

export class CommonVideosFiltersDto {
    public amount?: number;
    public category?: keyof Category;
}