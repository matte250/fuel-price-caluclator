const inputFuelPerVolumeCostElm = document.querySelector("#input-fuel-per-volume-cost")
const inputDistanceElm = document.querySelector("#input-distance")
const inputFuelConsumptionElm = document.querySelector("#input-fuel-consumption")
const resultElm = document.querySelector(".result")
const qrCodeElm = document.querySelector(".qrcode-wrapper")

inputFuelPerVolumeCostElm.addEventListener("input", (event) => {
	const {value} = event.target
	setSearchParam("perVolumeCost", value || null)
	calculateResult()
})

inputDistanceElm.addEventListener("input", (event) => {
	const {value} = event.target
	setSearchParam("distance", value || null)
	calculateResult()
})

inputFuelConsumptionElm.addEventListener("input", (event) => {
	const {value} = event.target
	setSearchParam("consumption", value || null)
	calculateResult()
})

function calculateResult() {
	const distance = Number(inputDistanceElm.value) || 0
	const fuelConsumption = Number(inputFuelConsumptionElm.value) || 0
	const fuelPerVolumeCost = Number(inputFuelPerVolumeCostElm.value) || 0
	const result = (distance * fuelConsumption) * fuelPerVolumeCost
	resultElm.textContent = `${result.toFixed(2)} kr`
	generateQrCode(result)
}

async function generateQrCode(amount) {
	const response
		= await fetch(`/generate-qrcode?amount=${amount}`)
			.then((res) => {
				if (res.ok) {
					return res.text()
				}

				return false
			})

	if (response) {
		qrCodeElm.innerHTML = response
	}
}

function setSearchParam(key, value) {
	const queryParams = new URLSearchParams(window.location.search)
	if (value !== null) {
		queryParams.set(key, value)
	} else {
		queryParams.delete(key)
	}

	const url = [...queryParams].length > 0
		? `?${queryParams.toString()}`
		: "/"

	window.history.replaceState(null, null, url)
}

