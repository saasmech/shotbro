import type {Page} from "playwright";
import * as fs from "fs";

const MAIN_CAPTURE_HEIGHT_LIMIT = 4000;

export async function generateMainScreenshot(page: Page, htmlContentPath: string, screenshotPath: string) {
  const body  = await page.locator('body');
  const bodyBb = await body.boundingBox()
  if (!bodyBb) throw new Error('Could not get size of HTML body');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: 'disabled',
    clip: {
      x: bodyBb.x, y: bodyBb.y,
      width: bodyBb.width, // todo: future, handle very wide also
      height: bodyBb.height > 4000 ? MAIN_CAPTURE_HEIGHT_LIMIT: bodyBb.height
    }
  });

  await page.evaluate(async () => {
    // otherwise we are very specifically not touching playwright's setup as the
    // test may have scrolled something (like a div within a larger div)

    // sugges: optionally ensure the page is scrolled to the top
    // window.scroll({top: 0, left: 0, behavior: 'auto'});

    const addSbBb = async function (el: Element) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
      const bb = await el.getBoundingClientRect();
      // data-sb-bb = Shot Bro Bounding Box / in css style key:value;...
      el.setAttribute('data-sb-bb', `x:${bb.x};y:${bb.y};w:${bb.width};h:${bb.height};`)
    };
    await addSbBb(document.body);
    document.body.querySelectorAll('*').forEach(addSbBb);
  });
  const content = await page.content();
  fs.writeFileSync(htmlContentPath, content);
}
