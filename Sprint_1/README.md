# Sprint 1

## Project Mission
Conduct an intensive exploration in how WebRTC technologies can be exploited to better understand how malicious hackers might perform attacks.

## Minimum Viable Product (MVP)
As an initial step in this exploration, we will:
* Experiment with WebRTC JavaScript API's to see how they might be be abused
* Create a malicious WebRTC application to take control of user media
* Create a malicious TURN server to execute MiTM attacks

## User Stories
WebRTC is widely available in popular browsers and the technology is becoming increasingly common (WebRTC is used by number of well-known applications, such as Google Hangouts and Facebook Messenger). As such, it's important that even the casual user understand any potential vulnerabilities that the the WebRTC in their browser might have or how malicious Javascript could be used to access user media devices (or capture information such as a user's IP). 

Additionally, as more and more users are turning to WebRTC enabled video conference solutions, it is paramount that individuals and organizations understand how these might technologies might be exploited (for example, how cameras/microphones might be abused or even third parties might intercept sensitive communications).

Our research will attempt to provide some insight into these potential vulnerabilities. 

## Sprint 2 Goals
In Sprint 2, we will seek to:
* Create initial malicious WebRTC application
  * Explore how we can manipulate features such as GetUserMedia() 
  * Areas of exploration:
   * Forcing access to camera/microphone
   * Retaining camera/microphone access when user leaves page
   * Signaling to third party without user’s knowledge
* Further explore and begin working on TURN server to execute MiTM attack in later Sprints

## Technologies to be Used
This project will leverage a number of technologies. In particualar, we will make heavy use of Javascript (as many of the WebRTC API's are JS API's). Moreover, for Sprint 2 studies, we will leverage a basic WebRTC application built through a (Firebase + WebRTC CodeLab)[https://webrtc.org/getting-started/firebase-rtc-codelab] as a starting point for our malicious WebRTC application. 

## Development Environment
For this project, we will use basic IDE's for scripting as well as specific platforms for particular WebRTC exploits we explore (eg, Firebase for our malicious application, and a Virtual Machine to host our malicious TURN server).

## Literature Review
Our Project builds on the extensive literature available on WebRTC security (which we explored in teh initial phase of the project). A non-comprehensive list of key works that we've analyzed is included below:
* Aumasson, JP and Verview, M. “HUNTING FOR VULNERABILITIES IN SIGNAL - HITBSECCONF2017 AMSTERDAM.” https://conference.hitb.org/hitbsecconf2017ams/materials/D2T1%20-%20Markus%20Vervier%20-%20Hunting%20for%20Vulnerabilities%20in%20Signal.pdf (Accessed 9/11/2020).
* De Groef, W., Subramaniam, D., Johns, M., Piessens, F., Desmet, L. (2016). “Ensuring endpoint authenticity in WebRTC peer-to-peer communication.” https://core.ac.uk/download/pdf/34663061.pdf (Accessed 9/7/2020).
* Feher, B., Sidi, L., Shabtai, A., Puzis, R., and Marozas, L. (2018). “WebRTC security measures and weaknesses.” International Journal of Internet Technology and Secured Transactions (IJITST), Vol. 8, No. 1, 2018. https://www.researchgate.net/publication/325589071_WebRTC_security_measures_and_weaknesses (Accessed 9/4/2020).
* Hancke, P. (2018). “Let’s get better at fuzzing in 2019 – here’s how.” https://webrtchacks.com/lets-get-better-at-fuzzing-in-2019-heres-how/ (Accessed 9/11/2020).
* Johnston, Alan (2015). “WebRTC and Man in the Middle Attacks.” https://webrtchacks.com/webrtc-and-man-in-the-middle-attacks/ (Accessed 9/8/2020).
* Leaver, E. (2015). “A Study of WebRTC Security.” https://github.com/webrtc-security/webrtc-security.github.io (Accessed 9/4/2020).
* Li, Vickie (2019). “Hacking the Same-Origin Policy.” Medium. https://medium.com/swlh/hacking-the-same-origin-policy-f9f49ad592fc (Accessed 9/7/2020).
*	Rescorla, E. (2019) “Security Considerations for WebRTC, draft-ietf-rtcweb-security-12.” https://tools.ietf.org/html/draft-ietf-rtcweb-security-12 (Accessed 9/4/2020).
* Silvanovich, N. (2018) “Adventures in Video Conferencing Part 1: The Wild World of WebRTC.” https://googleprojectzero.blogspot.com/2018/12/adventures-in-video-conferencing-part-1.html (Accessed 9/9/2020).
* Silvanovich, N. (2020) “Exploiting Android Messengers with WebRTC: Part 1” https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-1.html (Accessed 9/5/2020).
* Silvanovich, N. (2020) “Exploiting Android Messengers with WebRTC: Part 2.” https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html (Accessed 9/5/2020).
* Silvanovich, N. (2020) “Exploiting Android Messengers with WebRTC: Part 3.” https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-3.html (Accessed 9/5/2020).
* W3C Interest Group (2019). “Mitigating Browser Fingerprinting in Web Specifications.” https://www.w3.org/TR/fingerprinting-guidance/ (Accessed 9/9/2020).
* Wells, D. (2020) “Abusing WebRTC to Reveal Coarse Location Data in Signal.” Medium. https://medium.com/tenable-techblog/turning-signal-app-into-a-coarse-tracking-device-643eb4298447 (Accessed 9/11/2020).




