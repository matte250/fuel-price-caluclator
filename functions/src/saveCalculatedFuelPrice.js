export const saveCalculatedFuelPrice = async (db, timestamp, price) => {
	const ref = db.ref("calculated-fuel-price")

	await ref.push({
		timestamp,
		price,
	})
}
