const fs = require('fs');
const { Jimp } = require('jimp');

async function main() {
  try {
    const image = await Jimp.read('./public/img/logo.png');
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If the pixel is close to white, make it transparent
      if (r > 230 && g > 230 && b > 230) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0
      }
    });

    image.write('./public/img/logo_transparent.png', () => {
      console.log("Success!");
    });
  } catch (err) {
    console.error(err);
  }
}

main();
