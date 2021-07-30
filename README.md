# HSV-color-space-contour-line
Add contour lines on the HSV color space helps count the gray velue of the colors
## Working Process ##
Based on the equation `Gray = 0.2989R + 0.578G + 0.114B`, you can know the gray value of a color. In HSV, each H has a 2d S-V coordinate. Calculate every colors gray in a S-V coordinate, if the `V - gray` equals to the integer multiples of 10, or the gray itself equals to the integer multiples of 10, mark the color out. The reslut will be some contour lines. Based on the contour lines, you can easily find each color's gray in HSV
