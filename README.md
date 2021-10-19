
🚧  Work in progress 🚧 

intended to view how correlations between outputs of small networks vary as a function of simple paramters 

notably, this project should import some rendering and generation capability from `circuit-visualizer-p5`
but this project is small enough in scope, it's core pieces should be fine without.

-----

Core expected result:
- (...)

-----

Early Findings
- finer auto-correlations mean easier connectivity inference
- how you normalize matters more when signals are more different from each other (i.e. normalizing in reciprocal circuits)
- buffer lenghts longer than ~2k(5k) significantly slow-down script
   - likely *computing* xcorr not rendering it
- noise variance only matters indirectly
  - likely 

Simple:
- delay has predictable signature on xcorr 
  - (if autocorr is minimal, influence is delta function)

-----

methods requirements
- generate random signals w/ given structural causal model
	- random numbers, delays
	- could use perlin for fun, non-gaussian-ness
- should handle small number of nodes (3-10)
- compute cross-correlation (across window)
	- numjs for convolution and more!
		- https://github.com/nicolaspanel/numjs/blob/3d484374d39f6b47a21b9521acb548c5c8f3458a/README.md
	- math.js for convolution?
	- snippet here: https://gist.github.com/jhurliman/7273803
	- could always do it with a nested for loop
	- with normalization! 
	- is one-step xcorr sufficient?
		- what about 0,1,2 lag?
		- hard to see how to threshold these
	- pick out peak cross-correlations
		- may compute coincidence index 

interactivity requirements
- editable params
	- internal noise per node 
	- weights, delay per edge
    - could visualize weights and delay as a synaptic waveform ?

- could have GUI simply be draggable points
  - with contrained limits, background squares   

- processing GUI libraries
	- [p5.touchgui](https://github.com/L05/p5.touchgui)
		- last updated 2019
		- has some nice elements (slider2d, joystick)
	- [p5.gui](https://github.com/bitcraftlab/p5.gui)
		- recent
		- magic constructors -> likely fast to set up
		- no 2D slider?
	- (x) DOESNT actually work with p5 it seems
    - [ControlP5](http://www.sojamo.de/libraries/controlP5/) classic, clean
		- lots of elements (including slider2d)
		- dropdowns, radial dials
- javascript GUI libraries
  - [oui](https://github.com/wearekuva/oui)
      - has 2d, XYpad
  - [ControlKit]()
    - has 2d slider (XYpad) 
        `panel.addPad(object,propertyKey,options) -> {Panel}`
    - has function plotter!j

  - [Control-Panel](https://github.com/freeman-lab/control-panel)
    - nicely themed, only minimal inputs
  - [simple 2d slider in js, with jQuery?](https://codepen.io/tyler-murphy/pen/tHsAu?editors=1010)
  - [Tweakpane](https://cocopon.github.io/tweakpane://cocopon.github.io/tweakpane/)
    - looks nice, minimal, foldable 
    - [p5 + tweakpane example](https://replit.com/@jgordon510/p5-example-with-tweakpane#script.js)
      - [reddit discussion](https://www.reddit.com/r/p5js/comments/pnkn5s/tweakpane_for_p5js/) 
 - see also graphing libraries
  - [graphica](https://github.com/jagracar/grafica.js)
      - [demos](http://jsfiddle.net/user/jagracar/fiddles/)
visualization requirements
- visual reflection of implicit params like weight, delay 
- color of output signal blends colors of inputs!
- might want some fading trail of previously chosen params 
	- or visual indication of what signal looks like with slider val +/- a bit
- simple equation rendered as latex
-
import requirements
- import graph as from textfield
- render graph as circles
- edit connections via drag and drop
- plot 1D signals `plotWave()`

- colored latex from dynamics-visualizer-p5

-----

project sidegoals 
- could be an opportunity to use a library OTHER THAN p5, particularly for plotting 
	- some mix of p5 for interaction, plotly for plotting?








