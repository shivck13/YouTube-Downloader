The asynchronous method `run()` fetches the video details along with available video/audio download links and stores in the object itself.

```javascript
let ytd = new YouTubeDownloader(link)
ytd.run().then(() => console.log(ytd))
```

This `ytd` object has two main properties 
* `media` : all the available video/audio download urls along with their meta data
* `details` : details about the channel and the video

This `ytd` automatically deciphers the url signatures during `run()` if required.