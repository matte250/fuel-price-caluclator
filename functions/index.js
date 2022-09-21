/* eslint-disable no-unused-vars */

import functions from "firebase-functions"
import admin from "firebase-admin"
import jsdom from "jsdom"
import express from "express"

import {generateQrCode} from "./src/generateQrCode.js"
import {scrapeFuelPrices} from "./src/scrapeFuelPrices.js"


const isEmulator = () => process.env.FUNCTIONS_EMULATOR === "true"

admin.initializeApp()
const db = admin.database()

const app = express()
app.set("view engine", "ejs")
app.use(express.static("public"))


app.get("/", async (req, res) => {
	const ref = db.ref("fuel-prices")

	const dbFuelPrices = await ref
		.orderByChild("timestamp")
		.limitToLast(100)
		.once("value")
		.then((snapshot) => snapshot.val())

	if (!dbFuelPrices) {
		res.send("Nothing to be found yet :(")
		return
	}
	const prices = Object.entries(dbFuelPrices).map(([_, value]) => value.price)

	const averageFuelPrice = (prices.reduce((acc, cur) => acc + cur, 0) / prices.length)

	const DISTANCE = 7
	const FUEL_CONSUMPTION = 0.5

	const tripPrice = (DISTANCE * FUEL_CONSUMPTION) * averageFuelPrice

	const qrCode = await generateQrCode({amount: tripPrice.toFixed(2)})
	res.render("index", {
		qrCode,
		tripPrice: tripPrice.toFixed(2),
		fuelPrice: averageFuelPrice.toFixed(2),
	})
})

export const web = functions.https.onRequest(app)

export const scrape = functions.pubsub
	.schedule("0 1 * * *")
	.timeZone("Europe/Stockholm")
	.onRun(async (_context) => {
		const fuelPrices = await scrapeFuelPrices()
		const ref = db.ref("fuel-prices")
		const timestamp = admin.database.ServerValue.TIMESTAMP

		const promises = fuelPrices
			.filter((x) => !x.isGlobalPrice)
			.map((x) => ref.push({
				price: x.price,
				company: x.company.toUpperCase(),
				municipality: x.municipality.toUpperCase(),
				address: x.address.toUpperCase(),
				timestamp: timestamp,
			}))

		await Promise.all(promises)
	})
