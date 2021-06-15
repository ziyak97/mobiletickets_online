import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as puppeteer from "puppeteer";
import {Parser} from "json2csv";
import {isValidTicketekUrl, csvFields as fields} from "./helpers";

admin.initializeApp();

const db = admin.firestore();

const app = express();

app.use(cors({origin: true}));

app.use(express.json());


app.post("/create-pdf", async (req, res) => {
  const {ticketekUrl}: { ticketekUrl: string } = req.body;

  if (!isValidTicketekUrl(ticketekUrl)) {
    return res.status(400).send({errors: [{message: "invalid url"}]});
  }

  const ticketsRef = admin.firestore().collection("tickets");
  const snapshot = await ticketsRef
      .where("ticketekUrl", "==", ticketekUrl).limit(1).get();

  if (!snapshot.empty) {
    const {mobileTicketsUrl} = snapshot.docs[0].data();
    return res.send({id: mobileTicketsUrl.split("?id=")[1]});
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

  const ticketId = db.collection("tickets").doc().id;

  const file = admin
      .storage()
      .bucket("gs://mobiletickets-online.appspot.com")
      .file(`mobiletickets_online?id=${ticketId}.pdf`);

  await file.save(pdf);

  const url = `https://storage.googleapis.com/mobiletickets-online.appspot.com/mobiletickets_online%3Fid%3D${ticketId}.pdf`;

  await db.collection("tickets").doc(ticketId).set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    pdfUrl: url,
    ticketekUrl,
    mobileTicketsUrl: `https://www.mobiletickets.online?id=${ticketId}`,
  });

  return res.send({id: ticketId});
});

app.get("/create-csv", async (_req, res) => {
  const ticketsRef = admin.firestore().collection("tickets");
  const snapshot = await ticketsRef.get();
  interface Ticket {
    ticketekUrl: string,
    mobileTicketsUrl: string,
    createdAt: string,
  }

  if (snapshot.empty) {
    res.status(400).send({errors: [{message: "no tickets yet"}]});
  }

  const ticketsData: Ticket[] = [];

  snapshot.forEach((doc) => {
    const ticketObject = {
      ticketekUrl: doc.data().ticketekUrl as string,
      mobileTicketsUrl: doc.data().mobileTicketsUrl as string,
      createdAt: doc.data().createdAt.toDate().toDateString() as string,
    };
    ticketsData.push(ticketObject);
  });

  const fileName = "mobiletickets_online.csv";
  const json2csv = new Parser({fields});
  const csv = json2csv.parse(ticketsData);
  res.header("Content-Type", "text/csv");
  res.attachment(fileName);
  return res.status(200).send(csv);
});

export const api = functions.runWith({memory: "1GB"}).https.onRequest(app);
