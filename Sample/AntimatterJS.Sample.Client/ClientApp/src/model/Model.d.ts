import { TeachingBubbleParams } from '@antimatterjs/positron';

export class App
{
	public Company?: Company;
}

export class Company {
	public Name?: string;
	public Employees?: Employee[];
	public SelectedEmployee?: Employee;
	public SelectedEmployees?: Employee[];
	public CEO?: Employee;
	public NewEmployeeCommand?: ICommand;
	public DeleteEmployeeCommand?: ICommand;
	public OpenTeachingBubbleCommand?: boolean;
	public TeachingBubbleOpen?: boolean;
	public TeachingBubblePrimaryCommand?: ICommand;
	public TeachingBubbleInfo?: TeachingBubbleParams;
	public SomeEmployees?: Employee[];
	public SomeEmployeeNames?: string[];
	public SelectedEmployeeName?: string;
	public SelectedEmployeesDisplayText?: string;
	public SelectedEmployeeChangedCommand?: ICommand;
}

export class Employee {
	public IsBonusEligible?: boolean;
	public FirstName?: string;
	public LastName?: string;
	public FullName?: string;
	public Age?: number;
	public IncreaseAgeCommand?: ICommand;
	public RelevantAge?: number;
}

export class ICommand {
}

