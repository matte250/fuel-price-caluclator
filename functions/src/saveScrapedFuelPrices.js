export const saveScrapedFuelPrices = async (db, timestamp, fuelPrices) => {
	const ref = db.ref("fuel-prices")

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
}
