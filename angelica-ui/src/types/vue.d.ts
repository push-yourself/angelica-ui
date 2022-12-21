
import { RawLocation, Route, RouteConfig } from 'vue-router/types/router';

declare module 'vue/types/vue' {
    interface Vue {
        _inactive: boolean | null;
        _isBeingDestroyed: boolean;
        _hasHookEvent: boolean;
        _isDestroyed: boolean;
        _isMounted: boolean;
        _isVue: boolean;
    }
}
declare module 'vue-router/types/router' {
    interface VueRouter extends Matcher {
        matcher: Matcher;
        history: any;
    }

    interface Matcher {
        match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
        addRoutes: (routes: RouteConfig[]) => void;
    }
}