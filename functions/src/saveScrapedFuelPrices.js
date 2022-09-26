export const saveScrapedFuelPrices = async (db, timestamp, fuelPrices, fuelType) => {
	const ref = db.ref(`fuel-prices/${fuelType}`)

	const promises = fuelPrices
		.filter((x) => !x.isGlobalPrice)
		.map((x) => ref.push({
			price: x.price,
			company: x.company.toUpperCase(),
			municipality: x.municipality.toUpperCase(),
			address: x.address.toUpperCase(),
			fuelType: x.fuelType.toUpperCase(),
			timestamp: timestamp,
		}))

	await Promise.all(promises)
}
