import { Router } from "express";
import middleware from "../middleware/middleware.js";

const router = Router();

router.route("/")
    .get(async (req, res) => {
        console.log("GET request");
    })
    .post(middleware.splitFile);

export default router;
