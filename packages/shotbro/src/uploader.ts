import {ShotBroInput} from "./shotbro-types";

import * as https from 'https';
import * as fs from "fs";

export async function uploadToApi(input: ShotBroInput, htmlPath: string, pngPath: string) {
  try {
    await uploadToApiThrows(input, htmlPath, pngPath)
  } catch (e){
    console.warn(`ShotBro!: Error uploading screenshot. ${e.message}`);
  }
}

export async function uploadToApiThrows(input: ShotBroInput, htmlPath: string, pngPath: string) {
  const authToken = process.env.SHOTBRO_TOKEN;
  if (!authToken) throw new Error('Could not find env var SHOTBRO_TOKEN')
  const uploadUrlsRes = await postToApi('https://shotbro.io/api/incoming/CmdUploadUrlV1', authToken, JSON.stringify({}))
  await postFileToUrl(htmlPath, uploadUrlsRes.htmlUrl);
  await postFileToUrl(pngPath, uploadUrlsRes.pngUrl);
  const incomingCmdRes = await postToApi('https://shotbro.io/api/incoming/IcomingCmdV1', authToken, JSON.stringify({}))
  // shotVariantVersionRn: string,
  //     shotEmbedHtml: string,
  //     markdownCode: string,
  console.log('Uploaded shot.')
  console.log('')
  if (incomingCmdRes.shotEmbedHtml) {
    console.log('Embed in HTML with:')
    console.log(incomingCmdRes.shotEmbedHtml)
    console.log('')
  }
  if (incomingCmdRes.markdownCode) {
    console.log('Embed in MarkDown with:')
    console.log(`${incomingCmdRes.markdownCode}`)
    console.log('')
  }
}

export async function postFileToUrl(filePath: string, uploadUrl: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    let url = new URL(uploadUrl);
    const postReq = https.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
    }, (res) => {
      //console.log('post cb', res);
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`File upload returned status of ${res.statusCode}`));
      }
      const body = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });
      res.on('end', function () {
        resolve(Buffer.concat(body).toString());
      });
    });
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
    const postReq = https.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      //console.log('post cb', res);
      // reject on bad status
      if (res.statusCode < 200 || res.statusCode >= 300) {
        // todo: reject with json response
        return reject(new Error(`API returned status of ${res.statusCode}`));
      }
      const body = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });
      res.on('end', function () {
        let json;
        try {
          json = JSON.parse(Buffer.concat(body).toString());
        } catch (e) {
          reject(`Could not parse response from ${apiUrl}`);
        }
        resolve(json);
      });
    });
    postReq.on('error', (e) => {
      reject(new Error(`Error when POST to ${apiUrl}: ${e.message}`));
    });
    postReq.write(jsonStr);
    postReq.end();
  });
}