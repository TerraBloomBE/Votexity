import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { parse, stringify } from "yaml"
import { join } from "path"

export class ConfigManager<T extends object> {
    private readonly filePath: string
    private config: T

    constructor(
        private readonly directory: string,
        private readonly fileName: string,
        private readonly defaultConfig: T
    ) {
        this.filePath = join(directory, `${fileName}.yml`)
        this.config = this.load()
    }

    private load(): T {
        if (!existsSync(this.directory)) {
            mkdirSync(this.directory, { recursive: true })
        }

        if (!existsSync(this.filePath)) {
            this.save(this.defaultConfig)
            return { ...this.defaultConfig }
        }

        const content = readFileSync(this.filePath, "utf-8")
        const parsed = parse(content) as T
        const merged = this.merge(this.defaultConfig, parsed)

        this.save(merged)

        return merged
    }

    private merge(defaults: T, loaded: Partial<T>): T {
        const result = { ...defaults }

        for (const key in loaded) {
            if (Object.prototype.hasOwnProperty.call(loaded, key)) {
                const value = loaded[key]
                if (value !== undefined && value !== null) {
                    result[key] = value as T[Extract<keyof T, string>]
                }
            }
        }

        return result
    }

    private save(data: T): void {
        writeFileSync(this.filePath, stringify(data), "utf-8")
    }

    get(): T {
        return this.config
    }

    set(data: Partial<T>): void {
        this.config = { ...this.config, ...data }
        this.save(this.config)
    }

    reload(): void {
        this.config = this.load()
    }
}