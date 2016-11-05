#angular-typescript


## How to

### Services
The Service annotation tells angular, that the annotated class is injectable and registers it as a dependency with a
defined name or an auto generated name. This service will be a singleton during the app lifecyle.
```typescript
/**
 * @param {ng.IModule}  module Angular              module the service belongs to.
 * @param {string}      [serviceName]               Name of service. If not set, a unique name will generated 
 *                                                  automatically.
 */
function Service(module: ng.IModule, serviceName?: string): at.IClassAnnotationDecorator {}

/**
 * @param {string}      moduleName                  Name of angular module the service belongs to.
 * @param {string}      [serviceName]               Name of service. If not set, a unique name will generated 
 *                                                  automatically.
 */
function Service(moduleName: string, serviceName?: string): at.IClassAnnotationDecorator {}
```
#### Example
```typescript
@Service(appModule)
class BlogService {}
```
#### Comparison to plain angular

*Annotation version*
```typescript
@Service(appModule)
class BlogService {}
```
*Angular 1*
```typescript
class BlogService {}
appModule.service('<generated-name>', BlogService);
```

### Inject
This annotation tells angular, what dependencies should have been injected into the annotated class.
```typescript
/**
 * @param {Array<string|Function>} args Dependencies to inject. Therefor the dependencies can be named via
 *                                      string value or the class itself can passed.
 */
function Inject(...args: Array<string|Function>): IClassAnnotationDecorator {}
```
#### Example
```typescript
@Service(appModule)
@Inject('$http', BlogService)
class CommentService{

    constructor($http: ng.IHttpService,
                blogService: BlogService) {
    }
}
```
#### Under the hood
The Inject annotation adds the static property `$inject` to the class (constructor function). Why to use this? Check
http://stackoverflow.com/a/18699425

### Components
```typescript
/**
 * @param {object}      options                     Component options.
 * @param {string}      options.componentName       Name of component. Should defined in camel case. 
                                                    Angular will convert it automatically to dash-case. 
 * @param {ng.IModule}  [options.module]            Angular module the component belongs to.
 * @param {string}      [options.moduleName]        Name of angular module the component belongs to
 * @param {string}      [options.template]          HTML template.
 * @param {string}      [options.templateUrl]       Url to HTML template.
 * @param {Array}       [options.directives]        Dependent directives (dummy, see Directive option).
 * @param {boolean}     [options.transclude=false]  Indicates if a template can be passed or not.
 * @param {string}      [options.controllerAs=vm]   Name of property, which is available in the template
                                                    and is referencing the component controller instance.
 */
function Component(options: IComponentOptions): IClassAnnotationDecorator {}
```

## Why auto generated service names?
In the angular 1 world all components (services, factories, providers, directives, components, ...) need to have a
unique name.
That is simply how services and so on are recognized and can be processed (e.g. injected or rendered).
Since the usage of string values can be leading to typos, which also leads to errors, or making refactoring(renaming)
difficult, the angular-typescript annotations goes without them (if you want to) in case of service/provider/factory names. Instead,
unique names are generated automatically. So that all defined services, can be injected by using the class instead of
the string value. That also means, that the generated name can always be hidden for the consumer of the framework.
 The consumer doesn't need to care about it.
The name of components and directives has still to be set manually.

## Limitations

### Directives option
In angular 2 you need to define which *directives* and *components* do you want to use in your *component*. Therefor a
`directives` option exists. The angular-typescript annotation `Component` has this option as well, but unlike angular 2,
which restricts the availibility of these defined *directives* to the current component, angular-typescript
does nothing with the dependent *directives* or *components*. Angular 1 is currently not able to restrict
directives/components to specific tags. But why this option? Lets see an example with a directive dependency
`AnotherComponent`:
```
@Component({
    ...
    directives: [AnotherComponent]
})
class SomeComponent {}
```
Every annotation, which uses the `module.service()` or `module.component()` or `module.component()` and so on method under the
hood, registers the app component to the current module and makes it available in the entire application. Lets assume,
that we are using a module loader like jspm. If a javascript file with an annotated service isn't loaded, this service
will not be available. So to ensure, that a component is registered, the corresponding javascript file has
to be imported like `import {AnotherComponent} from 'path/to/AnotherComponent'`(1) or
`import 'path/to/AnotherComponent'`(2). If you are using a clever ide like WebStorm, an import can be added
automatically for you. If a type/variable is unknown in the current file, but available in the entire project, the ide
will give you a suggestion to import this type/variable like (1). But there is are problem with this approach.
If the `AnotherComponent` class variable isn't used in the target file, the import will be ignored when the typescript
source is transpiled to javascript. This problem do not appear with (2), but here you have to know the exact path
of the file. By adding `AnotherComponent` to the dependent directives, the compiler will be happy and consider the
needed import.
