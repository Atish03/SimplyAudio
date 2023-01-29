# SimplyAudio
A simple web application to convert video to audio with easy user-interface to add tags and annotations to any timestamp with an easy click.

## Get started

Clone the repository

Go to `server` directory and run

```pip install -r requirements.txt```

then run

```python manage.py runserver```

Then in other shell, Go to `client` directory and run

```npm install```

then run

```npm start```

The application should pop-up on the default browser.

![Homepage for SimplyAudio!](/assets/1.png)

After uploading the file, click dive in

![Audio player!](/assets/4.png)

Click on any waveform to add tag to it, futer click on the add annotation button besides delete button in the tag to add annotation to the tag.

![tags and annotation!](/assets/6.png)

You may export the tags and annotation in form of json by clicking on the export button, the file will be saved in the `server/downloads` direcoty.

Future upgrades

* Allow user to upload the downloaded tags json file and edit those.
* Changing the currently used file storage to database.
* Give option to user to download the audio with wide range of audio codec types and bit-rate.
* Creating user sessions to access the progress on multiple devices.
