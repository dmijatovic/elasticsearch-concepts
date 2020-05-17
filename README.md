# Elastic

This project is demo of elastic database using docker-compose containers.

Docker compose file is taken from the [official elastic guide](https://www.elastic.co/guide/en/elasticsearch/reference/7.7/docker.html)

This sample Docker Compose file brings up a three-node Elasticsearch cluster. Node es01 listens on localhost:9200 and es02 and es03 talk to es01 over a Docker network.

## Runing single instance in Docker container

To start a single-node Elasticsearch cluster for development or testing, specify single-node discovery to bypass the bootstrap checks:

```bash
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.7.0
```

Confirm that server is running on http://localhost:9200/_cat/nodes?v&pretty

```bash
# curl can be used too
curl -X GET "localhost:9200/_cat/nodes?v&pretty"
```

Check docker logs

```bash
docker logs <containerId>
```

## Fixes on PC2016 machine

The cluster failes because the max-heap-size is too low. This value need to be increased for running elastic cluster of 3 nodes.

I created simpler docker compose file with only 1 server and without checks. This OK for development.

The vm.max_map_count setting should be set permanently in /etc/sysctl.conf:

```bash
grep vm.max_map_count /etc/sysctl.conf
vm.max_map_count=262144
```

To apply the setting on a live system, run:

```bash
sysctl -w vm.max_map_count=262144
```

## Elastic REST API

Elasticsearch server exposes API points for communication. The request are returned as JSON data. The [REST Api documentation is here](https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html).

- http://localhost:9200/_cluster/health

### Create & delete indexes

The indexes in ELS can be considered as databases (collection of documents)

```curl
PUT /products

DELETE /pages

```

### CRUD with documents (records)

ELK is document based database. The database is called index. The record is called document. Here some basic CRUD examples

- `create document`: this sample creates new document (record) in persons index (database/table)

```javascript
const url = "localhost:9200/persons/_doc";
const data = {
  name: "Dusan Mijatovic",
  email: "d.mijatovic@dv4all",
  address: {
    street: "Clauskindereweg 145",
    postcode: "1069HN",
    city: "Amsterdam",
  },
};
fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  body: JSON.stringfy(data),
});

/* response
{
    "_index": "persons",
    "_type": "_doc",
    "_id": "pUlxF3IBxYjMP1lznaQB",
    "_version": 1,
    "result": "created",
    "_shards": {
        "total": 2,
        "successful": 1,
        "failed": 0
    },
    "_seq_no": 2,
    "_primary_term": 2
}
*/
```

- `retreive document`: this example gets document by id. Note that document data is in prop "\_source".

```javascript
const url = "localhost:9200/persons/_doc/J94cFXIBuVUippQL-gMS";

fetch(url, {
  method: "GET",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

/*response
{
    "_index": "persons",
    "_type": "_doc",
    "_id": "J94cFXIBuVUippQL-gMS",
    "_version": 2,
    "_seq_no": 1,
    "_primary_term": 2,
    "found": true,
    "_source": {
        "name": "Dusan Mijatovic",
        "email": "d.mijatovic@dv4all",
        "address": {
            "street": "Clauskindereweg 145",
            "postcode": "1069HN",
            "city": "Beograd"
        }
    }
}
*/
```

- `update document`: this example updates city prop of document with id J94cFXIBuVUippQL-gMS. Note that url has \_update/{id} srtucture. Also you can add new properties using this update API point. The logic is: if property exists it will be updated and if not exists it will be created. In addition you can run update scripts

```javascript
const url = "localhost:9200/persons/_update/J94cFXIBuVUippQL-gMS";
const data = {
  address: {
    city: "Beograd",
  },
};
fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  body: JSON.stringfy(data),
});

/* returns
{
    "_index": "persons",
    "_type": "_doc",
    "_id": "J94cFXIBuVUippQL-gMS",
    "_version": 2,
    "result": "updated",
    "_shards": {
        "total": 2,
        "successful": 1,
        "failed": 0
    },
    "_seq_no": 1,
    "_primary_term": 2
}
*/
```

- `scripted updates`: You can update document by providing scripts/logics/functions. In the example below we increase prop saldo by 1 for person with id J94cFXIBuVUippQL-gMS. In addition there is possibility of `upsert`. Upsert means to update document if it exists and if not create new document.

```javascript
const url = "localhost:9200/persons/_update/J94cFXIBuVUippQL-gMS";
// increase saldo by 1
const data = {
  script: {
    source: "ctx._source.saldo++",
  },
};
fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  body: JSON.stringfy(data),
});

// OTHER EXAMPLES
const data = {
  script: {
    // assign saldo value to be 10
    source: "ctx._source.saldo = 10",
  },
};

const data = {
  script: {
    // reduce saldo by params value
    source: "ctx._source.saldo -= params.quantity",
    params: {
      quantity: 4,
    },
  },
};
```

- `delete document`: example below deleted document with id J94cFXIBuVUippQL-gMS

```javascript
const url = "localhost:9200/persons/_doc/J94cFXIBuVUippQL-gMS";
fetch(url, {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

/* returns
{
    "_index": "persons",
    "_type": "_doc",
    "_id": "pUlxF3IBxYjMP1lznaQB",
    "_version": 2,
    "result": "deleted",
    "_shards": {
        "total": 2,
        "successful": 1,
        "failed": 0
    },
    "_seq_no": 12,
    "_primary_term": 2
}
*/
```

## Sharding and routing

ELK indexes documents using a formula: routing % num_of_shards. Therefore it is not possible to change number of shards in the created index (database).

## Document versioning

Versioning is very basic. There is only last version of document is avaliable, however every update of a document will increase document version by 1 (\_version). When you delete document the version value is retained for 60 sec. This versioning is called internal versioning. Use of \_version prop is limited.

## Optimistic concurency control

This approach is used to prevent that old document overwrites newone. This is possible scenario because ELK is distributed server. To avoid this problem due to concurrency we provide additional information during update query, props `_primary_term` and `_seq_no`.

## Batch processing API

The actions are specified in the request body using a newline delimited JSON (NDJSON) structure. More information in [official docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html)

Curl example of bulk update

```bash
curl -X POST "localhost:9200/_bulk?pretty" -H 'Content-Type: application/json' -d'
{ "index" : { "_index" : "test", "_id" : "1" } }
{ "field1" : "value1" }
{ "delete" : { "_index" : "test", "_id" : "2" } }
{ "create" : { "_index" : "test", "_id" : "3" } }
{ "field1" : "value3" }
{ "update" : {"_id" : "1", "_index" : "test"} }
{ "doc" : {"field2" : "value2"} }
'
```

For python there is [bulk helper lib](https://elasticsearch-py.readthedocs.io/en/master/helpers.html)

Bulk insert from json file using CURL. We are using data file insert, this is indicated by --data-binary flag and @ sign before the file name.

```bash
curl -H "Content-Type: application/x-ndjson" -XPOST "http://localhost:9200/products/_bulk?pretty"  --data-binary "@products.json"

```

## Analyze API

There are 3 components in analyze API. This API prepares text in documents for searching (it indexing data for searching)

- character filters: by default punctuation is removed(.?!/- etc)
- tokenizer: the text is broken into words (tokens)
- token filters: by default text is lowercased

[Official documentation is here](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-overview.html).

```javascript
const url = "localhost:9200/_analyze";
// tokenize the text, passing specific options but replicating default
const data = {
  text: "This is my JOKE text, about some interess..ting stuff?!? :-)",
  char_filter: [],
  tokenizer: "standard",
  filter: ["lowercase"],
};

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  body: JSON.stringfy(data),
});
```

### Inverted indices

Inverted index is for each text field, other data use BKD trees.

## Search query types

### Request URI

You can also use query string params in the url like this `/products/_search?name:pasta`.

### Query DSL

The queries can be split into leaf and compound queries

- leaf query: category = 'fruit'
- compound query: category = 'fruit' OR category = 'vegetable'

There are multiple types of queries:

- `match_all`: returns all records

```javascript
{
  "query":{
	  "match_all":{}
	}
}
```

- `match`

```javascript
{
  "query":{
	  "match":{
      //match documents where
		  "description":"red wine"
		}
	}
}
```

#### Term level queries

This queries are used for `exact matches of an property`. There are usefull for date, values and strings that match completely searched value (like username)

```javascript
//short notation
{
  "query":{
    "term":{
      //short notation
      "is_active": true
    }
  }
}
//long notation enables more prop
{
  "query":{
    "term":{
      //short notation
      "is_active": {
        "value":true
      }
    }
  }
}
```

Searching for multiple keywoards

```javascript
{
	"query":{
		"terms":{
			"tags.keyword":[
				"Soup",
				"Chicken"
			]
		}
	}
}
```

Searching for multiple value (SQL IN keywoard)

```javascript
{
  "query":{
    "id":{
      "values":[1,2,3,4]
    }
  }
}
```

Search for range

```javascript
{
	"query":{
		"range":{
			"in_stock":{
				"gte":1,
				"lte":5
			}
		}
	}
}
// works with the dates
{
	"query":{
		"range":{
			"createdAt":{
				"gte":"2010/01/01",
				"lte":"2010/12/31",
        //optinally provide format
        "format":"yyyy/mm/dd"
			}
		}
	}
}
```

Date calculations and dynamic ranges. You can also round the date values for better mathing. [More info here](https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html#date-math).

Note that rounding differs if you use `gt` (greater than) or `gte` (greater or equals)

```javascript
{
	"query":{
		"range":{
			"createdAt":{
        // subtract 1 year and 1 day from date
				"gte":"2010/01/01||-1y-1d"
			}
		}
	}
}

```

Maching non-null values. Below example queries all documents with tags fields.

```javascript
{
	"query":{
		"exists":{
			"field":"tags"
		}
	}
}
```

Maching prefixes. The tags that starts with Vege.... It is case sensitive.

```javascript
{
	"query":{
		"prefix":{
			"tags.keyword":"Vege"
		}
	}
}
```

Maching wildcard. This are slower. Placing wildcard at the starting position can produce very slow queries.

```javascript
{
	"query":{
		"wildcard":{
      // match any number of chars
			"tags.keyword":"Veg*ble"
		}
	}
}

	"query":{
		"wildcard":{
      // match single wildcard char
			"tags.keyword":"Veg?ble"
		}
	}
}
```

Regular expressions. Not all regexp are avaliable. See official docs for more info

```javascript
{
  "query": {
    "regexp": {
      // match name using numbers
      "name": "[0-9]+"
    }
  }
}
```

#### Full text search queries

This types looking for words in the query, one by one. Default condition is OR but we can change it to AND

```javascript
{
	"query":{
		"match":{
			"title":{
        //find recepie with pasta AND spaghetti in the title
				"query":"pasta spaghetti",
				"operator":"and"
			}
		}
	}
}
```

Match phrases. In this case order of terms matters.

```javascript
{
	"query":{
		"match_phrase":{
			"title":"spaghetti puttanesca"
		}
	}
}
```

Searching multiple fields

```javascript
{
	"query":{
		"multi_match":{
			"query":"pasta",
			"fields":["title","description"]
		}
	}
}
```
