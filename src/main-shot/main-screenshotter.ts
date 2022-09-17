import type {Page} from "playwright";
import * as fs from "fs";

const MAIN_CAPTURE_HEIGHT_LIMIT = 4000;
const MAIN_CAPTURE_WIDTH_LIMIT = 4000;

export async function generateMainScreenshot(page: Page, htmlContentPath: string, screenshotPath: string) {
  const rootEl  = await page.locator('html');
  const rootBb = await rootEl.boundingBox()
  if (!rootBb) throw new Error('Could not get size of HTML element');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: 'disabled',
    clip: {
      x: rootBb.x, y: rootBb.y,
      width: rootBb.width > MAIN_CAPTURE_WIDTH_LIMIT ? MAIN_CAPTURE_WIDTH_LIMIT: rootBb.width,
      height: rootBb.height > MAIN_CAPTURE_HEIGHT_LIMIT ? MAIN_CAPTURE_HEIGHT_LIMIT: rootBb.height,
    }
  });

  await page.evaluate(async () => {
    // otherwise we are very specifically not touching playwright's setup as the
    // test may have scrolled something (like a div within a larger div)

    // sugges: optionally ensure the page is scrolled to the top
    // window.scroll({top: 0, left: 0, behavior: 'auto'});

    const addSbBb = async function (el: Element|null) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
      if (!el) return;
      const bb = await el.getBoundingClientRect();
      // data-sb-bb = Shot Bro Bounding Box / in css style key:value;...
      el.setAttribute('data-sb-bb', `x:${bb.x};y:${bb.y};w:${bb.width};h:${bb.height};`)
    };
    document.body.querySelectorAll('*').forEach(addSbBb);
    await addSbBb(document.body);
    await addSbBb(document.querySelector('html'));
  });
  const content = await page.content();
  fs.writeFileSync(htmlContentPath, content);
}
