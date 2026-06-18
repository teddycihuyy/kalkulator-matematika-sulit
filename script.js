let chartInstance = null;

// ===== UTILITAS =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-box').forEach(b => b.classList.remove('show'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('show');
  });
});

function createInput(label, id, type = 'text', placeholder = '0') {
  return `
    <div class="input-group">
      <label>${label}</label>
      <input type="${type}" class="input-field" id="${id}" step="any" placeholder="${placeholder}">
    </div>
  `;
}

function createMatrixInput(prefix, size = 3) {
  let html = `<div class="matrix-label">Matriks ${prefix.toUpperCase()} (${size}x${size}):</div><div class="matrix-grid">`;
  for (let i = 0; i < size * size; i++) {
    html += `<input type="number" class="matrix-input" id="${prefix}${i}" value="0" step="any">`;
  }
  html += `</div>`;
  return html;
}

function showResult(type, value, steps) {
  const resultBox = document.getElementById(type + 'Result');
  resultBox.innerHTML = `
    <div class="result-label">Hasil:</div>
    <div class="result-value">${value}</div>
    <div class="result-steps">${steps}</div>
  `;
  resultBox.classList.add('show');
  document.getElementById(type + 'Error').classList.remove('show');
}

function showError(type, msg) {
  const errorBox = document.getElementById(type + 'Error');
  errorBox.textContent = msg;
  errorBox.classList.add('show');
  document.getElementById(type + 'Result').classList.remove('show');
}

// ===== KALKULUS =====
document.getElementById('kalkulusFormula').addEventListener('change', updateKalkulus);
function updateKalkulus() {
  const f = document.getElementById('kalkulusFormula').value;
  const c = document.getElementById('kalkulusInputs');
  const info = document.getElementById('kalkulusInfo');

  if (f === 'turunan') {
    info.textContent = "f'(x) = lim h→0 [f(x+h)-f(x)]/h";
    c.innerHTML = createInput('Fungsi f(x)', 'fungsi', 'text', 'x^3 + 2*x^2 - 5*x + 1') +
                  createInput('Nilai x', 'nilaiX', 'number', '2');
  } else if (f === 'integral_tentu') {
    info.textContent = "∫ₐᵇ f(x)dx = F(b) - F(a)";
    c.innerHTML = createInput('Fungsi f(x)', 'fungsi', 'text', 'x^2') +
                  createInput('Batas bawah (a)', 'batasA', 'number', '0') +
                  createInput('Batas atas (b)', 'batasB', 'number', '3');
  } else if (f === 'integral_tak') {
    info.textContent = "∫ f(x)dx = F(x) + C";
    c.innerHTML = createInput('Fungsi f(x)', 'fungsi', 'text', '3*x^2 + 2*x');
  } else if (f === 'limit') {
    info.textContent = "lim x→a f(x)";
    c.innerHTML = createInput('Fungsi f(x)', 'fungsi', 'text', '(x^2-1)/(x-1)') +
                  createInput('x mendekati (a)', 'nilaiA', 'number', '1');
  }
}

function calcKalkulus() {
  const f = document.getElementById('kalkulusFormula').value;
  try {
    if (f === 'turunan') {
      const fungsi = document.getElementById('fungsi').value;
      const x = parseFloat(document.getElementById('nilaiX').value);
      if (!fungsi || isNaN(x)) throw 'Input kosong';
      const derivative = math.derivative(fungsi, 'x');
      const hasil = derivative.evaluate({x: x});
      showResult('kalkulus', `f'(${x}) = ${hasil.toFixed(6)}`,
        `f(x) = ${fungsi}<br>f'(x) = <strong>${derivative.toString()}</strong><br>f'(${x}) = <strong>${hasil.toFixed(6)}</strong>`);
    } else if (f === 'integral_tentu') {
      const fungsi = document.getElementById('fungsi').value;
      const a = parseFloat(document.getElementById('batasA').value);
      const b = parseFloat(document.getElementById('batasB').value);
      if (!fungsi || isNaN(a) || isNaN(b)) throw 'Input kosong';
      const integral = math.integrate(fungsi, 'x');
      const Fa = integral.evaluate({x: a});
      const Fb = integral.evaluate({x: b});
      const hasil = Fb - Fa;
      showResult('kalkulus', `∫ₐᵇ = ${hasil.toFixed(6)}`,
        `f(x) = ${fungsi}<br>∫f(x)dx = <strong>${integral.toString()} + C</strong><br>F(${b}) - F(${a}) = ${Fb.toFixed(6)} - ${Fa.toFixed(6)} = <strong>${hasil.toFixed(6)}</strong>`);
    } else if (f === 'integral_tak') {
      const fungsi = document.getElementById('fungsi').value;
      if (!fungsi) throw 'Input kosong';
      const integral = math.integrate(fungsi, 'x').toString();
      showResult('kalkulus', `∫f(x)dx = ${integral} + C`,
        `f(x) = ${fungsi}<br><strong>∫f(x)dx = ${integral} + C</strong>`);
    } else if (f === 'limit') {
      const fungsi = document.getElementById('fungsi').value;
      const a = parseFloat(document.getElementById('nilaiA').value);
      if (!fungsi || isNaN(a)) throw 'Input kosong';
      // Coba substitusi langsung, kalau 0/0 pake L'Hopital
      try {
        const limit = math.evaluate(fungsi, {x: a});
        showResult('kalkulus', `lim x→${a} = ${limit.toFixed(6)}`,
          `f(x) = ${fungsi}<br>Substitusi x = ${a}<br><strong>lim = ${limit.toFixed(6)}</strong>`);
      } catch (e) {
        const f1 = math.derivative(fungsi.split('/')[0], 'x');
        const f2 = math.derivative(fungsi.split('/')[1], 'x');
        const limit = f1.evaluate({x: a}) / f2.evaluate({x: a});
        showResult('kalkulus', `lim x→${a} = ${limit.toFixed(6)}`,
          `Bentuk 0/0, gunakan L'Hopital<br>f'(x) = ${f1.toString()}<br>g'(x) = ${f2.toString()}<br><strong>lim = ${limit.toFixed(6)}</strong>`);
      }
    }
  } catch (e) {
    showError('kalkulus', 'Error: ' + e.message);
  }
}

