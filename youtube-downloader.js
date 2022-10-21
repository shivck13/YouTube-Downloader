class YouTubeDownloader {
  baseUrl = "https://www.youtube.com" 
  dataPattern = /ytInitialPlayerResponse\s*=\s*(.*)\s*;<\/script/
  scriptUrlPattern = /\/s\/player\/\w+\/[\w\.\-_]+[\/\w]*\/base\.js/g
  functionPattern = /function\((\w+)\){\1=\1.split\(""\);((\w+)\.\w+\(\1,\d+\);)+return\s+\1\.join\(""\)};/g
  objectPattern = 'var\\s+OBJECT_NAME={(\\w+:function.*\\n)+.*}};'

  constructor(url) {
    this.url = url
  } 

  async getPageSource() { 
    // fetch YT video page source
    let html = await fetch(this.url).then(res => res.text())
    
    // extract media & details data
    this.data = JSON.parse(html.match(this.dataPattern)[1])
    this.media = this.data.streamingData.formats.concat(this.data.streamingData.adaptiveFormats)
    this.details = this.data.videoDetails
   
    // URL of the script file which has decipher function
    this.scriptUrl = this.baseUrl + html.match(this.scriptUrlPattern)[0] 
  } 

  async getDecipherFunction() { 
    // get script source code
    let script = await fetch(this.scriptUrl).then(res => res.text())

    // find decipher function & linked object
    let matches = Array.from(script.matchAll(this.functionPattern))[0]
    let decipherFunctionCode = matches[0]  
    this.objectPattern = new RegExp(this.objectPattern.replace('OBJECT_NAME', matches[3]), 'g')
    let decipherObjectCode = script.match(this.objectPattern)[0] 

    // evaluate the code
    eval(decipherObjectCode + "\nthis.decipherFunction = " + decipherFunctionCode) 
  }

  decipherSignature() { 
    this.media.forEach(f => {
      let query = new URLSearchParams(f.signatureCipher) 
      f.signatureCipher = "Deciphered"
      f.url = `${query.get('url')}&${query.get('sp')}=${this.decipherFunction(query.get('s'))}`
    })
  }

  async run() { 
    await this.getPageSource()

    // decipher signature if needed
    if(this.media[0].signatureCipher) {
      await this.getDecipherFunction()
      this.decipherSignature()
    }
  } 
} 

module.exports = YouTubeDownloader