import admin from "firebase-admin"
import {faker} from "@faker-js/faker"
import {fuelTypes} from "./src/fuelTypes.js"
import {saveScrapedFuelPrices} from "./src/saveScrapedFuelPrices.js"
import {saveCalculatedFuelPrice} from "./src/saveCalculatedFuelPrice.js"
import {calculateFuelPrice} from "./src/calculateFuelPrice.js"

admin.initializeApp({
	databaseURL: "http://127.0.0.1:9000/?ns=fuel-price-viewer-default-rtdb",
})

const db = admin.database()
db.useEmulator("localhost", 9000)

const timestamp = 0
await Promise.all(fuelTypes.map(async (fuelType) => {
	const fakeFuelPrices = Array.from({length: 10}, () => ({
		price: faker.datatype.number({min: 28, max: 32}),
		company: faker.company.name(),
		municipality: faker.address.county(),
		address: faker.address.streetAddress(),
		fuelType: fuelType,
	}))

	await saveScrapedFuelPrices(
		db,
		timestamp,
		fakeFuelPrices,
		fuelType,
	)

	const fuelPrice = await calculateFuelPrice(db, fuelType)
	await saveCalculatedFuelPrice(db, timestamp, fuelPrice, fuelType)
}))

process.exit()
