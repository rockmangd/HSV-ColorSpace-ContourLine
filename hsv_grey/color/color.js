const hueMax = 359;
const hueMin = 0;
// Saturation
// Value
const grayWeightR = 2989;
const grayWeightG = 5870;
const grayWeightB = 1140;
const weightRate = 10000;

function rgb2Hsv(r, g, b) {
    let min = Math.min(r, g ,b), max = Math.max(r, g, b);
    let h, s, v = max / 255;
    if (min == max) {
        h = 0;
    } else {
        let tmp;
        if (max == r) {
            tmp = g - b;
            tmp = tmp / (max - min);
            if (tmp < 0) {
                tmp += 6;
            }
        } else if (max == g) {
            tmp = b - r;
            tmp = tmp / (max - min);
            tmp += 2;
        } else {
            tmp = r - g;
            tmp = tmp / (max - min);
            tmp += 4;
        }
        h = 60 * tmp;
    }

    if (max == 0) {
        s = 0;
    } else {
        s = 1 - min / max;
    }
    return [h, s, v];
}

function hsv2Rgb(h, s, v) {
    let c = s * v;
    let x = c - Math.abs(c * ((h / 60) % 2 - 1));
    let m = v - c;
    let rgb = null;
    if (h < 60) {
        rgb = [c, x, 0];
    } else if (h < 120) {
        rgb = [x, c, 0];
    } else if (h < 180) {
        rgb = [0, c, x];
    } else if (h < 240) {
        rgb = [0, x, c];
    } else if (h < 300) {
        rgb = [x, 0, c];
    } else if (h < 360) {
        rgb = [c, 0, x];
    } else {
        throw `value error: h ${arguments[0]} s ${arguments[1]} v ${arguments[2]}`;
    }
    // console.log(rgb, m, ((h / 60) % 2 - 1), s, v)
    return rgb.map(v => Math.round((v + m) * 255));
}

function rgb2Gray(r, g, b) {
    return (r * grayWeightR + g * grayWeightG + b * grayWeightB) / weightRate;
    // return [parseInt(r * grayWeightR / weightRate).toString(16), parseInt(g * grayWeightG / weightRate).toString(16), parseInt(b * grayWeightB / weightRate).toString(16)];
}
function rgb2GrayRate(r, g, b) {
    return rgb2Gray(r, g, b) / 255;
}
// let r = 158
// let g = 233
// let b = 108
// console.log(rgb2Hsv(r, g, b))
// console.log(hsv2Rgb(...rgb2Hsv(r, g, b)))
// return
window.getLessGrey = function(r, g, b) {
    // let r = 54, g = 194, b = 208;
    let temp = rgb2Hsv(r, g, b);
    // console.log('初始 H:' + temp[0] + ' S:' + temp[1] + ' V:' + temp[2]);
    // let m = rgb2GrayRate(r, g, b);

    let start = new Date().getTime();
    let h = Math.round(temp[0]),
        s = Math.round(temp[1] * 100),
        v = Math.round(temp[2] * 100);
    // let count = 0;
    let result = [];
    let greys = [];
    let deep = 0;
    for(let i = 0; i < 100; i++) { // 横轴
        for (let j = 0; j < 100; j++) { // 纵轴
            if (s == i && v == j) {
                continue;
            }
            let a = hsv2Rgb(h, i/100, j/100);
            let check = Math.round(100 * rgb2GrayRate(...a)); // 灰度
            if (!(check % 10)) {
                greys.push([h, i, j]);
            }
            // let check = Math.round(100 * rgb2GrayRate(...a)); // 灰度
            let value = j - check; // 基础s 减去各个点的灰度
            do {
                if (!result[deep]) {
                    result[deep] = [];
                }
                // if (value > 0.0999 && value < 0.1001) {
                if (value == 10) {
                    // console.log(check, h, i, j, a);
                    result[deep].push([h, i, j]);
                    // count ++;
                }
                // value -= 0.1;
                value -= 10;
                deep += 1;
            } while (value > 9);
            deep = 0;
        }
    }
    // console.log(result);
    console.log(greys);
    let end = new Date().getTime();
    console.log(end - start);
    return {result, greys};
}