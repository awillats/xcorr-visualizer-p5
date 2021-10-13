! Work in progress !

intended to view how correlations between outputs of small networks vary as a function of simple paramters 

notably, this project should import some rendering and generation capability from `circuit-visualizer-p5`
but this project is small enough in scope, it's core pieces should be fine without.
~~~~~~~~
Core expected result:
- 
~~~~~
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

~~~~~~~~~~~~~~~~~~~

project sidegoals 
- could be an opportunity to use a library OTHER THAN p5, particularly for plotting 
	- some mix of p5 for interaction, plotly for plotting?
	- [controlp5](https://github.com/sojamo/controlp5) as a nice gui library
		- has 2D sliders!







