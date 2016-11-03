#angular-typescript


## How to

### Inject
This annotation tells angular, what dependencies should have been injected into the annotated class.
```
/**
 * @param {Array<string|Function>} args Dependencies to inject. Therefor the dependencies can be named via
 *                                      string value or the class itself can passed.
 */
Inject(...args: Array<string|Function>): at.IClassAnnotationDecorator
```
#### Example
```
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


### Services
The Service annotation tells angular, that the annotated class is injectable. The service will be a singleton during the app lifecyle.
```
/**
 * @param {ng.IModule} module Angular module the service belongs to
 * @param {string} [serviceName] Name of service. If not set, a unique name will generated automatically.
 */
Service(module: ng.IModule, serviceName?: string): IClassAnnotationDecorator

/**
 * @param {string} moduleName Name of angular module the service belongs to
 * @param {string} [serviceName] Name of service. If not set, a unique name will generated automatically.
 */
Service(moduleName: string, serviceName?: string): IClassAnnotationDecorator
```
#### Example
```
@Service(appModule)
class BlogService {}
```
#### Comparison to plain angular

*Annotation version*
```
@Service(appModule)
class BlogService {}
```
*Angular 1*
```
class BlogService {}
appModule.service('<generated-name>', BlogService);
```

## Why auto generated service names?
In the angular 1 world all components (services, factories, providers, directives, components, ...) need to have a
unique name.
That is simply how services and so on are recognized and can be processed (e.g. injected or rendered).
Since the usage of string values can be leading to typos, which also leads to errors, or making refactoring(renaming)
difficult, the angular-typescript annotations goes without them in case of service/provider/factory names. Instead,
unique names are generated automatically. So that all defined services, can be injected by using the class instead of
the string value. That also means, that the generated name can always be hidden for the consumer of the framework.
 The consumer doesn't need to care about it.
The name of components and directives has still to be manually set.

## Limitations

### Directives option

- todo component names needed directives for components
- todo service/providder/factory names has to be set, if the created module should be used by projects, which does not
use the angular-typescript annotations