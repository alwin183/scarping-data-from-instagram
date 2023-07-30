const PORT = 8000;
const puppeteer = require("puppeteer");
const express = require('express');
const cors = require('cors');

app.use(cors())
const app = express();

const getInstagramData = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(
    "https://www.instagram.com/p/CvHYg1QvRMj/?utm_source=ig_web_copy_link",
    {
      waitUntil: "networkidle2",
    }
  );

  const title = await page.evaluate(() =>
    document
      .querySelector("meta[property='og:title']")
      .getAttribute("content")
  );
  const image = await page.evaluate(() =>
    document
      .querySelector("meta[property='og:image']")
      .getAttribute("content")
  );

  await browser.close();

  return { title, image };
};

app.get('/instagram', cors(), async (req, res, next) => {
  try {
    const { title, image } = await getInstagramData();
    console.log(title);
    console.log(image);

    res.json({
      title,
      image
    });
  } catch (error) {
    res.status(500).json({ error: "Error occurred while fetching data" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
