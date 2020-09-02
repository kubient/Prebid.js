import {registerBidder} from '../src/adapters/bidderFactory.js';

const BIDDER_CODE = 'kubient';
const END_POINT = 'https://kssp.kbntx.ch/hbjs';
const VERSION = '1.0';
export const spec = {
  code: BIDDER_CODE,
  isBidRequestValid: function isBidRequestValid(bid) {
    return !!(bid && bid.params);
  },
  buildRequests: function buildRequests(validBidRequests, bidderRequest) {
    if (!validBidRequests || !bidderRequest) {
      return;
    }
    return validBidRequests.map(function (bidderRequest) {
      let data = {
        v: VERSION,
        requestId: bidderRequest.bidderRequestId,
        adSlots: [{
          bidId: bidderRequest.bidId,
          invId: bidderRequest.params.invid,
          zoneId: bidderRequest.params.zoneid,
          floor: bidderRequest.params.floor,
          sizes: bidderRequest.sizes || [],
          schain: bidderRequest.schain || {}
        }],
        referer: bidderRequest.refererInfo && bidderRequest.refererInfo.referer,
        tmax: bidderRequest.timeout,
        gdpr: bidderRequest.gdprConsent && bidderRequest.gdprConsent.gdprApplies ? 1 : 0,
        consent: bidderRequest.gdprConsent && bidderRequest.gdprConsent.consentString,
        uspConsent: bidderRequest.uspConsent
      };
      return {
        method: 'POST',
        url: END_POINT,
        data: JSON.stringify(data)
      };
    });
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
}
registerBidder(spec);
