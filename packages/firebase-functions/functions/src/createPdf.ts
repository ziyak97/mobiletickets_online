import * as functions from "firebase-functions";

import * as puppeteer from "puppeteer";

import * as admin from "firebase-admin";
import {isValidTicketekUrl} from "./helpers";

admin.initializeApp();

const db = admin.firestore();

export const createPdf = functions.https.onRequest(async (req, res) => {
  const {ticketekUrl}: {ticketekUrl: string} = req.body;

  console.log(ticketekUrl);

  if (!isValidTicketekUrl(ticketekUrl)) {
    res.status(400).send("invalid url");
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto("https://www.ticketek.mobi/?id=D0E1210502F8C142CF90&s=8078", {
    waitUntil: "networkidle0",
  });

  const canEvaluate = await page.evaluate(() => {
    const barcode = document.querySelector("#barcode");
    const dom = document.querySelectorAll(".textColumn");

    if (!barcode || !dom) return false;

    dom.forEach((el) => {
      if (el.lastElementChild) return el.removeChild(el.lastElementChild);
      return null;
    });

    return null;
  });

  if (canEvaluate === false) {
    res.status(400).send("ticket does not exist");
    return;
  }

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
  res.send(url[0]);
});
