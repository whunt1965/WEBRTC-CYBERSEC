# Conducting a MiTM Attack on a WebRTC application (Part 2 - Taking the Application Online)
This Sprint involved our efforts to deploy our MiTM attack as an online WebRTC application.

## Going Live Online

After successfully deploying the attack on localhost, we attempted to deploy our application online so that we could see if it would work for different users not on the same computer/network. Unfotunately, this proved to be a much more arduous task than we initially expected. Below is a summary of our work in this area:

### Set Up and Debugging
Launching our original attack as a Google Cloud Platform application involved a number of additional configuration steps (a basic summary of launching a js application on the Google Cloud App engine is detailed [here](https://cloud.google.com/appengine/docs/standard/nodejs/quickstart)). Notably, these steps included configuring a .yaml file (to automatically launch the application) and creating a flexible runtime environment (to support Socket.io). 

However, even after launching, the app failed to connect users. We quickly realized we needed a TURN server to get through the firewalls and establish a connection.

<div align="center"><a href="url"><img src="https://github.com/whunt1965/WEBRTC-CYBERSEC/blob/main/turn.jpg" align="center"></a>
  
  *Source: reproduced by Apollo based on https://stackoverflow.com/questions/12708252/how-does-webrtc-work*</div>
  

So, we both set up TURN Servers using [coTurn - an open source TURN Server project](https://github.com/coturn/coturn) on Google Cloud Compute engine virtual machines (using previously acquired domain names for each TURN Server). Although initially our application still would not work, we confirmed that the TURN servers were indeed functioning by both using the [TrickleIce tool](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) and launching the original google code lab (which we used as the baseline code for our attack) on a separate Google Cloud platform App Engine instance (and using our TURN servers to relay traffic).  

After nearly 2 weeks of failing to launch our application, we finally found the bug: an incorrectly assigned boolean that was preventing the attacker from registering Ice Candidates received. Aftr fixing this mistake, we successfully launched the application (again, using our TURN servers to relay the media stream traffic in the connection). 

### App Improvements
After fixing the connection issues, we made a few additional improvements to our "compromised" application to make the attack work a little more seamlessly

* **Room set up:** Because our application relied on a precise sequence of events (user A calls the attacker -> the attacker calls user B -> user B connects with the attacker -> the attacker connects with user A) we had to separate users into separate rooms based on the order in which they joined. While this separation scheme made the attack easier to manage, it proved to be very easy to break if a user disconnected and then reconnected. We therefore modified our signal server code to "intelligently" assign each user to whichever room is empty (rather than based on the order in which they joined). While we are still limited to only 2 callers at a time on the application (plus the man-in-the-middle), we were able to eliminate this clunkiness. 

* **Video Sources:** By default, a user's local video (their own video stream of themselves) is muted. However, in the attacker's case, we want to recieve the audio from both media streams. To accomplish this, we modified the original html of the page (eliminated the "muted" attribute of the local video) and used JS to dynamically mute the localvideo of users A and B (while keeping the attacker's localvideo (their view of A) unmuted. Interestingly, this also fixed a previous bug in our localHost version of the application in which the attacker could not view the videostream from A while using chrome (although the reason behind this fix is still unclear).

### Demo
Demo to be shown in class.

### Next Steps for Sprint 5

Having successfully got our MiTM attack running, we are at a crossroads with the next steps we want to pursue in Sprint 5. We have listed a couple of options below, but would like to have an open discussion.

1. Continue building on our MitM attack. For example, we could try to implement the ability for an attacker to join an ongoing call (rather than have to be in the attack room before the call starts) as well as explore how we might be able to utilize some of the tools for WebRTC session recording(there are a few WebRTC recording libraries available, so it would be interesting to see if these could be integrated into our app and prevent any "recording" icons from showing up on the compromised users' browsers).

2. Continue exploring what information we can log/exploit from our TURN servers. Currently, our logs are not working, but the TURN server should provide some logging of users IP's. Based on our research into TURN servers, since they can be difficult to set up, the ones for which credentials are openly available tend to be aggregated on open source (and ostensibly used by developers). Assuming we can get the logging running (and get something useful from the logs), these might be an interesting "honeypot" for capturing user information.
