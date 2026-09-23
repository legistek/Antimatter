import * as React from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Component } from 'react';

import { INotifyPropertyChanged } from '../INotifyPropertyChanged';
import { PropertyChangedEventArgs } from '../PropertyChangedEventArgs';
import { Antimatter } from '../Antimatter';
import { AppHistory, ToAbsoluteRoute } from '../AppHistory';
import { Binding } from '../Binding';
import { BindingExpression } from '../BindingExpression';
import { BindingMode, BindingParameters } from '../BindingParameters';
import { IClient } from '../IClient';
import { ModelObjectReference } from '../ModelObjectReference';
import { ModelValue, ModelValueType } from '../ModelValue';

import { BindingSourceType } from '../BindingSource';
import { ICollectionUpdate, NotifyCollectionChangedAction } from '../ICollectionUpdate';
import { BoundCollection } from '../BoundCollection';

import { Utilities } from '../Utilities';

export const ReactDataContext = React.createContext<ModelObjectReference | undefined>(undefined);

export interface IBindableComponent extends Component
{
    OnBoundPropertyUpdate(property: string, value: any, oldValue: any);
    DeferBindings: boolean;
    HasUnappliedCtxBindings: boolean;
}

export interface IBoundComponent extends IBindableComponent
{
    antimatterBindingBases: Map<string, Binding>;
    antimatterBindingExps: Map<string, BindingExpression>;
    antimatterOldShouldComponentUpdate?: any;
    antimatterOldRender?: any;
    antimatterLastDataContext?: ModelObjectReference;
    antimatterHasUpdated?: boolean;
    antimatterOldComponentWillUnmount?: any;
}

export class ReactClient implements IClient
{
    _root?: Component;


    RegisterRoot(root: any)
    {
        this._root = root as Component;
    }

    NavigateTo(route: string, hard: boolean = false)
    {
        if (hard)
        {
            window.location.href = route;
        }
        else
        {
            // React Router 6/7 no longer supplies a history prop, so the framework
            // owns the history object and hands it to the router (see AppHistory).
            AppHistory.push(ToAbsoluteRoute(route));
        }
    }

    OpenPopup(route: string, mini: boolean = false, urlOnPopupClosed?: string)
    {
        var wnd = window.open(route, "popup",
            {
                popup: mini
            } as any);
        if (wnd)
        {
            wnd.opener = null;
            if (urlOnPopupClosed)
                this.setupPopupCloseDetection(wnd, urlOnPopupClosed);
        }
    }

    setupPopupCloseDetection(wnd: Window, urlOnPopupClosed: string)
    {
        var fn = window.setInterval(
            () =>
            {
                if (wnd.closed)
                {
                    clearInterval(fn);
                    this.onPopupClosed(urlOnPopupClosed);
                }
            },
            200);
    }

    onPopupClosed(urlOnPopupClosed: string)
    {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", urlOnPopupClosed, true);        
        xhr.withCredentials = true;
        xhr.send();

        xhr.onload = () =>
        {
            if (xhr.status >= 200 && xhr.status < 300)
            {
                var response = xhr.responseText;
                console.log(response);
            } else
            {
                console.error(`Error ${xhr.status}: ${xhr.statusText}`);
            }
        };

        xhr.onerror = (event) =>
        {
            console.error("Request failed. " + event.toString());
        };
    }

    BindState(target: any, args?: BindingParameters, stateVar?: string): any
    {
        if (!stateVar)
            stateVar = (args?.Source?.Handle || "dctx") + "." + args?.Path;

        var exp = (target as any).antimatterBindingExps.get(stateVar) as BindingExpression;
        if (exp?.Parameters?.Source == args?.Source &&
            exp?.Parameters?.Path == args?.Path &&
            exp?.Parameters?.Version == args?.Version)
            return target.state[stateVar];     // already bound

        if (exp)
            exp.Unapply(true);

        exp = new BindingExpression(target, stateVar, args);
        exp.Apply();
        (target as any).antimatterBindingExps.set(stateVar, exp);

        return target.state[stateVar];
    }

