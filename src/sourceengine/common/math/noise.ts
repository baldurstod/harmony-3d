import { AddSIMD, AndSIMD, MulSIMD, SubSIMD, Four_Zeros, Four_Twos, Four_PointFives } from '../../common/math/sse';
import { perm_a, perm_b, perm_c, impulse_xcoords } from './noisedata';

const NOISE_MAGIC_NUMBER = (1<<15);
const NOISE_MASK255 = (0xffff);


function GetLatticePointValue(idx_x, idx_y, idx_z) {
	let ret_idx = perm_a[idx_x & 0xff];
	ret_idx = perm_b[(idx_y + ret_idx) & 0xff];
	ret_idx = perm_c[(idx_z + ret_idx) & 0xff];
	return impulse_xcoords[ret_idx];

}

/**
 * TODO
 */
let arrayBuffer = new ArrayBuffer(4);
let uint32Array = new Uint32Array(arrayBuffer);
let float32Array = new Float32Array(arrayBuffer);

export function NoiseSIMD_old(pos, timeOffset) {
	const x = pos[0] + timeOffset;
	const y = pos[1] + timeOffset;
	const z = pos[2] + timeOffset;

	// use magic to convert to integer index
	float32Array[0] = AddSIMD(x, NOISE_MAGIC_NUMBER);
	const x_idx = NOISE_MASK255 & uint32Array[0];
	float32Array[0] = AddSIMD(y, NOISE_MAGIC_NUMBER);
	const y_idx = NOISE_MASK255 & uint32Array[0];
	float32Array[0] = AddSIMD(z, NOISE_MAGIC_NUMBER);
	const z_idx = NOISE_MASK255 & uint32Array[0];

	//fltx4 lattice000 = Four_Zeros, lattice001 = Four_Zeros, lattice010 = Four_Zeros, lattice011 = Four_Zeros;
	//fltx4 lattice100 = Four_Zeros, lattice101 = Four_Zeros, lattice110 = Four_Zeros, lattice111 = Four_Zeros;

	let lattice000 = 0, lattice001 = 0, lattice010 = 0, lattice011 = 0;
	let lattice100 = 0, lattice101 = 0, lattice110 = 0, lattice111 = 0;

	// FIXME: Converting the input vectors to int indices will cause load-hit-stores (48 bytes)
	//				Converting the indexed noise values back to vectors will cause more (128 bytes)
	//				The noise table could store vectors if we chunked it into 2x2x2 blocks.
	//fltx4 xfrac = Four_Zeros, yfrac = Four_Zeros, zfrac = Four_Zeros;
	let xfrac = 0, yfrac = 0, zfrac = 0;
/*#define DOPASS(i)														\
		{	unsigned int xi = SubInt(x_idx, i);							\
		unsigned int yi = SubInt(y_idx, i);								\
		unsigned int zi = SubInt(z_idx, i);								\
		SubFloat(xfrac, i) = (xi & 0xff)*(1.0/256.0);					\
		SubFloat(yfrac, i) = (yi & 0xff)*(1.0/256.0);					\
		SubFloat(zfrac, i) = (zi & 0xff)*(1.0/256.0);					\
		xi>>=8;															\
		yi>>=8;															\
		zi>>=8;															\
																		\
		SubFloat(lattice000, i) = GetLatticePointValue(xi,yi,zi);		\
		SubFloat(lattice001, i) = GetLatticePointValue(xi,yi,zi+1);		\
		SubFloat(lattice010, i) = GetLatticePointValue(xi,yi+1,zi);		\
		SubFloat(lattice011, i) = GetLatticePointValue(xi,yi+1,zi+1);	\
		SubFloat(lattice100, i) = GetLatticePointValue(xi+1,yi,zi);		\
		SubFloat(lattice101, i) = GetLatticePointValue(xi+1,yi,zi+1);	\
		SubFloat(lattice110, i) = GetLatticePointValue(xi+1,yi+1,zi);	\
		SubFloat(lattice111, i) = GetLatticePointValue(xi+1,yi+1,zi+1);	\
		}

	DOPASS(0);
	DOPASS(1);
	DOPASS(2);
	DOPASS(3);*/
	let xi = x_idx;
	let yi = y_idx;
	let zi = z_idx;
	xfrac = (xi & 0xff)*(1.0/256.0);
	yfrac = (yi & 0xff)*(1.0/256.0);
	zfrac = (zi & 0xff)*(1.0/256.0);
	xi>>=8;
	yi>>=8;
	zi>>=8;

	lattice000 = GetLatticePointValue(xi,yi,zi);
	lattice001 = GetLatticePointValue(xi,yi,zi+1);
	lattice010 = GetLatticePointValue(xi,yi+1,zi);
	lattice011 = GetLatticePointValue(xi,yi+1,zi+1);
	lattice100 = GetLatticePointValue(xi+1,yi,zi);
	lattice101 = GetLatticePointValue(xi+1,yi,zi+1);
	lattice110 = GetLatticePointValue(xi+1,yi+1,zi);
	lattice111 = GetLatticePointValue(xi+1,yi+1,zi+1);


	// now, we have 8 lattice values for each of four points as m128s, and interpolant values for
	// each axis in m128 form in [xyz]frac. Perfom the trilinear interpolation as SIMD ops

	// first, do x interpolation
	const l2d00 = AddSIMD(lattice000, MulSIMD(xfrac, SubSIMD(lattice100, lattice000)));
	const l2d01 = AddSIMD(lattice001, MulSIMD(xfrac, SubSIMD(lattice101, lattice001)));
	const l2d10 = AddSIMD(lattice010, MulSIMD(xfrac, SubSIMD(lattice110, lattice010)));
	const l2d11 = AddSIMD(lattice011, MulSIMD(xfrac, SubSIMD(lattice111, lattice011)));

	// now, do y interpolation
	const l1d0 = AddSIMD(l2d00, MulSIMD(yfrac, SubSIMD(l2d10, l2d00)));
	const l1d1 = AddSIMD(l2d01, MulSIMD(yfrac, SubSIMD(l2d11, l2d01)));

	// final z interpolation
	const rslt = AddSIMD(l1d0, MulSIMD(zfrac, SubSIMD(l1d1, l1d0)));

	// map to 0..1
	return MulSIMD(2.0, SubSIMD(rslt, 0.5));
}

