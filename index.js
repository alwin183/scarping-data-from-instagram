const PORT = 8000;
const puppeteer = require("puppeteer");
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const client = require('https');

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

            }
        });
    });
}

const app = express();
app.use(cors());
app.use(express.static('public'));

const checkSocialMediaLink = (link) => {
  if (link.includes("instagram.com/")) {
    return "Instagram";
  } else if (link.includes("facebook.com/")) {
    return "Facebook";
  } else {
    return "Unknown social media platform";
  }
};

const getData = async (link) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let title = "";
  let image = "";

  const socialMediaPlatform = checkSocialMediaLink(link);

  if (socialMediaPlatform === 'Instagram' || socialMediaPlatform === 'Facebook') {
    await page.goto(link, { waitUntil: "networkidle2" });

    title = await page.evaluate(() =>
      document
        .querySelector("meta[property='og:title']")
        .getAttribute("content")
    );
    image = await page.evaluate(() =>
      document
        .querySelector("meta[property='og:image']")
        .getAttribute("content")
    );

    downloadImage(image, 'public/images/image.png')

    await browser.close();
  }

  return {
    title,
    image
  }
};

app.get('/health', async (req, res) => {
  try {
    res.json({
      msg: "serverUp!!!",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.get('/get_link_data', async (req, res) => {
  try {
    const link = req.query.link; // Use req.query to get the link from the URL query string
    const { title, image } = await getData(link);
    console.log(title);
    console.log(image);

    res.json({
      title,
      image
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
