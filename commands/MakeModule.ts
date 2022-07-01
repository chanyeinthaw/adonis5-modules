import {args, BaseCommand} from '@adonisjs/core/build/standalone'
import * as fs from 'fs'

export default class MakeModule extends BaseCommand {
	public static commandName = 'make:module'

	/**
	 * Command description is displayed in the "help" output
	 */
	public static description = 'Make a new module'

	public static settings = {
		loadApp: false,
		stayAlive: false,
	}

	@args.string({
		description: 'Name of the module',
		name: 'name'
	})
	public name: string

	private moduleRootDir = process.cwd() + '/modules/'
	private adonisrcPath = process.cwd() + '/.adonisrc.json'

	public async run() {
		const nameParts = this.name.split('/')
		const moduleName: string = nameParts.pop() as string
		let path = ''

		if (nameParts.length >= 0) {
			path = nameParts.join('/')
			path = path + '/'
		}

		const modulePath = `${this.moduleRootDir}${path}${moduleName}`

		if (fs.existsSync(modulePath)) {
			this.logger.info("Module already exists")
			return
		}

		if (!this.addModuleToAdonisRC(moduleName)) {
			this.logger.info("Provider declaration already exists in .adonisrc.json. Delete it first!")
			return
		}

		const servicesPath = `${modulePath}/Services`,
			contractsPath = `${modulePath}/Contracts`

		// create module, services and contracts dir
		fs.mkdirSync(modulePath)
		fs.mkdirSync(servicesPath)
		fs.mkdirSync(contractsPath)

		const defaultServiceName = moduleName,
			defaultServicePath = `${servicesPath}/${defaultServiceName}.service.ts`,
			defaultContractPath = `${contractsPath}/${defaultServiceName}.service.ts`

		// create contract, service, module and providers
		fs.writeFileSync(defaultContractPath, contractStub(defaultServiceName))
		fs.writeFileSync(defaultServicePath, serviceStub(moduleName, defaultServiceName))
		fs.writeFileSync(`${modulePath}/${moduleName}.module.ts`, moduleStub(moduleName, defaultServiceName))
		fs.writeFileSync(`${modulePath}/${moduleName}.provider.ts`, providerStub(moduleName))
	}

	private addModuleToAdonisRC(moduleName: string) {
		const adonisrcPath = this.adonisrcPath
		const adonisrc = JSON.parse(fs.readFileSync(adonisrcPath).toString())

		const moduleProviderEntry = `./modules/${moduleName}/${moduleName}.provider.ts`
		if (adonisrc.providers.indexOf(moduleProviderEntry) >= 0) {
			return false
		}

		adonisrc.providers.push(moduleProviderEntry)
		fs.writeFileSync(adonisrcPath, JSON.stringify(adonisrc, null, 2))
		return true
	}
}

const serviceStub = (module: string, service: string) => `
import {${service}ServiceContract} from "@ioc:${module}/${service}"

export default class ${service}Service implements ${service}ServiceContract {
    // implement service methods here
}
`

const contractStub = (name: string) => `
export interface ${name}ServiceContract {
    // define service method declarations here
}
`

const providerStub = (name: string) => `
import ${name}Service from './Services/${name}.service'

export default class ${name}Provider extends ModuleProvider {
    resolve = () => ({
        '${name}/${name}': () => new ${name}Service()
        // add service resolutions here
        // use this.resolveBinding to inject other services
    })
}
`

const moduleStub = (module: string, service: string) => `
declare module '@ioc:${module}/${service}' {
    import { ${service}ServiceContract } from "Modules/${module}/Contracts/${service}.service"

    const ${service}Service: ${service}ServiceContract

    export default ${service}Service
    export {
        ${service}ServiceContract
    }
}
`