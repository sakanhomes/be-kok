import { Category } from '../enums/category.enum';

export class CommonVideosFiltersDto {
    public category?: keyof Category;
}