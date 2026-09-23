import * as React from 'react';
import { Antimatter, Binding, ModelObjectReference } from "@antimatterjs/react";
import { ControlTemplate } from "../../FrameworkTemplate";
import { TemplateProp, WebStyle } from "../../Style";
import { ContentControl, ContentControlBase, IContentControlProps } from "../ContentControl";
import { ContentPresenter, IContentPresenterProps, ContentPresenterBase, IContentPresenterState } from "../ContentPresenter";
import { Control, IControlProps, IControlState } from "../Control";
import { Grid } from '../Grid';
import { CommandButton } from '../CommandButton';

import { HorizontalAlignment } from '../../Enums';
import { DragDropPanel } from '../DragPanel';
import { MultitouchTransform } from '../../Media/MultitouchTransform';

export interface IDragGhostProps extends IContentControlProps
{
    DropCommands?: ModelObjectReference[] | Binding,
    TransformControls?: MultitouchTransform;
}

export class DragGhostBase<P extends IDragGhostProps = {}, S extends IControlState = {}>
    extends ContentControlBase<P, S>
{
    private _grid?: Grid;

    public get TransformControls(): MultitouchTransform | undefined
    {
        return this.GetValue(nameof(this.props.TransformControls));
    }

    public static DefaultStyle: WebStyle<IDragGhostProps> = new WebStyle<IDragGhostProps>(
        {
            Template: new ControlTemplate((templatedParent: DragGhost) =>
            {
                return (
                    <Grid
                        ClassName="amx-ptn-dragghost"
                        OnWillUnmount={(sender) =>
                        {
                            sender?.Container?.remove();
                        }}
                        OnDidMount={(sender) =>
                        {
                            if (!sender)
                                return;
                            sender.Container?.remove();
                            document?.body?.appendChild(sender.Container as HTMLElement);
                        }}
                        Transform={templatedParent.TransformControls}
                        RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition()]}
                        HorizontalAlignment={HorizontalAlignment.Left}>
                        <ContentPresenter
                            Grid={{ Row: 0 }}
                            HorizontalAlignment={HorizontalAlignment.Center}
                            Content={templatedParent.Content}
                            ContentTemplate={templatedParent.ContentTemplate} />
                        <>
                            {
                                templatedParent.DropCommands?.length == 1 &&
                                (<CommandButton
                                    Grid={{ Row: 1 }}
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.CommandBarButtonStyle}
                                    Command={templatedParent.DropCommands[0]} />)
                            }
                            {
                                (templatedParent.DropCommands?.length || 0) > 1 &&
                                (<CommandButton
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Grid={{ Row: 1 }}
                                    Style={CommandButton.CommandBarButtonStyle}
                                    Label="Actions"
                                    Icon="LightningBolt" />)
                            }
                        </>
                    </Grid>
                );
            })
        });

    public get DropCommands(): ModelObjectReference[] | undefined
    {
        return this.GetValue(nameof(this.props.DropCommands), []);
    }
    public set DropCommands(cmds: ModelObjectReference[] | undefined)
    {
        this.SetValue(nameof(this.props.DropCommands), cmds, true);
    }

    override OnComponentWillUnmount()
    {
        this._grid?.Container?.remove();
    }

    public DropOwner?: DragDropPanel;
}

export class DragGhost extends DragGhostBase<IDragGhostProps, IControlState>
{
}