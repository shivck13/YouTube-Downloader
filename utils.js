const validator = require('validator')

function extractData(ytd) {
	let data = {
		"details": {},
		"media": []
	}

	data.details.videoId = ytd.details.videoId
	data.details.title = ytd.details.title
	data.details.views = ytd.details.viewCount ? formatCount(ytd.details.viewCount) : "unknown"
	data.details.duration = ytd.details.lengthSeconds ? getDuration(ytd.details.lengthSeconds) : "unknown"
	data.details.channel = ytd.details.author ? ytd.details.author : "unknown"
	data.details.channelId = ytd.details.channelId

	ytd.media.forEach((m, i) => {
		let tmp = {}

		tmp.url = m.url
		tmp.type = m.mimeType.split(";")[0].split("/")[0].toLowerCase() == "video" ? ("🎦" + (m.audioQuality ? "🔊" : "🔇")) : "🔊"
		tmp.quality = m.qualityLabel ? m.qualityLabel : (m.audioQuality ? m.audioQuality.split("_").at(-1).toLowerCase() : m.quality)
		tmp.size = formatBytes(m.contentLength)
    
		data.media.push(tmp)
	})

	return data
}

function formatCount(count) {
	return new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 2,
		notation: "compact",
		compactDisplay: "short"
	}).format(count)
}

function getDuration(sec) {
	return new Date(sec * 1000).toISOString().substring((sec < 3600 ? 14 : 11), 19)
}

function formatBytes(bytes, decimals = 2) {
	if (!+bytes) return 'unknown'

	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`
}

function isValidYTLink(link) {
	return validator.isURL(link) && (validator.contains(link, "youtube.", {
		ignoreCase: true
	}) || validator.contains(link, "youtu.be/", {
		ignoreCase: true
	})) && validator.isLength(link, {
		min: 27
	})
}

module.exports = {
	extractData,
	isValidYTLink,
}