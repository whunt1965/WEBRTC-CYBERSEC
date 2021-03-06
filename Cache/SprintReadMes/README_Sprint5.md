# SPRINT 5 - Exploiting a TURN server
In Sprint 5, we explored how a malicious party might compromise the information collected by a TURN server.

## Background

### What is a TURN server?

A TURN (**T**raversal **U**sing **R**elay around **N**AT) server is used for relaying network traffic. In a WebRTC context, a TURN server is utilized when a direct Peer-to-Peer connection is not possible, and instead the TURN server serves as intermediary to send packets (media streams, data, etc.) between peers. The below image shows how a TURN server may be used (in addition to STUN servers) as part of a WebRTC session.

<div align="center"><a href="url"><img src="https://github.com/whunt1965/WEBRTC-CYBERSEC/blob/main/turn.jpg" align="center"></a>
  
  *Source: reproduced by Apollo based on https://stackoverflow.com/questions/12708252/how-does-webrtc-work*</div>
  
### Turn Server Configurations
In this folder, we included our turn server configurations for our WebRTC project. The two listening ports coturn uses are port 3478 and port 5349, which listens to TCP/UDP traffic and TCP over TLS traffic respectively. The external IP address of our server is specified in the configuration since our server is behind NAT. The fingerprint option is enabled to add fingerprints from WebRTC into TURN messages. We also specify a domain name we bought in case we want to attach this server to a public DNS. 

When the client tries to communicate with the CoTurn server, the client needs a way to identify themselves for security. Coturn also solves this by allowing two types of credential methods, Time-Limited Credentials Mechanism and Long Term Credentials Mechanism. Time-Limited Credeitial generates a dynamic username and password that expires after a certain period of time. Long Term Crediential is utilized in our project as it uses the defined username and password in the configuration file. 

All the TURN and STUN messages that pass through coturn are recorded automatically and stored into a log file. Coturn automatically generate these log files based on different day and time period.  

### Testing TURN Server
To test if our TURN server is implemented correctly, we used Trickle ICE and specified our server's ip address and credentials. According to the webpage, Trickle ICE starts a peer connection with the specified server and starts candidate gathering with a single audio stream. The gathered candidates are shown on the page and users can see each candidate's information. If the STUN server testing is successful, then there will be a srflx (server reflexive) candidate. If the TURN server testing is successful, then relay candidate will be shown. 
  