const MAGIC_NUMBER = 1 << 15;
const Four_MagicNumbers = MAGIC_NUMBER;
const DATAVIEW = new DataView(new ArrayBuffer(4));
const INV_256 = 1 / 256.;
export function NoiseSIMD(x, y, z) {
	// use magic to convert to integer index
	/*fltx4 x_idx = AndSIMD( MASK255, AddSIMD( x, Four_MagicNumbers ) );
	fltx4 y_idx = AndSIMD( MASK255, AddSIMD( y, Four_MagicNumbers ) );
	fltx4 z_idx = AndSIMD( MASK255, AddSIMD( z, Four_MagicNumbers ) );*/
	DATAVIEW.setFloat32(0, AddSIMD(x, Four_MagicNumbers), true);
	const x_idx = DATAVIEW.getUint16(0, true);
	DATAVIEW.setFloat32(0, AddSIMD(y, Four_MagicNumbers), true);
	const y_idx = DATAVIEW.getUint16(0, true);
	DATAVIEW.setFloat32(0, AddSIMD(z, Four_MagicNumbers), true);
	const z_idx = DATAVIEW.getUint16(0, true);

	//console.log(x_idx, y_idx, z_idx);

	/*fltx4 lattice000 = Four_Zeros, lattice001 = Four_Zeros, lattice010 = Four_Zeros, lattice011 = Four_Zeros;
	fltx4 lattice100 = Four_Zeros, lattice101 = Four_Zeros, lattice110 = Four_Zeros, lattice111 = Four_Zeros;*/

	let lattice000 = Four_Zeros, lattice001 = Four_Zeros, lattice010 = Four_Zeros, lattice011 = Four_Zeros;
	let lattice100 = Four_Zeros, lattice101 = Four_Zeros, lattice110 = Four_Zeros, lattice111 = Four_Zeros;

	// FIXME: Converting the input vectors to int indices will cause load-hit-stores (48 bytes)
	//        Converting the indexed noise values back to vectors will cause more (128 bytes)
	//        The noise table could store vectors if we chunked it into 2x2x2 blocks.
	//fltx4 xfrac = Four_Zeros, yfrac = Four_Zeros, zfrac = Four_Zeros;
	let xfrac = Four_Zeros, yfrac = Four_Zeros, zfrac = Four_Zeros;
/*#define DOPASS(i)															\
    {	unsigned int xi = SubInt( x_idx, i );								\
		unsigned int yi = SubInt( y_idx, i );								\
		unsigned int zi = SubInt( z_idx, i );								\
		SubFloat( xfrac, i ) = (xi & 0xff)*(1.0/256.0);						\
		SubFloat( yfrac, i ) = (yi & 0xff)*(1.0/256.0);						\
		SubFloat( zfrac, i ) = (zi & 0xff)*(1.0/256.0);						\
		xi>>=8;																\
		yi>>=8;																\
		zi>>=8;																\
																			\
		SubFloat( lattice000, i ) = GetLatticePointValue( xi,yi,zi );		\
		SubFloat( lattice001, i ) = GetLatticePointValue( xi,yi,zi+1 );		\
		SubFloat( lattice010, i ) = GetLatticePointValue( xi,yi+1,zi );		\
		SubFloat( lattice011, i ) = GetLatticePointValue( xi,yi+1,zi+1 );	\
		SubFloat( lattice100, i ) = GetLatticePointValue( xi+1,yi,zi );		\
		SubFloat( lattice101, i ) = GetLatticePointValue( xi+1,yi,zi+1 );	\
		SubFloat( lattice110, i ) = GetLatticePointValue( xi+1,yi+1,zi );	\
		SubFloat( lattice111, i ) = GetLatticePointValue( xi+1,yi+1,zi+1 );	\
    }*/
	function DOPASS(i) {
		/*unsigned int xi = SubInt( x_idx, i );
		unsigned int yi = SubInt( y_idx, i );
		unsigned int zi = SubInt( z_idx, i );*/
		let xi = x_idx;
		let yi = y_idx;
		let zi = z_idx;
		/*SubFloat( xfrac, i ) = (xi & 0xff)*(1.0/256.0);
		SubFloat( yfrac, i ) = (yi & 0xff)*(1.0/256.0);
		SubFloat( zfrac, i ) = (zi & 0xff)*(1.0/256.0);*/
		xfrac = (xi & 0xff) * INV_256;
		yfrac = (yi & 0xff) * INV_256;
		zfrac = (zi & 0xff) * INV_256;

		xi>>=8;
		yi>>=8;
		zi>>=8;

		/*SubFloat( lattice000, i ) = GetLatticePointValue( xi,yi,zi );
		SubFloat( lattice001, i ) = GetLatticePointValue( xi,yi,zi+1 );
		SubFloat( lattice010, i ) = GetLatticePointValue( xi,yi+1,zi );
		SubFloat( lattice011, i ) = GetLatticePointValue( xi,yi+1,zi+1 );
		SubFloat( lattice100, i ) = GetLatticePointValue( xi+1,yi,zi );
		SubFloat( lattice101, i ) = GetLatticePointValue( xi+1,yi,zi+1 );
		SubFloat( lattice110, i ) = GetLatticePointValue( xi+1,yi+1,zi );
		SubFloat( lattice111, i ) = GetLatticePointValue( xi+1,yi+1,zi+1 );*/
		lattice000 = GetLatticePointValue(xi,yi,zi);
		lattice001 = GetLatticePointValue(xi,yi,zi+1);
		lattice010 = GetLatticePointValue(xi,yi+1,zi);
		lattice011 = GetLatticePointValue(xi,yi+1,zi+1);
		lattice100 = GetLatticePointValue(xi+1,yi,zi);
		lattice101 = GetLatticePointValue(xi+1,yi,zi+1);
		lattice110 = GetLatticePointValue(xi+1,yi+1,zi);
		lattice111 = GetLatticePointValue(xi+1,yi+1,zi+1);
	}

	DOPASS( 0 );
	/*DOPASS( 1 );
	DOPASS( 2 );
	DOPASS( 3 );*/

	// now, we have 8 lattice values for each of four points as m128s, and interpolant values for
	// each axis in m128 form in [xyz]frac. Perfom the trilinear interpolation as SIMD ops

	// first, do x interpolation
	/*fltx4 l2d00 = AddSIMD( lattice000, MulSIMD( xfrac, SubSIMD( lattice100, lattice000 ) ) );
	fltx4 l2d01 = AddSIMD( lattice001, MulSIMD( xfrac, SubSIMD( lattice101, lattice001 ) ) );
	fltx4 l2d10 = AddSIMD( lattice010, MulSIMD( xfrac, SubSIMD( lattice110, lattice010 ) ) );
	fltx4 l2d11 = AddSIMD( lattice011, MulSIMD( xfrac, SubSIMD( lattice111, lattice011 ) ) );*/
	const l2d00 = AddSIMD( lattice000, MulSIMD( xfrac, SubSIMD( lattice100, lattice000 ) ) );
	const l2d01 = AddSIMD( lattice001, MulSIMD( xfrac, SubSIMD( lattice101, lattice001 ) ) );
	const l2d10 = AddSIMD( lattice010, MulSIMD( xfrac, SubSIMD( lattice110, lattice010 ) ) );
	const l2d11 = AddSIMD( lattice011, MulSIMD( xfrac, SubSIMD( lattice111, lattice011 ) ) );

	// now, do y interpolation
	/*fltx4 l1d0 = AddSIMD( l2d00, MulSIMD( yfrac, SubSIMD( l2d10, l2d00 ) ) );
	fltx4 l1d1 = AddSIMD( l2d01, MulSIMD( yfrac, SubSIMD( l2d11, l2d01 ) ) );*/
	const l1d0 = AddSIMD( l2d00, MulSIMD( yfrac, SubSIMD( l2d10, l2d00 ) ) );
	const l1d1 = AddSIMD( l2d01, MulSIMD( yfrac, SubSIMD( l2d11, l2d01 ) ) );

	// final z interpolation
	//fltx4 rslt = AddSIMD( l1d0, MulSIMD( zfrac, SubSIMD( l1d1, l1d0 ) ) );
	const rslt = AddSIMD( l1d0, MulSIMD( zfrac, SubSIMD( l1d1, l1d0 ) ) );

	// map to 0..1
	return MulSIMD( Four_Twos, SubSIMD( rslt, Four_PointFives ) );
}
