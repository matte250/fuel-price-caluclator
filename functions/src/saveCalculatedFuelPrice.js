export const saveCalculatedFuelPrice = async (db, timestamp, price, fuelType) => {
	const ref = db.ref(`calculated-fuel-price/${fuelType}`)

	await ref.push({
		timestamp,
		price,
	})
}
