import React from "react";
import
{
    Binding,
    BindingMode,
    BindingParameters,
    BoundCollection,
    ICollectionUpdate,
    PropertyChangedEventArgs,
    RelativeSourceMode,
    Utilities,
} from "@antimatterjs/react";
import { ITextBoxProps, TextBox } from "./TextBox";
import { IControlState } from "./Control";
import { ControlTemplate, DataTemplate } from "../FrameworkTemplate";
import { WebStyle } from "../Style";
import { PlacementMode, Popup, PopupDirection } from "./Popup";
import { FrameworkElement } from "../FrameworkElement";
import { ListBox } from "./ListBox";
import { TextBlock } from "./TextBlock";
import { ProgressRing } from "./ProgressRing";
import { SemanticColor, Theme, ThemeColor, ThemeLayout } from "../Theme";
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment } from "../Enums";
import * as DOMPurify from 'dompurify';

const AUTO_CLOSE_SELECTION_CHAR_LENGTH = 13;
const DEFAULT_SEARCH_DEBOUNCE_MS = 300;
const MARKER_INSERTING_ATTRIBUTE = "data-mention-inserting";

export interface MentionTextBoxProps extends ITextBoxProps
{
    TargetsLoading?: boolean | Binding;
    TargetsError?: string | Binding;

    // This actually needs to be binding parameters not
    // an outright binding. Both the listbox, and this control,
    // need their own reference to the collection, and to be able
    // to respond to collection change. That's just not possible
    // (or it's very clunky) otherwise.
    TargetSourceBinding?: BindingParameters;

    TargetTemplate?: DataTemplate;
    TargetFilter?: string | Binding;
    TargetLinkPath?: string;
    SearchDebounceMs?: number;
}

export interface IMentionTextBoxState extends IControlState { }

export class MentionTextBox extends TextBox<
    MentionTextBoxProps,
    IMentionTextBoxState
