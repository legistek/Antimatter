import * as React from 'react';
import { Antimatter, Binding, ModelObjectReference, ModelValue } from "@antimatterjs/react";
import { ControlTemplate } from "../../FrameworkTemplate";
import { TemplateProp, WebStyle } from "../../Style";
import { ContentControl, ContentControlBase, IContentControlProps } from "../ContentControl";
import { ContentPresenter, IContentPresenterProps, ContentPresenterBase, IContentPresenterState } from "../ContentPresenter";
import { Control, IControlProps, IControlState } from "../Control";
import { Grid } from '../Grid';
import { CommandButton } from '../CommandButton';
import { DropPanel } from '../DropPanel';

export interface IDragGhostProps extends IContentControlProps
{
    DropCommands?: ModelObjectReference[] | Binding,
}

export class DragGhostBase<P extends IDragGhostProps = {}, S extends IControlState = {}>
    extends ContentControlBase<P, S>
{
    public static DefaultStyle: WebStyle<IDragGhostProps> = new WebStyle<IDragGhostProps>(
        {
            Template: new ControlTemplate((templatedParent: DragGhost) =>
            {
                console.log(`Rendering ghost with ${templatedParent.DropCommands.length} drop commands`);
                return (
                    <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition()]}>
                        <ContentPresenter
                            Grid={{ Row: 0 }}
                            Content={templatedParent.Content}
                            ContentTemplate={templatedParent.ContentTemplate} />
                        {
                            templatedParent.DropCommands.length === 1 &&
                            (<CommandButton
                                Grid={{ Row: 1 }}
                                Style={CommandButton.CommandBarButtonStyle}
                                Command={templatedParent.DropCommands[0]} />)
                        }
                    </Grid>
                );
            })
        })

    public get DropCommands(): ModelObjectReference[]
    {
        return this.GetValue(nameof(this.props.DropCommands), []);
    }
    public set DropCommands(cmds: ModelObjectReference[])
    {
        this.SetValue(nameof(this.props.DropCommands), cmds, true);
    }

    public DropOwner?: DropPanel;
}

export class DragGhost extends DragGhostBase<IDragGhostProps, IControlState>
{
}