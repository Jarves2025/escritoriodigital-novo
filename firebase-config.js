<!-- firebase-config.js -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"></script>

<script>
  const firebaseConfig = {
    apiKey: "AIzaSyDPRSomKzMMlIiACYdpCItc7wE_SpK5cTQ",
    authDomain: "meu-consultorio-digital.firebaseapp.com",
    projectId: "meu-consultorio-digital",
    storageBucket: "meu-consultorio-digital.appspot.com",
    messagingSenderId: "940558599141",
    appId: "1:940558599141:web:949f3356fd50c09d93e50c",
    measurementId: "G-8PQQVB7EY5"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
</script>
