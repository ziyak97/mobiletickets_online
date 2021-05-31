import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as puppeteer from "puppeteer";

const db = admin.firestore();

const app = express();

app.use(cors({origin: true}));

app.post("/creat-pdf", async (req, res) => {
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

app.post("/get-user-roles", async (req, res) => {
  const {email}: {email: string} = JSON.parse(req.body);

  console.log(email);

  const uersRef = admin.firestore().collection("users");
  const snapshot = await uersRef.where("email", "==", email).limit(1).get();

  if (snapshot.empty) {
    throw new Error("invalid email");
  }

  let user = {};

  snapshot.forEach((doc) => user = doc.data());

  res.send(user);
});

export const api = functions.https.onRequest(app);
