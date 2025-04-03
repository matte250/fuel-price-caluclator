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
app.get("/", async (req, res) => {
	const fuelPrices = {
		petrol: await getCalculatedFuelPrice(db, "PETROL") ?? 0,
		diesel: await getCalculatedFuelPrice(db, "DIESEL") ?? 0,
		ethanol: await getCalculatedFuelPrice(db, "ETHANOL") ?? 0,
	}

	const formValues = {
		perVolumeCost: Number(req.query.perVolumeCost) || fuelPrices.petrol,
		consumption: Number(req.query.consumption) || 0.05,
		distance: Number(req.query.distance) || 70,
	}

	const tripPrice = (formValues.distance * formValues.consumption) * formValues.perVolumeCost

	const qrCode = await generateQrCode({amount: tripPrice.toFixed(2)})
	res.render("index", {
		qrCode,
		tripPrice: tripPrice.toFixed(2),
		fuelPrices,
		formValues,
	})
})

app.get("/generate-qrcode", async (req, res) => {
	const amount = Number(req.query.amount)
	if (!amount) {
		res.sendStatus(400)
		return
	}

	const qrCode = await generateQrCode({amount})
	res.send(qrCode)
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
			const fuelPricesOfFuelType
				= fuelPrices.filter((fuelPrice) => fuelPrice.fuelType === fuelType)

			await saveScrapedFuelPrices(db, timestamp, fuelPricesOfFuelType, fuelType)

			const fuelPrice = await calculateFuelPrice(db, fuelType)
			await saveCalculatedFuelPrice(db, timestamp, fuelPrice, fuelType)
		}
	})
