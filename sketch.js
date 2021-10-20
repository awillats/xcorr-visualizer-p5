let bgColor;
let dark_purple;

let net_t_scale;
let net_scale;

let test_circuit
let n_nodes = 3;

let running = true;

let md;
let explainer_pg;
let explainer_txt;

//network params;
let overall_delay ;
let overall_weight ;
/*
let net_weights = [];
let net_noises = [];
*/

let noise_sliders ;
let weight_sliders ;
let delay_sliders ;


//Analysis Params
let xc_len ;

let DEFAULT_W, DEFAULT_D;

// GUI Params
let DY = 50;
let MID_PLOT;

let corr_left;
let corr_h;

let dh ;
let corr_t_scale ;
let corr_y_scale ; // currently needs toning down if Perlin
let dw ;

let net_h ;  
let net_left;
  
let net_plot_len;


let macro_slider_x 
let macro_slider_y 
let macro_slider_w 
let macro_slider_wpad 
let macro_slider_dw 

function preload()
{
  explainer_txt = loadStrings('EXPLAIN.md')
  //requires local server mode:
  // https://github.com/processing/p5.js/wiki/Local-server
}
function hsb_mode(){   colorMode( HSB, 360, 100, 100 ); }
function rgb_mode(){   colorMode( RGB, 255 ); }
function setup()
{
  createCanvas( 900, 500 );

  // talk to css, set background color
  push();
  hsb_mode();
  dark_purple= color( 270, 80, 40 );
  pop();
  hsb_mode();
  bgColor = get_style_prop('--page-color')

  //neither necessary nor sufficient. colorMode seems to dominate
  function color_to_rgbstr(c)
  {
    return `rgb(${red(c)}, ${green(c)} , ${blue(c)})`;
  }
  rgb_mode();
  set_style_prop( '--page-color', color_to_rgbstr(lightenColor(bgColor, .9)) )
  // set up GUI elements
  /*
  p = new Slider2D(width/3, height/2)
  lin = new Slider1D(width/4, height/2, is_vertical=true)
  hor = new Slider1D( width/3+50, height/2+100, is_vertical=false)
  */

  sim_speed = 4;
  DEFAULT_W = 1.0;
  DEFAULT_D = 3;
  xc_len = 24;
  setup_circuit();
  setup_plot_params();
  setup_gui_params();
  setup_explainer_pg();

}
function wrap_html_color(html, colorstr)
{
  return `<span style="color:${colorstr};">${html}</span>`
}

function setup_explainer_pg()
{
  let subtle_color = get_style_prop('--subtle-text-color')
  let high_color = get_style_prop('--highlight-text-color')


  explainer_pg = createP('');
  explainer_pg.style('font-size', '12px');
  explainer_pg.position(50, 20); 
  //markdown-it options: https://markdown-it.github.io/markdown-it/#MarkdownIt.new
  md = window.markdownit().set({html:true, breaks: true});
  explainer_txt
  var result = md.render(explainer_txt.join('\n'));
  result = wrap_html_color(result, high_color);
    //'rgb(120,10,80)')
    console.log( high_color );
  explainer_pg.elt.innerHTML = result;
}

function draw_additional_text()
{
  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize( parseFloat( get_style_prop('--label-text-size') ) )
  fill( get_style_prop('--subtle-text-color') )
  
  text(`current circuit: A-> B-> C chain\n \n current noise model:\n${test_circuit.get_noise_type_str()}`, width/4, height*.7);
 

  text('syn. weight', macro_slider_x, macro_slider_y-DY/2)
  text('syn. delay', macro_slider_x+2*macro_slider_dw ,macro_slider_y-DY/2)

  text('input noise', corr_left-DY/2, 150)

  textStyle(ITALIC);
  textSize(2*parseFloat( get_style_prop('--label-text-size') ) )
  text('A', net_left-DY/2, net_h)
  text('B', net_left-DY/2, net_h + dh)
  text('C', net_left-DY/2, net_h + 2*dh)
  //console.log( corr_left-DY/2)
  pop();
}

