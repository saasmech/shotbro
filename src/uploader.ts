import {ShotBroInput} from "./shotbro-types";

import * as https from 'https';
import * as http from 'http';
import * as fs from "fs";
import {CliLog} from "./util/log";

export async function uploadToApi(input: ShotBroInput, htmlPath: string, pngPath: string, log: CliLog) {
  try {
    await uploadToApiThrows(input, htmlPath, pngPath, log)
  } catch (e: any) {
    log.warn(`Error uploading screenshot. ${e?.message || e}`);
  }
}

export async function uploadToApiThrows(input: ShotBroInput, htmlPath: string, pngPath: string, log: CliLog) {
  if (!input.out?.appApiKey) throw new Error('Please set env var SHOTBRO_APP_API_KEY or pass in input.out.appApiKey');
  if (!input.out?.baseUrl) throw new Error('input.out.baseUrl was not set.  It should have defaulted.');

  const getUploadUrl = `${input.out.baseUrl}/api/incoming/CmdGetUploadUrlsV1`;
  log.debug(`Getting upload urls from ${getUploadUrl}`)
  const uploadUrlsRes = await postToApi(getUploadUrl, input.out?.appApiKey, JSON.stringify({}))

  log.debug(`Uploading HTML to ${uploadUrlsRes.htmlUrl}`)
  await postFileToUrl(htmlPath, uploadUrlsRes.htmlUrl);

  log.debug(`Uploading HTML to ${uploadUrlsRes.pngUrl}`)
  await postFileToUrl(pngPath, uploadUrlsRes.pngUrl);

  const addShotUrl = `${input.out.baseUrl}/api/incoming/CmdAddShotVariantVersionV1`;
  log.debug(`Posting Shot metadata to ${addShotUrl}`)
  const incomingCmdRes = await postToApi(addShotUrl, input.out?.appApiKey, JSON.stringify({}))

  log.info('Uploaded shot.')
  log.info('')
  if (incomingCmdRes.shotEmbedHtml) {
    log.info('Embed in HTML with:')
    log.info(incomingCmdRes.shotEmbedHtml)
    log.info('')
  }
  if (incomingCmdRes.markdownCode) {
    log.info('Embed in Markdown with:')
    log.info(`${incomingCmdRes.markdownCode}`)
    log.info('')
  }
}

export async function postFileToUrl(filePath: string, uploadUrl: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    let url = new URL(uploadUrl);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
    }
    const handleIncomingMessage = (res: http.IncomingMessage) => {
      //console.log('post cb', res);
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`File upload returned status of ${res.statusCode}`));
      }
      const body: Uint8Array[] = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });
      res.on('end', function () {
        resolve(Buffer.concat(body).toString());
      });
    };
    let postReq : http.ClientRequest;
    if (url.protocol === 'https') {
      postReq = https.request(opts, handleIncomingMessage);
    } else {
      postReq = http.request(opts, handleIncomingMessage);
    }
    postReq.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e);
    });
    const stream = fs.createReadStream(filePath);
    stream.on('data', function (data) {
      console.log('write data');
      postReq.write(data);
    });
    stream.on('end', function () {
      postReq.end();
    });
    stream.on('error', function (e) {
      console.log('stream error');
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
      path: url.pathname,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Content-Length': jsonStr.length,
        'ShotBro-Api-Client-Version': '1.0.0'
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
    let postReq : http.ClientRequest;
    if (url.protocol === 'https') {
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