// ===== ALJABAR =====
document.getElementById('aljabarFormula').addEventListener('change', updateAljabar);
function updateAljabar() {
  const f = document.getElementById('aljabarFormula').value;
  const c = document.getElementById('aljabarInputs');
  const info = document.getElementById('aljabarInfo');

  if (f === 'determinan') {
    info.textContent = "det(A) = a(ei-fh) - b(di-fg) + c(dh-eg)";
    c.innerHTML = createMatrixInput('m', 3);
  } else if (f === 'invers') {
    info.textContent = "A⁻¹ = (1/det(A)) × adj(A)";
    c.innerHTML = createMatrixInput('m', 3);
  } else if (f === 'spl') {
    info.textContent = "Aturan Cramer: x = Dx/D, y = Dy/D, z = Dz/D";
    c.innerHTML = `<div class="matrix-label">Ax + By + Cz = D:</div>
      ${createInput('Pers 1: A,B,C,D', 'p1', 'text', '2,3,1,9')}
      ${createInput('Pers 2: A,B,C,D', 'p2', 'text', '1,-1,2,8')}
      ${createInput('Pers 3: A,B,C,D', 'p3', 'text', '3,1,-1,3')}
      <small style="color:#9ca3af">Format: 2,3,1,9 untuk 2x+3y+z=9</small>`;
  } else if (f === 'perkalian') {
    info.textContent = "C[i,j] = Σ A[i,k] × B[k,j]";
    c.innerHTML = createMatrixInput('a', 3) + createMatrixInput('b', 3);
  }
}

