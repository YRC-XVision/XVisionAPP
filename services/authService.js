import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";
import { AuthExceptionHandler } from "./auth_exception";

async function registerWithEmailAndPassword({ email, username, gender, age, password }) {
  console.log("Email:", email);
  console.log("Password:", password);

  try {
    if (!auth) {
      console.error("Auth is not initialized");
      return 'auth-not-initialized';
    }

    // ตรวจสอบว่ามีค่า auth และทำการสร้างผู้ใช้งาน
    const authResult = await createUserWithEmailAndPassword(auth, email, password);

    console.log(authResult.user);

    if (authResult.user) {
      await _saveUserData(username, email, age, gender, authResult.user.uid);
      console.log('User registered successfully');
      return 'successful';
    }
  } catch (error) {
    console.log("Error:", error);
    return handleException(error);
  }
}

// การบันทึกข้อมูลผู้ใช้งาน
async function _saveUserData(username, email, age, gender, id) {
  try {
    const userDoc = doc(collection(firestore, 'Users'), id);
    await setDoc(userDoc, {
      information: {
        username,
        email,
        age,
        gender,
        character: "test.png",
        xcoin: 0,
      },
    });
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

async function loginWithEmailAndPassword({ email, password }) {
  try {
    const authResult = await signInWithEmailAndPassword(auth, email, password);

    if (authResult.user) {
      return 'successful';
    }
    return 'undefined';
  } catch (msg) {
    return AuthExceptionHandler(msg);
  }
}

function handleException(error) {
  if (error.code === 'auth/email-already-in-use') {
    return 'email-already-in-use';
  } else if (error.code === 'auth/invalid-email') {
    return 'invalid-email';
  } else if (error.code === 'auth/weak-password') {
    return 'weak-password';
  }
  return 'undefined';
}

export { registerWithEmailAndPassword, loginWithEmailAndPassword };