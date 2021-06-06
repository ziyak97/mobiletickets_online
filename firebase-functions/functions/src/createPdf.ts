import * as functions from "firebase-functions";

import * as puppeteer from "puppeteer";

import * as admin from "firebase-admin";


admin.initializeApp();

const db = admin.firestore();

export const createPdf = functions.https.onRequest(async (req, res) => {
  // const {ticketekUrl}: {ticketekUrl: URL} = req.body;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto("https://www.ticketek.mobi/?id=012A17958780A7D887AD&s=7894", {
    waitUntil: "networkidle0",
  });

  await page.evaluate(() => {
    const dom = document.querySelectorAll(".textColumn");
    dom &&
      dom.forEach((el) => {
        if (el.lastElementChild) return el.removeChild(el.lastElementChild);
        return null;
      });
  });

  const pdf = await page.pdf({
    format: "a6",
    printBackground: true,
  });

  await browser.close();

  const file = admin.storage().bucket("gs://mobiletickets-online.appspot.com").file("test.pdf");

  await file.save(pdf);

  // returns an array where the url for our file will be url[0]
  const url = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });

  await db.collection("tickets").doc("test").set({
    url: url[0],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  res.send("done");
});