function draw()
{
  background( bgColor );
  draw_additional_text(); 
  update_all_ui();
  show_all_ui();
  
  if ( running ){
    
    Array(sim_speed).fill().forEach( _=> {
      test_circuit.sim();
    });
    //test_circuit.sim();
  }

  push()
  stroke( dark_purple );
  plot_network_outputs();
  plot_network_correlations();

  pop()
}

function scale_y_by_noise_model()
{
  let test_noise = test_circuit.nodes[0].noise_gen

  switch (test_noise.constructor)
  {
    case PoissonGenerator:
      let lams = test_circuit.nodes.map(n => n.noise_gen.lambda );
      let max_lam = nj.max(lams); 
      net_scale = (max_lam <= 1 ? -10 : -2);
      break;
   case MultiPoissonGenerator:
      net_scale = -2;
      break;
    case PerlinGenerator:
      net_scale = -8;// test_noise.y_scale;
      break;
    default:
      net_scale = -2;
  }
  return net_scale
 
}
function setup_plot_params()
{
  //layout signal params 
  net_t_scale = 1;
  net_scale = (test_circuit.nodes[0].noise_gen instanceof PerlinGenerator ? -20 : -2); 
  
  corr_t_scale = (100/xc_len)*net_t_scale;
  corr_y_scale = (3)*5*net_scale; // currently needs toning down if Perlin

  MID_PLOT = height/2 - (n_nodes*DY)/2;

  corr_left = width/2;
  corr_h = MID_PLOT;
  
  dh = DY; //50;
  
  dw = xc_len*1.2 * corr_t_scale / net_t_scale;
  
  net_h = MID_PLOT;  
  net_left = DY;
  
  net_plot_len = 7*DY;
  
  macro_slider_x = width/2;
  macro_slider_y = 1.5*DY;
  macro_slider_w = DY;
  macro_slider_wpad = DY;
  macro_slider_dw = macro_slider_w + macro_slider_wpad;
}

function setup_gui_params()
{
  noise_sliders = [];
  let slider_x = corr_left-DY/2;
  let slider_len = 15; //height, in pixels
  let noise_max = 5.0;

  function gen_noise_slider(i, y)
  {
    let slider =  new Slider1D(slider_x , y ,  wh = slider_len) ;
    slider.hw = 10;
    slider.set_constraints( new LinearConstraint( 0, noise_max ) )
    slider.ondrag_callbacks.push( () => set_node_noise_var( i, slider.getValue().y ) );
    noise_sliders.push( slider ) // may be unneccesary
  }

  for (let i = 0; i< n_nodes; i++)
  {
    gen_noise_slider( i, MID_PLOT + i*DY)
  }

  //set up overall weight, delay sliders 


  let reweight_f = (w) => test_circuit.set_nonzero_weights(w)
  let redelay_f = (d) => test_circuit.set_nonzero_delays(d)

  let w_slider = new Slider1D( macro_slider_x,                 macro_slider_y, macro_slider_w, false)
  w_slider.set_constraints( new LinearConstraint(-3.5, 3.5) )
  w_slider.set_value( DEFAULT_W );
  w_slider.set_origin( w_slider.position_constraints.center() )
  w_slider.ondrag_callbacks.push( () => {
    reweight_f( w_slider.pos( w_slider.getValue() ) );
  });

  let d_slider = new Slider1D( macro_slider_x+2*macro_slider_dw, macro_slider_y, macro_slider_w, false)
  d_slider.set_constraints( new LinearConstraint(0, 8) )
  d_slider.set_value( DEFAULT_D )
  d_slider.ondrag_callbacks.push( () => redelay_f( d_slider.pos( d_slider.getValue()) ) );


}



function set_node_noise_var(node_id, noise_val)
{
  test_circuit.set_node_noise_variance( node_id, noise_val )
}

