# Experimental

# PiCast 0.1
> Transform your Raspberry Pi into a streaming device.
Cast videos from mobile devices or computers to your TV.

## Supported services
Works with all youtube-dl supported websites: http://rg3.github.io/youtube-dl/supportedsites.html (YouTube, SoundCloud, Dailymotion, Vimeo, etc...) and also any direct link to mp3, mp4, avi and mkv file.

You can also cast playlists from Youtube or Soundcloud.

## How to install (Raspberry Pi side)

```
wget https://raw.githubusercontent.com/PiCast/server/master/setup.sh && sudo sh setup.sh
```
That's it.

The installation script will:
- Download PiCast and install the necessary dependencies
- Autostart PiCast at boot (added to /etc/rc.local)
- Reboot

You can review the [install script](https://github.com/PiCast/server/blob/master/setup.sh).


On any device connected to the same network as you Pi, you can visit the page:
```
http://raspberrypi.local:2020/
```
Note that you can "Add to homescreen" this link
 
You can also use the Android application (link to Playstore at the top of the page)

## Cast videos from computer

Works on Linux, Mac OS, and Windows (Python needed)

**Download it**

```
wget https://raw.githubusercontent.com/PiCast/server/master/cast.py
```

**Use it**

```
python cast.py video.mkv
```

If subtitles with the same name as the video are found, they will be automatically loaded.

## Uninstall
Remove reference to PiCast.sh in /etc/rc.local

Delete the /opt/piCast/ folder.
