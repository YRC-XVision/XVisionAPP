import { getAuth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

async function getUserData() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User is not authenticated');
    }

    try {
      const userDoc = await firestore().collection('Users').doc(user.uid).get();
      return userDoc.data();  // Return data as a plain JavaScript object
    } catch (error) {
      throw new Error('Error fetching user data: ' + error.message);
    }
}

export default getUserData;
