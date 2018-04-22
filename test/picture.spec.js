import puppeteer from "puppeteer";

const LOZAD_DEMO = "http://localhost:3000";

let page;
let browser;
const width = 1920;
const height = 1080;

function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

async function scrollUpAndDown(page){
  // Get the height of the rendered page
  const bodyHandle = await page.$("body");
  const { height } = await bodyHandle.boundingBox();
  await bodyHandle.dispose();

  // Scroll one viewport at a time, pausing to let content load
  const viewportHeight = page.viewport().height;
  let viewportIncr = 0;
  while (viewportIncr + viewportHeight < height) {
    await page.evaluate(_viewportHeight => {
      window.scrollBy(0, _viewportHeight);
    }, viewportHeight);
    await wait(20);
    viewportIncr = viewportIncr + viewportHeight;
  }

  // Scroll back to top
  await page.evaluate(_ => {
    window.scrollTo(0, 0);
  });

  // Some extra delay to let images load
  await wait(100);
}

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: [`--window-size=${width},${height}`]
  });
  page = await browser.newPage();
  await page.setViewport({ width, height });
});
afterAll(() => {
  //browser.close();
});

describe("Picture elements", () => {
  //just a dummy test,
  test("assert that demo page is loaded and correct (<title> is correct)", async () => {
    await page.goto(LOZAD_DEMO);
    const title = await page.title();
    expect(title).toBe("Lozad.js: Highly performant lazy loader");
  });

  test(
    "lazyloaded picture tags should have an <img> injected, with correct src",
    async () => {
      await page.goto(LOZAD_DEMO);

      await scrollUpAndDown(page);

      await page.waitForSelector("#pictures");
      /*await page.evaluate(_ => {
        window.scrollBy(0, window.innerHeight);
      });*/
      /*await page.waitFor(_=>{
      window.scrollBy(0, window.innerHeight);
    });*/
      //await page.waitFor(5000);

      const pictureImgs = await page.$$eval(".lozad-picture img", imgs => imgs.map(e=>e.currentSrc));

      /*imgs = await page.evaluate(_ => {
      let imgz = document.querySelectorAll(".lozad-picture img");
      imgz.forEach(e=>{console.log(e.currentSrc)});
      return imgz;
      //img
    });*/
      //console.log(imgs)
      console.log(pictureImgs);

      expect(pictureImgs.length).toBe(3);

      expect(pictureImgs).toEqual(["http://localhost:3000/images/thumbs/picture-01.jpg","http://localhost:3000/images/thumbs/picture-04.jpg","http://localhost:3000/images/thumbs/picture-07.jpg"])


    },
    16000
  );
});
