
🚧  Work in progress 🚧  
View how correlations between outputs of small networks vary as a function of circuit parameters
![preview of interface](assets/example_screenshot.png)

## Upcoming Features: 🔮
- [ ] Computing ["coincidence index"](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0027431) as a measure of connectivity
  - need to verify normalization of cross-correlations
  - highlight significant connections   
  - add axis labels for xcorr lags
- [ ] Edittable circuit structure ( see [circuit-visualizer-p5]()https://github.com/awillats/circuit-visualizer-p5)
  - [x] better visualization of current circuit structure 
- [~] Dropdown menu for noise models
    - for now, cycle through with `n`
- [ ] Edittable buffer length for cross-correlation
- [ ] Exportable quantitative results
- [ ] include autoregressive dynamics
     - for now, Perlin noise setting reasonably approximates nodes with autoregression

## known minor bugs: 🐞
- occasional visual glitch with cross-correlations
  - might be related to switching between models/settings?
- Poisson noise model is additive, but doesn't respect non-negativity

## Early observations: 🔍 
- finer auto-correlations mean easier connectivity inference
- impact of variances on identifiability depends strongly on...
  - which connection is being examined
  - inputs and outputs to that connection
  - ( *stay tuned for a more general hypothesis on relationship between ground truth structure, variance, and Signal-to-noise ratio for Identifiability* )  
- how you normalize matters more when signals are more different from each other  
  - (i.e. normalizing in reciprocal circuits)
  - buffer lenghts longer than ~2k(5k) significantly slow-down script
      - likely *computing* xcorr not rendering it

- reciprocal circuits with STRONG-ish weights (0.6 < |w| < 1) ...>>
  - circuit was A<=>B->C 
      - w = 0.9, 0.8, -0.7
      - |w| > 1 leads to instability
  - exhibit harmonics in xcorr
      - multiples of base syn. delay
  - also have xcorr mirrored at positive and negative lags
  - harmonics in autocorr bleed over, even into non-recurrent links!
  - longer delays make harmonics easier to separate 
  - resonance may put higher demand on proper normalization
  - inhibitory weights are surprisingly similar to excitatory weights in this setting
- reciprocal circuits with WEAK weights (0.1 < |w| < .6) ...>>
    - confirmed for w = 0.2, 0.4
  - xcorr behaves much more simply, can be interpretted much like non-reciprocal case 

### Simple findings:
- delay has predictable signature on xcorr  
  - (if autocorr is minimal, influence is delta function)

## Repo organization: 🗂️
core files / UI:  
- `sketch.js` the heart of the demo
- `index.html` just handles page structure and imports 
- `style.css` sets color scheme and text size 
- `ui-node.js` used for interactive parameter sliders, extends `dragPoints` from [dynamics-visualizer-p5](https://github.com/awillats/dynamics-visualizer-p://github.com/awillats/dynamics-visualizer-p5)  
notes:  
- `README.md` landing page / intro
- `TASKS.md` semi-organized to-do list
- `DEVNOTES.md` unfiltered ramblings about what to do next  
computational methods:
- `signal-generation.js` generates random signals
  - has Gaussian, Poisson, and Perlin noise models for now
- `signal-analysis.js` computes cross-correlations
- `network-simulation.js` 
  - extends AdjMat from [circuit-visualizer-p5](https://github.com/awillats/circuit-visualizer-p5/blob/main/AdjMat.j://github.com/awillats/circuit-visualizer-p5/blob/main/AdjMat.js)   
key libraries:
- [p5js](https://p5js.org/) for graphics and interactivity
- [numjs](https://github.com/nicolaspanel/numj ) for some math
- [markdown-it](https://markdown-it.github.io/) for rendering markdown


## Related projects: 
- 🕸️ circuit-visualizer-p5 [code](https://github.com/awillats/circuit-visualizer-p5), [demo](https://awillats.github.io/circuit-visualizer-p5/)
- 🌀 dynamics-visualizer-p5 [code](https://github.com/awillats/dynamics-visualizer-p5), [demo](awillats.github.io/dynamics-visualizer-p5/)

