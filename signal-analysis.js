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
