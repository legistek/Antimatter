import { Binding, Point, Rect, Utilities, Span, ModelObjectReference, Antimatter } from '@antimatterjs/react';
import { WebStyle } from "../../Style";
import { CSSClasses } from '../../CSSClasses';
import { DataGridBase, IDataGridProps } from './DataGrid';
import * as React from 'react';
import { Application } from '../../Application';
import { ItemsControlBase } from '../ItemsControl';

export interface ILinedTextGridProps extends IDataGridProps
{
    /** Uses a single Rect to identify the currently selected text, interpreted
     * as follows:
     * Y: Starting line index (0-based);
     * Height: Number of lines selected (0 indicates no selection)
     * X: Starting character offset of first line selected (0-based)
     * Width: ending character offset of last line selected, minus X
     * While this seems weird, the idea is that the interpreted
     * Left, Top, Right, and Bottom of the traditional Rect will
     * wind up making sense.
     * A "right" value of -1 means the end of the line irrespective
     * of its length. ("left"/X will never be less than 0).
     * */
    TextSelection?: Rect | Binding;

    /** If the user can select with touch, touch scrolling is disabled. */
    IsTouchSelectionEnabled?: boolean | Binding;

    CanSelectText?: boolean | Binding;
    AtBottom?: boolean | Binding;

    SelectLineOnSimpleClick?: boolean | Binding;

    /** Fired when selection begins. The command parameter is a boolean
     * indicating whether the selection was done through a right click.
     * When the selection is finished, TextSelection will be bound-updated.
     * */
    SelectionStartedCommand?: ModelObjectReference | Binding;
}

export class LinedTextGridBase<P extends ILinedTextGridProps> extends DataGridBase<P>
{
    public static STATE_NoTouchScroll = Antimatter.Identifier("amx-ptn-notouchscroll");
    public static STATE_NoTouchSelect = Antimatter.Identifier("amx-ptn-notouchselect");

    public static DefaultStyle: WebStyle<IDataGridProps> = new WebStyle<IDataGridProps>(
        {
            OnPointerDown: (e, that) => (that as any as LinedTextGrid).OnTextGridPointerDown(e),
            OnPointerUp: (e, that) => (that as any as LinedTextGrid).OnTextGridPointerUp(e),
            OnPointerMove: (e, that) => (that as any as LinedTextGrid).OnTextGridPointerMove(e),
            OnDblClick: (e, that) => (that as any as LinedTextGrid).OnTextGridDoubleClick(e),
            OnKeyDown: (e, that) => (that as any as LinedTextGrid).OnTextKeyDown(e),
            NotifyScrollChange: true,
            TabIndex: 1,
            CanDragRows: false,
        },
        {
            [`@.${LinedTextGridBase.STATE_NoTouchScroll} *`]: {
                touchAction: "none",
                userSelect: "text!important",
                WebkitUserSelect: "text !important"
            },
            [`@.${LinedTextGridBase.STATE_NoTouchSelect} *`]: {
                userSelect: "none !important",
                WebkitUserSelect: "none !important"
            } as any
        },
        DataGridBase.DefaultStyle);

    override constructClasses()
    {
        var isTouchUser = this.BindState({
            Source: Application.CurrentWindow,
            Path: nameof(Application.CurrentWindow?.PrefersTouch)
        }) as boolean;
        return super.constructClasses() +
            (isTouchUser && !this.IsTouchSelectionEnabled ? ` ${LinedTextGridBase.STATE_NoTouchSelect} ` : "") +
            (this.IsTouchSelectionEnabled ? ` ${LinedTextGridBase.STATE_NoTouchScroll} ` : "");
    }

    public get IsTouchSelectionEnabled(): boolean
    {
        return this.GetValue(nameof(this.props.IsTouchSelectionEnabled), false);
    }

    public get AtBottom(): boolean
    {
        return this.GetValue(nameof(this.props.AtBottom), false);
    }
    public set AtBottom(value: boolean)
    {
        this.SetValue(nameof(this.props.AtBottom), value, false);
    }

    public get SelectLineOnSimpleClick(): boolean
    {
        return this.GetValue(nameof(this.props.SelectLineOnSimpleClick), false);
    }

    public get CanSelectText(): boolean
    {
        return this.GetValue(nameof(this.props.CanSelectText), false);
    }

