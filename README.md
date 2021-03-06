![screenshot](https://raw.githubusercontent.com/PhaedrusTheGreek/cold-zone-manager/master/ss.png)

When Expanding on the idea of Hot/Warm architecture by adding a cold zone, use this UI to open/close indices.
- Only indices matching the configured filterAttribute and filterValue are considered.
- Only `maxOpenIndices` open at once

## Installation for Kibana 5.6.0

```
bin/kibana-plugin install https://github.com/PhaedrusTheGreek/cold-zone-manager/releases/download/5.6.0/cold-zone-manager-5.6.0.zip
```

## Config Options

- `cold-zone-manager.enabled` 
- `cold-zone-manager.filterAttribute` - the allocation awareness filter attribute (default=`index.routing.allocation.require.box_type`)
- `cold-zone-manager.filterValue` - the allocation awareness filter value (default=`cold`)
- `cold-zone-manager.reloadMs` - Reload the data automatically every x milliseconds (default = disabled)
- `cold-zone-manager.maxOpenIndices` - How many cold indices open at once (default = 10) 

