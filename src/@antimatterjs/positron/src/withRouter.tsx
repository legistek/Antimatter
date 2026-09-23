import * as React from "react";
import { NavigateFunction, useLocation, useNavigate, useNavigationType } from "react-router";

export interface IRouterBridgeProps
{
    OnNavigate: (navigate: NavigateFunction) => void;
    OnRouteChanged: (route: string, action: string) => void;
}

/**
 * React Router 6/7 exposes navigation only through hooks, and no longer provides
 * a history object to subscribe to. This renders nothing; it exists so that a
 * class component can receive the navigate function and be notified of route
 * changes without being wrapped in an HOC (which would strip its statics).
 */
export function RouterBridge(props: IRouterBridgeProps): null
{
    const navigate = useNavigate();
    const location = useLocation();
    const navigationType = useNavigationType();
    
    const first = React.useRef(true);
    React.useEffect(() =>
    {
        if (first.current)
        {
            first.current = false;
            return;
        }
        props.OnRouteChanged(location.pathname + location.search, navigationType);
    }, [location]);

    props.OnNavigate(navigate);

    return null;
}
