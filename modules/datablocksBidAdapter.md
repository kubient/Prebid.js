# Overview

```
Module Name: Datablocks Bidder Adapter
Module Type: Bidder Adapter
Maintainer: support@datablocks.net
```

# Description

Connects to Datablocks Exchange
Banner and Native


# Test Parameters
```
    var adUnits = [
      {
        code: 'banner-div',
        sizes: [[300, 250]],
        mediaTypes:{
        	banner: {
        		sizes: [300,250]
        	}
        },
        bids: [
          {
            bidder: 'datablocks',
            params: {
              source_id: 12345,
              host: 'prebid.datablocks.net'
            }
          }
        ]
      },
      {
        code: 'native-div',
        mediaTypes : {
          native: {
            title:{required:true},
            body:{required:true}
          }
        },
        bids: [
          {
            bidder: 'datablocks',
            params: {
              source_id: 12345,
              host: 'prebid.datablocks.net'
            }
          }
        ]
      }
    ];
```
