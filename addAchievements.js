const admin = require('firebase-admin');

// Uses the service account key at GOOGLE_APPLICATION_CREDENTIALS. Never commit the key file.
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const achievements = [
  { name: 'Level 10 Achiever', description: 'Awarded for reaching level 10', thresholdLevel: 10 },
  { name: 'Level 20 Achiever', description: 'Awarded for reaching level 20', thresholdLevel: 20 },
  { name: 'Level 30 Achiever', description: 'Awarded for reaching level 30', thresholdLevel: 30 },
  { name: 'Level 40 Achiever', description: 'Awarded for reaching level 40', thresholdLevel: 40 },
  { name: 'Level 50 Achiever', description: 'Awarded for reaching level 50', thresholdLevel: 50 },
  { name: 'Level 75 Achiever', description: 'Awarded for reaching level 75', thresholdLevel: 75 },
  { name: 'Level 100 Achiever', description: 'Awarded for reaching level 100', thresholdLevel: 100 },
  { name: 'Level 150 Achiever', description: 'Awarded for reaching level 150', thresholdLevel: 150 },
  { name: 'Level 200 Achiever', description: 'Awarded for reaching level 200', thresholdLevel: 200 },
];

achievements.forEach(async (achievement) => {
  await db.collection('achievements').add(achievement);
  console.log(`Added ${achievement.name}`);
});

console.log('Achievements added successfully');