    public get SelectionStartedCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.SelectionStartedCommand));
    }

    public get Selection(): Rect | undefined
    {
        return this.GetValue(nameof(this.props.TextSelection));
    }
    public set Selection(value: Rect | undefined)
    {
        this.SetValue(nameof(this.props.TextSelection), value, false);
    }

    override OnContainerMounted()
    {
        this.Container?.addEventListener("touchstart", (e) =>
        {
            if (this.IsTouchSelectionEnabled)
                e.preventDefault();
        });
        this.Container?.addEventListener("touchend", (e) =>
        {
            if (this.IsTouchSelectionEnabled)
                e.preventDefault();
        });
    }

    override async OnBoundPropertyUpdate(prop: string, value: any, oldValue: any)
    {
        if (prop === nameof(this.props.TextSelection))
        {
            var sel = value as Rect;
            if (sel && this.CanSelectText)
            {
                this._TextSelectionAnchor = sel.TopLeft;
                this._TextSelectionTail = sel.BottomRight;
                this.SelectRealTextFromLogicalSelection();
            }
        }
        super.OnBoundPropertyUpdate(prop, value, oldValue);
    }

    private static readonly _bottomBuffer: number = 200;

    override async OnScrollChange(scrollTop: number, delta: number, viewportHeight: number, extentHeight: number)
    {
        super.OnScrollChange(scrollTop, delta, viewportHeight, extentHeight);

        if (!this.ItemsPanelInstance)
            return;

        if (this._TextSelectionAnchor && this._TextSelectionTail)
            this.SelectRealTextFromLogicalSelection();

        let atBottom: boolean = false;
        if (delta < 0)
        {
            this.AtBottom = false;
            return;
        }
        if (this.AtBottom)
            // A positive scroll when we're already at
            // the bottom should never cause us to not
            // be at the bottom
            return;
        await Utilities.SleepAsync(100);
        scrollTop = this.ItemsPanelInstance?.Container?.scrollTop || 0;
        viewportHeight = this.ItemsPanelInstance?.Container?.clientHeight || 0;
        extentHeight = this.ItemsPanelInstance?.Container?.scrollHeight || 0;
        atBottom = scrollTop + viewportHeight >= extentHeight - LinedTextGrid._bottomBuffer;
        this.AtBottom = atBottom;
    }

    override async OnItemsRenderedOverride(items: Span)
    {
        super.OnItemsRenderedOverride(items);
        this._realizedItems = items;
        await Utilities.SleepAsync(1);
        this.SelectRealTextFromLogicalSelection(false);
    }

    private NeedFlipPoints(pt1: Point, pt2: Point): boolean
    {
        return pt1.Y > pt2.Y ||
            pt1.Y === pt2.Y && pt2.X !== LinedTextGrid._EOL && pt1.X > pt2.X;
    }

    private SelectRealTextFromLogicalSelection(clearIfEmpty: boolean = true): boolean
    {
        var pt1 = this._TextSelectionAnchor;
        var pt2 = this._TextSelectionTail;
        if (!pt1 || !pt2 || !this._realizedItems)
            return false;

        if (pt1.X === pt2.X && pt1.Y === pt2.Y)
        {
            if (!clearIfEmpty)
                return false;
            var sel = window.getSelection();
            sel?.removeAllRanges();
            return true;
        }

        // Normalize to make sure the first character is first
        if (this.NeedFlipPoints(pt1, pt2))
        {
            var temp = pt1;
            pt1 = pt2;
            pt2 = temp;
            if (pt1.X < 0)
                pt1 = new Point(0, pt1.Y);  // tail was a whole line selection
        }

        // Get the realized range
        if (pt1.Y < this._realizedItems.Start)
            pt1 = new Point(0, this._realizedItems.Start);
        if (pt2.Y > this._realizedItems.End)
            pt2 = new Point(LinedTextGrid._EOL, this._realizedItems.End);

        var startNode = this.FindTextNodeAt(pt1, false);
        if (!startNode?.Node)
            return false;
        var endNode = this.FindTextNodeAt(pt2, false);
        if (!endNode?.Node)
            return false;

        let r: Range = document.createRange();
        try
        {
            r.setStart(startNode.Node, pt1.X - startNode.CharOffset);
        }
        catch
        {
            return false;
        }

        var length = endNode.Node.textContent?.length || 0;
        r.setEnd(
            endNode.Node,
            pt2.X === LinedTextGrid._EOL
                ? length
                : Math.min(pt2.X - endNode.CharOffset, length));

        var sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);

        return true;
    }

    private FindTextNodeAt(pt: Point, xAsScreenCoord: boolean):
        {
            Node: Node,
            CharOffset: number
        } | null
    {

        var container = this.TryGetItemContainer(pt.Y)?.Container as HTMLElement;
        if (!container)
            // Not realized
            return null;

        container = container.querySelector(
            `.${CSSClasses.DataGridCell}:not(.${CSSClasses.DataGridCellFrozenFirst})`) as HTMLElement;
            
        let nodeList: Node[] = [];
        Utilities.FindTextNodes(container, nodeList);
        var lastNode = nodeList[nodeList.length - 1];
        let currentX: number = 0;
        let charOffset: number = 0;
        for (var node of nodeList)
        {
            var screenWidth = node.parentElement?.getBoundingClientRect()?.width || 0;
            var chars = node.textContent?.length || 0;
            var width = xAsScreenCoord ? screenWidth : chars;
            if (pt.X < currentX + width)
                return {
                    Node: node,
                    CharOffset: charOffset
                };
            if (node !== lastNode)
            {
                currentX += width;
                charOffset += chars;
            }
        }

        return {
            Node: lastNode,
            CharOffset: charOffset
        };
    }

    private GetTextPositionFromPointerEvent(e: MouseEvent, isDown?: boolean): Point | undefined
    {
        var elem = document.elementFromPoint(e.clientX, e.clientY);
        if (!elem)
            return;

        var row = this.FindDGRowFromSelectedNode(elem as HTMLElement);
        if (!row)
            return;
        var lineIndex = (row as any).AMXDataGridRowIndex;
        if (lineIndex === undefined || lineIndex === null)
            return;

        var cell = this.FindDGCellFromSelectedNode(elem as HTMLElement);
        if (!cell)
            return;
            
        if ((isDown || this._selectionStartedInGutter) &&
            cell.classList.contains(CSSClasses.DataGridCellFrozenFirst))
        {
            this._isGutterSelecting = true;
            return new Point(0, lineIndex);
        }
        else
        {
            this._isGutterSelecting = false;
        }

        var rowRC = cell.getBoundingClientRect();
        var text = this.FindTextNodeAt(
            new Point(e.clientX - rowRC.left, lineIndex),
            true);
        if (!text?.Node?.textContent)
            return undefined;

        let r = document.createRange();

        let charIndex: number = -1;
        for (let i = 0; i < (text.Node.textContent?.length || 0); i++)
        {
            r.setStart(text.Node, i);
            r.setEnd(text.Node, i + 1);
            var rcs = r.getClientRects();

            if (rcs.length < 1)
                continue;
            if (rcs[0].x >= e.clientX)
            {
                charIndex = i + text.CharOffset;
                break;
            }
        }
        if (charIndex === -1)
        // Bug 1881/1702 - but why was there a -1 to begin with???
            charIndex = text.CharOffset + (text.Node.textContent?.length || 0);

        return new Point(charIndex, lineIndex);
    }

    private _selectionStartedInGutter: boolean = false;

    private OnTextGridPointerDown(e: PointerEvent): void
    {
        if (!this.CanSelectText || e.pointerType === "touch" && !this.IsTouchSelectionEnabled)
            return;
        var pt = this.GetTextPositionFromPointerEvent(e, true);
        if (!pt)
            return;
        e.preventDefault();

        this._selectionStartedInGutter = this._isGutterSelecting;

        this._TextSelectionAnchor = pt;
        if (this._isGutterSelecting)
            // Save the down point so that we can ignore it on pointerup if
            // unchanged.
            this._gutterSelectionPointerDown = new Point(e.clientX, e.clientY);

        this._isMouseDown = true;
        this.Container?.focus();
        this.ExecuteCommand(
            this.SelectionStartedCommand,
            e.pointerType === "mouse" && e.button !== 0);
    }

    private async OnTextGridPointerMove(e: PointerEvent)
    {
        if (!this.CanSelectText || !this._isMouseDown || !this._TextSelectionAnchor || e.pointerType === "touch" && !this.IsTouchSelectionEnabled)
            return;

        var pt = this.GetTextPositionFromPointerEvent(e);
        if (!pt)
            return;

        if (this._capturedPointer === undefined)
        {
            // Capture on the move, rather than the down,
            // so that we don't mess up clicks
            this.Container?.setPointerCapture(e.pointerId);
            this._capturedPointer = e.pointerId;
        }

        if (this._isGutterSelecting)
        {
            if (pt.Y >= this._TextSelectionAnchor.Y)
            {
                this._TextSelectionAnchor = new Point(0, this._TextSelectionAnchor.Y);
                this._TextSelectionTail = new Point(LinedTextGrid._EOL, pt.Y);
            }
            else
            {
                this._TextSelectionTail = new Point(0, pt.Y);
                this._TextSelectionAnchor = new Point(LinedTextGrid._EOL, this._TextSelectionAnchor.Y);
            }
        }
        else
        {
            this._TextSelectionTail = pt;
        }
        if (this.SelectRealTextFromLogicalSelection())
            e.preventDefault();

        // For edge scroll (Don't forget this for other scenarios where we'll need it, e.g. drag & drop!)
        var rc = this.ItemsPanelInstance?.Container?.getBoundingClientRect();
        if (!rc)
            return;
        var distFromTop = e.clientY - rc.top;
        var distFromBottom = rc.bottom - e.clientY;
        if (distFromTop >= this._autoscrollEdge && distFromBottom >= this._autoscrollEdge)
            this._isAutoScrolling = false;
        else if (!this._isAutoScrolling)
        {
            this._isAutoScrolling = true;
            while (this._isAutoScrolling)
            {
                this.ItemsPanelInstance?.Container?.scrollBy(
                    0,
                    distFromTop < this._autoscrollEdge ? - this._scrollInterval : this._scrollInterval
                );
                await Utilities.SleepAsync(this._scrollTimePeriod);
            }
        }
    }

    private OnTextGridPointerUp(e: PointerEvent): void
    {
        if (!this.CanSelectText || e.pointerType === "touch" && !this.IsTouchSelectionEnabled)
            return;

        e.preventDefault();

        Utilities.TryReleasePointerCapture(this.Container, this._capturedPointer);
        this._capturedPointer = undefined;

        if (!this.SelectLineOnSimpleClick &&
            this._isGutterSelecting &&
            this._gutterSelectionPointerDown?.X === e.clientX &&
            this._gutterSelectionPointerDown?.Y === e.clientY)
        {
            // just a click not a selection
            this._isAutoScrolling = false;
            this._isMouseDown = false;
            this._isGutterSelecting = false;
            this._TextSelectionAnchor = undefined;
            this._TextSelectionTail = undefined;
            return;
        }

        this.OnTextGridPointerMove(e);

        this._isAutoScrolling = false;
        this._isMouseDown = false;
        this._isGutterSelecting = false;

        this.ReportCurrentSelection();
    }

    private ReportCurrentSelection(): void
    {
        if (!this._TextSelectionAnchor || !this._TextSelectionTail)
            return;
        if (this.NeedFlipPoints(this._TextSelectionAnchor, this._TextSelectionTail))
            this.Selection = Rect.FromPoints(this._TextSelectionTail, this._TextSelectionAnchor, false);
        else
            this.Selection = Rect.FromPoints(this._TextSelectionAnchor, this._TextSelectionTail, false);
    }

    private OnTextGridDoubleClick(e: React.MouseEvent)
    {
        if (!this.CanSelectText)
            return;
        var pt = this.GetTextPositionFromPointerEvent(e.nativeEvent);
        if (!pt)
            return;

        var row = this.TryGetItemContainer(pt.Y);
        if (!row)
            return;
        var text = row.Container?.textContent;
        if (!text)
            return;

        // Find the whitespace boundaries for the selected word
        let left = pt.X+1;
        let right = pt.X;
        while (Utilities.IsAlphanumeric(text.charAt(left-1)) && --left > 0)
        {
            // trust me this works
        }

        while (Utilities.IsAlphanumeric(text.charAt(right)) && right++ < text.length - 1)
        {
        }

        this._TextSelectionAnchor = new Point(left, pt.Y);
        this._TextSelectionTail = new Point(right, pt.Y);
        this.SelectRealTextFromLogicalSelection();
        this.ReportCurrentSelection();
    }

    private OnTextKeyDown(e: KeyboardEvent): void
    {
        if ((e.key === 'a' || e.key === 'A')
            && e.ctrlKey)
        {
            this._TextSelectionAnchor = new Point(0, 0);
            this._TextSelectionTail = new Point(
                LinedTextGrid._EOL,
                this.ItemsSource.length - 1
            );
            this.SelectRealTextFromLogicalSelection();
            e.preventDefault();
            e.stopPropagation();
        }
    }

    private FindDGRowFromSelectedNode(node: Node): HTMLElement | null | undefined
    {
        if (!node.ELEMENT_NODE)
            return undefined;  // not really an HTMLElement

        var elem = node as HTMLElement;
        return Utilities.FindParentElement(elem, (e) =>
        {
            return e.classList.contains(CSSClasses.DataGridRow);
        });
    }

    private FindDGCellFromSelectedNode(node: Node): HTMLElement | null | undefined
    {
        if (!node.ELEMENT_NODE)
            return undefined;  // not really an HTMLElement

        var elem = node as HTMLElement;
        return Utilities.FindParentElement(elem, (e) =>
        {
            return e.classList.contains(CSSClasses.DataGridCell);
        });
    }

    private _TextSelectionAnchor?: Point;
    private _TextSelectionTail?: Point;
    private _isMouseDown: boolean = false;
    private _isAutoScrolling: boolean = false;
    private _capturedPointer?: number;
    private _scrollInterval = 10;
    private _scrollTimePeriod = 16;
    private _autoscrollEdge = 50;
    private _isGutterSelecting: boolean = false;
    private _gutterSelectionPointerDown?: Point;
    private _realizedItems?: Span;
    private static _EOL = -1;
}

export class LinedTextGrid extends LinedTextGridBase<ILinedTextGridProps>
{
}