import soundfile as sf
import numpy as np

def getWave(fileName):
    data, samplerate = sf.read(fileName)
    data = np.abs(np.array(data)).mean(axis = -1)

    samplerate //= 2

    extra = data.shape[0] % samplerate

    l = extra // 2

    if extra % 2 == 1:
        r = l + 1
    else:
        r = l 

    data = data[l:-r]
    data = data.reshape(int(data.shape[0] / samplerate), samplerate).mean(axis = -1)
    data = np.exp((data * 10))
    data /= np.max(data)

    return list(map(str, (data * 100).astype(np.int16)))