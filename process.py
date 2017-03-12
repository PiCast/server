import youtube_dl
import os
import sys
import threading
import logging
import json
import subprocess
import re
from pprint import pprint

with open('picast.conf') as f:
    config = json.load(f)
logger = logging.getLogger("PiCast")
volume = 0
currently_playing = {}


def launchvideo(url, sub=False):
    setState("2")

    os.system("echo -n q > /tmp/cmd &")  # Kill previous instance of OMX

    if config["new_log"]:
        os.system("sudo fbi -T 1 -a --noverbose images/processing.jpg")

    logger.info('Extracting source video URL...')
    out = return_full_url(url, sub)

    if not out.get('url', False):
        logger.error('Error getting video url')
    else:
        logger.info("Full video URL fetched.")

    thread = threading.Thread(target=playWithOMX, args=(out, sub,))
    thread.start()

    os.system("echo . > /tmp/cmd &")  # Start signal for OMXplayer


def queuevideo(url, onlyqueue=False):
    logger.info('Extracting source video ({url}) URL, before adding to queue...'.format(url=url))

    out = return_full_url(url, False)

    if not out.get('url', False):
        logger.error('Error getting video url')
        return
    else:
        logger.info("Full video URL fetched.")

    if getState() == "0" and onlyqueue is False:
        logger.info('No video currently playing, playing video instead of adding to queue.')
        thread = threading.Thread(target=playWithOMX, args=(out, False,))
        thread.start()
        os.system("echo . > /tmp/cmd &")  # Start signal for OMXplayer
    else:
        if out is not None:
            with open('video.queue', 'a') as f:
                f.write(json.dumps(out) + '\n')


def return_full_url(url, sub=False):
    logger.info("Parsing source url for " + url + " with subs :" + str(sub))

    if (url[-4:] in (".avi", ".mkv", ".mp4", ".mp3")) or (sub) or (".googlevideo.com/" in url):
        logger.info('Direct video URL, no need to use youtube-dl.')
        return {'url': url}

    ydl = youtube_dl.YoutubeDL({'logger': logger, 'noplaylist': True,
                                'ignoreerrors': True})  # Ignore errors in case of error in long playlists
    with ydl:  # Downloading youtub-dl infos
        result = ydl.extract_info(url, download=False)  # We just want to extract the info

    if result is None:
        logger.error("Result is none, returning none. Cancelling following function.")
        return None

    if 'entries' in result:  # Can be a playlist or a list of videos
        video = result['entries'][0]
    else:
        video = result  # Just a video
    slow = config["slow_mode"]

    if "youtu" in url or video.get('extractor') == 'youtube':
        if slow:
            for i in video['formats']:
                if i['format_id'] == "18":
                    logger.debug("Youtube link detected, extracting url in 360p")
                    video['url'] = i['url']
                    return video
        else:
            logger.info('CASTING: Youtube link detected, extracting url in maximal quality.')
            for fid in ('22', '18', '36', '17'):
                for i in video['formats']:
                    if i['format_id'] == fid:
                        logger.debug('CASTING: Playing highest video quality ' + i['format_note'] + '(' + fid + ').')
                        video['url'] = i['url']
                        return video
    elif "vimeo" in url or video.get('extractor') == 'vimeo':
        if slow:
            for i in video['formats']:
                if i['format_id'] == "http-360p":
                    logger.debug("Vimeo link detected, extracting url in 360p")
                    video['url'] = i['url']
                    return video
        else:
            logger.debug('Vimeo link detected, extracting url in maximal quality.')
            return video
    else:
        logger.debug('Video not from Youtube or Vimeo. Extracting url in maximal quality.')
        return video


def playlist(url, cast_now):
    logger.info("Processing playlist.")

    if cast_now:
        logger.info("Playing first video of playlist")
        launchvideo(url)  # Launch first vdeo
    else:
        queuevideo(url)

    thread = threading.Thread(target=playlistToQueue, args=(url,))
    thread.start()


def playlistToQueue(url):
    logger.info("Adding every videos from playlist to queue.")
    ydl = youtube_dl.YoutubeDL({'logger': logger, 'extract_flat': 'in_playlist', 'ignoreerrors': True})
    with ydl:  # Downloading youtub-dl infos
        result = ydl.extract_info(url, download=False)
        for i in result['entries']:
            logger.info("queuing video")
            if i != result['entries'][0]:
                queuevideo(i['url'])


def playWithOMX(url, sub):
    global currently_playing
    logger.info("Starting OMXPlayer now.")
    currently_playing = url
    setState("1")
    width = 800
    height = 480
    win = '--win 0,0,' + str(width) + ',' + str(height)

    if sub:
        cmd = "omxplayer -r -o both '" + url['url'] + "' " + win + " --vol " + str(
            volume) + " --subtitles subtitle.srt < /tmp/cmd"
        os.system(cmd)
    elif url is None:
        pass
    else:
        os.system("omxplayer -r -o both '" + url['url'] + "' " + win + " --vol " + str(volume) + " < /tmp/cmd")

    if getState() != "2":  # In case we are again in the launchvideo function
        setState("0")
        with open('video.queue', 'r') as f:  # Check if there is videos in queue
            first_line = f.readline().replace('\n', '')
            if first_line != "":
                first_line = json.loads(first_line)
                logger.info("Starting next video in playlist.")
                with open('video.queue', 'r') as fin:
                    data = fin.read().splitlines(True)
                with open('video.queue', 'w') as fout:
                    fout.writelines(data[1:])
                logger.info(first_line.get('url'))
                thread = threading.Thread(target=playWithOMX, args=(first_line, False,))
                thread.start()
                os.system("echo . > /tmp/cmd &")  # Start signal for OMXplayer
            else:
                logger.info("Playlist empty, skipping.")
                if config["new_log"]:
                    os.system("sudo fbi -T 1 -a --noverbose images/ready.jpg")


def setState(state):
    os.system("echo " + state + " > state.tmp")  # Write to file so it can be accessed from everywhere


def getState():
    with open('state.tmp', 'r') as f:
        return f.read().replace('\n', '')


def getStatus():
    global currently_playing
    if currently_playing.get('url'):
        p = os.popen("./dbuscontrol.sh status").read()
        out = p.split("\n")
        for line in out:
            props = line.split(':', 1)
            if props:
                if props[0] and props[1]:
                    key = props[0].lower().strip()
                    value = props[1].strip()
                    if key == 'duration' or key == 'position':
                        value = int(value) / 1000 / 1000
                    currently_playing[key] = value
    return currently_playing


def getPlaylist():
    currently_playing['queue'] = []
    with open('video.queue', 'r') as f:
        for line in f:
            if line != '':
                data = json.loads(line)
                currently_playing['queue'].append(data)
    f.close()
    return currently_playing['queue']


def setVolume(vol):
    global volume
    if vol == "more":
        volume += 300
    if vol == "less":
        volume -= 300
