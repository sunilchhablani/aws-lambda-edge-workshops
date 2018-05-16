'use strict';
const querystring = require('querystring');

const regionToBucketMapping  =  {
    'us-east-1' : FIXME    // Copy S3 bucket name in us-east-1, for example, 'ws-lambda-at-edge-6ecdc5f0-us-east-1'
};

const countryToRegionMapping  =  {
    'US': 'us-east-1',
    'CA': 'us-east-1'     
};

exports.handler = (event, context, callback) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    const request = event.Records[0].cf.request;

    const params = querystring.parse(request.querystring);
    let countryCode, region;

    if (request.headers['cloudfront-viewer-country']) {
        countryCode = request.headers['cloudfront-viewer-country'][0].value;
        region = countryToRegionMapping[countryCode];
    } else {
        console.log('Viewer country information is not available.');
    }

    /* Update origin if viewer is from US or CA */
    if (region) {
        const bucketName = regionToBucketMapping[region];
        const domainName = `${bucketName}.${region}.s3.amazonaws.com`;

        /* Set s3 origin fields */
        request.origin = {
            s3: {
                authMethod: 'none',
                customHeaders: {},
                domainName: domainName,
                path: '',
                region: region
            }
        };
        request.headers['host'] = [{ key: 'host', value: domainName }];
    }

    callback(null, request);
};