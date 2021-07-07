export class App {
	public Company?: Company;
}

export class Company {
	public Name?: string;
	public Employees?: Employee[];
	public SelectedEmployee?: Employee;
	public CEO?: Employee;
	public NewEmployeeCommand?: ICommand;
	public DeleteEmployeeCommand?: ICommand;
	public OpenTeachingBubbleCommand?: boolean;
	public TeachingBubbleOpen?: boolean;
	public TeachingBubblePrimaryCommand?: ICommand;
}

export class Employee {
	public IsBonusEligible?: boolean;
	public FirstName?: string;
	public LastName?: string;
	public FullName?: string;
	public Age?: number;
	public IncreaseAgeCommand?: ICommand;
}

export class ICommand {
}

