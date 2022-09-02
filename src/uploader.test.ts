


import {postFileToUrl, postToApi} from "./uploader";

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as nock from 'nock'

describe('Uploader', () => {

  test('file 500', async () => {
    nock('https://nock.nock')
      .post('/file', 'Hello')
      .reply(500, { someResponseField: 6789})
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbtest'));
    const tmpFile = path.join(tmpDir, 'tmp.txt')
    fs.writeFileSync(tmpFile, 'Hello');
    let ex = null
    try {
      await postFileToUrl(tmpFile, 'https://nock.nock/file');
    } catch(e) {
      ex = e;
    }
    expect(ex).toMatchObject({message: 'File upload returned status of 500'});
  });

    test('file good', async () => {
      nock('https://nock.nock')
        .post('/file', 'Hello')
        .reply(200, '')
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sbtest'));
      const tmpFile = path.join(tmpDir, 'tmp.txt')
      fs.writeFileSync(tmpFile, 'Hello');
      await postFileToUrl(tmpFile, 'https://nock.nock/file');
    });

    test('api good', async () => {
      nock('https://nock.nock')
        .post('/post', '{}')
        .reply(200, { someResponseField: 12345})
      const box = await postToApi('https://nock.nock/post', 'x', JSON.stringify({}));
      expect(box).toMatchObject({someResponseField: 12345});
    })

    test('api 500', async () => {
      nock('https://nock.nock')
        .post('/post', '{}')
        .reply(500, { someResponseField: 12345})
      let ex = null
      try {
        await postToApi('https://nock.nock/post', 'x', JSON.stringify({}));
      } catch(e) {
        ex = e;
      }
      expect(ex).toMatchObject({message:'API returned status of 500'});
    });


});