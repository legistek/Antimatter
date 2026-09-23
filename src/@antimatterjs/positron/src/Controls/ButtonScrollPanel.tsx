import * as React from 'react';
import { Binding, PropertyChangedEventArgs } from '@antimatterjs/react';
import { Panel } from './Panel';
import { WebStyle } from '../Style';
import { CommandButton } from './CommandButton';
import { Control, IControlProps } from './Control';
import { Grid } from './Grid';
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment } from '../Enums';
import { ThemeLayout } from '../Theme';

export interface IButtonScrollPanelProps extends IControlProps
{
    children?: React.ReactNode;
}

export class ButtonScrollPanelBase<P extends IButtonScrollPanelProps = {}>
    extends Control<P>
{
    public static DefaultStyle = new WebStyle<IButtonScrollPanelProps>(
        {
            Template: (templatedParent: ButtonScrollPanelBase<IButtonScrollPanelProps>) => (
                <Grid                  
                    ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                    <CommandButton
                        ref={r => { templatedParent._scrollLeftButton = r; } }
                        Padding="0px"
                        Margin={ThemeLayout.MarginStandardR}
                        Command={(p) => templatedParent.OnScrollButtonClick(false)}
                        VerticalAlignment={VerticalAlignment.Center}
                        Style={CommandButton.IconButtonStyle}
                        Grid={{ Column: 0 }}
                        Icon="ChevronLeft"
                        IsEnabled={new Binding({
                            Source: templatedParent,
                            Path: nameof(templatedParent.IsLeftScrollButtonEnabled)
                        })}
                        IsVisible={new Binding({
                            Source: templatedParent,
                            Path: nameof(templatedParent.TabPanelOverflows)
                        })}
                    />
                    <Panel
                        HorizontalScrollBarVisibility={ScrollBarVisibility.Auto}
                        Grid={{ Column: 1 }}>
                        <Panel
                            HorizontalAlignment={HorizontalAlignment.Left}
                            ref={r => { templatedParent._content = r; } }
                            ObserveResize={true}
                            OnResize={
                                () =>
                                    templatedParent.CheckTabPanelOverflow()
                            }
                            OnScroll={e => templatedParent.CheckTabPanelOverflow()}
                            ClassName="scroller">
                            {templatedParent.props.children}
                        </Panel>
                    </Panel>
                    <CommandButton
                        ref={r => { templatedParent._scrollRightButton = r; } }
                        VerticalAlignment={VerticalAlignment.Center}
                        Padding="0px"
                        Margin={ThemeLayout.MarginStandardL}
                        Command={(p) => templatedParent.OnScrollButtonClick(true)}
                        Style={CommandButton.IconButtonStyle}
                        Grid={{ Column: 2 }}
                        Icon="ChevronRight"
                        IsEnabled={new Binding({
                            Source: templatedParent,
                            Path: nameof(templatedParent.IsRightScrollButtonEnabled)
                        })}
                        IsVisible={new Binding({
                            Source: templatedParent,
                            Path: nameof(templatedParent.TabPanelOverflows)
                        })} />
                </Grid>
            ),
        },
        {
            "@ .scroller": {
                scrollbarColor: "transparent",
                scrollbarWidth: "none",
            },
            "@ .scroller::-webkit-scrollbar": {
                width: 0,
                height: 0
            }
        }
    );

    private _scrollLeftButton: CommandButton | null = null;
    private _scrollRightButton: CommandButton | null = null;

    override get ObserveResize(): boolean
    {
        return true;
    }

    protected override OnElementUpdated(oldProps: P)
    {
        this.CheckTabPanelOverflow();
    }

    override OnResize()
    {
        this.CheckTabPanelOverflow();
    }
    
    private CheckTabPanelOverflow(): void
    {
        var elem = this._content?.Container;
        if (!elem)
            return;

        var desiredWidth = elem.scrollWidth -
            (this._scrollLeftButton?.ActualWidth || 0) -
            (this._scrollRightButton?.ActualWidth || 0);

        this.TabPanelOverflows = desiredWidth > elem.clientWidth;
        this.IsLeftScrollButtonEnabled = elem.scrollLeft > 0;
        this.IsRightScrollButtonEnabled = elem.scrollLeft + elem.clientWidth < elem.scrollWidth - 1;
    }

    // #region TabPanelOverflows Property
    private _tabPanelOverflows: boolean = false;
    public get TabPanelOverflows(): boolean
    {
        return this._tabPanelOverflows;
    }
    public set TabPanelOverflows(value: boolean)
    {
        if (this._tabPanelOverflows === value)
            return;
        this._tabPanelOverflows = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.TabPanelOverflows)));
    }
    // #endregion

    // #region IsLeftTabPanelScrollEnabled Property
    private _isLeftTabPanelScrollEnabled: boolean = false;
    public get IsLeftScrollButtonEnabled(): boolean
    {
        return this._isLeftTabPanelScrollEnabled;
    }
    public set IsLeftScrollButtonEnabled(value: boolean)
    {
        if (this._isLeftTabPanelScrollEnabled === value)
            return;
        this._isLeftTabPanelScrollEnabled = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.IsLeftScrollButtonEnabled)));
    }
    // #endregion

    // #region IsRightTabPanelScrollEnabled Property
    private _isRightTabPanelScrollEnabled: boolean = false;
    public get IsRightScrollButtonEnabled(): boolean
    {
        return this._isRightTabPanelScrollEnabled;
    }
    public set IsRightScrollButtonEnabled(value: boolean)
    {
        if (this._isRightTabPanelScrollEnabled === value)
            return;
        this._isRightTabPanelScrollEnabled = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.IsRightScrollButtonEnabled)));
    }
    // #endregion

    private OnScrollButtonClick(right: boolean = false)
    {
        var elem = this._content?.Container;
        if (!elem)
            return;
        var amt = 0.75 * elem.clientWidth;

        elem.scrollBy({
            left: right ? amt : -amt,
            behavior: "smooth"
        });
    }

    private _content?: Panel | null;
}

export class ButtonScrollPanel extends ButtonScrollPanelBase<IButtonScrollPanelProps>
{
}