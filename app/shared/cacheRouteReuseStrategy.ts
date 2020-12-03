import { RouteReuseStrategy, Route } from '@angular/router/';
import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CacheRouteReuseStrategy implements RouteReuseStrategy {
    storedRouteHandles: Map<string, DetachedRouteHandle> = new Map<string, DetachedRouteHandle>();
    allowRetriveCache: {[key: string]: boolean};


    constructor(routesToAllowCaching: {[key: string]: boolean}) {
      this.allowRetriveCache = routesToAllowCaching;
    }

    // TODO: This should probably be refactored and/or broken up into a root strategy and module strategies
    shouldReuseRoute(future: ActivatedRouteSnapshot, current:  ActivatedRouteSnapshot): boolean {
      return this.areConfigsTheSame(future.routeConfig, current.routeConfig)
        || this.routeReuseAllowed(future.data.allowRouteReuse, this.getPath(current));
    }

    private areConfigsTheSame(a: Route, b: Route): boolean {
      return (a === b) || (a.component === b.component && a.path === b.path);
    }

    private routeReuseAllowed(allowedRoutes: string[] | null, desiredRoute: string): boolean {
      return allowedRoutes && allowedRoutes.includes(desiredRoute);
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return this.storedRouteHandles.get(this.getPath(route));
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return this.storedRouteHandles.has(this.getPath(route));
    }

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        const path = this.getPath(route);
        return this.allowRetriveCache.hasOwnProperty(path);
    }

    store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
        this.storedRouteHandles.set(this.getPath(route), detachedTree);
    }

    private getPath(route: ActivatedRouteSnapshot): string {
        if (route.routeConfig !== null && route.routeConfig.path !== null) {
            return route.routeConfig.path;
        }
        return '';
    }
}