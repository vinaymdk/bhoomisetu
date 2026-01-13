<!-- .env file configuration

Firebase Configuration -->

<!-- Option 1: Path to Firebase Admin SDK credentials JSON file -->
FIREBASE_CREDENTIALS_PATH=./bhoomisetu-48706-firebase-adminsdk-fbsvc-6e896e4e57.json
<!-- Option 2: Firebase credentials as environment variables (for production/containers) -->
FIREBASE_PROJECT_ID=bhoomisetu-48706
FIREBASE_CLIENT_API_KEY=AIzaSyDVcSfOoAtPErikXXjt1widoUDiMctr3kQ
FIREBASE_AUTH_DOMAIN=bhoomisetu-48706.firebaseapp.com
FIREBASE_STORAGE_BUCKET=bhoomisetu-48706.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=16495143806
FIREBASE_APP_ID=1:16495143806:web:03e55bc7f6c64f7898612f
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCvX4nUNOECsHdQ\nXsFp/rMuYMxlhM3ytbk2dd//Nj7USPTMLR2XtcHgVGT+WBt9e8CbJ1k8pQ+ho2OX\n1u0XbIv+loLNeF/26W5fR6P3L9o/icJbuIAR7Vllh6/3pnzG03Rb0nsMRNCmxHDv\ndpXXf4qwD2rrAwHvtWRd9cwEfDv1t5bwKXuTxQ9IHnsMEWa+HQW5SGvjeR485dw/\ngpdEuUQBvEhccr9rviSiaTuAfHKFPeVDpov8e1cKSFfz3GfcgUQylFnDxqOxHcgI\nSMeBw2AdAHzJWB1HCfs31SGABkNeWGj2ODiwaASdJ/Rba2Tx6Y8mXWcCdmqzRQSP\n0Lf0hQWpAgMBAAECggEAFHsMM/7BbOCaLIYGYTgsKY1HLY9tBExl7wbk1A+cFotX\nIF2f9DrXI5lDiqMUQcsxJwV5QdB2gv5beAzy9x53enHOIIwPa/zepYyuqMRbQPqX\n+sFxHnbZLvbhzWKRdaBV+U+7TEdglStBk6umC+rSkeVZC41YPWvyBtmY3Ai8sWEv\n0XPQLYe5LZ97RxawD6kBjmQXF7ZjH40MFiuwaie9JwkBYoTG81zhEkoSy9uFp0Mg\nraYc6pyJqaHWny2EQ2ChUorBvCn5zLpyWa66fHD5yRTEuB5HZR7AG4NKKZXF+zio\n02qPWBeaKW4hDk2h9eJ6utZv2NXBcoBoYu0UcIGGAQKBgQDoV65lY5rYIS5QQ9Jn\nEq1ELZlkY34KsWlBLk0YTcOTF5ok0aTPIY8+20nt/GjlcuDrx63NuJ1qFhlnUhr9\nwfM/N9Sw0jxTvT3HFT+iiwsehfWCIw/g9kiSRY6CGdaIjDelh8TxV3c7TCP6/gQX\njMpxYnkQZifVt6dBbdFtawYmAQKBgQDBOuA0YE78GaqaNEW7x3J5jlaDa2kp/8Fe\n4edrupOPe3gIRdMckPtkyq8QgjrxvtieKVLuED26kz34eqZi2EbLDdHiVb1n2UaE\nAOKDsigJZScw47wlTnSL9kfSKCV3ocUL/qqCe6HgtU3ts7oenw053ATta198GfIy\nlngcTfvvqQKBgQCv1PNhPZEIsYu4KKuJX6QKrauhQn43n221a1Hi667vmXQJGzLr\nok0i15fKaDQGOPso1HOe9XEDwPe2rndIxUfN9vWaX3BSOywOhvEilLF0hxJ2SwyQ\nRjJDqCoiIWWu7taKCgasUnIkSQoNv8DfBaiLSGewVm8dGSCVroNImC8OAQKBgQCN\neTzUPDs4KtaUxnbT8EgpJYTD/a1mmaGLhZx5bIZDRCPy8qSJwsC84ATi8maTvqY8\nzoawVGXNp6Z0ud/+eNkELB8iNqJRWWxek4NE5viXQF88VVDYg6OjIfMdtFUSTPfH\nO3K9zCUOL9BZnABGES+O0D8vUTD83MZOMYrJNnOh2QKBgFLWBQ9TV55MnmpzEOP/\nikN4IXVlGeJNZg5xhtjH2lfcURco9jh0nYBlZucvq0/CSpLXsGGimXvmwLl6jroY\ngUJZxO3qa8AQqUjHf90IWT1xABkxjy5gOxgnKw7bKq3nzlcznzzVUgBJDXH7Zl5C\nAjXH8lza6hWs+lLGHdVLxkCk\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@bhoomisetu-48706.iam.gserviceaccount.com



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVcSfOoAtPErikXXjt1widoUDiMctr3kQ",
  authDomain: "bhoomisetu-48706.firebaseapp.com",
  projectId: "bhoomisetu-48706",
  storageBucket: "bhoomisetu-48706.firebasestorage.app",
  messagingSenderId: "16495143806",
  appId: "1:16495143806:web:03e55bc7f6c64f7898612f",
  measurementId: "G-RRJFH7SE6S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);