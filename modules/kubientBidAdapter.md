# Overview
​
**Module Name**: Kubient Bidder Adapter
**Module Type**: Bidder Adapter
**Maintainer**:  on@fidelity-media.com
​
# Description
​
Connects to Fidelity Media fmxSSP demand source to fetch bids.  
​
# Test Parameters
```
    var adUnits = [{
      code: 'banner-ad-div',
      mediaTypes: {
        banner: {
          sizes: [[300, 250],[640, 480]],
        }
      },
      bids: [{
        bidder: 'kubient',
        params: {
          invid: '1234',
          zoneid: '5678',
          floor: 0.005
        }
      }]
    }];
