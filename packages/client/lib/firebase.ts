import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBLs7C4mLANmV4HfcN5iCUygZ_oCOmZPsw',
  authDomain: 'mobiletickets-online.firebaseapp.com',
  projectId: 'mobiletickets-online',
  storageBucket: 'mobiletickets-online.appspot.com',
  messagingSenderId: '215444212231',
  appId: '1:215444212231:web:4e3ed2d66113cf17ca38a2',
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export const auth = firebase.auth()
export const firestore = firebase.firestore()
