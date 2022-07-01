import { BaseCommand } from '@adonisjs/core/build/standalone'
import * as fs from 'fs'

export default class InitModule extends BaseCommand {
    public static commandName = 'init:module'

    public static description = 'Initialize a module structure'

    public static settings = {
        loadApp: false,
        stayAlive: false,
    }

    public async run() {
        const adonisrcPath = process.cwd() + '/.adonisrc.json'
        const tsconfigPath = process.cwd() + '/tsconfig.json'

        const adonisrc = JSON.parse(fs.readFileSync(adonisrcPath).toString())
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath).toString())

        if (!Reflect.has(adonisrc.aliases, "Modules")) {
            adonisrc.aliases.Modules = "modules"
            fs.mkdirSync(process.cwd() + '/modules')

            fs.writeFileSync(adonisrcPath, JSON.stringify(adonisrc, null, 2))
        }

        if(!Reflect.has(tsconfig.compilerOptions.paths, "Modules/*")) {
            tsconfig.compilerOptions.paths["Modules/*"] = [
                "./modules/*"
            ]

            fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2))
        }
    }
}
