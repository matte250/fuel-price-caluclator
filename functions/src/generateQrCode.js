import QRCode from "qrcode"

export const generateQrCode = async ({
	amount,
}) => {
	const result = await QRCode.toString(createSwishQrCodeFormat({
		recipient: "0733430393",
		amount: amount.toString(),
		message: "Hi!",
	}), {
		type: "svg",
		margin: 0,
		errorCorrectionLevel: "Q",
	})
	return result
}

const createSwishQrCodeFormat = ({
	recipient,
	amount,
	message,
}) => `C${recipient};${amount};${message ?? ""};0`