    // Notify Model of View-Side Property Change
    public TargetChanged(
        component: Component,
        prop: string,
        value: any,
        reRender?: boolean,
        suspendNotifyModel?: boolean): void
    {
        var target = component as IBoundComponent;
        if (!target.antimatterBindingExps)
            throw "Components using prop binding must call InitializeComponent in their constructors or extend from AntimatterComponent";

        if (suspendNotifyModel !== true)
        {
            var exp = target.antimatterBindingExps.get(prop);
            if (exp?.ActualMode === BindingMode.TwoWay)
            {
                var newSourceValue = value;
                if (exp.Parameters.ConverterBack)
                    newSourceValue = exp.Parameters.ConverterBack(newSourceValue);
                var index = exp.Index;

                if (((exp._resolvedSource?.Type || 0) & BindingSourceType.INPC) > 0 &&
                    exp._resolvedSource?.POJO)
                {
                    exp.SuspendPOJOSourceChangeHandler = true;
                    try
                    {
                        exp._resolvedSource.POJO[exp.Parameters.Path as string] = newSourceValue;
                    }
                    finally
                    {
                        exp.SuspendPOJOSourceChangeHandler = false;
                    }
                }
                else
                {
                    //unstable_batchedUpdates(() =>
                    //{
                    this.BeginBatchingUpdates();
                    Antimatter.Server.UpdateBindingSource(index, newSourceValue);
                    this.EndBatchingUpdates();
                    //});
                }
            }
        }

        target.state[prop] = value;
        if (reRender !== false)
            this.InvalidateRender(target, false);
    }

    // Called to update model after view-side changes to bound collection
    public ModelUpdateBoundCollection(
        bx: BindingExpression,
        action: NotifyCollectionChangedAction,
        index: number,
        count: number,
        items?: any[]): void
    {
        var mvs = items
            ? items.map(item => ModelValue.Get(item))
            : [];

        this.BeginBatchingUpdates();
        //unstable_batchedUpdates(() =>
        //{
            Antimatter.Server.UpdateBoundCollection(
                bx.Index,
                {
                    Action: action,
                    Count: count,
                    Index: index,
                    Items: mvs
                });
        //});
        this.EndBatchingUpdates();
    }

    // Notify View of model-side collection change
    public ViewUpdateBoundCollection(
        bx: BindingExpression,
        target: any,
        targetProperty: string,
        update: ICollectionUpdate,
        reRender: boolean)
    {
        if (!target?.state)
            return;
        
        let collection: BoundCollection<any> | undefined = undefined;

        if (!target.state[targetProperty] ||
            !(target.state[targetProperty].IsBoundCollection) ||
            (collection = (target.state[targetProperty] as BoundCollection<any>)).BindingExpression !== bx)
        {
            // Should never happen
            collection = new BoundCollection<any>(bx);
        }

        this.BeginBatchingUpdates();
        collection.ProcessModelUpdate(update);
        this.EndBatchingUpdates();
    }

    private _isBatchingLevel = 0;
    private _renderQueue: Set<any> = new Set<any>();

    public BeginBatchingUpdates(): void
    {
        this._isBatchingLevel++;
    }

    public EndBatchingUpdates(): void
    {        
        if (this._isBatchingLevel <= 1)
        {
            for (var target of this._renderQueue)
                this.InvalidateRender(target, true);
            
            this._renderQueue.clear();           
            this._isBatchingLevel = 0;
        }
        else
        {
            this._isBatchingLevel--;
        }
    }

    public InvalidateRender(target: any, immediate: boolean = false)
    {
        if (this._isBatchingLevel <= 0 || immediate)
        {
            if (target.setState)
                target.setState({});
        }
        else
        {
            this._renderQueue.add(target);
        }
    }

