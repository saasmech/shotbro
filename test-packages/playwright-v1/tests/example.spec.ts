import {test as playwrightTest} from '@playwright/test';
import * as path from 'path';
//import {shotBro} from "shotbro";

playwrightTest('test1', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  console.log('ex', examplePath);
  await page.setViewportSize({width: 320, height: 900});
  await page.goto(`file:${examplePath}`);

  // await shotBro('How to submit my form', page, {
  //   at: '#myform',
  //   // scale: 1.2,
  //   // shapes: [
  //   //   {circle: {at: '.btn-primary'}},
  //   //   {circle: {atText: 'Available in', id: 'abc', padding: '70px'}},
  //   //   {circle: {atLocator: await page.locator(''), id: 'abc', padding: '70px'}},
  //   //   {circle: {atTestId: 'ssss', id: 'abc', padding: '70px'}},
  //   //   {arrow: {atTestId: 'abc'}},
  //   //
  //   //   {circle: {translate: -10, id: 'abc', padding: '70px'}},
  //   //   {arrow: {atTestId: '', translate: -10, id: 'abc'}},
  //   // ]
  // }, {file: 'out.png'})

});