### Why and how would an attacker compromise a TURN server?
While there are many options for free STUN servers readily available for WebRTC developers (eg, Google's 'stun:stun1.l.google.com:19302'), free TURN servers are not nearly as prevalent. A STUN server simply is used to exchange IP information in order to set up a call and is NOT used to relay media streams (which is done via a direct P2P connection or via TURN server). Thus, the bandwith costs for a STUN server are very low. Meanwhile, a TURN server is responsible for relaying all data between 2 peers, which requires much more bandwith and makes these servers much more expensive to operate. Indeed, [one article we read](https://bloggeek.me/google-free-turn-server/) detailed a stress test they conducted on [testRTC](https://testrtc.com) in which they estimated that 500 users (which is not out of line for a public server) would generate 52Gb of traffic through the server in less than 7 minutes. 

Given this lack of free/readily-available TURN server options, we uncovered a number of posts online, including [this one on GitHub](https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b) providing a list of "free" TURN servers (ie, TURN servers whose URL's and credentials have been published somewhere online) for developers to utilize. 

Indeed, we found one TURN server url/credential combination in particular that was published across multiple different sites (GitHub, StackOverflow,etc.). Out of curiosity, I did a GitHub search on this server and found that it was used in roughly **1000** files on GitHub.

This discovery led to our curiosity of how an attacker might "leak" a compromised TURN server's url/credentials and capture sensitive information from unwitting users of a WebRTC application that "takes advantage" of this free TURN server.

## Attack Exploration

### Set-Up
In setting up our MiTM attack online, we ran into the issue where users who were behind firewalls could not connect via WebRTC. So, to get around these firewalls, we both set up TURN Servers using [coTurn - an open source TURN Server project](https://github.com/coturn/coturn) on Google Cloud Compute engine virtual machines (using previously acquired domain names for each TURN Server). In setting up these TURN servers, we followed a number of different tutorials, but found [this article](https://ourcodeworld.com/articles/read/1175/how-to-create-and-configure-your-own-stun-turn-server-with-coturn-in-ubuntu-18-04) to be the most useful given that we were using Ubuntu systems.

Set-up instructions and an example configuration file are included in the [ExampleConfig folder](https://github.com/whunt1965/WEBRTC-CYBERSEC/tree/main/TurnExploits/ExampleConfig).

### Enabling and Reviewing TURN Logs
After setting up the TURN servers, our first task was to simply see what information we could retrieve. Luckily, our CoTURN server could easily be configured to create a log file (although the location of the log file is not always fixed -- so we had to spend some time on one of our servers tracking it down). 

In reviewing these logs, we immediately noticed that the TURN server did indeed log the (public) IP of individuals utilizing this server as part of a WebRTC session. To ensure these IP's were accurate, we ran our MiTM attack (forcing all data through our TURN servers with the *iceTransportPolicy: "relay"* option in our ICE configuration) and then compared the IP's logged in our TURN server to the public IP's displayed in [VoidSec's WebRTC leak tool](https://ip.voidsec.com). 

To see if we could get additional details on the actual packets relayed by the TURN server (which, while they should be encrypted by default using DTLS, still might have some interesting information), we enabled the Very Verbose Mode on the TURN server. However, while this mode produced an exorbitant amount of diagnostic information, it didn't provide anything useful.

### Parsing the Data
After ensuring that our TURN servers were logging IP's (and reviewing the format of these log files), we decided that we needed an easy way to siphon out the captured IP's from all the other diagnostic information logged by the server. To do so, we wrote Python a pair of Python scripts (included in the [Scripts folder](https://github.com/whunt1965/WEBRTC-CYBERSEC/tree/main/TurnExploits/Scripts) to quickly parse the log files and extract the IP addresses (along with the port number receiving the UDP packets). This first script [parse.py](https://github.com/whunt1965/WEBRTC-CYBERSEC/blob/main/TurnExploits/Scripts/parse.py) simply prints the IP's to the command line and the second script [parsetofile.py](https://github.com/whunt1965/WEBRTC-CYBERSEC/blob/main/TurnExploits/Scripts/parsetofile.py) extracts the IP addresses (and port numbers) and puts them into a file (eliminating duplicates). 

### Exploring Other options to Capture Data through the Server
Although we were able to extract IP addresses and port numbers using the TURN server logs, we decided to explore whether it was possible to get additional information (eg, information on the packets themselves) by using other network sniffing tools.

#### TCPdump
First, we installed the [tcpdump tool](https://www.tcpdump.org) on the virtual machine hosting our TURN server. We then opened a WebRTC session (forcing all information through our TURN server), set tcpdump to capture all packets passed through the port on which our TURN server is listening, and wrote all information that tcpdump captured to a file. While this did capture the IP addresses (and ports) sending/receiving packets, it provided little new information (even when we enabled increased verbosity and other settings required to provide additional insight. The main additional information that TCPdump provided was a network provide (and extension indicating location) on one of the IP addresses.

#### TShark
After getting nothing new from TCPdump, we turned to [TShark](https://www.wireshark.org/docs/man-pages/tshark.html), which is the command line version of the [WireShark](https://www.wireshark.org) networking sniffing tool. After trying various settings, we were able to extract more information on the packets (eg, packet size, timestamps, etc.), but (as we expected) all packet data was unreadable. Likely, this is because WebRTC data streams are encrypted by default, so the packets the TURN server relays would not be readable without breaking the encryption. 

We will show a (redacted) example of a captured packet in class. 

#### Wireshark
After realizing we needed more capabilities than TShark could provide (specifically, the ability to graph packet data through our TURN server), we decided to enable a GUI on our VM by following [this guide](https://cloud.google.com/solutions/chrome-desktop-remote-on-compute-engine) so that we could install and use Wireshark. Specifically, we used wireshark to filter the packets we captured to only those of interest (ie, the packets passed between WebRTC users) and plot a graph of packet features to see changes in the data transmitted as we altered the media we shared through our WebRTC application (eg, muting audio/video). This is discussed in further depth in the "Gleaning Information from Captured Packets" section below.  

### Exploration of how this Data could be Used by an Attacker
After understanding what data could be captured by our TURN server, we sought to understand how this information could potentially be used by an attacker.

#### Cataloguing IP Addresses and Open Ports
One of the most obvious privacy "loopholes" that a malicious TURN server could exploit is that users' IP addresses (and open ports accepting UDP packets) can be easily identified and logged. Interesting, even if a user is using a VPN (or even theoretically, a Tor browser), the TURN server will still capture the user's real (public) IP address. While the IP address leakage may be more of a privacy issue than a security issue, if an attacker knows which users (or group of users) are using the TURN server, capturing their IP address might provide useful information (eg, internet service provider, location, etc.) for another attack (such as a social engineering exploit). 

In addition to the IP address, we were also able to capture the (UDP) port numbers through which the data stream was passing during a WebRTC session. We discussed this with one of our cybersecurity professors, and since these are ports used to pass data through the firewall, we theorized that it might be possible to send packets to these ports (which ostensibly should pass through the firewall) and glean information on a user's internal network by viewing responses. We experimented with this (using netcat to scan the IP address/port combinations we captured and send packets). While were indeed able to connect to these ports (and send data), we were not able to tell whether the data was received on the other side (even when we opened a listener on the target port). 

Thus, ultimately we were unsuccessful in exploiting these captured IPs/port numbers. This of course does not rule out the possibility that such a vulnerability exists, but thus far we have not been able to find the exploit. 

#### Gleaning Information from Captured Packets
While the actual data within each media packet received/relayed by our TURN server is encrypted (using DTLS for dat and SRTP for media streams), a number of studies had mentioned that it might still be possible to get some useful information from observing packet characteristics (eg, packet size, etc.). After speaking with another Professor, we decided to explore how we might capture the size of each packet routed through our TURN server and explore how the size changed as we did things such as remaining silent, continuously talking, etc. 

We therefore configured Wireshark to filter the packets of interest and used its graphing features (with a similar filter) to plot the data passing through our TURN server. The graph below shows a sampling of our results:

<div align="center"><a href="url"><img src="https://github.com/whunt1965/WEBRTC-CYBERSEC/blob/main/Wireshark%20Graph.jpg" align="center"></a></div>

Section 1: Initial connection estabilished between two users, both video and audio stream shared between both users.
Section 2/4: User A turns off audio and video stream while user B leaves audio and video stream on.
Section 5: User A turns off audio and video stream while User B turns off only video while leaving audio on. 

#### Altering Packets
Another suggestion that we received was to explore having our TURN server alter the packets it relayed (eg, holding back packets and sending them at a later time, sending duplicate packets, blocking packets, etc.) with the goal of seeing what would happen in the application. Unfortunately, we have not yet been able to figure out how to reconfigure our CoTURN server to produce this sort of behavior.

## Future Work
Although this class is coming to a close, in the future, we would like to add few additional tweaks to our MiTM attack (see the MiTM folder) to give the attacker more conrol. Specifically, two items we are exploring are:
- A media stream recorder in our WebRTC app that records video and audio from all users (initial version working in local host but need to test online).
- A log file system in our Signal Server that will record all SDP sessions and ICE candidates.


## References
In exploring potential vulnerabilities related to the information we gleaned through our TURN server, we leveraged the following additional references:
* Feher, B., Sidi, L., Shabtai, A., Puzis, R., and Marozas, L. (2018). “WebRTC security measures and weaknesses.” International Journal of Internet Technology and Secured Transactions (IJITST), Vol. 8, No. 1, 2018. https://www.researchgate.net/publication/325589071_WebRTC_security_measures_and_weaknesses (Accessed 9/4/2020).
* Leaver, E. (2015). “A Study of WebRTC Security.” https://github.com/webrtc-security/webrtc-security.github.io (Accessed 9/4/2020).
*	Rescorla, E. (2019) “Security Considerations for WebRTC, draft-ietf-rtcweb-security-12.” https://tools.ietf.org/html/draft-ietf-rtcweb-security-12 (Accessed 9/4/2020).

