import { CommentsSort } from '../enums/comments-sort.enum';

export class CommentsFiltersDto {
    public sort?: keyof CommentsSort;
}