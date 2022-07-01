import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class TestModule extends BaseCommand {
	public static commandName = 'test:module'
	public static description = 'test module'
	public static settings = {
		loadApp: true,
	}

	public async run(): Promise<void> {
		this.logger.info('Hello')
	}
}
