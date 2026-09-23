// Most of these match WinUI values for direct binding scenarios if desired

export enum WindowLayout
{
    Default = 1,
    Tablet = 2,
}

export enum HorizontalAlignment
{
    Left = 0,        
    Center = 1,
    Right = 2,
    Stretch = 3,
    Inline = 4,
}

export enum VerticalAlignment
{
    Top = 0,
    Center = 1,
    Bottom = 2,
    Stretch = 3
}

export enum Orientation
{
    None = 0,
    Horizontal = 1,
    Vertical = 2
}

export enum SelectionMode
{
    Single = 0,     // The user can select only one item at a time.
    Multiple = 1,   // The user can select multiple items without entering a special mode.
    Extended = 2    // The user can select multiple items by entering a special mode, for example when depressing a modifier key.
}

export enum ScrollBarVisibility
{
    Auto = 1,
    Disabled = 0,
    Hidden = 2,
    Visible = 3,
}

export enum Side
{
    Top = 0,
    Right = 1,
    Bottom = 2,
    Left = 3
}

export enum UITransitionState
{
    Normal = 0,
    New = 1,
    Removing = 2,
    Removed = 3
}