import {postFileToUrl, postToApi} from "./uploader";

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// @ts-ignore
import nock from 'nock';

describe('Uploader', () => {

  test.skip('file 500', async () => {
    nock('http://nock.nock')
      .post('/file', 'Hello')
      .reply(500, {someResponseField: 6789})
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbtest'));
    const tmpFile = path.join(tmpDir, 'tmp.txt')
    fs.writeFileSync(tmpFile, 'Hello');
    let ex = null
    try {
      await postFileToUrl(tmpFile, 'http://nock.nock/file');
    } catch (e) {
      ex = e;
    }
    expect(ex).toMatchObject({message: 'File upload returned status of 500'});
  });

  test.skip('file good', async () => {
    nock('http://nock.nock')
      .post('/file', 'Hello')
      .reply(200, '')
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbtest'));
    const tmpFile = path.join(tmpDir, 'tmp.txt')
    fs.writeFileSync(tmpFile, 'Hello');
    await postFileToUrl(tmpFile, 'http://nock.nock/file');
  });

  test('api good', async () => {
    nock('http://nock.nock')
      .post('/post', '{}')
      .reply(200, {someResponseField: 12345})
    const box = await postToApi('http://nock.nock/post', 'x', JSON.stringify({}));
    expect(box).toMatchObject({someResponseField: 12345});
  })

  test('api 500', async () => {
    nock('http://nock.nock')
      .post('/post', '{}')
      .reply(500, {someResponseField: 12345})
    let ex: null | any = null
    try {
      await postToApi('http://nock.nock/post', 'x', JSON.stringify({}));
    } catch (e) {
      ex = e;
    }
    expect(ex?.message).toMatch('API returned status of 500');
  });

  test.skip('localhost post api', async () => {
    //let res = await postToApi('https://httpbin.org/post', 'sdsds', JSON.stringify({hello: 1234}));
    let res = await postToApi('http://127.0.0.1:5002/api/incoming/get-upload-urls-v1', 'rk:1:unit-test-org-token', JSON.stringify({}));
    expect(res?.output?.htmlUploadId).toHaveLength(26);
    expect(res?.output?.htmlUploadUrl).toContain('https://');
    expect(res?.output?.pngUploadId).toHaveLength(26);
    expect(res?.output?.pngUploadUrl).toContain('https://');
  });

  test.skip('my post file', async () => {
    fs.writeFileSync('tmp.tmp', 'hello', 'utf-8');
    await postFileToUrl('tmp.tmp',
      'https://signed-url');
  });

});