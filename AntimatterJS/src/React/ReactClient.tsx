import * as React from 'react';
import { Component } from 'react';
import { Antimatter } from '../Antimatter';
import { BindingBase, BindingMode, BindingParameters } from '../Binding';
import { BindingExpression } from '../BindingExpression';
import { IClient } from '../IClient';
import { ModelObjectReference } from '../ModelObjectReference';
import { ModelValue } from '../ModelValue';

export const ReactDataContext = React.createContext<ModelObjectReference|undefined>(undefined);

export interface IBoundComponent extends Component
{
    antimatterBindingBases: Map<string, BindingBase>;
    antimatterBindingExps: Map<string, BindingExpression>;    
    antimatterOldShouldComponentUpdate?: any;
    antimatterOldRender?: any;
    antimatterLastDataContext?: ModelObjectReference;
}

export class ReactClient implements IClient
{
    BindCommand(target: any, args?: { path: string, source: ModelObjectReference }): () => void
    {
        const stateVar: string = (args?.source?.Handle || "dctx") + "." + args?.path;

        var exp = (target as any).antimatterBindingExps.get(stateVar) as BindingExpression;
        if (exp &&
            ModelObjectReference.Equals(exp.Source, args?.source) &&
            exp.SourcePath == args?.path)
            return target.state[stateVar + "Command"];     // already bound

        if (exp)
            exp.Unapply();

        exp = new BindingExpression(target, stateVar, args?.source, args?.path, false);
        exp.Apply();
        (target as any).antimatterBindingExps.set(stateVar, exp);

        return target.state[stateVar + "Command"] = (function ()
        {
            Antimatter.Server.ExecuteICommand(target.state[stateVar]);
        }).bind(target);
    }

    Bind(target: any, args?: BindingParameters, stateVar?: string): any
    {
        if (!stateVar)
            stateVar = (args?.Source?.Handle || "dctx") + "." + args?.Path;

        var exp = (target as any).antimatterBindingExps.get(stateVar) as BindingExpression;
        if (exp &&
            exp.Source == args?.Source &&
            exp.SourcePath == args?.Path)
            return target.state[stateVar];     // already bound

        if (exp)
            exp.Unapply();

        exp = new BindingExpression(target, stateVar, args?.Source, args?.Path, true, args?.Mode);
        exp.Apply();
        (target as any).antimatterBindingExps.set(stateVar, exp);

        if (args?.Mode === BindingMode.TwoWay)
        {
            target.state[stateVar + "Changed"] = (function (value: any)
            {
                Antimatter.Server.UpdateBindingSource(exp.Index, ModelValue.Get(value));
                var newState = {};
                newState[stateVar || ""] = value;
                target.setState(newState);                
            }).bind(target);
        }

        return target.state[stateVar];  
    }

    public PropChanged(component: Component, prop: string, value: any):void
    {
        var target = component as IBoundComponent;
        if (!target.antimatterBindingExps)
            throw "Components using prop binding must call InitializeComponent in their constructors or extend from AntimatterComponent";

        var exp = target.antimatterBindingExps.get(prop);
        if (exp && exp.Mode === BindingMode.TwoWay)
        {
            Antimatter.Server.UpdateBindingSource(exp.Index, ModelValue.Get(value));
            var newState = {};
            newState[prop] = value;
            target.setState(newState);
        }
    }

    UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean)
    {
        if (!target || !target.setState)
            return;
        if (!target.state)
            target.state = {};
        if (target.state[targetProperty] != value)
        {
            target.state[targetProperty] = value;
            if (reRender)
                target.setState({});
        }
    }

    InitializeComponent(component: Component)
    {
        var target = component as IBoundComponent;
        target.antimatterBindingBases = new Map<string, BindingBase>();
        target.antimatterBindingExps = new Map<string, BindingExpression>();

        // Handle prop changes after construction
        target.antimatterOldShouldComponentUpdate = target.shouldComponentUpdate;       
        target.shouldComponentUpdate = (nextProps, nextState) =>
        {
            this.BindPropsInternal(target, nextProps);            
            if ((target as any).antimatterOldShouldComponentUpdate)
                return (target as any).antimatterOldShouldComponentUpdate;
            return true;
        };

        // Intercept render to provide or consume data context
        target.antimatterOldRender = target.render;
        target.render = () =>
        {                        
            // consume data context from parent tree 
            // TODO - only need to consume dctx if we have dctx-dependent bindings
            return (
                <ReactDataContext.Consumer>
                {
                    (ctx) =>
                    {
                        this.CheckReapplyDataContext(target, ctx);

                        // Make this available for rendering inline bindings
                        target.state["DataContext"] = ctx;

                        return (target as any).antimatterOldRender();
                    }                        
                }                        
                </ReactDataContext.Consumer>                    
            )            
        };
        
        if (!target.state)
            target.state = {};
        this.BindPropsInternal(target, target.props);
    }

    private BindPropsInternal(target: IBoundComponent, props: Readonly<{}>): void
    {        
        var entries = Object.entries(props);
        for (const entry of entries)
            this.ProcessPropChange(target, entry[0], entry[1]);
    }

    private ProcessPropChange(target: IBoundComponent, prop: string, value: any)
    {
        let exp: BindingExpression | undefined;
        var existingBinding = target.antimatterBindingBases.get(prop);
        if (existingBinding)
        {
            var sameBindingBase = existingBinding === value;
            if (sameBindingBase)                
                return;

            exp = target.antimatterBindingExps.get(prop);
            if (exp)
            {
                // Different binding base requires unapplying the old binding
                exp?.Unapply();
            }
        }

        if (!value || !value.IsAntimatterBindingBase)
        {
            // Plain old value; set the state and continue
            target.state[prop] = value;
            if (exp)
            {
                target.antimatterBindingBases.delete(prop);
                target.antimatterBindingExps.delete(prop);
            }
            return;
        }

        if (!exp)
        {
            exp = (value as BindingBase).CreateBindingExpression(target, prop);
            target.antimatterBindingBases.set(prop, value);
            target.antimatterBindingExps.set(prop, exp);
        }

        if (!exp.IsDataContextDependent)
            // We can apply it now at prop assignment if it's not dctx dependent
            // Otherwise we have to wait for render
            exp.Apply();
    }

    private CheckReapplyDataContext(target: IBoundComponent, ctx: ModelObjectReference | undefined): boolean
    {
        if (ModelObjectReference.Equals(target.antimatterLastDataContext, ctx))            
            return false;

        target.antimatterLastDataContext = ctx;

        // (re)apply dctx-dependent exps
        var exps = Array.from(target.antimatterBindingExps);
        for (const exp of exps)
        {
            if (!exp[1].IsDataContextDependent)
                continue;
            exp[1].Apply(ctx);
        }

        return true;
    }
}