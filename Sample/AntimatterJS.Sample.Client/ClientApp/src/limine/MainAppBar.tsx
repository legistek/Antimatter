import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { useBoolean, useId } from '@fluentui/react-hooks';
import { Link as RouterLink } from 'react-router-dom';
import { ActionButton, Button, Callout, createTheme, getTheme, IconButton, IconType, loadTheme, Persona, Separator, Link } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Window } from '../components/Window';
import { TextBlock } from '../components/TextBlock';
import { StackPanel } from '../components/StackPanel';
import { ModernButton } from '../components/ModernButton';


export class MainAppBar extends AntimatterComponent<{}, { isProfileCalloutOpen: boolean }>
{
    //static theme = getTheme();

    _menuButtonElement?: HTMLElement | null;

    constructor(props)
    {
        super(props);
        this.state = {
            isProfileCalloutOpen: false
        };
    }

    private toggleIsProfileVisible()
    {
        this.setState({ isProfileCalloutOpen: !this.state.isProfileCalloutOpen });
    }

    render()
    {
        const theme = getTheme();

        return (
            <div style={{
                display: "grid",
                zIndex: 1000,
                gridTemplateColumns: "auto 1fr auto",
                background: theme.palette.themeDarker,
                color: theme.palette.themeLighter
            }}>
                <TextBlock Text="Limine" />

                <div>
                </div>

                <div ref={(menuButton) => this._menuButtonElement = menuButton}>
                    <IconButton
                        iconProps={{ iconName: "Contact", color: "white" }}
                        style={{ color: "white" }}

                        onClick={(e) => this.toggleIsProfileVisible()} />
                </div>

                {
                    this.state.isProfileCalloutOpen &&
                    (
                        <Callout
                            style={{ padding: "5px" }}
                            role={'alertdialog'}
                            ariaLabelledBy={"Hobo"}
                            ariaDescribedBy={"Hobo"}
                            target={this._menuButtonElement}
                            isBeakVisible={false}
                            onPositioned={(p) =>
                            {
                                let a: number = 1;
                            }}
                            onDismiss={() => this.toggleIsProfileVisible()}
                            setInitialFocus>
                            <StackPanel>                            
                                <Persona text={this.BindState({ Path: "Identity.DisplayName" })}
                                    secondaryText={this.BindState({ Path: "Identity.Email" })} />
                                <Separator />
                                <div>
                                    <Link href="#/account">Account Settings</Link>
                                </div>
                                <div>
                                    <Link href="/">Logout</Link>
                                </div>
                            </StackPanel>
                            {/*<TextBlock Text={new Binding("Identity.DisplayName")} />*/}
                        </Callout>
                    )
                }

            </div>
        );
    }
}