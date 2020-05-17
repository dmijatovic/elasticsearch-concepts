const { createReadStream } = require('fs')
// const split = require('split2')
const { Client } = require('@elastic/elasticsearch')

const client = new Client({ node: 'http://localhost:9200' })

// const result = await client.helpers.bulk({
//   datasource: createReadStream('./dataset.ndjson').pipe(split()),
//   onDocument (doc) {
//     return {
//       index: { _index: 'products' }
//     }
//   }
// })

console.log(client)
// client.helpers.bulk()