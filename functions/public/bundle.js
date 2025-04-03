(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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


},{}]},{},[1]);
