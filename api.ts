import { Router } from "https://deno.land/x/oak@v6.3.2/mod.ts";
import * as planets from "./model/planets.ts";
import * as launches from "./model/launches.ts";


const router = new Router();

router.get("/", ctx => {
    ctx.response.body = "NASA MISSION CONTROL API"
});

router.get("/planets", ctx => {
    ctx.response.body = planets.getAllPlanets();
});

router.get("/launches", (ctx) => {
    ctx.response.body = launches.getAll();
});

router.get("/launches/:id", (ctx) => {
    if (ctx.params?.id) {

        const launchesList = launches.getOne(Number(ctx.params.id))

        if (launchesList) {
            ctx.response.body = launchesList;
        }else {
            ctx.throw(400, "Launch with that ID does not exist");
        }
    } 
});


router.post("/launches", async (ctx) => {
    const body = ctx.request.body();

    const data: launches.Launch = await body.value;

    launches.addOne(data);

    ctx.response.body = { success: true }
    ctx.response.status = 201;


});

router.delete("/launches/:id", (ctx) => {
    if (ctx.params?.id) {
        const result = launches.removeOne(Number(ctx.params.id));
        ctx.response.body = { success: result }
    } else{
        ctx.throw(400, "Issue with flight number - cannot delete")
    }
});

export default router;