import { OK } from 'http-status-codes';
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(OK).json({ message: "Hello from API" })
});
router.get("/ping", (_req, res) => {
  res.status(OK).json({ message: "pong" })
});
router.post("/requestMintAddress", (req, res) => { });
router.post("/ukissResponse", (req, res) => { });

export default router;