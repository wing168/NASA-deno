import { join } from "https://deno.land/std@0.77.0/path/mod.ts";
// import { BufReader } from "https://deno.land/std/io/bufio.ts";
// import { parse } from "https://deno.land/std/encoding/csv.ts";

import { parse } from "https://deno.land/std@0.77.0/encoding/csv.ts";
import { BufReader } from "https://deno.land/std@0.77.0/io/bufio.ts"; 
import { pick } from "https://deno.land/x/lodash@4.17.15-es/lodash.js"



type Planet = Record<string, string>;

let planets : Array<Planet>;


const loadPlanetData = async () => {
    const path = join("data", "kepler_exoplanets_nasa.csv");
    const data = await Deno.open(path);
    const bufReader = new BufReader(data);
    const result = await parse(bufReader, {
        skipFirstRow: true,
        comment: "#"
    });

    Deno.close(data.rid);

    const planets = (result as Array<Planet>).filter(planet => {
        const planetaryRadius = Number(planet["koi_prad"]);
        const stellarRadius = Number(planet["koi_srad"]);
        const stellarMass = Number(planet["koi_smass"]);

        return planet["koi_disposition"] === "CONFIRMED"
        && planetaryRadius > 0.5 && planetaryRadius < 1.5
        && stellarRadius > 0.99 && stellarRadius < 1.01
        && stellarMass > 0.78 && stellarMass < 1.04
    });

    return planets.map(planet => {
        return pick(planet, [
            "kepler_name",
            "koi_prad",
            "koi_smass",
            "koi_srad",
            "koi_count",
            "koi_steff"
        ])
    })

}



planets = await loadPlanetData();
console.log(`${planets.length} habitable planets found`)

export const getAllPlanets = () => {
    return planets;
}



