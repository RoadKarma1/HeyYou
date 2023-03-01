import HeyYou from "../HeyYou.cdc"

transaction(updatedConvo: String) {
  prepare(signer: AuthAccount) {

  }

  execute {
    HelloYou.updateConvo(updatedConvo: updatedConvo)
  }
}