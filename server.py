#!/usr/bin/env python

from datetime import timedelta
from functools import update_wrapper
from process import *
import urllib
import logging
import os
from os.path import isfile, abspath, normpath, dirname, join, basename
import sys
import json
from flask import *

with open('picast.conf') as f:
    config = json.load(f)

# Setting log
open('PiCast.log', 'w').close()  # Reset queue
logging.basicConfig(filename='PiCast.log', format="%(asctime)s - %(levelname)s - %(message)s",
                    datefmt='%m-%d %H:%M:%S', level=logging.INFO)
logger = logging.getLogger("PiCast")

# Creating handler to print messages on stdout
root = logging.getLogger()
root.setLevel(logging.DEBUG)

ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
root.addHandler(ch)

if config["new_log"]:
    os.system("sudo fbi -T 1 --noverbose -a  images/ready.jpg")

setState("0")
open('video.queue', 'w').close()  # Reset queue
logger.info('Server successfully started!')

application = Flask(__name__, static_url_path='')

path = normpath(abspath(dirname(__file__)))


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)

    return decorator


# @application.after_request
def response(response, status=200):
    resp = make_response(response, status)
    resp.headers.extend({'Access-Control-Allow-Origin', '*'})


@application.route('/static/<path:path>')
def server_static(path):
    return send_from_directory('static', path)


@application.route('/', methods=['GET'])
@application.route('/remote', methods=['GET'])
def get_index():
    return send_from_directory('static', 'index.html')


@application.route('/stream', methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin='*')
def do_stream():
    url = request.args.get('url')
    logger.debug('Received URL to cast: ' + url)

    if request.args.get('slow', False):
        if request.args['slow'] in ["True", "true"]:
            config["slow_mode"] = True
        else:
            config["slow_mode"] = False
        with open('picast.conf', 'w') as f:
            json.dump(config, f)

    try:
        if ('localhost' in url) or ('127.0.0.1' in url):
            ip = request.environ['REMOTE_ADDR']
            logger.debug('URL containing localhost adress . Replacing with remote ip :' + ip)
            url = url.replace('localhost', ip).replace('127.0.0.1', ip)

        if 'subtitles' in request.args:
            subtitles = request.args['subtitles']
            logger.debug('Subtitles link is ' + subtitles)
            urllib.urlretrieve(subtitles, "subtitle.srt")
            launchvideo(url, True)
        else:
            logger.debug('No subtitles for this stream')
            if ("youtu" in url and "list=" in url) or ("soundcloud" in url and "/sets/" in url):
                playlist(url, True)
            else:
                launchvideo(url, False)
        return "1"
    except Exception, e:
        logger.error('Error in launchvideo function or during downlading the subtitles')
        logger.exception(e)
        return "1"


@application.route('/queue', methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin='*')
def add_queue():
    url = request.args.get('url')

    if request.args.get('slow'):
        if request.args.get('slow') in ["True", "true"]:
            config["slow_mode"] = True
        else:
            config["slow_mode"] = False
        with open('picast.conf', 'w') as f:
            json.dump(config, f)

    try:
        if getState() != "0":
            logger.info('Adding URL to queue: ' + url)
            if ("youtu" in url and "list=" in url) or ("soundcloud" in url and "/sets/" in url):
                playlist(url, False)
            else:
                queuevideo(url)
            return "2"
        else:
            logger.info('No video currently playing, playing url : ' + url)
            if ("youtu" in url and "list=" in url) or ("soundcloud" in url and "/sets/" in url):
                playlist(url, True)
            else:
                launchvideo(url, False)
            return "1"
    except Exception, e:
        logger.error('Error in launchvideo or queuevideo function !')
        logger.exception(e)
        return "0"


@application.route('/video', methods=['GET', 'POST'])
@crossdomain(origin='*')
def control_video():
    control = request.args.get('control')
    if control == "pause":
        logger.info('Command : pause')
        os.system("echo -n p > /tmp/cmd &")
        return "1"
    elif control in ["stop", "next"]:
        logger.info('Command : stop video')
        stopPlaying()
        os.system("echo -n q > /tmp/cmd &")
        return "1"
    elif control == "right":
        logger.info('Command : forward')
        os.system("echo -n $'\x1b\x5b\x43' > /tmp/cmd &")
        return "1"
    elif control == "left":
        logger.info('Command : backward')
        os.system("echo -n $'\x1b\x5b\x44' > /tmp/cmd &")
        return "1"


@application.route('/sound', methods=['GET', 'POST'])
@crossdomain(origin='*')
def control_sound():
    vol = request.args.get('vol')
    if vol == "more":
        logger.info('REMOTE: Command : Sound ++')
        os.system("echo -n + > /tmp/cmd &")
    elif vol == "less":
        logger.info('REMOTE: Command : Sound --')
        os.system("echo -n - > /tmp/cmd &")
    setVolume(vol)
    return "1"


@application.route('/shutdown', methods=['GET', 'POST'])
@crossdomain(origin='*')
def control_shutdown():
    time = request.args.get('time')
    if time == "cancel":
        os.system("shutdown -c")
        logger.info("Shutdown canceled.")
        return "1"
    else:
        try:
            time = int(time)
            if (time < 400 and time >= 0):
                shutdown_command = "shutdown -h +" + str(time) + " &"
                os.system(shutdown_command)
                logger.info("Shutdown should be successfully programmed")
                return "1"
        except:
            logger.error("Error in shutdown command parameter")
            return "0"


@application.route('/status', methods=['GET'])
@crossdomain(origin='*')
def get_status():
    return jsonify(getStatus())


@application.route('/playlist', methods=['GET'])
@crossdomain(origin='*')
def get_playlist():
    return jsonify(getPlaylist())


@application.route('/playlist', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def update_playlist():
    playlist = request.json
    file_content = ''
    for video in playlist:
        file_content += json.dumps(video) + "\n"

    f = open('video.queue', 'w')
    f.write(file_content)
    f.close()
    return "OK"


@application.route('/running', methods=['GET'])
@crossdomain(origin='*')
def webstate():
    currentState = getState()
    logger.debug("Running state as been asked : " + currentState)
    return currentState


application.run(debug=False, host='0.0.0.0', port=2020, use_evalex=False, threaded=True)
