import {test as playwrightTest} from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv'
import {shotBroPlaywright, shotBroUpload} from "shotbro";

dotenv.config()

playwrightTest('test1', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 320, height: 640});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotName: 'My Form',
    focus: {
      at: '#myform',
    },
    shapes: [
      {circle: {at: '#phone-field'}},
      // {circle: {atText: 'Available in', id: 'abc', padding: '70px'}},
      // {circle: {at: '#myform', id: 'abc', padding: '70px'}},
      // {circle: {atTestId: 'ssss', id: 'abc', padding: '70px'}},
      // {arrow: {atTestId: 'abc'}},
      // {circle: {translate: -10, id: 'abc', padding: '70px'}},
      // {arrow: {atTestId: '', translate: -10, id: 'abc'}},
    ],
    out: {
      logLevel: 'debug',
    }
  })

  await shotBroUpload({
    logLevel: 'debug',
  });
});
