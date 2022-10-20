const express = require('express')
const validator = require('validator')
const path = require("path")
const YouTubeDownloader = require("./youtube-downloader.js")

// 👉 initialisation
const app = express()
const port = 3000

// 👉 settings
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// 👉 middlewares
app.use(express.static(path.join(__dirname, "static")))

// 👉 routes
app.get("/", async (req, res) => {
	let link = req.query.yt 
	let data = {}

	if (link == undefined || link == null || validator.isEmpty(link)) { 
		data = {info: "empty"}
	} else { 
    // treat shorts links as normal (otherwise fails) 
    // better way: extract video id
    link = link.replace("shorts/", "watch?v=")
    
		let isValidYTLink = validator.isURL(link) && (validator.contains(link, "youtube.", {ignoreCase: true}) || validator.contains(link, "youtu.be/", {ignoreCase: true})) && validator.isLength(link, {min: 27}) ? true : false

		if (isValidYTLink) {
			try {
				let ytd = new YouTubeDownloader(link)

				await ytd.run()
				
				data = {"details": {}, "media": []}

				data.details.videoId = ytd.details.videoId
				data.details.title = ytd.details.title
				data.details.views = ytd.details.viewCount ? new Intl.NumberFormat('en-US', {
					maximumFractionDigits: 2,
					notation: "compact",
					compactDisplay: "short"
				}).format(ytd.details.viewCount) : "unknown"
				data.details.duration = ytd.details.lengthSeconds ? new Date(ytd.details.lengthSeconds * 1000).toISOString().substring((ytd.details.lengthSeconds < 3600 ? 14 : 11), 19) : "unknown"
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
			} catch (err) {
				console.log(err)
				data = {error: "unknown"}
			}
		} else {
			data = {error: "invalid"}
		}
	}
	
	res.render("index", {"data": data})
})

// 👉 run
app.listen(port, () => {
	console.log(`App is listening on port ${port}`)
})


function formatBytes(bytes, decimals = 2) {
	if (!+bytes) return 'unknown'

	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`
}