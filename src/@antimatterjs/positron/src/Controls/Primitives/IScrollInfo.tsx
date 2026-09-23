import { Binding, Event } from '@antimatterjs/react';

export interface IScrollInfo
{
    ExtentHeight: number;
    ExtentWidth: number;
    HorizontalOffset: number;
    VerticalOffset: number;
    SetHorizontalOffset(offset: number);
    SetVerticalOffset(offset: number);
    ActualWidth: number;
    ActualHeight: number;
    Scroll: Event<void>;
}