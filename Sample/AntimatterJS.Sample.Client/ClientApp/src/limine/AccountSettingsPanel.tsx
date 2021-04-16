import * as React from 'react';
import
    {
        Binding, AntimatterComponent, Grid, TextBlock, GroupBox, StackPanel, Orientation
    } from '@antimatterjs/react';

export class AccountSettingsPanel extends AntimatterComponent
{
    render()
    {
        return (
            <GroupBox Header="Account Settings">
                <Grid ColumnDefinitions={[Grid.ColumnDefinition(150), Grid.ColumnDefinition(1, true)]}
                    RowDefinitions={[Grid.RowDefinition(1, true)]}>
                    <TextBlock Text="Login" FontWeight="bold"/>
                    <TextBlock Text={new Binding("Identity.Login")} />

                    <TextBlock Text="Email" FontWeight="bold" />
                    <TextBlock Text={new Binding("Identity.Email")} />

                    <TextBlock Text="Name" FontWeight="bold" />
                    <TextBlock Text={new Binding("Identity.DisplayName")} />

                    <TextBlock Text="Company" FontWeight="bold" />
                    <TextBlock Text={new Binding("Identity.Company")} />

                    <TextBlock Text="Password" FontWeight="bold" />
                    <StackPanel Orientation={Orientation.Horizontal}>
                        <TextBlock Text="******" />                       
                    </StackPanel>

                    <TextBlock Text="Security Question" FontWeight="bold" />
                    <TextBlock Text={new Binding("Identity.SecurityQuestion")} />
                </Grid>
            </GroupBox>
            );
    }
}