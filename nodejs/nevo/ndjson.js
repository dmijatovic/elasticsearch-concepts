
function formatValue(type, value){
  switch(type.toLowerCase()){
    case "int":
    case "int32":
    case "integer":
      return parseInt(value)
    case "float":
    case "decimal":
    case "number":
      return parseFloat(value)
    case "date":
    case "datetime":
      return new Date(value)
    case "bool":
    case "boolean":
      return value.toLowerCase === "true"
    default:
      return value
  }
}

function headerToMapping(header, mapping){
  const h=[], skipped=[]
  header.forEach((col,pos)=>{
    if (mapping.hasOwnProperty(col)){
      h.push({
        ...mapping[col],
        name: col,
        pos
      })
      // remove from mapping object
      // props left in object are used
      // to issue warning
      delete mapping[col]
    }else{
      skipped.push(col)
    }
  })
  const missing = Object.keys(mapping)
  if (missing.length > 0){
    console.error("Missing in data...", missing.toString())
  }
  if (skipped.length > 0){
    console.warn("Excluded columns...", skipped.toString())
  }
  return h
}

function arrayToObject(header,rec){
  if (header.length===0){
    return undefined
  }
  const record={}
  header.forEach(col=>{
    if (rec[col.pos]===""){
      record[col.name]=undefined
    }else{
      record[col.name]=formatValue(col.type,rec[col.pos])
    }
  })
  return record
}

module.exports=(csvData=[], mapping)=>{
  if (csvData.length===0) return null

  let ndjsonStr=""
  let skipped=[]
  let header=[]
  let processed = 0
  let total = 0

  csvData.forEach((rec,pos)=>{
    if (pos===0){
      header = headerToMapping(rec,mapping)
    }else{
      total +=1
      const recJson = arrayToObject(header,rec)
      if (recJson){
        processed +=1
        ndjsonStr += `{"index":{"_id":${pos}}}\n${JSON.stringify(recJson)}\n`
      }else{
        skipped.push({
          line: pos,
          record: rec
        })
      }
    }
  })
  return {
    stats:{
      total,
      processed,
      failed: skipped.length
    },
    ndjson: ndjsonStr,
    skipped
  }
}