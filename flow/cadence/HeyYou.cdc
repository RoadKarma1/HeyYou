pub contract HeyYou {

    pub var convo: String 

    pub fun updateConvo(updatedConvo: String) {
        self.convo = self.convo + "/n" + updatedConvo
    }

    init() {
        self.convo = "Hey, you!"
    }

}