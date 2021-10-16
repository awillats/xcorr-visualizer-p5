let bgColor;
let dark_purple;

let net_t_scale;
let net_scale;

let test_circuit
let n_nodes = 3;

let running = true;

function preload() {
}

function setup() {
  createCanvas(900, 500);

  test_circuit = new Network(3);

  //interesting reciprocal circuit:
  //test_circuit.weights.mat = nj.array( [[0,1,0],[1,0,-3],[0,0,0]]); //can this circuit handle reciprocal connections?
  test_circuit.weights.scale( -0.75);
  test_circuit.delays.scale(4.0);
  //test_circuit.delays.mat.set(1,2, 5);

/*
  test_circuit.nodes.forEach( n=> {
    n.noise_gen = new PerlinGenerator(dx=0.1,noise_scale=8.0)
    });
  */  
  test_circuit.reset_nodes(rand_noise=true);

  // talk to css, set background color
  push();
  colorMode( HSB, 360, 100, 100 );
  dark_purple= color( 270, 80, 40 );
  pop();
  bgColor = get_style_prop('--page-color')
  set_style_prop('--page-color',lightenColor(bgColor, .9))
  // set up GUI elements
  /*
  p = new Slider2D(width/3, height/2)
  lin = new Slider1D(width/4, height/2, is_vertical=true)
  hor = new Slider1D( width/3+50, height/2+100, is_vertical=false)
  */

  sim_speed = 4;
  net_t_scale = 1;
  net_scale = (test_circuit.nodes[0].noise_gen instanceof PerlinGenerator ? -20 : -5); 

}


function draw() {
  background( bgColor );

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



function plot_network_outputs()
{
  let net_h = height/2 - 75;
  let net_left = 50;
  
  let net_plot_len = 350
  let dh = 50;

  test_circuit.plot_node(0, net_plot_len , net_left, net_h , net_t_scale, net_scale ) 
  test_circuit.plot_node(1, net_plot_len , net_left, net_h+dh , net_t_scale, net_scale ) 
  test_circuit.plot_node(2, net_plot_len , net_left, net_h+2*dh , net_t_scale, net_scale ) 
}
function plot_network_correlations(){
  let corr_left = width/2;
  let corr_h = height/2 - 75;
  
  let xc_len = 50;
  let dh = 50;
  let corr_t_scale = 2*net_t_scale;
  let corr_y_scale = 5*net_scale;
  let dw = xc_len*1.2 * corr_t_scale / net_t_scale;

  stroke(dark_purple);
  strokeWeight(2);

  
  function plot_xcorr(i,j, dx=0, dy=0, k=i)
  {
    let xc;
    if (k == -1 )
    {
      xc = get_xcorr(i,j);
    }
    else
    {
       xc = get_autocrosscorr(i, j, k);
    }

    xc = get_middle(xc, xc_len);
    xc = maxnorm(xc).tolist();
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
  if (key === ' ')
  {
    running = !running;
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

