import type {Page} from "playwright";
import * as fs from "fs";

export async function generateMainScreenshot(page: Page, screenshotPath: string, htmlContentPath: string) {
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: 'disabled',
  })

  await page.evaluate(async () => {
    // otherwise we are very specifically not touching playwright's setup as the
    // test may have scrolled something (like a div within a larger div)

    // sugges: optionally ensure the page is scrolled to the top
    // window.scroll({top: 0, left: 0, behavior: 'auto'});

    const addSbBb = async function (node) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
      const bb = await node.getBoundingClientRect();
      // data-sb-bb = Shot Bro Bounding Box / in css style key:value;...
      node.setAttribute('data-sb-bb', `x:${bb.x};y:${bb.y};w:${bb.width};h:${bb.height};`)
    };
    await addSbBb(document.body);
    document.body.querySelectorAll('*').forEach(addSbBb);
  });
  const content = await page.content();
  fs.writeFileSync(htmlContentPath, content);
}
