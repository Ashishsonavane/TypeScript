import ts from "typescript";
import {
    bench,
    describe,
} from "vitest";

const sampleCode = `
interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    metadata: Record<string, unknown>;
}

interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
    timestamp: Date;
}

type UserResponse = ApiResponse<User>;
type UserListResponse = ApiResponse<User[]>;

function createUser(name: string, email: string): User {
    return {
        id: Math.floor(Math.random() * 1000),
        name,
        email,
        roles: ["user"],
        metadata: {},
    };
}

function getUsers(): UserListResponse {
    const users: User[] = Array.from({ length: 10 }, (_, i) =>
        createUser("User " + i, "user" + i + "@example.com"),
    );
    return {
        data: users,
        status: 200,
        message: "OK",
        timestamp: new Date(),
    };
}

class UserService {
    private users: Map<number, User> = new Map();

    add(user: User): void {
        this.users.set(user.id, user);
    }

    get(id: number): User | undefined {
        return this.users.get(id);
    }

    list(): User[] {
        return Array.from(this.users.values());
    }

    search(predicate: (user: User) => boolean): User[] {
        return this.list().filter(predicate);
    }
}

async function fetchUser(id: number): Promise<UserResponse> {
    const service = new UserService();
    const user = service.get(id);
    if (!user) {
        throw new Error("User not found: " + id);
    }
    return {
        data: user,
        status: 200,
        message: "OK",
        timestamp: new Date(),
    };
}

export { createUser, getUsers, fetchUser, UserService };
export type { User, ApiResponse, UserResponse, UserListResponse };
`;

describe("TypeScript Compiler", () => {
    describe("Scanner", () => {
        bench("scan tokens from source", () => {
            const scanner = ts.createScanner(
                ts.ScriptTarget.Latest,
                false,
                ts.LanguageVariant.Standard,
                sampleCode,
            );
            while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
                // consume all tokens
            }
        });
    });

    describe("Parser", () => {
        bench("parse source file", () => {
            ts.createSourceFile(
                "sample.ts",
                sampleCode,
                ts.ScriptTarget.Latest,
                true,
            );
        });
    });

    describe("Checker", () => {
        bench("type-check source file", () => {
            const compilerOptions: ts.CompilerOptions = {
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.ESNext,
                strict: true,
                noEmit: true,
            };

            const host = ts.createCompilerHost(compilerOptions);
            const originalGetSourceFile = host.getSourceFile;
            host.getSourceFile = (fileName, languageVersion) => {
                if (fileName === "sample.ts") {
                    return ts.createSourceFile(
                        fileName,
                        sampleCode,
                        languageVersion,
                        true,
                    );
                }
                return originalGetSourceFile.call(
                    host,
                    fileName,
                    languageVersion,
                );
            };
            host.fileExists = fileName => {
                if (fileName === "sample.ts") return true;
                return ts.sys.fileExists(fileName);
            };
            host.readFile = fileName => {
                if (fileName === "sample.ts") return sampleCode;
                return ts.sys.readFile(fileName);
            };

            const program = ts.createProgram(
                ["sample.ts"],
                compilerOptions,
                host,
            );
            program.getSemanticDiagnostics();
        });
    });

    describe("Emit", () => {
        bench("emit JavaScript output", () => {
            const compilerOptions: ts.CompilerOptions = {
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.ESNext,
                strict: true,
                declaration: true,
            };

            const host = ts.createCompilerHost(compilerOptions);
            const originalGetSourceFile = host.getSourceFile;
            host.getSourceFile = (fileName, languageVersion) => {
                if (fileName === "sample.ts") {
                    return ts.createSourceFile(
                        fileName,
                        sampleCode,
                        languageVersion,
                        true,
                    );
                }
                return originalGetSourceFile.call(
                    host,
                    fileName,
                    languageVersion,
                );
            };
            host.fileExists = fileName => {
                if (fileName === "sample.ts") return true;
                return ts.sys.fileExists(fileName);
            };
            host.readFile = fileName => {
                if (fileName === "sample.ts") return sampleCode;
                return ts.sys.readFile(fileName);
            };
            host.writeFile = () => {};

            const program = ts.createProgram(
                ["sample.ts"],
                compilerOptions,
                host,
            );
            program.emit();
        });
    });
});
