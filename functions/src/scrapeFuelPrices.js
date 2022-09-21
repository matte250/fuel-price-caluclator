import {JSDOM} from "jsdom"


export const scrapeFuelPrices = async () => {
	const rows = []
	let counter = 1
	let rowsToAdd = []
	while ((rowsToAdd = await tryScrapePage(counter)).length != 0) {
		rows.push(...rowsToAdd)
		counter = counter += 1
	}
	return rows
}


const tryScrapePage = async (page) => {
	if (!Number(page)) {
		throw new TypeError("Page needs to be a number")
	}

	if (page < 0) {
		throw new RangeError("Page needs to be a positive value")
	}

	const dom = await JSDOM.fromURL(`https://bensinpriser.nu/stationer/diesel/vastra-gotalands-lan/alla/${page}`)
	const rows = Array.from(dom.window.document
		.querySelector("#price_table")
		.querySelector("tbody")
		.querySelectorAll("tr[data-href]"))

	return rows.map(mapTableRow)
}

const mapTableRow = (element) => {
	const metaInfoElement = element.children[0]
	const companyElement = metaInfoElement.children[0].childNodes[0]
	const municipalityElement = metaInfoElement.children[0].children[0]
	const addressElement = metaInfoElement.childNodes[2]
	const priceContainerElement = element.children[1].children[0]

	return {
		company: companyElement.textContent.trim(),
		municipality: municipalityElement.textContent.trim(),
		address: addressElement.textContent.trim(),
		price: Number(priceContainerElement.textContent.slice(0, -2).replace(",", ".")),
		isGlobalPrice: priceContainerElement.style.color === "rgb(132, 132, 92)",
	}
}
