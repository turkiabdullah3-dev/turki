export const equations = [
  {
    id: 'eq-schwarzschild',
    latex: 'r_s = \\frac{2GM}{c^2}'
  },
  {
    id: 'eq-time-dilation',
    latex: '\\alpha(r) = \\sqrt{1 - \\frac{r_s}{r}}'
  },
  {
    id: 'eq-redshift',
    latex: '1 + z = \\frac{1}{\\sqrt{1 - \\frac{r_s}{r}}}'
  },
  {
    id: 'eq-photon',
    latex: 'r_{\\text{ph}} = \\frac{3GM}{c^2} = \\frac{3}{2}r_s'
  },
  {
    id: 'eq-tidal',
    latex: 'a_{\\text{tidal}} \\approx \\frac{2GML}{r^3}'
  },
  {
    id: 'eq-mt-metric',
    latex: 'ds^2 = -e^{2\\Phi(r)}c^2dt^2 + \\frac{dr^2}{1 - \\frac{b(r)}{r}} + r^2d\\Omega^2'
  },
  {
    id: 'eq-throat',
    latex: 'b(r_0) = r_0'
  },
  {
    id: 'eq-flare',
    latex: 'b\'(r_0) < 1'
  },
  {
    id: 'eq-nec',
    latex: '\\rho + p_r < 0'
  }
];
