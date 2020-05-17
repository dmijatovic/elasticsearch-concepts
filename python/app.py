
import csv
import requests

from ndJson import rowToJson,rowJsonToND

file = "/home/dusan/iis/demo/elastic/concepts/data/nevo_online_2019.csv"
url = "http://localhost:9200/food/_bulk"

ndJsonStr=""

with open(file, newline='') as csvfile:
  table = csv.DictReader(csvfile)
  for pos, row in enumerate(table,start=1):
    json = rowToJson(row)
    ndJsonStr+=rowJsonToND(json,pos)


headers={'Content-Type':'application/x-ndjson'}
r = requests.post(url,data=ndJsonStr,headers=headers)
resp = r.json()
print(resp)