    // Notify View of Model-Side property change
    UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean)
    {
        if (!target)
            return;
        if (!target.setState)
            return;
        if (!target.state)
            target.state = {};

        var oldValue = target.state[targetProperty];
        if (oldValue === value)
            return;

        target.state[targetProperty] = value;
        if (reRender && target.IsMounted !== false)
            this.InvalidateRender(target, false);

        if ((target as IBindableComponent).OnBoundPropertyUpdate)
            (target as IBindableComponent).OnBoundPropertyUpdate(targetProperty, value, oldValue);

        var inpc = (target as INotifyPropertyChanged);
        if (inpc?.PropertyChanged)
        {
            inpc.PropertyChanged.invoke(target, new PropertyChangedEventArgs(targetProperty));
        }
    }

    public UnapplyAllBindings(target: IBoundComponent)
    {
        for (const exp of target.antimatterBindingExps)
            exp[1].Unapply(true);
        target.antimatterBindingExps.clear();
        target.antimatterBindingBases.clear();
        //target.shouldComponentUpdate = target.antimatterOldShouldComponentUpdate;
        //target.componentWillUnmount = target.antimatterOldComponentWillUnmount;
    }

    InitializeComponent(component: Component)
    {
        var target = component as IBoundComponent;

        if (!target.antimatterBindingBases)
        {
            // first time


            target.antimatterBindingBases = new Map<string, Binding>();
            target.antimatterBindingExps = new Map<string, BindingExpression>();

            // Handle prop changes after construction
            target.antimatterOldShouldComponentUpdate = target.shouldComponentUpdate;
            target.shouldComponentUpdate = (nextProps, nextState) =>
            {
                this.BeginBatchingUpdates();
                const propChanges: boolean = this.BindPropsInternal(target, nextProps, false, nextState)
                this.EndBatchingUpdates();
                    //|| !target.antimatterHasUpdated
                    ;
                if ((target as any).antimatterOldShouldComponentUpdate)
                    return (target as any).antimatterOldShouldComponentUpdate;
                //if (any)
                //    target.antimatterHasUpdated = true;

                return propChanges || target.state !== nextState;
            };

            // Handle final unmounting
            target.antimatterOldComponentWillUnmount = target.componentWillUnmount;
            target.componentWillUnmount = () =>
            {
                if (target.antimatterOldComponentWillUnmount)
                    target.antimatterOldComponentWillUnmount();
                for (const exp of target.antimatterBindingExps)
                    exp[1].Unapply(true);
                target.antimatterBindingExps.clear();
                target.antimatterBindingBases.clear();
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
                                this.BeginBatchingUpdates();
                                this.CheckReapplyDataContext(target, ctx);
                                this.EndBatchingUpdates();

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
        }

        this.BindPropsInternal(target, target.props, true);
    }

    BindPropsInternal(target: IBoundComponent, props: Readonly<{}>, force: boolean, nextState?: Readonly<{}>): boolean
    {
        let any: boolean = false;
        var entries = Object.entries(props);
        for (const entry of entries)
        {
            if (this.ProcessPropChange(target, entry[0], entry[1], force, nextState))
                any = true;
        }
        return any;
    }

    ProcessPropChange(target: IBoundComponent, prop: string, nextPropValue: any, force: boolean, nextState?: Readonly<{}>): boolean
    {
        var binding = nextPropValue instanceof Binding ? nextPropValue as Binding : undefined;

        var existingBinding = target.antimatterBindingBases.get(prop);
        if (existingBinding)
        {
            if (binding &&
                BindingParameters.Equals(existingBinding.Parameters, binding.Parameters))
                // Same binding parameters = nothing to do
                return false;

            var exp = target.antimatterBindingExps.get(prop);
            if (exp)
            {
                // Different binding params requires unapplying
                // and deleting the old binding
                exp?.Unapply(true);
                target.antimatterBindingExps.delete(prop);
                target.antimatterBindingBases.delete(prop);
            }
        }

        if (binding)
        {
            if (target.DeferBindings)
                return false;

            var newExp = binding.CreateBindingExpression(target, prop);
            target.antimatterBindingBases.set(prop, nextPropValue);
            target.antimatterBindingExps.set(prop, newExp);

            if (!newExp.IsDataContextDependent)
                // We can apply it now at prop assignment if it's not dctx dependent
                // Otherwise we have to wait for render
                newExp.Apply();
            else
                (target as IBindableComponent).HasUnappliedCtxBindings = true;

            return true;
        }

        let changed: boolean = false;
        var lastValue = target.state[prop];

        if (target.props[prop] !== nextPropValue)
        {
            // Prop always trickles to state if it's new or changing
            if (nextState)
                nextState[prop] = nextPropValue;
            else
                target.state[prop] = nextPropValue;
            changed = true;
        }
        else if (!nextState)
        {
            target.state[prop] = nextPropValue;
            changed = true;
        }
        else if (target.state[prop] !== nextState[prop])
        {
            // Otherwise React state change
            target.state[prop] = nextState[prop];
            changed = true;
        }

        // If the target has property change notification, execute
        if (changed && (target as IBindableComponent).OnBoundPropertyUpdate)
            (target as IBindableComponent).OnBoundPropertyUpdate(prop, nextPropValue, changed ? lastValue : undefined);

        if (changed && (target as unknown as INotifyPropertyChanged).PropertyChanged)
            (target as unknown as INotifyPropertyChanged).PropertyChanged.invoke(target, new PropertyChangedEventArgs(prop));

        return changed;
    }

    CheckReapplyDataContext(target: IBoundComponent, ctx: ModelObjectReference | undefined): boolean
    {
        var newCtx = !ModelObjectReference.Equals(target.antimatterLastDataContext, ctx);

        if (!newCtx && !target.HasUnappliedCtxBindings)
            return false;

        target.antimatterLastDataContext = ctx;

        // (re)apply dctx-dependent exps
        var exps = Array.from(target.antimatterBindingExps);
        for (const exp of exps)
        {
            if (!exp[1].IsDataContextDependent)
                continue;
            if (newCtx || !exp[1]._isApplied)
            {
                if (exp[1]._isApplied)
                    exp[1].Unapply(false);
                exp[1].Apply(ctx);
            }
        }

        return true;
    }
}