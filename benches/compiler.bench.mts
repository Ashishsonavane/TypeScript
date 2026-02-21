import {
    bench,
    describe,
} from "vitest";
import ts from "../built/local/typescript.js";

const smallSource = `
const greeting: string = "hello world";
function add(a: number, b: number): number {
    return a + b;
}
const result = add(1, 2);
`;

const mediumSource = `
interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

interface Post {
    id: number;
    title: string;
    content: string;
    author: User;
    tags: string[];
}

function createUser(name: string, email: string): User {
    return { id: Math.random(), name, email, createdAt: new Date() };
}

function createPost(title: string, content: string, author: User, tags: string[]): Post {
    return { id: Math.random(), title, content, author, tags };
}

class UserService {
    private users: Map<number, User> = new Map();

    addUser(user: User): void {
        this.users.set(user.id, user);
    }

    getUser(id: number): User | undefined {
        return this.users.get(id);
    }

    getAllUsers(): User[] {
        return Array.from(this.users.values());
    }

    findUsersByName(name: string): User[] {
        return this.getAllUsers().filter(u => u.name.includes(name));
    }
}

type Optional<T> = { [P in keyof T]?: T[P] };
type ReadonlyUser = Readonly<User>;
type UserKeys = keyof User;

async function fetchUsers(): Promise<User[]> {
    return [];
}

function processUsers<T extends User>(users: T[], callback: (user: T) => void): void {
    users.forEach(callback);
}

const service = new UserService();
const user = createUser("Alice", "alice@example.com");
service.addUser(user);
const post = createPost("Hello", "World", user, ["greeting"]);
`;

const largeSource = `
${mediumSource}

enum Status {
    Active = "ACTIVE",
    Inactive = "INACTIVE",
    Pending = "PENDING",
}

namespace Validators {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }

    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string): boolean {
            return /^[A-Za-z]+$/.test(s);
        }
    }

    export class ZipCodeValidator implements StringValidator {
        isAcceptable(s: string): boolean {
            return /^\\d{5}$/.test(s);
        }
    }
}

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const val = source[key];
            if (val !== undefined) {
                (output as Record<string, unknown>)[key] = val;
            }
        }
    }
    return output;
}

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type EventMap = {
    click: { x: number; y: number };
    keypress: { key: string; code: number };
    scroll: { deltaX: number; deltaY: number };
};

class EventEmitter<T extends Record<string, unknown>> {
    private handlers: Map<keyof T, Array<(data: unknown) => void>> = new Map();

    on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
        const existing = this.handlers.get(event) || [];
        existing.push(handler as (data: unknown) => void);
        this.handlers.set(event, existing);
    }

    emit<K extends keyof T>(event: K, data: T[K]): void {
        const handlers = this.handlers.get(event) || [];
        handlers.forEach(h => h(data));
    }
}

const emitter = new EventEmitter<EventMap>();
emitter.on("click", ({ x, y }) => console.log(x, y));
emitter.emit("click", { x: 10, y: 20 });

function pipe<A, B>(fn1: (a: A) => B): (a: A) => B;
function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
function pipe<A, B, C, D>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): (a: A) => D;
function pipe(...fns: Array<(arg: unknown) => unknown>): (arg: unknown) => unknown {
    return (arg: unknown) => fns.reduce((acc, fn) => fn(acc), arg);
}

const transform = pipe(
    (s: string) => s.length,
    (n: number) => n * 2,
    (n: number) => n.toString(),
);
`;

describe("scanner", () => {
    bench("scan small source", () => {
        const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, smallSource);
        while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
            // scan through all tokens
        }
    });

    bench("scan medium source", () => {
        const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, mediumSource);
        while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
            // scan through all tokens
        }
    });

    bench("scan large source", () => {
        const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, largeSource);
        while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
            // scan through all tokens
        }
    });
});

describe("parser", () => {
    bench("parse small source", () => {
        ts.createSourceFile("test.ts", smallSource, ts.ScriptTarget.Latest, true);
    });

    bench("parse medium source", () => {
        ts.createSourceFile("test.ts", mediumSource, ts.ScriptTarget.Latest, true);
    });

    bench("parse large source", () => {
        ts.createSourceFile("test.ts", largeSource, ts.ScriptTarget.Latest, true);
    });
});

describe("transpile", () => {
    bench("transpile small source", () => {
        ts.transpileModule(smallSource, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
        });
    });

    bench("transpile medium source", () => {
        ts.transpileModule(mediumSource, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
        });
    });

    bench("transpile large source", () => {
        ts.transpileModule(largeSource, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
        });
    });
});