> {
    static DefaultBindings = {
        ...TextBox.DefaultBindings,
        TargetFilter: { Mode: BindingMode.TwoWay },

        // TargetSource: { NotifyCollectionChanged: true, AffectsRender: false },

        // We don't want these to affect render because 
        // it'll reset the cursor position while tying        
        TargetsLoading: { AffectsRender: false },
        TargetsError: { AffectsRender: false },
    };

    static DefaultStyle = new WebStyle<MentionTextBoxProps>(
        {
            Template: new ControlTemplate((tp: MentionTextBox) => (
                <>
                    {TextBox.BuildTemplate(tp)}
                    <Popup
                        IsOpen={
                            new Binding({
                                Source: tp,
                                Path: nameof(tp.IsSelecting),
                                Mode: BindingMode.TwoWay,
                            })
                        }
                        MinWidth={280}
                        Padding="0"
                        OnPointerDownCapture={(e) =>
                        {
                            // Do not lose focus on the textbox when clicking inside the popup
                            e.preventDefault();
                        }}
                        SetInitialFocus={false}
                        AlignWidthToTarget={false}
                        Target={() =>
                            ({ Container: tp._mentionAnchor }) as unknown as FrameworkElement
                        }
                        Placement={PlacementMode.Below}
                        Direction={PopupDirection.topLeftEdge}
                    >
                        <ListBox
                            ref={(e) => { (tp._selectorRef = e as ListBox); } }
                            MaxHeight={"50vh"}
                            FallbackSelectFirst={true}
                            VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                            MinHeight={100}
                            ItemsSource={new Binding(tp.TargetSourceBinding)}
                            ItemTemplate={tp.props.TargetTemplate}
                            SelectedIndex={
                                new Binding({
                                    Source: tp,
                                    Path: nameof(tp.SelectedIndex),
                                    Mode: BindingMode.TwoWay,
                                })
                            }
                            SelectionClickedCommand={(param) =>
                            {
                                if (!tp.IsSelecting)
                                    return;
                                tp.OnItemSelected(tp.SelectedIndex);
                            }}
                        />
                        <TextBlock
                            Text={
                                new Binding({
                                    Source: tp,
                                    Path: nameof(tp.TargetsError),
                                    Converter: (err: string | undefined) =>
                                        err || "Unable to load",
                                })
                            }
                            IsVisible={
                                new Binding({
                                    Source: tp,
                                    Path: nameof(tp.TargetsError),
                                    Converter: (err: any) => !!err,
                                })
                            }
                            Overlaps={true}
                            HorizontalAlignment={HorizontalAlignment.Center}
                            VerticalAlignment={VerticalAlignment.Center}
                            Foreground={SemanticColor.Error}
                            Padding="8px 12px"
                        />
                        <TextBlock
                            Text="No matches found"
                            Overlaps={true}
                            HorizontalAlignment={HorizontalAlignment.Center}
                            VerticalAlignment={VerticalAlignment.Center}
                            IsVisible={
                                new Binding({
                                    Source: tp,
                                    Path: nameof(tp.ShowNoResultsMessage),
                                })
                            }
                            Foreground={SemanticColor.DisabledBodyText}
                        />
                        <ProgressRing
                            Overlaps={true}
                            HorizontalAlignment={HorizontalAlignment.Center}
                            VerticalAlignment={VerticalAlignment.Center}
                            IsVisible={
                                new Binding({
                                    Source: tp,
                                    Path: nameof(tp.TargetsLoading),
                                    Converter: (v: any) => v === true,
                                })
                            }
                            Margin={ThemeLayout.MarginStandard}
                        />
                    </Popup>
                </>
            )),
            SearchDebounceMs: DEFAULT_SEARCH_DEBOUNCE_MS
        },
        {
            "@ a": {
                backgroundColor: Theme.Value(ThemeColor.ThemeLighter),
                color: Theme.Value(ThemeColor.ThemePrimary),
                borderRadius: Theme.Value(ThemeLayout.StandardBorderRadius),
                padding: Theme.Value(ThemeLayout.MarginSmallLR),
                textDecoration: "none",
                fontWeight: "bold",
                cursor: "default",
            },
            "@ a:hover": {
                backgroundColor: Theme.Value(SemanticColor.BodyBackgroundHovered),
            },
        },
        TextBox.DefaultStyle,
    );

    _mentionAnchor: HTMLElement | null = null;
    private _selectorRef: ListBox | null = null;
    private _atTextOffset: number = 0;
    private _queryText: string = "";
    private _filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private _isSelecting: boolean = false;
    private _selectedIndex: number = 0;
    private _skipSelectOnFocus = false;

    protected override get AllowHtmlContent(): boolean
    {
        return true;
    }

    public override get AcceptsReturn(): boolean
    {
        return true;
    }

    public get TargetsLoading(): boolean
    {
        return this.GetValue(nameof(this.props.TargetsLoading), false);
    }

    public get TargetsError(): string | undefined
    {
        return this.GetValue(nameof(this.props.TargetsError)) || undefined;
    }

    public get TargetSourceBinding(): BindingParameters | undefined
    {
        return this.GetValue(nameof(this.props.TargetSourceBinding));
    }

    public get ShowNoResultsMessage(): boolean
    {
        const src = this.TargetSourcePrivate;

        return (
            this.TargetsLoading !== true &&
            !this.TargetsError &&
            src !== undefined &&
            src.length === 0
        );
    }

    public get SearchDebounceMs(): number
    {
        return this.GetValue(nameof(this.props.SearchDebounceMs), 0);
    }

    public get IsSelecting(): boolean
    {
        return this._isSelecting;
    }

    public set IsSelecting(value: boolean)
    {
        if (this._isSelecting === value) return;

        const wasSelecting = this._isSelecting;
        this._isSelecting = value;

        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.IsSelecting)),
        );

        if (!value && wasSelecting)
        {
            this.CloseSelector();
        }
    }

    private get SelectedIndex(): number
    {
        return this._selectedIndex;
    }

    private set SelectedIndex(value: number)
    {
        if (this._selectedIndex === value) return;

        this._selectedIndex = value;

        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.SelectedIndex)),
        );
    }

    protected override get SafeText(): string
    {
        var unsafeText = this.Text;
        if (!unsafeText)
            return '';

        return DOMPurify.default.sanitize(unsafeText, {
            ALLOWED_TAGS: [
                // headings
                "h1", "h2", "h3", "h4", "h5", "h6",
                // text + inline
                "span", "div", "p", "br", "hr", "strong", "em", "b", "i", "del", "s", "a", "sup",
                // lists
                "ul", "ol", "li",
                // code
                "pre", "code",
                // quotes
                "blockquote",
                // tables (marked emits these with GFM enabled)
                "table", "thead", "tbody", "tr", "th", "td"
            ],
            ALLOWED_ATTR: ["href", "title", "class"],
            ALLOWED_URI_REGEXP: /^(?:https?|user|team):/i,
        });
    }

    public override get SelectOnFocus(): boolean
    {
        return this._skipSelectOnFocus ? false : super.SelectOnFocus;
    }

    /** Read the contenteditable innerHTML, normalising the bare \<br\> that
     *  browsers insert into an empty editable so the model gets "" not "\<br\>". */
    private _getInputHtml(): string
    {
        const html = (this._input as HTMLSpanElement | null)?.innerHTML ?? "";
        return /^(<br\s*\/?>)\s*$/.test(html) ? "" : html;
    }

    private _safeSetText(value: string | undefined): void
    {
        this.Text = value;

        if (this.IsSelecting && !value?.includes("@"))
        {
            this.CloseSelector();
        }
    }

    private get TargetSourcePrivate(): any[] | undefined
    {
        return this.GetValue(nameof(this.TargetSourcePrivate)) as any[];
    }

    public override OnBoundPropertyUpdate(
        prop: string,
        value: any,
        oldValue: any,
    ): void
    {
        if (prop == nameof(this.props.TargetSourceBinding))
        {
            if (value)
            {
                (value as BindingParameters).NotifyCollectionChanged = true;
                (value as BindingParameters).AffectsRender = false;
            }
            this.BindState(value, nameof(this.TargetSourcePrivate));            
        }

        if (prop == nameof(this.TargetSourcePrivate))
        {
            if (oldValue?.IsBoundCollection)
                (oldValue as BoundCollection<any>)
                    .CollectionChanged.unsubscribe(
                        this.Callback(this.OnItemsSourceCollectionChanged));

            if (value?.IsBoundCollection)
                (value as BoundCollection<any>)
                    .CollectionChanged.subscribe(
                        this.Callback(this.OnItemsSourceCollectionChanged));

            this.ResetSelection();
        }

        if (prop === nameof(this.props.Text) && this.AcceptsReturn)
        {
            super.OnBoundPropertyUpdate(prop, value, oldValue);
        }

        // select the first item if the list is no longer loading and we are still in selection mode
        if (
            prop === nameof(this.props.TargetsLoading) &&
            !value &&
            this.IsSelecting
        )
        {
            this.ResetSelection();
        }

        if (prop === nameof(this.props.TargetsLoading))
        {
            this.PropertyChanged?.invoke(
                this,
                new PropertyChangedEventArgs(nameof(this.TargetsLoading)));
            this.ResetSelection();
        }
    }

    private ResetSelection(): void
    {
        this.SelectedIndex = 0;
    }

    protected /* virtual */ OnItemsSourceCollectionChanged(sender: any, e: ICollectionUpdate)
    {
        this.PropertyChanged?.invoke(this, new PropertyChangedEventArgs(nameof(this.ShowNoResultsMessage)));
        this.ResetSelection();
    };

    override OnComponentWillUnmount(): void
    {
        super.OnComponentWillUnmount();

        if (this._filterDebounceTimer !== null)
        {
            clearTimeout(this._filterDebounceTimer);
            this._filterDebounceTimer = null;
        }
    }

    /** Returns the character offset within all text nodes at the current cursor. */
    private GetTextOffsetAtCursor(): number
    {
        const selection = window.getSelection();

        if (!selection || !selection.rangeCount) return 0;

        const range = selection.getRangeAt(0);
        const input = this._input as HTMLSpanElement;

        if (!input) return 0;

        const walker = document.createTreeWalker(input, NodeFilter.SHOW_TEXT);

        let offset = 0;
        let currentNode: Text | null;

        while ((currentNode = walker.nextNode() as Text | null) !== null)
        {
            if (currentNode === range.startContainer)
                return offset + range.startOffset;

            if (range.startContainer.nodeType !== Node.TEXT_NODE)
            {
                const nodeRange = document.createRange();
                nodeRange.setStart(currentNode, 0);
                if (range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0)
                    return offset;
            }

            offset += currentNode.length;
        }

        return offset;
    }

    private InsertMentionAnchor(): void
    {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.collapse(true);

        const marker = document.createElement("span");
        range.insertNode(marker);

        const caretRect = marker.getBoundingClientRect();
        const nextNode = marker.nextSibling;
        const prevNode = marker.previousSibling;
        const markerParent = marker.parentNode!;
        marker.remove();

        // Restore cursor into a text node so the browser knows exactly where to insert text.
        const restored = document.createRange();
        if (nextNode?.nodeType === Node.TEXT_NODE)
        {
            restored.setStart(nextNode as Text, 0);
        } else if (prevNode?.nodeType === Node.TEXT_NODE)
        {
            restored.setStart(prevNode as Text, (prevNode as Text).length);
        } else if (nextNode)
        {
            restored.setStartBefore(nextNode);
        } else
        {
            restored.setStart(markerParent, markerParent.childNodes.length);
        }

        restored.collapse(true);
        selection.removeAllRanges();
        selection.addRange(restored);

        const anchor = document.createElement("span");
        anchor.style.cssText = `position:fixed;left:${caretRect.left}px;top:${caretRect.top}px;width:1px;height:${caretRect.height || 16}px;pointer-events:none;`;
        document.body.appendChild(anchor);
        this._mentionAnchor = anchor;
    }

    private RemoveMentionAnchor(): void
    {
        this._mentionAnchor?.remove();
        this._mentionAnchor = null;
    }

    CloseSelector(): void
    {
        if (this._filterDebounceTimer !== null)
        {
            clearTimeout(this._filterDebounceTimer);
            this._filterDebounceTimer = null;
        }

        this.RemoveMentionAnchor();
        this.IsSelecting = false;
        this.SelectedIndex = 0;
        this.SetValue(nameof(this.props.TargetFilter), "", false);
    }

    protected override async OnKeyDown(e: React.KeyboardEvent): Promise<void>
    {
        if (
            e.key === "@" &&
            !e.nativeEvent.isComposing &&
            (this.TargetSourcePrivate !== undefined || this.TargetsLoading) &&
            !this.IsSelecting
        )
        {
            this._queryText = "";
            this.SelectedIndex = 0;
            this._atTextOffset = this.GetTextOffsetAtCursor();

            await Utilities.SleepAsync(33);
            this._safeSetText(this._getInputHtml());

            this.InsertMentionAnchor();
            this.IsSelecting = true;
            this.ResetSelection();
            this.UpdateTargetFilter();
            return;
        }

        if (this.IsSelecting)
        {
            if (e.key === "Enter" || e.key === "Tab")
            {
                e.preventDefault();
                e.stopPropagation();
                this.OnItemSelected(this.SelectedIndex);
            }

            if (e.key === "ArrowDown" || e.key === "ArrowUp")
            {
                e.preventDefault();
                e.stopPropagation();

                const items = this.TargetSourcePrivate;
                const len = items?.length ?? 0;

                if (len > 0)
                {
                    const newIndex =
                        e.key === "ArrowDown"
                            ? (this.SelectedIndex + 1) % len
                            : (this.SelectedIndex - 1 + len) % len;

                    this.SelectedIndex = newIndex;

                    requestAnimationFrame(() =>
                    {
                        this._selectorRef
                            ?.TryGetItemContainer(newIndex)
                            ?.Container?.scrollIntoView?.({ block: "nearest" });
                    });
                }

                return;
            }

            if (e.key === "ArrowRight" || e.key === "End")
            {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (
                e.key === "Escape" ||
                e.key === "ArrowLeft" ||
                e.key === "Home" ||
                (e.key === "z" && e.ctrlKey)
            )
            {
                e.stopPropagation();
                this.CloseSelector();
            }

            if (e.key === "s" && e.ctrlKey && this.SaveCommand)
            {
                this.CloseSelector();
                this._safeSetText(this._getInputHtml());
                this.ExecuteCommand(this.SaveCommand);
                e.preventDefault();

                return;
            }

            if (e.key === "Backspace")
            {
                if (this._queryText.length === 0)
                {
                    e.stopPropagation();
                    this.CloseSelector();
                } else
                {
                    this._queryText = this._queryText.slice(0, -1);
                }
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey)
            {
                this._queryText += e.key;

                if (this._queryText.length > AUTO_CLOSE_SELECTION_CHAR_LENGTH)
                    this.CloseSelector();
            }

            this.UpdateTargetFilter();
        }

        await Utilities.SleepAsync(33);
        this._safeSetText(this._getInputHtml());
    }

    private UpdateTargetFilter(): void
    {
        const debounceMs = this.SearchDebounceMs;

        if (!debounceMs || !this._queryText)
        {
            this.SetValue(nameof(this.props.TargetFilter), this._queryText, false);
            return;
        }

        if (this._filterDebounceTimer !== null)
        {
            clearTimeout(this._filterDebounceTimer);
        }

        this._filterDebounceTimer = setTimeout(() =>
        {
            this._filterDebounceTimer = null;

            if (this.IsSelecting)
            {
                this.SetValue(nameof(this.props.TargetFilter), this._queryText, false);
            }
        }, debounceMs);
    }

    public OnItemSelected(index: number): void
    {
        const item = this.TargetSourcePrivate?.[index];

        if (!item) return;

        const anchorPath = this.props.TargetLinkPath;

        this.CloseSelector();

        if (!anchorPath) return;

        const anchorHtml = this.BindState({ Path: anchorPath, Source: item });

        this.ReplaceQueryWithAnchor(anchorHtml);
    }

    /**
     * Finds the @query text directly in the DOM via TreeWalker (no selection
     * state or focus required), deletes it, inserts anchorHtml in its place,
     * then places the cursor immediately after the inserted node.
     */
    private ReplaceQueryWithAnchor(anchorHtml: string): void
    {
        const input = this._input as HTMLSpanElement;
        if (!input) return;

        // Collect text nodes, skipping those inside existing pill spans so that
        // lastIndexOf("@") finds the user-typed @ and not one inside a prior mention.
        const nodeMap: { node: Text; start: number }[] = [];
        let totalText = "";
        const walker = document.createTreeWalker(input, NodeFilter.SHOW_TEXT);

        let tn: Text;

        while ((tn = walker.nextNode() as Text) !== null)
        {
            nodeMap.push({ node: tn, start: totalText.length });
            totalText += tn.textContent ?? "";
        }

        // Fall back to lastIndexOf only if _atTextOffset is stale.
        let atIdx = this._atTextOffset;
        if (atIdx < 0 || atIdx >= totalText.length || totalText[atIdx] !== "@")
        {
            atIdx = totalText.lastIndexOf("@");
        }

        if (atIdx < 0) return;
        const endIdx = atIdx + 1 + this._queryText.length;

        let startNode: Text | null = null,
            startOffset = 0;
        let endNode: Text | null = null,
            endOffset = 0;

        for (const { node, start } of nodeMap)
        {
            const end = start + (node.textContent?.length ?? 0);
            if (!startNode && atIdx >= start && atIdx < end)
            {
                startNode = node;
                startOffset = atIdx - start;
            }
            if (!endNode && endIdx >= start && endIdx <= end)
            {
                endNode = node;
                endOffset = endIdx - start;
            }
            if (startNode && endNode) break;
        }

        if (!startNode || !endNode) return;

        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        this._suspendFocusHandler = true;
        this._skipSelectOnFocus = true;
        input.focus();
        this._suspendFocusHandler = false;
        this._skipSelectOnFocus = false;

        const selection = window.getSelection();

        selection?.removeAllRanges();
        selection?.addRange(range);

        const tempWrapper = document.createElement("div");
        tempWrapper.innerHTML = anchorHtml;
        const anchorNode = tempWrapper.firstElementChild;

        if (!anchorNode) return;

        anchorNode.setAttribute(MARKER_INSERTING_ATTRIBUTE, "1");

        document.execCommand("insertHTML", false, tempWrapper.innerHTML);

        // Move cursor to immediately after the newly inserted pill.
        const inserted = input.querySelector(`[${MARKER_INSERTING_ATTRIBUTE}]`);

        if (inserted)
        {
            inserted.removeAttribute(MARKER_INSERTING_ATTRIBUTE);
            const afterRange = document.createRange();
            afterRange.setStartAfter(inserted);
            afterRange.collapse(true);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(afterRange);
        }

        this._safeSetText(this._getInputHtml());
    }
}