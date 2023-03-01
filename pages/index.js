import Head from 'next/head'
import { useEffect, useState } from 'react'

import React from "react"
import { ChatFeed, ChatBubble, BubbleGroup, Message } from "react-chat-ui"

import Chat2 from "./api/chat.js";


import styles from '../styles/Home.module.css'
import * as fcl from "@onflow/fcl"
import "../flow/config.js"

export default function Home() {
  const [user, setUser] = useState({ loggedIn: false });
  const [convo, setConvo] = useState('');
  const [newReply, addReply] = useState('');

  const users = {
    0: "You",
    Mark: "Mark",
    2: "Evan"
  };
  
  const customBubble = props => (
    <div>
      <p>{`${props.message.senderName} ${props.message.id ? "says" : "said"}: ${
        props.message.message
      }`}</p>
    </div>
  );
  
  class Chat extends React.Component {
    constructor() {
      super();
      this.state = {
        messages: [
          new Message({ id: "Mark", message: "Hey guys!", senderName: "Mark" }),
          new Message({
            id: 2,
            message: (
              <p>
                <span>11:50:</span>Hey! Evan here. react-chat-ui is pretty dooope.
              </p>
            ),
            senderName: "Evan"
          })
        ],
        useCustomBubble: false,
        curr_user: 0
      };
    }
  
    onPress(user) {
      this.setState({ curr_user: user });
    }
  
    onMessageSubmit(e) {
      const input = this.message;
      e.preventDefault();
      if (!input.value) {
        return false;
      }
      this.pushMessage(this.state.curr_user, input.value);
      input.value = "";
      return true;
    }
  
    pushMessage(recipient, message) {
      const prevState = this.state;
      const newMessage = new Message({
        id: recipient,
        message,
        senderName: users[recipient]
      });
      prevState.messages.push(newMessage);
      this.setState(this.state);
    }
  
    render() {
      return (
        <div className="container">
          <div className="chatfeed-wrapper">
            <ChatFeed
              chatBubble={this.state.useCustomBubble && customBubble}
              maxHeight={250}
              messages={this.state.messages} // Boolean: list of message objects
              showSenderName
            />
  
            <form onSubmit={e => this.onMessageSubmit(e)}>
              <input
                ref={m => {
                  this.message = m;
                }}
                placeholder="Type a message..."
                className="message-input"
              />
            </form>
  
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <button
                style={{
                  ...styles.button,
                  ...(this.state.curr_user === 0 ? styles.selected : {})
                }}
                onClick={() => this.onPress(0)}
              >
                You
              </button>
              <button
                style={{
                  ...styles.button,
                  ...(this.state.curr_user === "Mark" ? styles.selected : {})
                }}
                onClick={() => this.onPress("Mark")}
              >
                Mark
              </button>
              <button
                style={{
                  ...styles.button,
                  ...(this.state.curr_user === 2 ? styles.selected : {})
                }}
                onClick={() => this.onPress(2)}
              >
                Evan
              </button>
            </div>
            <div
              style={{ display: "flex", justifyContent: "center", marginTop: 10 }}
            >
              <button
                style={{
                  ...styles.button,
                  ...(this.state.useCustomBubble ? styles.selected : {})
                }}
                onClick={() =>
                  this.setState({ useCustomBubble: !this.state.useCustomBubble })
                }
              >
                Custom Bubbles
              </button>
            </div>
          </div>
        </div>
      );
    }
  }  

  // This keeps track of the logged in 
  // user for you automatically.
  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
    //loadConversation();
  }, [])

  const loadConversation = () => {
    getConvo();
    console.log("here");
  }

  async function getConvo() {

    const result = await fcl.query({
      cadence: `
      import HeyYou from 0xDeployer

      pub fun main(): String {
        return HeyYou.convo
      }
      `,
      args: (arg, t) => []
    });

    setConvo(result);
  }

  async function finishConvo() {
    const transactionId = await fcl.mutate({
      cadence: `
      import HeyYou from 0xDeployer

      transaction(updatedConvo: String) {
        prepare(signer: AuthAccount) {

        }

        execute {
          HeyYou.updateConvo(updatedConvo: updatedConvo)
        }
      }
      `,
      args: (arg, t) => [
        arg(convo, t.String)
      ],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    });
    
    getConvo();

    console.log('Transaction Id', transactionId);
  }

  async function sendReply() {
    console.log('convo', convo);
    console.log('newReply', newReply);

    setConvo(convo + "<div>" + newReply + "</div>");
  }

  return (
    <div className='bg-[#002233] flex flex-col min-h-screen'>
      <Head>
        <title>HEY YOU</title>
        <meta name="description" content="HEY YOU DEMO: FLOW HACKATHON" />
      </Head>
      
      <main className='container mx-auto flex-1 p-5'>
        
        <div className='mb-3 flex  justify-center items-center pr-10 pt-2'>
          <h1 className={styles.sooth}>HEY YOU</h1>
          <div className='ml-5'>{!user.loggedIn ? <button className='border rounded-xl border-[#38E8C6] px-5 text-sm text-[#38E8C6] py-1'
            onClick={fcl.authenticate}>Log In</button> : <button className='border rounded-xl border-[#38E8C6]
            px-5 text-sm text-[#38E8C6] py-1' onClick={fcl.unauthenticate}>Logout</button>}
          </div>
          </div>
        
        <div className='mb-5 flex  justify-center items-center pr-10 pt-2'>
        
          <div className='flex space-x-4 items-center'>
            <h3 className='text-[#38E8C6]'>Address: </h3>
            <h3 className='border px-7 text-center text-[#38E8C6] text-sm py-1 rounded-xl border-[#38E8C6] w-56'>{user.loggedIn ? user.addr : "Please connect wallet -->"}</h3>
          </div>
          
          
        </div>
        
        <div className='flex items-center justify-center max-h-full pt-20'>
          <div className='space-y-5 p-2 w-5/6'>
            
            <div id="textbox_convo" className="max-h-full text-white">
              <div className='justify-left'>Hello?</div>
              <div className='justify-right'>Hey!</div>
              {convo}
            </div>

            <div className="App">
              <Chat />
              {/* <Chat2 /> */}
            </div>
            
            <div className='flex flex-col justify-center space-y-3'>
              <div className='rounded-lg text-center flex flex-row focus:border-2 bg-green-100 border border-[#38E8C6]'>
                <input type="text" placeholder='test' className='rounded-lg px-3' onChange={e => addReply(e.target.value)} />
                <button className='rounded-lg text-sm font-bold text-blue-900 px-4 py-2 bg-[#38E8C6]' onClick={sendReply}>&nbsp; Reply &nbsp;</button>
              </div>
              <button className='rounded-lg text-center text-sm font-bold text-blue-900 py-2 bg-[#38E8C6]' onClick={finishConvo}>Finish</button>
            </div>
          </div>
        </div>

      </main>

      <footer>
        <div className='bg-black flex pt-5 pb-5 justify-center text-white'>
          <div className='w-[80%] flex justify-between items-center'>
            <div className='font-jet text-xs'>2023. All rights reserved.</div>
            <div className='font-jet text-xs'>Created by RoadKarma</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
