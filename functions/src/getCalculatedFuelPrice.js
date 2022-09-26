export const getCalculatedFuelPrice = async (db, fuelType) => {
	const ref = db.ref(`calculated-fuel-price/${fuelType}`)

	let result

	await ref
		.orderByChild("timestamp")
		.limitToLast(1)
		.once("value")
		.then((snapshot) => snapshot.forEach((x) => result = x.val().price))

	return result
}
