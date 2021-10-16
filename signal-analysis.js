//note, nj.slice seems to leave selection.data intact... not sure if this is intended behavior...
class XcorrResults
{
  constructor()
  {
  }
}

function xcorr(x, y, mode='fxll', maxlag = 100)
{
  //only for 1D signals! 
  // numjs uses "valid" convention, this function figures out padding from there
  // ?? split result into two sections for segmented plotting, easy truncation
  
  let x_proc
  let xc;
  let pad_len = y.length-1;
  switch(mode)
  {
    case 'full':
      x_proc = nj.concatenate( [nj.zeros(pad_len), x, nj.zeros(pad_len) ] ); 
      xc = nj.convolve(x_proc, y.reverse());
      break;
    case 'same':
      let max_len = max( x.length, y.length );
      x_proc = nj.concatenate( [nj.zeros(pad_len), x, nj.zeros(pad_len) ] ); 
      xc = nj.convolve(x_proc, y.reverse());
      let len_diff = xc.shape[0] - max_len;
      let trim_left = floor( len_diff / 2);
      let trim_right = ceil(  len_diff / 2 );
      xc = xc.slice([trim_left, -trim_right]);
      break;
    default:
      xc = nj.convolve(x, y.reverse());
      break;
  }
  let xc_len = xc.shape[0];
  let mid_point = xc_len/2; //what to do if xc_len is even 
  return {'xcorr':xc, 'mid_point':mid_point}
}

function get_xcorr(i,j, normed=true){
  let xc = xcorr( test_circuit.node_output(i), test_circuit.node_output(j) ,mode='same');
  let xc_max = nj.max(nj.abs(xc.xcorr));
  //xc.xcorr = (normed ? maxnorm(xc.xcorr) : xc.xcorr);
  xc.xcorr = (normed ? rangenorm(xc.xcorr) : xc.xcorr);
  let xc_ary = xc.xcorr.tolist(); 
  return xc_ary;
}
function get_autocrosscorr(i,j, auto_idx = j, normtype='sub'){
  let xc = get_xcorr(i, j);
  let ac = get_xcorr(auto_idx, auto_idx);
  let xc_diff;

  switch(normtype)
  {
    case 'sub':
      xc_diff = nj.subtract( xc, ac).tolist();
      break;

    default:
      xc_diff = nj.divide( xc, ac).tolist();
      break;
  }
  return xc_diff;
}


// generic signal processing functions, mostly meant to augment numjs
// to have more of numpy's functionality

function ptp( x ){
  let nx = nj.array(x);
  return nj.max(x) - nj.min(x);
}
function rangenorm( x) {
  return nj.array(x).divide( ptp(x));
}
function maxnorm( x ) {
  return nj.array(x).divide(nj.max( nj.abs(x)) );
  //return nj.array(x).divide(nj.max( x) );
}function get_last(x, last_len)
{
  return nj.array(x).slice([-last_len-1,-1]).tolist()
}
function get_middle(x, mid_len)
{
  let cut_len = x.length - mid_len
  let pre_cut = floor(cut_len/2);
  let post_cut = ceil(cut_len/2);
  return nj.array(x).slice([pre_cut, -post_cut]).tolist()
}
