def rowToJson(row):
  strJson="{"
  for col in row.items():
    # for col,val in tup:
    strJson+=f'"{col[0]}":"{col[1]}",'
    # print(col)

  # remove last comma or { if no records
  strJson=strJson[:-1]
  if len(strJson) > 2:
    strJson+="}"

  return strJson

def rowJsonToND(json, id):
  ndjson = '{"index":{"_id":' + str(id) + '}'+'}\n'
  ndjson += json + '\n'
  return ndjson