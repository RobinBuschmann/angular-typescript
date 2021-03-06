module at {

    import IModule = angular.IModule;

    interface IComponentDirective extends IComponentOptions {
        controller: Function|{prototype: {__componentAttributes: any;__componentRequirements: Array<string>}};
        scope: any;
        require: Array<string>;
    }

    export interface IComponentOptions {
        componentName: string;
        templateUrl?: string;
        template?: string;
        transclude?: boolean;
        controllerAs?: string;
        moduleName?: string;
        module?: IModule;

        // Has no functional reason: It is an easier way to
        // set the dependent directives/components. So instead
        // of importing them like "import './path/to/Component'"
        // we can now use:
        
        //       "import {Component} from './path/to/Component'"
        
        // and add "Component" to the directives array. If we
        // wouldn't add the "Component" reference, the ts -
        // compiler would identify "Component" as unused and
        // simply ignore this dependency and would not 
        // importing it
        directives?: Array<any>;
    }

    var componentDefaultOptions = {
        restrict: 'E',
        controllerAs: 'vm',
        transclude: false,
        bindToController: true,
        controller: null
    };

    export interface IPreLink {
        onPreLink: (element?: JQuery) => void;
    }
    export interface IPostLink {
        onPostLink: (element?: JQuery) => void;
    }
    export interface IDestroy {
        onDestroy: (element?: JQuery) => void;
    }

    /**
     * Creates an angular directive in component style
     *
     * @param options
     * @return {function(Function): void}
     * @annotation
     */
    export function Component(options: IComponentOptions): at.IClassAnnotationDecorator {
        return (target: Function) => {

            var config: IComponentDirective =
                angular.extend({}, componentDefaultOptions, options || {});

            // store component name, to be accessible from native js object
            let componentMeta = {name: options.componentName};

            Reflect.defineMetadata('component', componentMeta, target);

            // attribute meta data is defined in Attribute annotation
            let attributeMeta = Reflect.getMetadata('componentAttributes', target) || [];

            // required controller meta data is defined in RequiredCtrl annotation
            let requiredCtrlMeta = Reflect.getMetadata('requiredControllers', target) || [];

            // add required elements to directive config
            config.require = requiredCtrlMeta.map(value => value.option);

            // set target class as controller
            config.controller = target;

            // init isolated scope
            config.scope = {};

            // set scope hashes for controller scope
            angular.forEach(attributeMeta, meta => {
                config.scope[meta.propertyName] = meta.scopeHash;
            });

            // If onPreLink, onPostLink or onDestroy are implemented by
            // targets prototype, prepare these events:
            if (target.prototype.onPreLink
                || target.prototype.onPostLink
                || target.prototype.onDestroy
                || requiredCtrlMeta.length) {

                let link: {pre?: Function; post?: Function} = {};

                if (target.prototype.onPreLink
                    || target.prototype.onDestroy
                    || requiredCtrlMeta.length) {
                    link.pre = (scope, element, attrs, requiredCtrlInstances) => {

                        // ensure that requiredCtrlInstances parameter is always an array
                        requiredCtrlInstances = requiredCtrlInstances ? [].concat(requiredCtrlInstances) : [];

                        // retrieve component instance from scope, through controllerAs name
                        const componentInstance = scope[config.controllerAs];

                        // initialized required controller instances to component instance
                        requiredCtrlInstances.forEach((instance, index) => {

                           componentInstance[requiredCtrlMeta[index].key] = instance;
                        });

                        // process registered event handlers
                        if (componentInstance.onPreLink) componentInstance.onPreLink(element);
                        if (componentInstance.onDestroy) scope.$on('$destroy', () => componentInstance.onDestroy(element));
                    }
                }
                if (target.prototype.onPostLink) {
                    link.post = (scope, element) => {

                        // retrieve component instance from scope, through controllerAs name
                        const componentInstance = scope[config.controllerAs];

                        // process registered event handlers
                        if (componentInstance.onPostLink) componentInstance.onPostLink(element);
                    }
                }

                // add link to directive config
                (<any>config).compile = () => link;
            }

            if (!config.moduleName && !config.module) {

                throw new Error('Either "moduleName" or "module" has to be defined')
            }

            angular.module(config.moduleName || config.module.name)
                .directive(config.componentName, () => config);
        }
    }
}
