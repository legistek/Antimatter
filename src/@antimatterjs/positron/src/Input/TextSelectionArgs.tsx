import { Rect } from "@antimatterjs/react";

export interface ITextSelectionArgs
{
    Rects?: Rect[];
    SelectedText?: string;
    PageIndex: number;
}