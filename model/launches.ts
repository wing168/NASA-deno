import * as log from "https://deno.land/std/log/mod.ts";
import * as _ from "https://deno.land/x/lodash@4.17.15-es/lodash.js";

export interface Launch {
    flightNumber: number;
    mission: string;
    rocket: string;
    customers: Array<string>;
    launchDate: number;
    upcoming: boolean;
    success?: boolean;
    target?: string;
}

const launches = new Map<number, Launch>();

const downloadLaunchData = async () => {
    const response = await fetch("https://api.spacexdata.com/v3/launches");

    if (!response.ok) {
        log.warning("Problem downloading launch data...");
        throw new Error("Launch data failed to download");
    }

    const launchData = await response.json();

    for (const launch of launchData) {

        const payloads = launch.rocket.second_stage.payloads;
        const customers = _.flatMap(payloads, (payload: any) => {
            return payload["customers"];
        })

        const flightData ={
            flightNumber: launch["flight_number"],
            mission: launch["mission_name"],
            rocket: launch["rocket"]["rocket_name"],
            launchDate: launch["launch_date_unix"],
            upcoming: launch["upcoming"],
            success: launch["launch_success"],
            customers: customers
        }

        //set key, data

        launches.set(flightData.flightNumber, flightData);

        log.info(JSON.stringify(flightData));
    }
}

await downloadLaunchData();

log.info(`Downloaded ${launches.size} SpaceX launches`);

export const getAll = () => {
    return Array.from(launches.values());
}

export const getOne = (id: number) => {
    if (launches.has(id)) {
        return launches.get(id);
    }
    
    return null;
}

export const addOne = (data: Launch) => {
    launches.set(data.flightNumber, Object.assign(data, {
        upcoming: true,
        customers: ["ZTM", "NASA"]
    }))
}

export const removeOne = (id: number) => {
    const aborted = launches.get(id);
    
    if(aborted) {
        aborted.upcoming = false;
        aborted.success = false;
    }

    return aborted;

  
}
