const express = require('express')
const path = require("path") 

const utils = require("./utils")
const YouTubeDownloader = require("./youtube-downloader")

// 👉 initialisation
const app = express()
const port = process.env.PORT || 3000

// 👉 settings
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// 👉 middlewares
app.use(express.static(path.join(__dirname, "static")))

// 👉 routes
app.get("/", async (req, res) => {
	let link = req.query.yt 
	let data = {}

	if (link == undefined || link == null || link.length == 0) { 
		data = {info: "empty"}
	} else { 
    // treat shorts links as normal (otherwise fails) 
    // better way: extract video id
    link = link.replace("shorts/", "watch?v=")
    
		if (utils.isValidYTLink(link)) {
			try {
				let ytd = new YouTubeDownloader(link)
				await ytd.run()
				data = utils.extractData(ytd)
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