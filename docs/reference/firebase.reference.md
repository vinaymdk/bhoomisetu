<!-- Facebood App Id: 1601429517707547 -->

// src/common/firebase/firebase.service.ts
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(
    require('../../firebase-service-account.json'),
  ),
});

export const firebaseAuth = admin.auth();

==================================================

const decodedToken = await firebaseAuth.verifyIdToken(idToken);

decodedToken.uid
decodedToken.phone_number
decodedToken.email

==================================================