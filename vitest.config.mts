import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [codspeedPlugin()],
    server: {
        host: "127.0.0.1",
    },
    test: {
        benchmark: {
            include: ["benches/**/*.bench.{ts,js,mts,mjs}"],
        },
    },
});
