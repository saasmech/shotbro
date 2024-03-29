import {
  ShotBroCaptureConfig,
  ShotBroOutput,
  ShotBroSystemInfo,
  ShotBroReporterConfig
} from "./shotbro-types";

import * as https from 'https';
import * as http from 'http';
import * as fs from "fs";
import {CliLog} from "./util/log";

export async function uploadToApi(
  reporterConfig: ShotBroReporterConfig, captureConfig: ShotBroCaptureConfig, elPosJsonPath: string, pngPath: string,
  systemInfo: ShotBroSystemInfo, log: CliLog): Promise<ShotBroOutput> {
  const clientUserAgent = `shotbro-client-uploader-v1.0.0`;  // todo use package number
  const userAgent = `ShotBro-Client/1.0.0 NodeJS/${process.version}`;  // todo use package number
  if (!reporterConfig?.appApiKey) throw new Error('Please set env var SHOTBRO_APP_API_KEY or pass in appApiKey');
  if (!reporterConfig?.baseUrl) throw new Error('baseUrl was not set.  It should have defaulted.');

  if (reporterConfig.baseUrl === 'https://noop.shotbro.io') {
    return { // self test mode, pretend we uploaded ok
      shotAdded: true,
      shotUrl: 'https://noop.shotbro.io/ok'
    }
  }
  const output: ShotBroOutput = {
    shotAdded: false
  }
  const createIncomingShotUrl = `${reporterConfig.baseUrl}/api2/client/cmd_create_incoming_shot_v1`;
  log.debug(`Getting upload urls from ${createIncomingShotUrl}`)
  const createIncomingShotRes = await postToApi(createIncomingShotUrl, reporterConfig?.appApiKey, JSON.stringify({
    clientUserAgent, captureConfig: captureConfig, systemInfo: systemInfo
  }), userAgent)

  if (createIncomingShotRes.output.error) {
    output.error = createIncomingShotRes.output.error;
    log.debug(`Got error ${output.error}`);

  } else if (createIncomingShotRes?.output?.jsonUploadUrl && createIncomingShotRes?.output?.pngUploadUrl
    && createIncomingShotRes?.output?.incomingShotRn) {

    log.debug(`Uploading JSON to ${createIncomingShotRes.output.jsonUploadUrl}`)
    await postFileToUrl(elPosJsonPath, createIncomingShotRes.output.jsonUploadUrl, userAgent);

    log.debug(`Uploading PNG to ${createIncomingShotRes.output.pngUploadUrl}`)
    await postFileToUrl(pngPath, createIncomingShotRes.output.pngUploadUrl, userAgent);

    const startIncomingShotUrl = `${reporterConfig.baseUrl}/api2/client/cmd_start_incoming_shot_v1`;
    log.debug(`Posting to ${startIncomingShotUrl}`)
    const startIncomingShotRes = await postToApi(startIncomingShotUrl, reporterConfig.appApiKey, JSON.stringify({
      incomingShotRn: createIncomingShotRes.output.incomingShotRn,
    }), userAgent)

    if (startIncomingShotRes?.output?.shotUrl) {
      log.debug('Started processing for shot', createIncomingShotRes.output.incomingShotRn);
      // if (startIncomingShotRes?.output?.embedHtml) {
      //   log.info('Embed in HTML with:')
      //   log.info(startIncomingShotRes.output.embedHtml)
      //   log.info('')
      // }
      // if (startIncomingShotRes?.output?.embedMarkdown) {
      //   log.info('Embed in Markdown with:')
      //   log.info(`${startIncomingShotRes.output.embedMarkdown}`)
      //   log.info('')
      // }
      output.shotUrl = startIncomingShotRes.output.shotUrl
      output.shotAdded = true
    } else {
      output.error = "Got invalid output from cmd_start_incoming_shot_v1";
      log.debug(`Got invalid output ${JSON.stringify(startIncomingShotRes)}`);
    }
  } else {
      output.error = "Got invalid output from cmd_create_incoming_shot_v1";
      log.debug(`Got invalid output ${JSON.stringify(createIncomingShotRes)}`);
    }
  return output
}

export async function postFileToUrl(filePath: string, uploadUrl: string, userAgent: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    let url = new URL(uploadUrl);
    const opts: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + (url.search || ''),
      method: 'PUT',
      headers: {
        'Content-length': fs.statSync(filePath).size,
        'User-Agent': userAgent,
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

export async function postToApi(apiUrl: string, authToken: string, jsonStr: string, userAgent: string): Promise<any> {
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
        'User-Agent': userAgent,
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
      reject(new Error(`Error when POST to ${apiUrl}: ${e}`));
    });
    postReq.write(jsonStr, 'utf-8');
    postReq.end();
  });
}