// https://github.com/awillats/circuit-visualizer-p5/blob/main/AdjMat.js


class CircuitMat{
  constructor( n_nodes , mat_gen_fun=false)
  {
    //super(n_nodes);
    this.n_nodes = n_nodes;
    //this.mat = this.binaryToMat('010'+'001'+'000')
    if (mat_gen_fun){
      this.mat = mat_gen_fun(n_nodes);
    }
    else{
      this.mat = gen_chain( n_nodes ); 
    }
    //this.print();
  }
  print()
  {
    print_mat(this.mat);
  }
  scale(s)
  {
    this.mat = this.mat.multiply(s);
    return this.mat;
  }
}

class NetNode{
  constructor( noise_gen = false){

    this.noise_gen = noise_gen || new GaussianGenerator(0,1);
    this.x = 0.0 ;
    this.bias = 0.0;
    this.curr_input = 0.0;

    let hist_len = 1100; //qualitative threshold in speed >=1200
    this.x_history = new SignalBuffer( hist_len );
    this.reset_history();
  }
  noise()
  {
    return this.noise_gen.gen_sample();
  }
  stim( input )
  {
    //may be called multiple times a timestep to accumulate stim.
    this.curr_input += input;
  }
  sim( input=0.0 )
  {
    this.stim( input );
    // for now, no autoregression
    // x = u + n, rather than x = Ax + u + n
    this.x = this.curr_input + this.noise() + this.bias; 
    this.curr_input = 0.0;
    this.record();
    return this.x;
  }
  reset( rand_noise = true )
  {
    this.x = 0;
    if ( ( this.noise_gen instanceof PerlinGenerator  ) && ( rand_noise ) )
    {
      this.noise_gen.rand_start();
    }
  }
  record() { this.x_history.cycle_in(this.x); }
  x_prev() { return this.x_history.last(); }
  reset_history() {  this.x_history.signal.fill(0.0) }
}

class Network{
  constructor( n_nodes = 3, w=1.0)
  {
    this.n_nodes = n_nodes;
    this.nodes = Array(n_nodes).fill().map( _=> new NetNode() ) ;
    this.weights = new CircuitMat( n_nodes , gen_chain);
    this.weights.scale(w);
    this.delays = new CircuitMat( n_nodes , (n)=>nj.ones([n,n]));
    this.reset_nodes();
  }
  get_state()
  {
    return this.nodes.map( n=>n.x );
  }

  apply_net_currents()
  {

    this.nodes.forEach( (n_src, i) => {
      //follows dyn. sys. convention
      let weight_row = index_mat(this.weights.mat, i, null);
      let delay_row = index_mat(this.delays.mat, i, null);
      //print_mat(weight_row)
      this.nodes.forEach( (n_target,j) => {
        let w = weight_row.get(0, j);
        let d = delay_row.get(0, j);
        //print(w)
        if (w != 0){
          let x_past = n_src.x_history.get_delayed(d)
          //print(`from ${i} to ${j}`);
          //print(x_past);
          n_target.stim( x_past*w ); 
        }
      });

    });
  }
  sim()
  {
    this.apply_net_currents();
    this.nodes.forEach( n => n.sim() );
    return this.get_state();
  }
  reset_nodes( rand_noise = true )
  {
    this.nodes.forEach( n => n.reset(rand_noise=true) );
  }
  node_output(idx)
  {
    return [...this.nodes[idx].x_history.signal];
  }
  plot_node(idx, numpts=null, x0=null, y0=null, xScale=null, yScale=null)
  {
    this.nodes[idx].x_history.plot(x0,y0,xScale,yScale, numpts);
  }
}


// helper functions


function print_mat(mat, print_len = 10)
{
  nj.config.printThreshold = print_len
  console.log(mat.toString())
}
function gen_diag(v, k=0)
{
  if (k==0) return nj.diag(v);

  let n = v.length + abs(k);// + k;
  let mat = nj.zeros([n,n]);
 
  if (k>0){
    v.forEach( (x,i)=> mat.set(i+k,i,x));
  }
  else{
    v.forEach( (x,i)=> mat.set(i,i-k,x));
  }
  print_mat(mat);
  return mat;
}

function gen_chain(n, val=1.0, offset=-1)
{
  //offset = -1 corresponds to dyn. convention
  return gen_diag( Array(n-abs(offset)).fill(val), offset);
}
function index_mat(mat, I, J)
{
  if ( I!=null && !Array.isArray(I) ){ I = [I,I+1]; };
  if ( J!=null && !Array.isArray(J) ){ J = [J,J+1]; };
  return mat.slice(I,J); 
}
function get_row(mat, i)
{
  return mat.slice([i,i+1], null)
}
function get_column(mat,j)
{
  return mat.slice(null, [j,j+1])
}
