import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import { handler } from './handlers/health-ping';

function main() {
  const event: APIGatewayProxyEventV2 = {
    version: '2.0',
    routeKey: 'GET /health',
    rawPath: '/health',
    rawQueryString: '',
    headers: {},
    requestContext: {
      accountId: 'local',
      apiId: 'local',
      domainName: 'localhost',
      domainPrefix: 'local',
      http: {
        method: 'GET',
        path: '/health',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'local-runner',
      },
      routeKey: 'GET /health',
      requestId: 'local-request',
      stage: 'local',
      time: new Date().toISOString(),
      timeEpoch: Date.now(),
    },
    isBase64Encoded: false,
  };

  const response = handler(event);

  console.log(response);
}

try {
  main();
} catch (error: unknown) {
  console.error(error);
  process.exitCode = 1;
}
