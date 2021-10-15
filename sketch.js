let bgColor;
let sb;
let g;
let p;

let lin;
let hor;

let test_circuit

let running = true;

function preload() {
}

function setup() {
  createCanvas(800, 600);

  test_circuit = new Network(3);
  test_circuit.nodes.forEach( n=> n.noise_gen = new PerlinGenerator(dx=0.01,noise_scale=10.0))


  // talk to css, set background color

  bgColor = get_style_prop('--page-color')
  set_style_prop('--page-color',lightenColor(bgColor, .9))
  // set up GUI elementsi
  p = new Slider2D(width/3, height/2)
  lin = new Slider1D(width/4, height/2, is_vertical=true)
  console.log('was vertical, now horiz')
  hor = new Slider1D( width/3+50, height/2+100, is_vertical=false)

  //g = new GaussianGenerator(0,1);
  g = new PerlinGenerator( dx = 0.01, noise_scale = 1.0 );
  //g = new PoissonGenerator( .01 );
  //g = new MultiPoissonGenerator( .01, 1000 );
  sb = new SignalBuffer(0);
  sb.set_from_array(g.gen(5000, true));

//  print(g.gen(100))

  sim_speed = 10;
}


function draw() {
  background( bgColor );

  update_all_ui();
  show_all_ui();
  
  if ( running ){
    //g.sigma = abs(p.getValue().y);
    //g.lambda = map( abs(p.getValue().y), 0, 5, 0, .1);
    g.noise_scale = map( p.getValue().y, -5, 5, 0.05, 2.0);
    
    Array(sim_speed).fill().forEach( _=> {
      //sb.cycle_in( g.gen_sample(true) );
      sb.cycle_in( g.gen_sample() );
    });
    test_circuit.sim();
  }
  push()
  colorMode( HSB, 360, 100, 100 );
  stroke( color( 270, 30, 30 ) );
  //strokeWeight(2);
  //sb.plot( p.position_constraints.xcon.max, p.position_constraints.ycon.center(), 0.1, -5);
  //sb.plot( p.position_constraints.xcon.max, p.position_constraints.ycon.max, 0.1, -1);
  sb.plot( p.position_constraints.xcon.max, p.position_constraints.ycon.max, 0.1, -100);
  let net_scale = -20;
  test_circuit.plot_node(0, width/4,height-150 ,1, net_scale ) 
  test_circuit.plot_node(1, width/4,height-100 ,1, net_scale ) 
  test_circuit.plot_node(2, width/4,height-50 ,1, net_scale ) 
  pop()
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

