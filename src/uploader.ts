import {ShotBroInput, ShotBroMetadata} from "./shotbro-types";

import * as https from 'https';
import * as http from 'http';
import * as fs from "fs";
import {CliLog} from "./util/log";

export async function uploadToApi(input: ShotBroInput, htmlPath: string, pngPath: string,
                                        systemInfo: ShotBroMetadata, log: CliLog): Promise<string> {
  if (!input.out?.appApiKey) throw new Error('Please set env var SHOTBRO_APP_API_KEY or pass in input.out.appApiKey');
  if (!input.out?.baseUrl) throw new Error('input.out.baseUrl was not set.  It should have defaulted.');

  const createIncomingShotUrl = `${input.out.baseUrl}/api/incoming/create-incoming-shot-v1`;
  log.debug(`Getting upload urls from ${createIncomingShotUrl}`)
  const createIncomingShotRes = await postToApi(createIncomingShotUrl, input.out?.appApiKey, JSON.stringify({
    shotDetails: input, systemInfo
  }))

  log.debug(`Uploading HTML to ${createIncomingShotRes.result.htmlUploadUrl}`)
  await postFileToUrl(htmlPath, createIncomingShotRes.result.htmlUploadUrl);

  log.debug(`Uploading PNG to ${createIncomingShotRes.result.pngUploadUrl}`)
  await postFileToUrl(pngPath, createIncomingShotRes.result.pngUploadUrl);

  const startIncomingShotUrl = `${input.out.baseUrl}/api/incoming/start-incoming-shot-v1`;
  log.debug(`Posting Shot metadata to ${startIncomingShotUrl}`)
  const startIncomingShotRes = await postToApi(startIncomingShotUrl, input.out?.appApiKey, JSON.stringify({
    incomingShotRn: createIncomingShotRes.result.incomingShotRn,
  }))

  log.info('Uploaded shot.')
  log.info('')
  if (startIncomingShotRes?.result?.embedHtml) {
    log.info('Embed in HTML with:')
    log.info(startIncomingShotRes.result.embedHtml)
    log.info('')
  }
  if (startIncomingShotRes?.result?.embedMarkdown) {
    log.info('Embed in Markdown with:')
    log.info(`${startIncomingShotRes.result.embedMarkdown}`)
    log.info('')
  }
  return startIncomingShotRes.result.shotUrl
}

export async function postFileToUrl(filePath: string, uploadUrl: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    let url = new URL(uploadUrl);
    const opts: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + (url.search || ''),
      method: 'PUT',
      headers: {
        'Content-length': fs.statSync(filePath).size,
        'User-Agent': `ShotBro-Client/1.0.0 NodeJS/${process.version}`,
      },
    }
    const handleIncomingMessage = (res: http.IncomingMessage) => {
      const body: Uint8Array[] = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });
      res.on('end', function () {
        const resp = Buffer.concat(body).toString()
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`File upload returned status of ${res.statusCode} ${resp}`));
        }
        resolve(resp);
      });
    };
    let postReq: http.ClientRequest;
    if (url.protocol === 'https:') {
      postReq = https.request(opts, handleIncomingMessage);
    } else {
      postReq = http.request(opts, handleIncomingMessage);
    }
    postReq.on('error', (e) => {
      reject(e);
    });
    const stream = fs.createReadStream(filePath);
    stream.on('data', function (data) {
      postReq.write(data);
    });
    stream.on('end', function () {
      postReq.end();
    });
    stream.on('error', function (e) {
      reject(e);
    });
  });
}

export async function postToApi(apiUrl: string, authToken: string, jsonStr: string): Promise<any> {
  return new Promise(function (resolve, reject) {
    let url = new URL(apiUrl);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + (url.search || ''),
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Content-Length': jsonStr.length,
        'User-Agent': `ShotBro-Client/1.0.0 NodeJS/${process.version}`,
      }
    }
    const handleIncomingMessage = (res: http.IncomingMessage) => {
      const body: Uint8Array[] = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });
      res.on('end', function () {
        let rawResponse, jsonResponse;
        try {
          rawResponse = Buffer.concat(body).toString()
          jsonResponse = JSON.parse(rawResponse);
        } catch (e) {
          // handled below
        }
        // reject on bad status
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          const message = jsonResponse?.error?.messages?.join(',');
          const responseBodyDebug = message || rawResponse || '<no response body>';
          reject(new Error(`API returned status of ${res.statusCode}. ${responseBodyDebug}`));
        } else if (!jsonResponse) {
          reject(`Could not parse response from ${apiUrl}`);
        } else {
          resolve(jsonResponse);
        }
      });
    };
    let postReq: http.ClientRequest;
    if (url.protocol === 'https:') {
      postReq = https.request(opts, handleIncomingMessage);
    } else {
      postReq = http.request(opts, handleIncomingMessage);
    }
    postReq.on('error', (e) => {
      reject(new Error(`Error when POST to ${apiUrl}: ${e.message}`));
    });
    postReq.write(jsonStr, 'utf-8');
    postReq.end();
  });
}