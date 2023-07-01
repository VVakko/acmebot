# ACMEbot

ACMEbot remotely controllable rover


## Preparing Raspberry Pi 4

The first step is to install the **Ubuntu Server** and pre-configure it according to the [instructions](https://github.com/VVakko/acmebot/wiki/Software) from the wiki.


## Initial Preparing ACMEbot

```sh
# Clone and initialize ACMEbot repository
$ sudo mkdir /opt/acmebot
$ sudo chown `whoami`: -R /opt/acmebot/
$ git clone https://github.com/VVakko/acmebot.git /opt/acmebot/
$ cd /opt/acmebot/
$ sudo make apt-deps-install
$ make venv-init
$ make venv-deps-install

# Run ACMEbot application
$ make run
```


# Libraries 

## JavaScript

For gamepad interactions [joypad.js](https://github.com/ArunMichaelDsouza/joypad.js) (MIT Licensed)

For touchscreen controls [nipplejs](https://yoannmoi.net/nipplejs/) (MIT Licensed)

For socket communications [socket.io](https://socket.io/) (MIT Licensed)


# License

All libraries have his own license, my code and documentation is GPLv3 Licensed.
