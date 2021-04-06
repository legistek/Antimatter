import * as React from 'react';
import { DependencyProperty, FrameworkPropertyMetadataOptions, PropertyMetadata } from '../DependencyProperty';
import { DependencyObject } from '../DependencyObject';
import { Binding } from '../../Binding';

type TextBlockProps = {
    Text: string | Binding
}
export class TextBlock extends DependencyObject<TextBlockProps> {
    constructor(props: TextBlockProps)
    {
        super(props);
    }

    public static TextProperty: DependencyProperty = DependencyProperty.Register(
        "Text",
        new PropertyMetadata("", FrameworkPropertyMetadataOptions.AffectsRender));
    public get Text(): string
    {
        var s = this.GetValue(TextBlock.TextProperty);
        return s as string;
    }
    public set Text(value: string)
    {
        this.SetValue(TextBlock.TextProperty, value);
    }

    /* override */renderElement(): JSX.Element
    {
        return (
            <span>{this.Text}</span>
        );
    }
}