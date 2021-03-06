let bgColor;
let dark_purple;

let net_t_scale;
let net_scale;

let test_circuit;
let n_nodes = 3;
let circuit_str; 

let running = true;
let noise_idx = 0;

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
let w_slider, d_slider;
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
  DEFAULT_W = 0.1;
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
  //console.log( high_color );
  explainer_pg.elt.innerHTML = result;
}

function draw_additional_text()
{
  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize( parseFloat( get_style_prop('--label-text-size') ) )
  fill( get_style_prop('--subtle-text-color') )
  
  text(`circuit:\n${circuit_str}\n noise model:\n${test_circuit.get_noise_type_str()}`, width/4, height*.7);
 

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

  plot_network_edges();
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

  w_slider = new Slider1D( macro_slider_x,                 macro_slider_y, macro_slider_w, false)
  w_slider.set_constraints( new LinearConstraint(-2.5, 2.5) )
  w_slider.set_value( DEFAULT_W );
  w_slider.set_origin( w_slider.position_constraints.center() )
  w_slider.ondrag_callbacks.push( () => {
    reweight_f( w_slider.pos( w_slider.getValue() ) );
  });

  d_slider = new Slider1D( macro_slider_x+2*macro_slider_dw, macro_slider_y, macro_slider_w, false)
  d_slider.set_constraints( new LinearConstraint(0, 8, 1) )
  d_slider.set_value( DEFAULT_D )
  d_slider.ondrag_callbacks.push( () => redelay_f( d_slider.pos( d_slider.getValue()) ) );


}



function set_node_noise_var(node_id, noise_val)
{
  test_circuit.set_node_noise_variance( node_id, noise_val )
}

function transform_all_noise_gen( noise_idx = -1 )
{ 
  //should bundle noise_gen selection into test_circuit method?
  test_circuit.transform_all_noise_gen( noise_gen_type_by_idx( noise_idx ) );
  
  //trigger parameter updates for all noise_gen to set to new vals
  noise_sliders.forEach( (s,idx) => set_node_noise_var( idx, s.getValue().y) );
  //press_all_ui();
  //update_all_ui( true );
}

function setup_circuit(overall_weight = 1.0, overall_delay = 3)
{
  test_circuit = new Network(3, w = overall_weight, d = overall_delay);
  // debug circuits:

  //interesting reciprocal circuit:
  //test_circuit.weights.mat.set(0, 0, 1);
  //test_circuit.weights.mat.set(2, 2, 1);
  //test_circuit.weights.mat = nj.array( [[0,1,0],[1,0,-3],[0,0,0]]); //can this circuit handle reciprocal connections?
  //test_circuit.weights.mat = nj.array( [[0,1,1],[0,0,-3],[1,1,0]]); //can this circuit handle reciprocal connections?
  //test_circuit.weights.scale( -0.75);
  console.log( test_circuit.weights.export_to_str() );
  circuit_str = test_circuit.weights.export_to_str()
    //.replace('\n','  ')
    //test_circuit.get_circuit_str();
}


// Plot / draw functions
function plot_network_edges()
{
  let arrow_color = get_style_prop( '--subtle-text-color' )
  let arrow_right = net_left - DY/4;
  let base_v = createVector(arrow_right, net_h)
  let down_v = createVector(0, dh)
  let up_v = down_v.copy().mult(-1);//createVector(0, -dh)

  let self_arc_angle = (8/6) * PI; //between 0 and PI/2
  let arc_arrow_len = 5
  let self_arc_angle_off = PI/9;

  let del_arc_angle = (self_arc_angle-PI)/2;
  //https://github.com/awillats/circuit-visualizer-p5/blob/6499bf8d79921cad9401ddf529dc5811661c6787/plotFuns.js/#L145
  for (let r=0; r<n_nodes; r++)
  {
    for (let c = 0; c<n_nodes; c++)
    {
      if (test_circuit.weights.mat.get(r,c))
      {
        let r_y = net_h + r*dh;
        let r_x = net_left-DY/2+2;
        if (r==c)
        {
          //draw self loop
          noFill();
          stroke( arrow_color );
          //ellipse( r_x, r_y, DY/2);
          arc( r_x, r_y-DY/3, DY/3, DY/3, PI-del_arc_angle + self_arc_angle_off, del_arc_angle+self_arc_angle_off)
          push()
          translate(r_x, r_y-DY/3)
          rotate(PI/2-del_arc_angle + self_arc_angle_off ) //+2*self_arc_angle_off)
          translate(0, DY/6);

          triangle(0,arc_arrow_len/3, 0,-arc_arrow_len/3, arc_arrow_len,0)
          pop()
        }
        else
        {
          if (r < c)
          {
            //draw arrow on right and down
            r_x += DY/4;
          }
          if (r > c)
          {
            //draw arrow on left and up
            r_x -= DY/4;
          }
          
          drawCurveArrow( createVector(r_x, r_y + Math.sign(c-r)*dh*.1 ),
                          createVector(0, (c-r)*dh - Math.sign(c-r)*dh*.2), 
                          arrow_color );
        }
      }
    }
  }
  //drawCurveArrow(base_v, down_v)
  //line(base_v.x, base_v.y, end_v.x, end_v.y)
}
function plot_network_outputs()
{
  scale_y_by_noise_model(); 
  test_circuit.plot_node(0, net_plot_len , net_left, net_h      , net_t_scale, net_scale ) 
  test_circuit.plot_node(1, net_plot_len , net_left, net_h+dh   , net_t_scale, net_scale ) 
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
    strokeWeight(3);
    //stroke(255);
    stroke( get_style_prop('--ui-face-color') );

    let lag_to_pix =  corr_t_scale/net_t_scale
    let midx = corr_left + dx + (xc_len * lag_to_pix)/2
    let y_axis_bottom = corr_h + dy
    let y_axis_top = corr_h + dy - dh*0.7
    line(midx, y_axis_bottom, midx, y_axis_top);

    // plot additional ticks to mark circuit delays 
    // where we expect XCorr peaks if there's a connection
    strokeWeight(2);
    let current_delay = d_slider.pos( d_slider.getValue() )
    line(midx - current_delay * lag_to_pix , y_axis_top + 5, midx - current_delay * lag_to_pix , y_axis_top);
    strokeWeight( 0.5 );
    line(midx - 2*current_delay * lag_to_pix , y_axis_top + 5, midx - 2*current_delay * lag_to_pix , y_axis_top);
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
}



// UI Functions
function keyPressed(){
  switch(key)
  {
    case ' ':
      running = !running;
      break;

    case 'r':
      test_circuit.weights.randomize_connectivity(2/9);
      test_circuit.weights.set_nonzero_to( w_slider.pos( w_slider.getValue() ) )
      circuit_str = test_circuit.weights.export_to_str()

      test_circuit.reset_nodes();
      break;

    case 'c':
      test_circuit.reset_nodes();
      break;

    case 'N':
      transform_all_noise_gen( ++noise_idx );
      break;
    case 'n':
      transform_all_noise_gen( ++noise_idx );
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

