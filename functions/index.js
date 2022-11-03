/* eslint-disable no-unused-vars */
import functions from "firebase-functions"
import admin from "firebase-admin"
import express from "express"

import {generateQrCode} from "./src/generateQrCode.js"
import {scrapeFuelPrices} from "./src/scrapeFuelPrices.js"
import {saveScrapedFuelPrices} from "./src/saveScrapedFuelPrices.js"
import {saveCalculatedFuelPrice} from "./src/saveCalculatedFuelPrice.js"
import {calculateFuelPrice} from "./src/calculateFuelPrice.js"
import {getCalculatedFuelPrice} from "./src/getCalculatedFuelPrice.js"
import {fuelTypes} from "./src/fuelTypes.js"


const isEmulator = () => process.env.FUNCTIONS_EMULATOR === "true"

// App setup
admin.initializeApp()
const db = admin.database()
const app = express()

app.set("view engine", "ejs")
app.use(express.static("public"))


// Endpoints
app.get("/", async (_req, res) => {
	const fuelPrice = await getCalculatedFuelPrice(db, "DIESEL")
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

// Functions
export const web = functions.https.onRequest(app)

export const scrape = functions.pubsub
	.schedule("0 */8 * * *")
	.timeZone("Europe/Stockholm")
	.onRun(async (_context) => {
		const timestamp = admin.database.ServerValue.TIMESTAMP
		const fuelPrices = await scrapeFuelPrices()

		for (const fuelType of fuelTypes) {
			const fuelPricesOfFuelType =
				fuelPrices.filter((fuelPrice) => fuelPrice.fuelType === fuelType)

			await saveScrapedFuelPrices(db, timestamp, fuelPricesOfFuelType, fuelType)

			const fuelPrice = await calculateFuelPrice(db, fuelType)
			await saveCalculatedFuelPrice(db, timestamp, fuelPrice, fuelType)
		}
	})
