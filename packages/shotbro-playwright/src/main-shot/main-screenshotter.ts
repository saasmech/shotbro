import type {Page} from "@playwright/test";
import * as fs from "fs";

const MAIN_CAPTURE_HEIGHT_LIMIT = 4000;
const MAIN_CAPTURE_WIDTH_LIMIT = 4000;

export async function generateMainScreenshot(page: Page, jsonElPositionsPath: string, screenshotPath: string) {
  const rootEl = await page.locator('html');
  const rootBb = await rootEl.boundingBox()
  if (!rootBb) throw new Error('Could not get size of HTML element');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: 'disabled',
    clip: {
      x: rootBb.x, y: rootBb.y,
      width: rootBb.width > MAIN_CAPTURE_WIDTH_LIMIT ? MAIN_CAPTURE_WIDTH_LIMIT : rootBb.width,
      height: rootBb.height > MAIN_CAPTURE_HEIGHT_LIMIT ? MAIN_CAPTURE_HEIGHT_LIMIT : rootBb.height,
    }
  });

  type ElPos = {
    tagName: string,
    x: number, y: number, w: number, h: number,
    id?: string,
    className?: string,
    dataTestId?: string,
    alt?: string,
    title?: string,
    type?: string,
    placeholder?: string,
  }
  const elPositionsOuter = await page.evaluate(async () => {
    // otherwise we are very specifically not touching playwright's setup as the
    // test may have scrolled something (like a div within a larger div)

    // sugges: optionally ensure the page is scrolled to the top
    // window.scroll({top: 0, left: 0, behavior: 'auto'});
    const elPositions: ElPos[] = [];

    const addSbBb = async function (el: Element | null) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
      if (!el) return;
      const bb = await el.getBoundingClientRect();
      // data-sb-bb = ShotBro Bounding Box / in css style key:value;...
      // el.setAttribute('data-sb-bb', `x:${bb.x};y:${bb.y};w:${bb.width};h:${bb.height};`)

      elPositions.push({
        tagName: el.tagName,
        x: bb.x, y: bb.y, w: bb.width, h: bb.height,
        id: el.id,
        className: el.className,
        dataTestId: el.getAttribute('data-test-id') || undefined,
        alt: el.getAttribute('alt') || undefined,
        title: el.getAttribute('title') || undefined,
        type: el.getAttribute('type') || undefined,
        placeholder: el.getAttribute('placeholder') || undefined,
      });
    };
    await addSbBb(document.querySelector('html'));
    await addSbBb(document.body);
    const allEls = document.body.querySelectorAll('*');
    for (let i = 0; i < allEls.length; i++) {
      await addSbBb(allEls[i]);
    }
    return elPositions;
  });
  const content = JSON.stringify({positions: elPositionsOuter}, null, 0);
  fs.writeFileSync(jsonElPositionsPath, content);
}
