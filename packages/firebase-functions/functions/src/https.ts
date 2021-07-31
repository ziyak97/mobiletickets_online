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

  if (!ticketekUrl.length) {
    res.status(400).send({errors: [{message: "no url entered"}]});
  }

  if (!isValidTicketekUrl(ticketekUrl)) {
    return res.status(400).send({errors: [{message: "invalid url"}]});
  }

  const ticketsRef = admin.firestore().collection("tickets");
  const snapshot = await ticketsRef
      .where("ticketekUrl", "==", ticketekUrl)
      .limit(1)
      .get();

  if (!snapshot.empty) {
    const {mobileTicketsUrl} = snapshot.docs[0].data();
    return res.send({id: mobileTicketsUrl.split("?id=")[1], ticketekUrl});
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const phone = puppeteer.devices["iPhone X"];

  await page.emulate(phone);

  await page.goto(ticketekUrl, {
    waitUntil: "networkidle0",
  });

  const canEvaluate = await page.evaluate(() => {
    const barcode = document.querySelector("#barcode");
    const dom = document.querySelectorAll(".textColumn");

    if (!barcode || !dom) return false;

    return null;
  });

  if (canEvaluate === false) {
    return res
        .status(400)
        .send({errors: [{message: "ticket does not exist"}]});
  }

  const scrollDimension = await page.evaluate(() => {
    const dom = document.querySelectorAll(".textColumn");
    const body = document.querySelector("body");
    if (body) {
      body.style.fontFamily = "sans-serif";
      body.style.height = "100vh";
    }
    const stdPageContent: HTMLElement | null =
      document.querySelector("#stdPageContent");
    if (stdPageContent) {
      stdPageContent.style.paddingBottom = "0";
      const lastChild: HTMLElement | null = document.querySelector(
          "#stdPageContent:last-child"
      )!.lastElementChild as HTMLElement;
      if (lastChild) lastChild.style.marginBottom = "0";
    }

    dom.forEach((el) => {
      if (el.lastElementChild) el.removeChild(el.lastElementChild);
    });

    return {
      width:
        document.scrollingElement?.scrollWidth ||
        document.documentElement.scrollWidth ||
        document.documentElement.offsetWidth,
      height:
        document.scrollingElement?.scrollHeight ||
        document.documentElement.scrollHeight ||
        document.documentElement.offsetHeight,
    };
  });

  console.log(scrollDimension);

  // await page.setViewport({
  //   width: scrollDimension.width,
  //   height: scrollDimension.height,
  // });

  const pdf = await page.pdf({
    printBackground: true,
    width: scrollDimension.width,
    height: scrollDimension.height + 25,
  });

  await browser.close();

  const ticketId = ticketekUrl.split("?id=")[1];

  const file = admin
      .storage()
      .bucket("gs://mobiletickets-online.appspot.com")
      .file(`mobiletickets_online?id=${ticketId}.pdf`);

  await file.save(pdf);

  const url = `https://storage.googleapis.com/mobiletickets-online.appspot.com/mobiletickets_online%3Fid%3D${ticketId}.pdf`;

  await db
      .collection("tickets")
      .doc(ticketId)
      .set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        pdfUrl: url,
        ticketekUrl,
        mobileTicketsUrl: `https://www.mobiletickets.online?id=${ticketId}`,
      });

  return res.send({id: ticketId, ticketekUrl});
});

