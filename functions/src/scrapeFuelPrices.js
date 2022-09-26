import {JSDOM} from "jsdom"
import {nameOf} from "../utils/nameOf.js"
import {fuelTypes} from "./fuelTypes.js"


export const scrapeFuelPrices = async () => {
	const rows = []
	let rowsToAdd = []
	for (const fuelType of fuelTypes) {
		let counter = 1

		while ((rowsToAdd = await tryScrapePage(counter, fuelType)).length != 0) {
			rows.push(...rowsToAdd)
			counter = counter += 1
		}
	}
	return rows
}

const fuelTypeToPath = {
	DIESEL: "diesel",
	PETROL: "95",
	ETHANOL: "etanol",
}


const tryScrapePage = async (page, fuelType) => {
	if (!Number(page)) {
		throw new TypeError(`${nameOf({page})} needs to be a number. current value: ${typeof page}`)
	}

	if (page < 0) {
		throw new RangeError(`${nameOf({page})} needs to be a positive value. current value: ${page}`)
	}

	if (!fuelTypes.find((x) => x === fuelType)) {
		throw new RangeError(`${fuelType} is not a valid fuel type defined in ${nameOf({fuelTypes})}`)
	}

	if (fuelTypeToPath[fuelType] === undefined) {
		throw new RangeError(`${fuelType} is not defined in ${nameOf({fuelTypeToPath})}}`)
	}

	const dom = await JSDOM
		.fromURL(`https://bensinpriser.nu/stationer/${fuelTypeToPath[fuelType]}/vastra-gotalands-lan/alla/${page}`)

	const rows = Array.from(dom.window.document
		.querySelector("#price_table")
		.querySelector("tbody")
		.querySelectorAll("tr[data-href]"))

	return rows.map((element) => ({...mapTableRow(element), fuelType}))
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
