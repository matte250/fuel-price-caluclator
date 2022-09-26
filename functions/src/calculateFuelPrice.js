export const calculateFuelPrice = async (db, fuelType) => {
	const ref = db.ref(`fuel-prices/${fuelType}`)

	const dbFuelPrices = await ref
		.orderByChild("timestamp")
		.limitToLast(100)
		.once("value")
		.then((snapshot) => snapshot.val())

	const prices = Object.entries(dbFuelPrices).map(([_, value]) => value.price)
	const averageFuelPrice =
        (prices.reduce((acc, cur) => acc + cur, 0) / prices.length)

	return averageFuelPrice
}