function calcAljabar() {
  const f = document.getElementById('aljabarFormula').value;
  try {
    if (f === 'determinan') {
      const m = Array(9).fill(0).map((_,i) => parseFloat(document.getElementById(`m${i}`).value) || 0);
      const det = m[0]*(m[4]*m[8]-m[5]*m[7]) - m[1]*(m[3]*m[8]-m[5]*m[6]) + m[2]*(m[3]*m[7]-m[4]*m[6]);
      showResult('aljabar', `det(A) = ${det.toFixed(4)}`,
        `det(A) = ${m[0]}(${m[4]}×${m[8]}-${m[5]}×${m[7]}) - ${m[1]}(${m[3]}×${m[8]}-${m[5]}×${m[6]}) + ${m[2]}(${m[3]}×${m[7]}-${m[4]}×${m[6]})<br><strong>= ${det.toFixed(4)}</strong>`);
    } else if (f === 'invers') {
      const m = Array(9).fill(0).map((_,i) => parseFloat(document.getElementById(`m${i}`).value) || 0);
      const det = m[0]*(m[4]*m[8]-m[5]*m[7]) - m[1]*(m[3]*m[8]-m[5]*m[6]) + m[2]*(m[3]*m[7]-m[4]*m[6]);
      if (Math.abs(det) < 1e-10) throw 'Matriks singular, det = 0';
      const inv = [
        (m[4]*m[8]-m[5]*m[7])/det, (m[2]*m[7]-m[1]*m[8])/det, (m[1]*m[5]-m[2]*m[4])/det,
        (m[5]*m[6]-m[3]*m[8])/det, (m[0]*m[8]-m[2]*m[6])/det, (m[2]*m[3]-m[0]*m[5])/det,
        (m[3]*m[7]-m[4]*m[6])/det, (m[1]*m[6]-m[0]*m[7])/det, (m[0]*m[4]-m[1]*m[3])/det
      ];
      let tabel = '<table style="width:100%;text-align:center;border-collapse:collapse">';
      for(let i=0;i<3;i++){
        tabel += '<tr>';
        for(let j=0;j<3;j++) tabel += `<td style="border:1px solid #4338ca;padding:8px">${inv[i*3+j].toFixed(4)}</td>`;
        tabel += '</tr>';
      }
      tabel += '</table>';
      showResult('aljabar', `A⁻¹`, `det(A) = ${det.toFixed(4)}<br><strong>Invers A:</strong><br>${tabel}`);
    } else if (f === 'spl') {
      const parseRow = s => s.split(',').map(x => parseFloat(x.trim()));
      const r1 = parseRow(document.getElementById('p1').value);
      const r2 = parseRow(document.getElementById('p2').value);
      const r3 = parseRow(document.getElementById('p3').value);
      if (r1.length!==4 || r2.length!==4 || r3.length!==4) throw 'Format: a,b,c,d';
      const D = r1[0]*(r2[1]*r3[2]-r2[2]*r3[1]) - r1[1]*(r2[0]*r3[2]-r2[2]*r3[0]) + r1[2]*(r2[0]*r3[1]-r2[1]*r3[0]);
      if (Math.abs(D) < 1e-10) throw 'Sistem tidak punya solusi unik';
      const Dx = r1[3]*(r2[1]*r3[2]-r2[2]*r3[1]) - r1[1]*(r2[3]*r3[2]-r2[2]*r3[3]) + r1[2]*(r2[3]*r3[1]-r2[1]*r3[3]);
      const Dy = r1[0]*(r2[3]*r3[2]-r2[2]*r3[3]) - r1[3]*(r2[0]*r3[2]-r2[2]*r3[0]) + r1[2]*(r2[0]*r3[3]-r2[3]*r3[0]);
      const Dz = r1[0]*(r2[1]*r3[3]-r2[3]*r3[1]) - r1[1]*(r2[0]*r3[3]-r2[3]*r3[0]) + r1[3]*(r2[0]*r3[1]-r2[1]*r3[0]);
      const x = Dx/D, y = Dy/D, z = Dz/D;
      showResult('aljabar', `x=${x.toFixed(4)}, y=${y.toFixed(4)}, z=${z.toFixed(4)}`,
        `D=${D.toFixed(2)}, Dx=${Dx.toFixed(2)}, Dy=${Dy.toFixed(2)}, Dz=${Dz.toFixed(2)}<br><strong>x=${x.toFixed(4)}, y=${y.toFixed(4)}, z=${z.toFixed(4)}</strong>`);
    } else if (f === 'perkalian') {
      const a = Array(9).fill(0).map((_,i) => parseFloat(document.getElementById(`a${i}`).value) || 0);
      const b = Array(9).fill(0).map((_,i) => parseFloat(document.getElementById(`b${i}`).value) || 0);
      const c = Array(9).fill(0);
      for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
          for(let k=0;k<3;k++) c[i*3+j] += a[i*3+k] * b[k*3+j];
        }
      }
      let tabel = '<table style="width:100%;text-align:center;border-collapse:collapse">';
      for(let i=0;i<3;i++){
        tabel += '<tr>';
        for(let j=0;j<3;j++) tabel += `<td style="border:1px solid #4338ca;padding:8px">${c[i*3+j].toFixed(2)}</td>`;
        tabel += '</tr>';
      }
      tabel += '</table>';
      showResult('aljabar', `A × B`, `<strong>Hasil A × B:</strong><br>${tabel}`);
    }
  } catch (e) {
    showError('aljabar', e.message || e);
  }
}

// ===== STATISTIKA =====
document.getElementById('statistikaFormula').addEventListener('change', updateStatistika);
function updateStatistika() {
  const f = document.getElementById('statistikaFormula').value;
  const c = document.getElementById('statistikaInputs');
  const info = document.getElementById('statistikaInfo');

  if (f === 'deskriptif') {
    info.textContent = "μ = Σx/n, σ = √(Σ(x-μ)²/n)";
    c.innerHTML = createInput('Data (pisahkan koma)', 'data', 'text', '5,7,8,9,10,12,15') +
                  '<small style="color:#9ca3af">Contoh: 5,7,8,9,10,12</small>';
  } else if (f === 'regresi') {
    info.textContent = "y = ax + b, a = (nΣxy - ΣxΣy)/(nΣx² - (Σx)²)";
    c.innerHTML = createInput('Data X', 'dataX', 'text', '1,2,3,4,5') +
                  createInput('Data Y', 'dataY', 'text', '2,4,5,4,5');
  } else if (f === 'kombinasi') {
    info.textContent = "C(n,r) = n!/(r!(n-r)!)";
    c.innerHTML = createInput('n (total)', 'n', 'number', '10') +
                  createInput('r (diambil)', 'r', 'number', '3');
  } else if (f === 'permutasi') {
    info.textContent = "P(n,r) = n!/(n-r)!";
    c.innerHTML = createInput('n (total)', 'n', 'number', '10') +
                  createInput('r (diambil)', 'r', 'number', '3');
  }
}

