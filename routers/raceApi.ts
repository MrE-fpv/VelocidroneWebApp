import express, { Response } from "express";

import Race from "../models/race";
import Event from "../models/event";
import auth from "../middleware/auth";
import RequestPlus from "../models/RequestPlus";

const raceRouter = express.Router();

raceRouter.post("/racestatus", auth.byApiKey, async (req: RequestPlus, res: Response) => {
    if (req.body.racestatus.raceAction == "start") {
        // raceDateTime = new Date(Date.now());
        // raceStarted = true;
    }
    else if (req.body.racestatus.raceAction == "race finished") {
        //raceStarted = false;
    }
    else if (req.body.racestatus.raceAction == "abort") {
        const event = await Event.findOneByHostId(req.user?._id);

        if (event === null) {
            res.status(400).send("Event not found");
            return;
        }

        const races = await Race.findByEventIdAndHostId(event?._id, req.user?._id, false);

        races.forEach((race) => {
            race.aborted = true;
            race.save();
        });
    }

    if (req.io) {
        req.io.emit("raceStatus", req.body.racestatus.raceAction);
    }

    res.send("Data received and saved");
});

raceRouter.post("/racedata", auth.byApiKey, async (req: RequestPlus, res: Response) => {
    console.log(req.body);
    const raceData = req.body;

    if (!req.user) {
        res.status(401).send();
        return;
    }

    const event = await Event.findOneByHostId(req.user._id);

    if (!event) {
        res.status(401).send();
        return;
    }

    for (const pilotName of Object.keys(raceData["racedata"])) {

        const pilotRace = raceData["racedata"][pilotName];

        let data = await Race.findOneByPilotAndEventId(pilotName, event._id.toString(), false);

        if (data !== null) {
            if (data.hasGateTime(pilotRace.time)) {
                continue;
            }

            data.finished = pilotRace.finished.toLowerCase() == "true";
        }
        else {
            const heatNumber = await Race.countByPilotAndEventId(pilotName, String(event._id), true);
            data = Race.createRace(pilotName, pilotRace.finished.toLowerCase() == "true", false, "#" + pilotRace.colour, new Date(Date.now()), heatNumber + 1, event._id);
        }

        data.addGateData(pilotRace.position, pilotRace.lap, pilotRace.gate, pilotRace.time);

        await data.save();

        if (req.io) {
            req.io.emit("raceDataUpdate", data);
        }
    }

    res.send("Data received and saved");
});

export default raceRouter;