
/* 
    [A] provide image url and a callback function that receive the rgb value
    [B] provide only an image element and this function return the rgb value
*/ 

AverageImageRGB = function(source, callback) {
    
    var _averageImageRGB = function(imgEl) {
        
        var blockSize = 5, // only visit every 5 pixels
            defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
            canvas = document.createElement('canvas'),
            context = canvas.getContext && canvas.getContext('2d'),
            data, width, height,
            i = -4,
            length,
            rgb = {r:0,g:0,b:0},
            count = 0;
            
        if (!context) {
            return defaultRGB;
        }
        
        height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
        width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
        
        context.drawImage(imgEl, 0, 0);
        
        try {
            data = context.getImageData(0, 0, width, height);
        } catch(e) {
            /* security error, img on diff domain */alert('x');
            return defaultRGB;
        }
        
        length = data.data.length;
        
        while ( (i += blockSize * 4) < length ) {
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i+1];
            rgb.b += data.data[i+2];
        }
        
        // ~~ used to floor values
        rgb.r = ~~(rgb.r/count);
        rgb.g = ~~(rgb.g/count);
        rgb.b = ~~(rgb.b/count);
        
        return rgb;
    }
        
    if (callback) { 
        /* image url provided, need to load image first */
        var img = new Image();
        img.onload = function(e) {
            var rgb = _averageImageRGB(this);
            callback(rgb);
        }
        img.src = source;
    } else { 
        /* image element provided */
        return _averageImageRGB(source);
    }
}