function calcStatistika() {
  const f = document.getElementById('statistikaFormula').value;
  try {
    if (f === 'deskriptif') {
      const data = document.getElementById('data').value.split(',').map(x => parseFloat(x.trim())).filter(x =>!isNaN(x));
      if (data.length === 0) throw 'Data kosong';
      const n = data.length;
      const sum = data.reduce((a,b) => a+b, 0);
      const mean = sum / n;
      const sorted = [...data].sort((a,b) => a-b);
      const median = n%2? sorted[Math.floor(n/2)] : (sorted[n/2-1] + sorted[n/2])/2;
      const variance = data.reduce((a,b) => a + Math.pow(b-mean,2), 0) / n;
      const stdDev = Math.sqrt(variance);
      const mode = data.sort((a,b) => data.filter(v=>v===a).length - data.filter(v=>v===b).length).pop();
      showResult('statistika', `μ=${mean.toFixed(3)}, σ=${stdDev.toFixed(3)}`,
        `n=${n}, Σx=${sum}<br>Mean μ = <strong>${mean.toFixed(3)}</strong><br>Median = <strong>${median}</strong><br>Modus = <strong>${mode}</strong><br>Std Dev σ = <strong>${stdDev.toFixed(3)}</strong><br>Min=${Math.min(...data)}, Max=${Math.max(...data)}`);
    } else if (f === 'regresi') {
      const X = document.getElementById('dataX').value.split(',').map(x => parseFloat(x.trim()));
      const Y = document.getElementById('dataY').value.split(',').map(x => parseFloat(x.trim()));
      if (X.length!== Y.length || X.length < 2) throw 'Data X dan Y harus sama & minimal 2';
      const n = X.length;
      const sumX = X.reduce((a,b)=>a+b,0), sumY = Y.reduce((a,b)=>a+b,0);
      const sumXY = X.reduce((a,b,i)=>a+b*Y[i],0), sumX2 = X.reduce((a,b)=>a+b*b,0);
      const a = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
      const b = (sumY - a*sumX) / n;
      const r = (n*sumXY - sumX*sumY) / Math.sqrt((n*sumX2 - sumX*sumX) * (n*Y.reduce((a,b)=>a+b*b,0) - sumY*sumY));
      showResult('statistika', `y = ${a.toFixed(4)}x + ${b.toFixed(4)}`,
        `n=${n}, Σx=${sumX}, Σy=${sumY}, Σxy=${sumXY}, Σx²=${sumX2}<br><strong>y = ${a.toFixed(4)}x + ${b.toFixed(4)}</strong><br>Koef. Korelasi r = ${r.toFixed(4)}`);
    } else if (f === 'kombinasi' || f === 'permutasi') {
      const n = parseInt(document.getElementById('n').value);
      const r = parseInt(document.getElementById('r').value);
      if (isNaN(n) || isNaN(r) || r > n || n < 0 || r < 0) throw 'Input tidak valid';
      const fact = x => x<=1? 1 : x*fact(x-1);
      let hasil, rumus;
      if (f === 'kombinasi') {
        hasil = fact(n) / (fact(r) * fact(n-r));
        rumus = `C(n,r) = n!/(r!(n-r)!)`;
      } else {
        hasil = fact(n) / fact(n-r);
        rumus = `P(n,r) = n!/(n-r)!`;
      }
      showResult('statistika', `${f==='kombinasi'?'C':'P'}(${n},${r}) = ${hasil}`,
        `${rumus}<br><strong>${f==='kombinasi'?'C':'P'}(${n},${r}) = ${hasil}</strong>`);
    }
  } catch (e) {
    showError('statistika', e.message || e);
  }
}

