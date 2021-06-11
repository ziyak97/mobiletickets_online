import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as puppeteer from "puppeteer";
import {isValidTicketekUrl} from "./helpers";

const db = admin.firestore();

const app = express();

app.use(cors({origin: true}));

app.use(express.json());


app.post("/create-pdf", async (req, res) => {
  const {ticketekUrl}: { ticketekUrl: string } = req.body;

  const uersRef = admin.firestore().collection("tickets");
  const snapshot = await uersRef
      .where("ticketekUrl", "==", ticketekUrl).limit(1).get();

  if (!snapshot.empty) {
    const {ticketBlasterUrl} = snapshot.docs[0].data();
    return res.send({url: ticketBlasterUrl});
  }


  if (!isValidTicketekUrl(ticketekUrl)) {
    return res.status(400).send({errors: [{message: "invalid url"}]});
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto(ticketekUrl, {
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
    return res.status(400).send({errors: [{message: "ticket does not exist"}]});
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

  const ticketId = db.collection("tickets").doc().id;


  await db.collection("tickets").doc(ticketId).set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    pdfUrl: url[0],
    ticketekUrl,
    ticketBlasterUrl: ticketId,
  });

  return res.send({url: ticketId});
});

app.post("/get-user-roles", async (req, res) => {
  const {email}: { email: string } = JSON.parse(req.body);

  console.log(email);

  const uersRef = admin.firestore().collection("users");
  const snapshot = await uersRef.where("email", "==", email).limit(1).get();

  if (snapshot.empty) {
    throw new Error("invalid email");
  }

  const user = snapshot.docs[0].data();

  return res.send(user);
});

export const api = functions.https.onRequest(app);
