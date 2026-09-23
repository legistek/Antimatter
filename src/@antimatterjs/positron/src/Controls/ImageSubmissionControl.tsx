import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';

import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Control, IControlProps, IControlState } from './Control';
import { WebStyle } from '../Style';
import { Grid } from './Grid';
import { HorizontalAlignment, Orientation, VerticalAlignment } from '../Enums';
import { Image } from './Image';
import { CommandButton } from './CommandButton';
import { Glyph } from './Glyph';
import { FontStyle, SemanticColor } from '../Theme';

export interface IImageSubmissionControlProps extends IControlProps
{
    ImageMaxWidth?: number | string | Binding;
    ImageMaxHeight?: number | string | Binding;
    CurrentImage?: string | Binding;
    NewImage?: string | Binding;    // data URL format
    Error?: string | Binding;
}

export class ImageSubmissionControl extends Control<IImageSubmissionControlProps>
{
    public static DefaultBindings = {
        NewImage: {
            Mode: BindingMode.TwoWay,            
        }
    };

    public static readonly DefaultStyle = new WebStyle<IImageSubmissionControlProps>({
        Template: (templatedParent: ImageSubmissionControl) =>
            <StackPanel
                Background={templatedParent.Background}
                BorderBrush={templatedParent.BorderBrush}
                BorderThickness={templatedParent.BorderThickness}
                BoxShadow={templatedParent.BoxShadow}
                Padding={templatedParent.Padding}
                Orientation={Orientation.Vertical}>
                {
                    templatedParent.CurrentImage && !templatedParent.NewImage &&
                    <Image
                        HorizontalAlignment={HorizontalAlignment.Center}
                        MaxWidth={templatedParent.ImageMaxWidth}
                        MaxHeight={templatedParent.ImageMaxHeight}
                        Uri={templatedParent.CurrentImage} />
                }
                {
                    !templatedParent.CurrentImage && !templatedParent.NewImage &&
                    <Glyph
                        FontSize={128}
                        Foreground={SemanticColor.DisabledBodyText}
                        HorizontalAlignment={HorizontalAlignment.Center}
                        Icon="PictureCenter" />
                }
                {
                    templatedParent.NewImage &&
                    <Image
                        HorizontalAlignment={HorizontalAlignment.Center}
                        MaxWidth={templatedParent.ImageMaxWidth}
                        MaxHeight={templatedParent.ImageMaxHeight}
                        Uri={templatedParent.NewImage} />
                }
                <Grid ColumnDefinitions={[Grid.FittedColumn(), Grid.ColumnDefinition()]}>
                    <TextBlock
                        MaxLines={"5"}
                        MaxWidth={300}
                        VerticalAlignment={VerticalAlignment.Center}
                        Text="Copy an image to the clipboard and then select Paste to view. If satisfied, select Save." />
                    <StackPanel
                        Grid={{ Column: 1 }}
                        Style={StackPanel.UnspacedStyle}
                        Orientation={Orientation.Horizontal}>
                        {/*<CommandButton*/}
                        {/*    Style={CommandButton.IconButtonTightStyle}*/}
                        {/*    Icon="upload"*/}
                        {/*    PreventBlurOnClick={true}*/}
                        {/*    ToolTip="Upload"*/}
                        {/*/>*/}
                        <CommandButton
                            Style={CommandButton.LargeIconButtonStyle}
                            Icon="paste"
                            Label="Paste"
                            PreventBlurOnClick={true}
                            ToolTip="Paste"
                            Command={async () =>
                            {
                                var items = await navigator.clipboard.read();                        
                                for (var item of items)
                                {                                    
                                    if (!item.types.includes("image/png"))
                                        continue;                                   
                                    const imageBlob = await item.getType("image/png");
                                    var reader = new FileReader();
                                    reader.onload = function (e)
                                    {
                                        if (typeof e.target?.result === "string")
                                            templatedParent.NewImage = e.target?.result;
                                    };
                                    reader.readAsDataURL(imageBlob);     
                                    templatedParent.Error = undefined;
                                    return;
                                }
                                templatedParent.Error = "No image was found on the clipboard.";
                            }}
                        />
                    </StackPanel>
                </Grid>
                <TextBlock Text={templatedParent.Error} />
            </StackPanel>
    });

    public get CurrentImage(): string | undefined
    {
        return this.GetValue(nameof(this.props.CurrentImage));
    }

    public get NewImage(): string | undefined
    {
        return this.GetValue(nameof(this.props.NewImage));
    }
    public set NewImage(value: string | undefined) 
    {
        this.SetValue(nameof(this.props.NewImage), value, true);
    }

    public get Error(): string | undefined
    {
        return this.GetValue(nameof(this.props.Error));
    }
    public set Error(value: string | undefined)
    {
        this.SetValue(nameof(this.props.Error), value, true);
    }

    public get ImageMaxWidth(): number | string | undefined
    {
        return this.GetValue(nameof(this.props.ImageMaxWidth));
    }

    public get ImageMaxHeight(): number | string | undefined
    {
        return this.GetValue(nameof(this.props.ImageMaxHeight));
    }
}