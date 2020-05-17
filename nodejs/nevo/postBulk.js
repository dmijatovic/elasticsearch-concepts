// const https = require('https')
const fetch = require('node-fetch')

module.exports=({uri,port, index}, ndjson)=>{

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-ndjson'
    },
    body: ndjson
  }

  const path = `${uri}:${port}/${index}/_bulk`

  return fetch(path,options)
}