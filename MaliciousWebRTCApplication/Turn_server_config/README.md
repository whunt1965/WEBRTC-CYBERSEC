## Register for Domain 
A domain must be registered in order to run STUN/TURN server. For this test, we use GoDaddy to register our domain. 

## Coturn Installation

```bash
sudo apt install coturn
sudo vim /etc/default/coturn
```


Undocumment the following line to start up Coturn
```bash
TURNSERVER_ENABLED=1
```


## Coturn Configuration

```bash
sudo nano /etc/turnserver.conf
```

Change the following settings in the configuration file, use Crtl+W to search for these key words

```bash
listening-port=3478
tls-listening-port=5349
fingerprint
lt-cred-mech
total-quota=100
stale-nonce=600
user=<YOUR-USER>:<YOUR-PASSWORD>
server-name=<yourdomain.com>
realm=<yourdomain.com>
userdb=/var/lib/turn/turndb
user=attitudemarketing:password
cert=cert.crt
pkey=private.key
no-stdout-log
min-port=10000
max-port=20000
log-file=/var/log/turnserver.log
verbose
```

The following command is an options to create users that access turn server
```bash
turnadmin -k -u <YOUR-USER> -p <YOUR-PASSWORD> -r <yourdomain.com>
```

Restart coturn after all the configurations are set
```bash
sudo service coturn restart
```


Also be sure to configure firewall
```bash
sudo ufw allow 3478/tcp
sudo ufw allow 80
sudo ufw allow 433
sudo ufw enable
```


## Testing

Use Trickle-Ice testing tool provided by Webrtc to make use that it is up and running

```bash
STUN or TURN URI : turn:<YOUR_PUBLIC_IP_ADDRESS>:3478
TURN username: <YOUR_USERNAME>
TURN password: <YOUR_PASSWORD>
```