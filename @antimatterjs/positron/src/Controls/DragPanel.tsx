import * as React from 'react';
import { Binding, BindingMode, BindingParameters, ModelObjectReference, Utilities } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState, TemplatedParentContext } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { FontStyle, ThemeColor, SemanticColor, ThemeLayout } from '../Theme';
import { WebStyle } from '../Style';
import { Window, WindowLayoutContext } from './Window';
import { CSSClasses } from '../CSSClasses';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { TextBlock } from './TextBlock';

export interface IDragPanelProps extends IPanelProps
{
    Content?: any | (() => any) | Binding,
    CanDrag?: boolean | Binding,
    DragTemplate?: DataTemplate,
}

export class DragPanelBase<P, S> extends PanelBase<IDragPanelProps, IPanelState>
{
    public get CanDrag(): boolean
    {
        return this.GetValue(nameof(this.props.CanDrag), true);
    }

    public get DragTemplate(): DataTemplate
    {
        return this.GetValue(nameof(this.props.DragTemplate));
    }

    public get Content(): any
    {
        var propVal = this.GetValue(nameof(this.props.Content));
        if (typeof (propVal) === "function")
            return propVal();
        else
            return propVal;
    }

    override OverrideContainerAttributes(
        containerProps: React.HTMLAttributes<HTMLElement> & React.ClassAttributes<HTMLElement>): void
    {
        containerProps.draggable = this.CanDrag ? true : undefined;
        containerProps.onDragStart = (e) => this.OnDragStart(e);
    }

    private async OnDragStart(e: React.DragEvent)
    {
        //let a: JSX.Element = (<TextBlock Text="I'm being dragged!" />);

        ////var img = document.createElement("img");
        ////img.src = "http://kryogenix.org/images/hackergotchi-simpler.png";
        ////img.width = 100;
        ////img.height = 100;
        ////if (this.Container)
        ////    e.dataTransfer.setDragImage(this.Container, 0, 0);

        ////e.dataTransfer.setDragImage(img, 0, 0);
        //if (!e.nativeEvent || !e.nativeEvent.dataTransfer)
        //    return;

        //var ghost = document.createElement('div');
        //ghost.style.transform=  "translate(-10000px, -10000px)";
        //ghost.style.position = "absolute";
        ////ghost.style.width = "100px";
        ////ghost.style.height = "100px";
        //ghost.style.background = "red";
        //document.body.appendChild(ghost);
        //e.dataTransfer.setDragImage(ghost, 0, 0);

        //await Utilities.SleepAsync(1);
        //ReactDOM.render(a, ghost);

        if (this.DragTemplate)
            Window.CurrentWindow?.BeginDrag(
                this.Content,
                this.DragTemplate,
                { X: e.clientX, Y: e.clientY });

        e.preventDefault();
        e.stopPropagation();
    }
}

export class DragPanel extends DragPanelBase<IDragPanelProps, IPanelState>
{
}