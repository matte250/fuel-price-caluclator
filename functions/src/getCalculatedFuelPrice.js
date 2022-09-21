export const getCalculatedFuelPrice = async (db) => {
	const ref = db.ref("calculated-fuel-price")

	let result

	await ref
		.orderByChild("timestamp")
		.limitToLast(1)
		.once("value")
		.then((snapshot) => snapshot.forEach((x) => result = x.val().price))

	return result
}
