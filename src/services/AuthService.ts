import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { SigninFormInputsTypes, SignUpFormInputs, UserDetails } from "@/types";
import { firebaseAuth, firebaseDB } from "./FirebaseService";

class AuthService {
  async login(data: SigninFormInputsTypes): Promise<UserDetails> {
    const { email, password } = data;

    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;

      const usersCollectionRef = collection(firebaseDB, "app_users");
      const q = query(usersCollectionRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log(
          `User data not found for UID: ${user.uid} in collection "app_users".`
        );
        toast.error("User not found");
      }

      const userData = querySnapshot.docs[0].data() as UserDetails;

      // Store user details in localStorage
      localStorage.setItem("userDetails", JSON.stringify(userData));

      toast.success("Login successful!");
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed!");
      throw error;
    }
  }

  async register(data: SignUpFormInputs) {
    const { email, password, name } = data;

    try {
      // 🔍 Step 0: Pre-check Firestore for existing user document
      const existingUserDocRef = doc(firebaseDB, "app_users", email); // or use uid if you store that way
      const existingUserSnapshot = await getDoc(existingUserDocRef);

      if (existingUserSnapshot.exists()) {
        toast.error("User already exists with this email!");
        return null;
      }

      // ✅ Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user?.uid) {
        console.log("User UID is undefined after registration.");
        toast.error("Registration failed. Please try again.");
        return null;
      }

      // 📧 Step 2: Send verification
      await sendEmailVerification(user);

      // 📝 Step 3: Save user data in Firestore
      const userDoc = {
        name,
        email,
        uid: user.uid,
        joinedOn: Date.now(),
      };

      await setDoc(doc(firebaseDB, "app_users", user.uid), userDoc);

      toast.success("User registered and saved!");
      return user;
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;

      if (firebaseError.code === "auth/email-already-in-use") {
        toast.error("User already exists with this email!");
      } else {
        console.error("Firebase registration error:", firebaseError);
      }

      return null;
    }
  }

  async logout() {
    try {
      await firebaseAuth.signOut();

      // Remove user details from localStorage
      localStorage.removeItem("userDetails");
      toast.success("Logout successful!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed!");
      throw error;
    }
  }

  async registerByGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      if (!user?.uid || !user.email) {
        toast.error("Google authentication failed.");
        return null;
      }

      // 🔍 Step 1: Check if user already exists in Firestore
      const userDocRef = doc(firebaseDB, "app_users", user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        toast.info("User already registered with Google!");
        return user; // Return early if already registered
      }

      // 📝 Step 2: Register user with UID as document ID
      const userDoc = {
        name: user.displayName,
        email: user.email,
        uid: user.uid,
        joinedOn: Date.now(),
      };

      await setDoc(userDocRef, userDoc);

      toast.success("Google registration successful!");
      return user;
    } catch (error) {
      console.log("Google registration error:", error);
      toast.error("Google registration failed!");
      return null;
    }
  }

  async loginByGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      const usersCollectionRef = collection(firebaseDB, "app_users");
      const q = query(usersCollectionRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log(
          `User data not found for UID: ${user.uid} in collection "app_users".`
        );
        toast.error("User not found!");
        return;
      }

      const userData = querySnapshot.docs[0].data() as UserDetails;

      toast.success("Login successful!");
      return userData;
    } catch (error) {
      console.log("Google login error:", error);
    }
  }

  // Helper function to return dummy user data
  getDummyUser(): UserDetails {
    return {
      email: "guest@example.com",
      joinedOn: Date.now(),
      name: "Anonymous",
      uid: "guest-uid",
    };
  }

  async fetchUserDetailsById(userId?: string): Promise<UserDetails | null> {
    try {
      if (!userId) {
        console.warn("No user ID provided, returning dummy user data.");
        return this.getDummyUser();
      }

      const usersCollectionRef = collection(firebaseDB, "app_users");
      const q = query(usersCollectionRef, where("uid", "==", userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn(
          `User not found for UID: ${userId}, returning dummy user data.`
        );
        return this.getDummyUser();
      }

      const userData = querySnapshot.docs[0].data() as UserDetails;
      return userData;
    } catch (error) {
      console.error("Fetch user details error:", error);
      return this.getDummyUser();
    }
  }
}

export default AuthService;
