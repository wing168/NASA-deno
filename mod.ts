import { Application, send } from "https://deno.land/x/oak@v6.3.2/mod.ts";
import api from './api.ts';
import * as log from "https://deno.land/std/log/mod.ts";

const app = new Application();
const PORT = 5000;

await log.setup({
    handlers: {
        console: new log.handlers.ConsoleHandler("INFO"),
    },
    loggers: {
        default: {
            level: "INFO",
            handlers: ["console"]
        }
    }
});

app.addEventListener("error", (event) => {
    log.error(event.error);
})

app.use(async(ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.body = "Internal server error";
        throw err;
    }
    
})

app.use(async(ctx, next) => {
    await next();
    console.log(`${ctx.request.method} ${ctx.request.url}`);
})

app.use(async(ctx, next) => {
    const start = Date.now();
    await next();
    const delta = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${delta}ms`)
});


app.use(api.routes());

app.use(async(ctx) => {
    const filePath = ctx.request.url.pathname;

    const fileWhitelist = [
        "/index.html",
        "/javascripts/script.js",
        "/stylesheets/style.css",
        "/images/favicon.png",
        "/videos/background.mp4"
    ];

    if (fileWhitelist.includes(filePath)) {
        await send(ctx, filePath, {
            root: `${Deno.cwd()}/public`
        });
    }
});



if (import.meta.main) {
    log.info(`Starting server on port ${PORT}`);
    await app.listen({
        port: PORT
    });
}

