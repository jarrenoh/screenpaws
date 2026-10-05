// One-off cleanup: user docs are publicly readable, so strip emails stored by older app versions.
// Run with: GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node removeUserEmails.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const removeUserEmails = async () => {
  const snapshot = await db.collection('users').get();
  const withEmail = snapshot.docs.filter(doc => doc.data().email !== undefined);

  for (const doc of withEmail) {
    await doc.ref.update({ email: admin.firestore.FieldValue.delete() });
  }

  console.log(`Removed email from ${withEmail.length} user docs`);
};

removeUserEmails().catch(error => {
  console.error('Error removing emails:', error);
  process.exit(1);
});
