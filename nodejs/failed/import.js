const ElasticsearchCSV = require('elasticsearch-csv');

// create an instance of the importer with options
const esCSV = new ElasticsearchCSV({
    es: { index: 'food', type: 'index', host: 'localhost:9200' },
    csv: { filePath: './nevo_online_2019.csv', headers: true }
});

esCSV.import()
    .then(function (response) {
        // Elasticsearch response for the bulk insert
        console.log(response);
    }, function (err) {
        // throw error
        throw err;
    });