// ===== TRIGONOMETRI =====
document.getElementById('trigonometriFormula').addEventListener('change', updateTrigonometri);
function updateTrigonometri() {
  const f = document.getElementById('trigonometriFormula').value;
  const c = document.getElementById('trigonometriInputs');
  const info = document.getElementById('trigonometriInfo');

  if (f === 'identitas') {
    info.textContent = "sin²θ + cos²θ = 1, tan θ = sin θ/cos θ";
    c.innerHTML = createInput('Identitas (contoh: sin(x)^2 + cos(x)^2)', 'identitas', 'text', 'sin(x)^2 + cos(x)^2');
  } else if (f === 'persamaan') {
    info.textContent = "Cari x: sin(x) = 0.5, 0° ≤ x ≤ 360°";
    c.innerHTML = createInput('Persamaan (contoh: 2*sin(x)=1)', 'persamaan', 'text', '2*sin(x)=1') +
                  createInput('Domain max (°)', 'domain', 'number', '360');
  } else if (f === 'segitiga') {
    info.textContent = "c² = a² + b² - 2ab·cos(C), Luas = ½ab·sin(C)";
    c.innerHTML = createInput('Sisi a', 'sisiA', 'number', '5') +
                  createInput('Sisi b', 'sisiB', 'number', '7') +
                  createInput('Sudut C (°)', 'sudutC', 'number', '60');
  } else if (f === 'invers') {
    info.textContent = "arcsin, arccos, arctan";
    c.innerHTML = createInput('Nilai (-1 sampai 1)', 'nilai', 'number', '0.5') +
                  `<select class="formula-select" id="invFunc" style="margin-top:10px">
                    <option value="asin">arcsin</option>
                    <option value="acos">arccos</option>
                    <option value="atan">arctan</option>
                  </select>`;
  }
}

function calcTrigonometri() {
  const f = document.getElementById('trigonometriFormula').value;
  try {
    if (f === 'identitas') {
      const id = document.getElementById('identitas').value;
      if (!id) throw 'Input kosong';
      const simplified = math.simplify(id).toString();
      const isIdentity = simplified === '1' || simplified === '0' || simplified.includes('sin') === false;
      showResult('trigonometri', simplified,
        `Input: ${id}<br>Disederhanakan: <strong>${simplified}</strong><br>${isIdentity? '✅ Identitas trigonometri' : 'Bukan identitas dasar'}`);
    } else if (f === 'persamaan') {
      const pers = document.getElementById('persamaan').value;
      const domain = parseFloat(document.getElementById('domain').value) || 360;
      if (!pers) throw 'Input kosong';
      // Parser sederhana untuk sin(x)=a, cos(x)=a, tan(x)=a
      let solusi = [];
      if (pers.includes('sin(x)')) {
        const val = parseFloat(pers.split('=')[1]);
        const sudut1 = Math.asin(val) * 180 / Math.PI;
        const sudut2 = 180 - sudut1;
        if (sudut1 >= 0 && sudut1 <= domain) solusi.push(sudut1.toFixed(2) + '°');
        if (sudut2 >= 0 && sudut2 <= domain && sudut2!== sudut1) solusi.push(sudut2.toFixed(2) + '°');
      } else if (pers.includes('cos(x)')) {
        const val = parseFloat(pers.split('=')[1]);
        const sudut = Math.acos(val) * 180 / Math.PI;
        if (sudut >= 0 && sudut <= domain) solusi.push(sudut.toFixed(2) + '°');
        if (360-sudut >= 0 && 360-sudut <= domain) solusi.push((360-sudut).toFixed(2) + '°');
      }
      showResult('trigonometri', `x = ${solusi.join(', ')}`,
        `Persamaan: ${pers}<br>Domain: 0°-${domain}°<br><strong>Solusi: ${solusi.join(', ')}</strong>`);
    } else if (f === 'segitiga') {
      const a = parseFloat(document.getElementById('sisiA').value);
      const b = parseFloat(document.getElementById('sisiB').value);
      const C = parseFloat(document.getElementById('sudutC').value) * Math.PI / 180;
      if (isNaN(a) || isNaN(b) || isNaN(C)) throw 'Input kosong';
      const c = Math.sqrt(a*a + b*b - 2*a*b*Math.cos(C));
      const luas = 0.5 * a * b * Math.sin(C);
      const A = Math.asin(a * Math.sin(C) / c) * 180 / Math.PI;
      const B = 180 - (C*180/Math.PI) - A;
      showResult('trigonometri', `c=${c.toFixed(3)}, Luas=${luas.toFixed(3)}`,
        `Aturan Cos: c² = a² + b² - 2ab·cos(C)<br>c² = ${a}² + ${b}² - 2×${a}×${b}×cos(${(C*180/Math.PI).toFixed(1)}°)<br><strong>c = ${c.toFixed(3)}</strong><br>Luas = ½ab·sin(C) = <strong>${luas.toFixed(3)}</strong><br>∠A=${A.toFixed(2)}°, ∠B=${B.toFixed(2)}°`);
    } else if (f === 'invers') {
      const val = parseFloat(document.getElementById('nilai').value);
      const func = document.getElementById('invFunc').value;
      if (isNaN(val) || (func!== 'atan' && (val < -1 || val > 1))) throw 'Nilai harus -1 sampai 1 untuk arcsin/arccos';
      let hasil, nama;
      if (func === 'asin') { hasil = Math.asin(val) * 180 / Math.PI; nama = 'arcsin'; }
      else if (func === 'acos') { hasil = Math.acos(val) * 180 / Math.PI; nama = 'arccos'; }
      else { hasil = Math.atan(val) * 180 / Math.PI; nama = 'arctan'; }
      showResult('trigonometri', `${nama}(${val}) = ${hasil.toFixed(4)}°`,
        `${nama}(${val}) = <strong>${hasil.toFixed(4)}°</strong> = ${(hasil*Math.PI/180).toFixed(4)} rad`);
    }
  } catch (e) {
    showError('trigonometri', e.message || e);
  }
}

