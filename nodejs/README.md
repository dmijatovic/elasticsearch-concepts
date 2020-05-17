# CSV bulk import to Elasticsearch

This project is attempt to import CSV file into elasticsearch server using NodeJS. I tried 2 libs from npm but without success. At the end I created my own node script to import nevo data into Elasticsearch. All attempts are described below. Failedones are in failed folder.

## Elastic-import

Unfortunatelly, the execution failed with the error `Error: Number of columns on line 112 does not match header!`

The library used for this attempt was [elastic-import](https://www.npmjs.com/package/elastic-import)

```bash
# install lib
npm i -s elastic-import
# run script using npm scripts
npm run add-nevo-food
```

## Elasticsearch-csv

The second attempt was with library elasticsearch-csv. This one failed with error `Unhandled rejection Error: Content-Type header [application/x-ldjson] is not supported`

```bash
# install lib
npm i -s elasticsearch-csv
# run script using node
node import.js
```

## Custom approach

Then I decided to try on my own using node-fetch and bulk api point. Bulk API point works with custom json format called ndjson. [Official info BulkAPI](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html)

```bash
# install csv-parse
npm i -s csv-parse
# install node fetch
npm i -s node-fetch
```

### Settings

- config: configuration indicating server connection and source file props

```javascript
const config = {
  uri: "http://localhost",
  port: 9200,
  index: "food",
  csv: {
    delimiter: ",",
    file: `${__dirname}/nevo_online_2019.csv`,
  },
};
```

- mapping: data map object with keys representing column names and props name

```javascript
const mapping = {
  GroupId: { name: "GroupId", type: "int32" },
  GroupName: { name: "GroupName", type: "string" },
  Preference: { name: "Preference", type: "int32" },
  Id: { name: "Id", type: "string" },
  Product: { name: "Product", type: "string" },
  Amount: { name: "Amount", type: "int32" },
  Measure: { name: "Measure", type: "string" },
  Energie: { name: "Energie", type: "int32" },
  FatTotal: { name: "FatTotal", type: "float" },
  Protein: { name: "Protein", type: "float" },
  CarbsTotal: { name: "CarbsTotal", type: "float" },
  Sugar: { name: "Sugar", type: "float" },
  Starch: { name: "Starch", type: "float" },
  Fibre: { name: "Fibre", type: "float" },
  Water: { name: "Water", type: "float" },
  PUFA3: { name: "PUFA3", type: "float" },
  K: { name: "K", type: "float" },
  CA: { name: "CA", type: "float" },
  P: { name: "P", type: "float" },
  MG: { name: "MG", type: "float" },
  FE: { name: "FE", type: "float" },
  CU: { name: "CU", type: "float" },
  SE: { name: "SE", type: "float" },
  ZN: { name: "ZN", type: "float" },
  IOD: { name: "IOD", type: "float" },
  VITA: { name: "VITA", type: "float" },
  VITC: { name: "VITC", type: "float" },
  VITD: { name: "VITD", type: "float" },
  VITE: { name: "VITE", type: "float" },
  VITK: { name: "VITK", type: "float" },
  VITB6: { name: "VITB6", type: "float" },
  VITB12: { name: "VITB12", type: "float" },
};
```
