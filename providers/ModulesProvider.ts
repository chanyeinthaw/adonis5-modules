import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class ModulesProvider {
	public static needsApplication = true

	constructor(protected app: ApplicationContract) {}

	public async register() {
	}
}
