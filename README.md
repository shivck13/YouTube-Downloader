The asynchronous method `run()` fetches the video details along with the available video/audio download links and stores in the object itself.

```javascript
let ytd = new YouTubeDownloader(link)
ytd.run().then(() => console.log(ytd))
```

The `YouTubeDownloader` object `ytd` has two main properties 
* `media` : all the available video/audio download urls along with their meta data (like size, quality etc)
* `details` : details about the channel and the video (like description, views, likes, channel name etc)

The object `ytd` automatically deciphers the url signatures during `run()` if required.