// ===== KOMPLEKS =====
document.getElementById('kompleksFormula').addEventListener('change', updateKompleks);
function updateKompleks() {
  const f = document.getElementById('kompleksFormula').value;
  const c = document.getElementById('kompleksInputs');
  const info = document.getElementById('kompleksInfo');

  if (f === 'operasi') {
    info.textContent = "z₁ = a+bi, z₂ = c+di";
    c.innerHTML = createInput('z₁: a (real)', 'a1', 'number', '3') +
                  createInput('z₁: b (imag)', 'b1', 'number', '4') +
                  `<select class="formula-select" id="opKompleks">
                    <option value="+">Penjumlahan (+)</option>
                    <option value="-">Pengurangan (-)</option>
                    <option value="*">Perkalian (×)</option>
                    <option value="/">Pembagian (÷)</option>
                  </select>` +
                  createInput('z₂: c (real)', 'a2', 'number', '1') +
                  createInput('z₂: d (imag)', 'b2', 'number', '2');
  } else if (f === 'modulus') {
    info.textContent = "|z| = √(a²+b²), arg(z) = tan⁻¹(b/a)";
    c.innerHTML = createInput('a (real)', 'a', 'number', '3') +
                  createInput('b (imag)', 'b', 'number', '4');
  } else if (f === 'polar') {
    info.textContent = "z = r(cos θ + i·sin θ)";
    c.innerHTML = createInput('r (modulus)', 'r', 'number', '5') +
                  createInput('θ (derajat)', 'theta', 'number', '53.13');
  } else if (f === 'pangkat') {
    info.textContent = "zⁿ = rⁿ(cos nθ + i·sin nθ) - De Moivre";
    c.innerHTML = createInput('a (real)', 'a', 'number', '1') +
                  createInput('b (imag)', 'b', 'number', '1') +
                  createInput('Pangkat n', 'n', 'number', '3');
  }
}