function transform_all_noise_gen( new_noise_gen )
{
  test_circuit.transform_all_noise_gen( new_noise_gen );
  noise_sliders.forEach( (s,idx) => set_node_noise_var( idx, s.getValue().y) );
  //press_all_ui();
  //update_all_ui( true );
  //trigger parameter updates for all noise_gen to set to new vals
}

function setup_circuit(overall_weight = 1.0, overall_delay = 3)
{
  test_circuit = new Network(3, w = overall_weight, d = overall_delay);
  // debug circuits:

  //interesting reciprocal circuit:
  //test_circuit.weights.mat = nj.array( [[0,1,0],[1,0,-3],[0,0,0]]); //can this circuit handle reciprocal connections?
  //test_circuit.weights.scale( -0.75);
/*
  test_circuit.nodes.forEach( n=> {
    n.noise_gen = new PerlinGenerator(dx=0.1, noise_scale=2.0)
    });
  */  
}


// Plot / draw functions
function plot_network_outputs()
{
  scale_y_by_noise_model(); 
  test_circuit.plot_node(0, net_plot_len , net_left, net_h , net_t_scale, net_scale ) 
  test_circuit.plot_node(1, net_plot_len , net_left, net_h+dh , net_t_scale, net_scale ) 
  test_circuit.plot_node(2, net_plot_len , net_left, net_h+2*dh , net_t_scale, net_scale ) 
}
function plot_network_correlations(){

  stroke(dark_purple);
  strokeWeight(2);

  
  function plot_xcorr(i,j, dx=0, dy=0, k=i)
  {
    let xc;
    //compute the cross-correlation
    if (k == -1 ) { xc = get_xcorr(i,j); }
    else { xc = get_autocrosscorr(i, j, k); }
    //process it 
    xc = get_middle(xc, xc_len);
    xc = maxnorm(xc).tolist();
    
    //plot the cross-correlation
    plot1DArray(xc, corr_left + dx, corr_h + dy, corr_t_scale, corr_y_scale); 

    push();
    strokeWeight(2);
    //stroke(255);
    stroke( get_style_prop('--ui-face-color') );
    let midx = corr_left + dx + (xc_len* corr_t_scale/net_t_scale)/2
    line( midx, corr_h+dy, midx, corr_h+dy-dh*.7);
    pop();
  }

  for (let i=0; i<n_nodes; i++)
  {
    for (let j=0; j<n_nodes; j++)
    {
      let k = ( i==j ? -1 : j);
      //need to figure out covention here big time
      plot_xcorr(j, i, dw*i, dh*j, k);
    }
  }
  //plot_xcorr(0,1, 0);
  //plot_xcorr(1,2, dh);
  //plot_xcorr(0,2, 2*dh);
/*
  let xcd = get_middle( get_autocrosscorr( 0, 1, 0), xc_len );
  let xcd2 = get_middle(get_autocrosscorr( 1, 2, 2), xc_len );
  
  plot1DArray(xcd, corr_left , corr_h , corr_t_scale , 20*net_scale);
  plot1DArray(xcd2, corr_left , corr_h+dh , corr_t_scale , 20*net_scale);
  */
  //stroke(255);
  //strokeWeight(2);
  //plot1DArray(ac, width/4, height -10, net_t_scale, 5*net_scale);
}



// UI Functions
function keyPressed(){
  switch(key)
  {
    case ' ':
      running = !running;
      break;

    case 'c':
      test_circuit.reset_nodes();
      break;

    case 'N':
      transform_all_noise_gen( noise_gen_type_by_idx() );
      break;
    case 'n':
      transform_all_noise_gen( noise_gen_type_by_idx() );
      test_circuit.reset_nodes();
      break;

    default:
      console.log( key );
      break;

  }
}
function mousePressed(){
  press_all_ui();
}
function mouseReleased(){
  release_all_ui();
}



// CSS functions 

function set_style_prop( var_name, value ){
  //var style = window.getComputedStyle(document.body)
  var style = document.querySelector( ':root' ).style
  style.setProperty( var_name, value );
}

function get_style_prop( var_name ){
  var style = window.getComputedStyle( document.body )
  return style.getPropertyValue( var_name );
}

