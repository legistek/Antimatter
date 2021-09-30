export class App {
	public Dialogs?: DialogViewModel[];
	public Viewer?: DocViewer;
	public Company?: Company;
}

export class EmployeeDialog {
	public DialogTemplate?: string;
	public Title?: string;
	public Icon?: number;
	public Employee?: Employee;
	public BackCommand?: Command;
	public OKCommand?: Command;
	public CancelCommand?: Command;
	public PrimaryCommands?: any[];
	public SecondaryCommands?: any[];
}

export class DialogViewModel {
	public DialogTemplate?: string;
	public Title?: string;
	public Icon?: number;
	public OKCommand?: Command;
	public CancelCommand?: Command;
	public PrimaryCommands?: any[];
	public SecondaryCommands?: any[];
}

export class DocViewer {
	public Today?: Date;
	public Page?: number;
	public Scale?: number;
	public ZoomInCommand?: ICommand;
	public ZoomOutCommand?: ICommand;
	public NextPageCommand?: ICommand;
	public PrevPageCommand?: ICommand;
}

export class ICommand
{
	public Name?: string;
	public Icon?: number;
}

export class Company {
	public Name?: string;
	public Employees?: Employee[];
	public DocPosition?: DocumentPosition;
	public DocPage?: number;
	public DocScale?: number;
	public SomeEmployees?: Employee[];
	public SomeEmployeeNames?: string[];
	public SomeMoreEmployees?: Employee[];
	public SomeMoreEmployeeNames?: string[];
	public SelectedEmployeeName?: string;
	public SelectedEmployeeNames?: string[];
	public SelectedEmployees?: Employee[];
	public SelectedEmployeesDisplayText?: string;
	public IsAllSelected?: boolean;
	public SelectedEmployee?: Employee;
	public CEO?: Employee;
	public UnderlingPanelWidth?: number;
	public NewEmployeeCommand?: ICommand;
	public DeleteSelectedEmployeesCommand?: ICommand;
	public DeleteEmployeeCommand?: ICommand;
	public SelectedEmployeeChangedCommand?: Command;
	public SelectedEmployeesChangedCommand?: Command;
	public AvailableColors?: any[];
	public OpenTeachingBubbleCommand?: ICommand;
	public TeachingBubbleOpen?: boolean;
	public TeachingBubblePrimaryCommand?: ICommand;
	public TeachingBubbleInfo?: TeachingBubbleParams;
	public MessageBarInfo?: MessageBarParams;
	public Toasts?: MessageBarParams[];
}

export class DocumentPosition {
	public x?: number;
	public y?: number;
	public page?: number;
	public scale?: number;
	public Default?: DocumentPosition;
}

export class TeachingBubbleParams {
	public HeaderText?: string;
	public MessageText?: string;
	public ShowCloseButton?: boolean;
	public PrimaryCommand?: ICommand;
	public ShowSecondaryButton?: boolean;
	public CustomSecondaryCommand?: ICommand;
	public SecondaryButtonText?: string;
}

export class Employee {
	public Company?: Company;
	public LongTaskCommand?: ICommand;
	public Underlings?: Employee[];
	public IsSelected?: boolean;
	public IsMultiSelected?: boolean;
	public BonusAmount?: number;
	public Color?: string;
	public IsBonusEligible?: boolean;
	public FirstName?: string;
	public LastName?: string;
	public FullName?: string;
	public Age?: number;
	public RelevantAge?: number;
	public EditCommand?: Command;
	public Commands?: any[];
	public DisabledCommand?: Command;
	public IncreaseAgeCommand?: Command;
	public DecreaseAgeCommand?: Command;
	public FireCommand?: Command;
	public MakeBonusEligibleCommand?: Command;
	public DoSomethingElseCommand?: Command;
	public IsExpanded?: boolean;
	public StartDate?: Date;
}

export class Command {
	public Name?: string;
	public IsEnabled?: boolean;
	public IsDefault?: boolean;
	public Visibility?: boolean;
	public ToolTip?: string;
	public Icon?: number;
}

export class MessageBarParams {
	public Content?: string;
	public MessageBarType?: MessageBarType;
	public PrimaryCommand?: ICommand;
	public SecondaryCommand?: ICommand;
	public ShowCloseButton?: boolean;
	public Duration?: number;
	public IsVisible?: boolean;
}

export enum MessageBarType {
	info = 0,
	error = 1,
	blocked = 2,
	severeWarning = 3,
	success = 4,
	warning = 5,
}

