import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2uZhCyIXEsKZQ5_pDzumI_8JrQWL5zXA",
  authDomain: "sislab-b04fc.firebaseapp.com",
  projectId: "sislab-b04fc",
  storageBucket: "sislab-b04fc.appspot.com",
  messagingSenderId: "964155005648",
  appId: "1:964155005648:web:3e5c19f4ed43938d471cd5"
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);