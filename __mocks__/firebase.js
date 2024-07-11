const auth = {
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: '12345' } })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: '12345' } })),
  };
  
  const firestore = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      })),
    })),
  };
  
  const firebase = {
    auth: jest.fn(() => auth),
    firestore: jest.fn(() => firestore),
  };
  
  export default firebase;
  