function calcKompleks() {
  const f = document.getElementById('kompleksFormula').value;
  try {
    if (f === 'operasi') {
      const a1 = parseFloat(document.getElementById('a1').value) || 0;
      const b1 = parseFloat(document.getElementById('b1').value) || 0;
      const a2 = parseFloat(document.getElementById('a2').value) || 0;
      const b2 = parseFloat(document.getElementById('b2').value) || 0;
      const op = document.getElementById('opKompleks').value;
      const z1 = math.complex(a1, b1);
      const z2 = math.complex(a2, b2);
      let hasil, steps;
      
      if (op === '+') {
        hasil = math.add(z1, z2);
        steps = `(${a1}+${b1}i) + (${a2}+${b2}i)<br>= (${a1}+${a2}) + (${b1}+${b2})i<br><strong>= ${hasil.toString()}</strong>`;
      } else if (op === '-') {
        hasil = math.subtract(z1, z2);
        steps = `(${a1}+${b1}i) - (${a2}+${b2}i)<br>= (${a1}-${a2}) + (${b1}-${b2})i<br><strong>= ${hasil.toString()}</strong>`;
      } else if (op === '*') {
        hasil = math.multiply(z1, z2);
        steps = `(${a1}+${b1}i) × (${a2}+${b2}i)<br>= ${a1}×${a2} + ${a1}×${b2}i + ${b1}i×${a2} + ${b1}i×${b2}i<br>= ${a1*a2} + ${a1*b2}i + ${b1*a2}i - ${b1*b2}<br><strong>= ${hasil.toString()}</strong>`;
      } else {
        hasil = math.divide(z1, z2);
        const conj = math.complex(a2, -b2);
        const atas = math.multiply(z1, conj);
        const bawah = math.multiply(z2, conj);
        steps = `(${a1}+${b1}i) / (${a2}+${b2}i)<br>Kalikan sekawan: (${a2}-${b2}i)<br>= (${atas.toString()}) / (${bawah.toString()})<br><strong>= ${hasil.toString()}</strong>`;
      }
      showResult('kompleks', hasil.toString(), `z₁ = ${a1}+${b1}i<br>z₂ = ${a2}+${b2}i<br>${steps}`);
      
    } else if (f === 'modulus') {
      const a = parseFloat(document.getElementById('a').value) || 0;
      const b = parseFloat(document.getElementById('b').value) || 0;
      const z = math.complex(a, b);
      const mod = math.abs(z);
      const arg = math.arg(z) * 180 / Math.PI;
      const argRad = math.arg(z);
      showResult('kompleks', `|z|=${mod.toFixed(4)}, arg=${arg.toFixed(2)}°`,
        `z = ${a}+${b}i<br>|z| = √(${a}²+${b}²) = √(${a*a}+${b*b}) = <strong>${mod.toFixed(4)}</strong><br>arg(z) = tan⁻¹(${b}/${a}) = <strong>${arg.toFixed(2)}°</strong> = ${argRad.toFixed(4)} rad`);
      
    } else if (f === 'polar') {
      const r = parseFloat(document.getElementById('r').value);
      const theta = parseFloat(document.getElementById('theta').value) * Math.PI / 180;
      if (isNaN(r) || isNaN(theta)) throw 'Input kosong';
      const a = r * Math.cos(theta);
      const b = r * Math.sin(theta);
      showResult('kompleks', `${a.toFixed(4)} + ${b.toFixed(4)}i`,
        `Bentuk Polar: z = ${r}(cos ${(theta*180/Math.PI).toFixed(2)}° + i·sin ${(theta*180/Math.PI).toFixed(2)}°)<br>a = r·cos θ = ${r} × ${Math.cos(theta).toFixed(4)} = <strong>${a.toFixed(4)}</strong><br>b = r·sin θ = ${r} × ${Math.sin(theta).toFixed(4)} = <strong>${b.toFixed(4)}</strong><br><strong>Bentuk Kartesian: ${a.toFixed(4)} + ${b.toFixed(4)}i</strong>`);
      
    } else if (f === 'pangkat') {
      const a = parseFloat(document.getElementById('a').value) || 0;
      const b = parseFloat(document.getElementById('b').value) || 0;
      const n = parseFloat(document.getElementById('n').value);
      if (isNaN(n)) throw 'Input kosong';
      const z = math.complex(a, b);
      const hasil = math.pow(z, n);
      const r = math.abs(z);
      const theta = math.arg(z);
      const rN = Math.pow(r, n);
      const nTheta = n * theta * 180 / Math.PI;
      showResult('kompleks', `(${a}+${b}i)^${n} = ${hasil.toString()}`,
        `De Moivre: zⁿ = rⁿ(cos nθ + i·sin nθ)<br>r = |z| = ${r.toFixed(4)}, θ = ${ (theta*180/Math.PI).toFixed(2)}°<br>rⁿ = ${r.toFixed(4)}^${n} = ${rN.toFixed(4)}<br>nθ = ${n} × ${(theta*180/Math.PI).toFixed(2)}° = ${nTheta.toFixed(2)}°<br><strong>Hasil = ${hasil.toString()}</strong>`);
    }
  } catch (e) {
    showError('kompleks', e.message || e);
  }
}

