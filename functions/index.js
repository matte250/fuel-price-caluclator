/* eslint-disable no-unused-vars */

import functions from "firebase-functions"
import admin from "firebase-admin"
import jsdom from "jsdom"
import express from "express"

import {generateQrCode} from "./src/generateQrCode.js"
import {scrapeFuelPrices} from "./src/scrapeFuelPrices.js"
import {saveScrapedFuelPrices} from "./src/saveScrapedFuelPrices.js"
import {saveCalculatedFuelPrice} from "./src/saveCalculatedFuelPrice.js"
import {calculateFuelPrice} from "./src/calculateFuelPrice.js"
import {getCalculatedFuelPrice} from "./src/getCalculatedFuelPrice.js"


const isEmulator = () => process.env.FUNCTIONS_EMULATOR === "true"

admin.initializeApp()
const db = admin.database()

const app = express()
app.set("view engine", "ejs")
app.use(express.static("public"))


app.get("/", async (_req, res) => {
	const fuelPrice = await getCalculatedFuelPrice(db)
	if (!fuelPrice) {
		res.send("Nothing to be found yet :(")
		return
	}

	const DISTANCE = 7
	const FUEL_CONSUMPTION = 0.5

	const tripPrice = (DISTANCE * FUEL_CONSUMPTION) * fuelPrice

	const qrCode = await generateQrCode({amount: tripPrice.toFixed(2)})
	res.render("index", {
		qrCode,
		tripPrice: tripPrice.toFixed(2),
		fuelPrice: fuelPrice.toFixed(2),
	})
})

export const web = functions.https.onRequest(app)

export const scrape = functions.pubsub
	.schedule("0 1 * * *")
	.timeZone("Europe/Stockholm")
	.onRun(async (_context) => {
		const timestamp = admin.database.ServerValue.TIMESTAMP
		const fuelPrices = await scrapeFuelPrices()
		await saveScrapedFuelPrices(db, timestamp, fuelPrices)

		const fuelPrice = await calculateFuelPrice(db)
		await saveCalculatedFuelPrice(db, timestamp, fuelPrice)
	})
