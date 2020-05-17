const fs = require('fs')

const csvParse = require('csv-parse')
const ndJson = require('./nevo/ndjson')
const postBulk = require('./nevo/postBulk')

const config= require("./nevo/config")
const mapping = require("./nevo/mapping")

// read file
const raw = fs.readFileSync(config.csv.file)

// callback approach
csvParse(raw,{
  delimiter: config.csv.delimiter
},(err,data,nfo)=>{
  if (err) throw Error("Parsing csv failed")
  // console.log("rec...", rec)
  // console.log("nfo...", nfo)
  if (nfo.invalid_field_length!==0){
    console.warn("Invalid field length...", nfo.invalid_field_length)
  }
  // convert to ndJson
  const resp = ndJson(data,mapping)
  // save file
  // fs.writeFileSync("./nevo_online_2019.ndjson", resp.ndjson)
  // console.log("Done...",resp.stats.processed,resp.stats.failed)
  postBulk(config,resp.ndjson)
    .then(resp=>resp.json())
    .then(resp=>{
      const {status, error} = resp
      if (status && status!==200){
        throw new Error(error.reason)
      }
      if (error){
        fs.writeFileSync("./nevo_online_2019.errors.json", JSON.stringify(resp.items))
        throw new Error("Done with errors, zie nevo_online_2019.errors.json")
      }
      console.log(`Done...in ${resp.took}ms...${resp.items.length} records`)
    })
    .catch(e=>{
      console.error("Failed...", e)
    })
})

