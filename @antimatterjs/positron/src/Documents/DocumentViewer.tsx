import * as React from "react";
import { Binding } from "@antimatterjs/react";
import { Panel } from "../Controls/Panel";
import { DocumentPosition, IDocument } from "./IDocument";
import { IItemsControlProps, IItemsControlState, ItemsControl } from "../Controls/ItemsControl";
import { Style } from "../Style";
import { ItemsStackPanel } from "../Controls/ItemsStackPanel";
import { FrameworkElement } from "../FrameworkElement";
import { DocumentPagePresenter, IDocumentPagePresenterProps } from "./DocumentPagePresenter";
import { HorizontalAlignment, ScrollBarVisibility } from "../Enums";
import { ControlTemplate } from "../FrameworkTemplate";
import { MultitouchTransform } from "../Media/MultitouchTransform";
import { DefaultEffects } from "@fluentui/react";
import { DocumentPagesPanel } from "./DocumentPagesPanel";

interface IDocumentViewerCommon
{
    Document?: IDocument|null
}
interface IDocumentViewerProps extends IItemsControlProps, IDocumentViewerCommon
{
    Position?: DocumentPosition|Binding,
}
interface IDocumentViewerState extends IItemsControlState, IDocumentViewerCommon
{
    Position?: DocumentPosition
}

export class DocumentViewerBase<
    P extends IDocumentViewerProps = {},
    S extends IDocumentViewerState = {}>
    extends ItemsControl<P, S>
{
    _pagesPanel: DocumentPagesPanel | null = null;

    constructor(props)
    {
        super(props);
    }

    public static DefaultStyle: Style<IDocumentViewerProps> = new Style<IDocumentViewerProps>(
        {
            ItemsPanel: ItemsStackPanel,
            Background: "#E0E0E0",
            HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
            ItemContainerStyle: new Style<IDocumentPagePresenterProps>(
                {
                    Margin: "10px",
                    BorderBrush: "#C0C0C0",
                    BorderThickness: "1px",
                    BoxShadow: DefaultEffects.elevation8,
                    HorizontalAlignment: HorizontalAlignment.Center
                }),
            Template: new ControlTemplate((templatedParent: DocumentViewer) =>
            (
                <Panel                    
                    Background={templatedParent.state.Background}
                    BorderThickness={templatedParent.state.BorderThickness}
                    BorderBrush={templatedParent.state.BorderBrush}>

                    <DocumentPagesPanel
                        ref={r => templatedParent._pagesPanel = r}
                        ItemsParent={templatedParent}
                        HorizontalScrollBarVisibility={ScrollBarVisibility.Auto}
                        VerticalScrollBarVisibility={ScrollBarVisibility.Auto}/>
                    
                </Panel>
            ))
        }
    );

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.state.Document))
        {
            var doc = value as IDocument;
            this.SetValue(
                nameof(this.state.ItemsSource),
                this.ConstructPageArray(doc?.Pages || 0),
                true);
            this.ItemsPanelInstance?.InvalidateRender();
        }
        else if (property === nameof(this.state.Position))
        {
            // This is gonna be a doozy
            var pos = value as DocumentPosition;
            var oldPos = oldValue as DocumentPosition;
            if (pos?.scale !== oldPos?.scale)
                this.ItemsPanelInstance?.InvalidateRender();
            this._pagesPanel?.Container?.scrollTo
                ({
                    behavior: "auto",
                    left: 0,
                    top: 792 * (pos.page + pos.y) * pos.scale 
                });
            //this._pagesPanel?.ScrollTo(pos.page, pos.y);
        }
    }

    public /* override */ OnRenderItem(item: any, props?: any): JSX.Element | null
    {
        const pageProps: IDocumentPagePresenterProps = {
            PageIndex: item as number,
            Document: this.state.Document,
            Scale: this.state.Position?.scale || 1
        };
        return super.OnRenderItem(item, pageProps);
    }

    public Scale(scale: number)
    {
        this.SetValue(nameof(this.state.Position),
            {
                x: 0,
                y: 0,
                scale: scale * (this.state.Position?.scale || 1),
            });
        this.ItemsPanelInstance?.InvalidateRender();
    }

    /* protected virtual */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return DocumentPagePresenter;
    }

    private ConstructPageArray(pages: number): number[]
    {
        let arr: number[] = new Array(pages);
        for (let i = 0; i < pages; i++)
            arr[i] = i;
        return arr;
    }
}

export class DocumentViewer extends DocumentViewerBase<IDocumentViewerProps, IDocumentViewerState>
{
}