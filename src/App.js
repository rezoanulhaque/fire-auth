import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setnewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    photo: '',
    error: '',
    success: false
  })
  const provider = new firebase.auth.GoogleAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
      .then(res => {
        const { displayName, photoURL, email } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser);
      })
      .catch(err => {
        console.log(err.message);
      })
  }
  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signedOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          photo: '',
        }
        setUser(signedOutUser);
      })
      .catch(err => {
        console.log(err.message);
      })
  }
  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const isPasswordHasNumber = /\d{1}/.test(e.target.value)
      isFieldValid = isPasswordValid && isPasswordHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.email);
        })
        .catch(error => {
          // Handle Errors here.
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
        })
        .catch(function (error) {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }
  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(function () {
      console.log('Update successful.')
    }).catch(function (error) {
      console.log(error)
    });
  }
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign out</button> :
          <button onClick={handleSignIn}>Sign in</button>
      }

      {
        user.isSignedIn && <div>
          <p>Welcome {user.name}</p>
          <p>email: {user.email}</p>
          <img src={user.photo} alt=""></img>
        </div>
      }
      <h1>Our Own Authentication</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p>
      <input type="checkbox" onChange={() => setnewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User Sign Up</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="Your name" required />}
        <br />
        <input type="text" name="email" onBlur={handleBlur} placeholder="Your email address" required />
        <br />
        <input type="password" name="password" onBlur={handleBlur} placeholder="Your password" required />
        <br />
        <input type="submit" value={newUser ? 'Sign up' : 'Sign in'} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'Logged In'} Successfully</p>
      }
    </div>
  );
}

export default App;
