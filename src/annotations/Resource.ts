
module at {

    import IResourceArray = angular.resource.IResourceArray;
    'use strict';

    /* tslint:disable:no-any */
    type ResourceService = angular.resource.IResourceService;

    /* istanbul ignore next */
    function combineResource(instance: any, model?: any): void {
        angular.extend(instance, instance.$_Resource(model));
    }

    /* istanbul ignore next */
    export class ResourceClass<T> implements angular.resource.IResource<T> {
        public $promise: angular.IPromise<T>;
        private $promiseArray: angular.IPromise<IResourceArray<T>>;
        public $resolved: boolean;

        constructor(model?: any) {
            combineResource(this, model);
        }

        $get: () => angular.IPromise<T>;
        $query: () => angular.IPromise<IResourceArray<T>>;
        $save: () => angular.IPromise<T>;
        $remove: () => angular.IPromise<T>;
        $delete: () => angular.IPromise<T>;

        toJSON: () => {
            [index: string]: any;
        }
    }

    /* istanbul ignore next */
    //export class ResourceWithUpdate extends Resource  {
    //    public $promise : angular.IPromise<ResourceWithUpdate>;
    //    constructor(model?: any) { super(model); }
    //    public static update(params?: Object): ResourceWithUpdate { return new ResourceWithUpdate(); }
    //    public $update(params?: Object): angular.IPromise<ResourceWithUpdate> { return this.$promise; }
    //}

    export interface IResourceAnnotation {
        (moduleName: string, className: string): IClassAnnotationDecorator;
    }

    export function Resource(moduleName: string, className: string, url: string, options?: any): IClassAnnotationDecorator {
        return (target: any): void => {
            function resourceClassFactory($resource: ResourceService, $injector: ng.auto.IInjectorService, ...args: any[]): any {

                if (target.prototype.__resourceActions) prepareActionDataMapping(target.prototype.__resourceActions, $injector);

                const newResource: angular.resource.IResourceClass<any> =
                    $resource(url, target.prototype.__defaultResourceParams,
                        target.prototype.__resourceActions, options);

                // TODO: Quick fix INHERITANCE PROBLEM

                // NOTICE: Without 'extendWithPrototype' this overrides
                // prototype chain of target constructor function
                return AttachInjects(angular.extend(newResource, angular.extend(target, newResource, {
                    prototype: angular.extend(newResource.prototype,
                        // TODO: quick fix, "extendWithPrototype()" is used here
                        extendWithPrototype({}, angular.extend(target.prototype, {
                            /* tslint:disable:variable-name */
                            $_Resource: newResource
                            /* tslint:enable:variable-name */
                        })))
                })), ...args);
            }

            resourceClassFactory.$inject = (['$resource', '$injector']).concat(target.$inject /* istanbul ignore next */ || []);
            angular.module(moduleName).factory(className, resourceClassFactory);
        };
    }

    // TODO: For fixing INHERITANCE PROBLEM
    // This copies all parameters from src to dist, including prototype members
    function extendWithPrototype(dist, src) {

        for (var key in src) {
            if (!dist[key]) {
                dist[key] = src[key];
            }
        }
        return dist;
    }

    export interface IActionOptions extends angular.resource.IActionDescriptor {
        mapper?: (entry: any, ...dependencies) => any;
        mapperDependencies?: Array<string>;
    }

    var REMOVE_STARTING_$_REGEX = /^\$/;

    export function Action(options: IActionOptions): IMemberAnnotationDecorator {

        return (target: any, key: string): void => {

            if (!target.__resourceActions) {
                target.__resourceActions = {};
            }

            key = key.replace(REMOVE_STARTING_$_REGEX, '');

            target.__resourceActions[key] = options;
        }
    }

    function prepareActionDataMapping(actions, $injector) {

        var keys = Object.keys(actions);

        keys.forEach(key => {

            var action = actions[key];
            if (action.mapper) {
                if (action.transformResponse) {

                    throw new Error('Both "mapper" and "transformResponse" are not working on an action');
                }

                var dependencies = [];

                if (action.mapperDependencies) {
                    action.mapperDependencies.forEach(key => {
                        dependencies.push($injector.get(key));
                    });
                }

                action.transformResponse = data => {

                    return JSON.parse(data).map(entry =>
                        action.mapper.apply(null, [entry].concat(dependencies)));
                };
            }
        });

    }

    export function UseAsDefault(urlParamKey?: string): IMemberAnnotationDecorator {

        return (target: any, key: string): void => {

            if (!target.__defaultResourceParams) {
                target.__defaultResourceParams = {};
            }

            target.__defaultResourceParams[urlParamKey || key] = '@' + key;
        }
    }

    /* tslint:enable:no-any */
}