app.get("/create-csv", async (_req, res) => {
  const ticketsRef = admin.firestore().collection("tickets");
  const snapshot = await ticketsRef.get();
  interface Ticket {
    ticketekUrl: string;
    mobileTicketsUrl: string;
    createdAt: string;
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

app.post("/create-pdfs", async (req, res) => {
  const {ticketekUrls}: { ticketekUrls: string[] } = req.body;
  const finalUrlIds: { id: string; ticketekUrl: string }[] = [];

  if (!ticketekUrls.length) {
    res.status(400).send({errors: [{message: "no urls entered"}]});
  }

  let allUrlsAreValid = true;
  let invlidUrl = "";

  for (const ticketekUrl of ticketekUrls) {
    if (!isValidTicketekUrl(ticketekUrl)) {
      allUrlsAreValid = false;
      invlidUrl = ticketekUrl;
      break;
    }
  }

  if (!allUrlsAreValid) {
    return res
        .status(400)
        .send({errors: [{message: `${invlidUrl} is an invlid url`}]});
  }

  /**
   * Checks if ticket url is valid.
   * @param {string} ticketekUrl The url.
   * @return {Promise<FirebaseFirestore.DocumentData>}
   */ async function findExistingUrl(
      ticketekUrl: string
  ): Promise<FirebaseFirestore.DocumentData> {
    return await ticketsRef
        .where("ticketekUrl", "==", ticketekUrl)
        .limit(1)
        .get();
  }

  const ticketsRef = admin.firestore().collection("tickets");
  const promises = ticketekUrls.map((ticketekUrl) => {
    return findExistingUrl(ticketekUrl);
  });

  const snapshots = await Promise.all(promises);

  snapshots.forEach((snapshot) => {
    if (!snapshot.empty) {
      const {mobileTicketsUrl, ticketekUrl} = snapshot.docs[0].data();
      finalUrlIds.push({id: mobileTicketsUrl.split("?id=")[1], ticketekUrl});
      const index = ticketekUrls.indexOf(ticketekUrl);
      if (index > -1) {
        ticketekUrls.splice(index, 1);
      }
    }
  });

  if (!ticketekUrls.length) res.send(finalUrlIds);

  /**
   * Checks if ticket url is valid.
   * @param {string} ticketekUrl The url.
   */
  async function generatePdfs(ticketekUrl: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const phone = puppeteer.devices["iPhone X"];

    await page.emulate(phone);

    await page.goto(ticketekUrl, {
      waitUntil: "networkidle0",
    });

    const canEvaluate = await page.evaluate(() => {
      const barcode = document.querySelector("#barcode");
      const dom = document.querySelectorAll(".textColumn");

      if (!barcode || !dom) return false;

      return null;
    });

    if (canEvaluate === false) {
      return res
          .status(400)
          .send({errors: [{message: "ticket does not exist"}]});
    }

    const scrollDimension = await page.evaluate(() => {
      const dom = document.querySelectorAll(".textColumn");
      const body = document.querySelector("body");
      if (body) {
        body.style.fontFamily = "sans-serif";
        body.style.height = "100vh";
      }
      const stdPageContent: HTMLElement | null =
        document.querySelector("#stdPageContent");
      if (stdPageContent) {
        stdPageContent.style.paddingBottom = "0";
        const lastChild: HTMLElement | null = document.querySelector(
            "#stdPageContent:last-child"
        )!.lastElementChild as HTMLElement;
        if (lastChild) lastChild.style.marginBottom = "0";
      }

      dom.forEach((el) => {
        if (el.lastElementChild) el.removeChild(el.lastElementChild);
      });

      return {
        width:
          document.scrollingElement?.scrollWidth ||
          document.documentElement.scrollWidth ||
          document.documentElement.offsetWidth,
        height:
          document.scrollingElement?.scrollHeight ||
          document.documentElement.scrollHeight ||
          document.documentElement.offsetHeight,
      };
    });

    console.log(scrollDimension);

    // await page.setViewport({
    //   width: scrollDimension.width,
    //   height: scrollDimension.height,
    // });

    const pdf = await page.pdf({
      printBackground: true,
      width: scrollDimension.width,
      height: scrollDimension.height + 25,
    });

    await browser.close();

    const ticketId = ticketekUrl.split("?id=")[1];

    const file = admin
        .storage()
        .bucket("gs://mobiletickets-online.appspot.com")
        .file(`mobiletickets_online?id=${ticketId}.pdf`);

    await file.save(pdf);

    const url = `https://storage.googleapis.com/mobiletickets-online.appspot.com/mobiletickets_online%3Fid%3D${ticketId}.pdf`;

    await db
        .collection("tickets")
        .doc(ticketId)
        .set({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          pdfUrl: url,
          ticketekUrl,
          mobileTicketsUrl: `https://www.mobiletickets.online?id=${ticketId}`,
        });
    finalUrlIds.push({id: ticketId, ticketekUrl});

    return null;
  }

  const pdfPromises = ticketekUrls.map(async (ticketekUrl) => {
    return await generatePdfs(ticketekUrl);
  });

  try {
    await Promise.all(pdfPromises);
  } catch (error) {
    console.error(error);
  }

  return res.send(finalUrlIds);
});

export const api = functions.runWith({memory: "1GB"}).https.onRequest(app);
