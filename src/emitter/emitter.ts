interface EventMap {
    [key: string]: any[];
    [key: symbol]: any[];
}
type EventKey<T> = Extract<keyof T, string | symbol>;
type EventReceiver<T extends any[]> = (...params: T) => void;

interface Emitter<T> {
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K] extends any[] ? T[K] : never>): this;
    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K] extends any[] ? T[K] : never>): this;
    emit<K extends EventKey<T>>(eventName: K, ...params: T[K] extends any[] ? T[K] : never): void;
    once<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K] extends any[] ? T[K] : never>): this;
    removeAllListeners<K extends EventKey<T>>(eventName?: K): this;
    listenerCount<K extends EventKey<T>>(eventName: K): number;
    listeners<K extends EventKey<T>>(eventName: K): EventReceiver<T[K] extends any[] ? T[K] : never>[];
    hasListener<K extends EventKey<T>>(eventName: K, fn?: EventReceiver<T[K] extends any[] ? T[K] : never>): boolean;
}

class EventEmitter<T> implements Emitter<T> {
    private events: { [K in keyof T]?: Set<EventReceiver<any>> } = {};

    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K] extends any[] ? T[K] : never>): this {
        if (!this.events[eventName]) {
            this.events[eventName] = new Set();
        }
        this.events[eventName]?.add(fn);
        return this;
    }

    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K] extends any[] ? T[K] : never>): this {
        const eventSet = this.events[eventName];
        if (eventSet) {
            eventSet.delete(fn);
            if (eventSet.size === 0) {
                delete this.events[eventName];
            }
        }
        return this;
    }

    emit<K extends EventKey<T>>(eventName: K, ...params: T[K] extends any[] ? T[K] : never): void {
        const eventSet = this.events[eventName];
        if (eventSet) {
            for (const fn of eventSet) {
                fn(...params);
            }
        }
    }

    once<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K] extends any[] ? T[K] : never>): this {
        const onceWrapper = (...params: T[K] extends any[] ? T[K] : never) => {
            this.off(eventName, onceWrapper);
            fn(...params);
        };
        this.on(eventName, onceWrapper);
        return this;
    }

    removeAllListeners<K extends EventKey<T>>(eventName?: K): this {
        if (eventName) {
            delete this.events[eventName];
        } else {
            this.events = {};
        }
        return this;
    }

    listenerCount<K extends EventKey<T>>(eventName: K): number {
        return this.events[eventName]?.size ?? 0;
    }

    listeners<K extends EventKey<T>>(eventName: K): EventReceiver<T[K] extends any[] ? T[K] : never>[] {
        return Array.from(this.events[eventName] ?? []);
    }

    hasListener<K extends EventKey<T>>(eventName: K, fn?: EventReceiver<T[K] extends any[] ? T[K] : never>): boolean {
        const eventSet = this.events[eventName];
        if (!eventSet || eventSet.size === 0) return false;
        return fn ? eventSet.has(fn) : true;
    }
}

export { EventEmitter };