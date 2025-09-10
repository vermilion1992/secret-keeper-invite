import ema from "@/indicators/ema/meta.json";
import rsi from "@/indicators/rsi/meta.json";
import atr from "@/indicators/atr/meta.json";
import sma from "@/indicators/sma/meta.json";
import wma from "@/indicators/wma/meta.json";
import hma from "@/indicators/hma/meta.json";
import dema from "@/indicators/dema/meta.json";
import tema from "@/indicators/tema/meta.json";
import kama from "@/indicators/kama/meta.json";
import vwma from "@/indicators/vwma/meta.json";

export const FALLBACK = {
  "/src/indicators/ema/meta.json": ema,
  "/src/indicators/rsi/meta.json": rsi,
  "/src/indicators/atr/meta.json": atr,
  "/src/indicators/sma/meta.json": sma,
  "/src/indicators/wma/meta.json": wma,
  "/src/indicators/hma/meta.json": hma,
  "/src/indicators/dema/meta.json": dema,
  "/src/indicators/tema/meta.json": tema,
  "/src/indicators/kama/meta.json": kama,
  "/src/indicators/vwma/meta.json": vwma
};