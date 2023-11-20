import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
const CryptoJS = require("crypto-js");

//INTERNAL IMPORT
import {
  ChechIfWalletConnected,
  connectWallet,
  connectingWithContract,
} from "../Utils/apiFeature";

export const ChatAppContect = React.createContext();

export const ChatAppProvider = ({ children }) => {
  //USESTATE
  const [account, setAccount] = useState("");
  const [userName, setUserName] = useState("");
  const [friendLists, setFriendLists] = useState([]);
  const [friendMsg, setFriendMsg] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [error, setError] = useState("");

  //CHAT USER DATA
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserAddress, setCurrentUserAddress] = useState("");

  const router = useRouter();

  //FETCH DATA TIME OF PAGE LOAD
  const fetchData = async () => {
    try {
      //GET CONTRACT
      const contract = await connectingWithContract();
      //GET ACCOUNT
      const connectAccount = await connectWallet();
      setAccount(connectAccount);
      //GET USER NAME
      const userName = await contract.getUsername(connectAccount);
      setUserName(userName);
      //GET MY FRIEND LIST
      const friendLists = await contract.getMyFriendList();
      setFriendLists(friendLists);
      //GET ALL APP USER LIST
      const userList = await contract.getAllAppUser();
      setUserLists(userList);
    } catch (error) {
      // setError("Please Install And Connect Your Wallet");
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  //READ MESSAGE
  const readMessage = async (friendAddress) => {
    try {
      const contract = await connectingWithContract();
      const read = await contract.readMessage(friendAddress);
      setFriendMsg(read);
    } catch (error) {
      console.log("Currently You Have no Message");
    }
  };

  //CREATE ACCOUNT
  const createAccount = async ({ name }) => {
    console.log(name, account);
    try {
      if (!name || !account)
        return setError("Name And Account Address, cannot be empty");

      const contract = await connectingWithContract();
      console.log(contract);
      const getCreatedUser = await contract.createAccount(name);

      setLoading(true);
      await getCreatedUser.wait();
      setLoading(false);
      window.location.reload();
    } catch (error) {
      setError("Error while creating your account Pleas reload browser");
    }
  };

  //ADD YOUR FRIENDS
  const addFriends = async ({ name, userAddress }) => {
    try {
      if (!name || !userAddress) return setError("Please provide data");
      const contract = await connectingWithContract();
      const addMyFriend = await contract.addFriend(userAddress, name);
      setLoading(true);
      await addMyFriend.wait();
      setLoading(false);
      router.push("/");
      window.location.reload();
    } catch (error) {
      setError("Something went wrong while adding friends, try again");
    }
  };

  //SEND MESSAGE TO YOUR FRIEND
  const sendMessage = async ({
    msg,
    address,
    encryptionAlgorithum,
    privateKey,
  }) => {
    console.log(msg, address, encryptionAlgorithum, privateKey);
    try {
      if (!msg || !address) return setError("Please Type your Message");

      const encryptedMsg = encryptMessage(
        msg,
        encryptionAlgorithum,
        privateKey
      );
      const contract = await connectingWithContract();
      const addMessage = await contract.sendMessage(address, encryptedMsg);
      setLoading(true);
      await addMessage.wait();
      setLoading(false);
      window.location.reload();
    } catch (error) {
      setError("Please reload and try again");
    }
  };

  //Encrypt Message
  const encryptMessage = (message, algorithm, privateKey) => {
    if (algorithm == "" || privateKey == "") {
      return message;
    }
    var encryptedMessage = "";
    if (algorithm === "algorithum1") {
      encryptedMessage = caesarCipherEncrypt(message, privateKey);
      // console.log(caesarCipherDecrypt(encryptedMessage, privateKey));
    } else if (algorithm === "algorithum2") {
      encryptedMessage = vigenereCipherEncrypt(message, privateKey);
      // console.log(vigenereCipherDecrypt(encryptedMessage, privateKey));
    } else if (algorithm === "algorithum3") {
      encryptedMessage = aesEncrypt(message, privateKey);
      // console.log(aesDecrypt(encryptedMessage, privateKey));
    }

    return encryptedMessage;
  };

  //Ceaser cipher Encrypt
  function caesarCipherEncrypt(plainText, keyword) {
    let encryptedText = "";
    for (let i = 0; i < plainText.length; i++) {
      const char = plainText[i];

      if (char === " ") {
        encryptedText += " ";
        continue;
      }

      const shift = keyword.charCodeAt(i % keyword.length) - 97;
      const isUpperCase = char === char.toUpperCase();
      const shiftedChar = String.fromCharCode(
        ((char.toLowerCase().charCodeAt(0) - 97 + shift) % 26) + 97
      );

      encryptedText += isUpperCase ? shiftedChar.toUpperCase() : shiftedChar;
    }
    return encryptedText;
  }

  //Ceaser cipher Decrypt
  function caesarCipherDecrypt(encryptedText, keyword) {
    let decryptedText = "";
    for (let i = 0; i < encryptedText.length; i++) {
      const char = encryptedText[i];

      if (char === " ") {
        decryptedText += " ";
        continue;
      }

      const shift = keyword.charCodeAt(i % keyword.length) - 97;
      const isUpperCase = char === char.toUpperCase();
      const shiftedChar = String.fromCharCode(
        ((char.toLowerCase().charCodeAt(0) - 97 - shift + 26) % 26) + 97
      );

      decryptedText += isUpperCase ? shiftedChar.toUpperCase() : shiftedChar;
    }
    return decryptedText;
  }

  // Vigenere cipher Encrypt
  function vigenereCipherEncrypt(plainText, keyword) {
    let encryptedText = "";
    let keywordIndex = 0;

    for (let i = 0; i < plainText.length; i++) {
      const char = plainText[i];

      if (char === " ") {
        // Handle white spaces by appending them unchanged
        encryptedText += " ";
        continue;
      }

      const keywordChar = keyword[keywordIndex % keyword.length];
      const shift = keywordChar.charCodeAt(0) - 97;
      const isUpperCase = char === char.toUpperCase();
      const shiftedChar = String.fromCharCode(
        ((char.toLowerCase().charCodeAt(0) - 97 + shift) % 26) + 97
      );

      encryptedText += isUpperCase ? shiftedChar.toUpperCase() : shiftedChar;
      keywordIndex++;
    }
    return encryptedText;
  }

  // Vigenere cipher Decrypt
  function vigenereCipherDecrypt(encryptedText, keyword) {
    let decryptedText = "";
    let keywordIndex = 0;

    for (let i = 0; i < encryptedText.length; i++) {
      const char = encryptedText[i];

      if (char === " ") {
        // Handle white spaces by appending them unchanged
        decryptedText += " ";
        continue;
      }

      const keywordChar = keyword[keywordIndex % keyword.length];
      const shift = keywordChar.charCodeAt(0) - 97;
      const isUpperCase = char === char.toUpperCase();
      const shiftedChar = String.fromCharCode(
        ((char.toLowerCase().charCodeAt(0) - 97 - shift + 26) % 26) + 97
      );

      decryptedText += isUpperCase ? shiftedChar.toUpperCase() : shiftedChar;
      keywordIndex++;
    }
    return decryptedText;
  }

  // AES Encryption
  function aesEncrypt(plainText, secretKey) {
    const encrypted = CryptoJS.AES.encrypt(plainText, secretKey).toString();
    return encrypted;
  }

  // AES Decryption
  function aesDecrypt(encryptedText, secretKey) {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, secretKey).toString(
      CryptoJS.enc.Utf8
    );
    return decrypted;
  }

  //READ INFO
  const readUser = async (userAddress) => {
    const contract = await connectingWithContract();
    const userName = await contract.getUsername(userAddress);
    setCurrentUserName(userName);
    setCurrentUserAddress(userAddress);
  };
  return (
    <ChatAppContect.Provider
      value={{
        readMessage,
        createAccount,
        addFriends,
        sendMessage,
        readUser,
        connectWallet,
        ChechIfWalletConnected,
        account,
        userName,
        friendLists,
        friendMsg,
        userLists,
        loading,
        error,
        currentUserName,
        currentUserAddress,
      }}
    >
      {children}
    </ChatAppContect.Provider>
  );
};
