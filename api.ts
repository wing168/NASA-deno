import { Router } from "https://deno.land/x/oak@v6.3.2/mod.ts";
import * as planets from "./model/planets.ts";

const router = new Router();

router.get("/", ctx => {
    ctx.response.body = "NASA MISSION CONTROL API"
});

router.get("/planets", ctx => {
    ctx.response.body = planets.getAllPlanets();
})

export default router;