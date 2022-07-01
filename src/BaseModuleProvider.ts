import {ApplicationContract} from "@ioc:Adonis/Core/Application";

export abstract class BaseModuleProvider {
    public static needsApplication = true

    constructor(protected app: ApplicationContract) {}

    abstract resolve(): Record<string, () => any>

    protected resolveBinding(bindingKey: string) {
        return this.app.container.resolveBinding(bindingKey)
    }

    public async register() {
        let resolvers = this.resolve()

        for(let ns in resolvers) {
            let iocPrefixedNS = `@ioc:${ns}`

            this.app.container.singleton(iocPrefixedNS, resolvers[ns])
            this.app.container.bind(iocPrefixedNS, resolvers[ns])
            this.app.container.bind(ns, resolvers[ns])
        }
    }
}