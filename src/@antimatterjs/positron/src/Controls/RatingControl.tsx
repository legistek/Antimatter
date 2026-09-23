import * as React from 'react';
import { Rating, RatingSize } from '@fluentui/react';
import { Antimatter, Binding, BindingMode, Utilities } from '@antimatterjs/react';
import { Control, IControlProps } from './Control';
import { Style, TemplateProp, WebStyle } from '../Style';
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeLayout } from '../Theme';
import { Glyph, IGlyphProps } from './Glyph';
import { StackPanel } from './StackPanel';
import { Orientation, VerticalAlignment } from '../Enums';
import { TextBlock } from './TextBlock';
import { Grid } from './Grid';

export interface StarColors
{
    [key: number]: string | undefined
}

export interface IRatingControlProps extends IControlProps
{
    Rating?: number | Binding;
    MaxRating?: number | Binding;
    StarColors?: StarColors | undefined | Binding;
}

export class RatingControl extends Control<IRatingControlProps>
{
    public static DefaultStyle = new WebStyle<IRatingControlProps>({
        MaxRating: 5,
        Rating: 1,
        Foreground: SemanticColor.BodyText,
        FontFamily: FontStyle.FontFamily,
        FontSize: FontStyle.Medium,
        FontWeight: "bold",
        Template:
            (templatedParent: RatingControl) =>
            {
                return <Rating
                    //min={0}
                    max={templatedParent.MaxRating}
                    size={RatingSize.Small}
                    allowZeroStars
                    rating={templatedParent.Rating}
                    styles={{
                        ratingStarFront: {
                            color: templatedParent.StarColors
                                ? templatedParent.StarColors[templatedParent.Rating]
                                : templatedParent.Foreground,
                        }
                    }}
                    onChange={(ev, rating) =>
                    {
                        if (rating !== undefined)
                            templatedParent.Rating = rating;
                        templatedParent.InvalidateRender();
                    }}
                />
            }
    });

    public static DefaultPosNegStyle = new Style<IRatingControlProps>({
        StarColors: {
            0: undefined,
            1: Theme.Value(ThemeColor.Red),
            2: Theme.Value(ThemeColor.LightRed),
            3: Theme.Value(ThemeColor.NeutralLight),
            4: Theme.Value(ThemeColor.LightGreen),
            5: Theme.Value(ThemeColor.Green),
        }
    }, RatingControl.DefaultStyle);

    public static DefaultBindings = {
        Rating: {
            Mode: BindingMode.TwoWay
        }
    };

    public get MaxRating(): number
    {
        return this.GetValue(nameof(this.props.MaxRating), 0);
    }
    public get Rating(): number
    {
        return this.GetValue(nameof(this.props.Rating), 0);
    }
    public set Rating(value: number)
    {
        if (value === 0)
            return;
        this.SetValue(nameof(this.props.Rating), value, false);
    }

    public get StarColors(): StarColors | undefined
    {
        return this.GetValue(nameof(this.props.StarColors));
    }
}


export interface IPosNegRatingControlProps extends IControlProps
{
    Rating?: number | Binding;

    /**
     * The maximum star value to show. This should be a positive number.
     */
    MaxRating?: number;

    /**
     * The minimum star value to show. This should be a negative number.
     */
    MinRating?: number;

    StarColors?: StarColors | undefined | Binding;

    IsReadOnly?: boolean | Binding;

    Label?: string | Binding;

    HideReadOnlyDefault?: boolean;

    HideEditModeGlyph?: boolean;
}

export class PosNegRatingControl extends Control<IPosNegRatingControlProps>
{
    public static readonly PART_Glyph = Antimatter.Identifier("glyph");
    public static readonly PART_Label: string = Antimatter.Identifier("PART_Label");
    public static readonly STATE_ReadOnly: string = Antimatter.Identifier("STATE_ReadOnly");
    public static readonly STATE_UnfilledGlyph: string = Antimatter.Identifier("STATE_UnfilledGlyph");

    public static DefaultBindings = {
        Rating: {
            Mode: BindingMode.TwoWay,
        },
    };

