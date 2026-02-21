import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [codspeedPlugin()],
    test: {
        benchmark: {
            include: ["benches/**/*.bench.ts"],
        },
    },
    server: {
        host: "127.0.0.1",
    },
});