// ===== GRAFIK =====
function plotGrafik() {
  try {
    const fungsi = document.getElementById('fungsiGrafik').value;
    const xMin = parseFloat(document.getElementById('xMin').value);
    const xMax = parseFloat(document.getElementById('xMax').value);
    const step = parseFloat(document.getElementById('xStep').value) || 0.1;
    
    if (!fungsi || isNaN(xMin) || isNaN(xMax)) throw 'Input tidak valid';
    if (xMin >= xMax) throw 'X Min harus < X Max';
    
    const expr = math.compile(fungsi);
    const labels = [];
    const data = [];
    const dataTurunan = [];
    const turunan = math.derivative(fungsi, 'x').compile();
    
    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = expr.evaluate({x: x});
        const yPrime = turunan.evaluate({x: x});
        if (isFinite(y)) {
          labels.push(x.toFixed(2));
          data.push(y);
          dataTurunan.push(yPrime);
        } else {
          labels.push(x.toFixed(2));
          data.push(null);
          dataTurunan.push(null);
        }
      } catch (e) {
        labels.push(x.toFixed(2));
        data.push(null);
        dataTurunan.push(null);
      }
    }
    
    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById('grafikCanvas').getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `f(x) = ${fungsi}`,
          data: data,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
          fill: true
        }, {
          label: `f'(x) = turunan`,
          data: dataTurunan,
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
          borderDash: [5, 5]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: { 
            labels: { color: '#a5b4fc', font: { size: 12 } },
            position: 'top'
          },
          tooltip: {
            backgroundColor: '#1e1b4b',
            titleColor: '#a5b4fc',
            bodyColor: '#e5e7eb',
            borderColor: '#4338ca',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y?.toFixed(4)}`;
              }
            }
          }
        },
        scales: {
          x: { 
            grid: { color: '#4338ca', drawOnChartArea: true },
            ticks: { color: '#a5b4fc', maxTicksLimit: 10 },
            title: { display: true, text: 'x', color: '#a5b4fc' }
          },
          y: { 
            grid: { color: '#4338ca' },
            ticks: { color: '#a5b4fc' },
            title: { display: true, text: 'y', color: '#a5b4fc' }
          }
        }
      }
    });
    document.getElementById('grafikError').classList.remove('show');
    document.getElementById('grafikResult').classList.remove('show');
  } catch (e) {
    showError('grafik', 'Error: ' + e.message + '. Cek sintaks fungsi. Contoh: x^2, sin(x), log(x), exp(x)');
  }
}

function cariAkar() {
  try {
    const fungsi = document.getElementById('fungsiGrafik').value;
    const xMin = parseFloat(document.getElementById('xMin').value);
    const xMax = parseFloat(document.getElementById('xMax').value);
    if (!fungsi) throw 'Masukkan fungsi dulu';
    
    const expr = math.compile(fungsi);
    const akar = [];
    const step = (xMax - xMin) / 1000;
    
    for (let x = xMin; x < xMax; x += step) {
      const y1 = expr.evaluate({x: x});
      const y2 = expr.evaluate({x: x + step});
      if (y1 * y2 < 0) { // tanda berubah = ada akar
        // Metode bisection untuk akurasi
        let a = x, b = x + step;
        for (let i = 0; i < 20; i++) {
          const mid = (a + b) / 2;
          const ym = expr.evaluate({x: mid});
          if (Math.abs(ym) < 1e-6) {
            akar.push(mid.toFixed(4));
            break;
          }
          if (expr.evaluate({x: a}) * ym < 0) b = mid;
          else a = mid;
        }
      }
    }
    
    const akarUnik = [...new Set(akar)];
    if (akarUnik.length === 0) {
      showResult('grafik', 'Tidak ada akar real', `f(x) = ${fungsi}<br>Tidak ditemukan titik potong dengan sumbu-x di range [${xMin}, ${xMax}]`);
    } else {
      showResult('grafik', `Akar: x = ${akarUnik.join(', ')}`, 
        `f(x) = ${fungsi}<br><strong>Titik potong sumbu-x:</strong><br>${akarUnik.map(x => `x = ${x}`).join('<br>')}`);
    }
  } catch (e) {
    showError('grafik', 'Error: ' + e.message);
  }
}

function cariEkstrem() {
  try {
    const fungsi = document.getElementById('fungsiGrafik').value;
    const xMin = parseFloat(document.getElementById('xMin').value);
    const xMax = parseFloat(document.getElementById('xMax').value);
    if (!fungsi) throw 'Masukkan fungsi dulu';
    
    const turunan = math.derivative(fungsi, 'x');
    const turunan2 = math.derivative(turunan, 'x');
    const exprTurunan = math.compile(turunan.toString());
    
    const ekstrem = [];
    const step = (xMax - xMin) / 1000;
    
    for (let x = xMin; x < xMax; x += step) {
      const y1 = exprTurunan.evaluate({x: x});
      const y2 = exprTurunan.evaluate({x: x + step});
      if (y1 * y2 < 0) { // f'(x) = 0
        let a = x, b = x + step;
        for (let i = 0; i < 20; i++) {
          const mid = (a + b) / 2;
          const ym = exprTurunan.evaluate({x: mid});
          if (Math.abs(ym) < 1e-6) {
            const y = math.evaluate(fungsi, {x: mid});
            const y2nd = turunan2.evaluate({x: mid});
            const jenis = y2nd > 0 ? 'Minimum' : y2nd < 0 ? 'Maksimum' : 'Titik Belok';
            ekstrem.push({x: mid.toFixed(4), y: y.toFixed(4), jenis: jenis});
            break;
          }
          if (exprTurunan.evaluate({x: a}) * ym < 0) b = mid;
          else a = mid;
        }
      }
    }
    
    if (ekstrem.length === 0) {
      showResult('grafik', 'Tidak ada titik ekstrem', `f(x) = ${fungsi}<br>f'(x) = ${turunan.toString()}<br>Tidak ditemukan f'(x) = 0 di range [${xMin}, ${xMax}]`);
    } else {
      let steps = `f(x) = ${fungsi}<br>f'(x) = ${turunan.toString()}<br>f''(x) = ${turunan2.toString()}<br><br><strong>Titik Ekstrem:</strong><br>`;
      ekstrem.forEach(e => {
        steps += `${e.jenis}: (${e.x}, ${e.y})<br>`;
      });
      showResult('grafik', `${ekstrem.length} titik ditemukan`, steps);
    }
  } catch (e) {
    showError('grafik', 'Error: ' + e.message);
  }
}

// INIT - panggil semua update
document.addEventListener('DOMContentLoaded', function() {
  updateKalkulus();
  updateAljabar();
  updateStatistika();
  updateTrigonometri();
  updateKompleks();
});

