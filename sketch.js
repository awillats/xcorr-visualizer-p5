let bgColor;
let dark_purple;

let net_t_scale;
let net_scale;

let test_circuit
let n_nodes = 3;

let running = true;

let md;
let explainer_pg;

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




function preload()
{
}
function hsb_mode(){   colorMode( HSB, 360, 100, 100 ); }
function rgb_mode(){   colorMode( RGB, 255); }
function setup()
{
  createCanvas(900, 500);
  // talk to css, set background color
  push();
  hsb_mode();
  dark_purple= color( 270, 80, 40 );
  pop();
  hsb_mode();
  bgColor = get_style_prop('--page-color')
  //set_style_prop('--page-color',lightenColor(bgColor, .9))
  rgb_mode();
  // set up GUI elements
  /*
  p = new Slider2D(width/3, height/2)
  lin = new Slider1D(width/4, height/2, is_vertical=true)
  hor = new Slider1D( width/3+50, height/2+100, is_vertical=false)
  */

  sim_speed = 4;

  xc_len = 18;
  setup_circuit();
  setup_plot_params();
  setup_gui_params();


  explainer_pg = createP('initial text');
  explainer_pg.style('font-size', '12px');
  //explainer_pg.position(50, height-350); 

  md = window.markdownit();
  var result = md.render(loadStrings('EXPLAIN.md'));
  explainer_pg.elt.innerHTML = result;
}

function draw_explainer_text()
{
  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill( get_style_prop('--subtle-text-color') )
  text('hallo', width/2, height/8);
  pop();
}

function draw()
{
  background( bgColor );
  draw_explainer_text(); 
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
}

function setup_gui_params()
{
  noise_sliders = [];
  let slider_x = corr_left-DY/2;
  let slider_len = 15;
  function gen_slider(i, y)
  {
    let slider =  new Slider1D(slider_x , y ,  wh = slider_len) ;
    slider.hw = 10;
    slider.set_constraints( new LinearConstraint(0,5) )
    //slider.ondrag_callbacks.push( () => console.log( slider.getValue()) );
    slider.ondrag_callbacks.push( () => set_net_noise(i, slider.getValue().y ) );
    
    noise_sliders.push( slider )
  }
  for (let i = 0; i< n_nodes; i++)
  {
    gen_slider( i, MID_PLOT + i*DY)
  }
}

function set_net_noise(node_id, noise_val)
{
  //this should get moved into Network class implementation
  test_circuit.nodes[node_id].noise_gen.sigma =  noise_val;
}

function setup_circuit()
{
  overall_delay = 3.0;
  overall_weight = 1.0;
  test_circuit = new Network(3, w = overall_weight, d = overall_delay);

  //test_circuit.weights.scale( 1 );
  //test_circuit.delays.scale( 2.0 );
  //test_circuit.reset_nodes( rand_noise = true );

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
    strokeWeight(1);
    stroke(255);
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