    public static DefaultStyle = new WebStyle<IPosNegRatingControlProps>(
        {
            Template: (templatedParent: PosNegRatingControl) =>
            {
                if (templatedParent.HideReadOnlyDefault && templatedParent.Rating === 0 && templatedParent.IsReadOnly)
                    return <></>;

                var actualRating = templatedParent.PreviewValue !== undefined && !templatedParent.IsReadOnly
                    ? (templatedParent.PreviewValue || 0)
                    : templatedParent.Rating;
                actualRating = Math.max(actualRating, templatedParent.MinRating);
                actualRating = Math.min(actualRating, templatedParent.MaxRating);
                var pattern = PosNegRatingControl._starPatterns[actualRating];
                let i = templatedParent.MinRating;
                let glyphs: any[] = [];
                for (var dot of pattern)
                {
                    var star = templatedParent.RenderGlyph(i, dot);
                    i++;
                    //if (!dot && templatedParent.IsReadOnly)
                    //    continue;
                    glyphs.push(star);
                }

                var rating = (
                    <StackPanel
                        Grid={{
                            Row: templatedParent.Label ? 1 : 0
                        }}
                        VerticalAlignment={templatedParent.VerticalContentAlignment}
                        Orientation={Orientation.Horizontal}                        
                        ItemSpacing={"0px"}>
                        {glyphs}
                        {
                            !templatedParent.IsReadOnly &&
                            !templatedParent.HideEditModeGlyph &&
                            <Glyph
                                FontSize={FontStyle.Small}
                                Foreground={SemanticColor.DisabledText}
                                VerticalAlignment={VerticalAlignment.Center}
                                Icon={0xF022} />
                        }
                    </StackPanel>
                );

                if (templatedParent.Label)
                {
                    return (
                        <Grid
                            RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                            Style={StackPanel.UnspacedStyle}>
                            <span className={PosNegRatingControl.PART_Label}>
                                {templatedParent.Label}
                            </span>
                            {
                                rating
                            }
                        </Grid>
                    );
                }
                else
                {
                    return rating;
                }
            },
            FontSize: FontStyle.SmallPlus,
            Padding: ThemeLayout.MarginSmall,
            MinRating: -2,
            MaxRating: 2,
            FontWeight: "bold",
            HideReadOnlyDefault: false,
            VerticalContentAlignment: VerticalAlignment.Center,
            Foreground: SemanticColor.BodyText,
            StarColors: {
                [-2]: Theme.Value(ThemeColor.Red),
                [-1]: Theme.Value(ThemeColor.Yellow),
                [0]: Theme.Value(ThemeColor.NeutralLight),
                [1]: "#99cc00",//Theme.Value(ThemeColor.LightGreen),
                [2]: "#00bf00"//Theme.Value(ThemeColor.Green),
            }
        },
        {
            [`@ .${PosNegRatingControl.PART_Glyph}`]: {
                //padding: "1px",
            },
            [`@:not(.${PosNegRatingControl.STATE_ReadOnly}) .${PosNegRatingControl.PART_Glyph}`]: {
                cursor: "pointer",                
            },
            [`@.${PosNegRatingControl.STATE_ReadOnly} .${PosNegRatingControl.PART_Glyph}.${PosNegRatingControl.STATE_UnfilledGlyph}`]: {
                visibility: "hidden"
            },
            [`@ .${PosNegRatingControl.PART_Label}`]:
            {
                alignSelf: "center",
                userSelect: "none",
                gridRow: 1,
                fontFamily: TemplateProp(nameof<IRatingControlProps>(p => p.FontFamily)),
                fontSize: TemplateProp(nameof<IRatingControlProps>(p => p.FontSize)),
                fontWeight: TemplateProp(nameof<IRatingControlProps>(p => p.FontWeight)),
                color: TemplateProp(nameof<IRatingControlProps>(p => p.Foreground)),
            }
        });

    private get PreviewValue(): number | undefined
    {
        return this.GetValue(nameof(this.PreviewValue));
    }
    private set PreviewValue(value: number | undefined)
    {
        this.SetValue(nameof(this.PreviewValue), value, true);
    }

    private RenderGlyph(glyphIndex: number, opacity: number): JSX.Element
    {
        let color: string | undefined | ThemeColor | SemanticColor = '';
        let isPreview = this.PreviewValue !== undefined && !this.IsReadOnly;
        var rating = isPreview ? (this.PreviewValue || 0) : this.Rating;
        if (this.StarColors)
        {            
            if (opacity > 0)            
                color = this.StarColors[rating];
            else
            {
                color = ThemeColor.NeutralLight;
                opacity = 1;
            }
            if (isPreview)
                opacity = 1;
        }
        else
            color = this.Foreground

        return <Glyph
            ClassName={`${PosNegRatingControl.PART_Glyph}`}
            Opacity={opacity}            
            OnPointerEnter={(e, target) =>
            {
                if (!this.IsReadOnly)
                    this.PreviewValue = glyphIndex;
            }}
            OnPointerLeave={() =>
            {
                this.PreviewValue = undefined;
            }}
            OnPointerDown={(e, target) =>
            {
                if (!this.IsEnabled || this.IsReadOnly)
                    return;
                this.Rating = glyphIndex;
                //if (Math.abs(this.Rating) === glyphIndex)
                //    this.Rating = -this.Rating;
                //else
                //    this.Rating = (Math.sign(this.Rating) || 1) * glyphIndex;
            }}
            FontSize={this.FontSize}
            Foreground={color}
            VerticalAlignment={VerticalAlignment.Center}
            Icon={
                "MailFill"
            } />
    }

    public get Rating(): number
    {
        return this.GetValue(nameof(this.props.Rating), 0);
    }
    public set Rating(value: number)
    {
        this.SetValue(nameof(this.props.Rating), value, true);
    }

    public get HideEditModeGlyph()
    {
        return this.GetValue(nameof(this.props.HideEditModeGlyph), false);
    }

    public get HideReadOnlyDefault(): boolean
    {
        return this.GetValue(nameof(this.props.HideReadOnlyDefault), false);
    }

    public get IsReadOnly(): boolean
    {
        return this.GetValue(nameof(this.props.IsReadOnly), false);
    }

    public get MaxRating(): number
    {
        return this.GetValue(nameof(this.props.MaxRating), 0);
    }

    public get MinRating(): number
    {
        return this.GetValue(nameof(this.props.MinRating), 0);
    }

    public get StarColors(): StarColors | undefined
    {
        return this.GetValue(nameof(this.props.StarColors));
    }

    public get Label(): string | undefined
    {
        return this.GetValue(nameof(this.props.Label));
    }

    public override constructClasses(): string
    {
        return super.constructClasses() +
            (this.IsReadOnly ? ` ${PosNegRatingControl.STATE_ReadOnly} ` : "");
    }

    private static _starPatterns = {
        [-2]: [1, 1, 1, 0, 0],
        [-1]: [0, 1, 1, 0, 0],
        [0]: [0, 0, 1, 0, 0],
        [1]: [0, 0, 1, 1, 0],
        [2]: [0, 0, 1, 1, 1]
    };
}