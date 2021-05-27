import {registerBidder} from '../src/adapters/bidderFactory.js';
import {BANNER, VIDEO} from '../src/mediaTypes.js';
import * as utils from '../src/utils.js';

const BIDDER_CODE = 'kubient';
const END_POINT = 'https://kssp.kbntx.ch/pbjs';
const VERSION = '1.0';
const VENDOR_ID = 794;
export const spec = {
  code: BIDDER_CODE,
  gvlid: VENDOR_ID,
  supportedMediaTypes: [ BANNER, VIDEO ],
  isBidRequestValid: function (bid) {
    return !!(bid && bid.params);
  },
  buildRequests: function (validBidRequests, bidderRequest) {
    if (!validBidRequests || !bidderRequest) {
      return;
    }
    const result = validBidRequests.map(function (bid) {
      var adSlot = {
        bidId: bid.bidId,
        zoneId: bid.params.zoneid || '',
        floor: bid.params.floor || 0.0
      }

      if (bid.mediaTypes.banner) {
        adSlot.banner = bid.mediaTypes.banner
      }

      if (bid.mediaTypes.video) {
        adSlot.video = bid.mediaTypes.video
      }

      if (bid.schain) {
        adSlot.schain = bid.schain;
      }

      var data = {
        v: VERSION,
        requestId: bid.bidderRequestId,
        adSlots: [adSlot],
        tmax: bidderRequest.timeout,
        gdpr: (bidderRequest.gdprConsent && bidderRequest.gdprConsent.gdprApplies) ? 1 : 0,
        consentGiven: kubientGetConsentGiven(bidderRequest.gdprConsent),
        uspConsent: bidderRequest.uspConsent
      }

      if (bidderRequest.refererInfo && bidderRequest.refererInfo.referer) {
        data.referer = bidderRequest.refererInfo.referer
      }

      if (bidderRequest.gdprConsent && bidderRequest.gdprConsent.consentString) {
        data.consent = bidderRequest.gdprConsent.consentString
      }

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
  },
  getUserSyncs: function (syncOptions, serverResponses, gdprConsent, uspConsent) {
    const syncs = [];
    let gdprParams = '';
    if (gdprConsent && typeof gdprConsent.consentString === 'string') {
      gdprParams = `?consent_str=${gdprConsent.consentString}`;
      if (typeof gdprConsent.gdprApplies === 'boolean') {
        gdprParams = gdprParams + `&gdpr=${Number(gdprConsent.gdprApplies)}`;
      }
      gdprParams = gdprParams + `&consent_given=` + kubientGetConsentGiven(gdprConsent);
    }
    if (syncOptions.iframeEnabled) {
      syncs.push({
        type: 'iframe',
        url: 'https://kdmp.kbntx.ch/init.html' + gdprParams
      });
    }
    if (syncOptions.pixelEnabled) {
      syncs.push({
        type: 'image',
        url: 'https://kdmp.kbntx.ch/init.png' + gdprParams
      });
    }
    return syncs;
  }
};

function kubientGetConsentGiven(gdprConsent) {
  let consentGiven = 0;
  if (typeof gdprConsent !== 'undefined') {
    let apiVersion = utils.deepAccess(gdprConsent, `apiVersion`);
    switch (apiVersion) {
      case 1:
        consentGiven = utils.deepAccess(gdprConsent, `vendorData.vendorConsents.${VENDOR_ID}`) ? 1 : 0;
        break;
      case 2:
        consentGiven = utils.deepAccess(gdprConsent, `vendorData.vendor.consents.${VENDOR_ID}`) ? 1 : 0;
        break;
    }
  }
  return consentGiven;
}
registerBidder(spec);
