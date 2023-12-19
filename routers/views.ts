import express, { Request, Response } from "express";
import path from "path";

const viewRouter = express.Router();

viewRouter.get("/", (req: Request, res: Response) => {
  res.sendFile( path.parse(__dirname).dir + "/views/login.html");
});

viewRouter.get("/event", (req: Request, res: Response) => {
  res.sendFile(path.parse(__dirname).dir + "/views/event.html");
});

viewRouter.get("/historical", (req: Request, res: Response) => {
  res.sendFile(path.parse(__dirname).dir +  "/views/historical.html");
});

export default viewRouter;