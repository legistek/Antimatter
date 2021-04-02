import * as React from 'react';
import { Component } from 'react';
import { Antimatter } from '../Antimatter';
import { BindingBase } from '../Binding';
import { BindingExpression } from '../BindingExpression';
import { IClient } from '../IClient';

export const ReactDataContext = React.createContext<any>(null);

export class ReactClient implements IClient
{
    BindCommand(target: any, args?: { path: string, source?: any }): () => void
    {
        const stateVar: string = (args?.source?.toString() || "dctx") + "." + args?.path;

        var exp = (target as any).antimatterBindingExps.get(stateVar) as BindingExpression;
        if (exp && exp.Source == args?.source && exp.SourcePath == args?.path)
            return target.state[stateVar + "Command"];     // already bound

        if (exp)
            exp.Unapply();

        exp = new BindingExpression(target, stateVar, args?.source, args?.path);
        exp.Apply(target.state["DataContext"]);
        (target as any).antimatterBindingExps.set(stateVar, exp);

        return target.state[stateVar + "Command"] = (function ()
        {
            Antimatter.Server.ExecuteICommand(target.state[stateVar]);
        }).bind(target);
    }

    Bind(target: any, args?: { path?: string, source?: any }): any
    {
        const stateVar: string = (args?.source?.toString() || "dctx") + "." + args?.path;

        var exp = (target as any).antimatterBindingExps.get(stateVar) as BindingExpression;
        if (exp && exp.Source == args?.source && exp.SourcePath == args?.path)
            return target.state[stateVar];     // already bound

        if (exp)
            exp.Unapply();

        exp = new BindingExpression(target, stateVar, args?.source, args?.path);
        exp.Apply(target.state["DataContext"]);
        (target as any).antimatterBindingExps.set(stateVar, exp);

        return target.state[stateVar];
    }

    UpdateTargetValue(target: any, targetProperty: string, value: any)
    {
        if (!target || !target.setState)
            return;
        let state: any = {};
        state[targetProperty] = value;
        target.setState(state);
    }

    InitializeComponent(target: any)
    {
        (target as any).antimatterBindingBases = new Map<string, BindingBase>();
        (target as any).antimatterBindingExps = new Map<string, BindingExpression>();

        // Handle prop changes after construction
        (target as any).antimatterOldShouldComponentUpdate = target.shouldComponentUpdate;       
        target.shouldComponentUpdate = (nextProps, nextState) =>
        {
            this.BindPropsInternal(target, nextProps, false);            
            if ((target as any).antimatterOldShouldComponentUpdate)
                return (target as any).antimatterOldShouldComponentUpdate;
            return true;
        };

        // Intercept render to provide or consume data context
        (target as any).antimatterOldRender = target.render;
        target.render = () =>
        {
            if (target.props["DataContext"])
            {
                // target has its own data context that was set explciitly 
                // through its props (direct or bound) so it's the provider for the branch
                // (but remember the value comes from state)

                if (target.props["DataContext"].IsDataContextDependent)
                {
                    // target needs to consume the parent data context in order to 
                    // properly bind its own
                    return (
                        <ReactDataContext.Consumer>
                            {
                                (parentCtx) =>
                                {
                                    var exp = (target as any).antimatterBindingExps.get("DataContext") as BindingExpression;
                                    if (exp)
                                        exp.Apply(parentCtx);
                                    // Takes care of any of target's other properties that are
                                    // dctx dependent
                                    this.CheckReapplyDataContext(target, target.state["DataContext"]);
                                    return (
                                        <ReactDataContext.Provider value={target.state["DataContext"]}>
                                            {(target as any).antimatterOldRender()}
                                        </ReactDataContext.Provider>
                                    );
                                }
                            }
                        </ReactDataContext.Consumer>
                    );
                }
                else
                {
                    // Takes care of any of target'other properties that are dctx dependent
                    this.CheckReapplyDataContext(target, target.state["DataContext"]);
                    return (
                        <ReactDataContext.Provider value={target.state["DataContext"]}>
                            {(target as any).antimatterOldRender()}
                        </ReactDataContext.Provider>
                    );
                }
            }
            else
            {
                // consume data context from parent tree 
                // TODO - only need to consume dctx if we have dctx-dependent bindings
                return (
                    <ReactDataContext.Consumer>
                    {
                        (ctx) =>
                        {
                            if (this.CheckReapplyDataContext(target, ctx))
                            {
                                target.state["DataContext"] = ctx;
                            }
                            return (target as any).antimatterOldRender();
                        }                        
                    }                        
                    </ReactDataContext.Consumer>                    
                )
            }
        };
        
        if (!(target as any).state)
            (target as any).state = {};
        this.BindPropsInternal(target, target.props, true);
    }

    private BindPropsInternal(target: Component, props: Readonly<{}>, initial: boolean): void
    {        
        // Check to see if there's been an explicit dctx change, i.e.,
        // a different direct value or different BindingBase.
        let dctxValueChange: boolean = false;

        var oldDctx = target.props["DataContext"];

        var entries = Object.entries(props);

        // Ensure data context is always handled first       
        for (const entry of entries)
        {
            if (entry[0] === "DataContext")
            {                
                if (entry[1] != oldDctx || initial)
                {
                    // Direct assignment                    
                    dctxValueChange = true;
                }

                this.ProcessPropChange(target, entry[0], entry[1], false);
                break;
            }
        }

        for (const entry of entries)
        {
            if (entry[0] === "DataContext")
                continue;
            this.ProcessPropChange(target, entry[0], entry[1], dctxValueChange);
        }            
    }

    private ProcessPropChange(
        target: any,
        prop: string,
        value: any,
        dctxValueChange: boolean)
    {
        let exp: BindingExpression | undefined;
        var existingBinding = (target as any).antimatterBindingBases.get(prop) as BindingBase;
        if (existingBinding)
        {
            var sameBindingBase = existingBinding === value;
            if (sameBindingBase &&
                (!existingBinding.IsDataContextDependent || !dctxValueChange))
                // same binding and it's either not DCTX dependent or 
                // there hasn't been a DCTX change, so nothing left to do
                return;

            exp = (target as any).antimatterBindingExps.get(prop) as BindingExpression;
            if (exp && !sameBindingBase)
            {
                // Different binding base requires unapplying the old binding
                exp?.Unapply();
            }
        }

        if (!value || !value.IsAntimatterBindingBase)
        {
            // Set the state and continue
            (target as any).state[prop] = value;
            return;
        }

        if (!exp)
        {
            exp = (value as BindingBase).CreateBindingExpression(target, prop);
            (target as any).antimatterBindingBases.set(prop, value);
            (target as any).antimatterBindingExps.set(prop, exp);
        }

        if (dctxValueChange || !exp.IsDataContextDependent)
        {
            exp.Apply(target.state["DataContext"]);
        }
    }

    private CheckReapplyDataContext(target: any, ctx: any): boolean
    {
        if (target.antimatterLastDataContext == ctx)    // undefined == null
            return false;

        target.antimatterLastDataContext = ctx;

        // (re)apply dctx-dependent exps
        var exps = Array.from(target.antimatterBindingExps as Map<string, BindingExpression>);
        for (const exp of exps)
        {
            if (!exp[1].IsDataContextDependent || exp[0] === "DataContext")
                continue;
            exp[1].Apply(ctx);
        }

        return true;
    }
}