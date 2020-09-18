import {registerBidder} from '../src/adapters/bidderFactory.js';
import {BANNER, NATIVE, VIDEO} from '../src/mediaTypes.js';

const BIDDER_CODE = 'kubient';
const END_POINT = 'https://kssp.kbntx.ch/hbjs';
const VERSION = '1.0';
export const spec = {
  code: BIDDER_CODE,
  supportedMediaTypes: [BANNER, VIDEO, NATIVE],
  isBidRequestValid: function (bid) {
    return !!(bid && bid.params);
  },
  buildRequests: function (validBidRequests, bidderRequest) {
    if (!validBidRequests || !bidderRequest) {
      return;
    }
    var result = validBidRequests.map(function (bid) {
      let data = {
        v: VERSION,
        requestId: bid.bidderRequestId,
        invId: bid.params.invid,
        adSlots: [{
          bidId: bid.bidId,
          zoneId: bid.params.zoneid || '',
          floor: bid.params.floor || 0.0,
          sizes: bid.sizes || [],
          schain: bid.schain || {},
          mediaTypes: bid.mediaTypes
        }],
        referer: (bidderRequest.refererInfo && bidderRequest.refererInfo.referer) ? bidderRequest.refererInfo.referer : null,
        tmax: bidderRequest.timeout,
        gdpr: (bidderRequest.gdprConsent && bidderRequest.gdprConsent.gdprApplies) ? 1 : 0,
        consent: (bidderRequest.gdprConsent && bidderRequest.gdprConsent.consentString) ? bidderRequest.gdprConsent.consentString : null,
        uspConsent: bidderRequest.uspConsent
      };
      return {
        method: 'POST',
        url: END_POINT,
        data: JSON.stringify(data)
      };
    });
    return result;
  },
  interpretResponse: function interpretResponse(serverResponse, request) {
    if (!serverResponse || !serverResponse.body || !serverResponse.body.seatbid) {
      return [];
    }
    let bidResponses = [];
    serverResponse.body.seatbid.forEach(seatbid => {
      let bids = seatbid.bid || [];
      bids.forEach(bid => {
        bidResponses.push({
          requestId: bid.bidId,
          cpm: bid.price,
          currency: bid.cur,
          width: bid.w,
          height: bid.h,
          creativeId: bid.creativeId,
          netRevenue: bid.netRevenue,
          ttl: bid.ttl,
          ad: bid.adm
        });
      });
    });
    return bidResponses;
  }
};
registerBidder(spec);
