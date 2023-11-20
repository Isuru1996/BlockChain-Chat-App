import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

//INTERNAL IMPORT
import Style from "./Chat.module.css";
import images from "../../../assets";
import { converTime } from "../../../Utils/apiFeature";
import { Loader } from "../../index";

const Chat = ({
  functionName,
  readMessage,
  friendMsg,
  account,
  userName,
  loading,
  currentUserName,
  currentUserAddress,
  readUser,
}) => {
  //USTE STATE
  const [message, setMessage] = useState("");
  const [chatData, setChatData] = useState({
    name: "",
    address: "",
  });
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    setChatData(router.query);
  }, [router.isReady]);

  useEffect(() => {
    if (chatData.address) {
      readMessage(chatData.address);
      readUser(chatData.address);
    }
  }, []);

  // console.log(chatData.address, chatData.name);
  return (
    <div className={Style.Chat}>
      {currentUserName && currentUserAddress ? (
        <div className={Style.Chat_user_info}>
          <Image src={images.accountName} alt="image" width={70} height={70} />
          <div className={Style.Chat_user_info_box}>
            <h4>{currentUserName}</h4>
            <p className={Style.show}>{currentUserAddress}</p>
          </div>
        </div>
      ) : (
        ""
      )}

      <div className={Style.Chat_box_box}>
        <div className={Style.Chat_box}>
          <div className={Style.Chat_box_left}>
            {friendMsg.map((el, i) => (
              <div>
                {el.sender == chatData.address ? (
                  <div className={Style.Chat_box_left_title}>
                    <Image
                      src={images.accountName}
                      alt="image"
                      width={50}
                      height={50}
                    />
                    <span>
                      {chatData.name} {""}
                      <small>Time: {converTime(el.timestamp)}</small>
                    </span>
                  </div>
                ) : (
                  <div className={Style.Chat_box_left_title}>
                    <Image
                      src={images.accountName}
                      alt="image"
                      width={50}
                      height={50}
                    />
                    <span>
                      {userName} {""}
                      <small>Time: {converTime(el.timestamp)}</small>
                    </span>
                  </div>
                )}
                <p key={i + 1}>
                  {el.msg}
                  {""}
                  {""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {currentUserName && currentUserAddress ? (
          <div className={Style.Chat_box_send}>
            <div className={Style.Chat_box_send_img}>
              <Image src={images.smile} alt="smile" width={50} height={50} />
              <input
                type="text"
                placeholder="type your message"
                onChange={(e) => setMessage(e.target.value)}
              />
              {/* <Image src={images.file} alt="file" width={50} height={50} /> */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <select
                  name="encryptionAlgorithum"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "none",
                    borderRadius: "5px",
                    margin: "10px 0",
                    fontSize: "1rem",
                  }}
                  onChange={(e) => setEncryptionAlgorithm(e.target.value)}
                >
                  <option value="select">Encryption Algorithum</option>
                  <option value="algorithum1">Algorithum 1</option>
                  <option value="algorithum2">Algorithum 2</option>
                  <option value="algorithum3">Algorithum 3</option>
                </select>
                <input
                  type="text"
                  placeholder="Private key"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "none",
                    borderRadius: "5px",
                    margin: "10px 0",
                    fontSize: "1rem",
                  }}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
              </div>
              {loading == true ? (
                <Loader />
              ) : (
                <Image
                  src={images.send}
                  alt="file"
                  width={50}
                  height={50}
                  onClick={() =>
                    functionName({
                      msg: message,
                      address: chatData.address,
                      encryptionAlgorithum: encryptionAlgorithm,
                      privateKey: privateKey,
                    })
                  }
                />
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Chat;
