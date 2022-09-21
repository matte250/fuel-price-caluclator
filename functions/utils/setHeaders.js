export const setHeaders = (response) =>
	response
		.set("Access-Control-Allow-Origin", "*")
		.set("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE")
		.set("Access-Control-Allow-Headers", "Content-Type")
