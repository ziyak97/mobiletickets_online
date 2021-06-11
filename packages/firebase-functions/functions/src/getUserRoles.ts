import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const getUserRoles = functions.https.onRequest(async (req, res) => {
  const {email}: {email: string} = JSON.parse(req.body);
  console.log(email);
  const uersRef = admin.firestore().collection("users");
  const snapshot = await uersRef.where("email", "==", email).limit(1).get();

  if (snapshot.empty) {
    throw new Error("invalid email");
  }

  let user = {};

  // there will always be only one user since the limit is 1
  snapshot.forEach((doc) => user = doc.data());

  res.send(user);
});
