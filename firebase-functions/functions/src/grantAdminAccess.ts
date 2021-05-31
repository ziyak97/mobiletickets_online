import * as functions from "firebase-functions";

import * as admin from "firebase-admin";

export const grantAdminAccess = functions.https.onRequest(async (req) => {
  const {email}: {email: string} = JSON.parse(req.body);
  console.log(email);

  const user = await admin.auth().getUserByEmail(email);

  console.log(user.customClaims);

  if (user.customClaims?.admin === true) return;

  return admin.auth().setCustomUserClaims(user.uid, {
    admin: true,
  });
});
