// TL;DR - shit we had to do ourselves because React decided to make pointless breaking changes.


// createBrowserHistory comes from react-router, NOT the standalone "history"
// package: react-router 7 ships its own History type with createURL/encodeLocation,
// which history@5's BrowserHistory does not have, so HistoryRouter rejects it.
// react-router 7 exports it under the UNSAFE_ prefix, alongside the unstable_
// HistoryRouter this feeds. Both are internal-but-shipped.
import { UNSAFE_createBrowserHistory as createBrowserHistory } from 'react-router';

/**
 * The application's history object.
 *
 * React Router 6/7 exposes navigation only through hooks and provides no history
 * object to subscribe to - useLocation only tells a COMPONENT about a change, after
 * it renders. The framework needs to know the moment the URL changes, regardless of
 * what is mounted, so it owns the history itself and hands it to the router via
 * unstable_HistoryRouter.
 *
 * The app must render <HistoryRouter history={AppHistory} basename={...}> for this
 * to be the same history the router uses.
 *
 * A react-router history accepts exactly ONE listener - a second listen() throws
 * "A history only accepts one active listener". Both the framework (Window) and
 * HistoryRouter need to hear about navigation, so this object takes the single real
 * slot itself and fans out to any number of subscribers. Everything else is
 * delegated; location and action stay getters so they read live values.
 */
// v5Compat is REQUIRED: without it, push()/replace() update the URL but never call
// the listener - only popstate (back/forward) does. Programmatic navigation would
// change the address bar and nothing would re-render.
const _history = createBrowserHistory({ v5Compat: true });

type HistoryListener = Parameters<typeof _history.listen>[0];
const _listeners = new Set<HistoryListener>();

_history.listen(update =>
{
    // Copy first: a listener may unsubscribe during iteration.
    for (const listener of [..._listeners])
        listener(update);
});

export const AppHistory: typeof _history & { back(): void; forward(): void } =
{
    get action() { return _history.action; },
    get location() { return _history.location; },
    createHref: to => _history.createHref(to),
    createURL: to => _history.createURL(to),
    encodeLocation: to => _history.encodeLocation(to),
    push: (to, state) => _history.push(to, state),
    replace: (to, state) => _history.replace(to, state),
    go: delta => _history.go(delta),

    // react-router's History interface declares only go(), so these are added on
    // top of it rather than delegated - the underlying object's back()/forward()
    // are not in the type.
    back: () => _history.go(-1),
    forward: () => _history.go(1),

    listen(listener: HistoryListener)
    {
        _listeners.add(listener);
        return () => { _listeners.delete(listener); };
    },
};

/**
 * The path the app is mounted under, without a trailing slash - "/v4" for a page
 * whose <base href="/v4/">, or "" when mounted at the site root.
 *
 * This matters because AppHistory is a RAW browser history: its locations are real
 * URLs and its push() writes a real URL. Route paths, and everything the framework
 * keeps in FrameworkElement._route, are app-relative. Something has to bridge the
 * two, and the router only does it for its own matching - push("/AccountSettings")
 * would otherwise navigate away from /v4 entirely.
 */
export const AppBasePath: string = (() =>
{
    try
    {
        const href = document.head?.baseURI;
        if (!href)
            return '';
        const path = new URL(href, window.location.origin).pathname;
        return path === '/' ? '' : path.replace(/\/+$/, '');
    }
    catch
    {
        return '';
    }
})();

/** App-relative route -> real URL. "/AccountSettings" -> "/v4/AccountSettings" */
export function ToAbsoluteRoute(route: string): string
{
    if (!AppBasePath)
        return route;
    if (!route.startsWith('/'))
        route = '/' + route;
    return route === AppBasePath || route.startsWith(AppBasePath + '/')
        ? route
        : AppBasePath + route;
}

/** Real URL -> app-relative route. "/v4/AccountSettings" -> "/AccountSettings" */
export function ToAppRoute(pathname: string): string
{
    if (!AppBasePath || !pathname.startsWith(AppBasePath))
        return pathname;
    const rest = pathname.substring(AppBasePath.length);
    return rest.startsWith('/') ? rest : '/' + rest;
}
